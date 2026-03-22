from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.ai_provider import AIProvider, ProviderType
from app.schemas.ai_provider import (
    AIProviderCreate,
    AIProviderUpdate,
    AIProviderResponse,
    AIGenerateRequest,
    AIGenerateResponse,
)
from app.services.ai_service import AIService
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()


def get_active_provider(db: Session) -> AIProvider:
    """Получить активный AI-провайдер."""
    provider = db.query(AIProvider).filter(AIProvider.is_active == True).first()
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active AI provider configured. Please configure one in settings.",
        )
    return provider


@router.get("/providers", response_model=List[AIProviderResponse])
def list_providers(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Получить список всех AI-провайдеров."""
    return db.query(AIProvider).all()


@router.get("/providers/active", response_model=AIProviderResponse)
def get_active_provider_endpoint(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Получить активный AI-провайдер."""
    return get_active_provider(db)


@router.post("/providers", response_model=AIProviderResponse)
def create_provider(
    provider: AIProviderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Добавить новый AI-провайдер."""
    # Если новый провайдер активный, деактивировать остальные
    if provider.is_active:
        db.query(AIProvider).update({"is_active": False})

    db_provider = AIProvider(**provider.model_dump())
    db.add(db_provider)
    db.commit()
    db.refresh(db_provider)
    return db_provider


@router.put("/providers/{provider_id}", response_model=AIProviderResponse)
def update_provider(
    provider_id: int,
    provider_data: AIProviderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Обновить AI-провайдер."""
    db_provider = db.query(AIProvider).filter(AIProvider.id == provider_id).first()
    if not db_provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    # Если активируем этот, деактивировать остальные
    if provider_data.is_active:
        db.query(AIProvider).filter(AIProvider.id != provider_id).update(
            {"is_active": False}
        )

    update_data = provider_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_provider, key, value)

    db.commit()
    db.refresh(db_provider)
    return db_provider


@router.delete("/providers/{provider_id}")
def delete_provider(
    provider_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Удалить AI-провайдер."""
    db_provider = db.query(AIProvider).filter(AIProvider.id == provider_id).first()
    if not db_provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    db.delete(db_provider)
    db.commit()
    return {"ok": True}


@router.post("/generate", response_model=AIGenerateResponse)
async def generate_content(
    request: AIGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Сгенерировать контент через активный AI-провайдер."""
    provider = get_active_provider(db)

    try:
        ai_service = AIService(
            {
                "provider_type": provider.provider_type.value,
                "api_base_url": provider.api_base_url,
                "api_key": provider.api_key,
                "model_name": provider.model_name,
                "max_tokens": request.max_tokens or provider.max_tokens,
                "temperature": request.temperature or provider.temperature,
            }
        )

        content = await ai_service.generate(
            prompt=request.prompt, system_prompt=request.system_prompt
        )

        return AIGenerateResponse(
            content=content,
            model=provider.model_name,
            provider=provider.provider_type.value,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI generation failed: {str(e)}",
        )


# === Пресеты для генерации контента ===
# Все пресеты теперь принимают тело запроса (AIGenerateRequest) для консистентности


@router.post("/generate/meta-card/why", response_model=AIGenerateResponse)
async def generate_why(
    request: AIGenerateRequest,  # ← Тело запроса, не query params!
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Сгенерировать мета-карточку Why (Зачем этот проект)."""
    # Если промпт не передан — используем дефолтный
    prompt = (
        request.prompt
        or "Создай обоснование проекта. Опиши проблему, выгоды, актуальность."
    )
    system_prompt = (
        request.system_prompt
        or "Ты опытный продукт-менеджер. Помогай формулировать цели проектов ясно и убедительно."
    )

    provider = get_active_provider(db)
    ai_service = AIService(
        {
            "provider_type": provider.provider_type.value,
            "api_base_url": provider.api_base_url,
            "api_key": provider.api_key,
            "model_name": provider.model_name,
            "max_tokens": request.max_tokens or provider.max_tokens,
            "temperature": request.temperature or provider.temperature,
        }
    )

    content = await ai_service.generate(prompt, system_prompt)

    return AIGenerateResponse(
        content=content,
        model=provider.model_name,
        provider=provider.provider_type.value,
    )


@router.post("/generate/meta-card/requirements", response_model=AIGenerateResponse)
async def generate_requirements(
    request: AIGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Сгенерировать мета-карточку Requirements (Требования)."""
    prompt = (
        request.prompt
        or "Создай требования к проекту. Опиши функциональные и нефункциональные требования, критерии успеха."
    )
    system_prompt = (
        request.system_prompt
        or "Ты старший системный аналитик. Составляй полные и точные требования."
    )

    provider = get_active_provider(db)
    ai_service = AIService(
        {
            "provider_type": provider.provider_type.value,
            "api_base_url": provider.api_base_url,
            "api_key": provider.api_key,
            "model_name": provider.model_name,
            "max_tokens": request.max_tokens or provider.max_tokens,
            "temperature": request.temperature or provider.temperature,
        }
    )

    content = await ai_service.generate(prompt, system_prompt)

    return AIGenerateResponse(
        content=content,
        model=provider.model_name,
        provider=provider.provider_type.value,
    )


@router.post(
    "/generate/meta-card/stakeholders", response_model=AIGenerateResponse
)  # ← НОВЫЙ эндпоинт!
async def generate_stakeholders(
    request: AIGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Сгенерировать мета-карточку Stakeholders (Заинтересованные лица)."""
    prompt = (
        request.prompt
        or "Опиши заинтересованные лица проекта. Кто влияет на проект и кто зависит от результата? Их роли, интересы и ожидания."
    )
    system_prompt = (
        request.system_prompt
        or "Ты опытный бизнес-аналитик. Выявляй всех стейкхолдеров и их потребности."
    )

    provider = get_active_provider(db)
    ai_service = AIService(
        {
            "provider_type": provider.provider_type.value,
            "api_base_url": provider.api_base_url,
            "api_key": provider.api_key,
            "model_name": provider.model_name,
            "max_tokens": request.max_tokens or provider.max_tokens,
            "temperature": request.temperature or provider.temperature,
        }
    )

    content = await ai_service.generate(prompt, system_prompt)

    return AIGenerateResponse(
        content=content,
        model=provider.model_name,
        provider=provider.provider_type.value,
    )


@router.post("/generate/card/description", response_model=AIGenerateResponse)
async def generate_card_description(
    request: AIGenerateRequest,  # ← Тело запроса, не query params!
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Сгенерировать описание для карточки задачи."""
    prompt = (
        request.prompt
        or "Создай подробное описание для задачи. Включи цель, шаги выполнения и критерии готовности."
    )
    system_prompt = (
        request.system_prompt
        or "Ты опытный тимлид. Помогай формулировать задачи чётко и выполнимо."
    )

    provider = get_active_provider(db)
    ai_service = AIService(
        {
            "provider_type": provider.provider_type.value,
            "api_base_url": provider.api_base_url,
            "api_key": provider.api_key,
            "model_name": provider.model_name,
            "max_tokens": request.max_tokens or provider.max_tokens,
            "temperature": request.temperature or provider.temperature,
        }
    )

    content = await ai_service.generate(prompt, system_prompt)

    return AIGenerateResponse(
        content=content,
        model=provider.model_name,
        provider=provider.provider_type.value,
    )
