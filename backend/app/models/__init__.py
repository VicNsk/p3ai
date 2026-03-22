# Импортируем все модели для регистрации метаданных SQLAlchemy
from .user import User
from .project import Project
from .card import Card
from .meta_card import MetaCard, MetaCardType
from .cycle import Cycle
from .audit_log import AuditLog, AuditAction
from .comment import Comment
from .attachment import Attachment
from .ai_provider import AIProvider, ProviderType

# Экспорт для удобного импорта в других модулях
__all__ = [
    "User",
    "Project",
    "Card",
    "MetaCard",
    "MetaCardType",
    "Cycle",
    "AuditLog",
    "AuditAction",
    "Comment",
    "Attachment",
    "AIProvider",
    "ProviderType",
]
