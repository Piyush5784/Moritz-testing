"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LawyerAvatar } from "@/components/ui-bits/lawyer-avatar";

/** Stable seed for the ops user in the sidebar footer. */
const INGRID_ID = "ingrid";

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-auto w-full justify-start gap-2.5 rounded-md px-1 py-1.5 text-left hover:bg-surface-hover group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <LawyerAvatar
            lawyerId={INGRID_ID}
            name="Ingrid Solberg"
            initials="IS"
            size="sm"
            className="rounded-full after:rounded-full"
          />
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <div
              className="truncate font-medium text-foreground"
              style={{ fontSize: "var(--text-13)" }}
            >
              Ingrid Solberg
            </div>
            <div
              className="truncate text-text-tertiary"
              style={{ fontSize: "var(--text-11)" }}
            >
              Head of operations
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        className="w-56"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          boxShadow: "var(--glass-shadow)",
        }}
      >
        <DropdownMenuLabel className="font-normal">
          <div
            className="font-medium text-foreground"
            style={{ fontSize: "var(--text-13)" }}
          >
            Ingrid Solberg
          </div>
          <div
            className="text-text-tertiary"
            style={{ fontSize: "var(--text-11)" }}
          >
            ingrid@moritzlegal.com
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="flex-col items-start gap-0.5">
          <span>Sign out</span>
          <span
            className="font-normal text-text-tertiary"
            style={{ fontSize: "var(--text-11)" }}
          >
            Authentication is out of scope for this concept.
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
