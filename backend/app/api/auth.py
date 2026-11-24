import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.models import User, UserRole, JobSeekerProfile, RecruiterProfile, Company, NotificationPreference, NotificationType
from app.schemas.schemas import UserRegister, UserLogin, Token, SupabaseSyncRequest
from app.auth.security import hash_password, verify_password, create_access_token
from app.auth.deps import get_current_user
from app.auth.supabase_auth import auto_provision_supabase_user
from app.services.notification_service import create_notification

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    email = (user_in.email or "").strip().lower()
    full_name = (user_in.full_name or "").strip()
    company_name = (user_in.company_name or "").strip()

    if not email or "@" not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid email address is required"
        )
    if not full_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name is required"
        )
    if not user_in.password or len(user_in.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long"
        )

    role = user_in.role.upper()
    if role not in [UserRole.JOB_SEEKER, UserRole.RECRUITER, UserRole.ADMIN]:
        role = UserRole.JOB_SEEKER

    if role == UserRole.RECRUITER and not company_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company / Organization name is required for recruiter registration"
        )

    # Check if email exists
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )

    # Create user
    user = User(
        email=email,
        password_hash=hash_password(user_in.password),
        role=role,
        is_verified=True,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize notification preferences safely
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == user.id).first()
    if not pref:
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
            headline="",
            preferred_job_types=json.dumps(["Internship", "Full-time"]),
            preferred_roles=json.dumps([]),
            preferred_skills=json.dumps([]),
            preferred_location_name="Dhaka, Bangladesh",
            preferred_latitude=23.8103,
            preferred_longitude=90.4125,
            alert_radius_km=10.0,
            min_match_score=70.0,
            education=json.dumps([]),
            experience=json.dumps([]),
            projects=json.dumps([]),
            certifications=json.dumps([]),
            skills=json.dumps([]),
            resume_url=None,
            resume_filename=None,
            resume_raw_text=None,
            profile_completed=False
        )
        db.add(seeker)
        db.commit()

        # Prompt new seeker to complete setup & upload resume
        create_notification(
            db=db,
            user_id=user.id,
            notification_type=NotificationType.PROFILE_REMINDER,
            title="Complete Your Profile & Upload Resume",
            message="Welcome to JobHub! Please upload your resume and complete your profile setup to unlock AI job matching.",
            link="/resume-upload"
        )
    elif role == UserRole.RECRUITER:
        company_name = (user_in.company_name or "").strip()
        company = None
        if company_name:
            company = db.query(Company).filter(Company.name == company_name).first()
            if not company:
                company = Company(
                    name=company_name,
                    industry="",
                    location_name="",
                    latitude=23.7937,
                    longitude=90.4043,
                    description="",
                    size="",
                    founded_year=None,
                    is_verified=False
                )
                db.add(company)
                db.commit()
                db.refresh(company)

        recruiter = RecruiterProfile(
            user_id=user.id,
            company_id=company.id if company else None,
            full_name=user_in.full_name,
            designation="",
            phone="",
            avatar_url="",
            skills=json.dumps([]),
            profile_completed=False,
            is_approved=True
        )
        db.add(recruiter)
        db.commit()

        # Prompt new recruiter to complete company profile
        create_notification(
            db=db,
            user_id=user.id,
            notification_type=NotificationType.PROFILE_REMINDER,
            title="Complete Your Recruiter & Company Profile",
            message="Welcome to JobHub! Please complete your corporate recruiter profile to activate candidate ranking and post job openings.",
            link="/profile"
        )

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "full_name": user_in.full_name,
            "profile_completed": False if role in [UserRole.JOB_SEEKER, UserRole.RECRUITER] else True
        }
    }

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email.lower()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    authenticated = False
    if user.password_hash and user.password_hash != "supabase_auth_managed":
        authenticated = verify_password(credentials.password, user.password_hash)

    # If local check fails or user is managed by Supabase Auth, attempt Supabase verification
    if not authenticated and settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
        try:
            import requests
            sb_url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/token?grant_type=password"
            sb_resp = requests.post(
                sb_url,
                json={"email": credentials.email.lower(), "password": credentials.password},
                headers={"apikey": settings.SUPABASE_ANON_KEY, "Content-Type": "application/json"},
                timeout=8
            )
            if sb_resp.status_code == 200:
                authenticated = True
                user.password_hash = hash_password(credentials.password)
                db.commit()
        except Exception:
            pass

    if not authenticated:
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
    profile_completed = True
    if user.role == UserRole.JOB_SEEKER and user.seeker_profile:
        full_name = user.seeker_profile.full_name
        profile_completed = bool(user.seeker_profile.profile_completed)
    elif user.role == UserRole.RECRUITER and user.recruiter_profile:
        full_name = user.recruiter_profile.full_name
        profile_completed = bool(user.recruiter_profile.profile_completed)

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "full_name": full_name,
            "profile_completed": profile_completed
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
                "avatar_url": p.avatar_url,
                "profile_completed": bool(p.profile_completed)
            }
    elif user.role == UserRole.RECRUITER:
        p = user.recruiter_profile
        if p:
            profile_data = {
                "id": p.id,
                "full_name": p.full_name,
                "designation": p.designation or "",
                "phone": p.phone or "",
                "avatar_url": p.avatar_url or "",
                "skills": json.loads(p.skills or "[]"),
                "profile_completed": bool(p.profile_completed),
                "is_approved": p.is_approved,
                "company": {
                    "id": p.company.id,
                    "name": p.company.name,
                    "industry": p.company.industry or "",
                    "location_name": p.company.location_name or "",
                    "logo_url": p.company.logo_url,
                    "website": p.company.website or "",
                    "description": p.company.description or "",
                    "size": p.company.size or "",
                    "founded_year": p.company.founded_year,
                    "is_verified": p.company.is_verified,
                } if p.company else None
            }

    is_complete = True
    if profile_data and "profile_completed" in profile_data:
        is_complete = bool(profile_data["profile_completed"])

    return {
        "id": user.id,
        "supabase_uid": user.supabase_uid,
        "email": user.email,
        "role": user.role,
        "is_verified": user.is_verified,
        "profile_completed": is_complete,
        "profile": profile_data
    }

@router.post("/supabase-sync")
def supabase_sync(sync_in: SupabaseSyncRequest, db: Session = Depends(get_db)):
    """
    Explicitly synchronizes a user record after Supabase signup or email verification.
    Guarantees user profile and role provisioning.
    """
    user_info = {
        "sub": sync_in.supabase_uid,
        "email": sync_in.email,
        "role": sync_in.role or "JOB_SEEKER",
        "full_name": sync_in.full_name or sync_in.email.split("@")[0],
        "company_name": sync_in.company_name or "",
        "email_confirmed": True,
    }
    user = auto_provision_supabase_user(db, user_info)
    return get_current_user_profile(user=user, db=db)

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

    profile_completed = True
    if user.role == UserRole.JOB_SEEKER and user.seeker_profile:
        profile_completed = bool(user.seeker_profile.profile_completed)
    elif user.role == UserRole.RECRUITER and user.recruiter_profile:
        profile_completed = bool(user.recruiter_profile.profile_completed)

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "full_name": full_name,
            "profile_completed": profile_completed
        }
    }
