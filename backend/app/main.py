from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app.api.v1.ai import router as ai_router
from app.api.v1.attachments import router as attachments_router
from app.api.v1.audit import router as audit_router
from app.api.v1.auth import router as auth_router
from app.api.v1.cards import router as cards_router
from app.api.v1.comments import router as comments_router
from app.api.v1.cycles import router as cycles_router
from app.api.v1.health import router as health_router
from app.api.v1.meta_cards import router as meta_cards_router
from app.api.v1.projects import router as projects_router
from app.core.config import settings

BaseModel.model_config = {"protected_namespaces": ()}
app = FastAPI(title=settings.APP_NAME)

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.errors import ServerErrorMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(projects_router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(cards_router, prefix="/api/v1/cards", tags=["Cards"])
app.include_router(meta_cards_router, prefix="/api/v1/meta-cards", tags=["MetaCards"])
app.include_router(cycles_router, prefix="/api/v1/cycles", tags=["Cycles"])
app.include_router(audit_router, prefix="/api/v1/audit", tags=["Audit"])
app.include_router(comments_router, prefix="/api/v1/comments", tags=["Comments"])
app.include_router(
    attachments_router, prefix="/api/v1/attachments", tags=["Attachments"]
)
app.include_router(ai_router, prefix="/api/v1/ai", tags=["AI"])


@app.get("/")
def root():
    return {"message": "Welcome to MicroP3 API"}
