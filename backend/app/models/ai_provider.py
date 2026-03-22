import enum
from datetime import datetime

from sqlalchemy import JSON, Boolean, Column, DateTime, Enum, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class ProviderType(str, enum.Enum):
    openai = "openai"
    anthropic = "anthropic"
    local = "local"  # Ollama, LM Studio, etc.
    custom = "custom"  # OpenRouter, Together AI, etc.


class AIProvider(Base):
    __tablename__ = "ai_providers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    provider_type = Column(Enum(ProviderType), nullable=False)

    # Конфигурация
    api_base_url = Column(String, nullable=True)
    api_key = Column(String, nullable=True)
    model_name = Column(String, nullable=False)

    # Параметры генерации
    max_tokens = Column(Integer, default=2048)
    temperature = Column(Integer, default=7)  # 0-10 (делится на 10 в сервисе)

    # Флаги
    is_active = Column(Boolean, default=False)
    is_default = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<AIProvider {self.name} ({self.provider_type})>"
