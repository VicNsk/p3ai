from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    cards = relationship("Card", back_populates="project", cascade="all, delete-orphan")
    meta_cards = relationship(
        "MetaCard", back_populates="project", cascade="all, delete-orphan"
    )
    cycles = relationship(
        "Cycle", back_populates="project", cascade="all, delete-orphan"
    )
    audit_logs = relationship(
        "AuditLog", back_populates="project", cascade="all, delete-orphan"
    )
