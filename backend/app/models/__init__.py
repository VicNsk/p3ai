"""
Модели данных приложения.

Этот файл обеспечивает импорт всех моделей для:
1. Alembic (авто-генерация миграций через Base.metadata)
2. Приложения (импорт через app.models.User и т.д.)
"""

# Импортируем все модели для регистрации метаданных SQLAlchemy
# Порядок импорта не важен, но важно импортировать ВСЕ модели

from .user import User
from .project import Project
from .card import Card
from .meta_card import MetaCard, MetaCardType
from .cycle import Cycle
from .audit_log import AuditLog, AuditAction
from .comment import Comment
from .attachment import Attachment
from .ai_provider import AIProvider, ProviderType
from .template import PromptTemplate, DocumentTemplate, TemplateType

# Экспорт для удобного импорта в других модулях
# Это позволяет делать: from app.models import User, PromptTemplate, etc.
__all__ = [
    # Пользователи и аутентификация
    "User",
    # Проекты и задачи
    "Project",
    "Card",
    # Мета-информация проектов
    "MetaCard",
    "MetaCardType",
    # Планирование и итерации
    "Cycle",
    # Аудит и история изменений
    "AuditLog",
    "AuditAction",
    # Коммуникация в карточках
    "Comment",
    "Attachment",
    # ИИ-интеграция
    "AIProvider",
    "ProviderType",
    # Шаблоны и промты (Спринт 7)
    "PromptTemplate",
    "DocumentTemplate",
    "TemplateType",
]
