from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import DashboardSummaryOut
from ..services.analytics import compute_dashboard_summary

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard-summary", response_model=DashboardSummaryOut)
def get_dashboard_summary(db: Session = Depends(get_db)):
    data = compute_dashboard_summary(db)
    return DashboardSummaryOut(**data)
