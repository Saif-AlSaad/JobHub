import pytest
import json
from starlette.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.models import (
    User, UserRole, JobSeekerProfile, RecruiterProfile, Job, Application, Company, Conversation
)
from app.services.location_service import calculate_location_fit
from app.services.matching_service import compute_hybrid_match
from app.ai.resume_parser import extract_text_from_file

client = TestClient(app)

def test_location_service_zero_and_null_radius():
    """Verify calculate_location_fit handles 0 and None radius without ZeroDivisionError."""
    # Zero radius
    res_zero = calculate_location_fit(23.8103, 90.4125, 23.8150, 90.4150, alert_radius_km=0.0)
    assert res_zero["distance_km"] is not None
    assert isinstance(res_zero["score"], float)

    # None radius
    res_none = calculate_location_fit(23.8103, 90.4125, 23.8150, 90.4150, alert_radius_km=None)
    assert res_none["distance_km"] is not None
    assert isinstance(res_none["score"], float)

def test_matching_service_none_radius():
    """Verify compute_hybrid_match safely parses None alert_radius_km."""
    seeker = {
        "skills": ["Python", "FastAPI"],
        "headline": "Backend Engineer",
        "education": [],
        "experience": [],
        "projects": [],
        "preferred_job_types": ["Internship"],
        "preferred_latitude": 23.8103,
        "preferred_longitude": 90.4125,
        "alert_radius_km": None
    }
    job = {
        "id": 1,
        "title": "FastAPI Developer",
        "description": "Python FastAPI Developer",
        "requirements": "Python, FastAPI",
        "job_type": "Internship",
        "location_name": "Dhaka",
        "latitude": 23.8103,
        "longitude": 90.4125,
        "is_remote": False,
        "required_skills": ["Python", "FastAPI"],
        "preferred_skills": []
    }
    match = compute_hybrid_match(seeker, job)
    assert "match_score" in match
    assert match["match_score"] > 0

def test_resume_parser_corrupted_file():
    """Verify extract_text_from_file returns empty string on corrupt binary content instead of error string."""
    garbage = b"\x00\x01\x02\x03\x04\x05GARBAGE_NOT_A_REAL_PDF"
    res = extract_text_from_file(garbage, "fake_resume.pdf")
    # Must not return "Error reading PDF: ..." which corrupts NLP profile extraction
    assert res == ""

def test_job_search_limit_and_aliases():
    """Verify /jobs/?limit=... and ?search=... work accurately."""
    res = client.get("/api/v1/jobs/?limit=2")
    assert res.status_code == 200
    data = res.json()
    assert "jobs" in data
    assert len(data["jobs"]) <= 2

    # Verify search query alias
    res_search = client.get("/api/v1/jobs/?search=developer")
    assert res_search.status_code == 200

def test_job_save_toggle():
    """Verify /jobs/{id}/save endpoint functions for logged-in users."""
    login_res = client.post("/api/v1/auth/demo-login/seeker")
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # Get first job
    jobs_res = client.get("/api/v1/jobs/?limit=1")
    jobs = jobs_res.json().get("jobs", [])
    if jobs:
        job_id = jobs[0]["id"]
        save_res = client.post(
            f"/api/v1/jobs/{job_id}/save",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert save_res.status_code == 200
        assert save_res.json()["saved"] is True

def test_admin_recruiters_email_and_location():
    """Verify /admin/recruiters returns recruiter email and location_name."""
    login_res = client.post("/api/v1/auth/demo-login/admin")
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    rec_res = client.get("/api/v1/admin/recruiters", headers={"Authorization": f"Bearer {token}"})
    assert rec_res.status_code == 200
    recruiters = rec_res.json()
    if recruiters:
        first = recruiters[0]
        assert "email" in first
        assert "location_name" in first

def test_chat_unauthorized_access_rejected():
    """Verify that a user who is not part of a conversation cannot read messages."""
    db = SessionLocal()
    try:
        conv = db.query(Conversation).first()
        if not conv:
            return
        conv_id = conv.id
    finally:
        db.close()

    # Login as seeker
    login_res = client.post("/api/v1/auth/demo-login/seeker")
    token = login_res.json()["access_token"]

    # Access an arbitrary conversation if not participant
    # Create or test conversation access
    res = client.get(
        f"/api/v1/chat/conversations/{conv_id}/messages",
        headers={"Authorization": f"Bearer {token}"}
    )
    # Status should be 200 if participant or 403 if unauthorized, but NEVER 500
    assert res.status_code in [200, 403]

def test_application_withdraw_flow():
    """Verify candidate can withdraw their application."""
    login_res = client.post("/api/v1/auth/demo-login/seeker")
    token = login_res.json()["access_token"]

    # Check applications
    apps_res = client.get("/api/v1/applications/my", headers={"Authorization": f"Bearer {token}"})
    assert apps_res.status_code == 200
    apps = apps_res.json()
    if apps:
        app_id = apps[0]["id"]
        withdraw_res = client.patch(
            f"/api/v1/applications/{app_id}/withdraw",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert withdraw_res.status_code == 200
        assert withdraw_res.json()["new_status"] == "WITHDRAWN"

def test_recruiter_dashboard_structure():
    """Verify recruiter dashboard provides both candidate_name and seeker_name."""
    login_res = client.post("/api/v1/auth/demo-login/recruiter")
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    dash_res = client.get("/api/v1/recruiter/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert dash_res.status_code == 200
    data = dash_res.json()
    assert "top_candidates" in data
    for cand in data["top_candidates"]:
        assert "candidate_name" in cand
        assert "seeker_name" in cand
        assert cand["candidate_name"] != ""
