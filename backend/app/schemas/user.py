from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    is_active: bool = True


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    email: str
