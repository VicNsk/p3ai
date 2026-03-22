from datetime import datetime
from typing import Optional

from app.models.template import TemplateType
from pydantic import BaseModel, Field


# === PromptTemplate ===
class PromptTemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    template_type: TemplateType
    prompt_text: str = Field(..., min_length=1)
    system_prompt: Optional[str] = None
    default_model: str = "llama3.2"
    default_temperature: int = Field(default=7, ge=0, le=10)
    default_max_tokens: int = Field(default=2048, ge=128, le=32768)
    description: Optional[str] = None
    is_active: bool = True
    is_default: bool = True


class PromptTemplateCreate(PromptTemplateBase):
    pass


class PromptTemplateUpdate(BaseModel):
    name: Optional[str] = None
    prompt_text: Optional[str] = None
    system_prompt: Optional[str] = None
    default_model: Optional[str] = None
    default_temperature: Optional[int] = None
    default_max_tokens: Optional[int] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None


class PromptTemplateResponse(PromptTemplateBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# === DocumentTemplate ===
class DocumentTemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    template_type: TemplateType
    content_template: str = Field(..., min_length=1)
    output_format: str = "markdown"
    description: Optional[str] = None
    is_active: bool = True
    is_default: bool = True


class DocumentTemplateCreate(DocumentTemplateBase):
    pass


class DocumentTemplateUpdate(BaseModel):
    name: Optional[str] = None
    content_template: Optional[str] = None
    output_format: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None


class DocumentTemplateResponse(DocumentTemplateBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
