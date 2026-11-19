import json
import logging
from typing import Dict, Any, Optional, List, Union
from sqlalchemy.orm import Session
from app.models.models import (
    Notification, NotificationType, User, JobSeekerProfile, Job, MatchRecord, NotificationPreference
)
from app.services.matching_service import compute_hybrid_match

logger = logging.getLogger(__name__)

def create_notification(
    db: Session,
    user_id: int,
    notification_type: str,
    title: str,
    message: str,
    link: Optional[str] = None,
    data_json: Optional[Dict[str, Any]] = None
) -> Notification:
    """Inserts a notification record and logs delivery for email/push dispatch."""
    notif = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        message=message,
        link=link,
        data_json=json.dumps(data_json or {}),
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    
    # Check preferences for email dispatch simulation
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == user_id).first()
    if pref and pref.email_alerts:
        logger.info(f"[EMAIL DISPATCH] To User {user_id}: '{title}' - {message}")

    return notif

def evaluate_and_notify_seekers_for_new_job(
    target: Any,
    job_or_db: Optional[Any] = None
) -> int:
    """
    Core Differentiator:
    'Find the right opportunity before you even search for it.'
    Proactively checks all active job seekers against newly published job,
    computes hybrid score, stores match records, and generates alerts for matches above threshold.
    
    Accepts:
      - evaluate_and_notify_seekers_for_new_job(job_id: int) [Recommended for BackgroundTasks]
      - evaluate_and_notify_seekers_for_new_job(job: Job)
      - evaluate_and_notify_seekers_for_new_job(db: Session, job: Job) [Legacy backwards-compatible]
    """
    owns_db = False
    db: Optional[Session] = None
    job: Optional[Job] = None

    if isinstance(target, Session):
        db = target
        job = job_or_db
    else:
        from app.database import SessionLocal
        db = SessionLocal()
        owns_db = True
        if isinstance(target, int):
            job = db.query(Job).filter(Job.id == target).first()
        elif isinstance(target, Job):
            job = db.query(Job).filter(Job.id == target.id).first() or target
        elif isinstance(job_or_db, Session):
            db.close()
            db = job_or_db
            owns_db = False
            job = target

    if not db or not job:
        if owns_db and db:
            db.close()
        logger.warning("Could not evaluate job matching: job not found or invalid session.")
        return 0

    try:
        seekers = db.query(JobSeekerProfile).all()
        
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
        
        notifications_sent = 0

        for seeker in seekers:
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

            match_res = compute_hybrid_match(seeker_dict, job_dict)
            score = match_res["match_score"]
            
            # Save or update MatchRecord
            existing_match = db.query(MatchRecord).filter(
                MatchRecord.job_id == job.id,
                MatchRecord.seeker_id == seeker.id
            ).first()

            if not existing_match:
                record = MatchRecord(
                    job_id=job.id,
                    seeker_id=seeker.id,
                    match_score=score,
                    semantic_score=match_res["semantic_score"],
                    skill_score=match_res["skill_score"],
                    exp_score=match_res["exp_edu_score"],
                    loc_score=match_res["location_score"],
                    matched_skills=json.dumps(match_res["matched_skills"]),
                    missing_skills=json.dumps(match_res["missing_skills"]),
                    explanation=json.dumps(match_res["explanation"]),
                    distance_km=match_res["distance_km"],
                    is_nearby=match_res["is_nearby"],
                )
                db.add(record)
            else:
                existing_match.match_score = score
                existing_match.semantic_score = match_res["semantic_score"]
                existing_match.skill_score = match_res["skill_score"]
                existing_match.exp_score = match_res["exp_edu_score"]
                existing_match.loc_score = match_res["location_score"]
                existing_match.matched_skills = json.dumps(match_res["matched_skills"])
                existing_match.missing_skills = json.dumps(match_res["missing_skills"])
                existing_match.explanation = json.dumps(match_res["explanation"])
                existing_match.distance_km = match_res["distance_km"]
                existing_match.is_nearby = match_res["is_nearby"]
            
            # Determine whether to trigger smart notification
            min_threshold = seeker.min_match_score or 70.0
            if score >= min_threshold:
                company_name = job.company.name if job.company else "A top employer"
                notif_type = NotificationType.HIGH_MATCH if score >= 85.0 else NotificationType.JOB_MATCH
                dist_text = f" • {match_res['distance_km']} km away" if match_res["distance_km"] is not None else ""
                
                title = f"New {int(score)}% match found"
                message = f"{job.title} at {company_name} is a strong match for your profile{dist_text}."
                link = f"/jobs/{job.id}"
                
                create_notification(
                    db=db,
                    user_id=seeker.user_id,
                    notification_type=notif_type,
                    title=title,
                    message=message,
                    link=link,
                    data_json={
                        "job_id": job.id,
                        "match_score": score,
                        "distance_km": match_res["distance_km"],
                        "company_name": company_name,
                        "matched_skills": match_res["matched_skills"],
                        "missing_skills": match_res["missing_skills"]
                    }
                )
                notifications_sent += 1

        db.commit()
        return notifications_sent
    finally:
        if owns_db and db:
            db.close()

def evaluate_matches_for_new_seeker(
    target: Any,
    seeker_or_db: Optional[Any] = None
) -> int:
    """
    Evaluates newly completed seeker against all active listings,
    generates precalculated MatchRecords and notifies candidate of high-affinity roles.

    Accepts:
      - evaluate_matches_for_new_seeker(seeker_id: int)
      - evaluate_matches_for_new_seeker(seeker: JobSeekerProfile)
      - evaluate_matches_for_new_seeker(db: Session, seeker: JobSeekerProfile) [Legacy backwards-compatible]
    """
    owns_db = False
    db: Optional[Session] = None
    seeker: Optional[JobSeekerProfile] = None

    if isinstance(target, Session):
        db = target
        seeker = seeker_or_db
    else:
        from app.database import SessionLocal
        db = SessionLocal()
        owns_db = True
        if isinstance(target, int):
            seeker = db.query(JobSeekerProfile).filter(JobSeekerProfile.id == target).first()
        elif isinstance(target, JobSeekerProfile):
            seeker = db.query(JobSeekerProfile).filter(JobSeekerProfile.id == target.id).first() or target
        elif isinstance(seeker_or_db, Session):
            db.close()
            db = seeker_or_db
            owns_db = False
            seeker = target

    if not db or not seeker:
        if owns_db and db:
            db.close()
        logger.warning("Could not evaluate seeker matches: seeker not found or invalid session.")
        return 0

    try:
        active_jobs = db.query(Job).filter(Job.status == "ACTIVE").all()
        if not active_jobs:
            return 0

        seeker_dict = {
            "skills": json.loads(seeker.skills or "[]"),
            "headline": seeker.headline,
            "education": json.loads(seeker.education or "[]"),
            "experience": json.loads(seeker.experience or "[]"),
            "projects": json.loads(seeker.projects or "[]"),
            "preferred_job_types": json.loads(seeker.preferred_job_types or '["Internship", "Full-time"]'),
            "preferred_latitude": seeker.preferred_latitude,
            "preferred_longitude": seeker.preferred_longitude,
            "alert_radius_km": seeker.alert_radius_km or 10.0,
        }

        matches_found = 0

        for job in active_jobs:
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

            match_res = compute_hybrid_match(seeker_dict, job_dict)
            score = match_res["match_score"]

            existing_match = db.query(MatchRecord).filter(
                MatchRecord.job_id == job.id,
                MatchRecord.seeker_id == seeker.id
            ).first()

            if not existing_match:
                record = MatchRecord(
                    job_id=job.id,
                    seeker_id=seeker.id,
                    match_score=score,
                    semantic_score=match_res["semantic_score"],
                    skill_score=match_res["skill_score"],
                    exp_score=match_res["exp_edu_score"],
                    loc_score=match_res["location_score"],
                    matched_skills=json.dumps(match_res["matched_skills"]),
                    missing_skills=json.dumps(match_res["missing_skills"]),
                    explanation=json.dumps(match_res["explanation"]),
                    distance_km=match_res["distance_km"],
                    is_nearby=match_res["is_nearby"],
                )
                db.add(record)
            else:
                existing_match.match_score = score
                existing_match.semantic_score = match_res["semantic_score"]
                existing_match.skill_score = match_res["skill_score"]
                existing_match.exp_score = match_res["exp_edu_score"]
                existing_match.loc_score = match_res["location_score"]
                existing_match.matched_skills = json.dumps(match_res["matched_skills"])
                existing_match.missing_skills = json.dumps(match_res["missing_skills"])
                existing_match.explanation = json.dumps(match_res["explanation"])
                existing_match.distance_km = match_res["distance_km"]
                existing_match.is_nearby = match_res["is_nearby"]

            min_threshold = seeker.min_match_score or 70.0
            if score >= min_threshold:
                matches_found += 1
                company_name = job.company.name if job.company else "Top Tech Company"
                notif_type = NotificationType.HIGH_MATCH if score >= 85.0 else NotificationType.JOB_MATCH
                dist_text = f" • {match_res['distance_km']} km away" if match_res["distance_km"] is not None else ""
                
                title = f"New {int(score)}% match found"
                message = f"{job.title} at {company_name} matches your newly uploaded resume{dist_text}."
                link = f"/jobs/{job.id}"
                
                create_notification(
                    db=db,
                    user_id=seeker.user_id,
                    notification_type=notif_type,
                    title=title,
                    message=message,
                    link=link,
                    data_json={
                        "job_id": job.id,
                        "match_score": score,
                        "distance_km": match_res["distance_km"],
                        "company_name": company_name,
                        "matched_skills": match_res["matched_skills"],
                        "missing_skills": match_res["missing_skills"]
                    }
                )

        db.commit()
        return matches_found
    finally:
        if owns_db and db:
            db.close()
