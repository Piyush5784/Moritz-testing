"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/app-shell";
import { AutoHideScroll } from "@/components/auto-hide-scroll";
import { ZoneLabel } from "@/components/ui-bits/zone-label";
import { LawyerCard } from "@/components/lawyer-card";
import { useMattersDirectory } from "@/hooks/use-matters-directory";

function LawyersSkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i}>
          <Card className="gap-0 rounded-lg p-4 [--card-spacing:0px]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-9 rounded-[10px]" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
              <Skeleton className="h-5 w-20 rounded-md" />
            </div>
            <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="mt-3 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function LawyersPageInner() {
  const params = useSearchParams();
  const highlightId = params.get("id");
  const { data, error, isPending, refetch, isFetching } = useMattersDirectory();

  const lawyers = useMemo(() => {
    if (!data) return [];
    return [...data.lawyers].sort(
      (a, b) => b.utilizationPct - a.utilizationPct
    );
  }, [data]);

  const overCount = lawyers.filter((l) => l.capacityState === "over").length;

  useEffect(() => {
    if (!highlightId || !data) return;
    const el = document.getElementById(`lawyer-card-${highlightId}`);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [highlightId, data]);

  const meta = data
    ? `${lawyers.length} co-counsel · ${overCount} over capacity`
    : undefined;

  return (
    <>
      <ZoneLabel title="Lawyers" meta={isPending ? "Loading…" : meta} />

      {isPending ? <LawyersSkeleton /> : null}

      {error || (!isPending && !data) ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Couldn&apos;t load lawyers.</AlertTitle>
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
      ) : null}

      {data ? (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {lawyers.map((lawyer) => (
            <LawyerCard
              key={lawyer.id}
              lawyer={lawyer}
              matters={data.matters}
              highlighted={highlightId === lawyer.id}
            />
          ))}
        </ul>
      ) : null}
    </>
  );
}

export default function LawyersPage() {
  return (
    <AppShell>
      <AutoHideScroll className="min-h-0 flex-1">
        <div className="min-w-0 px-4 pt-6 pb-12 md:px-8">
          {/* Overview centres a 1440px column beside a 340px Pulse rail. No rail
              here, so cap at 1440 + 340 to land on the same left edge. */}
          <div className="mx-auto w-full min-w-0 max-w-[1780px]">
            <Suspense
              fallback={
                <>
                  <ZoneLabel title="Lawyers" meta="Loading…" />
                  <LawyersSkeleton />
                </>
              }
            >
              <LawyersPageInner />
            </Suspense>
          </div>
        </div>
      </AutoHideScroll>
    </AppShell>
  );
}
