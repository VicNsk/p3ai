from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from app.models.meta_card import MetaCardType


class MetaCardBase(BaseModel):
    type: MetaCardType
    # Для создания/обновления: разрешаем пустой контент (валидация на уровне бизнес-логики)
    content: str = Field(default="", max_length=10000)


class MetaCardCreate(MetaCardBase):
    project_id: int


class MetaCardUpdate(BaseModel):
    content: Optional[str] = Field(default=None, max_length=10000)


class MetaCardResponse(MetaCardBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectMetaCardsResponse(BaseModel):
    why: Optional[MetaCardResponse] = None
    requirements: Optional[MetaCardResponse] = None
    stakeholders: Optional[MetaCardResponse] = None
