"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkline } from "@/components/ui-bits/sparkline";
import { cn } from "cn";
import type { OverviewPayload } from "@/lib/supabase";

type Finance = OverviewPayload["finance"];

function formatCurrency(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

export function MoneyStrip({
  finance,
  daysLeft,
  priorMonth,
}: {
  finance: Finance;
  daysLeft: number;
  priorMonth: string;
}) {
  const net = finance.openedThisMonth - finance.closedThisMonth;
  const cells = [
    {
      label: "Revenue to date",
      value: formatCurrency(finance.revenueToDate),
      sub: (
        <>
          <span className="num">{finance.pctOfTarget}</span>% of target
        </>
      ),
    },
    {
      label: "Target",
      value: formatCurrency(finance.target),
      sub: (
        <>
          <span className="num">{daysLeft}</span> days left
        </>
      ),
    },
    {
      label: "Average fee",
      value: formatCurrency(finance.avgFee),
      sub: (
        <>
          up $<span className="num">{finance.avgFeeDelta}</span> vs {priorMonth}
        </>
      ),
    },
    {
      label: "Margin per matter",
      value: `${finance.marginPct}%`,
      sub: (
        <>
          payout <span className="num">{finance.payoutPct}</span>%
        </>
      ),
    },
    {
      label: "Opened vs closed",
      value: `${finance.openedThisMonth} / ${finance.closedThisMonth}`,
      sub: (
        <>
          net +<span className="num">{net}</span> in flight
        </>
      ),
      fullWidthMobile: true,
    },
  ];

  return (
    <>
      <div className="mt-3 grid grid-cols-2 gap-2 md:hidden">
        {cells.map((cell) => (
          <Card
            key={cell.label}
            className={cn(
              "gap-0 rounded-lg p-4 [--card-spacing:0px]",
              cell.fullWidthMobile && "col-span-2"
            )}
          >
            <div
              className="font-medium text-text-secondary"
              style={{ fontSize: "var(--text-11)" }}
            >
              {cell.label}
            </div>
            <div
              className="num font-semibold text-foreground"
              style={{ fontSize: "var(--text-20)", marginTop: "4px" }}
            >
              {cell.value}
            </div>
            <div
              className="text-text-tertiary"
              style={{ fontSize: "var(--text-11)", marginTop: "4px" }}
            >
              {cell.sub}
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-3 hidden gap-0 rounded-lg py-0 [--card-spacing:0px] md:block">
        <div className="grid grid-cols-5">
          {cells.map((cell, i) => (
            <div
              key={cell.label}
              className={cn(
                "px-4 py-3",
                i < cells.length - 1 && "border-r border-border"
              )}
            >
              <div
                className="font-medium text-text-secondary"
                style={{ fontSize: "var(--text-11)" }}
              >
                {cell.label}
              </div>
              <div
                className="num font-semibold text-foreground"
                style={{
                  fontSize: "var(--text-20)",
                  marginTop: "4px",
                }}
              >
                {cell.value}
              </div>
              <div
                className="text-text-tertiary"
                style={{ fontSize: "var(--text-11)", marginTop: "4px" }}
              >
                {cell.sub}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

export function MoneyStripSkeleton() {
  return (
    <>
      <div className="mt-3 grid grid-cols-2 gap-2 md:hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card
            key={i}
            className={cn(
              "space-y-2 rounded-lg p-4 [--card-spacing:0px]",
              i === 4 && "col-span-2"
            )}
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-24" />
          </Card>
        ))}
      </div>
      <Card className="mt-3 hidden gap-0 rounded-lg py-0 [--card-spacing:0px] md:block">
        <div className="grid grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "space-y-2 px-4 py-3",
                i < 4 && "border-r border-border"
              )}
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

/** Compact mobile chart stand-in: big number + sparkline + caption. */
export function MobileChartStat({
  label,
  value,
  spark,
  caption,
}: {
  label: string;
  value: ReactNode;
  spark: number[];
  caption: ReactNode;
}) {
  return (
    <Card className="gap-0 rounded-lg p-4 [--card-spacing:0px] md:hidden">
      <div
        className="font-medium text-text-secondary"
        style={{ fontSize: "var(--text-11)" }}
      >
        {label}
      </div>
      <div
        data-stat
        className="mt-2"
      >
        {value}
      </div>
      <div className="mt-2">
        <Sparkline values={spark} />
      </div>
      <p
        className="mt-2 text-text-secondary"
        style={{ fontSize: "var(--text-12)" }}
      >
        {caption}
      </p>
    </Card>
  );
}
