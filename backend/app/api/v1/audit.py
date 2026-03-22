from typing import List, Optional

from app.core.database import get_db
from app.models.audit_log import AuditAction, AuditLog
from app.schemas.audit_log import AuditLogListResponse, AuditLogResponse
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/project/{project_id}", response_model=AuditLogListResponse)
def get_audit_log(
    project_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    entity_type: Optional[str] = None,
    action: Optional[AuditAction] = None,
    db: Session = Depends(get_db),
):
    """Получить историю изменений проекта."""
    query = db.query(AuditLog).filter(AuditLog.project_id == project_id)

    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if action:
        query = query.filter(AuditLog.action == action)

    total = query.count()
    items = query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()

    return AuditLogListResponse(total=total, items=items)


# Вспомогательная функция для создания записей лога (используется в других эндпоинтах)
def log_action(
    db: Session,
    project_id: int,
    entity_type: str,
    entity_id: int,
    action: AuditAction,
    user_id: Optional[int] = None,
    field_name: Optional[str] = None,
    old_value: Optional[str] = None,
    new_value: Optional[str] = None,
):
    """Создать запись в аудит-логе."""
    log = AuditLog(
        project_id=project_id,
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        user_id=user_id,
        field_name=field_name,
        old_value=str(old_value) if old_value is not None else None,
        new_value=str(new_value) if new_value is not None else None,
    )
    db.add(log)
    db.commit()
