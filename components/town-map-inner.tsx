"use client";

/**
 * TownMapInner — static map for a town page: the free zone, the 45 km
 * boundary, and a marker on the town. Same non-interactive treatment as the
 * coverage map. Loaded via next/dynamic({ ssr: false }) only.
 */

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FREE_ZONE_POLYGON, SERVICE_BOUNDARY_POLYGON } from "@/lib/travel-zones";

const ACCENT = "#dc2626";
const FREE_ZONE = "#22c55e";
const STROKESTOWN: [number, number] = [53.7767, -8.0983];

export default function TownMapInner({
  name,
  lat,
  lng,
}: {
  name: string;
  lat: number;
  lng: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const map = L.map(el, {
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
      attributionControl: true,
      zoomSnap: 0.25,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.polygon(SERVICE_BOUNDARY_POLYGON, {
      color: ACCENT,
      weight: 1.5,
      opacity: 0.7,
      dashArray: "6 8",
      fillOpacity: 0,
    }).addTo(map);

    L.polygon(FREE_ZONE_POLYGON, {
      color: FREE_ZONE,
      weight: 1.5,
      opacity: 0.85,
      fillColor: FREE_ZONE,
      fillOpacity: 0.14,
    }).addTo(map);

    L.marker([lat, lng], {
      icon: L.divIcon({
        className: "",
        html: '<span class="jcc-map-dot jcc-map-dot--dest"></span>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      }),
      interactive: false,
    })
      .addTo(map)
      .bindTooltip(name, {
        permanent: true,
        direction: "top",
        offset: [0, -10],
        className: "jcc-map-label",
      });

    map.fitBounds(L.latLngBounds([[lat, lng], STROKESTOWN]).pad(0.35), {
      padding: [24, 24],
    });

    return () => {
      map.remove();
    };
  }, [name, lat, lng]);

  return (
    <div
      ref={ref}
      className="jcc-map h-64 w-full sm:h-80"
      role="img"
      aria-label={`Map showing ${name} relative to the Jake's Car Care free call-out zone and 45 km service boundary`}
    />
  );
}
