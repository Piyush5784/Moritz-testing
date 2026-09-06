import { AppShell } from "@/components/app-shell";
import { OverviewLayout } from "@/components/overview-layout";
import { AutoHideScroll } from "@/components/auto-hide-scroll";

export default function Home() {
  return (
    <AppShell>
      <AutoHideScroll className="min-h-0 flex-1">
        <OverviewLayout />
      </AutoHideScroll>
    </AppShell>
  );
}
