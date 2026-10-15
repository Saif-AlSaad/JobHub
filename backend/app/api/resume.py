import os
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import JobSeekerProfile
from app.auth.deps import get_current_seeker
from app.ai.resume_parser import extract_text_from_file, parse_resume_to_profile
from app.schemas.schemas import ResumeExtractionReview

router = APIRouter(prefix="/resume", tags=["AI Resume"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

@router.post("/parse-upload")
async def upload_and_parse_resume(
    file: UploadFile = File(...),
    seeker: JobSeekerProfile = Depends(get_current_seeker)
):
    """
    Accepts PDF or DOCX (up to 5MB), extracts raw text, transforms via AI/NLP
    into structured JSON, and returns extraction for user review.
    Does NOT overwrite profile immediately.
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
    
    # Store temporary raw text and file reference
    seeker.resume_raw_text = raw_text[:8000]
    seeker.resume_filename = filename
    seeker.resume_url = f"/uploads/seeker_{seeker.id}_{filename}"

    return {
        "status": "success",
        "message": "AI successfully extracted your profile from the resume.",
        "filename": filename,
        "extracted_profile": extracted_data
    }

@router.post("/confirm-profile")
def confirm_reviewed_profile(
    profile_data: ResumeExtractionReview,
    seeker: JobSeekerProfile = Depends(get_current_seeker),
    db: Session = Depends(get_db)
):
    """
    Saves the user-corrected and reviewed profile fields into database.
    """
    if profile_data.full_name:
        seeker.full_name = profile_data.full_name
    if profile_data.phone:
        seeker.phone = profile_data.phone
    if profile_data.headline:
        seeker.headline = profile_data.headline
    if profile_data.skills:
        seeker.skills = json.dumps(profile_data.skills)
    if profile_data.education:
        seeker.education = json.dumps(profile_data.education)
    if profile_data.experience:
        seeker.experience = json.dumps(profile_data.experience)
    if profile_data.projects:
        seeker.projects = json.dumps(profile_data.projects)
    if profile_data.certifications:
        seeker.certifications = json.dumps(profile_data.certifications)
    if profile_data.preferred_location_name:
        seeker.preferred_location_name = profile_data.preferred_location_name

    seeker.profile_completed = True
    db.commit()
    db.refresh(seeker)

    return {
        "status": "success",
        "message": "Career profile confirmed and updated successfully!",
        "profile_completed": True
    }
