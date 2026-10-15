import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None

class UserRegister(BaseModel):
    email: str
    password: str
    role: str  # JOB_SEEKER, RECRUITER, ADMIN
    full_name: str
    company_name: Optional[str] = None  # If recruiter

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    is_verified: bool
    created_at: datetime.datetime
    
    class Config:
        from_attributes = True

# Company Schemas
class CompanyBase(BaseModel):
    name: str
    website: Optional[str] = None
    industry: Optional[str] = "Information Technology"
    description: Optional[str] = None
    location_name: Optional[str] = "Dhaka, Bangladesh"
    latitude: Optional[float] = 23.8103
    longitude: Optional[float] = 90.4125
    size: Optional[str] = "50-200 employees"
    founded_year: Optional[int] = 2018
    logo_url: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyResponse(CompanyBase):
    id: int
    is_verified: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Profile Schemas
class JobSeekerProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    headline: Optional[str] = None
    phone: Optional[str] = None
    preferred_job_types: Optional[List[str]] = None
    preferred_roles: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    preferred_location_name: Optional[str] = None
    preferred_latitude: Optional[float] = None
    preferred_longitude: Optional[float] = None
    alert_radius_km: Optional[float] = None
    min_match_score: Optional[float] = None
    education: Optional[List[Dict[str, Any]]] = None
    experience: Optional[List[Dict[str, Any]]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[Dict[str, Any]]] = None
    skills: Optional[List[str]] = None
    profile_completed: Optional[bool] = None

class JobSeekerProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    headline: Optional[str]
    phone: Optional[str]
    preferred_job_types: List[str]
    preferred_roles: List[str]
    preferred_skills: List[str]
    preferred_location_name: str
    preferred_latitude: float
    preferred_longitude: float
    alert_radius_km: float
    min_match_score: float
    education: List[Dict[str, Any]]
    experience: List[Dict[str, Any]]
    projects: List[Dict[str, Any]]
    certifications: List[Dict[str, Any]]
    skills: List[str]
    resume_url: Optional[str]
    resume_filename: Optional[str]
    profile_completed: bool
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class RecruiterProfileResponse(BaseModel):
    id: int
    user_id: int
    company_id: Optional[int]
    full_name: str
    designation: str
    phone: Optional[str]
    is_approved: bool
    company: Optional[CompanyResponse] = None

    class Config:
        from_attributes = True

# Job Schemas
class JobBase(BaseModel):
    title: str
    description: str
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    job_type: str = "Internship"
    location_name: str = "Dhaka, Bangladesh"
    latitude: Optional[float] = 23.8103
    longitude: Optional[float] = 90.4125
    is_remote: bool = False
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: str = "BDT"
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    experience_level: str = "Entry-level / Fresh Graduate"
    education_level: str = "BSc in Computer Science or Software Engineering"
    deadline: Optional[datetime.datetime] = None

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    job_type: Optional[str] = None
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_remote: Optional[bool] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    experience_level: Optional[str] = None
    education_level: Optional[str] = None
    deadline: Optional[datetime.datetime] = None
    status: Optional[str] = None

class JobResponse(JobBase):
    id: int
    recruiter_id: int
    company_id: int
    status: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
    company: Optional[CompanyResponse] = None
    match_info: Optional[Dict[str, Any]] = None  # Attached dynamically for job seekers

    class Config:
        from_attributes = True

# Application Schemas
class ApplicationCreate(BaseModel):
    job_id: int
    cover_note: Optional[str] = None

class ApplicationUpdateStatus(BaseModel):
    status: str  # APPLIED, VIEWED, SHORTLISTED, INTERVIEW, HIRED, REJECTED
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    seeker_id: int
    status: str
    match_score: float
    match_breakdown: Dict[str, Any]
    notes: Optional[str]
    cover_note: Optional[str]
    resume_used: Optional[str]
    applied_at: datetime.datetime
    job: Optional[JobResponse] = None
    seeker: Optional[JobSeekerProfileResponse] = None

    class Config:
        from_attributes = True

# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    message: str
    link: Optional[str]
    data_json: Dict[str, Any]
    is_read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class NotificationPreferenceUpdate(BaseModel):
    email_alerts: Optional[bool] = None
    in_app_alerts: Optional[bool] = None
    min_match_score: Optional[float] = None
    alert_radius_km: Optional[float] = None

# Chat / Messaging Schemas
class MessageCreate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    content: str
    is_read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: int
    job_id: Optional[int]
    seeker_id: int
    recruiter_id: int
    updated_at: datetime.datetime
    created_at: datetime.datetime
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    seeker_name: Optional[str] = None
    recruiter_name: Optional[str] = None
    last_message: Optional[MessageResponse] = None
    unread_count: int = 0

# AI Extraction Schemas
class ResumeExtractionReview(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    headline: Optional[str] = None
    education: List[Dict[str, Any]] = []
    skills: List[str] = []
    experience: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    certifications: List[Dict[str, Any]] = []
    preferred_location_name: Optional[str] = "Dhaka, Bangladesh"

class JobExtractionReview(BaseModel):
    title: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    experience_level: str = "Entry-level / Fresh Graduate"
    education_level: str = "BSc in Computer Science or Software Engineering"
    job_type: str = "Internship"
    key_responsibilities: List[str] = []
    requirements_summary: str = ""
