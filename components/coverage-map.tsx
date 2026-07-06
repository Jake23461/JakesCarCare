"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window` at import time — client-side only.
const CoverageMapInner = dynamic(() => import("@/components/coverage-map-inner"), {
  ssr: false,
  loading: () => <div className="jcc-map h-72 w-full animate-pulse sm:h-96" />,
});

export function CoverageMap() {
  return (
    <div className="relative text-left">
      <CoverageMapInner />

      {/* Marketing badge */}
      <div className="pointer-events-none absolute left-3 top-3 z-[700] rounded-full bg-green-500 px-4 py-1.5 text-[11px] font-black uppercase tracking-wide text-white shadow-lg">
        Free call-out in the green zone
      </div>

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[700] flex flex-col gap-1.5">
        <span className="flex items-center gap-2 rounded-full bg-black/75 px-3 py-1 text-[11px] font-semibold text-white">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          No call-out fee
        </span>
        <span className="flex items-center gap-2 rounded-full bg-black/75 px-3 py-1 text-[11px] font-semibold text-white">
          <span className="h-0.5 w-3 border-t-2 border-dashed border-red-500" />
          45 km booking limit
        </span>
      </div>
    </div>
  );
}
