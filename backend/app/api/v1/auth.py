from datetime import timedelta
from typing import Optional

from app.core.database import get_db
from app.core.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from app.models.user import User
from app.schemas.user import TokenResponse, UserCreate, UserResponse
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

router = APIRouter()


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Проверяет учётные данные пользователя."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Регистрация нового пользователя."""
    # Проверка существования пользователя
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Создание пользователя с хэшированием пароля
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email, hashed_password=hashed_password, is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """Вход пользователя и получение JWT токена."""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
    }


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Получить данные текущего пользователя."""
    return current_user


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Обновить JWT токен."""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(current_user.id), "email": current_user.email},
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": current_user.id,
        "email": current_user.email,
    }


@router.post("/debug-login", response_model=TokenResponse)
def debug_login(email: str, password: str, db: Session = Depends(get_db)):
    """Временный эндпоинт для отладки: принимает JSON."""
    user = authenticate_user(db, email, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
    }
