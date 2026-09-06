"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkline } from "@/components/ui-bits/sparkline";
import { Skeleton } from "@/components/ui/skeleton";
import type { OverviewPayload } from "@/lib/supabase";
import { cn } from "cn";

type Stats = OverviewPayload["stats"];

function StatValue({
  value,
  tooltip,
  risk,
}: {
  value: number;
  tooltip: string;
  risk?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.span
          key={value}
          data-stat
          className="inline-flex cursor-default items-center gap-1.5"
          style={
            risk && value > 0
              ? { color: "var(--status-risk-fg)" }
              : undefined
          }
          initial={reduceMotion ? false : { opacity: 0.35 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          {risk && value > 0 ? (
            <span
              aria-hidden
              className="pulse-dot size-2 shrink-0 rounded-full"
              style={{ background: "var(--status-risk-fill)" }}
            />
          ) : null}
          {value}
        </motion.span>
      </TooltipTrigger>
      <TooltipContent side="bottom">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function StatStrip({ stats }: { stats: Stats }) {
  const cells = [
    {
      label: "In flight",
      value: stats.inFlight,
      description: `across ${stats.serviceLines} service lines`,
      trend: stats.inFlightTrend,
      tooltip: "Matters not yet delivered, across every service line.",
    },
    {
      label: "Due next hour",
      value: stats.dueNextHour,
      description: `of ${stats.dueToday} due today`,
      trend: stats.dueTrend,
      tooltip: "Matters with under 60 minutes left on the four hour clock.",
    },
    {
      label: "At risk",
      value: stats.atRisk,
      description: `${stats.breached} past due, ${stats.atRisk - stats.breached} under 20 min`,
      trend: null as number[] | null,
      tooltip:
        "Matters past due, or with under 20 minutes left on the four hour clock.",
      risk: true,
    },
    {
      label: "Unassigned",
      value: stats.unassigned,
      description: `oldest arrived ${stats.oldestUnassignedMinutes ?? 0} min ago`,
      trend: stats.unassignedTrend,
      tooltip: "Matters submitted with a fee but no lawyer yet.",
    },
  ];

  return (
    <>
      {/* Mobile: separate cards in a 2×2 grid */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        {cells.map((cell) => (
          <Card
            key={cell.label}
            className="gap-0 rounded-lg p-4 [--card-spacing:0px]"
          >
            <div
              className="font-medium text-text-secondary"
              style={{ fontSize: "var(--text-11)" }}
            >
              {cell.label}
            </div>
            <div className="mt-2">
              <StatValue
                value={cell.value}
                tooltip={cell.tooltip}
                risk={cell.risk}
              />
            </div>
            <div
              className="mt-2 text-text-tertiary"
              style={{ fontSize: "var(--text-11)" }}
            >
              {cell.description.split(/(\d+)/).map((part, idx) =>
                /^\d+$/.test(part) ? (
                  <span key={idx} className="num">
                    {part}
                  </span>
                ) : (
                  <span key={idx}>{part}</span>
                )
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop: joined strip */}
      <Card className="hidden gap-0 rounded-lg py-0 [--card-spacing:0px] md:block">
        <div className="grid grid-cols-4">
          {cells.map((cell, i) => (
            <div
              key={cell.label}
              className={cn(
                "flex flex-col gap-2 px-4 py-4",
                i < cells.length - 1 && "border-r border-border"
              )}
            >
              <div
                className="font-medium text-text-secondary"
                style={{ fontSize: "var(--text-12)" }}
              >
                {cell.label}
              </div>
              <div className="flex items-center justify-start gap-4">
                <StatValue
                  value={cell.value}
                  tooltip={cell.tooltip}
                  risk={cell.risk}
                />
                {cell.trend ? (
                  <span className="hidden md:inline-flex">
                    <Sparkline values={cell.trend} />
                  </span>
                ) : null}
              </div>
              <div
                className="text-text-tertiary"
                style={{ fontSize: "var(--text-11)" }}
              >
                {cell.description.split(/(\d+)/).map((part, idx) =>
                  /^\d+$/.test(part) ? (
                    <span key={idx} className="num">
                      {part}
                    </span>
                  ) : (
                    <span key={idx}>{part}</span>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

export function StatStripSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 gap-2 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="gap-0 rounded-lg p-4 [--card-spacing:0px]">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-[34px] w-10" />
            <Skeleton className="mt-2 h-3 w-24" />
          </Card>
        ))}
      </div>
      <Card className="hidden gap-0 rounded-lg py-0 [--card-spacing:0px] md:block">
        <div className="grid grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex flex-col gap-2 px-4 py-4",
                i < 3 && "border-r border-border"
              )}
            >
              <Skeleton className="h-3 w-20" />
              <div className="flex items-center justify-start gap-4">
                <Skeleton className="h-[34px] w-14" />
                <Skeleton className="h-6 w-[76px]" />
              </div>
              <Skeleton className="h-3 w-36" />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
