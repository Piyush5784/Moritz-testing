"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, ChevronRight, Plus, Search } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CapacityMeter } from "@/components/ui-bits/capacity-meter";
import { StatusBadge } from "@/components/ui-bits/status-badge";
import { cn } from "cn";

/** Alias chains from globals.css. Names only; colour comes from the mapped token. */
const TOKEN_CHAINS = [
  {
    mapped: "--capacity-fill-over",
    semantic: "--status-watch-fill",
    primitive: "--ember-500",
  },
  {
    mapped: "--badge-delivered-bg",
    semantic: "--status-ok-bg",
    primitive: "--fjord-50",
  },
  {
    mapped: "--nav-active-bg",
    semantic: "--sidebar-accent",
    primitive: "--fjord-100",
  },
  {
    mapped: "--chart-revenue-line",
    semantic: "--chart-1",
    primitive: "--fjord-500",
  },
] as const;

const SNOW_STOPS = [
  "0",
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
] as const;
const FJORD_STOPS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
] as const;
const EMBER_STOPS = ["100", "200", "300", "500", "700"] as const;
const ROWAN_STOPS = ["100", "200", "300", "400", "500", "700"] as const;

const STATUS_TONES = [
  { tone: "ok" as const, label: "Delivered", meaning: "On time, complete" },
  { tone: "watch" as const, label: "Near due", meaning: "Under an hour left" },
  { tone: "risk" as const, label: "Breached", meaning: "Past due" },
  {
    tone: "info" as const,
    label: "In progress",
    meaning: "Active, not urgent",
  },
  { tone: "neutral" as const, label: "Draft", meaning: "Unclassified / quiet" },
];

const COMPOSITES = [
  {
    ours: "Stat strip",
    shadcn: "Card, Tooltip, Skeleton",
    obra: "Card, Tooltip, Skeleton",
  },
  {
    ours: "Morning brief",
    shadcn: "Card, Button",
    obra: "Card, Button",
  },
  {
    ours: "Attention row",
    shadcn: "Card, Button, Skeleton, Tooltip, StatusBadge → Badge",
    obra: "Card, Button, Skeleton, Tooltip, Badge",
  },
  {
    ours: "Capacity meter",
    shadcn: "Progress, StatusBadge → Badge",
    obra: "Progress, Badge",
  },
  {
    ours: "Deadline list",
    shadcn: "Card, Table, Button, Skeleton, Tooltip, StatusBadge → Badge",
    obra: "Card, Table, Button, Skeleton, Tooltip, Badge",
  },
  {
    ours: "Money strip",
    shadcn: "Card, Skeleton",
    obra: "Card, Skeleton",
  },
  {
    ours: "Pulse chips",
    shadcn: "ToggleGroup, ToggleGroupItem",
    obra: "Toggle Group",
  },
  {
    ours: "Feed item",
    shadcn: "Tooltip",
    obra: "Tooltip",
  },
  {
    ours: "Assign sheet",
    shadcn: "Sheet, Button, Skeleton, StatusBadge → Badge, CapacityMeter → Progress",
    obra: "Sheet, Button, Skeleton, Badge, Progress",
  },
  {
    ours: "Quote sheet",
    shadcn: "Sheet, Button, Input",
    obra: "Sheet, Button, Input",
  },
  {
    ours: "Chat panel",
    shadcn: "Sheet, Textarea, Button",
    obra: "Sheet, Textarea, Button",
  },
  {
    ours: "Client update sheet",
    shadcn: "Sheet, Button, Tiptap editor",
    obra: "Sheet, Button",
  },
  {
    ours: "Command palette",
    shadcn:
      "CommandDialog, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty, Dialog",
    obra: "Command, Dialog",
  },
  {
    ours: "Lawyer card",
    shadcn:
      "Card, Button, Tooltip, StatusBadge → Badge, CapacityMeter → Progress, MinutesLeft",
    obra: "Card, Button, Tooltip, Badge, Progress",
  },
] as const;

const TYPE_SCALE = [
  {
    size: "34",
    weight: "600",
    weightLabel: "semibold",
    use: "Stat values",
    css: "var(--text-34)",
  },
  {
    size: "20",
    weight: "600",
    weightLabel: "semibold",
    use: "Money strip values",
    css: "var(--text-20)",
  },
  {
    size: "14",
    weight: "600",
    weightLabel: "semibold",
    use: "Zone labels",
    css: "var(--text-14)",
  },
  {
    size: "13",
    weight: "400",
    weightLabel: "regular",
    use: "Body and primary row text",
    css: "var(--text-13)",
  },
  {
    size: "12",
    weight: "400",
    weightLabel: "regular",
    use: "Secondary text",
    css: "var(--text-12)",
  },
  {
    size: "11",
    weight: "500",
    weightLabel: "medium",
    use: "Tertiary and labels",
    css: "var(--text-11)",
  },
] as const;

const A11Y_ITEMS = [
  {
    title: "Keyboard",
    detail:
      "Full-page Tab order, sidebar toggle, Cmd/Ctrl+K palette with Escape close, sheet focus trap, tabs and Pulse chips via arrow keys, table actions always in the tab order.",
    standard: "2.1.1, 2.1.2, 2.4.3, 2.4.7",
  },
  {
    title: "Contrast",
    detail:
      "WCAG 2.2 AA on every pairing in light and dark, including tertiary text, status badges, chart axis, and money-strip sub lines. Failures fixed at the token layer.",
    standard: "1.4.3, 1.4.11",
  },
  {
    title: "Semantics",
    detail:
      "Landmarks for nav, main, aside, and header. Page h1 then zone h2s with no skipped levels. Tabbed zones keep an sr-only h2.",
    standard: "1.3.1, 2.4.1, 2.4.6",
  },
  {
    title: "Names and live regions",
    detail:
      "Icon-only controls named, charts role=img with aria-label, capacity role=meter, labelled inputs, chat aria-live=polite, toasts via Sonner.",
    standard: "4.1.2, 4.1.3",
  },
  {
    title: "Motion",
    detail:
      "Framer Motion respects useReducedMotion. Global CSS collapses animation under prefers-reduced-motion.",
    standard: "2.3.3",
  },
] as const;

function readCssVar(name: string) {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

function resolveColor(varName: string) {
  let current = varName;
  for (let i = 0; i < 12; i++) {
    const value = readCssVar(current);
    if (!value) return "";
    if (value.startsWith("var(")) {
      const match = value.match(/var\(\s*(--[\w-]+)/);
      if (!match) return value;
      current = match[1];
      continue;
    }
    return value;
  }
  return "";
}

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-8" aria-labelledby={`section-${number}`}>
      <h2
        id={`section-${number}`}
        className="font-semibold text-foreground"
        style={{ fontSize: "var(--text-14)", marginBottom: "12px" }}
      >
        <span className="num text-text-tertiary">{number}.</span> {title}
      </h2>
      {children}
    </section>
  );
}

function Caption({ shadcn, obra }: { shadcn: string; obra: string }) {
  return (
    <div className="mt-3 space-y-1">
      <p className="text-text-secondary" style={{ fontSize: "var(--text-12)" }}>
        <code className="font-medium text-foreground">{shadcn}</code>
      </p>
      <p className="text-text-tertiary" style={{ fontSize: "var(--text-11)" }}>
        Obra: {obra}
      </p>
    </div>
  );
}

function Swatch({
  varName,
  label,
}: {
  varName: string;
  label: string;
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const update = () => setValue(resolveColor(varName) || readCssVar(varName));
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [varName]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="flex min-w-0 flex-1 flex-col gap-2 text-left"
        >
          <span
            className="block h-10 w-full rounded-md ring-1 ring-border"
            style={{ background: `var(${varName})` }}
            aria-hidden
          />
          <span
            className="truncate text-text-tertiary"
            style={{ fontSize: "var(--text-11)" }}
          >
            {label}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <span className="font-medium">{varName}</span>
        <br />
        {value || "Unresolved"}
      </TooltipContent>
    </Tooltip>
  );
}

function Ramp({
  name,
  prefix,
  stops,
}: {
  name: string;
  prefix: string;
  stops: readonly string[];
}) {
  return (
    <div className="space-y-2">
      <p
        className="font-medium text-text-secondary"
        style={{ fontSize: "var(--text-12)" }}
      >
        {name}
      </p>
      <div className="flex gap-2">
        {stops.map((stop) => (
          <Swatch
            key={`${prefix}-${stop}`}
            varName={`--${prefix}-${stop}`}
            label={stop}
          />
        ))}
      </div>
    </div>
  );
}

function TokenChainRow({
  mapped,
  semantic,
  primitive,
}: {
  mapped: string;
  semantic: string;
  primitive: string;
}) {
  const [resolvedPrimitive, setResolvedPrimitive] = useState(primitive);

  useEffect(() => {
    const update = () => {
      let current = mapped;
      let last = primitive;
      for (let i = 0; i < 12; i++) {
        const value = readCssVar(current);
        if (!value) break;
        if (value.startsWith("var(")) {
          const match = value.match(/var\(\s*(--[\w-]+)/);
          if (!match) break;
          current = match[1];
          last = current;
          continue;
        }
        break;
      }
      setResolvedPrimitive(last);
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [mapped, primitive]);

  return (
    <div
      className="grid grid-cols-[minmax(0,1.2fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-2 py-2"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <code
        className="truncate font-medium text-foreground"
        style={{ fontSize: "var(--text-12)" }}
      >
        {mapped}
      </code>
      <ChevronRight
        className="size-3 shrink-0 text-text-tertiary"
        aria-hidden
      />
      <code
        className="truncate text-text-secondary"
        style={{ fontSize: "var(--text-12)" }}
      >
        {semantic}
      </code>
      <ChevronRight
        className="size-3 shrink-0 text-text-tertiary"
        aria-hidden
      />
      <code
        className="truncate text-text-secondary"
        style={{ fontSize: "var(--text-12)" }}
      >
        {resolvedPrimitive}
      </code>
      <span
        className="size-6 shrink-0 rounded-md ring-1 ring-border"
        style={{ background: `var(${mapped})` }}
        title={mapped}
        aria-label={`Swatch for ${mapped}`}
      />
    </div>
  );
}

function MotionDemos() {
  const reduceMotion = useReducedMotion();
  const [rowKey, setRowKey] = useState(0);
  const [rowVisible, setRowVisible] = useState(true);
  const [tick, setTick] = useState(48);
  const [streamKey, setStreamKey] = useState(0);

  const replayRow = () => {
    setRowVisible(false);
    window.setTimeout(() => {
      setRowKey((k) => k + 1);
      setRowVisible(true);
    }, reduceMotion ? 0 : 220);
  };

  const replayTick = () => setTick((n) => n + 1);

  const replayStream = () => setStreamKey((k) => k + 1);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p
            className="font-medium text-text-secondary"
            style={{ fontSize: "var(--text-12)" }}
          >
            Row exit
          </p>
          <Button type="button" size="sm" variant="outline" onClick={replayRow}>
            Replay
          </Button>
        </div>
        <Card className="gap-0 overflow-hidden rounded-lg py-0 [--card-spacing:0px]">
          <AnimatePresence initial={false}>
            {rowVisible ? (
              <motion.div
                key={rowKey}
                initial={false}
                exit={
                  reduceMotion
                    ? undefined
                    : { opacity: 0, height: 0, overflow: "hidden" }
                }
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="px-4 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <StatusBadge tone="watch">18m left</StatusBadge>
                  <span
                    className="font-semibold text-foreground"
                    style={{ fontSize: "var(--text-13)" }}
                  >
                    MOR-1040
                  </span>
                </div>
                <p
                  className="text-text-secondary"
                  style={{ fontSize: "var(--text-12)" }}
                >
                  Northwind Systems · MSA review
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </Card>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p
            className="font-medium text-text-secondary"
            style={{ fontSize: "var(--text-12)" }}
          >
            Number tick
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={replayTick}
          >
            Replay
          </Button>
        </div>
        <Card className="rounded-lg p-4 [--card-spacing:0px]">
          <p
            className="text-text-secondary"
            style={{ fontSize: "var(--text-12)" }}
          >
            In flight
          </p>
          <motion.span
            key={tick}
            data-stat
            className="inline-block"
            initial={reduceMotion ? false : { opacity: 0.35 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {tick}
          </motion.span>
        </Card>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p
            className="font-medium text-text-secondary"
            style={{ fontSize: "var(--text-12)" }}
          >
            Stream fade
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={replayStream}
          >
            Replay
          </Button>
        </div>
        <Card className="rounded-lg p-4 [--card-spacing:0px]">
          <motion.p
            key={streamKey}
            className="text-foreground"
            style={{ fontSize: "var(--text-13)" }}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            Draft update for Northwind Systems. The MSA review slipped past the
            four hour clock. We are reassigning to clear the breach.
          </motion.p>
        </Card>
      </div>
    </div>
  );
}

function ComponentGroups() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [pulseFilter, setPulseFilter] = useState("all");

  return (
    <div className="space-y-10">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="default">
            Default
          </Button>
          <Button type="button" variant="outline">
            Outline
          </Button>
          <Button type="button" variant="ghost">
            Ghost
          </Button>
          <Button type="button" variant="link">
            Link
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button type="button" size="default">
            Default
          </Button>
          <Button type="button" size="sm">
            Small
          </Button>
          <Button type="button" size="icon" aria-label="Add">
            <Plus className="size-4" />
          </Button>
          <Button type="button" size="icon-sm" aria-label="Search">
            <Search className="size-3.5" />
          </Button>
        </div>
        <Caption
          shadcn='@/components/ui/button'
          obra="Button"
        />
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          {STATUS_TONES.map((t) => (
            <StatusBadge key={t.tone} tone={t.tone}>
              {t.label}
            </StatusBadge>
          ))}
        </div>
        <Caption shadcn="@/components/ui-bits/status-badge → ui/badge" obra="Badge" />
      </div>

      <div>
        <Card className="rounded-lg p-4 [--card-spacing:0px]">
          <p
            className="font-semibold text-foreground"
            style={{ fontSize: "var(--text-13)" }}
          >
            Card surface
          </p>
          <p
            className="mt-1 text-text-secondary"
            style={{ fontSize: "var(--text-12)" }}
          >
            Flat white on snow, hairline ring, no elevation.
          </p>
        </Card>
        <Caption shadcn="@/components/ui/card" obra="Card" />
      </div>

      <div>
        <Card className="gap-0 rounded-lg py-0 [--card-spacing:0px]">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead
                  className="h-auto px-4 py-2.5 font-medium text-text-tertiary"
                  style={{ fontSize: "var(--text-11)" }}
                >
                  Matter
                </TableHead>
                <TableHead
                  className="h-auto px-4 py-2.5 text-right font-medium text-text-tertiary"
                  style={{ fontSize: "var(--text-11)" }}
                >
                  Left
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { ref: "MOR-1042", left: "-14m" },
                { ref: "MOR-1038", left: "-6m" },
                { ref: "MOR-1040", left: "41m" },
              ].map((row, i) => (
                <TableRow
                  key={row.ref}
                  className="border-0 hover:bg-surface-hover"
                  style={{
                    borderBottom:
                      i < 2 ? "1px solid var(--table-inner-line)" : undefined,
                  }}
                >
                  <TableCell
                    className="px-4 py-2.5 font-semibold text-foreground"
                    style={{ fontSize: "var(--text-13)" }}
                  >
                    {row.ref}
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-right">
                    <span className="num text-text-secondary">{row.left}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <Caption shadcn="@/components/ui/table" obra="Table" />
      </div>

      <div>
        <div className="space-y-4">
          <CapacityMeter
            pct={55}
            state="room"
            label="Room"
            name="Example"
          />
          <CapacityMeter
            pct={85}
            state="high"
            label="High"
            name="Example"
          />
          <CapacityMeter
            pct={112}
            state="over"
            label="Over capacity"
            name="Example"
          />
        </div>
        <Caption
          shadcn="@/components/ui-bits/capacity-meter → ui/progress"
          obra="Progress"
        />
      </div>

      <div>
        <Tabs defaultValue="people" className="gap-3">
          <TabsList variant="line" className="h-auto gap-0 rounded-none border-b border-border bg-transparent p-0">
            <TabsTrigger
              value="people"
              className="rounded-none px-3 py-2"
              style={{ fontSize: "var(--text-13)" }}
            >
              People
            </TabsTrigger>
            <TabsTrigger
              value="money"
              className="rounded-none px-3 py-2"
              style={{ fontSize: "var(--text-13)" }}
            >
              Money
            </TabsTrigger>
            <TabsTrigger
              value="pulse"
              className="rounded-none px-3 py-2"
              style={{ fontSize: "var(--text-13)" }}
            >
              Pulse
            </TabsTrigger>
          </TabsList>
          <TabsContent value="people" className="mt-3">
            <p className="text-text-secondary" style={{ fontSize: "var(--text-12)" }}>
              People zone content.
            </p>
          </TabsContent>
          <TabsContent value="money" className="mt-3">
            <p className="text-text-secondary" style={{ fontSize: "var(--text-12)" }}>
              Money zone content.
            </p>
          </TabsContent>
          <TabsContent value="pulse" className="mt-3">
            <p className="text-text-secondary" style={{ fontSize: "var(--text-12)" }}>
              Pulse zone content.
            </p>
          </TabsContent>
        </Tabs>
        <Caption shadcn="@/components/ui/tabs" obra="Tabs" />
      </div>

      <div>
        <ToggleGroup
          type="single"
          value={pulseFilter}
          onValueChange={(value) => {
            if (value) setPulseFilter(value);
          }}
          className="flex flex-wrap justify-start gap-2"
          spacing={0}
        >
          {["All", "Submitted", "Assigned", "Delivered"].map((label) => (
            <ToggleGroupItem
              key={label}
              value={label.toLowerCase()}
              className={cn(
                "h-6 shrink-0 rounded-md border border-border bg-card px-2.5 font-normal text-text-secondary shadow-none",
                "group-data-[spacing=0]/toggle-group:rounded-md",
                "hover:bg-surface-hover hover:text-text-secondary",
                "data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              )}
              style={{ fontSize: "var(--text-11)" }}
            >
              {label} <span className="num ml-1">4</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Caption shadcn="@/components/ui/toggle-group" obra="Toggle Group" />
      </div>

      <div>
        <Avatar size="sm">
          <AvatarFallback
            className="font-medium"
            style={{ fontSize: "var(--text-11)" }}
          >
            IS
          </AvatarFallback>
        </Avatar>
        <Caption shadcn="@/components/ui/avatar" obra="Avatar" />
      </div>

      <div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" size="sm" variant="outline">
              Hover for tooltip
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Matters delivered this week against their weekly target.
          </TooltipContent>
        </Tooltip>
        <Caption shadcn="@/components/ui/tooltip" obra="Tooltip" />
      </div>

      <div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-full max-w-sm" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Caption shadcn="@/components/ui/skeleton" obra="Skeleton" />
      </div>

      <div>
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Couldn&apos;t load the firm overview.</AlertTitle>
          <AlertDescription>
            Check the connection and try again.
          </AlertDescription>
        </Alert>
        <Caption shadcn="@/components/ui/alert" obra="Alert" />
      </div>

      <div>
        <Select defaultValue="commercial">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Service line" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="commercial">Commercial</SelectItem>
            <SelectItem value="employment">Employment</SelectItem>
            <SelectItem value="ip">IP</SelectItem>
          </SelectContent>
        </Select>
        <Caption shadcn="@/components/ui/select" obra="Select" />
      </div>

      <div>
        <Input
          className="max-w-sm"
          placeholder="Client name"
          defaultValue="Northwind Systems"
          aria-label="Client name"
        />
        <Caption shadcn="@/components/ui/input" obra="Input" />
      </div>

      <div>
        <Textarea
          className="max-w-sm"
          placeholder="Ask about capacity or deadlines"
          rows={3}
          aria-label="Ask"
        />
        <Caption shadcn="@/components/ui/textarea" obra="Textarea" />
      </div>

      <div>
        <Separator />
        <Caption shadcn="@/components/ui/separator" obra="Separator" />
      </div>

      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Moritz</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Design system</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Caption shadcn="@/components/ui/breadcrumb" obra="Breadcrumb" />
      </div>

      <div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setSheetOpen(true)}
          >
            Open sheet
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setCommandOpen(true)}
          >
            Open command
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" size="sm" variant="outline">
                Open menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Assign</DropdownMenuItem>
              <DropdownMenuItem>Nudge lawyer</DropdownMenuItem>
              <DropdownMenuItem>Update client</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Caption
          shadcn="@/components/ui/sheet · ui/command · ui/dropdown-menu"
          obra="Sheet, Command, Dropdown Menu"
        />

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent
            side="right"
            style={{
              background: "var(--glass-bg)",
              borderColor: "var(--glass-border)",
              boxShadow: "var(--glass-shadow)",
            }}
          >
            <SheetHeader>
              <SheetTitle>Assign matter</SheetTitle>
              <SheetDescription>
                Example floating sheet with the glass tokens.
              </SheetDescription>
            </SheetHeader>
            <div className="px-5 pb-5">
              <p
                className="text-text-secondary"
                style={{ fontSize: "var(--text-13)" }}
              >
                A solid opaque panel, same as every other floating surface.
                Dashboard tables never use it.
              </p>
            </div>
          </SheetContent>
        </Sheet>

        <CommandDialog
          open={commandOpen}
          onOpenChange={setCommandOpen}
          title="Command palette"
          description="Jump to a matter or action"
          className="overflow-hidden border-0 bg-transparent p-0 shadow-none sm:max-w-lg"
        >
          <div
            className="overflow-hidden rounded-xl"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              boxShadow: "var(--glass-shadow)",
            }}
          >
            <Command className="rounded-xl! bg-transparent">
              <CommandInput placeholder="Search matters, lawyers, clients" />
              <CommandList>
                <CommandEmpty>No results.</CommandEmpty>
                <CommandGroup heading="Pages">
                  <CommandItem onSelect={() => setCommandOpen(false)}>
                    Overview
                  </CommandItem>
                  <CommandItem onSelect={() => setCommandOpen(false)}>
                    Matters
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </CommandDialog>
      </div>
    </div>
  );
}

export function SystemReference() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header
        className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm"
      >
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-8 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="font-medium text-text-secondary hover:text-foreground"
              style={{ fontSize: "var(--text-12)" }}
            >
              Back to overview
            </Link>
            <span className="text-text-tertiary" aria-hidden>
              ·
            </span>
            <span
              className="truncate text-text-tertiary"
              style={{ fontSize: "var(--text-11)" }}
            >
              Reference only
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-8 py-12">
        <header className="mb-12">
          <h1
            className="font-semibold text-foreground"
            style={{ fontSize: "var(--text-20)" }}
          >
            Design system
          </h1>
          <p
            className="mt-3 max-w-[62ch] text-text-secondary"
            style={{ fontSize: "var(--text-13)" }}
          >
            Every component on the dashboard is stock shadcn/ui on Radix.
            Nothing is forked. The identity comes entirely from the token layer,
            so changing a primitive reskins the whole product.
          </p>
          <p
            className="mt-2 text-text-tertiary"
            style={{ fontSize: "var(--text-11)" }}
          >
            This page is a reference, not part of the product. The dashboard is
            a single page.
          </p>
        </header>

        <div className="space-y-12">
          <Section number={1} title="The three tiers">
            <div>
              {TOKEN_CHAINS.map((chain) => (
                <TokenChainRow key={chain.mapped} {...chain} />
              ))}
            </div>
            <p
              className="mt-4 text-text-secondary"
              style={{ fontSize: "var(--text-13)" }}
            >
              No tier skips a level, and no colour literal exists outside Tier
              1. Enforced by an ESLint rule in{" "}
              <code className="text-foreground">eslint.config.mjs</code>, not by
              convention.
            </p>
          </Section>

          <Section number={2} title="Colour">
            <div className="space-y-6">
              <Ramp name="Snow" prefix="snow" stops={SNOW_STOPS} />
              <Ramp name="Fjord" prefix="fjord" stops={FJORD_STOPS} />
              <Ramp name="Ember" prefix="ember" stops={EMBER_STOPS} />
              <Ramp name="Rowan" prefix="rowan" stops={ROWAN_STOPS} />
            </div>
            <div className="mt-8 space-y-3">
              <p
                className="font-medium text-text-secondary"
                style={{ fontSize: "var(--text-12)" }}
              >
                Status
              </p>
              <div className="flex flex-wrap gap-4">
                {STATUS_TONES.map((t) => (
                  <div key={t.tone} className="flex flex-col gap-2">
                    <StatusBadge tone={t.tone}>{t.label}</StatusBadge>
                    <span
                      className="text-text-tertiary"
                      style={{ fontSize: "var(--text-11)" }}
                    >
                      {t.meaning}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p
              className="mt-4 text-text-secondary"
              style={{ fontSize: "var(--text-13)" }}
            >
              Colour only ever means state. The only red on the dashboard is the
              at-risk number and the breach badges.
            </p>
          </Section>

          <Section number={3} title="Type">
            <p
              className="mb-4 text-text-secondary"
              style={{ fontSize: "var(--text-13)" }}
            >
              Manrope, three weights: 400, 500, 600.
            </p>
            <div className="space-y-4">
              {TYPE_SCALE.map((row) => (
                <div
                  key={row.size}
                  className="grid grid-cols-[4rem_1fr] items-baseline gap-4"
                >
                  <span
                    className="num text-text-tertiary"
                    style={{ fontSize: "var(--text-11)" }}
                  >
                    {row.size}
                  </span>
                  <div>
                    <p
                      className="text-foreground"
                      style={{
                        fontSize: row.css,
                        fontWeight: row.weight,
                        lineHeight: 1.2,
                      }}
                    >
                      The quick brown fox
                    </p>
                    <p
                      className="mt-1 text-text-tertiary"
                      style={{ fontSize: "var(--text-11)" }}
                    >
                      {row.size}px {row.weightLabel}, {row.use}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <p
                className="mb-3 text-text-secondary"
                style={{ fontSize: "var(--text-13)" }}
              >
                Every number is tabular. Without{" "}
                <code className="text-foreground">num</code>, columns drift.
              </p>
              <div className="grid max-w-sm grid-cols-2 gap-8">
                <div>
                  <p
                    className="mb-2 text-text-tertiary"
                    style={{ fontSize: "var(--text-11)" }}
                  >
                    With num
                  </p>
                  <ul
                    className="num space-y-1 text-foreground"
                    style={{ fontSize: "var(--text-13)" }}
                  >
                    <li>1,180</li>
                    <li>48</li>
                    <li>11,240</li>
                    <li>3</li>
                  </ul>
                </div>
                <div>
                  <p
                    className="mb-2 text-text-tertiary"
                    style={{ fontSize: "var(--text-11)" }}
                  >
                    Without
                  </p>
                  <ul
                    className="space-y-1 text-foreground"
                    style={{
                      fontSize: "var(--text-13)",
                      fontVariantNumeric: "normal",
                      letterSpacing: "normal",
                    }}
                  >
                    <li>1,180</li>
                    <li>48</li>
                    <li>11,240</li>
                    <li>3</li>
                  </ul>
                </div>
              </div>
            </div>
          </Section>

          <Section number={4} title="Components">
            <ComponentGroups />
          </Section>

          <Section number={5} title="Composites">
            <Card className="gap-0 overflow-visible rounded-lg py-0 [--card-spacing:0px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead
                      className="h-auto px-4 py-2.5 font-medium text-text-tertiary"
                      style={{ fontSize: "var(--text-11)" }}
                    >
                      Our component
                    </TableHead>
                    <TableHead
                      className="h-auto px-4 py-2.5 font-medium text-text-tertiary"
                      style={{ fontSize: "var(--text-11)" }}
                    >
                      shadcn primitives
                    </TableHead>
                    <TableHead
                      className="h-auto px-4 py-2.5 font-medium text-text-tertiary"
                      style={{ fontSize: "var(--text-11)" }}
                    >
                      Obra equivalents
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {COMPOSITES.map((row, i) => (
                    <TableRow
                      key={row.ours}
                      className="border-0 hover:bg-surface-hover"
                      style={{
                        borderBottom:
                          i < COMPOSITES.length - 1
                            ? "1px solid var(--table-inner-line)"
                            : undefined,
                      }}
                    >
                      <TableCell
                        className="px-4 py-2.5 font-medium text-foreground"
                        style={{ fontSize: "var(--text-13)" }}
                      >
                        {row.ours}
                      </TableCell>
                      <TableCell
                        className="px-4 py-2.5 text-text-secondary"
                        style={{ fontSize: "var(--text-12)" }}
                      >
                        {row.shadcn}
                      </TableCell>
                      <TableCell
                        className="px-4 py-2.5 text-text-secondary"
                        style={{ fontSize: "var(--text-12)" }}
                      >
                        {row.obra}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Section>

          <Section number={6} title="Floating surfaces">
            <div
              className="max-w-md rounded-xl p-5"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                boxShadow: "var(--glass-shadow)",
              }}
            >
              <p
                className="font-semibold text-foreground"
                style={{ fontSize: "var(--text-13)" }}
              >
                Glass panel
              </p>
              <p
                className="mt-2 text-text-secondary"
                style={{ fontSize: "var(--text-12)" }}
              >
                Uses <code className="text-foreground">--glass-bg</code> — a
                solid opaque surface, same as --popover, plus a float shadow.
              </p>
            </div>
            <ul
              className="mt-4 list-disc space-y-1 pl-5 text-text-secondary"
              style={{ fontSize: "var(--text-13)" }}
            >
              <li>Command palette</li>
              <li>Assign sheet</li>
              <li>Chat panel</li>
              <li>Client update sheet</li>
            </ul>
            <p
              className="mt-4 text-text-secondary"
              style={{ fontSize: "var(--text-13)" }}
            >
              Blur is a material for things that float. No dashboard surface
              uses it, because blur behind a table degrades text contrast and
              tabular numbers lose their edge.
            </p>
          </Section>

          <Section number={7} title="Motion">
            <MotionDemos />
            <p
              className="mt-4 text-text-secondary"
              style={{ fontSize: "var(--text-13)" }}
            >
              Motion is state change made visible. Nothing decorative. All of it
              respects prefers-reduced-motion.
            </p>
          </Section>

          <Section number={8} title="Accessibility">
            <ul className="space-y-4">
              {A11Y_ITEMS.map((item) => (
                <li key={item.title}>
                  <p
                    className="font-medium text-foreground"
                    style={{ fontSize: "var(--text-13)" }}
                  >
                    {item.title}
                    <span
                      className="ml-2 font-normal text-text-tertiary"
                      style={{ fontSize: "var(--text-11)" }}
                    >
                      WCAG {item.standard}
                    </span>
                  </p>
                  <p
                    className="mt-1 text-text-secondary"
                    style={{ fontSize: "var(--text-12)" }}
                  >
                    {item.detail}
                  </p>
                </li>
              ))}
            </ul>
          </Section>

          <Section number={9} title="The metric reframe">
            <p
              className="max-w-[65ch] text-text-secondary"
              style={{ fontSize: "var(--text-13)" }}
            >
              Practice management dashboards are built on utilization,
              realization and collection rate. Those are billable-hour metrics.
              Moritz bills flat fees per matter and pays contracted co-counsel
              per matter, so they do not apply. Utilization became concurrent
              capacity, realization became margin per matter, and the billable
              target became matters delivered against a weekly target.
            </p>
            <p
              className="mt-4 max-w-[65ch] text-text-secondary"
              style={{ fontSize: "var(--text-13)" }}
            >
              That reframe is printed on the dashboard itself, in the Money zone
              label and in the per-lawyer tooltip, so it reads as a decision
              rather than an omission.
            </p>
          </Section>

          <Section number={10} title="Stated assumptions">
            <ul
              className="max-w-[65ch] list-disc space-y-3 pl-5 text-text-secondary"
              style={{ fontSize: "var(--text-13)" }}
            >
              <li>
                Moritz&apos;s internal admin workflows are not public, so the
                persona and the model of the work are inferred from their
                published operating model: flat fees, contracted co-counsel,
                same-day turnaround.
              </li>
              <li>
                Capacity bands of 80 and 100 percent are prototype assumptions.
              </li>
              <li>
                The four hour SLA is theirs; the 60 minute watch window and the
                20 minute attention window are ours.
              </li>
              <li>
                The 180,000 dollar monthly target and the 35 to 55 percent
                payout range are invented for the prototype.
              </li>
              <li>
                The nine feed event types are inferred from their published
                matter flow.
              </li>
            </ul>
            <p
              className="mt-6 max-w-[65ch] text-text-secondary"
              style={{ fontSize: "var(--text-13)" }}
            >
              In a real engagement these would be validated with the operations
              lead and two co-counsel before any threshold moved.
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}
