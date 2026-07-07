"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window` at import time — client-side only.
const TownMapInner = dynamic(() => import("@/components/town-map-inner"), {
  ssr: false,
  loading: () => <div className="jcc-map h-64 w-full animate-pulse sm:h-80" />,
});

export function TownMap(props: { name: string; lat: number; lng: number }) {
  return <TownMapInner {...props} />;
}
