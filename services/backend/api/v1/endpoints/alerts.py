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
from services.backend.schemas.alert import AlertRead, AlertStatusUpdate
from services.backend.services.dispatch_service import dispatch_service
from database.models.registry import MissingPerson
from database.models.operations import Assignment
from database.models.personnel import Officer
from services.backend.core.websocket_manager import manager

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
    from sqlalchemy import case, desc
    
    query = select(Alert).options(
        joinedload(Alert.detection_event),
        joinedload(Alert.missing_person),
        joinedload(Alert.assignments).joinedload(Assignment.officer).joinedload(Officer.user)
    )
    
    if current_user.role.name in ["officer", "patrol"]:
        # Only show Verified alerts to patrol officers on their mobile app
        query = query.where(Alert.status == "Verified").order_by(Alert.created_at.desc())
    else:
        # Sort criteria for admin/dispatcher dashboard:
        # 1. "Pending" / "pending" status first
        # 2. Missing Person Priority (Critical -> High -> Normal -> Low)
        # 3. Confidence score of matched cropface descending
        # 4. Creation date descending
        status_order = case(
            (Alert.status.in_(["Pending", "pending"]), 0),
            else_=1
        )
        priority_order = case(
            (MissingPerson.priority.in_(["Critical", "critical"]), 0),
            (MissingPerson.priority.in_(["High", "high"]), 1),
            (MissingPerson.priority.in_(["Normal", "normal"]), 2),
            (MissingPerson.priority.in_(["Low", "low"]), 3),
            else_=4
        )
        
        query = (
            query.outerjoin(DetectionEvent, Alert.detection_event_id == DetectionEvent.id)
            .outerjoin(MissingPerson, Alert.missing_person_id == MissingPerson.id)
            .order_by(
                status_order,
                priority_order,
                desc(DetectionEvent.confidence_score),
                desc(Alert.created_at)
            )
        )
        
    result = await db.execute(
        query.offset(skip).limit(limit)
    )
    return result.unique().scalars().all()

@router.patch("/{alert_id}/status", response_model=AlertRead)
async def update_alert_status(
    alert_id: str,
    status_update: AlertStatusUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Centralized endpoint to update alert status from any client.
    Handles dispatching if 'Verified' and auto-resolving Missing Person if 'FOUND'.
    """
    if current_user.role.name not in ["admin", "dispatcher", "officer", "patrol"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await db.execute(
        select(Alert)
        .options(
            joinedload(Alert.detection_event),
            joinedload(Alert.missing_person),
            joinedload(Alert.assignments).joinedload(Assignment.officer).joinedload(Officer.user)
        )
        .where(Alert.id == uuid.UUID(alert_id))
    )
    alert = result.unique().scalar_one_or_none()

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    new_status = status_update.status
    alert.status = new_status
    
    # Common timestamps based on status type
    if new_status in ["Verified", "EN-ROUTE", "INVESTIGATING"]:
        alert.acknowledged_at = datetime.utcnow()
    elif new_status in ["Rejected False Positive", "FALSE ALARM", "TARGET LOST", "FOUND", "Completed"]:
        alert.resolved_at = datetime.utcnow()

    # Specialized logic for specific status transitions
    if new_status == "Verified":
        # Dispatch nearest patrol
        await dispatch_service.assign_nearest_patrol(
            db=db, 
            alert=alert, 
            event_lat=12.9716, # Placeholder coordinates, could be fetched from detection_event
            event_lng=77.5946
        )
    elif new_status in ["EN-ROUTE", "INVESTIGATING", "TARGET LOST", "FALSE ALARM", "Rejected False Positive", "FOUND"]:
        # The officer is updating the assignment
        if current_user.role.name in ["officer", "patrol"]:
            # Find the officer record for this user
            officer_result = await db.execute(
                select(Officer).where(Officer.user_id == current_user.id)
            )
            officer = officer_result.scalars().first()
            if officer:
                # Determine assignment status mapping
                assignment_status = "Accepted"
                if new_status == "INVESTIGATING": assignment_status = "Investigating"
                elif new_status == "TARGET LOST": assignment_status = "Target Lost"
                elif new_status == "FOUND": assignment_status = "Found"
                elif new_status in ["FALSE ALARM", "Rejected False Positive"]: assignment_status = "False Alarm"

                # Check if this officer is already assigned
                existing_assignment = next((a for a in alert.assignments if a.officer_id == officer.id), None)
                if existing_assignment:
                    existing_assignment.status = assignment_status
                elif new_status in ["EN-ROUTE", "INVESTIGATING", "TARGET LOST", "FOUND", "FALSE ALARM", "Rejected False Positive"]:
                    # Check if ANY assignment already exists (since it's 1 officer max)
                    if len(alert.assignments) > 0:
                        from fastapi import HTTPException
                        raise HTTPException(status_code=400, detail="Alert is already assigned to another officer.")
                    
                    # Auto-create assignment with mapped status
                    new_assignment = Assignment(
                        officer_id=officer.id,
                        dispatch_unit_id=officer.dispatch_unit_id,
                        alert_id=alert.id,
                        status=assignment_status
                    )
                    db.add(new_assignment)
    elif new_status == "FOUND":
        # Auto-resolve missing person
        if getattr(alert, "missing_person", None):
            alert.missing_person.status = "Found"
            
    await db.commit()

    # Re-fetch with all relations eagerly loaded for serialization
    result = await db.execute(
        select(Alert)
        .options(
            joinedload(Alert.detection_event),
            joinedload(Alert.missing_person),
            joinedload(Alert.assignments).joinedload(Assignment.officer).joinedload(Officer.user)
        )
        .where(Alert.id == uuid.UUID(alert_id))
    )
    updated_alert = result.unique().scalar_one()

    # Broadcast to all connected clients
    try:
        await manager.broadcast_global_alert({
            "event": "alert_status_updated",
            "data": {
                "alert_id": str(updated_alert.id),
                "status": updated_alert.status
            }
        })
    except Exception as e:
        print(f"WS Broadcast error: {e}")

    return updated_alert

