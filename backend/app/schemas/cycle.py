from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, validator


class CycleBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime

    @validator("end_date")
    def end_after_start(cls, v, values):
        if "start_date" in values and v <= values["start_date"]:
            raise ValueError("end_date must be after start_date")
        return v


class CycleCreate(CycleBase):
    project_id: int


class CycleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    is_completed: Optional[bool] = None


class CycleResponse(CycleBase):
    id: int
    project_id: int
    is_active: bool
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
