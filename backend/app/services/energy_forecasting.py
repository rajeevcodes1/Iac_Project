from datetime import datetime, timedelta
from typing import List, Dict
from collections import defaultdict

from sqlalchemy.orm import Session

from .. import models

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor


def _get_building_hourly_series(
    db: Session, building_id: int, days: int = 14
) -> List[Dict]:
    """
    Aggregate all sensor readings for a building into hourly total kWh
    for the last `days` days. Returns list of dicts:
    [{"timestamp": datetime, "value": float}, ...]
    """
    sensors = (
        db.query(models.Sensor)
        .filter_by(building_id=building_id, is_active=True)
        .all()
    )
    sensor_ids = [s.id for s in sensors]
    if not sensor_ids:
        return []

    now = datetime.utcnow()
    start = now - timedelta(days=days)

    readings = (
        db.query(models.EnergyReading)
        .filter(
            models.EnergyReading.sensor_id.in_(sensor_ids),
            models.EnergyReading.timestamp >= start,
        )
        .all()
    )
    if not readings:
        return []

    bucket = defaultdict(float)
    for r in readings:
        ts = r.timestamp.replace(minute=0, second=0, microsecond=0)
        bucket[ts] += float(r.value)

    series = [{"timestamp": ts, "value": val} for ts, val in bucket.items()]
    series.sort(key=lambda x: x["timestamp"])
    return series


def _compute_hourly_baseline(series: List[Dict]) -> List[float]:
    """
    Build a 24-slot baseline profile from historical series.
    baseline[hour] = average kWh at that hour over history.
    """
    if not series:
        return [0.0] * 24

    hourly_totals = [0.0] * 24
    hourly_counts = [0] * 24

    for point in series:
        ts = point["timestamp"]
        val = point["value"]
        h = ts.hour
        hourly_totals[h] += val
        hourly_counts[h] += 1

    baseline = []
    for h in range(24):
        if hourly_counts[h] > 0:
            baseline.append(hourly_totals[h] / hourly_counts[h])
        else:
            # fill missing hours with global average
            global_avg = sum(hourly_totals) / max(sum(hourly_counts), 1)
            baseline.append(global_avg)
    return baseline


def _train_ml_model(series: List[Dict]):
    """
    Train a simple GradientBoostingRegressor on features:
      X = [hour_of_day, day_of_week]
      y = total kWh

    Returns (model, feature_mean) or (None, None) if not enough data.
    """
    if len(series) < 24:  # need at least 1 day of data
        return None

    rows = []
    for point in series:
        ts = point["timestamp"]
        val = point["value"]
        rows.append(
            {
                "value": val,
                "hour": ts.hour,
                "dow": ts.weekday(),  # 0=Mon .. 6=Sun
            }
        )

    df = pd.DataFrame(rows)
    if df["value"].nunique() <= 1:
        # no variation → ML won’t learn anything useful
        return None

    X = df[["hour", "dow"]].values
    y = df["value"].values

    model = GradientBoostingRegressor(
        n_estimators=100,
        learning_rate=0.05,
        max_depth=3,
        random_state=42,
    )
    model.fit(X, y)

    return model


def forecast_building_energy(
    db: Session, building_id: int, horizon_hours: int = 24
) -> List[models.EnergyForecast]:
    """
    Hybrid forecast:
      1) Build 14-day hourly series from all sensors.
      2) Compute 24h baseline profile (moving average).
      3) Train ML model on [hour, weekday] -> kWh.
      4) For each future hour:
           hybrid = w_baseline * baseline + w_ml * ml_pred
    """
    series = _get_building_hourly_series(db, building_id, days=14)
    if not series:
        return []

    baseline_profile = _compute_hourly_baseline(series)
    ml_model = _train_ml_model(series)

    now = datetime.utcnow()
    forecasts: List[models.EnergyForecast] = []

    # weights: tweak if you want ML to dominate more/less
    w_baseline = 0.6
    w_ml = 0.4 if ml_model is not None else 0.0

    for h in range(horizon_hours):
        ts = now + timedelta(hours=h + 1)
        hour = ts.hour
        dow = ts.weekday()

        baseline_val = baseline_profile[hour]

        if ml_model is not None:
            ml_pred = float(ml_model.predict(np.array([[hour, dow]]))[0])
        else:
            ml_pred = baseline_val

        # combine
        value = w_baseline * baseline_val + w_ml * ml_pred
        value = max(0.0, value)  # no negative kWh

        forecast = models.EnergyForecast(
            building_id=building_id,
            timestamp=ts,
            horizon_hours=h + 1,
            predicted_value=value,
        )
        db.add(forecast)
        forecasts.append(forecast)

    db.commit()
    for f in forecasts:
        db.refresh(f)

    return forecasts
