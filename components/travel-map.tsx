"use client";

/**
 * TravelMap — dark-styled Leaflet map for the booking form's travel panel.
 *
 * Shows the green free-travel zone, the driving route to the customer's
 * Eircode, and (when relevant) the red service-area boundary. Deliberately no
 * base marker — the route is trimmed to start at the free-zone edge, and
 * free-zone customers get no route at all, so the map never pinpoints where
 * Jake actually lives. Loaded via next/dynamic({ ssr: false }) only —
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

/** Ray-cast point-in-polygon test on [lat, lng] pairs. */
function insidePolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [y, x] = point; // lat, lng
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [yi, xi] = polygon[i];
    const [yj, xj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Drops the leading part of the route that sits inside the free zone, so the
 *  drawn line starts at the zone's edge instead of at the home base. */
function trimRouteToZoneEdge(points: [number, number][]): [number, number][] {
  const firstOutside = points.findIndex((p) => !insidePolygon(p, FREE_ZONE_POLYGON));
  if (firstOutside <= 0) return points; // starts outside already, or never leaves
  return points.slice(firstOutside - 1); // keep one inside point so the line meets the edge
}

export default function TravelMap({ quote }: { quote: TravelQuote }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    const { dest } = quote;
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

    // Driving route from the free-zone edge to the customer. Free-zone
    // customers get no route line — the zone itself is the whole story.
    let route: L.Polyline | null = null;
    if (!quote.freeZone && quote.polyline) {
      const routePoints = trimRouteToZoneEdge(decodePolyline(quote.polyline));
      route = L.polyline(routePoints, {
        color: ACCENT,
        weight: 4,
        opacity: 0.9,
      }).addTo(map);
    }

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
    const bounds = route
      ? route.getBounds().extend(freeZonePoly.getBounds())
      : freeZonePoly.getBounds().extend([dest.lat, dest.lng]).pad(0.1);
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
