import { OutOfScopePage } from "@/components/app-shell";

export default function ClientsPage() {
  return (
    <OutOfScopePage
      title="Clients"
      body="Clients is out of scope for this concept. The dashboard reads client names from the same data, but a client directory was not part of the brief."
    />
  );
}
