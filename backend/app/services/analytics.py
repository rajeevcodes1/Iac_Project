from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models


def compute_dashboard_summary(db: Session):
    # 1) Monitored buildings
    monitored_buildings = db.query(models.Building).count()

    # 2) Avg daily energy (kWh) over last 7 days
    now = datetime.utcnow()
    seven_days_ago = now - timedelta(days=7)

    total_energy_7d = (
        db.query(func.coalesce(func.sum(models.EnergyReading.value), 0.0))
        .filter(models.EnergyReading.timestamp >= seven_days_ago)
        .scalar()
    )
    avg_daily_energy_kwh = float(total_energy_7d / 7.0) if total_energy_7d else 0.0

    # 3) At-risk institutions (avg student risk > 0.5)
    institutions = db.query(models.Institution).all()
    at_risk_institutions = 0

    for inst in institutions:
        students = (
            db.query(models.Student)
            .filter(models.Student.institution_id == inst.id)
            .all()
        )
        if not students:
            continue
        avg_risk = sum(s.risk_score for s in students) / len(students)
        if avg_risk > 0.5:
            at_risk_institutions += 1

    # 4) Potential energy savings (simple heuristic)
    # For now: assume if we apply optimization we can save 10–25%
    # based on how "peaky" the last day’s load is.
    one_day_ago = now - timedelta(days=1)
    max_hourly = (
        db.query(func.coalesce(func.max(models.EnergyReading.value), 0.0))
        .filter(models.EnergyReading.timestamp >= one_day_ago)
        .scalar()
    )
    min_hourly = (
        db.query(func.coalesce(func.min(models.EnergyReading.value), 0.0))
        .filter(models.EnergyReading.timestamp >= one_day_ago)
        .scalar()
    )

    if max_hourly and min_hourly:
        peak_ratio = max_hourly / max(min_hourly, 0.1)
        # more peaky => more potential savings
        potential_savings = max(10.0, min(25.0, (peak_ratio - 1.0) * 5.0))
    else:
        potential_savings = 15.0

    return {
        "monitored_buildings": monitored_buildings,
        "avg_daily_energy_kwh": round(avg_daily_energy_kwh, 2),
        "at_risk_institutions": at_risk_institutions,
        "potential_energy_savings_percent": round(potential_savings, 1),
    }
