# Moritz design system

How this app satisfies the two brief rules: follow shadcn/ui principles, and use the Obra Shadcn UI Kit for component consistency. Written for a reviewer who wants evidence rather than a claim.

## 1. How the identity works

Every component on this page is stock shadcn on Radix. Nothing is forked. The primitives live under `components/ui/` as generated shadcn files. App composites compose those primitives. They do not reimplement them.

The visual identity comes entirely from the token layer in `app/globals.css`: a cool snow neutral instead of the default grey, Manrope instead of Inter, one dimmed sea teal (fjord) as the single brand hue, pastel confined to tint stops, flat surfaces with hairlines instead of shadows, and blur reserved for the four surfaces that genuinely float. Change the tokens and the whole app reskins without touching a component.

## 2. The three tiers

Colour is organised in three tiers. Each tier may only alias the tier above it. No tier may skip a level. No colour literal (`oklch`, hex, rgb, hsl, or a Tailwind palette class) exists outside Tier 1.

| Tier | Role | Example | Definition |
|---|---|---|---|
| 1 · Primitive | Raw value, no product meaning | `--fjord-500` | `oklch(0.618 0.104 177)` |
| 2 · Semantic | shadcn or status name that aliases a primitive | `--status-risk-fg` | `var(--rowan-700)` |
| 3 · Mapped | Component token that aliases a semantic | `--stat-risk-color` | `var(--status-risk-fg)` |

The same chain appears on capacity fills: `--fjord-400` to `--status-ok-fill` to `--capacity-fill-ok`. A mapped token such as `--capacity-fill-over` must alias a semantic status fill, never a Tier 1 stop.

This is enforced by an ESLint `no-restricted-syntax` rule in `eslint.config.mjs`, not by convention. The rule flags colour literals in `components/` and `app/` (excluding `components/ui/`) so a hex or `oklch()` in JSX fails the lint.

## 3. Component map

Built from the imports in the composite files, not from memory. Obra column names the kit component a Figma reviewer should look up alongside each composite.

| Our component | shadcn primitives it composes | Obra kit component |
|---|---|---|
| Stat strip | `Card`, `Tooltip`, `Skeleton` | Card, Tooltip, Skeleton |
| Morning brief | `Card`, `Button` | Card, Button |
| Attention row | `Card`, `Button`, `Skeleton`, `Tooltip`, `StatusBadge` → `Badge` | Card, Button, Skeleton, Tooltip, Badge |
| Status badge | `Badge` | Badge |
| Capacity meter | `Progress` | Progress |
| Deadline list | `Card`, `Table`, `Button`, `Skeleton`, `Tooltip`, `StatusBadge` → `Badge`, `MinutesLeft` | Card, Table, Button, Skeleton, Tooltip, Badge |
| Matters table | `Card`, `Table`, `Button`, `Skeleton`, `StatusBadge` → `Badge`, `MinutesLeft` | Card, Table, Button, Skeleton, Badge |
| Money strip | `Card`, `Skeleton` | Card, Skeleton |
| Pulse chips | `ToggleGroup`, `ToggleGroupItem` | Toggle Group |
| Feed item | `Tooltip` | Tooltip |
| Assign sheet | `Sheet`, `Button`, `Skeleton`, `StatusBadge` → `Badge`, `CapacityMeter` → `Progress` | Sheet, Button, Skeleton, Badge, Progress |
| Quote sheet | `Sheet`, `Button`, `Input` | Sheet, Button, Input |
| New matter sheet | `Sheet`, `Button`, `Input`, `Select` | Sheet, Button, Input, Select |
| Command palette | `CommandDialog`, `CommandInput`, `CommandList`, `CommandGroup`, `CommandItem`, `CommandEmpty`, `Dialog` | Command, Dialog |
| Chat panel | `Sheet`, `Textarea`, `Button` | Sheet, Textarea, Button |
| Client update sheet | `Sheet`, `Button`, Tiptap editor | Sheet, Button |
| User menu | `DropdownMenu`, `Button`, `Avatar` | Dropdown Menu, Button, Avatar |
| Lawyer card | `Card`, `Button`, `Tooltip`, `StatusBadge` → `Badge`, `CapacityMeter` → `Progress`, `MinutesLeft` | Card, Button, Tooltip, Badge, Progress |

## 4. Variants in use

Read from call sites in `components/` (and the sheet or dialog close buttons that ship inside the shadcn primitives).

| Component | Variants used | Sizes used |
|---|---|---|
| Button | `default`, `outline`, `ghost`, `link` | `default`, `sm`, `icon`, `icon-sm` |
| Badge | `outline` | (none; height comes from the Badge base styles) |
| Alert | `destructive` | (none) |
| Tabs (`TabsList`) | `line` | (none) |
| Avatar | (default variant) | `sm` |
| Sidebar | `inset` | collapsible `icon` |
| ToggleGroup | default (no `variant` prop) | default; `spacing={0}` with pill classNames on items |
| Select (`SelectTrigger`) | (default) | default (`h-8`) |
| Sheet | (default) | side from `useSheetSide` (`right` or `bottom`) |
| Progress | (default) | track size from mapped capacity tokens |
| Card, Table, Input, Textarea, Skeleton, Tooltip, Command, DropdownMenu | default only | default only |

## 5. Floating surfaces

The four surfaces that use the glass tokens (`--glass-bg`, `--glass-border`, `--glass-blur`, `--glass-inset`, `--glass-shadow`) are:

1. Command palette
2. Assign sheet
3. Chat panel
4. Client update sheet

No dashboard surface uses blur. Blur behind a table degrades text contrast and tabular numbers lose their edge, so glass is a material for things that float rather than a decoration for things that do not. Sheet and dialog overlays use `--overlay-bg` without backdrop blur.

## 6. Stated assumptions

Moritz's internal admin workflows were not public, so the persona, the thresholds, and the model of the work are inferred from their published operating model. Said out loud:

- Capacity bands at 80 percent (watch) and 100 percent (over)
- A four hour SLA, with a 60 minute watch window and a 20 minute attention window
- A $180,000 monthly revenue target
- A 35 to 55 percent co-counsel payout range on flat fees
- Nine feed event types: submitted, quoted, assigned, drafted, delivered, escalated, onboarded, filed, meeting

In a real engagement these would be validated with the operations lead and two co-counsel before any threshold moved.

## 7. The metric reframe

Practice management tools build their dashboards on utilization, realization and collection rate, which are billable-hour metrics. Moritz bills flat fees per matter and pays contracted co-counsel per matter, so those numbers do not apply. Utilization became concurrent capacity, realization became margin per matter, and the billable target became matters delivered against a weekly target. This reframe is printed on the page itself, in the Money zone meta line (`flat fees per matter, not billable hours`) and in the per-lawyer tooltip on the capacity table (`the target is matters delivered, not billable hours`), so it reads as a decision rather than an omission.

## 8. Accessibility

Tested end to end against **WCAG 2.2 Level AA**.

| Area | What was tested | Standard |
|---|---|---|
| Keyboard | Full-page Tab order; sidebar collapse/expand via Toggle Sidebar; Cmd/Ctrl+K palette open and Escape close; sheet focus trap with return to the trigger on close (Radix Dialog); mobile People/Money/Pulse tabs (arrow keys via Radix Tabs); Pulse ToggleGroup chips (arrow keys); table row actions always in the tab order (never hover-only) | 2.1.1 Keyboard, 2.1.2 No Keyboard Trap, 2.4.3 Focus Order, 2.4.7 Focus Visible |
| Contrast | `--text-tertiary` / `--muted-foreground` on `--card`; status badge text on tinted backgrounds (five tones); chart axis (`--chart-axis-text`); money-strip 11px sub lines; all of the above in dark mode. Failures were fixed by adjusting tokens (including `--snow-500` and status border aliases), not one-off classes | 1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast for status borders |
| Semantics | Landmarks: `nav` (Primary), `main`, `aside` (Pulse rail), `header`. Headings: page `h1` (sr-only from the top bar), then zone `h2`s with no skipped levels. Tabbed zones keep an `sr-only` `h2` so the outline stays intact | 1.3.1 Info and Relationships, 2.4.1 Bypass Blocks, 2.4.6 Headings and Labels |
| Names | Icon-only controls named; charts `role="img"` + `aria-label`; capacity `role="meter"` with min/now/max; inputs labelled (not placeholder-only); chat answer `aria-live="polite"`; toasts via Sonner; no `assertive` live regions | 4.1.2 Name, Role, Value, 4.1.3 Status Messages |
| Motion | Framer Motion uses `useReducedMotion`; streaming draft fade respects reduced motion; global CSS collapses animation/transition/scroll-behavior under `prefers-reduced-motion` | 2.3.3 Animation from Interactions |

## 9. Colour literals

Colour literals are prevented by an **ESLint rule**, not by convention. `eslint.config.mjs` applies `no-restricted-syntax` to `components/**` and `app/**` (excluding `components/ui/`) and rejects hex, `rgb(`, `hsl(`, `oklch(`, and Tailwind palette utilities such as `bg-red-500`. Tier 1 tokens in `app/globals.css` are the only place raw colour may appear; product code must reference CSS variables.
