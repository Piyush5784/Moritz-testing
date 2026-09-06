/**
 * lib/supabase.ts
 *
 * Two clients, two keys, two audiences.
 *
 * browserClient uses the publishable key. It ships to the browser and every
 * query it makes is filtered by the row level security policies in the schema.
 * It can read all five tables and update a matter. It cannot insert or delete.
 *
 * serverClient uses the secret key. It never leaves the server. It bypasses
 * RLS, which is why only route handlers and scripts are allowed to touch it.
 *
 * The NEXT_PUBLIC_ prefix is the whole boundary: Next.js inlines those values
 * into the client bundle, and refuses to inline anything without it.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/** Safe to import from a client component. */
export const browserClient = createClient(url, publishable, {
  auth: { persistSession: false },
});

/** Server only. Importing this into a client component is a bug. */
export function serverClient() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error("SUPABASE_SECRET_KEY is not set");
  return createClient(url, secret, { auth: { persistSession: false } });
}

/* ---------- shared types ------------------------------------------------- */

export type ServiceLine =
  | "Commercial" | "Corporate" | "Privacy"
  | "Employment" | "Real estate" | "Litigation";

export type Stage = "submitted" | "quoted" | "drafting" | "review" | "delivered";
export type Risk = "ok" | "watch" | "breach" | "done";
export type Channel = "email" | "slack" | "platform";
export type CapacityState = "room" | "high" | "over";

/** One row of the matter_status view. Risk and minutes come from Postgres. */
export interface MatterStatus {
  id: string;
  reference: string;
  client_id: string;
  client_name: string;
  service_line: ServiceLine;
  type: string;
  stage: Stage;
  lawyer_id: string | null;
  lawyer_name: string | null;
  lawyer_initials: string | null;
  on_time_rate: number | null;
  submitted_at: string;
  delivered_at: string | null;
  due_at: string;
  minutes_remaining: number;
  risk: Risk;
  fee: number;
  payout: number;
  margin_pct: number | null;
  channel: Channel;
  draft_confidence: number | null;
  flagged_clauses: number;
  draft_minutes: number | null;
  review_minutes: number | null;
}

export interface LawyerRow {
  id: string;
  name: string;
  initials: string;
  practice_areas: ServiceLine[];
  weekly_capacity: number;
  weekly_target: number;
  delivered_this_week: number;
  on_time_rate: number;
}

/** A lawyer plus everything computed about their load. */
export interface LawyerLoad extends LawyerRow {
  activeMatters: number;
  utilizationPct: number;
  capacityState: CapacityState;
  capacityLabel: string;
  nextDueMinutes: number | null;
  nextDueLabel: string;
}

export interface ActivityRow {
  id: number;
  at: string;
  actor_id: string | null;
  verb:
    | "submitted" | "quoted" | "assigned" | "drafted" | "delivered"
    | "escalated" | "onboarded" | "filed" | "meeting";
  matter_id: string | null;
  client_id: string | null;
  note: string | null;
}

export interface ActivityItem extends ActivityRow {
  actorName: string | null;
  actorInitials: string | null;
  clientName: string | null;
  reference: string | null;
}

export interface FinanceDayRow {
  date: string;
  revenue: number;
  delivered: number;
  planned_delivered: number;
}

/** One row in the attention strip. Every row carries its own action. */
export interface AttentionItem {
  kind: "breach" | "watch" | "unassigned" | "overCapacity" | "unquoted";
  id: string;
  label: string;        // badge text
  title: string;        // MOR-1042, or a lawyer name
  reason: string;       // plain words (non-structured rows)
  action: "Reassign" | "Nudge lawyer" | "Assign" | "Send quote";
  minutesRemaining: number | null;
  matterId: string | null;
  lawyerId: string | null;
  /** Smart triage: type · service line, confirmable on assign. */
  triage?: { type: string; serviceLine: ServiceLine } | null;
  /** 25th–75th percentile fee band for the triage class, or null if quiet. */
  feeBand?: { low: number; high: number } | null;
  /** Arrival clause, e.g. "arrived 18 min ago via Slack". */
  arrival?: string | null;
  /** Escalation handoff for breach rows. Quiet when empty. */
  handoff?: string | null;
  /** Same threshold as the deadline list: review drafts under 0.72. */
  lowConfidence?: { confidence: number; flaggedClauses: number } | null;
}

/** An unquoted matter with a server-computed fee suggestion. */
export interface UnquotedMatter extends MatterStatus {
  suggestedFee: number | null;
  comparableCount: number | null;
}

export interface Config {
  slaMinutes: number;
  slaWatchMinutes: number;
  capacityWatchPct: number;
  capacityOverPct: number;
  monthlyTarget: number;
  dailyDeliveryPlan: number;
}

export interface OverviewPayload {
  config: Config;
  generatedAt: string;
  stats: {
    inFlight: number;
    dueNextHour: number;
    dueToday: number;
    atRisk: number;
    breached: number;
    unassigned: number;
    serviceLines: number;
    oldestUnassignedMinutes: number | null;
    inFlightTrend: number[];
    dueTrend: number[];
    unassignedTrend: number[];
  };
  attention: AttentionItem[];
  lawyers: LawyerLoad[];
  deadlines: MatterStatus[];
  finance: {
    days: FinanceDayRow[];
    target: number;
    revenueToDate: number;
    pctOfTarget: number;
    projectedPct: number;
    avgFee: number;
    avgFeeDelta: number;
    marginPct: number;
    payoutPct: number;
    openedThisMonth: number;
    closedThisMonth: number;
    deliveredThisWeek: number;
    plannedThisWeek: number;
    avgDraftMinutes: number;
    avgReviewMinutes: number;
    anomaly: { serviceLine: ServiceLine; avg: number; firmAvg: number; count: number } | null;
    unquoted: UnquotedMatter[];
  };
  activity: ActivityItem[];
  activityCounts: Record<string, number>;
  clients: { id: string; company: string }[];
  matters: MatterStatus[];
  ai: {
    brief: { headline: string; detail: string; action: AttentionItem | null } | null;
    capacityForecast: string | null;
  };
}

/** Full matter directory for the Matters / Lawyers drill-downs. */
export interface MattersDirectoryPayload {
  matters: MatterStatus[];
  lawyers: LawyerLoad[];
  generatedAt: string;
}