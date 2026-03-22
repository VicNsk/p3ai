import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class AuditAction(str, enum.Enum):
    create = "create"
    update = "update"
    delete = "delete"
    status_change = "status_change"
    cycle_start = "cycle_start"
    cycle_complete = "cycle_complete"


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)

    # Что изменилось
    entity_type = Column(
        String, nullable=False
    )  # "card", "project", "cycle", "meta_card"
    entity_id = Column(Integer, nullable=False)
    action = Column(Enum(AuditAction), nullable=False)

    # Кто и когда
    user_id = Column(
        Integer, ForeignKey("users.id"), nullable=True
    )  # nullable для системных событий
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # Детали изменения
    field_name = Column(String, nullable=True)  # Какое поле изменилось
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)

    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    # Связи
    project = relationship("Project", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")

    def __repr__(self):
        return f"<AuditLog {self.action} {self.entity_type}:{self.entity_id} by user:{self.user_id}>"
