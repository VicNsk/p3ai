from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import enum


class CardStatus(str, enum.Enum):
    new = "new"
    process = "process"
    done = "done"


class CardPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)

    # Статус и приоритет
    status = Column(Enum(CardStatus), default=CardStatus.new, nullable=False)
    priority = Column(Enum(CardPriority), default=CardPriority.medium)

    # Позиция в колонке (для сортировки)
    order_index = Column(Integer, default=0)

    # Связи (Foreign Keys)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    due_date = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    # back_populates должен точно совпадать с именем в модели Project
    project = relationship("Project", back_populates="cards")

    # back_populates должен точно совпадать с именем в модели User
    # foreign_keys обязателен для разрешения неоднозначности
    assignee = relationship(
        "User", back_populates="assigned_cards", foreign_keys=[assignee_id]
    )
    cycle_id = Column(Integer, ForeignKey("cycles.id"), nullable=True)
    cycle = relationship("Cycle", back_populates="cards")
