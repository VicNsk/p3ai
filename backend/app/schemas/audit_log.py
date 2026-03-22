from datetime import datetime
from typing import Optional

from app.models.audit_log import AuditAction
from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    id: int
    entity_type: str
    entity_id: int
    action: AuditAction
    user_id: Optional[int]
    timestamp: datetime
    field_name: Optional[str]
    old_value: Optional[str]
    new_value: Optional[str]
    project_id: int

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    total: int
    items: list[AuditLogResponse]
