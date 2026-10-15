import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Notification, NotificationPreference, User
from app.auth.deps import get_current_user
from app.schemas.schemas import NotificationPreferenceUpdate

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/")
def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns user notification history for the notification center.
    """
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(50).all()

    results = []
    for n in notifications:
        results.append({
            "id": n.id,
            "user_id": n.user_id,
            "type": n.type,
            "title": n.title,
            "message": n.message,
            "link": n.link,
            "data_json": json.loads(n.data_json or "{}"),
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat()
        })
    return results

@router.get("/unread-count")
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Quick count for notification bell badge."""
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    return {"unread_count": count}

@router.put("/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif.is_read = True
    db.commit()
    return {"status": "success", "id": notif_id, "is_read": True}

@router.put("/mark-all-read")
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"status": "success", "message": "All notifications marked as read"}

@router.get("/preferences")
def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == current_user.id).first()
    if not pref:
        pref = NotificationPreference(user_id=current_user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return {
        "email_alerts": pref.email_alerts,
        "in_app_alerts": pref.in_app_alerts,
        "min_match_score": pref.min_match_score,
        "alert_radius_km": pref.alert_radius_km
    }

@router.put("/preferences")
def update_preferences(
    pref_in: NotificationPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == current_user.id).first()
    if not pref:
        pref = NotificationPreference(user_id=current_user.id)
        db.add(pref)

    if pref_in.email_alerts is not None:
        pref.email_alerts = pref_in.email_alerts
    if pref_in.in_app_alerts is not None:
        pref.in_app_alerts = pref_in.in_app_alerts
    if pref_in.min_match_score is not None:
        pref.min_match_score = pref_in.min_match_score
    if pref_in.alert_radius_km is not None:
        pref.alert_radius_km = pref_in.alert_radius_km

    db.commit()
    return {"status": "success", "message": "Notification preferences updated"}
