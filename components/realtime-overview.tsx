"use client";

import { useRealtimeOverview } from "@/lib/use-realtime";

/** Mount once so Postgres changes invalidate the shared overview query. */
export function RealtimeOverview() {
  useRealtimeOverview();
  return null;
}
