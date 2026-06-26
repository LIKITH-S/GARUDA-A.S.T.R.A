from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
import uuid
from typing import List
from datetime import datetime

from services.backend.api import deps
from database.models.auth import User
from database.models.ai_events import Alert, DetectionEvent
from services.backend.schemas.alert import AlertRead
from services.backend.services.dispatch_service import dispatch_service

router = APIRouter()

@router.get("/", response_model=List[AlertRead])
async def read_alerts(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> List[Alert]:
    """Retrieve all alerts with detection event and person details."""
    result = await db.execute(
        select(Alert)
        .options(
            joinedload(Alert.detection_event),
            joinedload(Alert.missing_person)
        )
        .order_by(Alert.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.post("/{alert_id}/verify", response_model=AlertRead)
async def verify_alert(
    alert_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Dispatcher verifies a match. 
    This will trigger the Nearest Patrol automated assignment.
    """
    if current_user.role.name not in ["admin", "dispatcher"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await db.execute(
        select(Alert)
        .options(
            joinedload(Alert.detection_event),
            joinedload(Alert.missing_person)
        )
        .where(Alert.id == uuid.UUID(alert_id))
    )
    alert = result.scalar_one_or_none()

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = "Verified"
    alert.acknowledged_at = datetime.utcnow()
    
    await dispatch_service.assign_nearest_patrol(
        db=db, 
        alert=alert, 
        event_lat=12.9716, 
        event_lng=77.5946
    )
    
    await db.commit()

    # Re-fetch with all relations eagerly loaded for serialization
    result = await db.execute(
        select(Alert)
        .options(
            joinedload(Alert.detection_event),
            joinedload(Alert.missing_person)
        )
        .where(Alert.id == uuid.UUID(alert_id))
    )
    return result.scalar_one()

@router.post("/{alert_id}/reject", response_model=AlertRead)
async def reject_alert(
    alert_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Dispatcher rejects a match as a false positive."""
    if current_user.role.name not in ["admin", "dispatcher"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await db.execute(
        select(Alert)
        .options(
            joinedload(Alert.detection_event),
            joinedload(Alert.missing_person)
        )
        .where(Alert.id == uuid.UUID(alert_id))
    )
    alert = result.scalar_one_or_none()

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = "Rejected False Positive"
    alert.resolved_at = datetime.utcnow()
    
    await db.commit()

    # Re-fetch with all relations eagerly loaded for serialization
    result = await db.execute(
        select(Alert)
        .options(
            joinedload(Alert.detection_event),
            joinedload(Alert.missing_person)
        )
        .where(Alert.id == uuid.UUID(alert_id))
    )
    return result.scalar_one()
