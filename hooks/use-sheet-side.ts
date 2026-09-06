"use client";

import { useEffect, useState } from "react";

/** Sheet side: bottom drawers below `md` (768), right drawers from `md` up. */
export function useSheetSide(): "bottom" | "right" {
  const [side, setSide] = useState<"bottom" | "right">("right");

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setSide(mq.matches ? "right" : "bottom");
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return side;
}
