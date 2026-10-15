import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, Float, Text, DateTime, ForeignKey, Enum, Table
)
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole(str):
    JOB_SEEKER = "JOB_SEEKER"
    RECRUITER = "RECRUITER"
    ADMIN = "ADMIN"

class ApplicationStatus(str):
    APPLIED = "APPLIED"
    VIEWED = "VIEWED"
    SHORTLISTED = "SHORTLISTED"
    INTERVIEW = "INTERVIEW"
    HIRED = "HIRED"
    REJECTED = "REJECTED"

class NotificationType(str):
    JOB_MATCH = "JOB_MATCH"
    HIGH_MATCH = "HIGH_MATCH"
    APPLICATION_SUBMITTED = "APPLICATION_SUBMITTED"
    APPLICATION_VIEWED = "APPLICATION_VIEWED"
    SHORTLISTED = "SHORTLISTED"
    REJECTED = "REJECTED"
    HIRED = "HIRED"
    MESSAGE = "MESSAGE"
    PROFILE_REMINDER = "PROFILE_REMINDER"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.JOB_SEEKER, nullable=False)
    is_verified = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    seeker_profile = relationship("JobSeekerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    recruiter_profile = relationship("RecruiterProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan", order_by="desc(Notification.created_at)")
    notification_pref = relationship("NotificationPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    logo_url = Column(String(500), nullable=True)
    website = Column(String(255), nullable=True)
    industry = Column(String(100), default="Information Technology")
    description = Column(Text, nullable=True)
    location_name = Column(String(255), default="Dhaka, Bangladesh")
    latitude = Column(Float, default=23.8103)
    longitude = Column(Float, default=90.4125)
    size = Column(String(50), default="50-200 employees")
    founded_year = Column(Integer, default=2018)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    recruiters = relationship("RecruiterProfile", back_populates="company")
    jobs = relationship("Job", back_populates="company", cascade="all, delete-orphan")

class RecruiterProfile(Base):
    __tablename__ = "recruiter_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    full_name = Column(String(255), nullable=False)
    designation = Column(String(150), default="Talent Acquisition Specialist")
    phone = Column(String(50), nullable=True)
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="recruiter_profile")
    company = relationship("Company", back_populates="recruiters")
    jobs = relationship("Job", back_populates="recruiter")
    conversations = relationship("Conversation", back_populates="recruiter")

class JobSeekerProfile(Base):
    __tablename__ = "job_seeker_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    headline = Column(String(255), default="Aspiring Software Engineer | Recent Graduate")
    phone = Column(String(50), nullable=True)
    
    # Career Preferences
    preferred_job_types = Column(Text, default='["Internship", "Full-time"]')  # JSON string
    preferred_roles = Column(Text, default='["Software Engineer", "Backend Developer"]')  # JSON string
    preferred_skills = Column(Text, default='["Python", "FastAPI", "React"]')  # JSON string
    
    # Location Configuration & Privacy-Aware Coordinates
    preferred_location_name = Column(String(255), default="Dhaka, Bangladesh")
    preferred_latitude = Column(Float, default=23.8103)
    preferred_longitude = Column(Float, default=90.4125)
    alert_radius_km = Column(Float, default=10.0)
    min_match_score = Column(Float, default=70.0)

    # Academic & Background JSON fields
    education = Column(Text, default='[]')  # list of {degree, university, graduation_year, cgpa}
    experience = Column(Text, default='[]') # list of {title, company, duration, description}
    projects = Column(Text, default='[]')   # list of {title, description, tech_stack, link}
    certifications = Column(Text, default='[]') # list of {title, issuer, year}
    skills = Column(Text, default='[]')     # list of strings: ["Python", "React", ...]
    
    # Resume storage
    resume_url = Column(String(500), nullable=True)
    resume_filename = Column(String(255), nullable=True)
    resume_raw_text = Column(Text, nullable=True)
    profile_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="seeker_profile")
    applications = relationship("Application", back_populates="seeker", cascade="all, delete-orphan")
    matches = relationship("MatchRecord", back_populates="seeker", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="seeker")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("recruiter_profiles.id", ondelete="CASCADE"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=True)
    responsibilities = Column(Text, nullable=True)
    job_type = Column(String(50), default="Internship")  # Internship, Full-time, Part-time
    
    # Location
    location_name = Column(String(255), default="Dhaka, Bangladesh")
    latitude = Column(Float, default=23.8103)
    longitude = Column(Float, default=90.4125)
    is_remote = Column(Boolean, default=False)

    # Compensation
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    salary_currency = Column(String(10), default="BDT")
    
    # AI Extracted & Configured Requirements
    required_skills = Column(Text, default='[]')  # JSON array
    preferred_skills = Column(Text, default='[]') # JSON array
    experience_level = Column(String(100), default="Entry-level / Fresh Graduate")
    education_level = Column(String(100), default="BSc in Computer Science or Software Engineering")
    deadline = Column(DateTime, nullable=True)
    status = Column(String(50), default="ACTIVE")  # ACTIVE, PAUSED, CLOSED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    recruiter = relationship("RecruiterProfile", back_populates="jobs")
    company = relationship("Company", back_populates="jobs")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    matches = relationship("MatchRecord", back_populates="job", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="job", cascade="all, delete-orphan")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    seeker_id = Column(Integer, ForeignKey("job_seeker_profiles.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default=ApplicationStatus.APPLIED, nullable=False)
    match_score = Column(Float, default=0.0)
    match_breakdown = Column(Text, default='{}')  # JSON string
    notes = Column(Text, nullable=True)
    cover_note = Column(Text, nullable=True)
    resume_used = Column(String(255), nullable=True)
    applied_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    job = relationship("Job", back_populates="applications")
    seeker = relationship("JobSeekerProfile", back_populates="applications")

class MatchRecord(Base):
    __tablename__ = "match_records"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    seeker_id = Column(Integer, ForeignKey("job_seeker_profiles.id", ondelete="CASCADE"), nullable=False)
    match_score = Column(Float, nullable=False)
    semantic_score = Column(Float, default=0.0)
    skill_score = Column(Float, default=0.0)
    exp_score = Column(Float, default=0.0)
    loc_score = Column(Float, default=0.0)
    matched_skills = Column(Text, default='[]') # JSON array
    missing_skills = Column(Text, default='[]') # JSON array
    explanation = Column(Text, default='[]')    # JSON array of bullet points
    distance_km = Column(Float, nullable=True)
    is_nearby = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    job = relationship("Job", back_populates="matches")
    seeker = relationship("JobSeekerProfile", back_populates="matches")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), default=NotificationType.JOB_MATCH)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(255), nullable=True)
    data_json = Column(Text, default='{}')
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")

class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    email_alerts = Column(Boolean, default=True)
    in_app_alerts = Column(Boolean, default=True)
    min_match_score = Column(Float, default=70.0)
    alert_radius_km = Column(Float, default=10.0)

    # Relationships
    user = relationship("User", back_populates="notification_pref")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    seeker_id = Column(Integer, ForeignKey("job_seeker_profiles.id", ondelete="CASCADE"), nullable=False)
    recruiter_id = Column(Integer, ForeignKey("recruiter_profiles.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    job = relationship("Job", back_populates="conversations")
    seeker = relationship("JobSeekerProfile", back_populates="conversations")
    recruiter = relationship("RecruiterProfile", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User")

class AdminReport(Base):
    __tablename__ = "admin_reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reported_job_id = Column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    reported_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reason = Column(Text, nullable=False)
    status = Column(String(50), default="PENDING")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
