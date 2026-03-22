import os
import uuid
from datetime import datetime
from typing import List

from app.core.database import get_db
from app.models.attachment import Attachment
from app.schemas.attachment import AttachmentResponse
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

router = APIRouter()

# Папка для загрузок
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/card/{card_id}", response_model=List[AttachmentResponse])
def list_attachments(card_id: int, db: Session = Depends(get_db)):
    """Получить все вложения карточки."""
    return db.query(Attachment).filter(Attachment.card_id == card_id).all()


@router.post("/upload", response_model=AttachmentResponse)
async def upload_attachment(
    card_id: int,
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Загрузить файл к карточке."""
    # Генерация уникального имени файла
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Сохранение файла
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    # Создание записи в БД
    db_attachment = Attachment(
        filename=file.filename,
        file_path=file_path,
        file_size=len(content),
        mime_type=file.content_type or "application/octet-stream",
        card_id=card_id,
        user_id=user_id,
    )
    db.add(db_attachment)
    db.commit()
    db.refresh(db_attachment)
    return db_attachment


@router.delete("/{attachment_id}")
def delete_attachment(attachment_id: int, db: Session = Depends(get_db)):
    """Удалить вложение."""
    db_attachment = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if not db_attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")

    # Удаление файла с диска
    if os.path.exists(db_attachment.file_path):
        os.remove(db_attachment.file_path)

    db.delete(db_attachment)
    db.commit()
    return {"ok": True}


@router.get("/download/{attachment_id}")
async def download_attachment(attachment_id: int, db: Session = Depends(get_db)):
    """Скачать файл."""
    from fastapi.responses import FileResponse

    db_attachment = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if not db_attachment or not os.path.exists(db_attachment.file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        db_attachment.file_path,
        filename=db_attachment.filename,
        media_type=db_attachment.mime_type,
    )
