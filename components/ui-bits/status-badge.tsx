import { cn } from "cn";
import type { AttentionItem, Stage } from "@/lib/supabase";

export type StatusTone = "risk" | "watch" | "ok" | "info" | "neutral";

/** Stage badge tones stay separate from the clock (Left) signal. */
export function stageTone(stage: Stage): StatusTone {
  switch (stage) {
    case "submitted":
      return "neutral";
    case "quoted":
    case "drafting":
      return "info";
    case "review":
      return "watch";
    case "delivered":
      return "ok";
  }
}

export function stageLabel(stage: Stage): string {
  switch (stage) {
    case "submitted":
      return "Submitted";
    case "quoted":
      return "Quoted";
    case "drafting":
      return "Drafting";
    case "review":
      return "In review";
    case "delivered":
      return "Delivered";
  }
}

const toneVars: Record<StatusTone, { fg: string }> = {
  risk: { fg: "var(--status-risk-fg)" },
  watch: { fg: "var(--status-watch-fg)" },
  ok: { fg: "var(--status-ok-fg)" },
  info: { fg: "var(--status-info-fg)" },
  neutral: { fg: "var(--status-neutral-fg)" },
};

export function kindToTone(kind: AttentionItem["kind"]): StatusTone {
  switch (kind) {
    case "breach":
      return "risk";
    case "watch":
      return "watch";
    case "unassigned":
      return "info";
    case "overCapacity":
      return "risk";
    case "unquoted":
      return "neutral";
  }
}

export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  const vars = toneVars[tone];

  return (
    <span
      data-slot="status-badge"
      data-tone={tone}
      className={cn(
        "inline-flex w-fit shrink-0 items-center whitespace-nowrap font-medium",
        className
      )}
      style={{
        color: vars.fg,
        fontSize: "var(--text-11)",
      }}
    >
      {children}
    </span>
  );
}
