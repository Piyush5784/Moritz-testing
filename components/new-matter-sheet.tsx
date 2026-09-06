"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useOverview } from "@/hooks/use-overview";
import type { Channel, ServiceLine } from "@/lib/supabase";
import { useSheetSide } from "@/hooks/use-sheet-side";
import { SheetHandle } from "@/components/sheet-handle";
import { cn } from "cn";

const SERVICE_LINES: ServiceLine[] = [
  "Commercial",
  "Corporate",
  "Privacy",
  "Employment",
  "Real estate",
  "Litigation",
];

const CHANNELS: { value: Channel; label: string }[] = [
  { value: "email", label: "Email" },
  { value: "slack", label: "Slack" },
  { value: "platform", label: "Platform" },
];

const TYPE_PLACEHOLDERS: Record<ServiceLine, string> = {
  Commercial: "NDA",
  Corporate: "Term sheet",
  Privacy: "DPA",
  Employment: "Offer letter",
  "Real estate": "Lease",
  Litigation: "Discovery request",
};

const glassStyle: React.CSSProperties = {
  background: "var(--glass-bg)",
  border: "1px solid var(--glass-border)",
  boxShadow: "var(--glass-shadow)",
};

const NEW_CLIENT = "__new__";

export function NewMatterSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data } = useOverview();
  const qc = useQueryClient();
  const clients = data?.clients ?? [];

  const [clientId, setClientId] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [serviceLine, setServiceLine] = useState<ServiceLine>("Commercial");
  const [type, setType] = useState("");
  const [channel, setChannel] = useState<Channel>("platform");
  const [fee, setFee] = useState("");
  const [pending, setPending] = useState(false);
  const formKey = open ? "open" : "closed";
  const [prevFormKey, setPrevFormKey] = useState(formKey);
  if (formKey !== prevFormKey) {
    setPrevFormKey(formKey);
    if (open) {
      setClientId("");
      setNewClientName("");
      setServiceLine("Commercial");
      setType("");
      setChannel("platform");
      setFee("");
      setPending(false);
    }
  }

  const canSubmit =
    (clientId === NEW_CLIENT ? newClientName.trim().length > 0 : !!clientId) &&
    !!serviceLine &&
    type.trim().length > 0 &&
    !!channel;
  const side = useSheetSide();

  async function createMatter() {
    if (!canSubmit || pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/matters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientId === NEW_CLIENT ? null : clientId,
          newClientName:
            clientId === NEW_CLIENT ? newClientName.trim() : undefined,
          serviceLine,
          type: type.trim(),
          channel,
          fee: fee === "" ? 0 : Number(fee),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Could not create the matter.");
      }
      toast.success(`${body.matter.reference} created.`);
      await qc.invalidateQueries({ queryKey: ["overview"] });
      onOpenChange(false);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not create the matter."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          "gap-0 border-0 bg-transparent p-0",
          side === "right" && "h-full w-full sm:max-w-[420px]",
          side === "bottom" && "h-[85vh] max-h-[85vh] w-full"
        )}
        style={glassStyle}
      >
        <SheetHandle visible={side === "bottom"} />
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle style={{ fontSize: "var(--text-14)" }}>
            New matter
          </SheetTitle>
          <SheetDescription
            className="text-text-secondary"
            style={{ fontSize: "var(--text-12)" }}
          >
            Intake a matter. Leave the fee blank to quote later.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          <div className="space-y-2">
            <label
              htmlFor="matter-client"
              className="font-medium text-foreground"
              style={{ fontSize: "var(--text-12)" }}
            >
              Client
            </label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger id="matter-client" className="w-full">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.company}
                  </SelectItem>
                ))}
                <SelectItem value={NEW_CLIENT}>New client</SelectItem>
              </SelectContent>
            </Select>
            {clientId === NEW_CLIENT ? (
              <Input
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Company name"
                aria-label="New client name"
              />
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="matter-line"
              className="font-medium text-foreground"
              style={{ fontSize: "var(--text-12)" }}
            >
              Service line
            </label>
            <Select
              value={serviceLine}
              onValueChange={(v) => setServiceLine(v as ServiceLine)}
            >
              <SelectTrigger id="matter-line" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_LINES.map((line) => (
                  <SelectItem key={line} value={line}>
                    {line}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="matter-type"
              className="font-medium text-foreground"
              style={{ fontSize: "var(--text-12)" }}
            >
              Matter type
            </label>
            <Input
              id="matter-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder={TYPE_PLACEHOLDERS[serviceLine]}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="matter-channel"
              className="font-medium text-foreground"
              style={{ fontSize: "var(--text-12)" }}
            >
              Channel
            </label>
            <Select
              value={channel}
              onValueChange={(v) => setChannel(v as Channel)}
            >
              <SelectTrigger id="matter-channel" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHANNELS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="matter-fee"
              className="font-medium text-foreground"
              style={{ fontSize: "var(--text-12)" }}
            >
              Fee
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-text-tertiary"
                style={{ fontSize: "var(--text-13)" }}
              >
                $
              </span>
              <Input
                id="matter-fee"
                type="number"
                min={0}
                step={1}
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="num pl-6"
                placeholder="Optional"
              />
            </div>
            <p
              className="text-text-tertiary"
              style={{ fontSize: "var(--text-11)" }}
            >
              Leave blank to quote later. Unquoted matters cannot start.
            </p>
          </div>
        </div>

        <SheetFooter className="flex-row gap-2 border-t border-border px-5 py-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!canSubmit || pending}
            onClick={() => createMatter()}
          >
            {pending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Create matter
              </>
            ) : (
              "Create matter"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
