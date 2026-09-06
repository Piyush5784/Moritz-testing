"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { RealtimeOverview } from "@/components/realtime-overview";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <RealtimeOverview />
      <AppSidebar />
      <SidebarInset className="h-full min-h-0 min-w-0 overflow-hidden">
        <SiteHeader />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function OutOfScopePage({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <AppShell>
      <div className="flex min-h-0 flex-1 items-center justify-center px-8 py-12">
        <div className="max-w-[420px] space-y-4 text-center">
          <h2
            className="font-semibold text-foreground"
            style={{ fontSize: "var(--text-14)" }}
          >
            {title}
          </h2>
          <p
            className="text-text-secondary"
            style={{ fontSize: "var(--text-13)" }}
          >
            {body}
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/">Back to overview</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

export function ComingSoonPage({ title }: { title: string }) {
  return (
    <AppShell>
      <div className="flex min-h-0 flex-1 items-center justify-center px-8 py-12">
        <div className="max-w-[420px] space-y-4 text-center">
          <h2
            className="font-semibold text-foreground"
            style={{ fontSize: "var(--text-14)" }}
          >
            {title}
          </h2>
          <p
            className="text-text-secondary"
            style={{ fontSize: "var(--text-13)" }}
          >
            This page is being built. The palette and sidebar land here so the
            product reads as a system, not a poster.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/">Back to overview</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
