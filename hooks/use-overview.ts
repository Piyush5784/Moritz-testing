"use client";

import { useQuery } from "@tanstack/react-query";
import type { OverviewPayload } from "@/lib/supabase";

export async function fetchOverview(): Promise<OverviewPayload> {
  const res = await fetch("/api/overview");
  if (!res.ok) {
    throw new Error("Couldn't load the firm overview.");
  }
  return res.json();
}

export function useOverview() {
  return useQuery({
    queryKey: ["overview"],
    queryFn: fetchOverview,
    refetchInterval: 60_000,
  });
}
