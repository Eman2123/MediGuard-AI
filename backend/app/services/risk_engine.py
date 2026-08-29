from typing import Dict, Any

CARGO_THRESHOLDS = {
    "insulin": {"max_temp": 8, "cooling_cost_per_mile": 5},
    "vaccine": {"max_temp": 8, "cooling_cost_per_mile": 6},
    "blood": {"max_temp": 4, "cooling_cost_per_mile": 8},
    "organ": {"max_temp": 10, "cooling_cost_per_mile": 10},
}

class RiskAssessment:
    def __init__(self, cargo_type: str):
        self.cargo_type = cargo_type.lower()
        
        if self.cargo_type not in CARGO_THRESHOLDS:
            raise ValueError(f"Unknown cargo type: {cargo_type}. Available: {list(CARGO_THRESHOLDS.keys())}")
        
        self.threshold = CARGO_THRESHOLDS[self.cargo_type]["max_temp"]
        self.cooling_cost_per_mile = CARGO_THRESHOLDS[self.cargo_type]["cooling_cost_per_mile"]
    
    def assess_segment(self, heatmap_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze heatmap for a segment.
        
        Args:
            heatmap_data: FortyGuard result dict with stats_data
        
        Returns:
            Risk assessment with temp, flag, and risk level.
            If FortyGuard returned no matched cells (n_cells == 0) or no
            stats_data at all, this is NOT treated as "20.0°C safe/flagged" —
            it's surfaced as risk_level="unknown" so bad/missing data never
            silently masquerades as a real reading.
        """
        n_cells = heatmap_data.get("n_cells")
        stats_data = heatmap_data.get("stats_data")

        # No matched cells or no stats block at all -> we genuinely don't
        # know the temperature. Don't fabricate 20/15/10 defaults.
        if not stats_data or (n_cells is not None and n_cells == 0):
            return {
                "max_temp": 0.0,
                "mean_temp": 0.0,
                "min_temp": 0.0,
                "is_flagged": False,
                "risk_level": "unknown",
                "threshold": self.threshold,
                "note": "No heatmap cells matched (n_cells=0) — check AOI/date, not a real reading",
            }

        temp_stats = stats_data.get("temperature_stats")
        if not temp_stats:
            return {
                "max_temp": 0.0,
                "mean_temp": 0.0,
                "min_temp": 0.0,
                "is_flagged": False,
                "risk_level": "unknown",
                "threshold": self.threshold,
                "note": "No temperature_stats in response",
            }

        # Extract temperature stats
        max_temp = float(temp_stats["maximum"])
        mean_temp = float(temp_stats["mean"])
        min_temp = float(temp_stats["minimum"])
        
        # Determine if flagged
        is_flagged = max_temp > self.threshold
        
        # Determine risk level
        if max_temp > self.threshold + 5:
            risk_level = "critical"
        elif max_temp > self.threshold:
            risk_level = "warning"
        else:
            risk_level = "safe"
        
        return {
            "max_temp": round(max_temp, 1),
            "mean_temp": round(mean_temp, 1),
            "min_temp": round(min_temp, 1),
            "is_flagged": is_flagged,
            "risk_level": risk_level,
            "threshold": self.threshold
        }

def estimate_cooling_cost(cargo_type: str, distance_miles: float, is_flagged: bool) -> float:
    """
    Calculate cost to cool segment only if flagged.
    
    Args:
        cargo_type: insulin, vaccine, blood, organ
        distance_miles: segment distance
        is_flagged: whether segment exceeds temperature threshold
    
    Returns:
        Estimated cooling cost in USD
    """
    if not is_flagged:
        return 0.0
    
    cost_per_mile = CARGO_THRESHOLDS[cargo_type.lower()]["cooling_cost_per_mile"]
    return distance_miles * cost_per_mile

def estimate_full_route_cost(cargo_type: str, total_distance_miles: float) -> float:
    """Estimate cost to cool entire route (baseline)"""
    cost_per_mile = CARGO_THRESHOLDS[cargo_type.lower()]["cooling_cost_per_mile"]
    return total_distance_miles * cost_per_mile