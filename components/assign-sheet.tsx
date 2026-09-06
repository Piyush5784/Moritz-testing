"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui-bits/status-badge";
import { CapacityMeter } from "@/components/ui-bits/capacity-meter";
import { LawyerAvatar } from "@/components/ui-bits/lawyer-avatar";
import { useAssign } from "@/lib/use-actions";
import type { LawyerLoad, MatterStatus } from "@/lib/supabase";
import { useSheetSide } from "@/hooks/use-sheet-side";
import { SheetHandle } from "@/components/sheet-handle";
import { cn } from "cn";

type CandidatesPayload = {
  matter: MatterStatus;
  candidates: (LawyerLoad & { practiceMatch: boolean })[];
  suggestedId: string | null;
  reason: string | null;
};

function minutesLabel(minutes: number) {
  if (minutes < 0) {
    return (
      <>
        past due by <span className="num">{Math.abs(minutes)}</span> min
      </>
    );
  }
  return (
    <>
      <span className="num">{minutes}</span> min left
    </>
  );
}

const glassStyle: React.CSSProperties = {
  background: "var(--glass-bg)",
  border: "1px solid var(--glass-border)",
  boxShadow: "var(--glass-shadow)",
};

export function AssignSheet({
  matterId,
  mode,
  open,
  onOpenChange,
}: {
  matterId: string | null;
  mode: "assign" | "reassign";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const assign = useAssign();

  const { data, isPending, error } = useQuery({
    queryKey: ["candidates", matterId],
    queryFn: async (): Promise<CandidatesPayload> => {
      const res = await fetch(`/api/matters/${matterId}/candidates`);
      if (!res.ok) throw new Error("Could not load available lawyers.");
      return res.json();
    },
    enabled: open && !!matterId,
  });

  const allOver =
    !!data &&
    data.candidates.length > 0 &&
    data.candidates.every((c) => c.capacityState === "over");
  const side = useSheetSide();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          "gap-0 border-0 bg-transparent p-0",
          side === "right" && "h-full w-full sm:max-w-[400px]",
          side === "bottom" && "h-[85vh] max-h-[85vh] w-full"
        )}
        style={glassStyle}
      >
        <SheetHandle visible={side === "bottom"} />
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle style={{ fontSize: "var(--text-14)" }}>
            {mode === "reassign" ? "Reassign" : "Assign"}{" "}
            {data?.matter.reference ?? "matter"}
          </SheetTitle>
          <SheetDescription
            className="text-text-secondary"
            style={{ fontSize: "var(--text-12)" }}
          >
            {data ? (
              <>
                {data.matter.client_name} · {data.matter.type} ·{" "}
                {data.matter.service_line} ·{" "}
                {minutesLabel(data.matter.minutes_remaining)}
              </>
            ) : (
              "Loading candidates…"
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isPending ? (
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                >
                  <Skeleton className="size-7 rounded-[9px]" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          ) : error || !data ? (
            <p
              className="px-3 py-8 text-center text-text-secondary"
              style={{ fontSize: "var(--text-13)" }}
            >
              Couldn&apos;t load available lawyers.
            </p>
          ) : (
            <>
              {allOver ? (
                <p
                  className="px-3 py-4 text-center text-text-secondary"
                  style={{ fontSize: "var(--text-13)" }}
                >
                  Everyone is at capacity. Assigning here will put someone over.
                </p>
              ) : null}
              <ul className="space-y-1">
                {data.candidates.map((lawyer) => {
                  const suggested = lawyer.id === data.suggestedId;
                  const pending =
                    assign.isPending &&
                    assign.variables?.lawyerId === lawyer.id;

                  return (
                    <li key={lawyer.id}>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={assign.isPending}
                        aria-label={`Assign ${data.matter.reference} to ${lawyer.name}, ${lawyer.utilizationPct} percent capacity`}
                        className="h-auto w-full items-start justify-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-surface-hover"
                        onClick={() => {
                          assign.mutate(
                            {
                              matterId: data.matter.id,
                              lawyerId: lawyer.id,
                              lawyerName: lawyer.name,
                              reference: data.matter.reference,
                              mode,
                            },
                            {
                              onSuccess: () => onOpenChange(false),
                            }
                          );
                        }}
                      >
                        <LawyerAvatar
                          lawyerId={lawyer.id}
                          name={lawyer.name}
                          initials={lawyer.initials}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="truncate font-medium text-foreground"
                              style={{ fontSize: "var(--text-13)" }}
                            >
                              {lawyer.name}
                            </span>
                            {suggested && data.reason ? (
                              <StatusBadge tone="info">Suggested</StatusBadge>
                            ) : null}
                            {pending ? (
                              <Loader2 className="size-3.5 animate-spin text-text-tertiary" />
                            ) : null}
                          </div>
                          <div
                            className="truncate text-text-tertiary"
                            style={{ fontSize: "var(--text-11)" }}
                          >
                            {lawyer.practice_areas.join(" · ")}
                          </div>
                          {suggested && data.reason ? (
                            <div
                              className="mt-1 text-text-tertiary"
                              style={{ fontSize: "var(--text-11)" }}
                            >
                              {data.reason}
                            </div>
                          ) : null}
                        </div>
                        <CapacityMeter
                          compact
                          pct={lawyer.utilizationPct}
                          state={lawyer.capacityState}
                          label={lawyer.capacityLabel}
                          name={lawyer.name}
                        />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
