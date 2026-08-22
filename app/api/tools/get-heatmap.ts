/**
 * Day 3 tool: get_route_heatmap
 * For each route segment, calls createHeatmap() from lib/fortyguard-client.ts
 * with that segment's polygon and time-synced date/time (not the shipment's
 * departure time - the time it actually reaches that segment).
 *
 * TODO (Day 3): loop segments from segment-route.ts, call createHeatmap per
 * segment, return an array of { segment, temperatureResult }.
 */

import { createHeatmap } from "@/lib/fortyguard-client";
import type { RouteSegment } from "./segment-route";

export async function getRouteHeatmap(
  segments: RouteSegment[],
  apiKey: string
) {
  throw new Error("Not implemented - Day 3 task. See TODO comments above.");
}
