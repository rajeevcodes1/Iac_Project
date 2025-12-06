from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import (
    EnergyOptimizationRequest,
    EnergyOptimizationResult,
)
from ..services.optimization_engine import optimize_energy_schedule

router = APIRouter(tags=["optimization"])


@router.post("/optimize/energy", response_model=EnergyOptimizationResult)
def optimize_energy(
    payload: EnergyOptimizationRequest, db: Session = Depends(get_db)
):
    try:
        return optimize_energy_schedule(db, payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
