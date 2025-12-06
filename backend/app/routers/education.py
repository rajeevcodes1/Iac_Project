from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..services.education_models import compute_institution_risk

router = APIRouter(prefix="/education", tags=["education"])


@router.post("/performance")
def add_performance(
    payload: schemas.StudentPerformanceCreate, db: Session = Depends(get_db)
):
    perf = models.StudentPerformance(**payload.dict())
    db.add(perf)
    db.commit()
    db.refresh(perf)
    return {"id": perf.id}


@router.get("/risk/{institution_id}", response_model=schemas.EducationForecastOut)
def get_institution_risk(institution_id: int, db: Session = Depends(get_db)):
    forecast = compute_institution_risk(db, institution_id)
    return forecast
