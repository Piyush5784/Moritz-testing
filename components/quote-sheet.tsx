"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQuote } from "@/lib/use-actions";
import type { MatterStatus } from "@/lib/supabase";
import { useSheetSide } from "@/hooks/use-sheet-side";
import { SheetHandle } from "@/components/sheet-handle";
import { cn } from "cn";

const glassStyle: React.CSSProperties = {
  background: "var(--glass-bg)",
  border: "1px solid var(--glass-border)",
  boxShadow: "var(--glass-shadow)",
};

export function QuoteSheet({
  matter,
  suggestedFee,
  comparableCount,
  open,
  onOpenChange,
}: {
  matter: MatterStatus | null;
  suggestedFee: number | null;
  comparableCount: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const quote = useQuote();
  const [fee, setFee] = useState(
    suggestedFee != null ? String(suggestedFee) : ""
  );
  const seed = open ? `${matter?.id ?? ""}:${suggestedFee ?? ""}` : "";
  const [prevSeed, setPrevSeed] = useState(seed);
  if (seed !== prevSeed) {
    setPrevSeed(seed);
    if (open) {
      setFee(suggestedFee != null ? String(suggestedFee) : "");
    }
  }

  const amount = Number(fee);
  const side = useSheetSide();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          "gap-0 border-0 bg-transparent p-0",
          side === "right" && "h-full w-full sm:max-w-[360px]",
          side === "bottom" && "h-[85vh] max-h-[85vh] w-full"
        )}
        style={glassStyle}
      >
        <SheetHandle visible={side === "bottom"} />
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle style={{ fontSize: "var(--text-14)" }}>
            Quote {matter?.reference ?? "matter"}
          </SheetTitle>
          <SheetDescription
            className="text-text-secondary"
            style={{ fontSize: "var(--text-12)" }}
          >
            {matter ? `${matter.client_name} · ${matter.type}` : "Loading…"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-3 px-5 py-4">
          <div className="space-y-2">
            <label
              htmlFor="quote-fee"
              className="font-medium text-foreground"
              style={{ fontSize: "var(--text-12)" }}
            >
              Fee
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-text-tertiary"
                style={{ fontSize: "var(--text-13)" }}
              >
                $
              </span>
              <Input
                id="quote-fee"
                type="number"
                min={1}
                step={1}
                value={fee}
                placeholder=""
                onChange={(e) => setFee(e.target.value)}
                className="num pl-6"
                disabled={quote.isPending || !matter}
              />
            </div>
            <p
              className="text-text-tertiary"
              style={{ fontSize: "var(--text-11)" }}
            >
              {comparableCount != null && suggestedFee != null ? (
                <>
                  Median for {matter?.type} across{" "}
                  <span className="num">{comparableCount}</span> comparable
                  matters.
                </>
              ) : (
                <>
                  No comparable matters yet. This is the first {matter?.type} at
                  this firm.
                </>
              )}
            </p>
          </div>
        </div>

        <SheetFooter className="flex-row gap-2 border-t border-border px-5 py-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={quote.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={
              !matter || quote.isPending || !amount || amount <= 0
            }
            onClick={() => {
              if (!matter || !amount) return;
              quote.mutate(
                {
                  matterId: matter.id,
                  reference: matter.reference,
                  fee: Math.round(amount),
                },
                { onSuccess: () => onOpenChange(false) }
              );
            }}
          >
            {quote.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Send quote
              </>
            ) : (
              "Send quote"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
