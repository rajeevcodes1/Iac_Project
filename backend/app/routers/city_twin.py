from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/city", tags=["city-twin"])


@router.post("/buildings", response_model=schemas.BuildingOut)
def create_building(building: schemas.BuildingCreate, db: Session = Depends(get_db)):
    db_building = models.Building(**building.dict())
    db.add(db_building)
    db.commit()
    db.refresh(db_building)
    return db_building


@router.get("/buildings", response_model=List[schemas.BuildingOut])
def list_buildings(db: Session = Depends(get_db)):
    return db.query(models.Building).all()
