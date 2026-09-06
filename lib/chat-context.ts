import type { OverviewPayload } from "@/lib/supabase";

/**
 * Compact factual summary for the ask route. Terse labelled lines, not JSON.
 * Cap ~1500 tokens so the model sees signal, not the raw payload.
 */
export function buildChatContext(payload: OverviewPayload): string {
  const { stats, attention, lawyers, deadlines, finance, activityCounts, config } =
    payload;
  const now = new Date().toISOString();

  const lines: string[] = [
    `Now: ${now}`,
    `SLA: ${config.slaMinutes} minutes (four hour clock). Watch at ${config.slaWatchMinutes}m. Capacity watch ${config.capacityWatchPct}%, over at ${config.capacityOverPct}%.`,
    `Stats: in flight ${stats.inFlight}; due next hour ${stats.dueNextHour}; due today ${stats.dueToday}; at risk ${stats.atRisk} (${stats.breached} past due); unassigned ${stats.unassigned}${
      stats.oldestUnassignedMinutes != null
        ? ` (oldest ${stats.oldestUnassignedMinutes}m)`
        : ""
    }; service lines ${stats.serviceLines}.`,
  ];

  if (attention.length) {
    lines.push("Attention:");
    for (const a of attention) {
      const mins =
        a.minutesRemaining == null ? "" : ` · ${a.minutesRemaining}m`;
      lines.push(
        `- ${a.kind}: ${a.title}${mins} · ${a.reason} · action ${a.action}`
      );
    }
  }

  lines.push("Lawyers (utilization desc):");
  for (const l of lawyers) {
    lines.push(
      `- ${l.name}: ${l.utilizationPct}% (${l.capacityLabel}), ${l.activeMatters} active / capacity ${l.weekly_capacity}, areas ${l.practice_areas.join("/")}, on-time ${Math.round(l.on_time_rate * 100)}%, week ${l.delivered_this_week}/${l.weekly_target}`
    );
  }

  if (deadlines.length) {
    lines.push("Deadlines (next four hours):");
    for (const m of deadlines) {
      lines.push(
        `- ${m.reference}: ${m.client_name}, ${m.type}, ${m.service_line}, stage ${m.stage}, ${m.lawyer_name ?? "unassigned"}, ${m.minutes_remaining}m left, fee $${m.fee}${
          m.draft_confidence != null
            ? `, draft conf ${Math.round(m.draft_confidence * 100)}%`
            : ""
        }`
      );
    }
  }

  lines.push(
    `Finance: revenue $${finance.revenueToDate} / target $${finance.target} (${finance.pctOfTarget}%, projected ${finance.projectedPct}%); avg fee $${finance.avgFee}; margin ${finance.marginPct}%; draft avg ${finance.avgDraftMinutes}m, review avg ${finance.avgReviewMinutes}m; delivered this week ${finance.deliveredThisWeek}/${finance.plannedThisWeek}.`
  );
  if (finance.anomaly) {
    lines.push(
      `Anomaly: ${finance.anomaly.serviceLine} avg $${finance.anomaly.avg} vs firm $${finance.anomaly.firmAvg} across ${finance.anomaly.count}.`
    );
  }
  if (finance.unquoted.length) {
    lines.push(
      `Unquoted: ${finance.unquoted
        .map(
          (m) =>
            `${m.reference} ${m.type}${
              m.suggestedFee != null ? ` suggest $${m.suggestedFee}` : ""
            }`
        )
        .join("; ")}.`
    );
  }

  const countParts = Object.entries(activityCounts)
    .map(([k, v]) => `${k} ${v}`)
    .join(", ");
  lines.push(`Activity today: ${countParts}.`);

  // Prefer matching practice on live unassigned for assign grounding.
  const unassigned = payload.matters.filter(
    (m) => !m.lawyer_id && m.fee > 0 && m.stage !== "delivered"
  );
  if (unassigned.length) {
    lines.push(
      `Unassigned matters: ${unassigned
        .map(
          (m) =>
            `${m.reference} ${m.service_line}/${m.type} ${m.minutes_remaining}m`
        )
        .join("; ")}.`
    );
  }

  let text = lines.join("\n");
  // Soft cap ~1500 tokens ≈ 6000 characters.
  if (text.length > 6000) {
    text = `${text.slice(0, 5900)}\n[truncated]`;
  }
  return text;
}
