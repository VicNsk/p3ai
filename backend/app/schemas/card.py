from datetime import datetime
from typing import Optional

from app.models.card import CardPriority, CardStatus
from pydantic import BaseModel, Field


class CardBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    priority: CardPriority = CardPriority.medium
    due_date: Optional[datetime] = None


class CardCreate(CardBase):
    project_id: int


class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[CardStatus] = None
    priority: Optional[CardPriority] = None
    assignee_id: Optional[int] = None
    due_date: Optional[datetime] = None
    order_index: Optional[int] = None


class CardResponse(CardBase):
    id: int
    status: CardStatus
    order_index: int
    project_id: int
    assignee_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
