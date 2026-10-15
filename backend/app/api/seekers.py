import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.models import JobSeekerProfile, Job, Application, MatchRecord, Notification, Company
from app.auth.deps import get_current_seeker
from app.schemas.schemas import JobSeekerProfileUpdate
from app.services.matching_service import compute_hybrid_match, get_skill_roadmap
from app.services.location_service import get_coordinates_for_location

router = APIRouter(prefix="/seekers", tags=["Job Seekers"])

@router.get("/profile")
def get_profile(seeker: JobSeekerProfile = Depends(get_current_seeker)):
    return {
        "id": seeker.id,
        "user_id": seeker.user_id,
        "full_name": seeker.full_name,
        "headline": seeker.headline,
        "phone": seeker.phone,
        "skills": json.loads(seeker.skills or "[]"),
        "education": json.loads(seeker.education or "[]"),
        "experience": json.loads(seeker.experience or "[]"),
        "projects": json.loads(seeker.projects or "[]"),
        "certifications": json.loads(seeker.certifications or "[]"),
        "preferred_job_types": json.loads(seeker.preferred_job_types or '["Internship"]'),
        "preferred_roles": json.loads(seeker.preferred_roles or '["Software Engineer"]'),
        "preferred_location_name": seeker.preferred_location_name,
        "preferred_latitude": seeker.preferred_latitude,
        "preferred_longitude": seeker.preferred_longitude,
        "alert_radius_km": seeker.alert_radius_km or 10.0,
        "min_match_score": seeker.min_match_score or 70.0,
        "resume_url": seeker.resume_url,
        "resume_filename": seeker.resume_filename,
        "profile_completed": seeker.profile_completed
    }

@router.put("/profile")
def update_profile(
    update_data: JobSeekerProfileUpdate,
    seeker: JobSeekerProfile = Depends(get_current_seeker),
    db: Session = Depends(get_db)
):
    if update_data.full_name is not None:
        seeker.full_name = update_data.full_name
    if update_data.headline is not None:
        seeker.headline = update_data.headline
    if update_data.phone is not None:
        seeker.phone = update_data.phone
    if update_data.preferred_job_types is not None:
        seeker.preferred_job_types = json.dumps(update_data.preferred_job_types)
    if update_data.preferred_roles is not None:
        seeker.preferred_roles = json.dumps(update_data.preferred_roles)
    if update_data.preferred_skills is not None:
        seeker.preferred_skills = json.dumps(update_data.preferred_skills)
    if update_data.preferred_location_name is not None:
        seeker.preferred_location_name = update_data.preferred_location_name
        coords = get_coordinates_for_location(update_data.preferred_location_name)
        seeker.preferred_latitude = coords[0]
        seeker.preferred_longitude = coords[1]
    if update_data.alert_radius_km is not None:
        seeker.alert_radius_km = update_data.alert_radius_km
    if update_data.min_match_score is not None:
        seeker.min_match_score = update_data.min_match_score
    if update_data.skills is not None:
        seeker.skills = json.dumps(update_data.skills)
    if update_data.education is not None:
        seeker.education = json.dumps(update_data.education)
    if update_data.experience is not None:
        seeker.experience = json.dumps(update_data.experience)
    if update_data.projects is not None:
        seeker.projects = json.dumps(update_data.projects)
    if update_data.certifications is not None:
        seeker.certifications = json.dumps(update_data.certifications)
        
    db.commit()
    db.refresh(seeker)
    return {"status": "success", "message": "Profile updated successfully"}

@router.get("/dashboard-summary")
def get_dashboard_summary(
    seeker: JobSeekerProfile = Depends(get_current_seeker),
    db: Session = Depends(get_db)
):
    """
    Returns full data for Job Seeker Dashboard:
    - Profile strength calculation
    - Key metrics (New Matches, Applications count, Shortlisted count)
    - Top Matches
    - Nearby Opportunities (within alert radius)
    - Active Applications
    - Skill Gap recommendations
    """
    # 1. Profile Strength Calculation
    skills_list = json.loads(seeker.skills or "[]")
    edu_list = json.loads(seeker.education or "[]")
    exp_list = json.loads(seeker.experience or "[]")
    proj_list = json.loads(seeker.projects or "[]")

    strength = 30
    if len(skills_list) >= 4: strength += 20
    if len(edu_list) >= 1: strength += 15
    if len(proj_list) >= 1: strength += 15
    if len(exp_list) >= 1: strength += 10
    if seeker.resume_url or seeker.resume_filename: strength += 10
    profile_strength = min(100, strength)

    # 2. Key Counts
    apps = db.query(Application).filter(Application.seeker_id == seeker.id).all()
    applications_count = len(apps)
    shortlisted_count = len([a for a in apps if a.status in ["SHORTLISTED", "INTERVIEW", "HIRED"]])

    # 3. Retrieve or compute matches for active jobs
    jobs = db.query(Job).filter(Job.status == "ACTIVE").all()
    seeker_dict = {
        "skills": skills_list,
        "headline": seeker.headline,
        "education": edu_list,
        "experience": exp_list,
        "projects": proj_list,
        "preferred_job_types": json.loads(seeker.preferred_job_types or '["Internship"]'),
        "preferred_latitude": seeker.preferred_latitude,
        "preferred_longitude": seeker.preferred_longitude,
        "alert_radius_km": seeker.alert_radius_km or 10.0,
    }

    scored_jobs = []
    missing_skills_pool = {}

    for job in jobs:
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
        
        # Accumulate missing skills
        for ms in match_info["missing_skills"]:
            missing_skills_pool[ms] = missing_skills_pool.get(ms, 0) + 1

        company_dict = {
            "name": job.company.name if job.company else "Tech Company",
            "logo_url": job.company.logo_url if job.company else None,
            "industry": job.company.industry if job.company else "IT",
            "location_name": job.company.location_name if job.company else "Dhaka"
        }

        # Check if user already applied
        applied_status = None
        for a in apps:
            if a.job_id == job.id:
                applied_status = a.status
                break

        scored_jobs.append({
            "id": job.id,
            "title": job.title,
            "company": company_dict,
            "location_name": job.location_name,
            "job_type": job.job_type,
            "salary_min": job.salary_min,
            "salary_max": job.salary_max,
            "salary_currency": job.salary_currency,
            "deadline": job.deadline.isoformat() if job.deadline else None,
            "is_remote": job.is_remote,
            "match_score": match_info["match_score"],
            "distance_km": match_info["distance_km"],
            "is_nearby": match_info["is_nearby"],
            "matched_skills": match_info["matched_skills"],
            "missing_skills": match_info["missing_skills"],
            "explanation": match_info["explanation"],
            "applied_status": applied_status
        })

    # Sort descending by match score
    scored_jobs.sort(key=lambda x: x["match_score"], reverse=True)

    new_matches_count = len([j for j in scored_jobs if j["match_score"] >= (seeker.min_match_score or 70.0)])
    
    # Top matches (high match)
    top_matches = scored_jobs[:6]

    # Nearby opportunities (within alert radius)
    nearby_opportunities = [j for j in scored_jobs if j["is_nearby"]][:6]

    # Top missing skills for roadmap
    sorted_missing = sorted(missing_skills_pool.items(), key=lambda x: x[1], reverse=True)
    top_missing_skills = [item[0] for item in sorted_missing[:4]]
    if not top_missing_skills:
        top_missing_skills = ["Docker", "AWS", "Redis", "Kubernetes"]
    skill_roadmap = get_skill_roadmap(top_missing_skills)

    # Active applications with job context
    recent_apps = []
    for a in apps:
        recent_apps.append({
            "id": a.id,
            "job_id": a.job_id,
            "job_title": a.job.title if a.job else "Software Engineer",
            "company_name": a.job.company.name if (a.job and a.job.company) else "Tech Company",
            "status": a.status,
            "match_score": a.match_score,
            "applied_at": a.applied_at.isoformat() if a.applied_at else None,
        })

    return {
        "candidate_name": seeker.full_name,
        "first_name": seeker.full_name.split()[0] if seeker.full_name else "Candidate",
        "profile_strength": profile_strength,
        "stats": {
            "profile_strength": profile_strength,
            "new_matches": new_matches_count,
            "applications": applications_count,
            "shortlisted": shortlisted_count
        },
        "top_matches": top_matches,
        "nearby_opportunities": nearby_opportunities,
        "nearby_count": len(nearby_opportunities),
        "alert_radius_km": seeker.alert_radius_km or 10.0,
        "preferred_location": seeker.preferred_location_name or "Dhaka",
        "recent_applications": recent_apps,
        "skill_gap_roadmap": skill_roadmap
    }
