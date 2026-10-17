import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import RecruiterProfile, Job, Application, Company, JobSeekerProfile
from app.auth.deps import get_current_recruiter
from app.schemas.schemas import RecruiterProfileUpdate

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

@router.get("/profile")
def get_recruiter_profile(
    recruiter: RecruiterProfile = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    company = recruiter.company
    return {
        "id": recruiter.id,
        "user_id": recruiter.user_id,
        "full_name": recruiter.full_name,
        "designation": recruiter.designation or "Lead Technical Talent Partner",
        "phone": recruiter.phone or "+880 1819-876543",
        "avatar_url": recruiter.avatar_url,
        "company": {
            "id": company.id if company else None,
            "name": company.name if company else "TechNova Labs",
            "industry": company.industry if company else "Software Engineering & Cloud AI",
            "location_name": company.location_name if company else "Banani Tech Corridor, Dhaka",
            "logo_url": company.logo_url if company else None,
            "website": company.website if company else "https://technova.io",
            "description": company.description if company else "Fast-growing AI and engineering solutions company.",
            "size": company.size if company else "50-200 employees",
            "founded_year": company.founded_year if company else 2018,
            "is_verified": company.is_verified if company else True,
        } if company else {
            "name": "TechNova Labs",
            "industry": "Software Engineering & Cloud AI",
            "location_name": "Banani Tech Corridor, Dhaka",
            "website": "https://technova.io",
            "description": "Fast-growing AI and engineering solutions company.",
            "size": "50-200 employees",
            "founded_year": 2018,
            "is_verified": True
        }
    }

@router.put("/profile")
def update_recruiter_profile(
    update_data: RecruiterProfileUpdate,
    recruiter: RecruiterProfile = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    if update_data.full_name is not None:
        recruiter.full_name = update_data.full_name
    if update_data.designation is not None:
        recruiter.designation = update_data.designation
    if update_data.phone is not None:
        recruiter.phone = update_data.phone
    if update_data.avatar_url is not None:
        recruiter.avatar_url = update_data.avatar_url

    company = recruiter.company
    if not company and update_data.company_name:
        company = Company(name=update_data.company_name)
        db.add(company)
        db.commit()
        db.refresh(company)
        recruiter.company_id = company.id

    if company:
        if update_data.company_name is not None:
            company.name = update_data.company_name
        if update_data.company_website is not None:
            company.website = update_data.company_website
        if update_data.company_industry is not None:
            company.industry = update_data.company_industry
        if update_data.company_location is not None:
            company.location_name = update_data.company_location
        if update_data.company_description is not None:
            company.description = update_data.company_description
        if update_data.company_size is not None:
            company.size = update_data.company_size

    db.commit()
    db.refresh(recruiter)
    return {"status": "success", "message": "Recruiter profile updated successfully"}
