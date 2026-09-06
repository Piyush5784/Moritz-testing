import { OutOfScopePage } from "@/components/app-shell";

export default function SettingsPage() {
  return (
    <OutOfScopePage
      title="Settings"
      body="Settings is out of scope for this concept. The firm's thresholds, the four hour SLA and the capacity bands, live in a config table rather than a settings screen."
    />
  );
}
