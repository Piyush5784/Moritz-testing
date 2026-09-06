"use client";

import { usePathname } from "next/navigation";
import { MessageSquare, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useDashboardActions } from "@/components/actions-provider";

const TITLES: Record<string, string> = {
  "/": "Overview",
  "/matters": "Matters",
  "/lawyers": "Lawyers",
  "/clients": "Clients",
  "/finance": "Finance",
  "/settings": "Settings",
};

export function SiteHeader() {
  const pathname = usePathname();
  const { openCommandPalette, openNewMatter, openChat } =
    useDashboardActions();
  const page =
    TITLES[pathname] ??
    TITLES[`/${pathname.split("/")[1]}`] ??
    "Overview";

  return (
    <header className="sticky top-0 z-30 flex h-(--topbar-h) shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-4 sm:gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1 min-h-11 min-w-11 md:min-h-8 md:min-w-8" />
        <Separator orientation="vertical" className="mr-1 hidden h-4 sm:block" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden sm:inline-flex">
              <span className="text-muted-foreground">Moritz</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{page}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="sr-only">{page}</h1>
      </div>

      <div className="flex min-w-0 shrink items-center gap-1.5 sm:gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="min-h-11 min-w-11 sm:hidden"
          aria-keyshortcuts="Meta+K Control+K"
          onClick={() => openCommandPalette()}
        >
          <Search className="size-4" aria-hidden />
          <span className="sr-only">Search matters, lawyers, clients</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="hidden h-8 max-w-xs min-w-0 flex-1 justify-between gap-3 px-2.5 font-normal text-text-tertiary sm:inline-flex"
          style={{ fontSize: "var(--text-13)" }}
          aria-keyshortcuts="Meta+K Control+K"
          onClick={() => openCommandPalette()}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Search className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">Search matters, lawyers, clients</span>
          </span>
          <kbd
            className="pointer-events-none inline-flex h-5 items-center rounded-md border border-border px-1.5 font-medium text-text-tertiary"
            style={{ fontSize: "var(--text-11)" }}
          >
            ⌘K
          </kbd>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="min-h-11 min-w-11 sm:hidden"
          aria-keyshortcuts="Meta+J Control+J"
          onClick={() => openChat()}
        >
          <MessageSquare className="size-4" aria-hidden />
          <span className="sr-only">Ask</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="hidden min-h-11 shrink-0 sm:inline-flex md:min-h-8"
          aria-keyshortcuts="Meta+J Control+J"
          onClick={() => openChat()}
        >
          Ask
        </Button>
        <Button
          type="button"
          size="icon"
          className="min-h-11 min-w-11 min-[390px]:hidden"
          onClick={() => openNewMatter()}
        >
          <Plus className="size-4" aria-hidden />
          <span className="sr-only">New matter</span>
        </Button>
        <Button
          type="button"
          size="sm"
          className="hidden min-h-11 shrink-0 min-[390px]:inline-flex md:min-h-8"
          onClick={() => openNewMatter()}
        >
          New matter
        </Button>
      </div>
    </header>
  );
}
