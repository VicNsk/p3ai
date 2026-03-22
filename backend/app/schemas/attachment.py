from datetime import datetime

from pydantic import BaseModel


class AttachmentResponse(BaseModel):
    id: int
    filename: str
    file_path: str
    file_size: int
    mime_type: str
    card_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
