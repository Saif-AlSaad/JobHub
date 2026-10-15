import json
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import (
    Application, Job, JobSeekerProfile, RecruiterProfile, NotificationType, Conversation, Message
)
from app.auth.deps import get_current_user, get_current_seeker, get_current_recruiter
from app.schemas.schemas import ApplicationCreate, ApplicationUpdateStatus
from app.services.matching_service import compute_hybrid_match
from app.services.notification_service import create_notification

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.post("/", response_model=dict)
def submit_application(
    app_in: ApplicationCreate,
    seeker: JobSeekerProfile = Depends(get_current_seeker),
    db: Session = Depends(get_db)
):
    """
    Submits application using seeker's current profile & resume.
    Calculates match score, updates status to APPLIED, and notifies both parties.
    """
    job = db.query(Job).filter(Job.id == app_in.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Check for existing application
    existing = db.query(Application).filter(
        Application.job_id == job.id,
        Application.seeker_id == seeker.id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted an application for this position."
        )

    # Compute match score for application record
    seeker_dict = {
        "skills": json.loads(seeker.skills or "[]"),
        "headline": seeker.headline,
        "education": json.loads(seeker.education or "[]"),
        "experience": json.loads(seeker.experience or "[]"),
        "projects": json.loads(seeker.projects or "[]"),
        "preferred_job_types": json.loads(seeker.preferred_job_types or '["Internship"]'),
        "preferred_latitude": seeker.preferred_latitude,
        "preferred_longitude": seeker.preferred_longitude,
        "alert_radius_km": seeker.alert_radius_km or 10.0,
    }
    job_dict = {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "requirements": job.requirements,
        "job_type": job.job_type,
        "location_name": job.location_name,
        "latitude": job.latitude,
        "longitude": job.longitude,
        "is_remote": job.is_remote,
        "required_skills": json.loads(job.required_skills or "[]"),
        "preferred_skills": json.loads(job.preferred_skills or "[]"),
    }
    match_info = compute_hybrid_match(seeker_dict, job_dict)

    application = Application(
        job_id=job.id,
        seeker_id=seeker.id,
        status="APPLIED",
        match_score=match_info["match_score"],
        match_breakdown=json.dumps(match_info),
        cover_note=app_in.cover_note,
        resume_used=seeker.resume_filename or "Career Profile Resume"
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    # Notify Job Seeker
    company_name = job.company.name if job.company else "the employer"
    create_notification(
        db=db,
        user_id=seeker.user_id,
        notification_type=NotificationType.APPLICATION_SUBMITTED,
        title="Application Submitted",
        message=f"Your application for {job.title} at {company_name} was successfully submitted.",
        link="/applications"
    )

    # Notify Recruiter
    if job.recruiter:
        create_notification(
            db=db,
            user_id=job.recruiter.user_id,
            notification_type=NotificationType.APPLICATION_SUBMITTED,
            title="New Candidate Application",
            message=f"{seeker.full_name} ({int(match_info['match_score'])}% match) applied for {job.title}.",
            link=f"/recruiter/jobs/{job.id}/candidates"
        )

    return {
        "status": "success",
        "message": "Application submitted successfully!",
        "application_id": application.id,
        "match_score": match_info["match_score"]
    }

@router.get("/my")
def get_my_applications(
    seeker: JobSeekerProfile = Depends(get_current_seeker),
    db: Session = Depends(get_db)
):
    """
    Returns seeker's applications with horizontal status progression.
    """
    apps = db.query(Application).filter(Application.seeker_id == seeker.id).order_by(Application.applied_at.desc()).all()
    results = []
    for a in apps:
        job = a.job
        results.append({
            "id": a.id,
            "job_id": a.job_id,
            "job_title": job.title if job else "Software Position",
            "company_name": job.company.name if (job and job.company) else "Tech Company",
            "company_logo": job.company.logo_url if (job and job.company) else None,
            "location_name": job.location_name if job else "Dhaka",
            "job_type": job.job_type if job else "Internship",
            "status": a.status,
            "match_score": a.match_score,
            "match_breakdown": json.loads(a.match_breakdown or "{}"),
            "notes": a.notes,
            "cover_note": a.cover_note,
            "applied_at": a.applied_at.isoformat() if a.applied_at else None,
            "updated_at": a.updated_at.isoformat() if a.updated_at else None
        })
    return results

@router.get("/job/{job_id}/candidates")
def get_job_candidates(
    job_id: int,
    recruiter: RecruiterProfile = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    """
    Recruiter candidate match ranking:
    Returns all applicants for a specific job ranked by match score,
    showing matched skills, missing skills, and status controls.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    applications = db.query(Application).filter(Application.job_id == job_id).all()
    
    candidates = []
    for app in applications:
        seeker = app.seeker
        breakdown = json.loads(app.match_breakdown or "{}")
        
        candidates.append({
            "application_id": app.id,
            "seeker_id": seeker.id,
            "user_id": seeker.user_id,
            "full_name": seeker.full_name,
            "headline": seeker.headline,
            "education": json.loads(seeker.education or "[]"),
            "skills": json.loads(seeker.skills or "[]"),
            "experience": json.loads(seeker.experience or "[]"),
            "projects": json.loads(seeker.projects or "[]"),
            "resume_url": seeker.resume_url,
            "status": app.status,
            "match_score": app.match_score,
            "matched_skills": breakdown.get("matched_skills", []),
            "missing_skills": breakdown.get("missing_skills", []),
            "explanation": breakdown.get("explanation", []),
            "distance_km": breakdown.get("distance_km"),
            "applied_at": app.applied_at.isoformat() if app.applied_at else None,
            "notes": app.notes
        })

    # Sort candidates by match score descending
    candidates.sort(key=lambda x: x["match_score"], reverse=True)

    return {
        "job_id": job.id,
        "job_title": job.title,
        "total_applicants": len(candidates),
        "candidates": candidates
    }

@router.put("/{app_id}/status")
def update_application_status(
    app_id: int,
    update_in: ApplicationUpdateStatus,
    recruiter: RecruiterProfile = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    """
    Recruiter updates applicant status:
    Applied -> Viewed -> Shortlisted -> Interview -> Hired / Rejected.
    Sends automated candidate notification.
    """
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    new_status = update_in.status.upper()
    valid_statuses = ["APPLIED", "VIEWED", "SHORTLISTED", "INTERVIEW", "HIRED", "REJECTED"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status value")

    app.status = new_status
    if update_in.notes:
        app.notes = update_in.notes
    app.updated_at = datetime.datetime.utcnow()
    db.commit()

    # Trigger candidate notification based on new status
    seeker = app.seeker
    job = app.job
    company_name = job.company.name if (job and job.company) else "the employer"
    job_title = job.title if job else "your position"

    status_messages = {
        "VIEWED": ("Application Viewed", f"{company_name} has reviewed your application for {job_title}."),
        "SHORTLISTED": ("You've Been Shortlisted!", f"Great news! {company_name} has shortlisted your profile for {job_title}."),
        "INTERVIEW": ("Interview Invitation", f"{company_name} would like to invite you for an interview for {job_title}."),
        "HIRED": ("Offer Extended!", f"Congratulations! {company_name} has selected you for {job_title}!"),
        "REJECTED": ("Application Status Update", f"Thank you for applying to {job_title} at {company_name}. While other candidates were selected, your profile remains in their talent pool.")
    }

    if new_status in status_messages and seeker:
        title, msg = status_messages[new_status]
        create_notification(
            db=db,
            user_id=seeker.user_id,
            notification_type=new_status,
            title=title,
            message=msg,
            link="/applications"
        )

    return {
        "status": "success",
        "message": f"Candidate status updated to {new_status}",
        "new_status": new_status
    }
