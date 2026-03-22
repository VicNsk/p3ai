from typing import List

from app.core.database import get_db
from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentResponse
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/card/{card_id}", response_model=List[CommentResponse])
def list_comments(card_id: int, db: Session = Depends(get_db)):
    """Получить все комментарии карточки."""
    return (
        db.query(Comment)
        .filter(Comment.card_id == card_id)
        .order_by(Comment.created_at)
        .all()
    )


@router.post("/", response_model=CommentResponse)
def create_comment(comment: CommentCreate, db: Session = Depends(get_db)):
    """Добавить комментарий к карточке."""
    db_comment = Comment(**comment.dict())
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


@router.delete("/{comment_id}")
def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    """Удалить комментарий."""
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    db.delete(db_comment)
    db.commit()
    return {"ok": True}
