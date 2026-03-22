from datetime import datetime

from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)  # Оригинальное имя файла
    file_path = Column(String, nullable=False)  # Путь к файлу на диске
    file_size = Column(BigInteger, nullable=False)  # Размер в байтах
    mime_type = Column(String, nullable=False)  # MIME-тип

    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Связи
    card = relationship("Card", back_populates="attachments")
    user = relationship("User", back_populates="attachments")
