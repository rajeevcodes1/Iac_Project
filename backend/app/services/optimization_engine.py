from datetime import datetime
from typing import List

from sqlalchemy.orm import Session
import pulp

from .. import models
from ..schemas import (
    EnergyOptimizationRequest,
    OptimizationMode,
    EnergyOptimizationResult,
    EnergyOptimizationScheduleItem,
)
from .energy_forecasting import forecast_building_energy


def _build_tariff_profile(timestamps: List[datetime], day_tariff: float, night_tariff: float):
    """Simple time-of-day tariff: 08:00–22:00 = day, else night."""
    profile = []
    for ts in timestamps:
        hour = ts.hour
        if 8 <= hour < 22:
            profile.append(day_tariff)
        else:
            profile.append(night_tariff)
    return profile


def _build_emission_profile(timestamps: List[datetime]):
    """
    Approximate grid carbon intensity profile (kg CO2 per kWh).
    Simplified: higher in evening, moderate day, lower night.
    """
    profile = []
    for ts in timestamps:
        h = ts.hour
        if 18 <= h < 22:  # evening peak
            profile.append(0.95)
        elif 10 <= h < 17:  # solar heavy daytime
            profile.append(0.65)
        elif 6 <= h < 10 or 17 <= h < 18:
            profile.append(0.8)
        else:  # late night
            profile.append(0.5)
    return profile


def optimize_energy_schedule(
    db: Session, req: EnergyOptimizationRequest
) -> EnergyOptimizationResult:
    """
    Hybrid optimization:
      1) Get forecasted baseline load (kW) for the building.
      2) Build LP with variables x_t (optimized load per hour).
      3) Constraints:
           0 <= x_t <= max_load_kw
           sum(x_t) >= service_factor * sum(baseline)   (keep >= 90% energy)
      4) Objective:
         - mode='peak': minimize max(x_t)
         - mode='cost': minimize sum(x_t * tariff_t)
         - mode='emissions': minimize sum(x_t * emission_factor_t)
    """
    horizon = req.hours

    # 1) Forecast baseline using existing hybrid forecasting engine
    forecasts = forecast_building_energy(db, req.building_id, horizon_hours=horizon)
    if not forecasts:
        raise ValueError("No forecast data available for this building.")

    # Sort by horizon_hours (1..N)
    forecasts_sorted = sorted(forecasts, key=lambda f: f.horizon_hours)
    baseline = [float(f.predicted_value) for f in forecasts_sorted]
    timestamps = [f.timestamp for f in forecasts_sorted]
    n = len(baseline)

    total_baseline = sum(baseline)
    if total_baseline <= 0:
        raise ValueError("Baseline forecast has zero total energy.")

    # 2) Create LP problem
    prob = pulp.LpProblem("SmartEdEnergyOptimization", pulp.LpMinimize)

    # Decision variables: load in kW for each hour
    x = [
        pulp.LpVariable(f"load_{t}", lowBound=0, upBound=req.max_load_kw)
        for t in range(n)
    ]

    # Service factor: keep at least 90% of baseline energy
    service_factor = 0.9
    prob += pulp.lpSum(x) >= service_factor * total_baseline

    # 3) Objective according to mode
    if req.mode == OptimizationMode.peak:
        # Minimize peak: introduce P >= all x_t, minimize P
        P = pulp.LpVariable("peak_load", lowBound=0)
        for t in range(n):
            prob += x[t] <= P
        prob += P  # objective

        estimated_cost_baseline = None
        estimated_cost_optimized = None
        est_emissions_baseline = None
        est_emissions_optimized = None

    elif req.mode == OptimizationMode.cost:
        # Build tariff profile
        day_tariff = req.day_tariff if req.day_tariff is not None else 8.0
        night_tariff = req.night_tariff if req.night_tariff is not None else 5.0
        tariffs = _build_tariff_profile(timestamps, day_tariff, night_tariff)

        # Minimize total energy cost
        prob += pulp.lpSum(x[t] * tariffs[t] for t in range(n))

        # Compute baseline & optimized cost later
        estimated_cost_baseline = sum(baseline[t] * tariffs[t] for t in range(n))
        # est_optimized will be computed after solving
        estimated_cost_optimized = None
        est_emissions_baseline = None
        est_emissions_optimized = None

    elif req.mode == OptimizationMode.emissions:
        # Build emission factor profile (kg CO2 / kWh)
        emission_factors = _build_emission_profile(timestamps)

        # Minimize total emissions
        prob += pulp.lpSum(x[t] * emission_factors[t] for t in range(n))

        est_emissions_baseline = sum(
            baseline[t] * emission_factors[t] for t in range(n)
        )
        est_emissions_optimized = None
        estimated_cost_baseline = None
        estimated_cost_optimized = None

    else:
        raise ValueError(f"Unsupported optimization mode: {req.mode}")

    # 4) Solve
    prob.solve(pulp.PULP_CBC_CMD(msg=False))

    if pulp.LpStatus[prob.status] != "Optimal":
        raise RuntimeError(f"Optimization failed: {pulp.LpStatus[prob.status]}")

    optimized_loads = [x[t].value() for t in range(n)]
    total_optimized = sum(optimized_loads)

    # If cost/emissions mode, compute optimized metrics
    if req.mode == OptimizationMode.cost:
        day_tariff = req.day_tariff if req.day_tariff is not None else 8.0
        night_tariff = req.night_tariff if req.night_tariff is not None else 5.0
        tariffs = _build_tariff_profile(timestamps, day_tariff, night_tariff)
        estimated_cost_optimized = sum(
            optimized_loads[t] * tariffs[t] for t in range(n)
        )

    if req.mode == OptimizationMode.emissions:
        emission_factors = _build_emission_profile(timestamps)
        est_emissions_optimized = sum(
            optimized_loads[t] * emission_factors[t] for t in range(n)
        )

    # 5) Build response object
    schedule_items: list[EnergyOptimizationScheduleItem] = []
    for idx in range(n):
        schedule_items.append(
            EnergyOptimizationScheduleItem(
                hour_index=idx,
                timestamp=timestamps[idx],
                baseline_kw=baseline[idx],
                optimized_kw=optimized_loads[idx],
            )
        )

    result = EnergyOptimizationResult(
        building_id=req.building_id,
        hours=n,
        mode=req.mode,
        total_baseline_kwh=round(total_baseline, 2),
        total_optimized_kwh=round(total_optimized, 2),
        estimated_cost_baseline=round(estimated_cost_baseline, 2)
        if estimated_cost_baseline is not None
        else None,
        estimated_cost_optimized=round(estimated_cost_optimized, 2)
        if estimated_cost_optimized is not None
        else None,
        estimated_emissions_baseline_kg=round(est_emissions_baseline, 2)
        if est_emissions_baseline is not None
        else None,
        estimated_emissions_optimized_kg=round(est_emissions_optimized, 2)
        if est_emissions_optimized is not None
        else None,
        schedule=schedule_items,
    )

    return result
