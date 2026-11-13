import os
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import JobSeekerProfile, NotificationType
from app.auth.deps import get_current_seeker
from app.ai.resume_parser import extract_text_from_file, parse_resume_to_profile
from app.schemas.schemas import ResumeExtractionReview
from app.services.location_service import get_coordinates_for_location
from app.services.notification_service import evaluate_matches_for_new_seeker, create_notification

router = APIRouter(prefix="/resume", tags=["AI Resume"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

@router.get("/status")
def get_resume_status(seeker: JobSeekerProfile = Depends(get_current_seeker)):
    """Quick check for onboarding wizard to inspect resume & completion state."""
    return {
        "has_resume": bool(seeker.resume_url or seeker.resume_filename),
        "resume_url": seeker.resume_url,
        "resume_filename": seeker.resume_filename,
        "profile_completed": bool(seeker.profile_completed)
    }

@router.post("/parse-upload")
async def upload_and_parse_resume(
    file: UploadFile = File(...),
    seeker: JobSeekerProfile = Depends(get_current_seeker),
    db: Session = Depends(get_db)
):
    """
    Accepts PDF, DOCX, or TXT (up to 5MB), extracts raw text, transforms via AI/NLP
    into structured JSON, and saves file reference to database.
    """
    filename = file.filename
    lower_name = filename.lower()
    if not (lower_name.endswith(".pdf") or lower_name.endswith(".docx") or lower_name.endswith(".txt")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported format. Only PDF, DOCX, or TXT files up to 5MB are permitted."
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum limit of 5 MB."
        )

    # Save physical file securely
    save_path = os.path.join(UPLOAD_DIR, f"seeker_{seeker.id}_{filename}")
    with open(save_path, "wb") as f:
        f.write(content)

    # Extract text
    raw_text = extract_text_from_file(content, filename)
    if not raw_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Unable to extract text from the uploaded document. Please check the file formatting."
        )

    # Parse into structured profile
    extracted_data = parse_resume_to_profile(raw_text)
    
    # Securely store raw text and file reference in database
    seeker.resume_raw_text = raw_text[:8000]
    seeker.resume_filename = filename
    seeker.resume_url = f"/uploads/seeker_{seeker.id}_{filename}"
    db.commit()
    db.refresh(seeker)

    return {
        "status": "success",
        "message": "AI successfully extracted your profile from the resume.",
        "filename": filename,
        "resume_url": seeker.resume_url,
        "extracted_profile": extracted_data
    }

@router.post("/confirm-profile")
def confirm_reviewed_profile(
    profile_data: ResumeExtractionReview,
    seeker: JobSeekerProfile = Depends(get_current_seeker),
    db: Session = Depends(get_db)
):
    """
    Saves user-confirmed profile details into the database.
    Enforces mandatory resume and profile details, marks profile_completed=True,
    and automatically computes AI job matches for new opportunities.
    """
    # 1. Mandatory Resume Verification
    if not seeker.resume_url and not seeker.resume_filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A resume file is mandatory. Please upload your resume before finalizing your profile."
        )

    # 2. Mandatory Core Details Verification
    if not profile_data.full_name or not profile_data.full_name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name is required to complete profile setup."
        )

    if not profile_data.skills and not profile_data.education:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide at least one technical skill or educational qualification."
        )

    # 3. Update Profile Data
    seeker.full_name = profile_data.full_name.strip()
    if profile_data.headline:
        seeker.headline = profile_data.headline.strip()
    if profile_data.phone:
        seeker.phone = profile_data.phone.strip()
    if profile_data.skills is not None:
        seeker.skills = json.dumps(profile_data.skills)
    if profile_data.education is not None:
        seeker.education = json.dumps(profile_data.education)
    if profile_data.experience is not None:
        seeker.experience = json.dumps(profile_data.experience)
    if profile_data.projects is not None:
        seeker.projects = json.dumps(profile_data.projects)
    if profile_data.certifications is not None:
        seeker.certifications = json.dumps(profile_data.certifications)
    if profile_data.preferred_location_name:
        seeker.preferred_location_name = profile_data.preferred_location_name.strip()
        coords = get_coordinates_for_location(seeker.preferred_location_name)
        seeker.preferred_latitude = coords[0]
        seeker.preferred_longitude = coords[1]
    if hasattr(profile_data, 'preferred_job_types') and profile_data.preferred_job_types:
        seeker.preferred_job_types = json.dumps(profile_data.preferred_job_types)
    if hasattr(profile_data, 'preferred_roles') and profile_data.preferred_roles:
        seeker.preferred_roles = json.dumps(profile_data.preferred_roles)

    # 4. Mark Profile as Complete
    seeker.profile_completed = True
    db.commit()
    db.refresh(seeker)

    # 5. Automatically compute matches across all active jobs
    new_matches_count = evaluate_matches_for_new_seeker(db, seeker)

    # 6. Create confirmation notification
    create_notification(
        db=db,
        user_id=seeker.user_id,
        notification_type=NotificationType.PROFILE_REMINDER,
        title="Profile Activated & Vectorized",
        message=f"Your profile and resume are verified! We matched you with {new_matches_count} open opportunities.",
        link="/"
    )

    return {
        "status": "success",
        "message": "Career profile confirmed, resume verified, and AI matching activated!",
        "profile_completed": True,
        "new_matches_count": new_matches_count
    }
