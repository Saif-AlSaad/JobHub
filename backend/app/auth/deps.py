from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, UserRole, JobSeekerProfile, RecruiterProfile
from app.auth.security import decode_access_token
from app.auth.supabase_auth import verify_and_extract_supabase_user, auto_provision_supabase_user

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 1. Try resolving using JobHub local JWT
    payload = decode_access_token(token)
    if payload:
        user_id = payload.get("sub")
        if user_id:
            try:
                user = db.query(User).filter(User.id == int(user_id)).first()
                if user:
                    if not user.is_active:
                        raise HTTPException(
                            status_code=status.HTTP_403_FORBIDDEN,
                            detail="User account is suspended or inactive",
                        )
                    return user
            except (ValueError, TypeError):
                # Non-integer sub (e.g. Supabase UID string)
                pass

    # 2. Try resolving via Supabase Auth (JWT verification or REST lookup)
    supabase_info = verify_and_extract_supabase_user(token)
    if supabase_info:
        user = auto_provision_supabase_user(db, supabase_info)
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is suspended or inactive",
            )
        return user

    # 3. Failed validation
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )

def get_optional_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        if payload:
            user_id = payload.get("sub")
            if user_id:
                try:
                    user = db.query(User).filter(User.id == int(user_id)).first()
                    if user and user.is_active:
                        return user
                except (ValueError, TypeError):
                    pass
        
        supabase_info = verify_and_extract_supabase_user(token)
        if supabase_info:
            user = auto_provision_supabase_user(db, supabase_info)
            if user and user.is_active:
                return user
        return None
    except Exception:
        return None

def get_current_seeker(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> JobSeekerProfile:
    if current_user.role != UserRole.JOB_SEEKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to job seekers only",
        )
    profile = db.query(JobSeekerProfile).filter(JobSeekerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job seeker profile not found",
        )
    return profile

def get_current_recruiter(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> RecruiterProfile:
    if current_user.role != UserRole.RECRUITER and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to recruiters only",
        )
    profile = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recruiter profile not found",
        )
    return profile

def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required for this action",
        )
    return current_user
