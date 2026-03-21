from typing import List

from app.core.database import get_db
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectResponse
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/", response_model=ProjectResponse)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    db_project = Project(name=project.name, owner_id=1)  # Временный owner_id
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


@router.get("/", response_model=List[ProjectResponse])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    projects = db.query(Project).offset(skip).limit(limit).all()
    return projects


@router.get("/{project_id}", response_model=ProjectResponse)
def read_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
