"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { browserClient } from "./supabase";

/** Invalidate the overview when matters or activity change. */
export function useRealtimeOverview() {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = browserClient
      .channel("overview")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matters" },
        () => qc.invalidateQueries({ queryKey: ["overview"] })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity" },
        () => qc.invalidateQueries({ queryKey: ["overview"] })
      )
      .subscribe();
    return () => {
      browserClient.removeChannel(channel);
    };
  }, [qc]);
}
