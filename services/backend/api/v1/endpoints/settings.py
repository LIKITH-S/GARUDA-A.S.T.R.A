from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from services.backend.api import deps
from database.models.system import SystemSettings
from services.backend.schemas.system import SystemSettingsUpdate, SystemSettingsOut

router = APIRouter()

@router.get("/", response_model=SystemSettingsOut)
async def get_settings(db: AsyncSession = Depends(deps.get_db)):
    result = await db.execute(select(SystemSettings).limit(1))
    settings = result.scalar_one_or_none()
    
    if not settings:
        # Create default settings if none exist
        settings = SystemSettings()
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
        
    return settings

@router.post("/", response_model=SystemSettingsOut)
async def update_settings(
    settings_in: SystemSettingsUpdate,
    db: AsyncSession = Depends(deps.get_db)
    # Ideally require admin role here, but keeping it open for MVP frontend integration
):
    result = await db.execute(select(SystemSettings).limit(1))
    settings = result.scalar_one_or_none()
    
    if not settings:
        settings = SystemSettings()
        db.add(settings)
        
    if settings_in.processing_engine is not None:
        settings.processing_engine = settings_in.processing_engine
    if settings_in.detection_threshold is not None:
        settings.detection_threshold = settings_in.detection_threshold
    if settings_in.face_extraction_enabled is not None:
        settings.face_extraction_enabled = settings_in.face_extraction_enabled
    if settings_in.sound_alerts_enabled is not None:
        settings.sound_alerts_enabled = settings_in.sound_alerts_enabled
        
    await db.commit()
    await db.refresh(settings)
    
    return settings
