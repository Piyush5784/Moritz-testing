"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { cn } from "cn";


export function AutoHideScroll({
  className,
  style,
  children,
  ...props
}: ComponentProps<"div">) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [thumb, setThumb] = useState({
    top: 0,
    height: 0,
    visible: false,
  });

  const syncThumb = useCallback((show: boolean) => {
    const el = scrollerRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight + 1) {
      setThumb((prev) =>
        prev.visible || prev.height ? { top: 0, height: 0, visible: false } : prev
      );
      return;
    }

    const height = Math.max((clientHeight / scrollHeight) * clientHeight, 28);
    const maxTop = clientHeight - height;
    const top =
      (scrollTop / (scrollHeight - clientHeight)) * maxTop;

    setThumb({ top, height, visible: show });

    if (show) {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        setThumb((prev) => ({ ...prev, visible: false }));
      }, 800);
    }
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => syncThumb(true);
    el.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => syncThumb(false));
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);

    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [syncThumb]);

  return (
    <div className={cn("relative min-h-0 min-w-0", className)} style={style}>
      <div
        ref={scrollerRef}
        className="no-scrollbar size-full overflow-y-auto"
        {...props}
      >
        {children}
      </div>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-0 right-0.5 z-20 w-1.5 rounded-full bg-foreground/25 transition-opacity duration-300 ease-out will-change-transform",
          thumb.visible ? "opacity-100" : "opacity-0"
        )}
        style={{
          height: thumb.height,
          transform: `translate3d(0, ${thumb.top}px, 0)`,
        }}
      />
    </div>
  );
}
