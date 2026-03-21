from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="new")  # new, process, done
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    project = relationship("Project", back_populates="cards")
