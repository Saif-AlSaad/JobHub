import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.models import Job, Company, RecruiterProfile, JobSeekerProfile, Application, User, UserRole
from app.auth.deps import get_current_user, get_optional_current_user, get_current_recruiter
from app.schemas.schemas import JobCreate, JobUpdate, JobResponse
from app.ai.job_parser import extract_job_requirements
from app.services.matching_service import compute_hybrid_match
from app.services.notification_service import evaluate_and_notify_seekers_for_new_job
from app.services.location_service import get_coordinates_for_location

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("/ai-extract-requirements")
def ai_extract_requirements(payload: dict):
    """
    Assists recruiters when writing a job post.
    Analyzes title and description, extracts required skills, preferred skills,
    experience level, and responsibilities for review.
    """
    title = payload.get("title", "")
    description = payload.get("description", "")
    raw_reqs = payload.get("requirements", "")
    if not title:
        raise HTTPException(status_code=400, detail="Job title is required.")
        
    extracted = extract_job_requirements(title, description, raw_reqs)
    return extracted

@router.post("/", response_model=dict)
def create_job(
    job_in: JobCreate,
    background_tasks: BackgroundTasks,
    recruiter: RecruiterProfile = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    """
    Creates a new job post and queues background matching & notification pipeline.
    """
    coords = get_coordinates_for_location(job_in.location_name)
    lat = job_in.latitude or coords[0]
    lon = job_in.longitude or coords[1]

    company_id = recruiter.company_id
    if not company_id:
        # Default or fallback company
        comp = db.query(Company).first()
        company_id = comp.id if comp else 1

    job = Job(
        recruiter_id=recruiter.id,
        company_id=company_id,
        title=job_in.title,
        description=job_in.description,
        requirements=job_in.requirements,
        responsibilities=job_in.responsibilities,
        job_type=job_in.job_type,
        location_name=job_in.location_name,
        latitude=lat,
        longitude=lon,
        is_remote=job_in.is_remote,
        salary_min=job_in.salary_min,
        salary_max=job_in.salary_max,
        salary_currency=job_in.salary_currency,
        required_skills=json.dumps(job_in.required_skills),
        preferred_skills=json.dumps(job_in.preferred_skills),
        experience_level=job_in.experience_level,
        education_level=job_in.education_level,
        deadline=job_in.deadline,
        status="ACTIVE"
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Core Differentiator: Evaluate eligible seekers and generate alerts
    # Executed via BackgroundTasks for snappy recruiter response
    background_tasks.add_task(evaluate_and_notify_seekers_for_new_job, db, job)

    return {
        "status": "success",
        "message": "Job published successfully! AI candidate matching and alerts have been scheduled.",
        "job_id": job.id
    }

@router.get("/")
def list_jobs(
    q: Optional[str] = Query(None, description="Search query for title, company, skills"),
    location: Optional[str] = Query(None),
    job_type: Optional[str] = Query(None),
    is_remote: Optional[bool] = Query(None),
    min_match: Optional[float] = Query(None),
    radius_km: Optional[float] = Query(None),
    sort_by: str = Query("best_match", description="best_match, recent, nearest, deadline"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Search and filter jobs with AI matching scores and location awareness.
    """
    query = db.query(Job).filter(Job.status == "ACTIVE")
    
    if location and location.lower() != "all":
        query = query.filter(Job.location_name.ilike(f"%{location}%"))
        
    if job_type and job_type.lower() != "all":
        query = query.filter(Job.job_type.ilike(f"%{job_type}%"))
        
    if is_remote is not None:
        query = query.filter(Job.is_remote == is_remote)

    all_jobs = query.all()

    # If current user is a job seeker, calculate real-time match info
    seeker_profile = None
    seeker_dict = None
    if current_user and current_user.role == UserRole.JOB_SEEKER:
        seeker_profile = db.query(JobSeekerProfile).filter(JobSeekerProfile.user_id == current_user.id).first()
        if seeker_profile:
            seeker_dict = {
                "skills": json.loads(seeker_profile.skills or "[]"),
                "headline": seeker_profile.headline,
                "education": json.loads(seeker_profile.education or "[]"),
                "experience": json.loads(seeker_profile.experience or "[]"),
                "projects": json.loads(seeker_profile.projects or "[]"),
                "preferred_job_types": json.loads(seeker_profile.preferred_job_types or '["Internship"]'),
                "preferred_latitude": seeker_profile.preferred_latitude,
                "preferred_longitude": seeker_profile.preferred_longitude,
                "alert_radius_km": radius_km or seeker_profile.alert_radius_km or 10.0,
            }

    results = []
    for job in all_jobs:
        company_data = {
            "id": job.company.id if job.company else None,
            "name": job.company.name if job.company else "Tech Company",
            "logo_url": job.company.logo_url if job.company else None,
            "industry": job.company.industry if job.company else "IT",
            "location_name": job.company.location_name if job.company else "Dhaka"
        }

        match_info = None
        match_score = 0.0
        distance_km = None
        is_nearby = False

        if seeker_dict:
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
            computed = compute_hybrid_match(seeker_dict, job_dict)
            match_score = computed["match_score"]
            distance_km = computed["distance_km"]
            is_nearby = computed["is_nearby"]
            match_info = computed
        else:
            match_score = 80.0

        # Filter by min_match if requested
        if min_match and match_score < min_match:
            continue

        # Filter by radius if requested and not remote
        if radius_km and distance_km and not job.is_remote and distance_km > radius_km:
            continue

        # Search term filter in title, description, or skills
        if q:
            q_lower = q.lower()
            skills_str = " ".join(json.loads(job.required_skills or "[]")).lower()
            title_match = q_lower in job.title.lower()
            comp_match = q_lower in (job.company.name.lower() if job.company else "")
            skills_match = q_lower in skills_str
            if not (title_match or comp_match or skills_match):
                continue

        results.append({
            "id": job.id,
            "title": job.title,
            "company": company_data,
            "job_type": job.job_type,
            "location_name": job.location_name,
            "latitude": job.latitude,
            "longitude": job.longitude,
            "is_remote": job.is_remote,
            "salary_min": job.salary_min,
            "salary_max": job.salary_max,
            "salary_currency": job.salary_currency,
            "required_skills": json.loads(job.required_skills or "[]"),
            "preferred_skills": json.loads(job.preferred_skills or "[]"),
            "experience_level": job.experience_level,
            "education_level": job.education_level,
            "deadline": job.deadline.isoformat() if job.deadline else None,
            "created_at": job.created_at.isoformat(),
            "match_score": match_score,
            "distance_km": distance_km,
            "is_nearby": is_nearby,
            "match_info": match_info
        })

    # Sort results
    if sort_by == "best_match":
        results.sort(key=lambda x: x["match_score"], reverse=True)
    elif sort_by == "nearest":
        results.sort(key=lambda x: (x["distance_km"] is None, x["distance_km"] or 9999))
    elif sort_by == "deadline":
        results.sort(key=lambda x: (x["deadline"] is None, x["deadline"] or "9999"))
    else:  # recent
        results.sort(key=lambda x: x["created_at"], reverse=True)

    return {
        "count": len(results),
        "jobs": results
    }

@router.get("/{job_id}")
def get_job_details(
    job_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns complete job details, including AI match explanation and skill comparison.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    company_data = {
        "id": job.company.id if job.company else None,
        "name": job.company.name if job.company else "Tech Company",
        "logo_url": job.company.logo_url if job.company else None,
        "website": job.company.website if job.company else None,
        "industry": job.company.industry if job.company else "IT",
        "description": job.company.description if job.company else "Premier technology company.",
        "location_name": job.company.location_name if job.company else "Dhaka",
        "size": job.company.size if job.company else "50-200 employees",
        "founded_year": job.company.founded_year if job.company else 2018
    }

    match_analysis = None
    applied_status = None

    if current_user and current_user.role == UserRole.JOB_SEEKER:
        seeker = db.query(JobSeekerProfile).filter(JobSeekerProfile.user_id == current_user.id).first()
        if seeker:
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
            match_analysis = compute_hybrid_match(seeker_dict, job_dict)

            # Check application status
            app = db.query(Application).filter(
                Application.job_id == job.id,
                Application.seeker_id == seeker.id
            ).first()
            if app:
                applied_status = {
                    "application_id": app.id,
                    "status": app.status,
                    "applied_at": app.applied_at.isoformat()
                }

    req_skills = json.loads(job.required_skills or "[]")
    pref_skills = json.loads(job.preferred_skills or "[]")

    return {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "requirements": job.requirements,
        "responsibilities": job.responsibilities,
        "job_type": job.job_type,
        "location_name": job.location_name,
        "latitude": job.latitude,
        "longitude": job.longitude,
        "is_remote": job.is_remote,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "salary_currency": job.salary_currency,
        "required_skills": req_skills,
        "preferred_skills": pref_skills,
        "experience_level": job.experience_level,
        "education_level": job.education_level,
        "deadline": job.deadline.isoformat() if job.deadline else None,
        "status": job.status,
        "created_at": job.created_at.isoformat(),
        "company": company_data,
        "match_analysis": match_analysis,
        "applied_status": applied_status
    }
