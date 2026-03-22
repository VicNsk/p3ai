from fastapi import FastAPI

from app.api.v1.auth import router as auth_router
from app.api.v1.cards import router as cards_router
from app.api.v1.health import router as health_router
from app.api.v1.meta_cards import router as meta_cards_router
from app.api.v1.projects import router as projects_router
from app.core.config import settings
from app.api.v1.cycles import router as cycles_router
from app.api.v1.audit import router as audit_router

app = FastAPI(title=settings.APP_NAME)

app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(projects_router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(cards_router, prefix="/api/v1/cards", tags=["Cards"])
app.include_router(meta_cards_router, prefix="/api/v1/meta-cards", tags=["MetaCards"])
app.include_router(cycles_router, prefix="/api/v1/cycles", tags=["Cycles"])
app.include_router(audit_router, prefix="/api/v1/audit", tags=["Audit"])


@app.get("/")
def root():
    return {"message": "Welcome to MicroP3 API"}
