import json
import logging
from typing import Optional, Dict, Any
import jwt
import httpx
from sqlalchemy.orm import Session
from app.config import settings
from app.models.models import (
    User,
    UserRole,
    JobSeekerProfile,
    RecruiterProfile,
    Company,
    NotificationPreference,
    NotificationType,
)
from app.services.notification_service import create_notification

logger = logging.getLogger(__name__)

def verify_and_extract_supabase_user(token: str) -> Optional[Dict[str, Any]]:
    """
    Validates a Supabase JWT and extracts user identifier, email, role, and metadata.
    Supports Supabase secret verification, direct Supabase auth endpoint lookup,
    and development payload decoding.
    """
    if not token or len(token) < 20:
        return None

    # Strategy 1: Verify using Supabase JWT Secret if provided
    if settings.SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256", "RS256"],
                options={"verify_aud": False}
            )
            sub = payload.get("sub") or payload.get("id")
            email = payload.get("email")
            if sub and email:
                metadata = payload.get("user_metadata", {})
                return {
                    "sub": str(sub),
                    "email": email.lower(),
                    "role": metadata.get("role", UserRole.JOB_SEEKER).upper(),
                    "full_name": metadata.get("full_name") or email.split("@")[0],
                    "company_name": metadata.get("company_name", ""),
                    "email_confirmed": bool(payload.get("email_confirmed_at", True)),
                }
        except Exception as e:
            logger.debug(f"Supabase secret verification skipped: {e}")

    # Strategy 2: Validate via Supabase Auth REST API if Supabase URL is configured
    if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
        try:
            url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user"
            headers = {
                "Authorization": f"Bearer {token}",
                "apikey": settings.SUPABASE_ANON_KEY,
            }
            with httpx.Client(timeout=4.0) as client:
                res = client.get(url, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    sub = data.get("id")
                    email = data.get("email")
                    metadata = data.get("user_metadata", {})
                    return {
                        "sub": str(sub),
                        "email": email.lower() if email else "",
                        "role": metadata.get("role", UserRole.JOB_SEEKER).upper(),
                        "full_name": metadata.get("full_name") or (email.split("@")[0] if email else "User"),
                        "company_name": metadata.get("company_name", ""),
                        "email_confirmed": bool(data.get("email_confirmed_at")),
                    }
        except Exception as e:
            logger.debug(f"Supabase REST validation notice: {e}")

    # Strategy 3: Inspect unverified JWT claims for Supabase signatures (development / fallback)
    try:
        unverified = jwt.decode(token, options={"verify_signature": False})
        sub = unverified.get("sub") or unverified.get("id")
        email = unverified.get("email")
        aud = unverified.get("aud")
        iss = unverified.get("iss", "")
        # Check if claims resemble Supabase Auth payload
        if sub and (email or aud == "authenticated" or "supabase" in iss):
            metadata = unverified.get("user_metadata", {})
            return {
                "sub": str(sub),
                "email": (email or f"user_{sub[:8]}@jobhub.local").lower(),
                "role": metadata.get("role", UserRole.JOB_SEEKER).upper(),
                "full_name": metadata.get("full_name") or (email.split("@")[0] if email else "Job Seeker"),
                "company_name": metadata.get("company_name", ""),
                "email_confirmed": bool(unverified.get("email_confirmed_at", True)),
            }
    except Exception as e:
        logger.debug(f"Unverified token parse failed: {e}")

    return None

def auto_provision_supabase_user(db: Session, user_info: Dict[str, Any]) -> User:
    """
    Provisions a corresponding User record and its dedicated Job Seeker or Recruiter profile
    in the database upon initial Supabase sign in / email verification.
    """
    email = user_info["email"].lower()
    supabase_uid = user_info["sub"]
    role_str = user_info.get("role", UserRole.JOB_SEEKER).upper()
    role = UserRole.RECRUITER if role_str == UserRole.RECRUITER else UserRole.JOB_SEEKER
    full_name = user_info.get("full_name") or email.split("@")[0]
    company_name = user_info.get("company_name") or "TechNova Labs BD"

    # Check if a user with this email or supabase_uid already exists
    user = db.query(User).filter(
        (User.supabase_uid == supabase_uid) | (User.email == email)
    ).first()

    if user:
        if not user.supabase_uid:
            user.supabase_uid = supabase_uid
        user.is_verified = True
        db.commit()
        db.refresh(user)
        return user

    # Create new User
    user = User(
        email=email,
        supabase_uid=supabase_uid,
        password_hash=user_info.get("password_hash") or "supabase_auth_managed",
        role=role,
        is_verified=True,
        is_active=True,
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
        alert_radius_km=10.0,
    )
    db.add(pref)

    # Initialize role-specific profile
    if role == UserRole.JOB_SEEKER:
        seeker = JobSeekerProfile(
            user_id=user.id,
            full_name=full_name,
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
            profile_completed=False,
        )
        db.add(seeker)
        db.commit()

        # Prompt new seeker to upload resume
        create_notification(
            db=db,
            user_id=user.id,
            notification_type=NotificationType.PROFILE_REMINDER,
            title="Complete Your Profile & Upload Resume",
            message="Welcome to JobHub! Please upload your resume and complete your profile to unlock AI matching.",
            link="/resume-upload",
        )

    elif role == UserRole.RECRUITER:
        company = db.query(Company).filter(Company.name == company_name).first()
        if not company:
            company = Company(
                name=company_name,
                industry="Software & IT Solutions",
                location_name="Banani, Dhaka",
                latitude=23.7937,
                longitude=90.4043,
                description="Fast-growing technology firm.",
                is_verified=True,
            )
            db.add(company)
            db.commit()
            db.refresh(company)

        recruiter = RecruiterProfile(
            user_id=user.id,
            company_id=company.id,
            full_name=full_name,
            designation="Talent Acquisition Lead",
            is_approved=True,
        )
        db.add(recruiter)
        db.commit()

        create_notification(
            db=db,
            user_id=user.id,
            notification_type=NotificationType.SYSTEM,
            title="Recruiter Portal Activated",
            message=f"Welcome to JobHub Employer Portal! You can now post vacancies and review AI-matched candidates for {company.name}.",
            link="/",
        )

    db.commit()
    db.refresh(user)
    return user
