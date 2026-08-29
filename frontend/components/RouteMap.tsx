"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type RouteSegment = {
  segment_id: number;
  lat: number;
  lon: number;
  risk_level: string; // "safe" | "warning" | "critical" | "unknown"
  max_temp_c: number;
  is_flagged: boolean;
};

// Matches tailwind.config.ts `risk` palette so the map and the rest of the
// dashboard agree on what each color means.
const RISK_COLORS: Record<string, string> = {
  safe: "#059669", // emerald
  warning: "#D97706", // amber
  critical: "#DC2626", // red
  unknown: "#94A3B8", // slate-400 — deliberately gray, not green: unknown
  // is "we don't know", never "safe" (see backend risk_engine.py).
};

function riskColor(level: string): string {
  return RISK_COLORS[level] ?? RISK_COLORS.unknown;
}

// Leaflet needs explicit bounds-fitting on mount — it can't infer them from
// children the way most React map wrappers do.
function FitBounds({ segments }: { segments: RouteSegment[] }) {
  const map = useMap();

  useEffect(() => {
    if (segments.length === 0) return;
    const bounds = segments.map((s) => [s.lat, s.lon] as [number, number]);
    map.fitBounds(bounds, { padding: [32, 32] });
  }, [segments, map]);

  return null;
}

export default function RouteMap({ segments = [] }: { segments?: RouteSegment[] }) {
  const center = useMemo<[number, number]>(() => {
    if (segments.length === 0) return [39.8283, -98.5795]; // center of US fallback
    const midpoint = segments[Math.floor(segments.length / 2)];
    return [midpoint.lat, midpoint.lon];
  }, [segments]);

  const polylinePositions = useMemo<[number, number][]>(
    () =>
      [...segments]
        .sort((a, b) => a.segment_id - b.segment_id)
        .map((s) => [s.lat, s.lon]),
    [segments]
  );

  if (segments.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl border border-border bg-panel2 text-sm text-muted">
        No segment data available to plot.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
      <MapContainer
        center={center}
        zoom={6}
        scrollWheelZoom={false}
        style={{ height: "24rem", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline
          positions={polylinePositions}
          pathOptions={{ color: "#0D9488", weight: 3, opacity: 0.6 }}
        />

        {segments.map((s) => (
          <CircleMarker
            key={s.segment_id}
            center={[s.lat, s.lon]}
            radius={8}
            pathOptions={{
              color: riskColor(s.risk_level),
              fillColor: riskColor(s.risk_level),
              fillOpacity: 0.85,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Segment {s.segment_id}</p>
                <p>
                  {s.risk_level === "unknown"
                    ? "Temperature unverified"
                    : `${s.max_temp_c}°C`}
                </p>
                <p className="capitalize">{s.risk_level}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        <FitBounds segments={segments} />
      </MapContainer>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border bg-panel px-4 py-3 text-xs text-muted">
        {Object.entries(RISK_COLORS).map(([level, color]) => (
          <span key={level} className="flex items-center gap-1.5 capitalize">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {level}
          </span>
        ))}
      </div>
    </div>
  );
}