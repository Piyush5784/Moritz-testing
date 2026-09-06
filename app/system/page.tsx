import type { Metadata } from "next";
import { SystemReference } from "@/components/system-reference";

export const metadata: Metadata = {
  title: "Moritz · Design system",
  description:
    "Live design system reference for Moritz admin. Stock shadcn/ui, token identity, Obra kit mapping.",
};

export default function SystemPage() {
  return <SystemReference />;
}
