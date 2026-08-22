/**
 * Day 3 tool: segment_route
 * Splits an origin -> destination route into waypoints/segments.
 *
 * TODO (Day 3):
 * - Pick a routing source for waypoints (e.g. a directions API, or a
 *   simplified straight-line interpolation for the MVP demo).
 * - Default granularity: every ~50 miles or ~1 hour of driving time,
 *   whichever produces the smaller polygon (see execution plan, section 5.3).
 * - Each segment's bounding polygon MUST stay within the confirmed
 *   Hackathon-plan AOI limit (run the empirical test in notebooks/01 first -
 *   do not assume 50 mi^2 or 10 mi^2, confirm it).
 * - Return each segment with: sequence index, polygon (GeoJSON), and the
 *   estimated arrival time at that segment (needed for time-synced heatmap
 *   queries in get-heatmap.ts).
 */

export interface RouteSegment {
  index: number;
  polygon: GeoJSON.FeatureCollection;
  estimatedArrivalTime: string; // ISO timestamp
}

export async function segmentRoute(
  origin: { lat: number; lon: number },
  destination: { lat: number; lon: number },
  departureTime: string
): Promise<RouteSegment[]> {
  throw new Error("Not implemented - Day 3 task. See TODO comments above.");
}
