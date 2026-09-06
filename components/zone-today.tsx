"use client";

import { AlertCircle } from "lucide-react";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ZoneLabel } from "@/components/ui-bits/zone-label";
import { MorningBrief } from "@/components/morning-brief";
import {
  StatStrip,
  StatStripSkeleton,
} from "@/components/stat-strip";
import {
  AttentionList,
  AttentionListSkeleton,
} from "@/components/attention-list";
import { useOverview } from "@/hooks/use-overview";

function formatGeneratedAt(iso: string) {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString("en-GB", { weekday: "long" });
  const day = d.getDate();
  const month = d.toLocaleDateString("en-GB", { month: "long" });
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${weekday} ${day} ${month}, ${hours}:${minutes}`;
}

export function ZoneToday() {
  const { data, error, isPending, refetch, isFetching } = useOverview();

  if (isPending) {
    return (
      <section aria-label="Today">
        <ZoneLabel title="Today" meta="Loading…" />
        <div className="space-y-3">
          <StatStripSkeleton />
          <AttentionListSkeleton />
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section aria-label="Today">
        <ZoneLabel title="Today" />
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

  return (
    <section aria-label="Today">
      <ZoneLabel title="Today" meta={formatGeneratedAt(data.generatedAt)} />
      <MorningBrief brief={data.ai.brief} />
      <div className="mb-3">
        <StatStrip stats={data.stats} />
      </div>
      <AttentionList items={data.attention} />
    </section>
  );
}
