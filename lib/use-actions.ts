"use client";

import { useEffect, useRef } from "react";
import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { OverviewPayload } from "@/lib/supabase";

type Snapshot = { previous?: OverviewPayload };

function restore(qc: QueryClient, ctx: Snapshot | undefined) {
  if (ctx?.previous) {
    qc.setQueryData(["overview"], ctx.previous);
  }
}

function settle(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: ["overview"] });
  qc.invalidateQueries({ queryKey: ["matters-all"] });
}

type AssignVars = {
  matterId: string;
  lawyerId: string;
  lawyerName: string;
  reference: string;
  mode: "assign" | "reassign";
};

type NudgeVars = {
  matterId: string;
  reference: string;
  lawyerName: string;
};

type QuoteVars = {
  matterId: string;
  reference: string;
  fee: number;
};

export function useAssign() {
  const qc = useQueryClient();
  const mutateRef = useRef<(vars: AssignVars) => void>(() => {});

  const mutation = useMutation({
    mutationFn: async (vars: AssignVars) => {
      const res = await fetch(`/api/matters/${vars.matterId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lawyerId: vars.lawyerId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not assign this matter.");
      }
      return res.json();
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["overview"] });
      const previous = qc.getQueryData<OverviewPayload>(["overview"]);
      if (previous) {
        qc.setQueryData<OverviewPayload>(["overview"], {
          ...previous,
          attention: previous.attention.filter(
            (a) => a.matterId !== vars.matterId
          ),
          deadlines: previous.deadlines.map((m) =>
            m.id === vars.matterId
              ? {
                  ...m,
                  lawyer_id: vars.lawyerId,
                  lawyer_name: vars.lawyerName,
                }
              : m
          ),
        });
      }
      return { previous };
    },
    onError: (_err, vars, ctx) => {
      restore(qc, ctx);
      toast.error(`Couldn't ${vars.mode} ${vars.reference}. Nothing changed.`, {
        action: {
          label: "Retry",
          onClick: () => mutateRef.current(vars),
        },
      });
    },
    onSuccess: (_data, vars) => {
      toast.success(
        vars.mode === "reassign"
          ? `${vars.reference} moved to ${vars.lawyerName}.`
          : `${vars.reference} assigned to ${vars.lawyerName}.`
      );
    },
    onSettled: () => settle(qc),
  });

  useEffect(() => {
    mutateRef.current = mutation.mutate;
  });
  return mutation;
}

export function useNudge() {
  const qc = useQueryClient();
  const mutateRef = useRef<(vars: NudgeVars) => void>(() => {});

  const mutation = useMutation({
    mutationFn: async (vars: NudgeVars) => {
      const res = await fetch(`/api/matters/${vars.matterId}/nudge`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not send the nudge.");
      }
      return res.json();
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["overview"] });
      return {
        previous: qc.getQueryData<OverviewPayload>(["overview"]),
      };
    },
    onError: (_err, vars, ctx) => {
      restore(qc, ctx);
      toast.error(`Couldn't nudge about ${vars.reference}. Nothing changed.`, {
        action: {
          label: "Retry",
          onClick: () => mutateRef.current(vars),
        },
      });
    },
    onSuccess: (_data, vars) => {
      toast.success(`Nudged ${vars.lawyerName} about ${vars.reference}.`);
    },
    onSettled: () => settle(qc),
  });

  useEffect(() => {
    mutateRef.current = mutation.mutate;
  });
  return mutation;
}

export function useQuote() {
  const qc = useQueryClient();
  const mutateRef = useRef<(vars: QuoteVars) => void>(() => {});

  const mutation = useMutation({
    mutationFn: async (vars: QuoteVars) => {
      const res = await fetch(`/api/matters/${vars.matterId}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fee: vars.fee }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not send the quote.");
      }
      return res.json();
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["overview"] });
      const previous = qc.getQueryData<OverviewPayload>(["overview"]);
      if (previous) {
        qc.setQueryData<OverviewPayload>(["overview"], {
          ...previous,
          finance: {
            ...previous.finance,
            unquoted: previous.finance.unquoted.filter(
              (m) => m.id !== vars.matterId
            ),
          },
          attention: previous.attention.filter(
            (a) => !(a.kind === "unquoted" && a.matterId === vars.matterId)
          ),
        });
      }
      return { previous };
    },
    onError: (_err, vars, ctx) => {
      restore(qc, ctx);
      toast.error(`Couldn't quote ${vars.reference}. Nothing changed.`, {
        action: {
          label: "Retry",
          onClick: () => mutateRef.current(vars),
        },
      });
    },
    onSuccess: (_data, vars) => {
      toast.success(
        `Quote sent for ${vars.reference} at $${vars.fee.toLocaleString("en-US")}.`
      );
    },
    onSettled: () => settle(qc),
  });

  useEffect(() => {
    mutateRef.current = mutation.mutate;
  });
  return mutation;
}
