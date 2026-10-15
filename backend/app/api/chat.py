import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Conversation, Message, User, UserRole, JobSeekerProfile, RecruiterProfile, Job, NotificationType
from app.auth.deps import get_current_user
from app.schemas.schemas import MessageCreate
from app.services.notification_service import create_notification
from app.websocket.connection_manager import manager

router = APIRouter(prefix="/chat", tags=["Real-time Chat"])

@router.get("/conversations")
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns active conversations for current user with job title, company,
    and applicant context.
    """
    if current_user.role == UserRole.JOB_SEEKER:
        seeker = current_user.seeker_profile
        if not seeker:
            return []
        convs = db.query(Conversation).filter(Conversation.seeker_id == seeker.id).order_by(Conversation.updated_at.desc()).all()
    elif current_user.role == UserRole.RECRUITER:
        recruiter = current_user.recruiter_profile
        if not recruiter:
            return []
        convs = db.query(Conversation).filter(Conversation.recruiter_id == recruiter.id).order_by(Conversation.updated_at.desc()).all()
    else:
        convs = db.query(Conversation).order_by(Conversation.updated_at.desc()).all()

    results = []
    for c in convs:
        last_msg = db.query(Message).filter(Message.conversation_id == c.id).order_by(Message.created_at.desc()).first()
        unread = db.query(Message).filter(
            Message.conversation_id == c.id,
            Message.sender_id != current_user.id,
            Message.is_read == False
        ).count()

        results.append({
            "id": c.id,
            "job_id": c.job_id,
            "job_title": c.job.title if c.job else "General Inquiry",
            "company_name": c.job.company.name if (c.job and c.job.company) else (c.recruiter.company.name if (c.recruiter and c.recruiter.company) else "Employer"),
            "seeker_name": c.seeker.full_name if c.seeker else "Candidate",
            "recruiter_name": c.recruiter.full_name if c.recruiter else "Recruiter",
            "updated_at": c.updated_at.isoformat(),
            "unread_count": unread,
            "last_message": {
                "id": last_msg.id,
                "content": last_msg.content,
                "sender_id": last_msg.sender_id,
                "created_at": last_msg.created_at.isoformat()
            } if last_msg else None
        })
    return results

@router.post("/start")
def start_conversation(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Starts or finds an existing conversation for a job between recruiter and seeker.
    """
    job_id = payload.get("job_id")
    target_user_id = payload.get("target_user_id")

    if not job_id:
        raise HTTPException(status_code=400, detail="Job ID required to start conversation.")

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    if current_user.role == UserRole.JOB_SEEKER:
        seeker = current_user.seeker_profile
        recruiter = job.recruiter
    else:
        recruiter = current_user.recruiter_profile
        if target_user_id:
            seeker = db.query(JobSeekerProfile).filter(JobSeekerProfile.user_id == target_user_id).first()
        else:
            raise HTTPException(status_code=400, detail="Target seeker required.")

    if not seeker or not recruiter:
        raise HTTPException(status_code=400, detail="Invalid conversation participants.")

    # Check existing
    conv = db.query(Conversation).filter(
        Conversation.job_id == job.id,
        Conversation.seeker_id == seeker.id,
        Conversation.recruiter_id == recruiter.id
    ).first()

    if not conv:
        conv = Conversation(
            job_id=job.id,
            seeker_id=seeker.id,
            recruiter_id=recruiter.id
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    return {"conversation_id": conv.id}

@router.get("/conversations/{conv_id}/messages")
def get_messages(
    conv_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Mark incoming messages as read
    db.query(Message).filter(
        Message.conversation_id == conv_id,
        Message.sender_id != current_user.id,
        Message.is_read == False
    ).update({"is_read": True})
    db.commit()

    messages = db.query(Message).filter(Message.conversation_id == conv_id).order_by(Message.created_at.asc()).all()
    
    return [
        {
            "id": m.id,
            "conversation_id": m.conversation_id,
            "sender_id": m.sender_id,
            "is_me": m.sender_id == current_user.id,
            "content": m.content,
            "is_read": m.is_read,
            "created_at": m.created_at.isoformat()
        } for m in messages
    ]

@router.post("/conversations/{conv_id}/messages")
async def send_message(
    conv_id: int,
    msg_in: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    message = Message(
        conversation_id=conv_id,
        sender_id=current_user.id,
        content=msg_in.content,
        is_read=False
    )
    db.add(message)
    conv.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(message)

    # Determine recipient
    recipient_user_id = conv.recruiter.user_id if current_user.id == conv.seeker.user_id else conv.seeker.user_id
    
    # Broadcast via WebSocket if recipient is online
    await manager.send_personal_message({
        "type": "NEW_MESSAGE",
        "conversation_id": conv_id,
        "message": {
            "id": message.id,
            "sender_id": message.sender_id,
            "content": message.content,
            "created_at": message.created_at.isoformat()
        }
    }, user_id=recipient_user_id)

    # Send Notification
    sender_name = current_user.seeker_profile.full_name if current_user.seeker_profile else (current_user.recruiter_profile.full_name if current_user.recruiter_profile else "A user")
    job_title = conv.job.title if conv.job else "a job"
    create_notification(
        db=db,
        user_id=recipient_user_id,
        notification_type=NotificationType.MESSAGE,
        title="New Message",
        message=f"{sender_name} sent you a message regarding {job_title}.",
        link=f"/messages?conversation_id={conv_id}"
    )

    return {
        "id": message.id,
        "conversation_id": message.conversation_id,
        "sender_id": message.sender_id,
        "is_me": True,
        "content": message.content,
        "is_read": False,
        "created_at": message.created_at.isoformat()
    }
