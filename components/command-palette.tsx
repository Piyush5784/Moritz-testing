"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  FilePlus,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Search,
  Send,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { useOverview } from "@/hooks/use-overview";
import { useDashboardActions } from "@/components/actions-provider";

const glassStyle: React.CSSProperties = {
  background: "var(--glass-bg)",
  border: "1px solid var(--glass-border)",
  boxShadow: "var(--glass-shadow)",
};

type Page = "root" | "assign" | "quote";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { data } = useOverview();
  const { openAssign, openQuote, openNewMatter, openChat } =
    useDashboardActions();
  const [page, setPage] = useState<Page>("root");
  if (!open && page !== "root") {
    setPage("root");
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const key = e.key.toLowerCase();
      if (key !== "k" && key !== "j") return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) {
        return;
      }
      e.preventDefault();
      if (key === "k") {
        onOpenChange(!open);
      } else {
        onOpenChange(false);
        openChat();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange, openChat]);

  const run = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  const unassigned =
    data?.matters.filter((m) => !m.lawyer_id && m.fee > 0) ?? [];
  const unquoted = data?.finance.unquoted ?? [];
  const matters = (data?.matters ?? []).slice(0, 8);
  const lawyers = data?.lawyers ?? [];

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Search actions, matters and lawyers"
      className="overflow-hidden border-0 bg-transparent p-0 shadow-none sm:max-w-lg"
      style={glassStyle}
    >
      <Command
        className="rounded-xl! bg-transparent"
        key={page}
      >
        <CommandInput
          aria-label={
            page === "assign"
              ? "Choose an unassigned matter"
              : page === "quote"
                ? "Choose a matter to quote"
                : "Search actions, matters, lawyers"
          }
          placeholder={
            page === "assign"
              ? "Choose an unassigned matter…"
              : page === "quote"
                ? "Choose a matter to quote…"
                : "Search actions, matters, lawyers…"
          }
        />
        <CommandList>
          <CommandEmpty>Nothing matches that.</CommandEmpty>

          {page === "assign" ? (
            <CommandGroup heading="Unassigned">
              {unassigned.map((m) => (
                <CommandItem
                  key={m.id}
                  value={`${m.reference} ${m.client_name}`}
                  onSelect={() =>
                    run(() => openAssign(m.id, "assign"))
                  }
                >
                  <UserPlus />
                  <span>
                    {m.reference} · {m.client_name}
                  </span>
                </CommandItem>
              ))}
              {unassigned.length === 0 ? (
                <CommandItem disabled value="none">
                  No unassigned matters
                </CommandItem>
              ) : null}
            </CommandGroup>
          ) : null}

          {page === "quote" ? (
            <CommandGroup heading="Unquoted">
              {unquoted.map((m) => (
                <CommandItem
                  key={m.id}
                  value={`${m.reference} ${m.client_name}`}
                  onSelect={() =>
                    run(() =>
                      openQuote(m, {
                        suggestedFee: m.suggestedFee,
                        comparableCount: m.comparableCount,
                      })
                    )
                  }
                >
                  <Send />
                  <span>
                    {m.reference} · {m.client_name}
                  </span>
                </CommandItem>
              ))}
              {unquoted.length === 0 ? (
                <CommandItem disabled value="none">
                  No unquoted matters
                </CommandItem>
              ) : null}
            </CommandGroup>
          ) : null}

          {page === "root" ? (
            <>
              <CommandGroup heading="Actions">
                <CommandItem
                  onSelect={() => run(() => openNewMatter())}
                >
                  <FilePlus />
                  <span>New matter</span>
                  <CommandShortcut>N</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => setPage("assign")}>
                  <UserPlus />
                  <span>Assign a matter</span>
                </CommandItem>
                <CommandItem onSelect={() => setPage("quote")}>
                  <Send />
                  <span>Send a quote</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => run(() => openChat())}
                >
                  <MessageSquare />
                  <span>Ask about the firm</span>
                  <CommandShortcut>⌘J</CommandShortcut>
                </CommandItem>
              </CommandGroup>

              <CommandGroup heading="Jump to">
                <CommandItem
                  onSelect={() => run(() => router.push("/"))}
                >
                  <LayoutDashboard />
                  <span>Overview</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => run(() => router.push("/matters"))}
                >
                  <FileText />
                  <span>Matters</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => run(() => router.push("/lawyers"))}
                >
                  <Users />
                  <span>Lawyers</span>
                </CommandItem>
              </CommandGroup>

              <CommandGroup heading="Filters">
                <CommandItem
                  onSelect={() =>
                    run(() => router.push("/matters?filter=at-risk"))
                  }
                >
                  <AlertTriangle />
                  <span>At risk</span>
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    run(() => router.push("/matters?filter=unassigned"))
                  }
                >
                  <UserPlus />
                  <span>Unassigned</span>
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    run(() =>
                      router.push("/matters?filter=over-capacity")
                    )
                  }
                >
                  <Search />
                  <span>Over capacity</span>
                </CommandItem>
              </CommandGroup>

              <CommandGroup heading="Matters">
                {matters.map((m) => (
                  <CommandItem
                    key={m.id}
                    value={`${m.reference} ${m.client_name} ${m.type}`}
                    onSelect={() =>
                      run(() => {
                        if (!m.lawyer_id) {
                          openAssign(m.id, "assign");
                        } else {
                          router.push(
                            `/matters?ref=${encodeURIComponent(m.reference)}`
                          );
                        }
                      })
                    }
                  >
                    <FileText />
                    <span>
                      {m.reference} · {m.client_name}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandGroup heading="Lawyers">
                {lawyers.map((l) => (
                  <CommandItem
                    key={l.id}
                    value={l.name}
                    onSelect={() =>
                      run(() =>
                        router.push(
                          `/lawyers?id=${encodeURIComponent(l.id)}`
                        )
                      )
                    }
                  >
                    <Users />
                    <span>{l.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          ) : null}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
