"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  XAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { FinanceDayRow } from "@/lib/supabase";

const chartConfig = {
  delivered: { label: "Delivered" },
} satisfies ChartConfig;

function formatShortDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function weekdayLetter(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "narrow" });
}

export function DeliveredChart({
  days,
  dailyPlan,
  deliveredThisWeek,
  plannedThisWeek,
}: {
  days: FinanceDayRow[];
  dailyPlan: number;
  deliveredThisWeek: number;
  plannedThisWeek: number;
}) {
  const data = days.slice(-7).map((d) => {
    const weekend = d.planned_delivered === 0;
    // Weekend zeros need a 2px stub so the day reads as present, not missing.
    const stub = weekend && d.delivered === 0 ? Math.max(dailyPlan * 0.04, 0.15) : 0;
    return {
      ...d,
      weekend,
      bar: d.delivered > 0 ? d.delivered : stub,
    };
  });

  return (
    <Card className="h-full flex flex-col gap-0 rounded-lg p-4 [--card-spacing:0px]">
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-40 w-full"
        aria-label="Matters delivered per day against the daily plan"
      >
        <BarChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--chart-grid)"
          />
          <XAxis
            dataKey="date"
            tickFormatter={weekdayLetter}
            tickLine={false}
            axisLine={false}
            tick={{
              fill: "var(--chart-axis-text)",
              fontSize: 11,
            }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const date = payload?.[0]?.payload?.date as string | undefined;
                  return date ? formatShortDate(date) : "";
                }}
                formatter={(_value, _name, item) => (
                  <span className="num font-medium text-foreground">
                    {Number(item?.payload?.delivered ?? 0)} delivered
                  </span>
                )}
              />
            }
          />
          <ReferenceLine
            y={dailyPlan}
            stroke="var(--chart-target-line)"
            strokeDasharray="3 3"
            label={{
              value: `Plan ${dailyPlan} a day`,
              position: "insideTopRight",
              fill: "var(--chart-axis-text)",
              fontSize: 11,
            }}
          />
          <Bar
            dataKey="bar"
            radius={[3, 3, 0, 0]}
            maxBarSize={28}
          >
            {data.map((d) => (
              <Cell
                key={d.date}
                fill={
                  d.weekend
                    ? "var(--fjord-200)"
                    : "var(--chart-delivered-bar)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
      <p
        className="text-text-secondary"
        style={{ fontSize: "var(--text-12)", marginTop: "10px" }}
      >
        <span className="num">{deliveredThisWeek}</span> matters delivered this
        week against a plan of{" "}
        <span className="num">{plannedThisWeek}</span>.
      </p>
      <p
        className="text-text-tertiary"
        style={{ fontSize: "var(--text-11)", marginTop: "4px" }}
      >
        Weekends show no deliveries.
      </p>
    </Card>
  );
}

export function DeliveredChartSkeleton() {
  return (
    <Card className="h-full flex flex-col gap-0 rounded-lg p-4 [--card-spacing:0px]">
      <Skeleton className="h-40 w-full rounded-md" />
      <Skeleton className="mt-2.5 h-3 w-3/5 max-w-sm" />
    </Card>
  );
}
