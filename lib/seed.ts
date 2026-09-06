/**
 * Moritz admin dashboard · seed data
 *
 * One fixed clock so the demo behaves identically on every load and every machine.
 * Nothing derived is stored here. minutesRemaining, utilization, risk, margin,
 * and every count are computed in lib/derive.ts from these facts.
 *
 * Friday 5 September 2026, 14:32 local. A busy afternoon on purpose:
 * two matters past due, one inside twenty minutes, two unassigned,
 * two lawyers over capacity, three near it.
 */

export const NOW = new Date("2026-09-05T14:32:00Z");

export const SLA_MINUTES = 240;        // the four hour promise
export const SLA_WATCH_MINUTES = 60;   // under an hour left is a watch state
export const CAPACITY_WATCH = 80;      // percent
export const CAPACITY_OVER = 100;      // percent
export const MONTHLY_TARGET = 180000;  // dollars
export const DAILY_DELIVERY_PLAN = 7;  // matters per working day

export type ServiceLine =
  | "Commercial"
  | "Corporate"
  | "Privacy"
  | "Employment"
  | "Real estate"
  | "Litigation";

export type Stage = "submitted" | "quoted" | "drafting" | "review" | "delivered";
export type Channel = "email" | "slack" | "platform";

export interface Lawyer {
  id: string;
  name: string;
  initials: string;
  practiceAreas: ServiceLine[];
  weeklyCapacity: number;   // matters they can hold at once
  weeklyTarget: number;     // matters delivered per week
  deliveredThisWeek: number;
  /** Historical on-time rate, 0 to 1. Feeds the slip risk prediction. */
  onTimeRate: number;
}

export interface Client {
  id: string;
  company: string;
  plan: "per-matter" | "enterprise";
  onboardedAt: string;
}

export interface Matter {
  id: string;
  reference: string;
  clientId: string;
  serviceLine: ServiceLine;
  type: string;
  stage: Stage;
  lawyerId: string | null;
  submittedAt: string;
  deliveredAt: string | null;
  fee: number;
  payout: number;
  channel: Channel;
  /** AI confidence in its own draft, 0 to 1. Null before drafting starts. */
  draftConfidence: number | null;
  flaggedClauses: number;
  /** Minutes the AI spent drafting. Null until drafting completes. */
  draftMinutes: number | null;
  /** Minutes the lawyer spent reviewing. Null until review completes. */
  reviewMinutes: number | null;
}

export type Verb =
  | "submitted" | "quoted" | "assigned" | "drafted"
  | "delivered" | "escalated" | "onboarded" | "filed" | "meeting";

export interface ActivityEvent {
  id: string;
  at: string;
  actorId: string | "ai" | "system";
  verb: Verb;
  matterId: string | null;
  clientId: string | null;
  note?: string;
}

/* helpers, build time only ------------------------------------------------ */

const minsAgo = (m: number) => new Date(NOW.getTime() - m * 60_000).toISOString();
const hoursAgo = (h: number) => minsAgo(h * 60);
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString();

/* lawyers ----------------------------------------------------------------- */

export const lawyers: Lawyer[] = [
  { id: "l1",  name: "Lars Ødegård",     initials: "LØ", practiceAreas: ["Commercial", "Corporate"],   weeklyCapacity: 3,  weeklyTarget: 8, deliveredThisWeek: 7, onTimeRate: 0.72 },
  { id: "l2",  name: "Marta Costa",      initials: "MC", practiceAreas: ["Corporate", "Commercial"],   weeklyCapacity: 5,  weeklyTarget: 8, deliveredThisWeek: 6, onTimeRate: 0.81 },
  { id: "l3",  name: "Julie Aagaard",    initials: "JA", practiceAreas: ["Privacy", "Commercial"],     weeklyCapacity: 4,  weeklyTarget: 7, deliveredThisWeek: 6, onTimeRate: 0.94 },
  { id: "l4",  name: "Daniel Vedova",    initials: "DV", practiceAreas: ["Corporate", "Litigation"],   weeklyCapacity: 5,  weeklyTarget: 8, deliveredThisWeek: 5, onTimeRate: 0.88 },
  { id: "l5",  name: "Kyle Westaway",    initials: "KW", practiceAreas: ["Commercial", "Employment"],  weeklyCapacity: 5,  weeklyTarget: 7, deliveredThisWeek: 5, onTimeRate: 0.91 },
  { id: "l6",  name: "Sofie Bakken",     initials: "SB", practiceAreas: ["Employment", "Privacy"],     weeklyCapacity: 5,  weeklyTarget: 7, deliveredThisWeek: 4, onTimeRate: 0.96 },
  { id: "l7",  name: "Catarina Milagre", initials: "CM", practiceAreas: ["Real estate", "Commercial"], weeklyCapacity: 5,  weeklyTarget: 6, deliveredThisWeek: 3, onTimeRate: 0.89 },
  { id: "l8",  name: "Henrik Vold",      initials: "HV", practiceAreas: ["Litigation", "Corporate"],   weeklyCapacity: 5,  weeklyTarget: 6, deliveredThisWeek: 4, onTimeRate: 0.83 },
  { id: "l9",  name: "Priya Raman",      initials: "PR", practiceAreas: ["Privacy", "Corporate"],      weeklyCapacity: 6,  weeklyTarget: 8, deliveredThisWeek: 6, onTimeRate: 0.93 },
  { id: "l10", name: "Anders Holm",      initials: "AH", practiceAreas: ["Commercial", "Real estate"], weeklyCapacity: 6,  weeklyTarget: 7, deliveredThisWeek: 4, onTimeRate: 0.87 },
  { id: "l11", name: "Nina Bergström",   initials: "NB", practiceAreas: ["Employment", "Litigation"],  weeklyCapacity: 5,  weeklyTarget: 6, deliveredThisWeek: 3, onTimeRate: 0.90 },
  { id: "l12", name: "Tomás Ferreira",   initials: "TF", practiceAreas: ["Corporate", "Real estate"],  weeklyCapacity: 5,  weeklyTarget: 7, deliveredThisWeek: 5, onTimeRate: 0.85 },
  { id: "l13", name: "Ingrid Lie",       initials: "IL", practiceAreas: ["Commercial", "Privacy"],     weeklyCapacity: 5,  weeklyTarget: 6, deliveredThisWeek: 2, onTimeRate: 0.92 },
  { id: "l14", name: "Oskar Lindqvist",  initials: "OL", practiceAreas: ["Litigation", "Employment"],  weeklyCapacity: 6,  weeklyTarget: 6, deliveredThisWeek: 3, onTimeRate: 0.79 },
];

/* clients ----------------------------------------------------------------- */

export const clients: Client[] = [
  { id: "c1",  company: "Northwind Systems", plan: "enterprise",  onboardedAt: daysAgo(210) },
  { id: "c2",  company: "Kestrel Bio",       plan: "per-matter",  onboardedAt: daysAgo(96)  },
  { id: "c3",  company: "Halden Labs",       plan: "per-matter",  onboardedAt: daysAgo(54)  },
  { id: "c4",  company: "Arqa",              plan: "per-matter",  onboardedAt: daysAgo(31)  },
  { id: "c5",  company: "Vesta Freight",     plan: "enterprise",  onboardedAt: daysAgo(180) },
  { id: "c6",  company: "Oslo Grid",         plan: "per-matter",  onboardedAt: daysAgo(122) },
  { id: "c7",  company: "Fjordline",         plan: "per-matter",  onboardedAt: daysAgo(77)  },
  { id: "c8",  company: "Brightmoor",        plan: "enterprise",  onboardedAt: minsAgo(268) },
  { id: "c9",  company: "Terrapin Health",   plan: "per-matter",  onboardedAt: daysAgo(45)  },
  { id: "c10", company: "Solvei",            plan: "per-matter",  onboardedAt: daysAgo(19)  },
  { id: "c11", company: "Marrow Robotics",   plan: "per-matter",  onboardedAt: daysAgo(63)  },
  { id: "c12", company: "Bergen Capital",    plan: "enterprise",  onboardedAt: daysAgo(150) },
];

/* active matters ----------------------------------------------------------
 * 48 in flight. Ordered roughly by submission time, newest last.
 * Fees sit inside the 250 to 2500 band. Payout is 35 to 55 percent of fee.
 * ------------------------------------------------------------------------ */

export const matters: Matter[] = [
  // --- past due, the two that anchor the attention strip ---
  { id: "m1", reference: "MOR-1042", clientId: "c1", serviceLine: "Commercial", type: "MSA review",
    stage: "review", lawyerId: "l1", submittedAt: minsAgo(254), deliveredAt: null,
    fee: 1850, payout: 833, channel: "email", draftConfidence: 0.68, flaggedClauses: 4,
    draftMinutes: 178, reviewMinutes: null },

  { id: "m2", reference: "MOR-1038", clientId: "c2", serviceLine: "Privacy", type: "DPA",
    stage: "review", lawyerId: "l3", submittedAt: minsAgo(246), deliveredAt: null,
    fee: 950, payout: 428, channel: "platform", draftConfidence: 0.84, flaggedClauses: 2,
    draftMinutes: 152, reviewMinutes: null },

  // --- inside the watch band ---
  { id: "m3", reference: "MOR-1051", clientId: "c3", serviceLine: "Employment", type: "Offer letter",
    stage: "drafting", lawyerId: "l2", submittedAt: minsAgo(222), deliveredAt: null,
    fee: 450, payout: 203, channel: "slack", draftConfidence: 0.62, flaggedClauses: 3,
    draftMinutes: null, reviewMinutes: null },

  { id: "m4", reference: "MOR-1047", clientId: "c6", serviceLine: "Corporate", type: "Term sheet",
    stage: "review", lawyerId: "l4", submittedAt: minsAgo(188), deliveredAt: null,
    fee: 1600, payout: 720, channel: "email", draftConfidence: 0.89, flaggedClauses: 1,
    draftMinutes: 141, reviewMinutes: null },

  // --- unassigned, freshly arrived ---
  { id: "m5", reference: "MOR-1054", clientId: "c4", serviceLine: "Commercial", type: "NDA",
    stage: "submitted", lawyerId: null, submittedAt: minsAgo(12), deliveredAt: null,
    fee: 350, payout: 158, channel: "slack", draftConfidence: null, flaggedClauses: 0,
    draftMinutes: null, reviewMinutes: null },

  { id: "m6", reference: "MOR-1055", clientId: "c5", serviceLine: "Commercial", type: "Procurement SOW",
    stage: "submitted", lawyerId: null, submittedAt: minsAgo(4), deliveredAt: null,
    fee: 1100, payout: 495, channel: "email", draftConfidence: null, flaggedClauses: 0,
    draftMinutes: null, reviewMinutes: null },

  // --- unquoted, blocks the money zone ---
  { id: "m7", reference: "MOR-1056", clientId: "c8", serviceLine: "Corporate", type: "Term sheet",
    stage: "submitted", lawyerId: null, submittedAt: minsAgo(22), deliveredAt: null,
    fee: 0, payout: 0, channel: "platform", draftConfidence: null, flaggedClauses: 0,
    draftMinutes: null, reviewMinutes: null },

  // --- comfortably in flight ---
  { id: "m8",  reference: "MOR-1049", clientId: "c7",  serviceLine: "Commercial",  type: "MSA",             stage: "drafting", lawyerId: "l5",  submittedAt: minsAgo(134), deliveredAt: null, fee: 1750, payout: 788, channel: "email",    draftConfidence: 0.91, flaggedClauses: 1, draftMinutes: null, reviewMinutes: null },
  { id: "m9",  reference: "MOR-1052", clientId: "c4",  serviceLine: "Employment",  type: "Contract",        stage: "drafting", lawyerId: "l6",  submittedAt: minsAgo(89),  deliveredAt: null, fee: 700,  payout: 315, channel: "slack",    draftConfidence: 0.88, flaggedClauses: 0, draftMinutes: null, reviewMinutes: null },
  { id: "m10", reference: "MOR-1053", clientId: "c5",  serviceLine: "Real estate", type: "Sublease",        stage: "drafting", lawyerId: "l7",  submittedAt: minsAgo(51),  deliveredAt: null, fee: 1250, payout: 563, channel: "platform", draftConfidence: 0.86, flaggedClauses: 2, draftMinutes: null, reviewMinutes: null },
  { id: "m11", reference: "MOR-1050", clientId: "c9",  serviceLine: "Privacy",     type: "DPIA",            stage: "quoted",   lawyerId: "l9",  submittedAt: minsAgo(96),  deliveredAt: null, fee: 1400, payout: 630, channel: "email",    draftConfidence: null, flaggedClauses: 0, draftMinutes: null, reviewMinutes: null },
  { id: "m12", reference: "MOR-1048", clientId: "c10", serviceLine: "Corporate",   type: "SAFE",            stage: "review",   lawyerId: "l12", submittedAt: minsAgo(171), deliveredAt: null, fee: 800,  payout: 360, channel: "platform", draftConfidence: 0.93, flaggedClauses: 0, draftMinutes: 118, reviewMinutes: null },
  { id: "m13", reference: "MOR-1046", clientId: "c11", serviceLine: "Commercial",  type: "Reseller agmt",   stage: "review",   lawyerId: "l10", submittedAt: minsAgo(164), deliveredAt: null, fee: 1500, payout: 675, channel: "email",    draftConfidence: 0.86, flaggedClauses: 3, draftMinutes: 129, reviewMinutes: null },
  { id: "m14", reference: "MOR-1045", clientId: "c12", serviceLine: "Corporate",   type: "Diligence memo",  stage: "drafting", lawyerId: "l2",  submittedAt: minsAgo(118), deliveredAt: null, fee: 2200, payout: 990, channel: "platform", draftConfidence: 0.81, flaggedClauses: 2, draftMinutes: null, reviewMinutes: null },
  { id: "m15", reference: "MOR-1044", clientId: "c1",  serviceLine: "Privacy",     type: "DPA",             stage: "drafting", lawyerId: "l3",  submittedAt: minsAgo(77),  deliveredAt: null, fee: 900,  payout: 405, channel: "email",    draftConfidence: 0.90, flaggedClauses: 1, draftMinutes: null, reviewMinutes: null },
  { id: "m16", reference: "MOR-1043", clientId: "c6",  serviceLine: "Litigation",  type: "Discovery req",   stage: "review",   lawyerId: "l8",  submittedAt: minsAgo(157), deliveredAt: null, fee: 1350, payout: 608, channel: "platform", draftConfidence: 0.68, flaggedClauses: 5, draftMinutes: 122, reviewMinutes: null },
  { id: "m17", reference: "MOR-1041", clientId: "c3",  serviceLine: "Employment",  type: "Termination ltr", stage: "drafting", lawyerId: "l11", submittedAt: minsAgo(63),  deliveredAt: null, fee: 550,  payout: 248, channel: "slack",    draftConfidence: 0.87, flaggedClauses: 0, draftMinutes: null, reviewMinutes: null },
  { id: "m18", reference: "MOR-1040", clientId: "c7",  serviceLine: "Commercial",  type: "NDA",             stage: "drafting", lawyerId: "l13", submittedAt: minsAgo(44),  deliveredAt: null, fee: 300,  payout: 135, channel: "email",    draftConfidence: 0.95, flaggedClauses: 0, draftMinutes: null, reviewMinutes: null },
  { id: "m19", reference: "MOR-1039", clientId: "c9",  serviceLine: "Corporate",   type: "Board consent",   stage: "quoted",   lawyerId: "l4",  submittedAt: minsAgo(38),  deliveredAt: null, fee: 650,  payout: 293, channel: "platform", draftConfidence: null, flaggedClauses: 0, draftMinutes: null, reviewMinutes: null },
  { id: "m20", reference: "MOR-1037", clientId: "c2",  serviceLine: "Commercial",  type: "SOW",             stage: "drafting", lawyerId: "l1",  submittedAt: minsAgo(104), deliveredAt: null, fee: 1050, payout: 473, channel: "email",    draftConfidence: 0.83, flaggedClauses: 1, draftMinutes: null, reviewMinutes: null },
  { id: "m21", reference: "MOR-1036", clientId: "c11", serviceLine: "Privacy",     type: "Privacy policy",  stage: "drafting", lawyerId: "l9",  submittedAt: minsAgo(58),  deliveredAt: null, fee: 750,  payout: 338, channel: "platform", draftConfidence: 0.92, flaggedClauses: 0, draftMinutes: null, reviewMinutes: null },
  { id: "m22", reference: "MOR-1035", clientId: "c12", serviceLine: "Corporate",   type: "Share purchase",  stage: "review",   lawyerId: "l12", submittedAt: minsAgo(199), deliveredAt: null, fee: 2400, payout: 1080, channel: "email",   draftConfidence: 0.88, flaggedClauses: 3, draftMinutes: 165, reviewMinutes: null },
  { id: "m23", reference: "MOR-1034", clientId: "c5",  serviceLine: "Real estate", type: "Lease",           stage: "drafting", lawyerId: "l10", submittedAt: minsAgo(72),  deliveredAt: null, fee: 1300, payout: 585, channel: "platform", draftConfidence: 0.85, flaggedClauses: 1, draftMinutes: null, reviewMinutes: null },
  { id: "m24", reference: "MOR-1033", clientId: "c10", serviceLine: "Employment",  type: "Option plan",     stage: "drafting", lawyerId: "l6",  submittedAt: minsAgo(31),  deliveredAt: null, fee: 1150, payout: 518, channel: "email",    draftConfidence: 0.88, flaggedClauses: 0, draftMinutes: null, reviewMinutes: null },
  { id: "m25", reference: "MOR-1032", clientId: "c1",  serviceLine: "Commercial",  type: "BAA",             stage: "review",   lawyerId: "l5",  submittedAt: minsAgo(146), deliveredAt: null, fee: 800,  payout: 360, channel: "platform", draftConfidence: 0.94, flaggedClauses: 0, draftMinutes: 108, reviewMinutes: null },
  { id: "m26", reference: "MOR-1031", clientId: "c6",  serviceLine: "Litigation",  type: "Small claims",    stage: "drafting", lawyerId: "l14", submittedAt: minsAgo(85),  deliveredAt: null, fee: 900,  payout: 405, channel: "email",    draftConfidence: 0.74, flaggedClauses: 2, draftMinutes: null, reviewMinutes: null },
  { id: "m27", reference: "MOR-1030", clientId: "c3",  serviceLine: "Corporate",   type: "Engagement ltr",  stage: "quoted",   lawyerId: "l2",  submittedAt: minsAgo(27),  deliveredAt: null, fee: 400,  payout: 180, channel: "slack",    draftConfidence: null, flaggedClauses: 0, draftMinutes: null, reviewMinutes: null },
  { id: "m28", reference: "MOR-1029", clientId: "c7",  serviceLine: "Privacy",     type: "DPA",             stage: "drafting", lawyerId: "l3",  submittedAt: minsAgo(112), deliveredAt: null, fee: 950,  payout: 428, channel: "platform", draftConfidence: 0.90, flaggedClauses: 1, draftMinutes: null, reviewMinutes: null },
  { id: "m29", reference: "MOR-1028", clientId: "c9",  serviceLine: "Commercial",  type: "MSA",             stage: "review",   lawyerId: "l1",  submittedAt: minsAgo(181), deliveredAt: null, fee: 1900, payout: 855, channel: "email",    draftConfidence: 0.85, flaggedClauses: 4, draftMinutes: 147, reviewMinutes: null },
  { id: "m30", reference: "MOR-1027", clientId: "c11", serviceLine: "Corporate",   type: "Convertible note",stage: "drafting", lawyerId: "l4",  submittedAt: minsAgo(66),  deliveredAt: null, fee: 1050, payout: 473, channel: "platform", draftConfidence: 0.87, flaggedClauses: 0, draftMinutes: null, reviewMinutes: null },
  { id: "m31", reference: "MOR-1026", clientId: "c12", serviceLine: "Real estate", type: "Assignment",      stage: "drafting", lawyerId: "l7",  submittedAt: minsAgo(93),  deliveredAt: null, fee: 850,  payout: 383, channel: "email",    draftConfidence: 0.91, flaggedClauses: 0, draftMinutes: null, reviewMinutes: null },
  { id: "m32", reference: "MOR-1025", clientId: "c4",  serviceLine: "Employment",  type: "Contract",        stage: "review",   lawyerId: "l11", submittedAt: minsAgo(152), deliveredAt: null, fee: 600,  payout: 270, channel: "slack",    draftConfidence: 0.89, flaggedClauses: 1, draftMinutes: 111, reviewMinutes: null },
  { id: "m33", reference: "MOR-1024", clientId: "c2",  serviceLine: "Privacy",     type: "DPIA",            stage: "drafting", lawyerId: "l9",  submittedAt: minsAgo(48),  deliveredAt: null, fee: 1450, payout: 653, channel: "platform", draftConfidence: 0.82, flaggedClauses: 2, draftMinutes: null, reviewMinutes: null },
  { id: "m34", reference: "MOR-1023", clientId: "c8",  serviceLine: "Commercial",  type: "Reseller agmt",   stage: "quoted",   lawyerId: "l13", submittedAt: minsAgo(19),  deliveredAt: null, fee: 1200, payout: 540, channel: "email",    draftConfidence: null, flaggedClauses: 0, draftMinutes: null, reviewMinutes: null },
  { id: "m35", reference: "MOR-1022", clientId: "c10", serviceLine: "Corporate",   type: "Cap table memo",  stage: "drafting", lawyerId: "l12", submittedAt: minsAgo(126), deliveredAt: null, fee: 1700, payout: 765, channel: "platform", draftConfidence: 0.80, flaggedClauses: 2, draftMinutes: null, reviewMinutes: null },
  { id: "m36", reference: "MOR-1021", clientId: "c5",  serviceLine: "Litigation",  type: "Diligence",       stage: "review",   lawyerId: "l8",  submittedAt: minsAgo(168), deliveredAt: null, fee: 1550, payout: 698, channel: "email",    draftConfidence: 0.84, flaggedClauses: 3, draftMinutes: 134, reviewMinutes: null },
  { id: "m37", reference: "MOR-1020", clientId: "c1",  serviceLine: "Commercial",  type: "NDA",             stage: "drafting", lawyerId: "l5",  submittedAt: minsAgo(36),  deliveredAt: null, fee: 300,  payout: 135, channel: "slack",    draftConfidence: 0.96, flaggedClauses: 0, draftMinutes: null, reviewMinutes: null },
  { id: "m38", reference: "MOR-1019", clientId: "c6",  serviceLine: "Employment",  type: "Handbook review", stage: "drafting", lawyerId: "l6",  submittedAt: minsAgo(101), deliveredAt: null, fee: 1000, payout: 450, channel: "platform", draftConfidence: 0.86, flaggedClauses: 1, draftMinutes: null, reviewMinutes: null },
  { id: "m39", reference: "MOR-1018", clientId: "c9",  serviceLine: "Corporate",   type: "Side letter",     stage: "drafting", lawyerId: "l2",  submittedAt: minsAgo(57),  deliveredAt: null, fee: 750,  payout: 338, channel: "email",    draftConfidence: 0.88, flaggedClauses: 0, draftMinutes: null, reviewMinutes: null },
  { id: "m40", reference: "MOR-1017", clientId: "c11", serviceLine: "Real estate", type: "Lease amendment", stage: "review",   lawyerId: "l7",  submittedAt: minsAgo(139), deliveredAt: null, fee: 700,  payout: 315, channel: "platform", draftConfidence: 0.92, flaggedClauses: 0, draftMinutes: 96,  reviewMinutes: null },
  { id: "m41", reference: "MOR-1016", clientId: "c12", serviceLine: "Privacy",     type: "Vendor DPA",      stage: "drafting", lawyerId: "l3",  submittedAt: minsAgo(83),  deliveredAt: null, fee: 850,  payout: 383, channel: "email",    draftConfidence: 0.90, flaggedClauses: 1, draftMinutes: null, reviewMinutes: null },
  { id: "m42", reference: "MOR-1015", clientId: "c3",  serviceLine: "Commercial",  type: "SOW",             stage: "drafting", lawyerId: "l10", submittedAt: minsAgo(69),  deliveredAt: null, fee: 950,  payout: 428, channel: "slack",    draftConfidence: 0.84, flaggedClauses: 1, draftMinutes: null, reviewMinutes: null },
  { id: "m43", reference: "MOR-1014", clientId: "c7",  serviceLine: "Employment",  type: "Offer letter",    stage: "drafting", lawyerId: "l14", submittedAt: minsAgo(41),  deliveredAt: null, fee: 400,  payout: 180, channel: "email",    draftConfidence: 0.93, flaggedClauses: 0, draftMinutes: null, reviewMinutes: null },
  { id: "m44", reference: "MOR-1013", clientId: "c4",  serviceLine: "Corporate",   type: "Term sheet",      stage: "review",   lawyerId: "l4",  submittedAt: minsAgo(175), deliveredAt: null, fee: 1650, payout: 743, channel: "platform", draftConfidence: 0.87, flaggedClauses: 2, draftMinutes: 143, reviewMinutes: null },
  { id: "m45", reference: "MOR-1012", clientId: "c10", serviceLine: "Litigation",  type: "Demand letter",   stage: "drafting", lawyerId: "l8",  submittedAt: minsAgo(54),  deliveredAt: null, fee: 800,  payout: 360, channel: "email",    draftConfidence: 0.81, flaggedClauses: 1, draftMinutes: null, reviewMinutes: null },
  { id: "m46", reference: "MOR-1011", clientId: "c2",  serviceLine: "Commercial",  type: "MSA",             stage: "drafting", lawyerId: "l1",  submittedAt: minsAgo(115), deliveredAt: null, fee: 2050, payout: 923, channel: "platform", draftConfidence: 0.79, flaggedClauses: 3, draftMinutes: null, reviewMinutes: null },
  { id: "m47", reference: "MOR-1010", clientId: "c8",  serviceLine: "Privacy",     type: "DPO advisory",    stage: "drafting", lawyerId: "l9",  submittedAt: minsAgo(97),  deliveredAt: null, fee: 1500, payout: 675, channel: "email",    draftConfidence: 0.85, flaggedClauses: 1, draftMinutes: null, reviewMinutes: null },
  { id: "m48", reference: "MOR-1009", clientId: "c6",  serviceLine: "Corporate",   type: "Diligence memo",  stage: "review",   lawyerId: "l12", submittedAt: minsAgo(161), deliveredAt: null, fee: 1800, payout: 810, channel: "platform", draftConfidence: 0.87, flaggedClauses: 1, draftMinutes: 138, reviewMinutes: null },
];

/* delivered history --------------------------------------------------------
 * 90 matters delivered over the last 30 days. Generated at module load from a
 * fixed table so the values are stable, not random. Employment matters carry a
 * deliberately low average fee: that is the anomaly the money zone surfaces.
 * ------------------------------------------------------------------------ */

const DELIVERED_SHAPE: Array<[ServiceLine, string, number, number, number, number]> = [
  // serviceLine, type, fee, payoutPct(0-1), draftMinutes, reviewMinutes
  ["Commercial",  "NDA",            320,  0.45, 141, 52],
  ["Commercial",  "MSA",           1850,  0.45, 192, 78],
  ["Commercial",  "SOW",           1000,  0.45, 168, 61],
  ["Corporate",   "Term sheet",    1600,  0.45, 176, 74],
  ["Corporate",   "SAFE",           800,  0.45, 152, 58],
  ["Corporate",   "Diligence memo",2100,  0.45, 205, 88],
  ["Privacy",     "DPA",            950,  0.45, 163, 64],
  ["Privacy",     "DPIA",          1400,  0.45, 181, 71],
  ["Employment",  "Offer letter",   420,  0.45, 126, 44],   // employment runs cheap
  ["Employment",  "Contract",       640,  0.45, 138, 49],
  ["Employment",  "Termination ltr",520,  0.45, 131, 47],
  ["Real estate", "Lease",         1300,  0.45, 174, 69],
  ["Real estate", "Sublease",      1150,  0.45, 159, 62],
  ["Litigation",  "Discovery req", 1350,  0.45, 198, 83],
  ["Litigation",  "Demand letter",  800,  0.45, 147, 56],
];

/** Deterministic pseudo-random. Same sequence every run, no Math.random. */
function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export const deliveredMatters: Matter[] = (() => {
  const rand = lcg(20260905);
  const out: Matter[] = [];
  for (let i = 0; i < 90; i++) {
    const shape = DELIVERED_SHAPE[Math.floor(rand() * DELIVERED_SHAPE.length)];
    const [serviceLine, type, baseFee, payoutPct, draftM, reviewM] = shape;
    const dayOffset = Math.floor(rand() * 30);
    const hourOffset = 9 + Math.floor(rand() * 8);
    const submitted = new Date(NOW.getTime() - dayOffset * 86_400_000);
    submitted.setUTCHours(hourOffset, Math.floor(rand() * 60), 0, 0);
    const totalMin = draftM + reviewM + Math.floor(rand() * 30) - 15;
    const delivered = new Date(submitted.getTime() + totalMin * 60_000);
    const feeJitter = 1 + (rand() - 0.5) * 0.18;
    const fee = Math.round((baseFee * feeJitter) / 10) * 10;
    const lawyer = lawyers[Math.floor(rand() * lawyers.length)];
    const client = clients[Math.floor(rand() * clients.length)];
    out.push({
      id: `d${i + 1}`,
      reference: `MOR-${900 + i}`,
      clientId: client.id,
      serviceLine,
      type,
      stage: "delivered",
      lawyerId: lawyer.id,
      submittedAt: submitted.toISOString(),
      deliveredAt: delivered.toISOString(),
      fee,
      payout: Math.round(fee * payoutPct),
      channel: (["email", "slack", "platform"] as Channel[])[Math.floor(rand() * 3)],
      draftConfidence: 0.82 + rand() * 0.16,
      flaggedClauses: Math.floor(rand() * 4),
      draftMinutes: draftM,
      reviewMinutes: reviewM,
    });
  }
  return out;
})();

/* activity ---------------------------------------------------------------- */

export const activity: ActivityEvent[] = [
  // today, 24 events
  { id: "e1",  at: minsAgo(14),  actorId: "system", verb: "escalated", matterId: "m1",  clientId: "c1",  note: "past due" },
  { id: "e2",  at: minsAgo(40),  actorId: "l5",     verb: "delivered", matterId: null,  clientId: "c7",  note: "MSA for Fjordline" },
  { id: "e3",  at: minsAgo(52),  actorId: "system", verb: "submitted", matterId: "m5",  clientId: "c4",  note: "NDA via Slack" },
  { id: "e4",  at: minsAgo(81),  actorId: "l6",     verb: "assigned",  matterId: "m9",  clientId: "c4",  note: null as unknown as string },
  { id: "e5",  at: minsAgo(116), actorId: "l8",     verb: "filed",     matterId: "m16", clientId: "c6",  note: "discovery request" },
  { id: "e6",  at: minsAgo(154), actorId: "l2",     verb: "delivered", matterId: null,  clientId: "c6",  note: "term sheet for Oslo Grid" },
  { id: "e7",  at: minsAgo(197), actorId: "l3",     verb: "meeting",   matterId: null,  clientId: "c3",  note: "client meeting with Halden Labs" },
  { id: "e8",  at: minsAgo(268), actorId: "system", verb: "onboarded", matterId: null,  clientId: "c8",  note: "enterprise plan" },
  { id: "e9",  at: minsAgo(28),  actorId: "system", verb: "submitted", matterId: "m6",  clientId: "c5",  note: "procurement SOW via email" },
  { id: "e10", at: minsAgo(22),  actorId: "system", verb: "submitted", matterId: "m7",  clientId: "c8",  note: "term sheet via platform" },
  { id: "e11", at: minsAgo(63),  actorId: "l12",    verb: "quoted",    matterId: "m34", clientId: "c8",  note: "$1,200" },
  { id: "e12", at: minsAgo(94),  actorId: "ai",     verb: "drafted",   matterId: "m10", clientId: "c5",  note: "sublease, 2 clauses flagged" },
  { id: "e13", at: minsAgo(108), actorId: "l9",     verb: "assigned",  matterId: "m33", clientId: "c2",  note: null as unknown as string },
  { id: "e14", at: minsAgo(131), actorId: "l7",     verb: "delivered", matterId: null,  clientId: "c12", note: "lease amendment" },
  { id: "e15", at: minsAgo(143), actorId: "l4",     verb: "meeting",   matterId: null,  clientId: "c9",  note: "kickoff with Terrapin Health" },
  { id: "e16", at: minsAgo(166), actorId: "ai",     verb: "drafted",   matterId: "m24", clientId: "c10", note: "option plan, high confidence" },
  { id: "e17", at: minsAgo(179), actorId: "l14",    verb: "filed",     matterId: "m26", clientId: "c6",  note: "small claims" },
  { id: "e18", at: minsAgo(188), actorId: "system", verb: "submitted", matterId: "m4",  clientId: "c6",  note: "term sheet via email" },
  { id: "e19", at: minsAgo(206), actorId: "l1",     verb: "assigned",  matterId: "m20", clientId: "c2",  note: null as unknown as string },
  { id: "e20", at: minsAgo(221), actorId: "l11",    verb: "delivered", matterId: null,  clientId: "c4",  note: "employment contract" },
  { id: "e21", at: minsAgo(234), actorId: "l13",    verb: "quoted",    matterId: "m18", clientId: "c7",  note: "$300" },
  { id: "e22", at: minsAgo(247), actorId: "l6",     verb: "meeting",   matterId: null,  clientId: "c10", note: "quarterly review with Solvei" },
  { id: "e23", at: minsAgo(259), actorId: "ai",     verb: "drafted",   matterId: "m21", clientId: "c11", note: "privacy policy" },
  { id: "e24", at: minsAgo(272), actorId: "l10",    verb: "assigned",  matterId: "m13", clientId: "c11", note: null as unknown as string },

  // yesterday and earlier
  { id: "e25", at: hoursAgo(21), actorId: "l3",     verb: "delivered", matterId: null,  clientId: "c5",  note: "DPA for Vesta Freight" },
  { id: "e26", at: hoursAgo(22), actorId: "system", verb: "submitted", matterId: "m1",  clientId: "c1",  note: "MSA via email" },
  { id: "e27", at: hoursAgo(24), actorId: "l4",     verb: "delivered", matterId: null,  clientId: "c12", note: "share purchase agreement" },
  { id: "e28", at: hoursAgo(26), actorId: "l8",     verb: "filed",     matterId: null,  clientId: "c6",  note: "motion to compel" },
  { id: "e29", at: hoursAgo(28), actorId: "l9",     verb: "meeting",   matterId: null,  clientId: "c11", note: "privacy scoping call" },
  { id: "e30", at: hoursAgo(30), actorId: "system", verb: "onboarded", matterId: null,  clientId: "c10", note: "per-matter plan" },
  { id: "e31", at: hoursAgo(46), actorId: "l1",     verb: "delivered", matterId: null,  clientId: "c9",  note: "MSA for Terrapin Health" },
  { id: "e32", at: hoursAgo(49), actorId: "l12",    verb: "delivered", matterId: null,  clientId: "c10", note: "cap table memo" },
  { id: "e33", at: hoursAgo(52), actorId: "l5",     verb: "filed",     matterId: null,  clientId: "c1",  note: "trademark opposition" },
  { id: "e34", at: hoursAgo(70), actorId: "l7",     verb: "delivered", matterId: null,  clientId: "c5",  note: "assignment agreement" },
  { id: "e35", at: hoursAgo(73), actorId: "l2",     verb: "meeting",   matterId: null,  clientId: "c1",  note: "Northwind quarterly" },
];

/* finance ----------------------------------------------------------------- */

export interface FinanceDay {
  date: string;
  revenue: number;
  delivered: number;
  plannedDelivered: number;
}

/**
 * Day 1 to day 15 of September. Revenue accumulates to roughly 62 percent of
 * the 180k target, so the gap is visible and the pace story is honest.
 * Weekends deliver nothing, which is why the bar chart has two short days.
 */
export const financeDays: FinanceDay[] = (() => {
  const rand = lcg(905);
  const days: FinanceDay[] = [];
  for (let d = 1; d <= 15; d++) {
    const date = new Date(Date.UTC(2026, 8, d));
    const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
    const delivered = weekend ? 0 : 5 + Math.floor(rand() * 5);
    const avgFee = 1100 + rand() * 300;
    days.push({
      date: date.toISOString().slice(0, 10),
      revenue: Math.round(delivered * avgFee),
      delivered,
      plannedDelivered: weekend ? 0 : DAILY_DELIVERY_PLAN,
    });
  }
  return days;
})();

export const finance = {
  month: "2026-09",
  target: MONTHLY_TARGET,
  days: financeDays,
  /** Matters opened and closed this month, for the fifth money stat. */
  openedThisMonth: 96,
  closedThisMonth: 90,
};

/* lookups ----------------------------------------------------------------- */

export const lawyerById = (id: string | null) =>
  id ? lawyers.find((l) => l.id === id) ?? null : null;

export const clientById = (id: string | null) =>
  id ? clients.find((c) => c.id === id) ?? null : null;

export const matterById = (id: string | null) =>
  id ? [...matters, ...deliveredMatters].find((m) => m.id === id) ?? null : null;