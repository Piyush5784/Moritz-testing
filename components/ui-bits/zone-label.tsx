import { cn } from "cn";

export function ZoneLabel({
  title,
  meta,
  className,
  visuallyHidden = false,
}: {
  title: string;
  meta?: string;
  className?: string;
  /** Keep an h2 for outline order while the tab label is visible. */
  visuallyHidden?: boolean;
}) {
  if (visuallyHidden) {
    return <h2 className="sr-only">{title}</h2>;
  }

  return (
    <div className={cn("mb-3 flex items-baseline gap-2", className)}>
      <h2
        className="font-semibold text-foreground"
        style={{ fontSize: "var(--text-14)" }}
      >
        {title}
      </h2>
      {meta ? (
        <span
          className="text-text-tertiary"
          style={{ fontSize: "var(--text-12)" }}
        >
          {meta}
        </span>
      ) : null}
    </div>
  );
}
