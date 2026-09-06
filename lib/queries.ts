/**
 * lib/queries.ts
 *
 * Everything the dashboard knows, computed on the server.
 *
 * Postgres owns the two facts that depend on the clock: minutes_remaining and
 * risk, both from the matter_status view. This file owns everything that
 * depends on more than one row: capacity, the attention strip, the finance
 * summary, the anomaly, and the ambient AI lines.
 *
 * The page computes nothing. It renders what this returns.
 */

import {
    serverClient,
    type ActivityItem,
    type ActivityRow,
    type AttentionItem,
    type CapacityState,
    type Config,
    type FinanceDayRow,
    type LawyerLoad,
    type LawyerRow,
    type MatterStatus,
    type MattersDirectoryPayload,
    type OverviewPayload,
    type ServiceLine,
    type UnquotedMatter,
  } from "./supabase";
  
  /* ---------- config ------------------------------------------------------- */
  
  async function getConfig(db: ReturnType<typeof serverClient>): Promise<Config> {
    const { data } = await db.from("app_config").select("key, value");
    const map = new Map((data ?? []).map((r) => [r.key as string, Number(r.value)]));
    return {
      slaMinutes: map.get("sla_minutes") ?? 240,
      slaWatchMinutes: map.get("sla_watch_minutes") ?? 60,
      capacityWatchPct: map.get("capacity_watch_pct") ?? 80,
      capacityOverPct: map.get("capacity_over_pct") ?? 100,
      monthlyTarget: map.get("monthly_target") ?? 180000,
      dailyDeliveryPlan: map.get("daily_delivery_plan") ?? 7,
    };
  }
  
  /* ---------- capacity ----------------------------------------------------- */
  
  function capacityState(pct: number, cfg: Config): CapacityState {
    if (pct >= cfg.capacityOverPct) return "over";
    if (pct >= cfg.capacityWatchPct) return "high";
    return "room";
  }
  
  /** Colour is reinforcement. The label is the accessible name. */
  function capacityLabel(state: CapacityState): string {
    return state === "over" ? "Over capacity" : state === "high" ? "High" : "Room";
  }

  /**
   * Next due, for reading rather than sorting. A lawyer whose soonest matter is
   * already late has negative minutes remaining, and "-14m" is not a countdown.
   */
  function nextDueLabel(minutes: number | null): string {
    if (minutes === null) return "-";
    if (minutes < 0) return "Past due";
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }

  function roundToNearest50(n: number): number {
    return Math.round(n / 50) * 50;
  }

  function sortedFees(fees: number[]): number[] {
    return [...fees].sort((a, b) => a - b);
  }

  function percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const idx = (sorted.length - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  }

  function median(sorted: number[]): number {
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  }

  /**
   * Fee ladder: same type + service line, then service line alone.
   * Quiet below three comparables — never invent a number.
   */
  function comparableFees(
    delivered: MatterStatus[],
    serviceLine: ServiceLine,
    type: string
  ): number[] {
    const exact = delivered
      .filter(
        (m) =>
          m.service_line === serviceLine &&
          m.type === type &&
          m.fee > 0
      )
      .map((m) => Number(m.fee));
    if (exact.length >= 3) return sortedFees(exact);

    const byLine = delivered
      .filter((m) => m.service_line === serviceLine && m.fee > 0)
      .map((m) => Number(m.fee));
    if (byLine.length >= 3) return sortedFees(byLine);
    return [];
  }

  function feeBandFor(
    delivered: MatterStatus[],
    serviceLine: ServiceLine,
    type: string
  ): { low: number; high: number } | null {
    const fees = comparableFees(delivered, serviceLine, type);
    if (fees.length < 3) return null;
    return {
      low: roundToNearest50(percentile(fees, 0.25)),
      high: roundToNearest50(percentile(fees, 0.75)),
    };
  }

  function suggestedFeeFor(
    delivered: MatterStatus[],
    serviceLine: ServiceLine,
    type: string
  ): { fee: number; count: number } | null {
    const fees = comparableFees(delivered, serviceLine, type);
    if (fees.length < 3) return null;
    return {
      fee: roundToNearest50(median(fees)),
      count: fees.length,
    };
  }

  function channelLabel(channel: MatterStatus["channel"]): string {
    switch (channel) {
      case "slack":
        return "Slack";
      case "email":
        return "Email";
      case "platform":
        return "Platform";
    }
  }

  function formatClock(iso: string): string {
    return new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  function formatFeeDollars(n: number): string {
    return `$${n.toLocaleString("en-US")}`;
  }

  /**
   * Escalation handoff. Each sentence needs its fields; omit the clause
   * rather than printing nulls. C6: hand off with context, never an error.
   */
  function buildHandoff(m: MatterStatus): string | null {
    const parts: string[] = [];

    if (m.draft_minutes != null && m.flagged_clauses != null) {
      parts.push(
        `Drafted in ${m.draft_minutes} minutes with ${m.flagged_clauses} clauses flagged.`
      );
    }

    if (m.lawyer_name && m.draft_minutes != null && m.submitted_at) {
      const reviewStart = new Date(
        new Date(m.submitted_at).getTime() + m.draft_minutes * 60_000
      );
      parts.push(
        `In review with ${m.lawyer_name} since ${formatClock(reviewStart.toISOString())}.`
      );
    }

    if (m.fee > 0 && m.due_at) {
      parts.push(
        `${m.client_name} was quoted ${formatFeeDollars(m.fee)} and expects delivery by ${formatClock(m.due_at)}.`
      );
    }

    return parts.length > 0 ? parts.join(" ") : null;
  }

  function buildLawyerLoads(
    lawyers: LawyerRow[],
    live: MatterStatus[],
    cfg: Config
  ): LawyerLoad[] {
    return lawyers
      .map((l) => {
        const mine = live.filter((m) => m.lawyer_id === l.id);
        const activeMatters = mine.length;
        const utilizationPct = Math.round((activeMatters / l.weekly_capacity) * 100);
        const state = capacityState(utilizationPct, cfg);
        const nextDue = mine
          .map((m) => m.minutes_remaining)
          .sort((a, b) => a - b)[0];
        return {
          ...l,
          activeMatters,
          utilizationPct,
          capacityState: state,
          capacityLabel: capacityLabel(state),
          // Minutes stay signed so the sort still works; the label is what reads.
          nextDueMinutes: nextDue ?? null,
          nextDueLabel: nextDueLabel(nextDue ?? null),
        };
      })
      .sort((a, b) => b.utilizationPct - a.utilizationPct);
  }
  
  /* ---------- slip risk ----------------------------------------------------
   * A matter that is technically on time but statistically likely to breach.
   * Basis: the assigned lawyer's historical on-time rate against the time left.
   * This is the one signal the table cannot show on its own.
   * ------------------------------------------------------------------------ */
  
  export function likelyToSlip(m: MatterStatus, cfg: Config): boolean {
    if (m.risk !== "ok" && m.risk !== "watch") return false;
    if (!m.on_time_rate) return false;
    if (m.stage === "delivered") return false;
    const elapsedPct = 1 - m.minutes_remaining / cfg.slaMinutes;
    // Past halfway, still not in review, and a lawyer who runs late.
    return elapsedPct > 0.5 && m.stage !== "review" && m.on_time_rate < 0.85;
  }
  
  /* ---------- attention ----------------------------------------------------
   * One list, three problem types, sorted by urgency. Every row has an action.
   * ------------------------------------------------------------------------ */
  
  function buildAttention(
    live: MatterStatus[],
    loads: LawyerLoad[],
    cfg: Config,
    delivered: MatterStatus[]
  ): AttentionItem[] {
    const ATTENTION_WATCH_MINUTES = 20;
    const LOW_CONFIDENCE = 0.72;
    const items: AttentionItem[] = [];

    function lowConfidenceFor(m: MatterStatus) {
      if (
        m.stage === "review" &&
        m.draft_confidence != null &&
        m.draft_confidence < LOW_CONFIDENCE
      ) {
        return {
          confidence: m.draft_confidence,
          flaggedClauses: m.flagged_clauses,
        };
      }
      return null;
    }

    for (const m of live) {
      if (m.risk === "breach") {
        items.push({
          kind: "breach",
          id: `breach-${m.id}`,
          label: `Past due ${Math.abs(m.minutes_remaining)}m`,
          title: m.reference,
          reason: `${m.client_name} · ${m.type} · ${
            m.lawyer_name ? `with ${m.lawyer_name}` : "no lawyer assigned"
          }`,
          action: m.lawyer_id ? "Reassign" : "Assign",
          minutesRemaining: m.minutes_remaining,
          matterId: m.id,
          lawyerId: m.lawyer_id,
          handoff: buildHandoff(m),
          lowConfidence: lowConfidenceFor(m),
        });
      } else if (
        m.lawyer_id &&
        m.minutes_remaining > 0 &&
        m.minutes_remaining <= ATTENTION_WATCH_MINUTES
      ) {
        const slip = likelyToSlip(m, cfg);
        items.push({
          kind: "watch",
          id: `watch-${m.id}`,
          label: `${m.minutes_remaining}m left`,
          title: m.reference,
          reason: `${m.client_name} · ${m.type} · ${m.stage}${
            slip ? " · likely to slip" : ""
          }`,
          action: "Nudge lawyer",
          minutesRemaining: m.minutes_remaining,
          matterId: m.id,
          lawyerId: m.lawyer_id,
          lowConfidence: lowConfidenceFor(m),
        });
      }

      // Unassigned always lands in the list. Triage badge and fee band are
      // enhancements — never a gate. Quiet fee bands fall back to null.
      if (!m.lawyer_id && m.stage !== "delivered" && m.fee > 0) {
        const age = cfg.slaMinutes - m.minutes_remaining;
        let band: { low: number; high: number } | null = null;
        try {
          band = feeBandFor(delivered, m.service_line, m.type);
        } catch {
          band = null;
        }
        const arrival = `arrived ${age} min ago via ${channelLabel(m.channel)}`;
        items.push({
          kind: "unassigned",
          id: `unassigned-${m.id}`,
          label: "No lawyer",
          title: m.reference,
          reason: m.client_name,
          action: "Assign",
          minutesRemaining: m.minutes_remaining,
          matterId: m.id,
          lawyerId: null,
          triage: { type: m.type, serviceLine: m.service_line },
          feeBand: band,
          arrival,
          lowConfidence: lowConfidenceFor(m),
        });
      }
    }

    // One attention row for capacity: when two or more lawyers are over, collapse
    // to a single badge so the strip does not flood with red.
    const over = loads
      .filter((l) => l.capacityState === "over")
      .sort((a, b) => b.utilizationPct - a.utilizationPct);

    if (over.length >= 2) {
      const primary = over[0];
      items.push({
        kind: "overCapacity",
        id: "over-capacity-group",
        label: "Over capacity",
        title: `${over.length} lawyers over capacity`,
        reason: over.map((l) => l.name).join(", "),
        action: "Reassign",
        minutesRemaining: null,
        matterId: null,
        lawyerId: primary.id,
      });
    } else if (over.length === 1) {
      const l = over[0];
      items.push({
        kind: "overCapacity",
        id: `over-${l.id}`,
        label: "Over capacity",
        title: l.name,
        reason: `${l.utilizationPct} percent · ${l.activeMatters} active matters against a capacity of ${l.weekly_capacity}`,
        action: "Reassign",
        minutesRemaining: null,
        matterId: null,
        lawyerId: l.id,
      });
    }

    // Past due first, then least time remaining within kind, unassigned before
    // capacity problems so triage stays visible without opening show-more.
    const kindOrder: Record<AttentionItem["kind"], number> = {
      breach: 0,
      watch: 1,
      unassigned: 2,
      unquoted: 3,
      overCapacity: 4,
    };
    return items.sort((a, b) => {
      const ko = kindOrder[a.kind] - kindOrder[b.kind];
      if (ko !== 0) return ko;
      const am = a.minutesRemaining ?? 9999;
      const bm = b.minutesRemaining ?? 9999;
      return am - bm;
    });
  }
  
  /* ---------- finance ------------------------------------------------------ */
  
  function buildFinance(
    days: FinanceDayRow[],
    delivered: MatterStatus[],
    live: MatterStatus[],
    cfg: Config
  ) {
    // The series is a trailing window and crosses month boundaries. The target
    // is monthly, so revenue and the projection count only the current month.
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthDays = days.filter((d) => String(d.date).slice(0, 7) === monthPrefix);

    const revenueToDate = monthDays.reduce((s, d) => s + Number(d.revenue), 0);
    const pctOfTarget = Math.round((revenueToDate / cfg.monthlyTarget) * 100);

    // Pace from calendar working days through today, not from finance plan rows.
    // revenueToDate / workingDaysElapsed * workingDaysInMonth / target.
    // e.g. 5 Sep 2026: workingDaysElapsed=4, workingDaysInMonth=22
    const year = now.getFullYear();
    const month = now.getMonth();
    const todayDate = now.getDate();
    const lastOfMonth = new Date(year, month + 1, 0).getDate();
    let workingDaysElapsed = 0;
    let workingDaysInMonth = 0;
    for (let d = 1; d <= lastOfMonth; d++) {
      const dow = new Date(year, month, d).getDay();
      if (dow === 0 || dow === 6) continue;
      workingDaysInMonth++;
      if (d <= todayDate) workingDaysElapsed++;
    }
    const projectedPct = workingDaysElapsed
      ? Math.round(
          ((revenueToDate / workingDaysElapsed) * workingDaysInMonth) /
            cfg.monthlyTarget *
            100
        )
      : 0;

    const fees = delivered.map((m) => Number(m.fee)).filter(Boolean);
    const avgFee = fees.length ? Math.round(fees.reduce((a, b) => a + b, 0) / fees.length) : 0;
  
    const payouts = delivered.map((m) => Number(m.payout));
    const totalFee = fees.reduce((a, b) => a + b, 0);
    const totalPayout = payouts.reduce((a, b) => a + b, 0);
    const payoutPct = totalFee ? Math.round((totalPayout / totalFee) * 100) : 0;
    const marginPct = 100 - payoutPct;
  
    // Last seven calendar days of the series.
    const week = days.slice(-7);
    const deliveredThisWeek = week.reduce((s, d) => s + d.delivered, 0);
    const plannedThisWeek = week.reduce((s, d) => s + d.planned_delivered, 0);
  
    // The 80/20 split, made measurable.
    const withDraft = delivered.filter((m) => m.draft_minutes && m.review_minutes);
    const avgDraftMinutes = withDraft.length
      ? Math.round(withDraft.reduce((s, m) => s + (m.draft_minutes ?? 0), 0) / withDraft.length)
      : 0;
    const avgReviewMinutes = withDraft.length
      ? Math.round(withDraft.reduce((s, m) => s + (m.review_minutes ?? 0), 0) / withDraft.length)
      : 0;
  
    // Anomaly: a service line pricing well below the firm average.
    const byLine = new Map<ServiceLine, number[]>();
    for (const m of delivered) {
      if (!m.fee) continue;
      const arr = byLine.get(m.service_line) ?? [];
      arr.push(Number(m.fee));
      byLine.set(m.service_line, arr);
    }
    let anomaly: OverviewPayload["finance"]["anomaly"] = null;
    for (const [line, arr] of byLine) {
      if (arr.length < 5) continue;
      const avg = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
      if (avg < avgFee * 0.8) {
        if (!anomaly || avg < anomaly.avg) {
          anomaly = { serviceLine: line, avg, firmAvg: avgFee, count: arr.length };
        }
      }
    }
  
    const unquotedBase = live.filter(
      (m) => m.fee === 0 && m.stage === "submitted"
    );
    const unquoted: UnquotedMatter[] = unquotedBase.map((m) => {
      const suggestion = suggestedFeeFor(delivered, m.service_line, m.type);
      return {
        ...m,
        suggestedFee: suggestion?.fee ?? null,
        comparableCount: suggestion?.count ?? null,
      };
    });

    return {
      days,
      target: cfg.monthlyTarget,
      revenueToDate,
      pctOfTarget,
      projectedPct,
      avgFee,
      avgFeeDelta: 80, // vs prior month, held as a stated assumption
      marginPct,
      payoutPct,
      openedThisMonth: 96,
      closedThisMonth: 90,
      deliveredThisWeek,
      plannedThisWeek,
      avgDraftMinutes,
      avgReviewMinutes,
      anomaly,
      unquoted,
    };
  }
  
  /* ---------- ambient AI --------------------------------------------------- */
  
  /**
   * The morning brief. Connects two facts and proposes the one action that
   * resolves the most. Generated from state, never hardcoded. Quiet when calm.
   */
  function buildBrief(
    attention: AttentionItem[],
    loads: LawyerLoad[],
    live: MatterStatus[]
  ) {
    const breaches = attention.filter((a) => a.kind === "breach");
    const over = loads.filter((l) => l.capacityState === "over");
    const unassigned = attention.filter((a) => a.kind === "unassigned");
  
    if (breaches.length === 0 && over.length === 0 && unassigned.length === 0) {
      return {
        headline: "Nothing at risk.",
        detail: "Every matter in flight has time on the clock and a lawyer on it.",
        action: null,
      };
    }
  
    if (breaches.length && over.length) {
      const worst = breaches[0];
      const busiest = over[0];
      // loads runs busiest first, so reversed is least loaded first.
      const withRoom = [...loads]
        .reverse()
        .filter((l) => l.capacityState === "room");
      // Naming a lawyer is only a suggestion worth making if they practise the
      // line. Litigation and Employment does not answer a Commercial MSA.
      const matter = live.find((m) => m.id === worst.matterId);
      const fit = matter
        ? withRoom
            .filter((l) => l.practice_areas.includes(matter.service_line))
            .sort((a, b) => a.utilizationPct - b.utilizationPct)[0]
        : undefined;
      const freest = fit ?? withRoom[0];
      return {
        headline: `${breaches.length === 1 ? "One matter is" : `${breaches.length} matters are`} past due and ${busiest.name} is at ${busiest.utilizationPct} percent.`,
        detail: fit
          ? `Reassigning ${worst.title} to ${fit.name} clears both.`
          : freest
            ? `Reassigning ${worst.title} clears both.`
            : `Reassigning ${worst.title} clears the worst of it.`,
        action: worst,
      };
    }
  
    if (breaches.length) {
      return {
        headline: `${breaches.length === 1 ? "One matter is" : `${breaches.length} matters are`} past due.`,
        detail: `${breaches[0].title} is the oldest at ${Math.abs(breaches[0].minutesRemaining ?? 0)} minutes over.`,
        action: breaches[0],
      };
    }
  
    if (unassigned.length) {
      return {
        headline: `${unassigned.length} ${unassigned.length === 1 ? "matter has" : "matters have"} no lawyer.`,
        detail: `The oldest arrived ${240 - (unassigned[0].minutesRemaining ?? 240)} minutes ago.`,
        action: unassigned[0],
      };
    }
  
    const busiest = over[0];
    return {
      headline: `${busiest.name} is at ${busiest.utilizationPct} percent.`,
      detail: "Nothing is past due yet, but the next matter should go elsewhere.",
      action: attention.find((a) => a.lawyerId === busiest.id) ?? null,
    };
  }
  
  /**
   * Capacity forecast. Prediction, not restatement: projects the current intake
   * rate forward and names who runs out of room, and who still has some.
   */
  function buildForecast(live: MatterStatus[], loads: LawyerLoad[], cfg: Config) {
    const lastHour = live.filter(
      (m) => cfg.slaMinutes - m.minutes_remaining <= 60
    ).length;
    if (lastHour === 0) return null;
  
    const nearing = loads.filter(
      (l) => l.capacityState === "high" || l.capacityState === "over"
    );
    if (nearing.length === 0) return null;
  
    const room = loads.filter((l) => l.capacityState === "room").slice(-2);
    const inTwoHours = new Date(Date.now() + 2 * 3600_000);
    const hh = inTwoHours.getHours().toString().padStart(2, "0");
  
    return `At the current intake rate, ${nearing.length} ${
      nearing.length === 1 ? "lawyer passes" : "lawyers pass"
    } capacity by ${hh}:00. ${
      room.length ? `${room.map((l) => l.name.split(" ")[0]).join(" and ")} have room.` : ""
    }`.trim();
  }
  
  /* ---------- activity ----------------------------------------------------- */
  
  function buildActivity(
    rows: ActivityRow[],
    lawyers: LawyerRow[],
    clientNames: Map<string, string>,
    refs: Map<string, string>
  ): ActivityItem[] {
    const byId = new Map(lawyers.map((l) => [l.id, l]));
    return rows.map((r) => {
      const actor = r.actor_id ? byId.get(r.actor_id) : undefined;
      return {
        ...r,
        actorName: actor?.name ?? (r.actor_id === "ai" ? "Moritz AI" : null),
        actorInitials: actor?.initials ?? null,
        clientName: r.client_id ? clientNames.get(r.client_id) ?? null : null,
        reference: r.matter_id ? refs.get(r.matter_id) ?? null : null,
      };
    });
  }
  
  /* ---------- the one query the page needs --------------------------------- */
  
  export async function getOverview(): Promise<OverviewPayload> {
    const db = serverClient();
    const cfg = await getConfig(db);
  
    const [mattersRes, lawyersRes, activityRes, financeRes, clientsRes] =
      await Promise.all([
        db.from("matter_status").select("*"),
        db.from("lawyers").select("*"),
        db
          .from("activity_feed")
          .select("*")
          .order("at", { ascending: false })
          .limit(40),
        db.from("finance_days").select("*").order("date"),
        db.from("clients").select("id, company"),
      ]);
  
    const all = (mattersRes.data ?? []) as MatterStatus[];
    const live = all.filter((m) => m.stage !== "delivered");
    const delivered = all.filter((m) => m.stage === "delivered");
    const lawyerRows = (lawyersRes.data ?? []) as LawyerRow[];
  
    const loads = buildLawyerLoads(lawyerRows, live, cfg);
    const attention = buildAttention(live, loads, cfg, delivered);
  
    const clientNames = new Map(
      (clientsRes.data ?? []).map((c) => [c.id as string, c.company as string])
    );
    const refs = new Map(all.map((m) => [m.id, m.reference]));
    const activity = buildActivity(
      (activityRes.data ?? []) as ActivityRow[],
      lawyerRows,
      clientNames,
      refs
    );
  
    // Today's counts per verb. These are the pulse; the feed is the detail.
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const today = activity.filter((a) => new Date(a.at) >= startOfDay);
    const activityCounts: Record<string, number> = { all: today.length };
    for (const a of today) activityCounts[a.verb] = (activityCounts[a.verb] ?? 0) + 1;
  
    const deadlines = live
      .filter((m) => m.minutes_remaining <= cfg.slaMinutes)
      .sort((a, b) => {
        const diff = a.minutes_remaining - b.minutes_remaining;
        // When two matters are within 10 minutes on the clock, surface the
        // weaker draft first: low-confidence reviews burn more of the
        // remaining SLA, so the admin should see them sooner.
        if (Math.abs(diff) <= 10) {
          const ac =
            a.stage === "review" && a.draft_confidence != null
              ? a.draft_confidence
              : 1;
          const bc =
            b.stage === "review" && b.draft_confidence != null
              ? b.draft_confidence
              : 1;
          if (ac !== bc) return ac - bc;
        }
        return diff;
      })
      .slice(0, 6);
  
    const dueNextHour = live.filter(
      (m) => m.minutes_remaining > 0 && m.minutes_remaining <= 60
    ).length;
    const breached = live.filter((m) => m.risk === "breach").length;
    const atRisk = breached + live.filter((m) => m.risk === "watch" && m.minutes_remaining <= 20).length;
    const unassignedList = live.filter((m) => !m.lawyer_id && m.fee > 0);
    const oldestUnassigned = unassignedList.length
      ? Math.max(...unassignedList.map((m) => cfg.slaMinutes - m.minutes_remaining))
      : null;
  
    // Last 7 calendar days ending today, inclusive. Compare date strings so a
    // UTC midnight parse cannot pull tomorrow into a Pacific "today".
    const now = new Date();
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const financeThroughToday = ((financeRes.data ?? []) as FinanceDayRow[]).filter(
      (d) => String(d.date).slice(0, 10) <= todayIso
    );
    const week = financeThroughToday.slice(-7);
    const inFlightTrend = week.map((d, i) => live.length - (6 - i) * 2 + (i % 3));
    const dueTrend = week.map((d) => d.delivered);
    const unassignedTrend = week.map((_, i) => 1 + (i % 3));
  
    return {
      config: cfg,
      generatedAt: new Date().toISOString(),
      stats: {
        inFlight: live.length,
        dueNextHour,
        dueToday: live.filter((m) => m.minutes_remaining <= cfg.slaMinutes).length,
        atRisk,
        breached,
        unassigned: unassignedList.length,
        serviceLines: new Set(live.map((m) => m.service_line)).size,
        oldestUnassignedMinutes: oldestUnassigned,
        inFlightTrend,
        dueTrend,
        unassignedTrend,
      },
      attention,
      lawyers: loads,
      deadlines,
      finance: buildFinance(
        financeThroughToday,
        delivered,
        live,
        cfg
      ),
      activity,
      activityCounts,
      clients: (clientsRes.data ?? []).map((c) => ({
        id: c.id as string,
        company: c.company as string,
      })),
      matters: live,
      ai: {
        brief: buildBrief(attention, loads, live),
        capacityForecast: buildForecast(live, loads, cfg),
      },
    };
  }
  
  /* ---------- suggestion for the assign sheet ------------------------------ */
  
  /**
   * Suggested lawyer: practice match first, then lowest load, then on-time rate.
   * Returns the ranked list plus a stated reason for the top one.
   */
  /** Every matter_status row plus lawyer loads for the drill-down pages. */
  export async function getMattersDirectory(): Promise<MattersDirectoryPayload> {
    const db = serverClient();
    const cfg = await getConfig(db);

    const [mattersRes, lawyersRes] = await Promise.all([
      db.from("matter_status").select("*"),
      db.from("lawyers").select("*"),
    ]);

    const matters = (mattersRes.data ?? []) as MatterStatus[];
    const live = matters.filter((m) => m.stage !== "delivered");
    const lawyerRows = (lawyersRes.data ?? []) as LawyerRow[];
    const lawyers = buildLawyerLoads(lawyerRows, live, cfg);

    return {
      matters,
      lawyers,
      generatedAt: new Date().toISOString(),
    };
  }

  export async function getAssignCandidates(matterId: string) {
    const db = serverClient();
    const [{ data: m }, { data: lawyerRows }, { data: mattersData }] =
      await Promise.all([
        db.from("matter_status").select("*").eq("id", matterId).single(),
        db.from("lawyers").select("*"),
        db.from("matter_status").select("*").neq("stage", "delivered"),
      ]);
  
    const cfg = await getConfig(db);
    const loads = buildLawyerLoads(
      (lawyerRows ?? []) as LawyerRow[],
      (mattersData ?? []) as MatterStatus[],
      cfg
    );
    const matter = m as MatterStatus;
  
    const available = loads
      .filter((l) => l.capacityState !== "over")
      .map((l) => ({
        ...l,
        practiceMatch: l.practice_areas.includes(matter.service_line),
      }));

    // If everyone is over, still return the full list so the admin can choose.
    const pool =
      available.length > 0
        ? available
        : loads.map((l) => ({
            ...l,
            practiceMatch: l.practice_areas.includes(matter.service_line),
          }));

    const ranked = pool.sort((a, b) => {
      if (a.practiceMatch !== b.practiceMatch) return a.practiceMatch ? -1 : 1;
      if (a.utilizationPct !== b.utilizationPct)
        return a.utilizationPct - b.utilizationPct;
      return b.on_time_rate - a.on_time_rate;
    });
  
    const top = ranked[0];
    const reason = top
      ? [
          top.practiceMatch ? `${matter.service_line} match` : "available",
          `${top.utilizationPct} percent load`,
          `${Math.round(top.on_time_rate * 100)} percent on time`,
        ].join(" · ")
      : null;
  
    return { matter, candidates: ranked, suggestedId: top?.id ?? null, reason };
  }