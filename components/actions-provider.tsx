"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AssignSheet } from "@/components/assign-sheet";
import { QuoteSheet } from "@/components/quote-sheet";
import {
  ClientUpdateSheet,
  type ClientUpdateSituation,
} from "@/components/client-update-sheet";
import { useNudge } from "@/lib/use-actions";
import type {
  AttentionItem,
  MatterStatus,
  MattersDirectoryPayload,
  OverviewPayload,
} from "@/lib/supabase";

type AssignMode = "assign" | "reassign";

type QuoteOpts = {
  suggestedFee: number | null;
  comparableCount: number | null;
};

type ActionsContextValue = {
  openAssign: (matterId: string, mode?: AssignMode) => void;
  openAssignForLawyer: (lawyerId: string) => void;
  openQuote: (matter: MatterStatus, opts: QuoteOpts) => void;
  openNewMatter: () => void;
  openCommandPalette: () => void;
  openChat: () => void;
  openClientUpdate: (
    matter: MatterStatus,
    situation: ClientUpdateSituation
  ) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  newMatterOpen: boolean;
  setNewMatterOpen: (open: boolean) => void;
  handleAttentionAction: (item: AttentionItem) => void;
  nudgeMatter: (vars: {
    matterId: string;
    reference: string;
    lawyerName: string;
  }) => void;
  nudgingMatterId: string | null;
};

const ActionsContext = createContext<ActionsContextValue | null>(null);

export function useDashboardActions() {
  const ctx = useContext(ActionsContext);
  if (!ctx) {
    throw new Error("useDashboardActions must be used within ActionsProvider");
  }
  return ctx;
}

function soonestMatterForLawyer(
  lawyerId: string,
  overview: OverviewPayload | undefined,
  directory: MattersDirectoryPayload | undefined
): string | null {
  const pool: MatterStatus[] = [];
  if (directory?.matters) pool.push(...directory.matters);
  else if (overview?.matters) pool.push(...overview.matters);
  else if (overview?.deadlines) pool.push(...overview.deadlines);

  const soonest = pool
    .filter(
      (m) => m.lawyer_id === lawyerId && m.stage !== "delivered"
    )
    .sort((a, b) => a.minutes_remaining - b.minutes_remaining)[0];
  if (soonest) return soonest.id;

  const fromAttention = overview?.attention.find(
    (a) => a.lawyerId === lawyerId && a.matterId
  );
  return fromAttention?.matterId ?? null;
}

export function ActionsProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const nudge = useNudge();

  const [assignMatterId, setAssignMatterId] = useState<string | null>(null);
  const [assignMode, setAssignMode] = useState<AssignMode>("assign");
  const [assignOpen, setAssignOpen] = useState(false);

  const [quoteMatter, setQuoteMatter] = useState<MatterStatus | null>(null);
  const [quoteOpts, setQuoteOpts] = useState<QuoteOpts>({
    suggestedFee: null,
    comparableCount: null,
  });
  const [quoteOpen, setQuoteOpen] = useState(false);

  const [newMatterOpen, setNewMatterOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [clientUpdateMatter, setClientUpdateMatter] =
    useState<MatterStatus | null>(null);
  const [clientUpdateSituation, setClientUpdateSituation] =
    useState<ClientUpdateSituation | null>(null);
  const [clientUpdateOpen, setClientUpdateOpen] = useState(false);

  const openAssign = useCallback(
    (matterId: string, mode: AssignMode = "assign") => {
      setAssignMatterId(matterId);
      setAssignMode(mode);
      setAssignOpen(true);
    },
    []
  );

  const openAssignForLawyer = useCallback(
    (lawyerId: string) => {
      const overview = qc.getQueryData<OverviewPayload>(["overview"]);
      const directory = qc.getQueryData<MattersDirectoryPayload>([
        "matters-all",
      ]);
      const matterId = soonestMatterForLawyer(lawyerId, overview, directory);
      if (matterId) openAssign(matterId, "reassign");
    },
    [qc, openAssign]
  );

  const openQuote = useCallback((matter: MatterStatus, opts: QuoteOpts) => {
    setQuoteMatter(matter);
    setQuoteOpts(opts);
    setQuoteOpen(true);
  }, []);

  const openNewMatter = useCallback(() => setNewMatterOpen(true), []);
  const openCommandPalette = useCallback(() => setPaletteOpen(true), []);
  const openChat = useCallback(() => setChatOpen(true), []);
  const openClientUpdate = useCallback(
    (matter: MatterStatus, situation: ClientUpdateSituation) => {
      setClientUpdateMatter(matter);
      setClientUpdateSituation(situation);
      setClientUpdateOpen(true);
    },
    []
  );

  const nudgeMatter = useCallback(
    (vars: { matterId: string; reference: string; lawyerName: string }) => {
      nudge.mutate(vars);
    },
    [nudge]
  );

  const handleAttentionAction = useCallback(
    (item: AttentionItem) => {
      if (item.action === "Nudge lawyer") {
        if (!item.matterId) return;
        const payload = qc.getQueryData<OverviewPayload>(["overview"]);
        const matter = payload?.deadlines.find((m) => m.id === item.matterId);
        const lawyerName =
          matter?.lawyer_name ??
          payload?.lawyers.find((l) => l.id === item.lawyerId)?.name ??
          "the lawyer";
        nudgeMatter({
          matterId: item.matterId,
          reference: item.title,
          lawyerName,
        });
        return;
      }

      if (item.kind === "overCapacity" && item.lawyerId) {
        openAssignForLawyer(item.lawyerId);
        return;
      }

      if (item.matterId) {
        openAssign(
          item.matterId,
          item.action === "Reassign" ? "reassign" : "assign"
        );
      }
    },
    [qc, nudgeMatter, openAssign, openAssignForLawyer]
  );

  const value = useMemo<ActionsContextValue>(
    () => ({
      openAssign,
      openAssignForLawyer,
      openQuote,
      openNewMatter,
      openCommandPalette,
      openChat,
      openClientUpdate,
      commandPaletteOpen: paletteOpen,
      setCommandPaletteOpen: setPaletteOpen,
      chatOpen,
      setChatOpen,
      newMatterOpen,
      setNewMatterOpen,
      handleAttentionAction,
      nudgeMatter,
      nudgingMatterId: nudge.isPending
        ? (nudge.variables?.matterId ?? null)
        : null,
    }),
    [
      openAssign,
      openAssignForLawyer,
      openQuote,
      openNewMatter,
      openCommandPalette,
      openChat,
      openClientUpdate,
      paletteOpen,
      chatOpen,
      newMatterOpen,
      handleAttentionAction,
      nudgeMatter,
      nudge.isPending,
      nudge.variables?.matterId,
    ]
  );

  return (
    <ActionsContext.Provider value={value}>
      {children}
      <AssignSheet
        matterId={assignMatterId}
        mode={assignMode}
        open={assignOpen}
        onOpenChange={setAssignOpen}
      />
      <QuoteSheet
        matter={quoteMatter}
        suggestedFee={quoteOpts.suggestedFee}
        comparableCount={quoteOpts.comparableCount}
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
      />
      <ClientUpdateSheet
        matter={clientUpdateMatter}
        situation={clientUpdateSituation}
        open={clientUpdateOpen}
        onOpenChange={setClientUpdateOpen}
      />
    </ActionsContext.Provider>
  );
}
