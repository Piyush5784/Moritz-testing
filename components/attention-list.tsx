"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  StatusBadge,
  kindToTone,
} from "@/components/ui-bits/status-badge";
import { useDashboardActions } from "@/components/actions-provider";
import { useOverview } from "@/hooks/use-overview";
import { useIsMobile } from "@/hooks/use-mobile";
import type { AttentionItem } from "@/lib/supabase";
import { cn } from "cn";

const PREVIEW_DESKTOP = 6;
const PREVIEW_MOBILE = 4;

function formatBand(low: number, high: number) {
  return `$${low.toLocaleString("en-US")} to $${high.toLocaleString("en-US")}`;
}

/** Same threshold and copy as the deadline list (review drafts under 0.72). */
function LowConfidenceBadge({
  confidence,
  flaggedClauses,
}: {
  confidence: number;
  flaggedClauses: number;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex shrink-0">
          <StatusBadge tone="watch">Low confidence</StatusBadge>
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        Draft confidence{" "}
        <span className="num">{Math.round(confidence * 100)}</span> percent,{" "}
        <span className="num">{flaggedClauses}</span> clauses flagged for
        review. Low confidence drafts take longer to finalise.
      </TooltipContent>
    </Tooltip>
  );
}

function AttentionReason({ item }: { item: AttentionItem }) {
  if (item.kind === "unassigned" && item.triage) {
    return (
      <span
        className="line-clamp-2 text-text-secondary"
        style={{ fontSize: "var(--text-12)" }}
      >
        {item.reason}
        {" · "}
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-default">
              {item.triage.type} · {item.triage.serviceLine}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            Classified on intake from the document and the sending client.
            Confirm or change it when you assign.
          </TooltipContent>
        </Tooltip>
        {item.feeBand ? (
          <span className="num">
            {" · "}
            {formatBand(item.feeBand.low, item.feeBand.high)}
          </span>
        ) : null}
        {item.arrival ? <> · {item.arrival}</> : null}
      </span>
    );
  }

  return (
    <span
      className="line-clamp-2 text-text-secondary"
      style={{ fontSize: "var(--text-12)" }}
    >
      {item.reason}
    </span>
  );
}

function AttentionActions({
  item,
  mobile,
  handoffOpen,
  setHandoffOpen,
}: {
  item: AttentionItem;
  mobile?: boolean;
  handoffOpen: boolean;
  setHandoffOpen: (v: boolean | ((o: boolean) => boolean)) => void;
}) {
  const { handleAttentionAction, nudgingMatterId, openClientUpdate } =
    useDashboardActions();
  const { data } = useOverview();
  const nudging =
    item.action === "Nudge lawyer" && item.matterId === nudgingMatterId;
  const canHandoff = item.kind === "breach" && Boolean(item.handoff);

  return (
    <div
      className={cn(
        "flex",
        mobile ? "w-full flex-col gap-2" : "shrink-0 items-center gap-2"
      )}
    >
      {canHandoff && !mobile ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6 shrink-0"
          aria-expanded={handoffOpen}
          aria-label="Show handoff context"
          onClick={() => setHandoffOpen((o) => !o)}
        >
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform duration-180",
              handoffOpen && "rotate-180"
            )}
          />
        </Button>
      ) : null}
      {item.kind === "breach" && item.matterId && !mobile ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            const matter =
              data?.matters.find((m) => m.id === item.matterId) ??
              data?.deadlines.find((m) => m.id === item.matterId);
            if (matter) openClientUpdate(matter, "slipped");
          }}
        >
          Update client
        </Button>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn(mobile && "min-h-11 w-full")}
        disabled={nudging}
        onClick={() => handleAttentionAction(item)}
      >
        {nudging ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Nudge lawyer
          </>
        ) : (
          item.action
        )}
      </Button>
      {item.kind === "breach" && item.matterId && mobile ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="min-h-11 w-full"
          onClick={() => {
            const matter =
              data?.matters.find((m) => m.id === item.matterId) ??
              data?.deadlines.find((m) => m.id === item.matterId);
            if (matter) openClientUpdate(matter, "slipped");
          }}
        >
          Update client
        </Button>
      ) : null}
      {canHandoff && mobile ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-h-11 w-full"
          aria-expanded={handoffOpen}
          onClick={() => setHandoffOpen((o) => !o)}
        >
          Show handoff context
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform duration-180",
              handoffOpen && "rotate-180"
            )}
          />
        </Button>
      ) : null}
    </div>
  );
}

function HandoffPanel({
  item,
  open,
}: {
  item: AttentionItem;
  open: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const canHandoff = item.kind === "breach" && Boolean(item.handoff);

  return (
    <AnimatePresence initial={false}>
      {canHandoff && open && item.handoff ? (
        <motion.div
          key="handoff"
          initial={reduceMotion ? false : { height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <p
            className="mt-2 rounded-md px-3 py-2 text-text-secondary"
            style={{
              fontSize: "var(--text-12)",
              background: "var(--status-info-bg)",
            }}
          >
            {item.handoff}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function AttentionCard({ item }: { item: AttentionItem }) {
  const reduceMotion = useReducedMotion();
  const [handoffOpen, setHandoffOpen] = useState(false);

  return (
    <motion.li
      layout={!reduceMotion}
      initial={false}
      exit={
        reduceMotion
          ? undefined
          : { opacity: 0, height: 0, overflow: "hidden" }
      }
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Card className="flex flex-col gap-2 rounded-lg p-4 [--card-spacing:0px]">
        <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-start gap-x-3">
          <div className="flex h-5 items-center">
            <StatusBadge tone={kindToTone(item.kind)}>{item.label}</StatusBadge>
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <span
                className="font-semibold text-foreground"
                style={{ fontSize: "var(--text-13)" }}
              >
                {item.title}
              </span>
              {item.lowConfidence ? (
                <LowConfidenceBadge
                  confidence={item.lowConfidence.confidence}
                  flaggedClauses={item.lowConfidence.flaggedClauses}
                />
              ) : null}
            </div>
            <AttentionReason item={item} />
          </div>
        </div>
        <HandoffPanel item={item} open={handoffOpen} />
        <AttentionActions
          item={item}
          mobile
          handoffOpen={handoffOpen}
          setHandoffOpen={setHandoffOpen}
        />
      </Card>
    </motion.li>
  );
}

function AttentionRow({ item }: { item: AttentionItem }) {
  const reduceMotion = useReducedMotion();
  const [handoffOpen, setHandoffOpen] = useState(false);

  return (
    <motion.li
      layout={!reduceMotion}
      initial={false}
      exit={
        reduceMotion
          ? undefined
          : { opacity: 0, height: 0, overflow: "hidden" }
      }
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="px-4 py-2.5 hover:bg-surface-hover"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <div className="grid grid-cols-[7.5rem_minmax(0,1fr)_auto] items-center gap-x-3">
        <div className="flex h-5 items-center self-start">
          <StatusBadge tone={kindToTone(item.kind)}>{item.label}</StatusBadge>
        </div>
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className="font-semibold text-foreground"
              style={{ fontSize: "var(--text-13)" }}
            >
              {item.title}
            </span>
            {item.lowConfidence ? (
              <LowConfidenceBadge
                confidence={item.lowConfidence.confidence}
                flaggedClauses={item.lowConfidence.flaggedClauses}
              />
            ) : null}
          </div>
          <AttentionReason item={item} />
          <HandoffPanel item={item} open={handoffOpen} />
        </div>
        <AttentionActions
          item={item}
          handoffOpen={handoffOpen}
          setHandoffOpen={setHandoffOpen}
        />
      </div>
    </motion.li>
  );
}

export function AttentionList({ items }: { items: AttentionItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const isMobile = useIsMobile();
  const preview = isMobile ? PREVIEW_MOBILE : PREVIEW_DESKTOP;

  if (items.length === 0) {
    return (
      <Card className="gap-0 rounded-lg py-0 [--card-spacing:0px]">
        <p
          className="px-4 py-8 text-center text-text-secondary"
          style={{ fontSize: "var(--text-13)" }}
        >
          Nothing at risk. Every matter has time on the clock.
        </p>
      </Card>
    );
  }

  const shouldCollapse = !expanded && items.length - preview >= 3;
  let visible = shouldCollapse ? items.slice(0, preview) : items;
  if (shouldCollapse) {
    const shown = new Set(visible.map((i) => i.id));
    const pinned = items.filter(
      (i) => i.kind === "unassigned" && !shown.has(i.id)
    );
    if (pinned.length) visible = [...visible, ...pinned];
  }
  const remaining = items.length - visible.length;
  const showMore = shouldCollapse && remaining > 0;

  return (
    <>
      <ul className="flex flex-col gap-3 md:hidden">
        <AnimatePresence initial={false}>
          {visible.map((item) => (
            <AttentionCard key={item.id} item={item} />
          ))}
        </AnimatePresence>
        {showMore ? (
          <li>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-11 w-full text-text-secondary"
              style={{ fontSize: "var(--text-12)" }}
              onClick={() => setExpanded(true)}
            >
              Show <span className="num">{remaining}</span> more
            </Button>
          </li>
        ) : null}
      </ul>

      <Card className="hidden gap-0 rounded-lg py-0 [--card-spacing:0px] md:block">
        <ul>
          <AnimatePresence initial={false}>
            {visible.map((item) => (
              <AttentionRow key={item.id} item={item} />
            ))}
          </AnimatePresence>
          {showMore ? (
            <li
              className="px-4 py-2"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-text-secondary"
                style={{ fontSize: "var(--text-12)" }}
                onClick={() => setExpanded(true)}
              >
                Show <span className="num">{remaining}</span> more
              </Button>
            </li>
          ) : null}
        </ul>
      </Card>
    </>
  );
}

export function AttentionListSkeleton() {
  return (
    <>
      <ul className="flex flex-col gap-3 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="gap-2 rounded-lg p-4 [--card-spacing:0px]">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-11 w-full" />
          </Card>
        ))}
      </ul>
      <Card className="hidden gap-0 rounded-lg py-0 [--card-spacing:0px] md:block">
        <ul>
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="px-4 py-2.5"
              style={{
                borderBottom:
                  i < 3 ? "1px solid var(--border)" : undefined,
              }}
            >
              <div className="grid grid-cols-[7.5rem_minmax(0,1fr)_auto] items-start gap-x-3">
                <Skeleton className="h-5 w-full rounded-md" />
                <div className="min-w-0 space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3.5 w-48 max-w-full" />
                </div>
                <Skeleton className="h-7 w-20" />
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
