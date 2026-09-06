"use client";

import { useState, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AutoHideScroll } from "@/components/auto-hide-scroll";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ZoneLabel } from "@/components/ui-bits/zone-label";
import {
  ActivityFeed,
  ActivityFeedSkeleton,
} from "@/components/activity-feed";
import { useOverview } from "@/hooks/use-overview";
import { cn } from "cn";

function PulseShell({ children }: { children: ReactNode }) {
  return (
    <div className="sticky top-0 h-[calc(100svh-var(--topbar-h))] border-l border-border bg-card">
      <AutoHideScroll className="h-full">
        <div className="min-w-0 px-5 py-6">{children}</div>
      </AutoHideScroll>
    </div>
  );
}

const CHIP_ORDER = [
  { key: "all", label: "All" },
  { key: "submitted", label: "Submitted" },
  { key: "assigned", label: "Assigned" },
  { key: "delivered", label: "Delivered" },
  { key: "filed", label: "Filed" },
  { key: "meeting", label: "Meetings" },
  { key: "escalated", label: "Escalated" },
  { key: "onboarded", label: "Onboarded" },
] as const;

function PulseBody({
  embedded,
  pending,
  error,
  refetch,
  isFetching,
  chips,
  filter,
  setFilter,
  activity,
}: {
  embedded?: boolean;
  pending?: boolean;
  error?: boolean;
  refetch: () => void;
  isFetching: boolean;
  chips: { key: string; label: string; count: number }[];
  filter: string;
  setFilter: (v: string) => void;
  activity: ReturnType<typeof useOverview>["data"] extends infer D
    ? D extends { activity: infer A }
      ? A
      : never
    : never;
}) {
  return (
    <>
      <ZoneLabel
        title="Pulse"
        meta={embedded ? undefined : "today"}
        className={embedded ? undefined : "mb-0"}
        visuallyHidden={embedded}
      />

      {pending ? (
        <>
          <div
            className={cn(
              "flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              embedded ? "mt-0" : "mt-3"
            )}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-16 shrink-0 rounded-md md:h-6" />
            ))}
          </div>
          <ActivityFeedSkeleton />
        </>
      ) : error ? (
        <Alert variant="destructive" className={embedded ? "mt-0" : "mt-3"}>
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
      ) : (
        <>
          <div
            className={cn(
              "overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              embedded ? "mt-0" : "mt-3"
            )}
          >
            <ToggleGroup
              type="single"
              value={filter}
              onValueChange={(value) => {
                if (value) setFilter(value);
              }}
              className="flex w-max min-w-full flex-nowrap justify-start gap-2 md:flex-wrap md:w-full"
              spacing={0}
            >
              {chips.map((chip) => (
                <ToggleGroupItem
                  key={chip.key}
                  value={chip.key}
                  aria-label={`${chip.label} ${chip.count}`}
                  className={cn(
                    "h-11 min-h-11 shrink-0 rounded-md border border-border bg-card px-3 font-normal text-text-secondary shadow-none md:h-6 md:min-h-6 md:px-2.5",
                    "group-data-[spacing=0]/toggle-group:rounded-md",
                    "hover:bg-surface-hover hover:text-text-secondary",
                    "data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary data-[state=on]:hover:text-primary-foreground"
                  )}
                  style={{ fontSize: "var(--text-11)" }}
                >
                  {chip.label}{" "}
                  <b className="num font-medium">{chip.count}</b>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <ActivityFeed activity={activity ?? []} filter={filter} />
        </>
      )}
    </>
  );
}

/** Pulse content for the mobile/tablet tab (no sticky rail chrome). */
export function PulsePanel({ embedded = false }: { embedded?: boolean }) {
  const { data, error, isPending, refetch, isFetching } = useOverview();
  const [filter, setFilter] = useState("all");

  const chips = CHIP_ORDER.filter(
    (chip) => (data?.activityCounts[chip.key] ?? 0) > 0
  ).map((chip) => ({
    key: chip.key,
    label: chip.label,
    count: data?.activityCounts[chip.key] ?? 0,
  }));

  return (
    <PulseBody
      embedded={embedded}
      pending={isPending}
      error={Boolean(error || !data)}
      refetch={refetch}
      isFetching={isFetching}
      chips={chips}
      filter={filter}
      setFilter={setFilter}
      activity={data?.activity ?? []}
    />
  );
}

export function PulseRail() {
  const { data, error, isPending, refetch, isFetching } = useOverview();
  const [filter, setFilter] = useState("all");

  const chips = CHIP_ORDER.filter(
    (chip) => (data?.activityCounts[chip.key] ?? 0) > 0
  ).map((chip) => ({
    key: chip.key,
    label: chip.label,
    count: data?.activityCounts[chip.key] ?? 0,
  }));

  return (
    <PulseShell>
      <PulseBody
        pending={isPending}
        error={Boolean(error || !data)}
        refetch={refetch}
        isFetching={isFetching}
        chips={chips}
        filter={filter}
        setFilter={setFilter}
        activity={data?.activity ?? []}
      />
    </PulseShell>
  );
}
