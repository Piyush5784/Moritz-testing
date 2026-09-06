"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { OverviewPayload } from "@/lib/supabase";
import { useDashboardActions } from "@/components/actions-provider";

type Brief = NonNullable<OverviewPayload["ai"]["brief"]>;

export function MorningBrief({ brief }: { brief: Brief | null }) {
  const [dismissed, setDismissed] = useState(false);
  const { handleAttentionAction } = useDashboardActions();

  if (!brief || dismissed) return null;

  return (
    <Card className="mb-3 flex flex-col gap-2 rounded-lg border border-border bg-card px-4 py-2.5 ring-0 [--card-spacing:0px] sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1" style={{ fontSize: "var(--text-13)" }}>
        <span className="font-semibold text-foreground">{brief.headline}</span>{" "}
        <span className="font-normal text-foreground">{brief.detail}</span>
      </div>
      {brief.action ? (
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            size="sm"
            className="min-h-11 flex-1 sm:min-h-8 sm:flex-none"
            onClick={() => handleAttentionAction(brief.action!)}
          >
            {brief.action.action}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="min-h-11 sm:min-h-8"
            onClick={() => setDismissed(true)}
          >
            Dismiss
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
