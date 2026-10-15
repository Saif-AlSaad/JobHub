import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import User, UserRole, JobSeekerProfile, RecruiterProfile, Company, Job, Application, MatchRecord
from app.auth.deps import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/stats")
def get_admin_stats(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    seekers = db.query(User).filter(User.role == UserRole.JOB_SEEKER).count()
    recruiters = db.query(User).filter(User.role == UserRole.RECRUITER).count()
    active_jobs = db.query(Job).filter(Job.status == "ACTIVE").count()
    total_applications = db.query(Application).count()
    successful_matches = db.query(Application).filter(Application.status.in_(["SHORTLISTED", "INTERVIEW", "HIRED"])).count()

    return {
        "total_users": total_users,
        "job_seekers": seekers,
        "recruiters": recruiters,
        "active_jobs": active_jobs,
        "total_applications": total_applications,
        "successful_matches": successful_matches
    }

@router.get("/charts")
def get_admin_charts(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    jobs = db.query(Job).all()
    applications = db.query(Application).all()

    # 1. Jobs by Location
    location_counts = {}
    for j in jobs:
        loc = j.location_name.split(",")[0].strip() if j.location_name else "Dhaka"
        location_counts[loc] = location_counts.get(loc, 0) + 1

    # 2. Most Demanded Skills
    skill_counts = {}
    for j in jobs:
        skills = json.loads(j.required_skills or "[]")
        for s in skills:
            skill_counts[s] = skill_counts.get(s, 0) + 1
    top_skills = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:8]

    # 3. Match Distribution
    dist = {
        "90-100%": 0,
        "80-89%": 0,
        "70-79%": 0,
        "Under 70%": 0
    }
    for a in applications:
        if a.match_score >= 90: dist["90-100%"] += 1
        elif a.match_score >= 80: dist["80-89%"] += 1
        elif a.match_score >= 70: dist["70-79%"] += 1
        else: dist["Under 70%"] += 1

    return {
        "jobs_by_location": [{"location": k, "count": v} for k, v in location_counts.items()],
        "top_demanded_skills": [{"skill": k, "count": v} for k, v in top_skills],
        "match_distribution": [{"range": k, "count": v} for k, v in dist.items()],
        "application_funnel": [
            {"status": "Applied", "count": len(applications)},
            {"status": "Viewed", "count": len([a for a in applications if a.status in ["VIEWED", "SHORTLISTED", "INTERVIEW", "HIRED"]])},
            {"status": "Shortlisted", "count": len([a for a in applications if a.status in ["SHORTLISTED", "INTERVIEW", "HIRED"]])},
            {"status": "Interview", "count": len([a for a in applications if a.status in ["INTERVIEW", "HIRED"]])},
            {"status": "Hired", "count": len([a for a in applications if a.status == "HIRED"])}
        ]
    }

@router.get("/users")
def list_users(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    results = []
    for u in users:
        name = "User"
        if u.role == UserRole.JOB_SEEKER and u.seeker_profile:
            name = u.seeker_profile.full_name
        elif u.role == UserRole.RECRUITER and u.recruiter_profile:
            name = u.recruiter_profile.full_name

        results.append({
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "name": name,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "created_at": u.created_at.isoformat()
        })
    return results

@router.put("/users/{user_id}/toggle-status")
def toggle_user_status(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_active = not user.is_active
    db.commit()
    return {"status": "success", "user_id": user_id, "is_active": user.is_active}

@router.get("/recruiters")
def list_recruiters(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    recruiters = db.query(RecruiterProfile).all()
    results = []
    for r in recruiters:
        results.append({
            "id": r.id,
            "user_id": r.user_id,
            "full_name": r.full_name,
            "designation": r.designation,
            "phone": r.phone,
            "is_approved": r.is_approved,
            "company_name": r.company.name if r.company else "Independent Recruiter",
            "created_at": r.created_at.isoformat()
        })
    return results

@router.put("/recruiters/{recruiter_id}/toggle-approval")
def toggle_recruiter_approval(
    recruiter_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    recruiter = db.query(RecruiterProfile).filter(RecruiterProfile.id == recruiter_id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
        
    recruiter.is_approved = not recruiter.is_approved
    db.commit()
    return {"status": "success", "recruiter_id": recruiter_id, "is_approved": recruiter.is_approved}

@router.delete("/jobs/{job_id}")
def delete_job(
    job_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    db.delete(job)
    db.commit()
    return {"status": "success", "message": f"Job {job_id} successfully deleted by admin."}
