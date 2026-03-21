from typing import List

from app.core.database import get_db
from app.models.card import Card, CardStatus
from app.schemas.card import CardCreate, CardResponse, CardUpdate
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/", response_model=CardResponse)
def create_card(card: CardCreate, db: Session = Depends(get_db)):
    db_card = Card(**card.dict())
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card


@router.get("/", response_model=List[CardResponse])
def list_cards(project_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Card)
        .filter(Card.project_id == project_id)
        .order_by(Card.order_index)
        .all()
    )


@router.patch("/{card_id}", response_model=CardResponse)
def update_card(card_id: int, card_data: CardUpdate, db: Session = Depends(get_db)):
    db_card = db.query(Card).filter(Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found")

    update_data = card_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_card, key, value)

    db.commit()
    db.refresh(db_card)
    return db_card


@router.delete("/{card_id}")
def delete_card(card_id: int, db: Session = Depends(get_db)):
    db_card = db.query(Card).filter(Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found")
    db.delete(db_card)
    db.commit()
    return {"ok": True}
