from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from sqlalchemy import func

from services.backend.core.config import settings
from services.backend.core.security import create_access_token, verify_password
from services.backend.api import deps
from database.models.auth import User

router = APIRouter()

@router.post("/login")
async def login_access_token(
    db: AsyncSession = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    # Use joinedload to fetch the role at the same time
    result = await db.execute(
        select(User)
        .options(joinedload(User.role))
        .where(func.lower(User.email) == form_data.username.strip().lower())
    )
    user = result.scalar_one_or_none()
        
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # In this system, user.role is a relation to the Role model
    role_value = user.role.name if user.role else "unknown"
    
    return {
        "access_token": create_access_token(
            user.id, role_value, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "role": role_value,
        "user_id": str(user.id),
        "full_name": user.full_name
    }
