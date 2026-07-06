"use client";

/**
 * CoverageMapInner — static (non-interactive) service-area map for the
 * "Areas we serve" section. Draws the traced free-travel zone and the 45 km
 * driving boundary from lib/travel-zones — no API calls, just OSM tiles.
 * Loaded via next/dynamic({ ssr: false }) only.
 */

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FREE_ZONE_POLYGON, SERVICE_BOUNDARY_POLYGON } from "@/lib/travel-zones";

const ACCENT = "#dc2626";
const FREE_ZONE = "#22c55e";
const STROKESTOWN: [number, number] = [53.7767, -8.0983];

// Landmark towns from the "Areas we serve" list — labelled on the map so
// visitors can orient themselves at a glance.
const TOWNS: { name: string; coords: [number, number] }[] = [
  { name: "Roscommon", coords: [53.6333, -8.1897] },
  { name: "Longford", coords: [53.7276, -7.7933] },
  { name: "Castlerea", coords: [53.7681, -8.4922] },
  { name: "Boyle", coords: [53.9714, -8.2958] },
  { name: "Carrick-on-Shannon", coords: [53.9469, -8.09] },
  { name: "Ballymahon", coords: [53.5647, -7.7656] },
  { name: "Edgeworthstown", coords: [53.6957, -7.6089] },
  { name: "Athlone", coords: [53.4239, -7.9407] },
];

export default function CoverageMapInner() {
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
      zoomSnap: 0.25, // allow tighter framing than whole-zoom steps
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

    // Landmark towns — small labelled dots so the viewer can orient themselves
    for (const town of TOWNS) {
      L.marker(town.coords, {
        icon: L.divIcon({
          className: "",
          html: '<span class="jcc-map-dot jcc-map-dot--town"></span>',
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        }),
        interactive: false,
      })
        .addTo(map)
        .bindTooltip(town.name, {
          permanent: true,
          direction: "top",
          offset: [0, -6],
          className: "jcc-map-label jcc-map-town",
        });
    }

    L.marker(STROKESTOWN, {
      icon: L.divIcon({
        className: "",
        html: '<span class="jcc-map-dot jcc-map-dot--base"></span>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      }),
      interactive: false,
    })
      .addTo(map)
      .bindTooltip("Jake - Strokestown", {
        permanent: true,
        direction: "top",
        offset: [0, -10],
        className: "jcc-map-label",
      });

    map.fitBounds(L.latLngBounds(SERVICE_BOUNDARY_POLYGON), {
      padding: [6, 6],
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div
      ref={ref}
      className="jcc-map h-72 w-full sm:h-96"
      role="img"
      aria-label="Map of Jake's Car Care service area around Strokestown — free call-out zone in green, 45 km booking limit dashed in red"
    />
  );
}
