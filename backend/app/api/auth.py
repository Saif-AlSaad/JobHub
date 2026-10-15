import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, UserRole, JobSeekerProfile, RecruiterProfile, Company, NotificationPreference
from app.schemas.schemas import UserRegister, UserLogin, Token
from app.auth.security import hash_password, verify_password, create_access_token
from app.auth.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if email exists
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )
    
    role = user_in.role.upper()
    if role not in [UserRole.JOB_SEEKER, UserRole.RECRUITER, UserRole.ADMIN]:
        role = UserRole.JOB_SEEKER

    # Create user
    user = User(
        email=user_in.email.lower(),
        password_hash=hash_password(user_in.password),
        role=role,
        is_verified=True,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize notification preferences
    pref = NotificationPreference(
        user_id=user.id,
        email_alerts=True,
        in_app_alerts=True,
        min_match_score=70.0,
        alert_radius_km=10.0
    )
    db.add(pref)

    # Create respective profile
    if role == UserRole.JOB_SEEKER:
        seeker = JobSeekerProfile(
            user_id=user.id,
            full_name=user_in.full_name,
            headline="Aspiring Software Engineer",
            preferred_job_types=json.dumps(["Internship", "Full-time"]),
            preferred_roles=json.dumps(["Software Engineer", "Backend Developer"]),
            preferred_skills=json.dumps(["Python", "FastAPI", "React"]),
            preferred_location_name="Dhaka, Bangladesh",
            preferred_latitude=23.8103,
            preferred_longitude=90.4125,
            alert_radius_km=10.0,
            min_match_score=70.0,
            education=json.dumps([{
                "degree": "BSc in Software Engineering",
                "university": "Daffodil International University",
                "graduation_year": 2026,
                "cgpa": 3.75
            }]),
            skills=json.dumps(["Python", "FastAPI", "PostgreSQL", "React", "Git"]),
            profile_completed=True
        )
        db.add(seeker)
    elif role == UserRole.RECRUITER:
        company_name = user_in.company_name or "Tech Ventures BD"
        company = db.query(Company).filter(Company.name == company_name).first()
        if not company:
            company = Company(
                name=company_name,
                industry="Software & IT Solutions",
                location_name="Banani, Dhaka",
                latitude=23.7937,
                longitude=90.4043,
                description="Fast-growing technology engineering firm.",
                is_verified=True
            )
            db.add(company)
            db.commit()
            db.refresh(company)

        recruiter = RecruiterProfile(
            user_id=user.id,
            company_id=company.id,
            full_name=user_in.full_name,
            designation="Talent Lead",
            is_approved=True
        )
        db.add(recruiter)

    db.commit()

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "full_name": user_in.full_name
        }
    }

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email.lower()).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support.",
        )

    full_name = "User"
    if user.role == UserRole.JOB_SEEKER and user.seeker_profile:
        full_name = user.seeker_profile.full_name
    elif user.role == UserRole.RECRUITER and user.recruiter_profile:
        full_name = user.recruiter_profile.full_name

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "full_name": full_name
        }
    }

@router.get("/me")
def get_current_user_profile(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile_data = None
    if user.role == UserRole.JOB_SEEKER:
        p = user.seeker_profile
        if p:
            profile_data = {
                "id": p.id,
                "full_name": p.full_name,
                "headline": p.headline,
                "phone": p.phone,
                "skills": json.loads(p.skills or "[]"),
                "education": json.loads(p.education or "[]"),
                "experience": json.loads(p.experience or "[]"),
                "projects": json.loads(p.projects or "[]"),
                "certifications": json.loads(p.certifications or "[]"),
                "preferred_job_types": json.loads(p.preferred_job_types or "[]"),
                "preferred_roles": json.loads(p.preferred_roles or "[]"),
                "preferred_location_name": p.preferred_location_name,
                "preferred_latitude": p.preferred_latitude,
                "preferred_longitude": p.preferred_longitude,
                "alert_radius_km": p.alert_radius_km,
                "min_match_score": p.min_match_score,
                "resume_url": p.resume_url,
                "resume_filename": p.resume_filename,
                "profile_completed": p.profile_completed
            }
    elif user.role == UserRole.RECRUITER:
        p = user.recruiter_profile
        if p:
            profile_data = {
                "id": p.id,
                "full_name": p.full_name,
                "designation": p.designation,
                "phone": p.phone,
                "is_approved": p.is_approved,
                "company": {
                    "id": p.company.id,
                    "name": p.company.name,
                    "industry": p.company.industry,
                    "location_name": p.company.location_name,
                    "logo_url": p.company.logo_url,
                    "website": p.company.website,
                } if p.company else None
            }

    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "is_verified": user.is_verified,
        "profile": profile_data
    }

@router.post("/demo-login/{role}")
def demo_login(role: str, db: Session = Depends(get_db)):
    """Convenient 1-click switch for evaluators and demonstration."""
    role_map = {
        "seeker": (UserRole.JOB_SEEKER, "sarah.rahman@jobhub.io"),
        "recruiter": (UserRole.RECRUITER, "recruiter@technova.io"),
        "admin": (UserRole.ADMIN, "admin@jobhub.io")
    }
    
    target = role_map.get(role.lower())
    if not target:
        raise HTTPException(status_code=400, detail="Invalid demo role. Choose: seeker, recruiter, or admin.")
        
    user = db.query(User).filter(User.email == target[1]).first()
    if not user:
        # Fallback to any user with that role
        user = db.query(User).filter(User.role == target[0]).first()
        
    if not user:
        raise HTTPException(status_code=404, detail="Demo account not found. Please ensure database is seeded.")

    full_name = "Sarah Rahman" if user.role == UserRole.JOB_SEEKER else ("Recruiter" if user.role == UserRole.RECRUITER else "Platform Admin")
    if user.seeker_profile:
        full_name = user.seeker_profile.full_name
    elif user.recruiter_profile:
        full_name = user.recruiter_profile.full_name

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "full_name": full_name
        }
    }
