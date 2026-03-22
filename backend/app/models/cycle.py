from datetime import datetime, timedelta

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Cycle(Base):
    __tablename__ = "cycles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # Например: "Неделя 1", "Спринт 2026-12"
    description = Column(Text, nullable=True)

    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)

    is_active = Column(Boolean, default=False)
    is_completed = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="cycles")
    cards = relationship("Card", back_populates="cycle")  # Опционально: привязка карточек к циклу

    def __repr__(self):
        return f"<Cycle {self.name}: {self.start_date.date()} - {self.end_date.date()}>"
