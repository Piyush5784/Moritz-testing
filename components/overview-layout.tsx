"use client";

import { useSyncExternalStore } from "react";
import { ZoneToday } from "@/components/zone-today";
import { ZonePeople } from "@/components/zone-people";
import { ZoneMoney } from "@/components/zone-money";
import { PulseRail, PulsePanel } from "@/components/pulse-rail";
import { OverviewTabs } from "@/components/overview-tabs";

const XL = "(min-width: 1280px)";
const emptySubscribe = () => () => {};

function subscribeXl(onStoreChange: () => void) {
  const mq = window.matchMedia(XL);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

/**
 * Overview layout. Below `xl` the Pulse rail is gone, so People / Money / Pulse
 * sit in tabs. At `xl` and up, zones stack and the rail returns.
 * Client-only branch avoids hydrating both layouts and Radix tab IDs.
 */
export function OverviewLayout() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const wide = useSyncExternalStore(
    subscribeXl,
    () => window.matchMedia(XL).matches,
    () => false
  );

  return (
    <div className="grid min-h-full min-w-0 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 px-4 pt-6 pb-12 md:px-8">
        <div className="mx-auto w-full min-w-0 max-w-[1440px]">
          <ZoneToday />

          {!mounted ? (
            <div className="mt-6 h-24" aria-hidden />
          ) : wide ? (
            <div className="mt-6">
              <ZonePeople className="mt-0" />
              <ZoneMoney className="mt-8" />
            </div>
          ) : (
            <OverviewTabs
              className="mt-6"
              people={<ZonePeople className="mt-0" hideLabel />}
              money={<ZoneMoney className="mt-0" hideLabel />}
              pulse={<PulsePanel embedded />}
            />
          )}
        </div>
      </div>

      {mounted && wide ? (
        <aside aria-label="Pulse" className="min-h-full min-w-0">
          <PulseRail />
        </aside>
      ) : null}
    </div>
  );
}
