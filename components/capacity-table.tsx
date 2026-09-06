"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DataTableShell,
  stickyTableHeadClassName,
} from "@/components/data-table-shell";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CapacityMeter } from "@/components/ui-bits/capacity-meter";
import { LawyerAvatar } from "@/components/ui-bits/lawyer-avatar";
import { StatusBadge } from "@/components/ui-bits/status-badge";
import type { CapacityState, LawyerLoad } from "@/lib/supabase";
import { useDashboardActions } from "@/components/actions-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "cn";

const PREVIEW_DESKTOP = 5;
const PREVIEW_MOBILE = 5;
const LOAD_STEP = 10;

const badgeTone: Record<CapacityState, "ok" | "watch" | "risk"> = {
  room: "ok",
  high: "watch",
  over: "risk",
};

function LawyerAction({
  lawyer,
  mobile,
}: {
  lawyer: LawyerLoad;
  mobile?: boolean;
}) {
  const router = useRouter();
  const { openAssignForLawyer } = useDashboardActions();

  if (lawyer.capacityState === "over") {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={mobile ? "min-h-11" : undefined}
        onClick={() => openAssignForLawyer(lawyer.id)}
      >
        Reassign
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className={mobile ? "min-h-11" : undefined}
      onClick={() =>
        router.push(`/lawyers?id=${encodeURIComponent(lawyer.id)}`)
      }
    >
      View
    </Button>
  );
}

function LawyerCard({ lawyer }: { lawyer: LawyerLoad }) {
  return (
    <Card className="flex flex-col gap-3 rounded-lg p-4 [--card-spacing:0px]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <LawyerAvatar
            lawyerId={lawyer.id}
            name={lawyer.name}
            initials={lawyer.initials}
            size="lg"
          />
          <div className="min-w-0">
            <div
              className="truncate font-medium text-foreground"
              style={{ fontSize: "var(--text-13)" }}
            >
              {lawyer.name}
            </div>
            <div
              className="truncate text-text-tertiary"
              style={{ fontSize: "var(--text-11)" }}
            >
              {lawyer.practice_areas[0]}
            </div>
          </div>
        </div>
        <StatusBadge tone={badgeTone[lawyer.capacityState]}>
          {lawyer.capacityLabel}
        </StatusBadge>
      </div>
      <CapacityMeter
        pct={lawyer.utilizationPct}
        state={lawyer.capacityState}
        label={lawyer.capacityLabel}
        name={lawyer.name}
        layout="stacked"
      />
      <div className="flex items-center justify-between gap-3">
        <div
          className="flex gap-4 text-text-secondary"
          style={{ fontSize: "var(--text-11)" }}
        >
          <span>
            Active{" "}
            <span className="num font-medium text-foreground">
              {lawyer.activeMatters}
            </span>
          </span>
          <span>
            This week{" "}
            <span className="num font-medium text-foreground">
              {lawyer.delivered_this_week}/{lawyer.weekly_target}
            </span>
          </span>
        </div>
        <LawyerAction lawyer={lawyer} mobile />
      </div>
    </Card>
  );
}

export function CapacityTable({
  lawyers,
  maxHeight,
}: {
  lawyers: LawyerLoad[];
  maxHeight?: number;
}) {
  const isMobile = useIsMobile();
  const preview = isMobile ? PREVIEW_MOBILE : PREVIEW_DESKTOP;
  const [visibleCount, setVisibleCount] = useState(preview);

  const visible = lawyers.slice(0, Math.min(visibleCount, lawyers.length));
  const hasMore = visible.length < lawyers.length;

  const loadMore = useCallback(() => {
    setVisibleCount((count) => Math.min(lawyers.length, count + LOAD_STEP));
  }, [lawyers.length]);

  const { ref: mobileSentinelRef } = useInView({
    skip: !hasMore,
    rootMargin: "200px",
    onChange: (inView) => {
      if (inView) loadMore();
    },
  });
  const [desktopScrollEl, setDesktopScrollEl] = useState<HTMLDivElement | null>(
    null
  );
  const { ref: desktopSentinelRef } = useInView({
    skip: !hasMore,
    root: desktopScrollEl,
    rootMargin: "100px",
    onChange: (inView) => {
      if (inView) loadMore();
    },
  });

  return (
    <>
      <div className="flex flex-col gap-2 md:hidden">
        {visible.map((lawyer) => (
          <LawyerCard key={lawyer.id} lawyer={lawyer} />
        ))}
        {hasMore ? <div ref={mobileSentinelRef} aria-hidden className="h-1" /> : null}
      </div>

      <Card className="hidden flex-col gap-0 overflow-hidden rounded-lg py-0 [--card-spacing:0px] md:flex">
        <DataTableShell
          scrollRef={setDesktopScrollEl}
          scrollClassName={maxHeight == null ? "h-full" : undefined}
          scrollStyle={maxHeight != null ? { height: maxHeight } : undefined}
        >
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead
                scope="col"
                className={cn(stickyTableHeadClassName, "h-auto px-4 py-2.5 font-medium text-text-tertiary")}
                style={{ fontSize: "var(--text-11)" }}
              >
                Lawyer
              </TableHead>
              <TableHead
                scope="col"
                className={cn(stickyTableHeadClassName, "h-auto px-4 py-2.5 text-right font-medium text-text-tertiary")}
                style={{ fontSize: "var(--text-11)" }}
              >
                Active
              </TableHead>
              <TableHead
                scope="col"
                className={cn(stickyTableHeadClassName, "h-auto px-4 py-2.5 font-medium text-text-tertiary")}
                style={{ fontSize: "var(--text-11)" }}
              >
                Capacity
              </TableHead>
              <TableHead
                scope="col"
                className={cn(stickyTableHeadClassName, "h-auto px-4 py-2.5 text-right font-medium text-text-tertiary")}
                style={{ fontSize: "var(--text-11)" }}
              >
                This week
              </TableHead>
              <TableHead
                scope="col"
                className={cn(stickyTableHeadClassName, "h-auto px-4 py-2.5 text-right font-medium text-text-tertiary")}
                style={{ fontSize: "var(--text-11)" }}
              >
                <span className="sr-only">Action</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((lawyer, index) => (
              <TableRow
                key={lawyer.id}
                className="h-12 border-0 hover:bg-surface-hover"
                style={{
                  borderBottom:
                    index < visible.length - 1
                      ? "1px solid var(--table-inner-line)"
                      : undefined,
                }}
              >
                <TableCell className="px-4 py-0">
                  <div className="flex items-center gap-2.5">
                    <LawyerAvatar
                      lawyerId={lawyer.id}
                      name={lawyer.name}
                      initials={lawyer.initials}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div
                        className="truncate font-medium leading-tight text-foreground"
                        style={{ fontSize: "var(--text-13)" }}
                      >
                        {lawyer.name}
                      </div>
                      <div
                        className="truncate text-text-tertiary"
                        style={{ fontSize: "var(--text-11)" }}
                      >
                        {lawyer.practice_areas[0]}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-0 text-right">
                  <span className="num">{lawyer.activeMatters}</span>
                </TableCell>
                <TableCell className="px-4 py-0">
                  <CapacityMeter
                    pct={lawyer.utilizationPct}
                    state={lawyer.capacityState}
                    label={lawyer.capacityLabel}
                    name={lawyer.name}
                    compact
                  />
                </TableCell>
                <TableCell className="px-4 py-0 text-right">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="num cursor-default">
                        {lawyer.delivered_this_week} of {lawyer.weekly_target}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      Matters delivered this week against their weekly target.
                      Moritz bills flat fees per matter, so the target is matters
                      delivered, not billable hours.
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="px-4 py-0 text-right">
                  <LawyerAction lawyer={lawyer} />
                </TableCell>
              </TableRow>
            ))}
            {hasMore ? (
              <TableRow className="border-0 hover:bg-transparent">
                <TableCell colSpan={5} className="h-1 p-0">
                  <div ref={desktopSentinelRef} aria-hidden />
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </DataTableShell>
      </Card>
    </>
  );
}

export function CapacityTableSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-2 md:hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="gap-3 rounded-lg p-4 [--card-spacing:0px]">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-8 w-full" />
          </Card>
        ))}
      </div>
      <Card className="hidden h-full flex-col gap-0 rounded-lg py-0 [--card-spacing:0px] md:flex">
        <div
          className="grid grid-cols-[1.4fr_auto_1.2fr_auto_auto] gap-4 px-4 py-2.5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-14" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex h-12 items-center gap-4 px-4"
            style={{
              borderBottom:
                i < 4 ? "1px solid var(--table-inner-line)" : undefined,
            }}
          >
            <div className="flex flex-1 items-center gap-2.5">
              <Skeleton className="size-7 rounded-[9px]" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-3.5 w-6" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3.5 w-14" />
            <Skeleton className="h-7 w-14" />
          </div>
        ))}
      </Card>
    </>
  );
}
