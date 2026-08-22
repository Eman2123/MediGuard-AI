/**
 * Day 4 tool: calculate_mitigation_cost
 * Compares full-route protection cost vs. targeted flagged-segment-only cost.
 * See execution plan section 7 for the formula and worked example.
 *
 * full_route_cost = total_route_miles * cost_per_mile_full_insulation
 * flagged_segment_cost = (flagged_segment_miles * cost_per_mile_full_insulation)
 *                       + (flagged_segment_miles * extra_cooling_cost_per_mile)
 *                       + fixed_cost_dry_ice_or_gel_pack_refill
 * savings = full_route_cost - flagged_segment_cost
 *
 * TODO (Day 4): finalize per-mile cost constants (placeholders below are
 * demo-reasonable, refine with real quotes if time allows).
 */

const COST_PER_MILE_FULL_INSULATION = 3.0;
const EXTRA_COOLING_COST_PER_MILE = 0.75;
const FIXED_REFILL_COST = 30;

export interface CostComparison {
  fullRouteCost: number;
  flaggedSegmentCost: number;
  savings: number;
  savingsPercent: number;
}

export function calculateMitigationCost(
  totalRouteMiles: number,
  flaggedSegmentMiles: number
): CostComparison {
  const fullRouteCost = totalRouteMiles * COST_PER_MILE_FULL_INSULATION;
  const flaggedSegmentCost =
    flaggedSegmentMiles * COST_PER_MILE_FULL_INSULATION +
    flaggedSegmentMiles * EXTRA_COOLING_COST_PER_MILE +
    FIXED_REFILL_COST;
  const savings = fullRouteCost - flaggedSegmentCost;
  const savingsPercent = (savings / fullRouteCost) * 100;

  return { fullRouteCost, flaggedSegmentCost, savings, savingsPercent };
}
