from typing import List, Optional

from app.core.database import get_db
from app.models.meta_card import MetaCard, MetaCardType
from app.schemas.meta_card import (
    MetaCardCreate,
    MetaCardResponse,
    MetaCardUpdate,
    ProjectMetaCardsResponse,
)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


def get_meta_card_by_type(
    db: Session, project_id: int, meta_type: MetaCardType
) -> Optional[MetaCard]:
    return (
        db.query(MetaCard)
        .filter(MetaCard.project_id == project_id, MetaCard.type == meta_type)
        .first()
    )


@router.get("/project/{project_id}", response_model=ProjectMetaCardsResponse)
def get_project_meta_cards(project_id: int, db: Session = Depends(get_db)):
    """Получить все мета-карточки проекта."""
    why = get_meta_card_by_type(db, project_id, MetaCardType.why)
    requirements = get_meta_card_by_type(db, project_id, MetaCardType.requirements)
    stakeholders = get_meta_card_by_type(db, project_id, MetaCardType.stakeholders)

    return ProjectMetaCardsResponse(
        why=MetaCardResponse.from_orm(why) if why else None,
        requirements=MetaCardResponse.from_orm(requirements) if requirements else None,
        stakeholders=MetaCardResponse.from_orm(stakeholders) if stakeholders else None,
    )


@router.put("/{meta_card_id}", response_model=MetaCardResponse)
def update_meta_card(
    meta_card_id: int, meta_card_data: MetaCardUpdate, db: Session = Depends(get_db)
):
    """Обновить содержимое мета-карточки."""
    db_meta_card = db.query(MetaCard).filter(MetaCard.id == meta_card_id).first()
    if not db_meta_card:
        raise HTTPException(status_code=404, detail="Meta card not found")

    update_data = meta_card_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_meta_card, key, value)

    db.commit()
    db.refresh(db_meta_card)
    return db_meta_card


@router.post("/initialize", response_model=List[MetaCardResponse])
def initialize_project_meta_cards(project_id: int, db: Session = Depends(get_db)):
    """Создать пустые мета-карточки для проекта (если не существуют)."""
    meta_cards = []
    for meta_type in MetaCardType:
        existing = get_meta_card_by_type(db, project_id, meta_type)
        if not existing:
            db_meta_card = MetaCard(type=meta_type, content="", project_id=project_id)
            db.add(db_meta_card)
            meta_cards.append(db_meta_card)

    if meta_cards:
        db.commit()
        for mc in meta_cards:
            db.refresh(mc)

    return [MetaCardResponse.from_orm(mc) for mc in meta_cards]
