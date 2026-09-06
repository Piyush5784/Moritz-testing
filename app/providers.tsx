"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ActionsProvider } from "@/components/actions-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { DashboardOverlays } from "@/components/dashboard-overlays";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ActionsProvider>
            {children}
            <DashboardOverlays />
            <Toaster richColors={false} position="bottom-right" />
          </ActionsProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
