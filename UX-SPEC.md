# Moritz Admin Dashboard · UX Specification

Single source of truth for the design half. Cursor reads this before writing any screen. When code and this file disagree, this file wins until it is updated.

---

## 1. Frame

**One page.** The dashboard is a single page, as the brief asks. A second route, /system, exists only as the design system reference: tokens, type, components, variants, and stated assumptions. It is not part of the dashboard and is not navigated to from it.

**Firm.** Moritz. Real service lines, real model: flat fee per matter ($250 to $2,500), AI drafts the first 80 percent, contracted co-counsel reviews the final 20, four-hour average turnaround. Intake arrives by email, Slack, or the platform.

**Persona.** Ingrid Solberg, Head of Operations. Not a lawyer. She routes incoming matters to co-counsel, watches the four-hour clock, and owns flat-fee margin. On a Monday morning she opens the dashboard with three questions, in this order:

1. Is anything about to breach the four-hour clock?
2. Who has room to take the next matter?
3. Are we on target this month?

Every element on the page exists to answer one of those three. If it answers none, it is cut.

**Why this is not a Clio dashboard.** Clio, MyCase, and Smokeball are built on utilization rate, realization rate, and collection rate. Those are billable-hour numbers. Moritz has no billable hours. Utilization becomes co-counsel capacity. Realization becomes margin per flat-fee matter. WIP becomes matters in flight against the clock. Anyone who copies a practice-management dashboard fails this brief.

**Command center.** The brief's word, and it carries three obligations. Glanceable: the state of the firm reads in seconds without a click. Prioritized: the alarming thing is louder than the routine thing. Actionable: you act from here, you do not just look.

The third is the one most dashboards fail. So the rule is: **every problem this page shows, it lets you act on in the same row.** An over-capacity lawyer has Reassign on their row. A matter running out of clock has Nudge or Reassign on its row. An unquoted matter has Send quote. If a row states a problem and offers no action, either the action is missing or the row does not belong on this page.

**Balance.** The brief asks the command center to balance firm health, workload distribution, and financial performance. Those are the three zones, one each, and none may swallow the page. Balance means equal completeness and equal rhythm, not equal prominence: every zone gets one section label, one primary display, and at least one action. Urgency still orders them, so Today is loudest and Money is quietest, but no zone is a footnote and no fourth zone is added. If a fourth idea appears, it goes into a tab, the rail, or the backlog.

**Chaos into calm.** The page must look calmest when the firm is busiest. The demo state is a genuinely busy Friday: 48 matters in flight, 2 past due, 3 lawyers near capacity, 24 events today. Calm comes from hierarchy, not from having little on screen, and designing the quiet version by showing almost no data is the easy way out. Practical rule: no red wash. Three matters at risk means three small badges and one red number, never three red cards. Alarm is carried by position and by one number, never by area of color.

**Metaphor.** A finance dashboard is a to-do list wearing charts. The command center is a triage inbox with numbers around it.

---

## 2. Information architecture

### Three tiers of urgency

| Tier | Contents | Desktop | Mobile |
|---|---|---|---|
| Act now | Matters with under 60 minutes on the clock or past it. Unassigned matters. Co-counsel over 100 percent. | Above the fold, always | Above the fold, always |
| Watch today | Co-counsel load. Matters by stage. Deadlines next 4 hours. Turnaround trend this week. | Visible without scrolling on 1440 by 900 | One tap, People tab |
| Context | Revenue vs target. Margin per matter. Matters opened vs closed. Activity feed including filings, meetings, and onboardings. | Below or in the rail | One tap, Money and Feed tabs |

### Zones (three maximum, plus a rail)

**Zone 1 · Today.** Four numbers at 36px: In flight · Due next hour · At risk · Unassigned. Only At risk is allowed color, and only when it is above zero. Below the numbers, the attention strip: one row per act-now item, reason in plain words, one action button. Rows are sorted by minutes remaining, ascending. Past-due first.

**Zone 2 · People.** Left, co-counsel table sorted by load descending. Columns: lawyer, practice areas, active matters, capacity bar, this week (delivered against weekly target, e.g. 6 of 8), next due, status. The "this week" column is the per-lawyer target the brief calls billable targets, translated to Moritz's flat-fee model. Each co-counsel row carries a row action: Reassign for anyone over capacity, View matters for everyone else. Right, the deadline list: next four hours, ranked by time remaining, each row showing matter reference, client, lawyer, minutes left, and one action: Nudge lawyer, or Reassign when the matter is past due.

**Zone 3 · Money.** Left, revenue this month as a line with the monthly target as a dotted reference. Right, matters delivered per day as bars against a plan line. Each chart carries a one-sentence caption that states its story. Below both, five money numbers: Revenue to date · Target · Average fee · Margin per matter · Opened vs closed this month. Any matter still unquoted appears as a single line under the numbers with a Send quote action, because an unquoted matter cannot start and that is the admin's blocker to clear.

**Rail · Pulse.** Activity feed, grouped by day, one line per event, avatar plus verb plus object. Filter chips with today's counts: All 24 · Submitted 7 · Assigned 6 · Delivered 4 · Filed 2 · Meetings 3 · Escalated 1 · Onboarded 1. Counts are computed from the seed, never hardcoded. The counts are the pulse at a glance; the feed is the detail. Event types include filed and meeting, because the brief names filings and meetings and Moritz runs litigation and discovery work. Sticky on desktop. A tab on mobile.

### The balance check

Each zone must have one section label, one primary display, and at least one action. Today: four numbers, attention strip, Assign. People: capacity table plus deadline list, Reassign and Nudge. Money: two charts plus five numbers, Send quote. If a zone has no action, it is a report, not a command center. If a zone has two primary displays competing, one moves.

### The two-second test

Cover the screen. Reveal it for two seconds. The user must be able to say the At risk number and the first attention row. If they say anything else first, the hierarchy is wrong.

### Navigation

Sidebar: Overview (this page) · Matters · Lawyers · Clients · Finance · Settings. Only Overview is built. The others exist so the page reads as part of a product, not a poster. Top bar: firm name, global search (opens the command palette), notification bell, avatar.

---

## 3. System logic (shadcn component map)

Every element uses a shadcn component in the way shadcn intends. No custom boxes that imitate components.

| Element | Component | Variant or prop | Notes |
|---|---|---|---|
| App shell | SidebarProvider, Sidebar, SidebarInset | variant="inset", collapsible="icon" | Official dashboard block |
| Top bar | SidebarTrigger, Breadcrumb, Separator, Button, Avatar | Button variant="ghost" size="icon" | |
| Stat card | Card, CardHeader, CardContent | data-stat on the number | No CardTitle, label is muted text |
| Attention row | Table row inside Card, or a list with Separator | Button size="sm" for the action | One primary action per row |
| Assign sheet | Sheet, SheetContent, Command | side="right" | Lists lawyers sorted by load ascending. Top row carries a Badge "Suggested" and a one-line reason: matching practice area, lowest load. |
| Co-counsel table | Table with TanStack Table | sortable columns, DropdownMenu per row | Row height 44px. Row action: Reassign when over capacity, View matters otherwise |
| Capacity bar | Progress | className swaps fill by threshold | Track and fill from mapped tokens |
| Status | Badge | variant="outline" plus data-stage | Pill radius, tinted bg, colored border |
| Deadline list | Table, compact | Button variant="ghost" size="sm" per row | Minutes column uses .num. Row action: Nudge lawyer, or Reassign when past due |
| Revenue chart | ChartContainer, AreaChart from Recharts | ChartTooltip | Target as ReferenceLine dashed. No legend, the section label names the series |
| Delivered chart | ChartContainer, BarChart | | Plan as ReferenceLine |
| Activity feed | ScrollArea, Avatar, Separator | | Grouped by day with a small day label |
| Feed filters | ToggleGroup | | Single select. Each chip shows today's count, computed from the seed. Chips: All · Submitted · Assigned · Delivered · Filed · Meetings · Escalated · Onboarded. The counts are the pulse summary. |
| AI chat panel | Sheet, Input, Button, Skeleton | side="right", width 380px, Cmd+J | Streaming with stop. Three state-generated prompts. Answers cite rows and end in the row's own action |
| Client update | Sheet, Textarea, Button | side="right" | Draft streams into an editable Textarea, not a preview |
| Morning brief | Card, Button | fjord tint, Button size="sm" | One line, one action, Dismiss |
| AI badges | Badge, Tooltip | variant="outline" | Suggested · Likely to slip · Draft confidence. Tooltip carries the basis |
| Command palette | Command, CommandDialog, CommandInput, CommandList, CommandGroup, CommandItem | Cmd+K | Actions: New matter, Assign, Reassign, Send quote, Go to |
| Saved views on table | Tabs | | At risk · Unassigned · By service line |
| Mobile sidebar | Sheet | side="left" | Triggered by SidebarTrigger |
| Mobile sections | Tabs | People · Money · Feed | |
| Loading | Skeleton | | Every zone has one |
| Empty state | Centered text plus one Button | | No illustration |
| Error state | Alert | variant="destructive" | Message says what happened and what to do |
| Tooltips | Tooltip | | On truncated names and chart points |
| Date range | Select or DropdownMenu | | This week · This month · Last 30 days |

### Badge stage vocabulary

Submitted (neutral) · Quoted (info) · Drafting (info) · In review (watch) · Delivered (ok) · Breached (risk). Six stages. Nothing else gets a badge.

### Capacity thresholds

Under 85 percent: ok fill. 85 to 100: watch fill. Over 100: over fill, row moves to the attention strip. The thresholds live in mapped tokens so the walkthrough can show them as system decisions.

Capacity is always shown as color plus label plus percentage, never color alone. "Over capacity · 118%" next to a red fill. "Room · 62%" next to a teal fill. The label is the accessible name; the color is reinforcement.

### SLA thresholds

Four hours from submission. Under 60 minutes remaining: watch. Past due: breach. Both derived at render time from `submittedAt`, never stored.

---

## 4. Data density

Density comes from typography, not from boxes.

- One surface. Sidebar, top bar, and content all sit on `--background`. Zones are separated by hairlines and whitespace, not by nested card backgrounds. Cards are used for stat tiles and chart panels only, and they sit directly on the page surface, never inside another card.
- Numbers that matter are 36px semibold. Everything the number needs to be read is 13px beside or below it.
- Section labels are 13px medium in `--text-secondary`, sentence case. No uppercase, no letter-spacing tricks.
- Body and table text 13px. Secondary text 12px in `--text-secondary`. Tertiary 11px in `--text-tertiary`. Three levels, no more.
- Table rows 44px. Attention rows 48px because they carry a button.
- Every number is tabular. Money right-aligned. Minutes right-aligned.
- Every capacity indicator shows label and percentage, not color alone.
- Every chart has a caption sentence.
- Every stat number carries a tooltip stating how it is calculated, including the threshold. "At risk: matters with under 60 minutes left on the four-hour clock, or past due."
- Three content zones on desktop. If a fourth zone appears, something moves to a tab or the rail.
- Charts have no titles inside the chart. The title is the section label. Axis text is tertiary. Grid is `--chart-grid`. No legends when the section label already names the series.
- The Money zone carries one line under its label: "Moritz bills flat fees per matter, so the target is fee revenue and matters delivered, not billable hours." That sentence turns the reframe into a visible decision.
- Every chart supports one sentence, and that sentence is rendered as a caption under the chart in 12px secondary text. Revenue: "Revenue is 62 percent of target with 15 days left. On pace for 94 percent." Delivered: "38 matters delivered this week against a plan of 42." If a chart cannot produce a sentence, it is removed.
- Color means state and nothing else. The stat row is monochrome except At risk. The table is monochrome except the capacity fill and the badge. The charts use chart-1 and chart-2 and a gray target line.

---

## 5. Visual identity

**Words from the brief:** trustworthy, premium, Nordic minimalism, pastel.

**The tension.** Three of those words say restraint. One says color. The answer: pastel as tint, never as fill. Color lives in badge backgrounds, capacity fills, the chart area under the line, and the active nav item. Surfaces stay off-white. Text and numbers stay dark slate. That is how pastel reads premium instead of consumer.

**Base.** `--snow-50` page, `--snow-0` cards, `--snow-900` text. Cool, slightly blue neutral. Not cream.

**Accent.** One brand hue, fjord blue, dimmed. It appears on the active nav item, the primary chart line, the info badge, and focus rings. Nowhere else. The primary button is dark slate, not blue, so the accent never competes with actions.

**Status hues.** Sea glass teal for delivered. Dusty amber for review and near-due. Dimmed rowan red for breach. Lilac exists only as chart-3.

**Typography.** Manrope for everything. Geometric, Nordic, slightly rounded, has tabular numerals. One family, weights 400, 500, 600. No serif, no mono. Numbers get `tabular-nums` and a slightly tighter letter-spacing so columns align.

**Radius.** 8px base. Controls 6px. Cards 8px. Badges pill. Nothing above 12px.

**Elevation.** Flat. Hairlines separate. The only shadow is on floating surfaces: command palette, sheets, popovers.

**Motion.** Motion is state change made visible. A row that gets assigned slides out of the attention strip. A number that changes ticks. Stream-in on load for the attention strip only, one sequence, 200ms, respects reduced motion. Nothing hovers, glows, or floats.

**Failure modes to check against before every commit.** Does any pastel sit behind body text (fail: contrast). Does the page read as a consumer app (fail: too much tint). Do the two chart series separate at 12px (fail: hues too close). Is color doing anything other than meaning state (fail: decoration).

**Reference set.** Mercury for calm finance. Linear for the triage inbox and feed. Ramp for density. Nord palette for dimmed pastel discipline. Nothing from Clio or MyCase visually.

---

## 6. AI surfaces

Moritz is an AI-native firm, so AI belongs on this page. It belongs in decisions, not in decoration. Twelve surfaces, each in one of four roles, each answering a question the numbers alone cannot.

### The four roles

| Role | Job | Surfaces |
|---|---|---|
| Ambient | Tells you something you did not ask | Morning brief · Capacity forecast · Money anomaly |
| Inline | Helps at the moment of a decision | Suggested lawyer · Smart triage · Fee suggestion · Slip risk · Draft confidence |
| Generative | Writes something you would have written | Client update · Escalation handoff |
| Conversational | Answers what you ask | Chat panel |

Plus the 80/20 line, which is a number, not a feature.

### Ambient

**A1 · Morning brief.** One line above the four numbers, generated from current state. It connects two or more facts and proposes the single action that resolves the most of them.
> "Two matters are past due and Lars is at 118 percent. Reassigning MOR-1042 to Sofie clears both."

Buttons: the proposed action, and Dismiss. Regenerates when state changes. When the firm is calm it says so in one line and offers nothing: "Nothing at risk. Five matters due in the next hour, all assigned." Component: Card with fjord tint, Button size="sm", Button variant="ghost" for Dismiss.

**A2 · Capacity forecast.** One line above the co-counsel table.
> "At the current intake rate, three lawyers pass capacity by 16:00. Sofie and Catarina have room."

Derived from intake rate over the last 3 hours against remaining capacity. Component: inline text in the zone label row, `--text-secondary`, no card.

**A3 · Money anomaly.** One line under the charts. Fires only when a real deviation exists in the seed.
> "Employment matters are averaging $890 this month against $1,240 firm-wide. Three were quoted below band."

Button: See matters, which filters the table. Component: inline text plus Button variant="link".

### Inline

**I1 · Suggested lawyer.** Assign sheet, top row, Badge "Suggested" plus one-line basis: practice match, lowest load, on-time this week.

**I2 · Smart triage.** An unassigned matter arrives pre-classified: service line, matter type, suggested fee band, all shown as filled fields the human confirms rather than blanks the human completes. The attention row reads "NDA · Commercial · $250 to $600" before anyone touches it. Confidence shown per field where it is below high.

**I3 · Fee suggestion.** On the unquoted matter row.
> "$1,400 suggested. Median for a Series A term sheet across 14 comparable matters."

Editable before Send quote. Component: Input with a suggested value plus Tooltip carrying the basis.

**I4 · Slip risk.** A deadline row that is technically on time but likely to breach gets Badge "Likely to slip", tone watch. Tooltip states the basis: this lawyer's last three matters of this type ran past four hours. This is prediction, not restatement, and it is the one surface that shows the AI knows something the table does not.

**I5 · Draft confidence.** Matters in review carry the AI's confidence in its own draft: "Draft confidence high · 2 clauses flagged." Low confidence sorts the matter higher in the deadline list, because a weak draft costs the lawyer more of the four hours. Component: Badge plus Tooltip.

### Generative

**G1 · Client update.** On any row that has slipped or just delivered, an action opens a right Sheet with a message to the client streaming in.
> "MOR-1042 is running about twenty minutes over. Your revised delivery time is 15:10. The redline is complete and in final review."

The stream lands in an editable field, not a preview box. Stop button during the stream. The human edits inline and sends. This is the JD's streaming plus inline editing plus human-in-the-loop in one flow, and it is real admin work.

**G2 · Escalation handoff.** When a matter escalates, the AI writes the context the receiving lawyer needs: what was drafted, where it stopped, what is unresolved. Shown in the escalation row, expandable. Never an error message, always a handoff.

### Conversational

**C1 · Chat panel.** Trigger: a button in the top bar beside search, plus Cmd+J. Opens a right Sheet 380px wide over the rail. Not a floating bubble, not a bottom-right circle.

Scoped to this firm's data. It answers and it acts. Three suggested prompts on open, generated from current state:
- "Who can take an employment matter in the next hour?"
- "Why is turnaround slower this week?"
- "Show me everything at risk."

Every answer is grounded: it names the rows it used, and where an action follows, the answer ends with that action's button. Ask who has capacity and get three names each with an Assign button. Streaming with a stop control. On failure the stream closes cleanly with a retry, never a hanging skeleton.

Components: Sheet, Command-style input, Button variant="ghost" for prompts, Skeleton while the first token is pending.

### The 80/20 line

In the money zone, under the numbers:
> "Average 2h 51m in AI draft, 1h 04m in lawyer review."

Moritz sells the 80/20 split. This makes it measurable. No other candidate will show it.

### Rules that keep twelve surfaces from reading as a gimmick reel

1. **One visual treatment.** Every AI surface uses a fjord tint background or fjord text. No sparkles, no gradients, no purple, no glow, no separate AI color.
2. **The word AI appears at most twice on the page.** Everywhere else the surface just does its job. "Suggested", not "AI suggested".
3. **Every AI element states its basis or its confidence.** A suggestion without a reason is a guess with better typography.
4. **Nothing acts alone.** Every AI surface proposes; a human confirms. No AI element writes to state without a click.
5. **No second path.** Every action an AI surface offers is the same action that exists in the row below it. The AI is a shortcut, never a parallel product.
6. **Every AI surface degrades.** If it has nothing to say it says nothing, or says the firm is calm. It never fills space to prove it exists.
7. **Failure is designed.** Each generative and conversational surface has its own failure state with a retry. Never a shared error boundary, never an infinite skeleton.

### Build order

| Day | Surfaces |
|---|---|
| 4 | I1 suggested lawyer, I2 smart triage, I3 fee suggestion. Sorting and labels only. |
| 5 morning | A1 morning brief, A2 capacity forecast, A3 money anomaly, the 80/20 line. |
| 5 afternoon | C1 chat panel with streaming and the three grounded prompts. |
| 6 | G1 client update, I4 slip risk, I5 draft confidence, G2 escalation handoff. |

C1 and G1 are the only pieces that can eat a day. If either slips past Thursday night, ship it with a scripted response over real data and say so in the walkthrough. A scripted flow that is honest beats a broken one that is not.

---

## 7. Progressive disclosure

Level one is what Ingrid needs to act. Level two is what she needs to understand. Level three is what she needs to audit.

Every level-one row carries its action inline. Progressive disclosure hides detail, never the action.

| Element | Level one, visible | Level two, one click | Level three, drill |
|---|---|---|---|
| Stat number | The number and its delta | Tooltip: how it is calculated | Click: filtered matter list |
| Attention row | Matter, reason, action | Hover: client, lawyer, minutes | Click: matter detail (not built) |
| Co-counsel row | Name, load bar, next due | Expand: active matters list | Lawyer page (not built) |
| Revenue chart | Line, target, gap | Hover: day value vs plan | Finance page (not built) |
| Activity feed | Today, collapsed after 8 items | Show more | Filter chips |
| Command palette | Hidden | Cmd+K | Groups: Actions, Go to, Recent matters |

Everything collapsed by default opens the section that answers the current question first. On mobile, level one is the whole screen and levels two and three sit behind tabs and sheets.

---

## 8. Data model

Five entities. Derived fields are computed, never stored.

```ts
type ServiceLine = "Commercial" | "Corporate" | "Privacy" | "Employment" | "Real estate" | "Litigation";
type Stage = "submitted" | "quoted" | "drafting" | "review" | "delivered";
type Channel = "email" | "slack" | "platform";

interface Lawyer {
  id: string;
  name: string;
  initials: string;
  practiceAreas: ServiceLine[];
  weeklyCapacity: number;      // matters per week
  weeklyTarget: number;        // matters delivered per week, the per-lawyer target
  // derived: activeMatters, utilizationPct, deliveredThisWeek, status
}

interface Matter {
  id: string;
  reference: string;           // MOR-1042
  clientId: string;
  serviceLine: ServiceLine;
  type: string;                // NDA, MSA, DPA, SAFE, lease, offer letter
  stage: Stage;
  lawyerId: string | null;
  submittedAt: string;         // ISO
  deliveredAt: string | null;
  fee: number;                 // 250 to 2500
  payout: number;              // co-counsel payout, 35 to 55 percent of fee
  channel: Channel;
  // derived: dueAt = submittedAt + 240 min, minutesRemaining, risk: "ok" | "watch" | "breach"
}

interface Client {
  id: string;
  company: string;
  plan: "per-matter" | "enterprise";
  onboardedAt: string;
}

interface ActivityEvent {
  id: string;
  at: string;
  actorId: string | "ai" | "system";
  verb: "submitted" | "quoted" | "assigned" | "drafted" | "delivered" | "escalated" | "onboarded" | "filed" | "meeting";
  matterId: string | null;
  clientId: string | null;
}

interface FinanceDay {
  date: string;
  revenue: number;
  delivered: number;
  plannedDelivered: number;
}

interface FinanceSummary {
  month: string;
  target: number;
  days: FinanceDay[];
  // derived: revenueToDate, avgFee, avgPayout, marginPct, openedVsClosed
}
```

### Seed rules

- 14 lawyers with Nordic and international names. Capacity 6 to 10 matters per week. Two are over 100 percent. Three are between 85 and 100. The rest are under.
- 48 active matters plus 90 delivered in the last 30 days. Fees inside the band. Payout 35 to 55 percent of fee.
- The clock feels live: at the seeded "now", 2 matters are past due, 3 are inside the last hour, 2 are unassigned and arrived within the last 15 minutes, 11 are in review, 20 are drafting.
- 12 clients. Names that sound like real startups. Two on enterprise plans.
- About 120 activity events across the last 7 days, denser today. Include roughly 6 filings and 8 client meetings across the week so the pulse shows the categories the brief names.
- Finance: monthly target $180,000, revenue to date around 62 percent of target on day 15 of the month, so the gap is visible and honest.
- All timestamps are generated relative to a fixed `NOW` constant so the demo behaves identically every load. Export `NOW` from the seed file.

---

## 9. Copy rules

- Sentence case everywhere. No uppercase labels.
- Verbs on buttons: Assign, Reassign, Send quote, New matter, Show more.
- Reasons in plain words: "Past due by 12 min" · "Arrived 8 min ago, no lawyer" · "Julie is at 120 percent".
- Stat labels: In flight · Due next hour · At risk · Unassigned · Revenue to date · Target · Average fee · Margin per matter · Opened vs closed.
- Empty states invite: "No matters at risk. The clock is clear." One line, one button.
- Errors say what happened and what to do: "Couldn't load matters. Retry."
- No exclamation marks. No "successfully". No "please".

---

## 10. Mobile rules (390px)

AI on mobile: the morning brief stays above the stat grid, because it is the fastest read on the page. The chat panel becomes a full-height bottom Sheet. Inline AI badges survive. Capacity forecast and money anomaly move inside their tabs. Client update opens as a full-screen Sheet.

Stacking order: morning brief · stat grid 2 by 2 · attention cards · Tabs (People, Money, Feed). Sidebar becomes a left Sheet. New matter becomes a bottom Sheet from a floating primary button. Charts become one number plus a sparkline. Co-counsel table becomes cards: name, load bar, next due. Deadline list stays a list. Feed stays a feed. Nothing scrolls horizontally. Touch targets 44px.

---

## 11. Stated assumptions

Said out loud in the walkthrough and printed on the /system page. Stating them is stronger than pretending they are facts.

- Moritz's internal admin workflows and data model were not available. Capacity thresholds (85 and 100 percent), the four-hour SLA window with a 60-minute watch band, the $180,000 monthly target, and the co-counsel payout range (35 to 55 percent of fee) are prototype assumptions.
- The persona is inferred from the operating model: contracted co-counsel, flat fees, hour-scale turnaround. If the real administrator is a managing partner, margin moves above throughput. If the real firm invoices on terms, AR aging joins Zone 3.
- Event categories in the feed are inferred from the public matter flow: submitted, quoted, assigned, drafted, delivered, escalated, onboarded, plus filed and meeting from the brief.
- The build uses the real shadcn/ui components in code. Every component on the page maps one to one to an Obra Shadcn UI Kit component; the /system page names the pairs, and the finished screens are exported to a Figma file alongside the Obra kit for reviewers who work in Figma.
- In a real engagement these are the first things validated with the operations lead and two co-counsel, before any threshold is changed in the tokens.

---

## 12. Done criteria

- Two-second test passes on desktop and mobile.
- Every component on the page appears on the /system page with its variant name.
- No hex or oklch literal outside Tier 1 of globals.css.
- Every number is tabular.
- Every capacity indicator shows label and percentage, not color alone.
- Every chart has a caption sentence, and no chart carries a legend.
- Assign sheet marks a suggested lawyer with a reason.
- Every stat number has a tooltip stating its calculation and threshold.
- Contrast 4.5 to 1 on all text, 3 to 1 on all UI borders and fills that carry meaning.
- The busy state is the default. Screenshot it and ask whether it reads calm. If not, the fix is hierarchy, not less data.
- No red wash. Count the red pixels: badges and one number only.
- All three zones pass the balance check.
- Keyboard reaches every action. Focus is visible.
- Assign, Reassign, Nudge, and Send quote all change state. No dead buttons.
- Every row that states a problem offers an action in the same row.
- Loading, empty, and error states exist for every zone.
- Reduced motion respected.
- Every AI surface states a basis or a confidence.
- No AI surface writes to state without a human click.
- Every AI surface has a quiet state and a failure state.
- The word AI appears at most twice on the page.