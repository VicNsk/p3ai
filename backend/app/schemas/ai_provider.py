from datetime import datetime
from typing import Optional

from app.models.ai_provider import ProviderType
from pydantic import BaseModel, Field


# Базовая схема с глобальной конфигурацией для всех схем в этом файле
# Отключаем проверку защищённых имён (для поля model_name)
class BaseSchema(BaseModel):
    model_config = {"protected_namespaces": ()}


class AIProviderBase(BaseSchema):
    name: str = Field(..., min_length=1, max_length=100)
    provider_type: ProviderType
    api_base_url: Optional[str] = None
    api_key: Optional[str] = None
    model_name: str = Field(..., min_length=1)
    max_tokens: int = Field(default=2048, ge=128, le=32768)
    temperature: int = Field(default=7, ge=0, le=10)  # 0-10
    is_active: bool = False
    is_default: bool = False


class AIProviderCreate(AIProviderBase):
    pass


class AIProviderUpdate(BaseSchema):
    name: Optional[str] = None
    api_base_url: Optional[str] = None
    api_key: Optional[str] = None
    model_name: Optional[str] = None
    max_tokens: Optional[int] = None
    temperature: Optional[int] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None
    # provider_type исключён — нельзя менять тип существующего провайдера


class AIProviderResponse(BaseSchema):
    model_config = {"from_attributes": True, "protected_namespaces": ()}

    id: int
    name: str
    provider_type: ProviderType
    api_base_url: Optional[str]
    api_key: Optional[str]
    model_name: str
    max_tokens: int
    temperature: int
    is_active: bool
    is_default: bool
    created_at: datetime
    updated_at: datetime


class AIGenerateRequest(BaseSchema):
    prompt: str = Field(..., min_length=1, max_length=10000)
    system_prompt: Optional[str] = None
    max_tokens: Optional[int] = None
    temperature: Optional[int] = None


class AIGenerateResponse(BaseSchema):
    content: str
    model: str
    tokens_used: Optional[int] = None
    provider: str
