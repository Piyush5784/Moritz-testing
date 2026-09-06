"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ZoneLabel } from "@/components/ui-bits/zone-label";
import {
  CapacityTable,
  CapacityTableSkeleton,
} from "@/components/capacity-table";
import {
  DeadlineList,
  DeadlineListSkeleton,
} from "@/components/deadline-list";
import { useOverview } from "@/hooks/use-overview";
import { cn } from "cn";

export function ZonePeople({
  className,
  hideLabel = false,
}: {
  className?: string;
  hideLabel?: boolean;
}) {
  const { data, error, isPending, refetch, isFetching } = useOverview();
  const gridRef = useRef<HTMLDivElement>(null);
  const [matchHeight, setMatchHeight] = useState<number>();

  useEffect(() => {
    const el = gridRef.current;
    if (!el || !data) return;

    const deadlineCard = el.querySelector<HTMLElement>(
      "[data-desktop-deadline-card]"
    );
    if (!deadlineCard) return;

    const recompute = () => {
      setMatchHeight(deadlineCard.getBoundingClientRect().height);
    };

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(deadlineCard);
    return () => ro.disconnect();
  }, [data]);

  if (isPending) {
    return (
      <section aria-label="People" className={cn("mt-6 md:mt-8", className)}>
        <ZoneLabel
          title="People"
          meta={hideLabel ? undefined : "Loading…"}
          visuallyHidden={hideLabel}
        />
        <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[1.4fr_1fr]">
          <CapacityTableSkeleton />
          <DeadlineListSkeleton />
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section aria-label="People" className={cn("mt-6 md:mt-8", className)}>
        <ZoneLabel title="People" visuallyHidden={hideLabel} />
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

  const forecast = data.ai.capacityForecast;
  const meta = `${data.lawyers.length} co-counsel · sorted by load${
    forecast ? ` · ${forecast}` : ""
  }`;

  return (
    <section aria-label="People" className={cn("mt-6 md:mt-8", className)}>
      <ZoneLabel
        title="People"
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
      <div
        ref={gridRef}
        className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[1.4fr_1fr]"
      >
        <CapacityTable lawyers={data.lawyers} maxHeight={matchHeight} />
        <DeadlineList
          deadlines={data.deadlines}
          slaMinutes={data.config.slaMinutes}
        />
      </div>
    </section>
  );
}
