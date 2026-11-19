import pytest
from starlette.testclient import TestClient
from starlette.websockets import WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.main import app
from app.database import SessionLocal, Base, engine
from app.models.models import (
    User, UserRole, JobSeekerProfile, RecruiterProfile,
    Company, Job, Application, MatchRecord
)
from app.auth.security import create_access_token, hash_password
from app.services.notification_service import evaluate_and_notify_seekers_for_new_job

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_test_data():
    db = SessionLocal()
    try:
        # Create unique test users
        user_seeker = db.query(User).filter(User.email == "sec_seeker@example.com").first()
        if not user_seeker:
            user_seeker = User(
                email="sec_seeker@example.com",
                role=UserRole.JOB_SEEKER,
                password_hash=hash_password("Secret123!"),
                is_active=True,
                is_verified=True
            )
            db.add(user_seeker)
            db.commit()
            db.refresh(user_seeker)

        seeker_profile = db.query(JobSeekerProfile).filter(JobSeekerProfile.user_id == user_seeker.id).first()
        if not seeker_profile:
            seeker_profile = JobSeekerProfile(
                user_id=user_seeker.id,
                full_name="Security Seeker",
                headline="Security Engineer",
                skills='["Python", "FastAPI", "Security", "PostgreSQL"]',
                min_match_score=60.0
            )
            db.add(seeker_profile)
            db.commit()
            db.refresh(seeker_profile)

        user_other = db.query(User).filter(User.email == "sec_other@example.com").first()
        if not user_other:
            user_other = User(
                email="sec_other@example.com",
                role=UserRole.JOB_SEEKER,
                password_hash=hash_password("Secret123!"),
                is_active=True,
                is_verified=True
            )
            db.add(user_other)
            db.commit()
            db.refresh(user_other)

        user_admin = db.query(User).filter(User.email == "sec_admin@example.com").first()
        if not user_admin:
            user_admin = User(
                email="sec_admin@example.com",
                role=UserRole.ADMIN,
                password_hash=hash_password("Secret123!"),
                is_active=True,
                is_verified=True
            )
            db.add(user_admin)
            db.commit()
            db.refresh(user_admin)

        # Recruiter and job
        user_rec = db.query(User).filter(User.email == "sec_recruiter@example.com").first()
        if not user_rec:
            user_rec = User(
                email="sec_recruiter@example.com",
                role=UserRole.RECRUITER,
                password_hash=hash_password("Secret123!"),
                is_active=True,
                is_verified=True
            )
            db.add(user_rec)
            db.commit()
            db.refresh(user_rec)

        company = db.query(Company).filter(Company.name == "SecCorp Inc").first()
        if not company:
            company = Company(
                name="SecCorp Inc",
                website="https://seccorp.io",
                industry="Cybersecurity"
            )
            db.add(company)
            db.commit()
            db.refresh(company)

        rec_profile = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == user_rec.id).first()
        if not rec_profile:
            rec_profile = RecruiterProfile(
                user_id=user_rec.id,
                company_id=company.id,
                full_name="Security Recruiter",
                designation="Security Talent Partner"
            )
            db.add(rec_profile)
            db.commit()
            db.refresh(rec_profile)

        job = db.query(Job).filter(Job.title == "Staff Security Engineer").first()
        if not job:
            job = Job(
                recruiter_id=rec_profile.id,
                company_id=company.id,
                title="Staff Security Engineer",
                description="Secure backend systems and APIs",
                job_type="Full-time",
                required_skills='["Python", "FastAPI", "Security"]',
                preferred_skills='["PostgreSQL", "Docker"]',
                status="ACTIVE"
            )
            db.add(job)
            db.commit()
            db.refresh(job)

        tokens = {
            "seeker": create_access_token(user_seeker.id, role=str(user_seeker.role)),
            "other": create_access_token(user_other.id, role=str(user_other.role)),
            "admin": create_access_token(user_admin.id, role=str(user_admin.role)),
            "seeker_user_id": user_seeker.id,
            "other_user_id": user_other.id,
            "admin_user_id": user_admin.id,
            "seeker_profile_id": seeker_profile.id,
            "job_id": job.id,
        }
        return tokens
    finally:
        db.close()


def test_ws_rejects_missing_token(setup_test_data):
    seeker_id = setup_test_data["seeker_user_id"]
    with pytest.raises(WebSocketDisconnect) as excinfo:
        with client.websocket_connect(f"/ws/{seeker_id}") as websocket:
            websocket.receive_text()
    assert excinfo.value.code == 1008


def test_ws_rejects_invalid_token(setup_test_data):
    seeker_id = setup_test_data["seeker_user_id"]
    with pytest.raises(WebSocketDisconnect) as excinfo:
        with client.websocket_connect(f"/ws/{seeker_id}?token=invalid.jwt.token") as websocket:
            websocket.receive_text()
    assert excinfo.value.code == 1008


def test_ws_rejects_unauthorized_user(setup_test_data):
    """User B cannot connect to User A's private WebSocket stream."""
    seeker_id = setup_test_data["seeker_user_id"]
    other_token = setup_test_data["other"]
    with pytest.raises(WebSocketDisconnect) as excinfo:
        with client.websocket_connect(f"/ws/{seeker_id}?token={other_token}") as websocket:
            websocket.receive_text()
    assert excinfo.value.code == 1008


def test_ws_allows_matching_user(setup_test_data):
    """User A connects to User A's stream successfully and receives ping/pong."""
    seeker_id = setup_test_data["seeker_user_id"]
    seeker_token = setup_test_data["seeker"]
    with client.websocket_connect(f"/ws/{seeker_id}?token={seeker_token}") as websocket:
        websocket.send_text('{"type": "PING"}')
        data = websocket.receive_text()
        assert "PONG" in data


def test_ws_allows_admin_access(setup_test_data):
    """Admin is authorized to connect to any user stream for telemetry/support."""
    seeker_id = setup_test_data["seeker_user_id"]
    admin_token = setup_test_data["admin"]
    with client.websocket_connect(f"/ws/{seeker_id}?token={admin_token}") as websocket:
        websocket.send_text('{"type": "PING"}')
        data = websocket.receive_text()
        assert "PONG" in data


def test_background_matching_with_job_id(setup_test_data):
    """Verify background task runs with just job_id in an isolated session."""
    job_id = setup_test_data["job_id"]
    notifs_sent = evaluate_and_notify_seekers_for_new_job(job_id)
    assert notifs_sent >= 1

    # Verify MatchRecord was created in DB
    db = SessionLocal()
    try:
        match = db.query(MatchRecord).filter(
            MatchRecord.job_id == job_id,
            MatchRecord.seeker_id == setup_test_data["seeker_profile_id"]
        ).first()
        assert match is not None
        assert match.match_score > 60.0
    finally:
        db.close()


def test_unique_constraint_on_match_record(setup_test_data):
    """Verify composite unique constraint prevents duplicate MatchRecords."""
    db = SessionLocal()
    try:
        dup = MatchRecord(
            job_id=setup_test_data["job_id"],
            seeker_id=setup_test_data["seeker_profile_id"],
            match_score=95.0,
            semantic_score=90.0,
            skill_score=100.0,
            exp_score=90.0,
            loc_score=100.0
        )
        db.add(dup)
        with pytest.raises(IntegrityError):
            db.commit()
    finally:
        db.rollback()
        db.close()
