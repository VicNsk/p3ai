from fastapi import FastAPI
from app.core.config import settings
from app.api.v1.health import router as health_router

app = FastAPI(title=settings.APP_NAME)

app.include_router(health_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Welcome to MicroP3 API"}