from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProjectBase(BaseModel):
    name: str


class ProjectCreate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: int
    owner_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
