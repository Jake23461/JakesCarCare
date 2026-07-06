"use client";

/**
 * TravelMap — dark-styled Leaflet map for the booking form's travel panel.
 *
 * Shows the green free-travel zone, the driving route between Strokestown
 * town centre (a generic public point — deliberately no labelled base marker)
 * and the customer's Eircode, plus the red 45 km service boundary. Loaded via
 * next/dynamic({ ssr: false }) only — Leaflet touches `window` at import time.
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
    if (!el || !dest) return;

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

    // Green free-travel zone — the real ~15-min DRIVING boundary (traced
    // road-by-road, see lib/travel-zones.ts), not a circle.
    const freeZonePoly = L.polygon(FREE_ZONE_POLYGON, {
      color: FREE_ZONE,
      weight: 1.5,
      opacity: 0.8,
      fillColor: FREE_ZONE,
      fillOpacity: 0.12,
    }).addTo(map);

    // Red service-area boundary (45 km by road) — always drawn; it comes into
    // view naturally when the frame or the customer's location reaches it.
    L.polygon(SERVICE_BOUNDARY_POLYGON, {
      color: ACCENT,
      weight: 1.5,
      opacity: 0.7,
      dashArray: "6 8",
      fillOpacity: 0,
    }).addTo(map);

    // Driving route into Strokestown town centre (a generic public point —
    // deliberately not a labelled marker). Straight dashed line as fallback.
    const routePoints: [number, number][] = quote.polyline
      ? decodePolyline(quote.polyline)
      : origin
        ? [
            [origin.lat, origin.lng],
            [dest.lat, dest.lng],
          ]
        : [];
    const route =
      routePoints.length > 1
        ? L.polyline(routePoints, {
            color: ACCENT,
            weight: 4,
            opacity: 0.9,
            dashArray: quote.polyline ? undefined : "8 10",
          }).addTo(map)
        : null;

    // Customer marker + label
    L.marker([dest.lat, dest.lng], { icon: dotIcon("dest"), interactive: false })
      .addTo(map)
      .bindTooltip(quote.eircode, {
        permanent: true,
        direction: "top",
        offset: [0, -10],
        className: "jcc-map-label",
      });

    // Frame the route + zone; inside the free zone, frame the zone itself.
    // When blocked, a little extra padding shows the boundary edge they crossed.
    const bounds =
      quote.freeZone || !route
        ? freeZonePoly.getBounds().extend([dest.lat, dest.lng]).pad(0.1)
        : route.getBounds().extend(freeZonePoly.getBounds());
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
      aria-label={`Map showing the ${quote.distanceKm} km journey to ${quote.eircode}`}
    />
  );
}
