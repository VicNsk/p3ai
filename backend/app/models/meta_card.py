from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Text,
    DateTime,
    Enum,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import enum


class MetaCardType(str, enum.Enum):
    why = "why"
    requirements = "requirements"
    stakeholders = "stakeholders"


class MetaCard(Base):
    __tablename__ = "meta_cards"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(MetaCardType), nullable=False)
    content = Column(Text, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="meta_cards")

    # Гарантия: одна мета-карточка каждого типа на проект
    __table_args__ = (
        UniqueConstraint("project_id", "type", name="uq_project_meta_type"),
    )
