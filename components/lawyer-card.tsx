"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CapacityMeter } from "@/components/ui-bits/capacity-meter";
import { MinutesLeft } from "@/components/ui-bits/minutes-left";
import { StatusBadge } from "@/components/ui-bits/status-badge";
import { LawyerAvatar } from "@/components/ui-bits/lawyer-avatar";
import { useDashboardActions } from "@/components/actions-provider";
import type { LawyerLoad, MatterStatus } from "@/lib/supabase";
import { cn } from "cn";

const capacityTone = {
  room: "ok" as const,
  high: "watch" as const,
  over: "risk" as const,
};

export function LawyerCard({
  lawyer,
  matters,
  highlighted,
}: {
  lawyer: LawyerLoad;
  matters: MatterStatus[];
  highlighted: boolean;
}) {
  const { openAssignForLawyer } = useDashboardActions();

  const live = useMemo(
    () =>
      matters
        .filter(
          (m) => m.lawyer_id === lawyer.id && m.stage !== "delivered"
        )
        .sort((a, b) => a.minutes_remaining - b.minutes_remaining),
    [matters, lawyer.id]
  );

  const preview = live.slice(0, 4);
  const more = live.length - preview.length;

  return (
    <li>
      <Card
        id={`lawyer-card-${lawyer.id}`}
        className={cn(
          "gap-0 rounded-lg p-4 transition-colors duration-500 [--card-spacing:0px]",
          highlighted && "bg-surface-selected"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <LawyerAvatar
              lawyerId={lawyer.id}
              name={lawyer.name}
              initials={lawyer.initials}
              size="lg"
              className="rounded-[10px] after:rounded-[10px]"
            />
            <div className="min-w-0">
              <div
                className="truncate font-semibold text-foreground"
                style={{ fontSize: "var(--text-14)" }}
              >
                {lawyer.name}
              </div>
              <div
                className="truncate text-text-tertiary"
                style={{ fontSize: "var(--text-11)" }}
              >
                {lawyer.practice_areas.join(" · ")}
              </div>
            </div>
          </div>
          <StatusBadge tone={capacityTone[lawyer.capacityState]}>
            {lawyer.capacityLabel}
          </StatusBadge>
        </div>

        <div className="mt-3">
          <CapacityMeter
            pct={lawyer.utilizationPct}
            state={lawyer.capacityState}
            label={lawyer.capacityLabel}
            name={lawyer.name}
            layout="stacked"
          />
        </div>

        <div
          className="mt-3 grid grid-cols-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="py-2.5 pr-2">
            <div
              className="num font-semibold text-foreground"
              style={{ fontSize: "var(--text-14)" }}
            >
              {lawyer.activeMatters}
            </div>
            <div
              className="text-text-tertiary"
              style={{ fontSize: "var(--text-11)" }}
            >
              Active matters
            </div>
          </div>
          <div
            className="px-2 py-2.5"
            style={{
              borderLeft: "1px solid var(--border)",
              borderRight: "1px solid var(--border)",
            }}
          >
            <div
              className="num font-semibold text-foreground"
              style={{ fontSize: "var(--text-14)" }}
            >
              {lawyer.delivered_this_week} of {lawyer.weekly_target}
            </div>
            <div
              className="text-text-tertiary"
              style={{ fontSize: "var(--text-11)" }}
            >
              This week
            </div>
          </div>
          <div className="py-2.5 pl-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-default">
                  <div
                    className="num font-semibold text-foreground"
                    style={{ fontSize: "var(--text-14)" }}
                  >
                    {Math.round(lawyer.on_time_rate * 100)}%
                  </div>
                  <div
                    className="text-text-tertiary"
                    style={{ fontSize: "var(--text-11)" }}
                  >
                    On time
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                Share of this lawyer&apos;s matters delivered inside the four
                hour window. Used to predict which matters are likely to slip.
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div
          className="mt-1 space-y-2 pt-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {preview.length === 0 ? (
            <p
              className="text-text-secondary"
              style={{ fontSize: "var(--text-12)" }}
            >
              No active matters
            </p>
          ) : (
            <>
              {preview.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div
                      className="truncate font-medium text-foreground"
                      style={{ fontSize: "var(--text-13)" }}
                    >
                      {m.reference}
                    </div>
                    <div
                      className="truncate text-text-tertiary"
                      style={{ fontSize: "var(--text-11)" }}
                    >
                      {m.type}
                    </div>
                  </div>
                  <MinutesLeft minutes={m.minutes_remaining} />
                </div>
              ))}
              {more > 0 ? (
                <p
                  className="text-text-tertiary"
                  style={{ fontSize: "var(--text-12)" }}
                >
                  and {more} more
                </p>
              ) : null}
            </>
          )}
        </div>

        {lawyer.capacityState === "over" ? (
          <div className="mt-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => openAssignForLawyer(lawyer.id)}
            >
              Reassign
            </Button>
          </div>
        ) : null}
      </Card>
    </li>
  );
}
