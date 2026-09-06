"use client";

import { useQuery } from "@tanstack/react-query";
import type { MattersDirectoryPayload } from "@/lib/supabase";

export async function fetchMattersDirectory(): Promise<MattersDirectoryPayload> {
  const res = await fetch("/api/matters/all");
  if (!res.ok) {
    throw new Error("Couldn't load matters.");
  }
  return res.json();
}

export function useMattersDirectory() {
  return useQuery({
    queryKey: ["matters-all"],
    queryFn: fetchMattersDirectory,
    refetchInterval: 60_000,
  });
}
