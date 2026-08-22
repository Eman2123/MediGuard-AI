/**
 * Day 5 tool: monitor_portfolio
 * Background sweep across multiple active shipments. Default trigger:
 * interval-based check every 30 minutes (simulate via setInterval or a
 * scheduled job for the demo). Fires a proactive alert only when a shipment
 * newly crosses a risk threshold.
 *
 * TODO (Day 5): implement in-memory (or simple KV) store of active shipments,
 * re-check each shipment's next scheduled segment on each sweep, diff against
 * previous state to detect NEW threshold crossings only.
 */

export interface ActiveShipment {
  id: string;
  cargoId: string;
  segments: unknown[]; // RouteSegment[]
  lastKnownRiskLevel: string;
}

export async function monitorPortfolio(shipments: ActiveShipment[]) {
  throw new Error("Not implemented - Day 5 task. See TODO comments above.");
}
