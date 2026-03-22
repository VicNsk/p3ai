from datetime import datetime, timedelta
from typing import List

from app.core.database import get_db
from app.models.cycle import Cycle
from app.schemas.cycle import CycleCreate, CycleResponse, CycleUpdate
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/project/{project_id}", response_model=List[CycleResponse])
def list_cycles(project_id: int, db: Session = Depends(get_db)):
    """Получить все циклы проекта."""
    return (
        db.query(Cycle)
        .filter(Cycle.project_id == project_id)
        .order_by(Cycle.start_date.desc())
        .all()
    )


@router.get("/project/{project_id}/active", response_model=CycleResponse)
def get_active_cycle(project_id: int, db: Session = Depends(get_db)):
    """Получить активный цикл проекта."""
    cycle = (
        db.query(Cycle)
        .filter(
            Cycle.project_id == project_id,
            Cycle.is_active == True,
            Cycle.is_completed == False,
        )
        .first()
    )
    if not cycle:
        raise HTTPException(status_code=404, detail="No active cycle found")
    return cycle


@router.post("/", response_model=CycleResponse)
def create_cycle(cycle: CycleCreate, db: Session = Depends(get_db)):
    """Создать новый цикл."""
    # Деактивировать предыдущий активный цикл
    db.query(Cycle).filter(
        Cycle.project_id == cycle.project_id, Cycle.is_active == True
    ).update({"is_active": False})

    db_cycle = Cycle(**cycle.dict(), is_active=True)
    db.add(db_cycle)
    db.commit()
    db.refresh(db_cycle)
    return db_cycle


@router.put("/{cycle_id}", response_model=CycleResponse)
def update_cycle(cycle_id: int, cycle_data: CycleUpdate, db: Session = Depends(get_db)):
    """Обновить цикл."""
    db_cycle = db.query(Cycle).filter(Cycle.id == cycle_id).first()
    if not db_cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")

    update_data = cycle_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_cycle, key, value)

    db.commit()
    db.refresh(db_cycle)
    return db_cycle


@router.post("/{cycle_id}/complete")
def complete_cycle(cycle_id: int, db: Session = Depends(get_db)):
    """Завершить цикл."""
    db_cycle = db.query(Cycle).filter(Cycle.id == cycle_id).first()
    if not db_cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")

    db_cycle.is_completed = True
    db_cycle.is_active = False
    db.commit()
    return {"ok": True, "cycle": db_cycle}
