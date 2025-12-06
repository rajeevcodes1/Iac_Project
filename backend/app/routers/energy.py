from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta

from ..database import get_db
from .. import models, schemas
from ..services.energy_forecasting import forecast_building_energy

router = APIRouter(prefix="/energy", tags=["energy"])


@router.post("/readings", response_model=schemas.EnergyReadingOut)
def create_reading(payload: schemas.EnergyReadingCreate, db: Session = Depends(get_db)):
    sensor = db.query(models.Sensor).filter_by(id=payload.sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")

    reading = models.EnergyReading(**payload.dict())
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading


@router.get(
    "/forecast/{building_id}",
    response_model=List[schemas.EnergyForecastOut],
)
def get_energy_forecast(
    building_id: int, horizon_hours: int = 24, db: Session = Depends(get_db)
):
    forecasts = forecast_building_energy(db, building_id, horizon_hours=horizon_hours)
    return forecasts


@router.get(
    "/intensity",
    response_model=List[schemas.BuildingEnergyIntensityOut],
)
def get_building_energy_intensity(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    since = now - timedelta(hours=24)

    q = (
        db.query(
            models.Building.id.label("building_id"),
            models.Building.name,
            models.Building.type,
            models.Building.latitude,
            models.Building.longitude,
            models.Building.city_zone,
            func.coalesce(func.sum(models.EnergyReading.value), 0.0).label("total_kwh_24h"),
        )
        .join(models.Sensor, models.Sensor.building_id == models.Building.id)
        .join(models.EnergyReading, models.EnergyReading.sensor_id == models.Sensor.id)
        .filter(models.EnergyReading.timestamp >= since)
        .group_by(
            models.Building.id,
            models.Building.name,
            models.Building.type,
            models.Building.latitude,
            models.Building.longitude,
            models.Building.city_zone,
        )
    )

    rows = q.all()

    result: List[schemas.BuildingEnergyIntensityOut] = []
    for r in rows:
        result.append(
            schemas.BuildingEnergyIntensityOut(
                building_id=r.building_id,
                name=r.name,
                type=r.type,
                latitude=r.latitude,
                longitude=r.longitude,
                city_zone=r.city_zone,
                total_kwh_24h=float(r.total_kwh_24h or 0.0),
            )
        )

    return result
