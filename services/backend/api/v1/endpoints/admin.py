import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from sqlalchemy import func

from services.backend.api import deps
from services.backend.core.security import get_password_hash
from database.models.auth import User, Role
from services.backend.schemas.user import UserCreate, UserUpdate, UserOut

router = APIRouter()

def require_admin(current_user: User = Depends(deps.get_current_user)) -> User:
    if not current_user.role or current_user.role.name.lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough privileges"
        )
    return current_user

@router.get("/users", response_model=List[UserOut])
async def list_users(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(require_admin)
):
    result = await db.execute(
        select(User).options(joinedload(User.role))
    )
    users = result.scalars().all()
    
    # Map role_name for response
    output_users = []
    for u in users:
        u_dict = {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "created_at": u.created_at,
            "role_name": u.role.name if u.role else "unknown"
        }
        output_users.append(u_dict)
    return output_users

@router.post("/users", response_model=UserOut)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(require_admin)
):
    # Check if email exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Map frontend role names to DB role names
    role_mapping = {
        "admin": "admin",
        "dispatcher": "control room operator",
        "officer": "officer",
        "patrol": "patrol officer"
    }
    mapped_role = role_mapping.get(user_in.role_name.lower(), user_in.role_name.lower())
    
    # Get role
    role_result = await db.execute(select(Role).where(func.lower(Role.name) == mapped_role))
    role = role_result.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=400, detail=f"Role '{user_in.role_name}' does not exist (mapped to '{mapped_role}')")
        
    db_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role_id=role.id
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    return {
        "id": db_user.id,
        "email": db_user.email,
        "full_name": db_user.full_name,
        "created_at": db_user.created_at,
        "role_name": role.name
    }

@router.put("/users/{user_id}", response_model=UserOut)
async def update_user(
    user_id: uuid.UUID,
    user_in: UserUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(require_admin)
):
    result = await db.execute(
        select(User).options(joinedload(User.role)).where(User.id == user_id)
    )
    db_user = result.scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user_in.email is not None:
        db_user.email = user_in.email
    if user_in.full_name is not None:
        db_user.full_name = user_in.full_name
    if user_in.password is not None and user_in.password.strip():
        db_user.hashed_password = get_password_hash(user_in.password)
    
    role_name_out = db_user.role.name if db_user.role else "unknown"
    
    if user_in.role_name is not None:
        role_mapping = {
            "admin": "admin",
            "dispatcher": "control room operator",
            "officer": "officer",
            "patrol": "patrol officer"
        }
        mapped_role = role_mapping.get(user_in.role_name.lower(), user_in.role_name.lower())
        
        role_result = await db.execute(select(Role).where(func.lower(Role.name) == mapped_role))
        role = role_result.scalar_one_or_none()
        if not role:
            raise HTTPException(status_code=400, detail=f"Role '{user_in.role_name}' does not exist (mapped to '{mapped_role}')")
        db_user.role_id = role.id
        role_name_out = role.name
        
    await db.commit()
    await db.refresh(db_user)
    
    return {
        "id": db_user.id,
        "email": db_user.email,
        "full_name": db_user.full_name,
        "created_at": db_user.created_at,
        "role_name": role_name_out
    }
