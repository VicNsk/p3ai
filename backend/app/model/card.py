from app.core.database import Base
from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship


class Card(Base):
    __tablename__ = "cards"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    status = Column(String, default="new")  # new, process, done
    project_id = Column(Integer, ForeignKey("projects.id"))

    project = relationship("Project", back_populates="cards")
