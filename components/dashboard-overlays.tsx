"use client";

import { useDashboardActions } from "@/components/actions-provider";
import { CommandPalette } from "@/components/command-palette";
import { NewMatterSheet } from "@/components/new-matter-sheet";
import { ChatPanel } from "@/components/chat-panel";

/** Command palette, chat, and new-matter sheet. */
export function DashboardOverlays() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    newMatterOpen,
    setNewMatterOpen,
    chatOpen,
    setChatOpen,
  } = useDashboardActions();

  return (
    <>
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
      <ChatPanel open={chatOpen} onOpenChange={setChatOpen} />
      <NewMatterSheet open={newMatterOpen} onOpenChange={setNewMatterOpen} />
    </>
  );
}
