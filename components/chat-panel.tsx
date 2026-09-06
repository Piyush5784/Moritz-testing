"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Square } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChatMessage,
  extractChatActions,
  type ChatMessageData,
} from "@/components/chat-message";
import { useOverview } from "@/hooks/use-overview";
import type { OverviewPayload, ServiceLine } from "@/lib/supabase";
import { cn } from "cn";
import { useSheetSide } from "@/hooks/use-sheet-side";
import { SheetHandle } from "@/components/sheet-handle";

const glassStyle: React.CSSProperties = {
  background: "var(--glass-bg)",
  borderLeft: "1px solid var(--glass-border)",
  boxShadow: "var(--glass-shadow)",
};

const inputSurfaceStyle: React.CSSProperties = {
  background: "var(--glass-bg)",
};

type ApiMessage = { role: "user" | "assistant"; content: string };

function formatUpdatedAt(iso: string | undefined): string {
  if (!iso) return "just now";
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function topServiceLine(payload: OverviewPayload): ServiceLine {
  const counts = new Map<ServiceLine, number>();
  for (const m of payload.matters) {
    if (m.stage === "delivered") continue;
    counts.set(m.service_line, (counts.get(m.service_line) ?? 0) + 1);
  }
  let best: ServiceLine = "Commercial";
  let max = -1;
  for (const [line, n] of counts) {
    if (n > max) {
      max = n;
      best = line;
    }
  }
  return best;
}

function turnaroundPrompt(payload: OverviewPayload): string {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const thisWeekStart = now - weekMs;
  const lastWeekStart = now - 2 * weekMs;

  const avg = (from: number, to: number) => {
    const rows = payload.matters.filter((m) => {
      if (!m.delivered_at || m.draft_minutes == null || m.review_minutes == null)
        return false;
      const t = new Date(m.delivered_at).getTime();
      return t >= from && t < to;
    });
    if (rows.length < 3) return null;
    const total = rows.reduce(
      (s, m) => s + (m.draft_minutes ?? 0) + (m.review_minutes ?? 0),
      0
    );
    return total / rows.length;
  };

  const thisWeek = avg(thisWeekStart, now);
  const lastWeek = avg(lastWeekStart, thisWeekStart);

  if (thisWeek != null && lastWeek != null && thisWeek > lastWeek) {
    return "Why is turnaround slower this week?";
  }
  return "What is our average turnaround this week?";
}

function buildSuggestions(payload: OverviewPayload | undefined): string[] {
  if (!payload) {
    return ["Show me everything at risk."];
  }
  return [
    `Who can take a ${topServiceLine(payload)} matter in the next hour?`,
    turnaroundPrompt(payload),
    "Show me everything at risk.",
  ];
}

export function ChatPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data } = useOverview();
  const side = useSheetSide();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, streamingId]);

  const suggestions = useMemo(() => buildSuggestions(data), [data]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreamingId(null);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || abortRef.current) return;

      setInput("");

      const userMsg: ChatMessageData = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      const assistantId = `a-${Date.now()}`;
      const assistantMsg: ChatMessageData = {
        id: assistantId,
        role: "assistant",
        content: "",
      };

      const history: ApiMessage[] = [...messagesRef.current, userMsg]
        .filter((m) => m.role === "user" || (m.role === "assistant" && m.content))
        .map((m) => ({ role: m.role, content: m.content }));

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setStreamingId(assistantId);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const errText =
            (await res.text().catch(() => "")) ||
            "Couldn't reach the assistant. Try again.";
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: errText, error: true }
                : m
            )
          );
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          const snapshot = full;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: snapshot } : m
            )
          );
        }

        const actions = data ? extractChatActions(full, data) : [];
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: full, actions } : m
          )
        );
      } catch (e) {
        if ((e as Error).name === "AbortError") {
          // Keep partial text; append nothing.
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: "Couldn't reach the assistant. Try again.",
                    error: true,
                  }
                : m
            )
          );
        }
      } finally {
        abortRef.current = null;
        setStreamingId(null);
      }
    },
    [data]
  );

  const retryLast = useCallback(() => {
    const prev = messagesRef.current;
    let lastUser = "";
    const next = [...prev];
    if (next.at(-1)?.role === "assistant") next.pop();
    const user = next.at(-1);
    if (user?.role === "user") {
      lastUser = user.content;
      next.pop();
    }
    setMessages(next);
    if (lastUser) void send(lastUser);
  }, [send]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          "gap-0 border-0 bg-transparent p-0 shadow-none",
          side === "right" &&
            "h-full w-[400px] max-w-[400px] sm:max-w-[400px]",
          side === "bottom" && "h-[85vh] max-h-[85vh] w-full"
        )}
      >
        <div
          className="flex h-full min-h-0 w-full flex-col overflow-hidden"
          style={
            side === "bottom"
              ? { ...glassStyle, borderLeft: "none", borderTop: "1px solid var(--glass-border)" }
              : glassStyle
          }
        >
          <SheetHandle visible={side === "bottom"} />
          <SheetHeader className="shrink-0 border-b border-border px-5 py-4 text-left">
            <SheetTitle style={{ fontSize: "var(--text-14)" }}>
              Ask about the firm
            </SheetTitle>
            <SheetDescription
              className="text-text-tertiary"
              style={{ fontSize: "var(--text-11)" }}
            >
              Answers come from this firm&apos;s live data. Updated{" "}
              {formatUpdatedAt(data?.generatedAt)}.
            </SheetDescription>
          </SheetHeader>

          <div
            ref={listRef}
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col gap-1.5">
                <p
                  className="text-text-tertiary"
                  style={{ fontSize: "var(--text-11)" }}
                >
                  Try asking
                </p>
                {suggestions.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="w-full rounded-lg border border-border bg-card/60 px-3 py-2.5 text-left text-text-secondary hover:bg-surface-hover"
                    style={{ fontSize: "var(--text-12)" }}
                    onClick={() => void send(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : (
              messages.map((m) => (
                <ChatMessage
                  key={m.id}
                  message={m}
                  streaming={m.id === streamingId}
                  onRetry={m.error ? retryLast : undefined}
                />
              ))
            )}
          </div>

          <div
            className="sticky bottom-0 shrink-0 border-t border-border px-5 py-3"
            style={inputSurfaceStyle}
          >
            <div className="flex min-w-0 items-end gap-2">
              <div className="min-w-0 flex-1 space-y-1">
                <label htmlFor="chat-ask" className="sr-only">
                  Ask about the firm
                </label>
                <Textarea
                  id="chat-ask"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Ask about matters, lawyers, or the month."
                  rows={1}
                  className="max-h-[4.5rem] min-h-9 w-full resize-none overflow-y-auto py-2"
                  style={{ fontSize: "var(--text-13)" }}
                  aria-describedby="chat-ask-hint"
                />
                <p id="chat-ask-hint" className="sr-only">
                  Press Enter to send. Shift+Enter for a new line.
                </p>
              </div>
              {streamingId ? (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="shrink-0"
                  aria-label="Stop generating"
                  onClick={stop}
                >
                  <Square className="size-3.5 fill-current" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  className="shrink-0"
                  disabled={!input.trim()}
                  onClick={() => void send(input)}
                >
                  Send
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
