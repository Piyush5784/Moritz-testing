"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui-bits/status-badge";
import { useDashboardActions } from "@/components/actions-provider";
import type { UnquotedMatter } from "@/lib/supabase";

function formatCurrency(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

export function UnquotedRow({ unquoted }: { unquoted: UnquotedMatter[] }) {
  const reduceMotion = useReducedMotion();
  const { openQuote } = useDashboardActions();

  if (unquoted.length === 0) return null;

  return (
    <>
      <ul className="mt-3 flex flex-col gap-2 md:hidden">
        <AnimatePresence initial={false}>
          {unquoted.map((matter) => (
            <motion.li
              key={matter.id}
              layout={!reduceMotion}
              initial={false}
              exit={
                reduceMotion
                  ? undefined
                  : { opacity: 0, height: 0, overflow: "hidden" }
              }
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Card className="flex flex-col gap-2 rounded-lg p-4 [--card-spacing:0px]">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone="neutral">Unquoted</StatusBadge>
                  <span
                    className="font-semibold text-foreground"
                    style={{ fontSize: "var(--text-13)" }}
                  >
                    {matter.reference}
                  </span>
                </div>
                <p
                  className="line-clamp-2 text-text-secondary"
                  style={{ fontSize: "var(--text-12)" }}
                >
                  {matter.client_name} · {matter.type}
                  {matter.suggestedFee != null &&
                  matter.comparableCount != null ? (
                    <>
                      {" · "}
                      <span className="num">
                        {formatCurrency(matter.suggestedFee)}
                      </span>{" "}
                      suggested, median across{" "}
                      <span className="num">{matter.comparableCount}</span>{" "}
                      comparable matters
                    </>
                  ) : null}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="min-h-11 w-full"
                  onClick={() =>
                    openQuote(matter, {
                      suggestedFee: matter.suggestedFee,
                      comparableCount: matter.comparableCount,
                    })
                  }
                >
                  Send quote
                </Button>
              </Card>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <Card className="mt-3 hidden gap-0 rounded-lg py-0 [--card-spacing:0px] md:block">
        <ul>
          <AnimatePresence initial={false}>
            {unquoted.map((matter) => (
              <motion.li
                key={matter.id}
                layout={!reduceMotion}
                initial={false}
                exit={
                  reduceMotion
                    ? undefined
                    : { opacity: 0, height: 0, overflow: "hidden" }
                }
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-2.5 hover:bg-surface-hover"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <StatusBadge tone="neutral">Unquoted</StatusBadge>
                  <span
                    className="whitespace-nowrap font-semibold text-foreground"
                    style={{ fontSize: "var(--text-13)" }}
                  >
                    {matter.reference}
                  </span>
                  <span
                    className="truncate text-text-secondary"
                    style={{ fontSize: "var(--text-12)" }}
                  >
                    {matter.client_name} · {matter.type}
                    {matter.suggestedFee != null &&
                    matter.comparableCount != null ? (
                      <>
                        {" · "}
                        <span className="num">
                          {formatCurrency(matter.suggestedFee)}
                        </span>{" "}
                        suggested, median across{" "}
                        <span className="num">{matter.comparableCount}</span>{" "}
                        comparable matters
                      </>
                    ) : null}
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    openQuote(matter, {
                      suggestedFee: matter.suggestedFee,
                      comparableCount: matter.comparableCount,
                    })
                  }
                >
                  Send quote
                </Button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </Card>
    </>
  );
}
