"use client";

/**
 * TravelMap — dark-styled Leaflet map for the booking form's travel panel.
 *
 * Shows Jake's base in Strokestown, the green free-travel zone, the actual
 * driving route to the customer's Eircode, and (when relevant) the red
 * service-area boundary. Loaded via next/dynamic({ ssr: false }) only —
 * Leaflet touches `window` at import time.
 */

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { decodePolyline } from "@/lib/polyline";
import { FREE_ZONE_POLYGON, SERVICE_BOUNDARY_POLYGON } from "@/lib/travel-zones";
import type { TravelQuote } from "@/lib/travel";

const ACCENT = "#dc2626";
const FREE_ZONE = "#22c55e";

function dotIcon(kind: "base" | "dest"): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<span class="jcc-map-dot jcc-map-dot--${kind}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export default function TravelMap({ quote }: { quote: TravelQuote }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    const { origin, dest } = quote;
    if (!el || !origin || !dest) return;

    const map = L.map(el, {
      zoomControl: true,
      scrollWheelZoom: false, // don't hijack page scroll
      dragging: !L.Browser.mobile, // don't trap touch-scroll on phones
      attributionControl: true,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Green free-travel zone — the real ~15-min DRIVING boundary around
    // Strokestown (traced road-by-road, see lib/travel-zones.ts), not a circle.
    const freeZonePoly = L.polygon(FREE_ZONE_POLYGON, {
      color: FREE_ZONE,
      weight: 1.5,
      opacity: 0.8,
      fillColor: FREE_ZONE,
      fillOpacity: 0.12,
    }).addTo(map);

    // Red service-area boundary (45 km by road) — only when outside it
    if (quote.tooFar) {
      L.polygon(SERVICE_BOUNDARY_POLYGON, {
        color: ACCENT,
        weight: 1.5,
        opacity: 0.7,
        dashArray: "6 8",
        fillOpacity: 0,
      }).addTo(map);
    }

    // Driving route (real road path) — straight dashed line as fallback
    const routePoints: [number, number][] = quote.polyline
      ? decodePolyline(quote.polyline)
      : [
          [origin.lat, origin.lng],
          [dest.lat, dest.lng],
        ];
    const route = L.polyline(routePoints, {
      color: ACCENT,
      weight: 4,
      opacity: 0.9,
      dashArray: quote.polyline ? undefined : "8 10",
    }).addTo(map);

    // Markers + labels
    L.marker([origin.lat, origin.lng], { icon: dotIcon("base"), interactive: false })
      .addTo(map)
      .bindTooltip("Jake — Strokestown", {
        permanent: true,
        direction: "top",
        offset: [0, -10],
        className: "jcc-map-label",
      });
    L.marker([dest.lat, dest.lng], { icon: dotIcon("dest"), interactive: false })
      .addTo(map)
      .bindTooltip(quote.eircode, {
        permanent: true,
        direction: "top",
        offset: [0, -10],
        className: "jcc-map-label",
      });

    // Frame the route; inside the free zone, frame the zone instead. When
    // blocked, a little extra padding shows the boundary edge they crossed.
    const bounds = quote.freeZone
      ? freeZonePoly.getBounds().pad(0.15)
      : route.getBounds().extend([origin.lat, origin.lng]);
    map.fitBounds(quote.tooFar ? bounds.pad(0.2) : bounds, { padding: [36, 36] });

    return () => {
      map.remove();
    };
  }, [quote]);

  return (
    <div
      ref={containerRef}
      className="jcc-map h-56 w-full sm:h-64"
      role="img"
      aria-label={`Map showing the ${quote.distanceKm} km route from Strokestown to ${quote.eircode}`}
    />
  );
}
