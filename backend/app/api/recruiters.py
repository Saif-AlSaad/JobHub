import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import RecruiterProfile, Job, Application, Company, JobSeekerProfile
from app.auth.deps import get_current_recruiter

router = APIRouter(prefix="/recruiter", tags=["Recruiter"])

@router.get("/dashboard")
def get_recruiter_dashboard(
    recruiter: RecruiterProfile = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    """
    Recruiter dashboard statistics, active job postings, recent applications,
    and top ranked candidates.
    """
    company = recruiter.company
    company_name = company.name if company else "Your Company"

    # Get all jobs by this recruiter / company
    jobs = db.query(Job).filter(Job.recruiter_id == recruiter.id).order_by(Job.created_at.desc()).all()
    job_ids = [j.id for j in jobs]

    applications = db.query(Application).filter(Application.job_id.in_(job_ids)).all() if job_ids else []

    total_apps = len(applications)
    shortlisted_apps = [a for a in applications if a.status in ["SHORTLISTED", "INTERVIEW", "HIRED"]]
    
    avg_match = 0.0
    if applications:
        avg_match = round(sum(a.match_score for a in applications) / len(applications), 1)

    # Formatted job listings
    active_jobs_data = []
    for j in jobs:
        j_apps = [a for a in applications if a.job_id == j.id]
        active_jobs_data.append({
            "id": j.id,
            "title": j.title,
            "job_type": j.job_type,
            "location_name": j.location_name,
            "status": j.status,
            "applications_count": len(j_apps),
            "shortlisted_count": len([a for a in j_apps if a.status in ["SHORTLISTED", "INTERVIEW", "HIRED"]]),
            "created_at": j.created_at.isoformat(),
            "deadline": j.deadline.isoformat() if j.deadline else None
        })

    # Top Candidate Match Ranking across active jobs
    ranked_candidates = []
    for a in applications:
        seeker = a.seeker
        breakdown = json.loads(a.match_breakdown or "{}")
        ranked_candidates.append({
            "application_id": a.id,
            "seeker_name": seeker.full_name,
            "seeker_headline": seeker.headline,
            "job_title": a.job.title if a.job else "Software Engineer",
            "job_id": a.job_id,
            "match_score": a.match_score,
            "status": a.status,
            "skills": json.loads(seeker.skills or "[]"),
            "matched_skills": breakdown.get("matched_skills", []),
            "missing_skills": breakdown.get("missing_skills", []),
            "applied_at": a.applied_at.isoformat() if a.applied_at else None
        })
    ranked_candidates.sort(key=lambda x: x["match_score"], reverse=True)

    return {
        "company_name": company_name,
        "recruiter_name": recruiter.full_name,
        "stats": {
            "active_jobs": len([j for j in jobs if j.status == "ACTIVE"]),
            "total_applications": total_apps,
            "shortlisted": len(shortlisted_apps),
            "average_match": avg_match
        },
        "active_jobs": active_jobs_data,
        "top_candidates": ranked_candidates[:10]
    }
