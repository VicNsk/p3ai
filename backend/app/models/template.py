import enum
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class TemplateType(str, enum.Enum):
    # Типы промтов для ИИ
    prompt_meta_why = "prompt_meta_why"
    prompt_meta_requirements = "prompt_meta_requirements"
    prompt_meta_stakeholders = "prompt_meta_stakeholders"
    prompt_card_description = "prompt_card_description"
    prompt_card_subtasks = "prompt_card_subtasks"
    prompt_summary = "prompt_summary"

    # Типы документов
    doc_project_brief = "doc_project_brief"
    doc_requirements = "doc_requirements"
    doc_status_report = "doc_status_report"
    doc_retrospective = "doc_retrospective"


class PromptTemplate(Base):
    """Шаблоны промтов для ИИ-генерации."""

    __tablename__ = "prompt_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # Например: "Why Meta Card"
    template_type = Column(Enum(TemplateType), nullable=False, unique=True)

    # Сам промт с поддержкой переменных {{variable}}
    prompt_text = Column(Text, nullable=False)

    # Системный промт (инструкция для ИИ)
    system_prompt = Column(Text, nullable=True)

    # Настройки по умолчанию
    default_model = Column(String, default="llama3.2")
    default_temperature = Column(Integer, default=7)  # 0-10
    default_max_tokens = Column(Integer, default=2048)

    # Метаданные
    description = Column(Text, nullable=True)  # Описание назначения
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=True)  # Использовать по умолчанию

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<PromptTemplate {self.name} ({self.template_type})>"


class DocumentTemplate(Base):
    """Шаблоны документов для экспорта/генерации."""

    __tablename__ = "document_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # Например: "Project Brief"
    template_type = Column(Enum(TemplateType), nullable=False, unique=True)

    # Шаблон документа (Markdown/HTML с переменными {{variable}})
    content_template = Column(Text, nullable=False)

    # Формат экспорта
    output_format = Column(String, default="markdown")  # markdown, html, pdf

    # Метаданные
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<DocumentTemplate {self.name} ({self.template_type})>"
