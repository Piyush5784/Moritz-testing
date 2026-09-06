"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  TiptapEditor,
  type TiptapEditorHandle,
} from "@/components/tiptap-editor";
import type { MatterStatus } from "@/lib/supabase";
import { cn } from "cn";
import { useSheetSide } from "@/hooks/use-sheet-side";
import { SheetHandle } from "@/components/sheet-handle";

const glassStyle: React.CSSProperties = {
  background: "var(--glass-bg)",
  border: "1px solid var(--glass-border)",
  boxShadow: "var(--glass-shadow)",
};

export type ClientUpdateSituation = "slipped" | "delivered";

function formatTurnaround(submittedAt: string, deliveredAt: string): string {
  const mins = Math.max(
    0,
    Math.round(
      (new Date(deliveredAt).getTime() - new Date(submittedAt).getTime()) /
        60_000
    )
  );
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function situationLine(
  matter: MatterStatus,
  situation: ClientUpdateSituation
): string {
  if (situation === "slipped") {
    const past = Math.abs(Math.min(0, matter.minutes_remaining));
    return `${past} minutes past due`;
  }
  if (matter.delivered_at) {
    return `delivered in ${formatTurnaround(matter.submitted_at, matter.delivered_at)}`;
  }
  return "just delivered";
}

export function ClientUpdateSheet({
  matter,
  situation,
  open,
  onOpenChange,
}: {
  matter: MatterStatus | null;
  situation: ClientUpdateSituation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const reduceMotion = useReducedMotion();
  const editorRef = useRef<TiptapEditorHandle>(null);
  const abortRef = useRef<AbortController | null>(null);
  const baselineRef = useRef("");
  const userEditedRef = useRef(false);

  const [streaming, setStreaming] = useState(false);
  const [hasTokens, setHasTokens] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [sending, setSending] = useState(false);
  const [draftText, setDraftText] = useState("");
  const [announce, setAnnounce] = useState("");
  const showPlaceholder = !hasTokens;

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }, []);

  const startStream = useCallback(async () => {
    if (!matter || !situation) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    editorRef.current?.clear();
    baselineRef.current = "";
    userEditedRef.current = false;
    setDraftText("");
    setHasTokens(false);
    setError(null);
    setConfirmRegen(false);
    setAnnounce("");
    setStreaming(true);

    try {
      const res = await fetch("/api/draft-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matterId: matter.id, situation }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const errText =
          (await res.text().catch(() => "")) ||
          "Couldn't draft the update. Try again.";
        setError(errText);
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        full += chunk;
        editorRef.current?.appendText(chunk);
        setHasTokens(true);
        setDraftText(full);
        baselineRef.current = full;
      }

      setAnnounce(full);
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        // Keep partial text.
      } else {
        setError("Couldn't draft the update. Try again.");
      }
    } finally {
      abortRef.current = null;
      setStreaming(false);
    }
  }, [matter, situation]);

  useEffect(() => {
    if (!open || !matter || !situation) return;
    const timer = window.setTimeout(() => {
      void startStream();
    }, 0);
    return () => {
      window.clearTimeout(timer);
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, [open, matter, situation, startStream]);

  // Placeholder visibility is derived from hasTokens (see showPlaceholder).
  const onEditorChange = (text: string) => {
    setDraftText(text);
    if (text !== baselineRef.current) {
      userEditedRef.current = true;
    }
  };

  const requestRegenerate = () => {
    if (userEditedRef.current && draftText.trim()) {
      setConfirmRegen(true);
      return;
    }
    void startStream();
  };

  const send = async () => {
    if (!matter || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/matters/${matter.id}/client-update`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not log the update.");
      }
      toast.success(`Update logged for ${matter.client_name}.`);
      qc.invalidateQueries({ queryKey: ["overview"] });
      onOpenChange(false);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not log the update."
      );
    } finally {
      setSending(false);
    }
  };

  const title = matter
    ? `Update ${matter.client_name}`
    : "Update client";
  const side = useSheetSide();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          "gap-0 border-0 bg-transparent p-0",
          side === "right" && "h-full w-full sm:max-w-[460px]",
          side === "bottom" && "h-[85vh] max-h-[85vh] w-full"
        )}
        style={glassStyle}
      >
        <SheetHandle visible={side === "bottom"} />
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle style={{ fontSize: "var(--text-14)" }}>
            {title}
          </SheetTitle>
          {matter && situation ? (
            <SheetDescription
              className="text-text-tertiary"
              style={{ fontSize: "var(--text-11)" }}
            >
              {matter.reference} · {matter.type} ·{" "}
              {situationLine(matter, situation)}
            </SheetDescription>
          ) : (
            <SheetDescription className="sr-only">
              Draft a client update
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 py-4">
          <div className="relative">
            <TiptapEditor
              ref={editorRef}
              editable
              onChange={onEditorChange}
              placeholder=""
              aria-label={title}
            />
            {showPlaceholder ? (
              <p
                className={cn(
                  "pointer-events-none absolute top-2.5 left-3 text-text-tertiary",
                  !reduceMotion && "transition-opacity duration-[120ms]",
                  hasTokens ? "opacity-0" : "opacity-100"
                )}
                style={{ fontSize: "var(--text-13)" }}
                aria-hidden
              >
                Draft appears here…
              </p>
            ) : null}
          </div>

          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {!streaming && announce ? announce : ""}
          </div>

          {error && !hasTokens ? (
            <div className="space-y-2">
              <p
                className="text-text-secondary"
                style={{ fontSize: "var(--text-13)" }}
              >
                {error}
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void startStream()}
              >
                Retry
              </Button>
            </div>
          ) : null}

          {confirmRegen ? (
            <div
              className="flex flex-wrap items-center gap-2 rounded-md px-3 py-2"
              style={{ background: "var(--status-info-bg)" }}
            >
              <p
                className="flex-1 text-text-secondary"
                style={{ fontSize: "var(--text-12)" }}
              >
                Regenerating replaces your edits.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setConfirmRegen(false);
                  void startStream();
                }}
              >
                Confirm
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setConfirmRegen(false)}
              >
                Cancel
              </Button>
            </div>
          ) : null}
        </div>

        <SheetFooter className="flex-col items-stretch gap-2 border-t border-border px-5 py-3 sm:flex-col">
          {streaming ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              aria-label="Stop drafting"
              onClick={stop}
            >
              Stop
            </Button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                disabled={sending || !draftText.trim()}
                aria-label="Send update"
                onClick={() => void send()}
              >
                {sending ? "Sending…" : "Send update"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={sending}
                onClick={requestRegenerate}
              >
                Regenerate
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={sending}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          )}
          <p
            className="text-text-tertiary"
            style={{ fontSize: "var(--text-11)" }}
          >
            Sending logs the update. Email delivery is out of scope for this
            concept.
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
