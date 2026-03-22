from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    assigned_cards = relationship(
        "Card", back_populates="assignee", foreign_keys="Card.assignee_id"
    )
    audit_logs = relationship("AuditLog", back_populates="user")
