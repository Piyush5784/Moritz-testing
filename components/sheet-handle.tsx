/** Drag affordance for bottom sheets below `md`. */
export function SheetHandle({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      className="mx-auto mt-2 mb-1 h-1 w-10 shrink-0 rounded-full bg-border"
      aria-hidden
    />
  );
}
