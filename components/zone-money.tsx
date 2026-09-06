"use client";

import { AlertCircle, ChevronRight } from "lucide-react";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ZoneLabel } from "@/components/ui-bits/zone-label";
import {
  RevenueChart,
  RevenueChartSkeleton,
} from "@/components/revenue-chart";
import {
  DeliveredChart,
  DeliveredChartSkeleton,
} from "@/components/delivered-chart";
import {
  MoneyStrip,
  MoneyStripSkeleton,
  MobileChartStat,
} from "@/components/money-strip";
import { UnquotedRow } from "@/components/unquoted-row";
import { useOverview } from "@/hooks/use-overview";
import type { FinanceDayRow } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { cn } from "cn";

function monthNameFromDays(days: FinanceDayRow[]) {
  const sample = days.at(-1);
  if (!sample) {
    return new Date().toLocaleDateString("en-GB", { month: "long" });
  }
  return new Date(`${sample.date}T12:00:00`).toLocaleDateString("en-GB", {
    month: "long",
  });
}

function priorMonthName(days: FinanceDayRow[]) {
  const sample = days.at(-1);
  const base = sample
    ? new Date(`${sample.date}T12:00:00`)
    : new Date();
  const prior = new Date(base.getFullYear(), base.getMonth() - 1, 1);
  return prior.toLocaleDateString("en-GB", { month: "long" });
}

function daysLeftInMonth(from: Date = new Date()) {
  const last = new Date(from.getFullYear(), from.getMonth() + 1, 0).getDate();
  return Math.max(0, last - from.getDate());
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

function cumulativeRevenue(days: FinanceDayRow[]) {
  let running = 0;
  return days.map((d) => {
    running += Number(d.revenue);
    return running;
  });
}

export function ZoneMoney({
  className,
  hideLabel = false,
}: {
  className?: string;
  hideLabel?: boolean;
}) {
  const router = useRouter();
  const { data, error, isPending, refetch, isFetching } = useOverview();

  if (isPending) {
    return (
      <section aria-label="Money" className={cn("mt-6 md:mt-8", className)}>
        <ZoneLabel
          title="Money"
          meta={hideLabel ? undefined : "Loading…"}
          visuallyHidden={hideLabel}
        />
        <div className="hidden grid-cols-1 items-stretch gap-3 md:grid lg:grid-cols-2">
          <RevenueChartSkeleton />
          <DeliveredChartSkeleton />
        </div>
        <div className="grid grid-cols-1 gap-2 md:hidden">
          <MoneyStripSkeleton />
        </div>
        <div className="hidden md:block">
          <MoneyStripSkeleton />
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section aria-label="Money" className={cn("mt-6 md:mt-8", className)}>
        <ZoneLabel title="Money" visuallyHidden={hideLabel} />
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Couldn&apos;t load the firm overview.</AlertTitle>
          <AlertDescription>
            Check the connection and try again.
          </AlertDescription>
          <AlertAction>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="min-h-11 md:min-h-8"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              Retry
            </Button>
          </AlertAction>
        </Alert>
      </section>
    );
  }

  const { finance, config } = data;
  const month = monthNameFromDays(finance.days);
  const priorMonth = priorMonthName(finance.days);
  const daysLeft = daysLeftInMonth();
  const draft = formatDuration(finance.avgDraftMinutes);
  const review = formatDuration(finance.avgReviewMinutes);
  const anomaly = finance.anomaly;
  const revenueSpark = cumulativeRevenue(finance.days);
  const deliveredSpark = finance.days.slice(-7).map((d) => Number(d.delivered));
  const meta = `${month} · flat fees per matter, not billable hours`;

  return (
    <section aria-label="Money" className={cn("mt-6 md:mt-8", className)}>
      <ZoneLabel
        title="Money"
        meta={hideLabel ? undefined : meta}
        visuallyHidden={hideLabel}
      />
      {hideLabel ? (
        <p
          className="mb-3 text-text-tertiary"
          style={{ fontSize: "var(--text-11)" }}
        >
          {meta}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-2 md:hidden">
        <MobileChartStat
          label="Revenue"
          value={
            <>
              <span className="num">{finance.pctOfTarget}</span>%
            </>
          }
          spark={revenueSpark}
          caption={
            <>
              of target with <span className="num">{daysLeft}</span> days left.
              On pace for <span className="num">{finance.projectedPct}</span>{" "}
              percent.
            </>
          }
        />
        <MobileChartStat
          label="Delivered"
          value={<span className="num">{finance.deliveredThisWeek}</span>}
          spark={deliveredSpark.length > 1 ? deliveredSpark : [0, 1]}
          caption={
            <>
              this week against a plan of{" "}
              <span className="num">{finance.plannedThisWeek}</span>.
            </>
          }
        />
      </div>

      <div className="hidden grid-cols-1 items-stretch gap-3 md:grid lg:grid-cols-2">
        <RevenueChart
          days={finance.days}
          target={finance.target}
          pctOfTarget={finance.pctOfTarget}
          projectedPct={finance.projectedPct}
          daysLeft={daysLeft}
        />
        <DeliveredChart
          days={finance.days}
          dailyPlan={config.dailyDeliveryPlan}
          deliveredThisWeek={finance.deliveredThisWeek}
          plannedThisWeek={finance.plannedThisWeek}
        />
      </div>

      <MoneyStrip
        finance={finance}
        daysLeft={daysLeft}
        priorMonth={priorMonth}
      />

      <p
        className="text-text-secondary"
        style={{ fontSize: "var(--text-12)", marginTop: "10px" }}
      >
        Average <span className="num">{draft}</span> in draft,{" "}
        <span className="num">{review}</span> in lawyer review.
        {anomaly ? (
          <>
            {" "}
            {anomaly.serviceLine} matters average{" "}
            <span className="num">{formatCurrency(anomaly.avg)}</span> against{" "}
            <span className="num">{formatCurrency(anomaly.firmAvg)}</span>{" "}
            firm-wide across <span className="num">{anomaly.count}</span>{" "}
            matters.
            <Button
              type="button"
              variant="link"
              size="sm"
              className="ml-1 h-auto min-h-11 px-0 align-baseline text-accent-foreground underline-offset-4 md:min-h-0"
              style={{ fontSize: "var(--text-12)" }}
              onClick={() =>
                router.push(
                  `/matters?q=${encodeURIComponent(anomaly.serviceLine)}`
                )
              }
            >
              See matters
              <ChevronRight className="size-3" aria-hidden />
            </Button>
          </>
        ) : null}
      </p>

      <UnquotedRow unquoted={finance.unquoted} />
    </section>
  );
}
