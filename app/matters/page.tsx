"use client";

import { Suspense } from "react";
import { AlertCircle, Search } from "lucide-react";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppShell } from "@/components/app-shell";
import { ZoneLabel } from "@/components/ui-bits/zone-label";
import {
  MattersTable,
  MattersTableSkeleton,
  type MattersFilter,
} from "@/components/matters-table";
import { useMattersDirectory } from "@/hooks/use-matters-directory";
import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const TABS: { value: MattersFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "at-risk", label: "At risk" },
  { value: "unassigned", label: "Unassigned" },
  { value: "in-flight", label: "In flight" },
  { value: "delivered", label: "Delivered" },
];

function parseFilter(raw: string | null): MattersFilter {
  switch (raw) {
    case "at-risk":
    case "unassigned":
    case "in-flight":
    case "delivered":
    case "over-capacity":
      return raw;
    default:
      return "all";
  }
}

function MattersPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { data, error, isPending, refetch, isFetching } = useMattersDirectory();

  const filter = parseFilter(params.get("filter"));
  const search = params.get("q") ?? "";
  const highlightRef = params.get("ref") ?? params.get("highlight");

  const setParams = useCallback(
    (next: { filter?: MattersFilter; q?: string; clearHighlight?: boolean }) => {
      const sp = new URLSearchParams(params.toString());
      if (next.filter !== undefined) {
        if (next.filter === "all") sp.delete("filter");
        else sp.set("filter", next.filter);
      }
      if (next.q !== undefined) {
        if (!next.q) sp.delete("q");
        else sp.set("q", next.q);
      }
      if (next.clearHighlight) {
        sp.delete("ref");
        sp.delete("highlight");
      }
      const qs = sp.toString();
      router.replace(qs ? `/matters?${qs}` : "/matters", { scroll: false });
    },
    [params, router]
  );

  const meta = useMemo(() => {
    if (!data) return undefined;
    const total = data.matters.length;
    const live = data.matters.filter((m) => m.stage !== "delivered").length;
    return `${total} matters · ${live} in flight`;
  }, [data]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ZoneLabel title="Matters" meta={isPending ? "Loading…" : meta} />

      {isPending ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="h-8 w-80 rounded-lg bg-muted" />
            <div className="h-8 w-56 rounded-lg bg-muted" />
          </div>
          <MattersTableSkeleton />
        </div>
      ) : null}

      {error || (!isPending && !data) ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Couldn&apos;t load matters.</AlertTitle>
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
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs
              value={filter}
              onValueChange={(v) =>
                setParams({
                  filter: parseFilter(v),
                  clearHighlight: true,
                })
              }
            >
              <TabsList variant="line">
                {TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:max-w-xs">
              <label htmlFor="matters-search" className="sr-only">
                Search matters by reference, client, or type
              </label>
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-text-tertiary"
                aria-hidden
              />
              <Input
                id="matters-search"
                type="search"
                value={search}
                placeholder="Search reference, client, type"
                className="pl-8"
                style={{ fontSize: "var(--text-13)" }}
                onChange={(e) =>
                  setParams({
                    q: e.target.value,
                    clearHighlight: true,
                  })
                }
              />
            </div>
          </div>

          <MattersTable
            matters={data.matters}
            lawyers={data.lawyers}
            filter={filter}
            search={search}
            highlightRef={highlightRef}
            onShowAll={() =>
              setParams({
                filter: "all",
                q: "",
                clearHighlight: true,
              })
            }
          />
        </div>
      ) : null}
    </div>
  );
}

export default function MattersPage() {
  return (
    <AppShell>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col px-4 pt-6 pb-6 md:px-8">
        <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-[1780px] flex-1 flex-col">
          <Suspense
            fallback={
              <>
                <ZoneLabel title="Matters" meta="Loading…" />
                <MattersTableSkeleton />
              </>
            }
          >
            <MattersPageInner />
          </Suspense>
        </div>
      </div>
    </AppShell>
  );
}
