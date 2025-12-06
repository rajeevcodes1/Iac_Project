from typing import Optional, List
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    role: str = "city_admin"


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True


class BuildingBase(BaseModel):
    name: str
    type: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    city_zone: Optional[str] = None


class BuildingCreate(BuildingBase):
    pass


class BuildingOut(BuildingBase):
    id: int

    class Config:
        orm_mode = True


class EnergyReadingCreate(BaseModel):
    sensor_id: int
    timestamp: Optional[datetime] = None
    value: float


class EnergyReadingOut(BaseModel):
    id: int
    sensor_id: int
    timestamp: datetime
    value: float

    class Config:
        orm_mode = True


class EnergyForecastOut(BaseModel):
    building_id: int
    timestamp: datetime
    horizon_hours: int
    predicted_value: float

    class Config:
        orm_mode = True


class BuildingEnergyIntensityOut(BaseModel):
    building_id: int
    name: str
    type: str
    latitude: Optional[float]
    longitude: Optional[float]
    city_zone: Optional[str]
    total_kwh_24h: float

    class Config:
        orm_mode = True


class StudentPerformanceCreate(BaseModel):
    student_id: int
    timestamp: Optional[datetime] = None
    score: float
    attendance: float


class EducationForecastOut(BaseModel):
    institution_id: int
    timestamp: datetime
    risk_level: float
    notes: Optional[str]

    class Config:
        orm_mode = True


# ===== Old simple optimization models (can be kept or removed if unused) =====
class OptimizationRequest(BaseModel):
    building_id: int
    max_load_kw: float
    hours: int = 24


class OptimizationScheduleItem(BaseModel):
    hour: int
    load_kw: float


class OptimizationResponse(BaseModel):
    building_id: int
    schedule: List[OptimizationScheduleItem]
    total_energy_kwh: float


# ===== Dashboard summary =====
class DashboardSummaryOut(BaseModel):
    monitored_buildings: int
    avg_daily_energy_kwh: float
    at_risk_institutions: int
    potential_energy_savings_percent: float


# ===== New advanced optimization models =====
class OptimizationMode(str, Enum):
    peak = "peak"
    cost = "cost"
    emissions = "emissions"


class EnergyOptimizationRequest(BaseModel):
    building_id: int
    max_load_kw: float
    hours: int = 24
    mode: OptimizationMode = OptimizationMode.peak

    # Used in "cost" mode (₹/kWh)
    day_tariff: float | None = 8.0   # 08:00–22:00
    night_tariff: float | None = 5.0 # 22:00–08:00


class EnergyOptimizationScheduleItem(BaseModel):
    hour_index: int
    timestamp: datetime
    baseline_kw: float
    optimized_kw: float


class EnergyOptimizationResult(BaseModel):
    building_id: int
    hours: int
    mode: OptimizationMode
    total_baseline_kwh: float
    total_optimized_kwh: float
    estimated_cost_baseline: Optional[float] = None
    estimated_cost_optimized: Optional[float] = None
    estimated_emissions_baseline_kg: Optional[float] = None
    estimated_emissions_optimized_kg: Optional[float] = None
    schedule: List[EnergyOptimizationScheduleItem]
