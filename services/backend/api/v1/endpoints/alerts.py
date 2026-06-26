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
from database.models.registry import MissingPerson

router = APIRouter()

@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Return aggregated statistics for the dashboard."""
    from sqlalchemy import func as sa_func

    # Alert counts
    alert_result = await db.execute(select(sa_func.count(Alert.id)))
    total_alerts = alert_result.scalar() or 0

    pending_result = await db.execute(
        select(sa_func.count(Alert.id)).where(Alert.status.in_(["pending", "Pending"]))
    )
    pending_alerts = pending_result.scalar() or 0

    verified_result = await db.execute(
        select(sa_func.count(Alert.id)).where(Alert.status == "Verified")
    )
    verified_alerts = verified_result.scalar() or 0

    rejected_result = await db.execute(
        select(sa_func.count(Alert.id)).where(Alert.status == "Rejected False Positive")
    )
    rejected_alerts = rejected_result.scalar() or 0

    # Missing persons counts
    persons_result = await db.execute(select(sa_func.count(MissingPerson.id)))
    total_persons = persons_result.scalar() or 0

    found_result = await db.execute(
        select(sa_func.count(MissingPerson.id)).where(MissingPerson.status == "Found")
    )
    found_persons = found_result.scalar() or 0

    # Detection events count
    events_result = await db.execute(select(sa_func.count(DetectionEvent.id)))
    total_events = events_result.scalar() or 0

    return {
        "total_alerts": total_alerts,
        "pending_alerts": pending_alerts,
        "verified_alerts": verified_alerts,
        "rejected_alerts": rejected_alerts,
        "total_missing_persons": total_persons,
        "found_persons": found_persons,
        "total_detection_events": total_events,
    }

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
    if current_user.role.name not in ["admin", "dispatcher", "officer"]:
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
    if current_user.role.name not in ["admin", "dispatcher", "officer"]:
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
