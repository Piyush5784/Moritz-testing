"use client";

import { type ReactNode } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "cn";

/**
 * Full-width People / Money / Pulse tabs for viewports below the Pulse rail
 * (`xl`). Sticky under the topbar so switching context does not scroll away.
 */
export function OverviewTabs({
  people,
  money,
  pulse,
  className,
}: {
  people: ReactNode;
  money: ReactNode;
  pulse: ReactNode;
  className?: string;
}) {
  return (
    <Tabs defaultValue="people" className={cn("gap-3", className)}>
      <TabsList
        variant="line"
        className="sticky top-(--topbar-h) z-20 h-auto w-full justify-stretch gap-0 rounded-none border-b border-border bg-background p-0"
      >
        <TabsTrigger
          value="people"
          className="min-h-11 flex-1 rounded-none px-2 py-2.5"
          style={{ fontSize: "var(--text-13)" }}
        >
          People
        </TabsTrigger>
        <TabsTrigger
          value="money"
          className="min-h-11 flex-1 rounded-none px-2 py-2.5"
          style={{ fontSize: "var(--text-13)" }}
        >
          Money
        </TabsTrigger>
        <TabsTrigger
          value="pulse"
          className="min-h-11 flex-1 rounded-none px-2 py-2.5"
          style={{ fontSize: "var(--text-13)" }}
        >
          Pulse
        </TabsTrigger>
      </TabsList>
      <TabsContent value="people" className="mt-3 outline-none">
        {people}
      </TabsContent>
      <TabsContent value="money" className="mt-3 outline-none">
        {money}
      </TabsContent>
      <TabsContent value="pulse" className="mt-3 outline-none">
        {pulse}
      </TabsContent>
    </Tabs>
  );
}
