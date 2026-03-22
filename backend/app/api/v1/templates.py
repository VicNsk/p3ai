from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.template import PromptTemplate, DocumentTemplate, TemplateType
from app.schemas.template import (
    PromptTemplateCreate,
    PromptTemplateUpdate,
    PromptTemplateResponse,
    DocumentTemplateCreate,
    DocumentTemplateUpdate,
    DocumentTemplateResponse,
)
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

# === Prompt Templates ===


@router.get("/prompts", response_model=List[PromptTemplateResponse])
def list_prompt_templates(
    template_type: Optional[TemplateType] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Получить список шаблонов промтов."""
    query = db.query(PromptTemplate)
    if template_type:
        query = query.filter(PromptTemplate.template_type == template_type)
    return query.all()


@router.get("/prompts/{template_type}", response_model=PromptTemplateResponse)
def get_prompt_template(
    template_type: TemplateType,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Получить шаблон промта по типу."""
    template = (
        db.query(PromptTemplate)
        .filter(PromptTemplate.template_type == template_type)
        .first()
    )
    if not template:
        raise HTTPException(status_code=404, detail="Prompt template not found")
    return template


@router.post("/prompts", response_model=PromptTemplateResponse)
def create_prompt_template(
    template: PromptTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Создать шаблон промта."""
    # Проверка на дубликат типа
    existing = (
        db.query(PromptTemplate)
        .filter(PromptTemplate.template_type == template.template_type)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Prompt template for {template.template_type} already exists",
        )

    db_template = PromptTemplate(**template.model_dump())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template


@router.put("/prompts/{template_id}", response_model=PromptTemplateResponse)
def update_prompt_template(
    template_id: int,
    template_data: PromptTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Обновить шаблон промта."""
    db_template = (
        db.query(PromptTemplate).filter(PromptTemplate.id == template_id).first()
    )
    if not db_template:
        raise HTTPException(status_code=404, detail="Prompt template not found")

    update_data = template_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_template, key, value)

    db.commit()
    db.refresh(db_template)
    return db_template


@router.delete("/prompts/{template_id}")
def delete_prompt_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Удалить шаблон промта."""
    db_template = (
        db.query(PromptTemplate).filter(PromptTemplate.id == template_id).first()
    )
    if not db_template:
        raise HTTPException(status_code=404, detail="Prompt template not found")

    db.delete(db_template)
    db.commit()
    return {"ok": True}


# === Document Templates ===


@router.get("/documents", response_model=List[DocumentTemplateResponse])
def list_document_templates(
    template_type: Optional[TemplateType] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Получить список шаблонов документов."""
    query = db.query(DocumentTemplate)
    if template_type:
        query = query.filter(DocumentTemplate.template_type == template_type)
    return query.all()


@router.get("/documents/{template_type}", response_model=DocumentTemplateResponse)
def get_document_template(
    template_type: TemplateType,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Получить шаблон документа по типу."""
    template = (
        db.query(DocumentTemplate)
        .filter(DocumentTemplate.template_type == template_type)
        .first()
    )
    if not template:
        raise HTTPException(status_code=404, detail="Document template not found")
    return template


@router.post("/documents", response_model=DocumentTemplateResponse)
def create_document_template(
    template: DocumentTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Создать шаблон документа."""
    existing = (
        db.query(DocumentTemplate)
        .filter(DocumentTemplate.template_type == template.template_type)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document template for {template.template_type} already exists",
        )

    db_template = DocumentTemplate(**template.model_dump())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template


@router.put("/documents/{template_id}", response_model=DocumentTemplateResponse)
def update_document_template(
    template_id: int,
    template_data: DocumentTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Обновить шаблон документа."""
    db_template = (
        db.query(DocumentTemplate).filter(DocumentTemplate.id == template_id).first()
    )
    if not db_template:
        raise HTTPException(status_code=404, detail="Document template not found")

    update_data = template_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_template, key, value)

    db.commit()
    db.refresh(db_template)
    return db_template


@router.delete("/documents/{template_id}")
def delete_document_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Удалить шаблон документа."""
    db_template = (
        db.query(DocumentTemplate).filter(DocumentTemplate.id == template_id).first()
    )
    if not db_template:
        raise HTTPException(status_code=404, detail="Document template not found")

    db.delete(db_template)
    db.commit()
    return {"ok": True}
