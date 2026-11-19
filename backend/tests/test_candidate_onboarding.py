import io
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_candidate_onboarding_flow():
    # 1. Register a fresh Job Seeker via Supabase sync
    uid = str(uuid.uuid4())
    email = f"candidate_{uid[:8]}@test.com"
    sync_res = client.post("/api/v1/auth/supabase-sync", json={
        "supabase_uid": uid,
        "email": email,
        "role": "JOB_SEEKER",
        "full_name": "Tanzim Hasan",
    })
    assert sync_res.status_code == 200
    user_data = sync_res.json()
    assert user_data["profile"]["profile_completed"] is False
    assert user_data["profile"]["resume_url"] is None

    # Authenticate using demo login or token
    # Let's generate a token by logging into demo or using local auth
    # Sarah Rahman is a seeded job seeker
    login_res = client.post("/api/v1/auth/demo-login/seeker")
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Check resume status
    status_res = client.get("/api/v1/resume/status", headers=headers)
    assert status_res.status_code == 200
    data = status_res.json()
    assert "has_resume" in data
    assert "profile_completed" in data

    # 3. Test resume upload endpoint
    sample_content = b"%PDF-1.4 Mock Candidate Resume Document Content for Testing"
    file_payload = {
        "file": ("Tanzim_Resume.pdf", io.BytesIO(sample_content), "application/pdf")
    }
    upload_res = client.post("/api/v1/resume/upload", files=file_payload, headers=headers)
    assert upload_res.status_code == 200
    upload_data = upload_res.json()
    assert upload_data["status"] == "success"
    assert upload_data["filename"] == "Tanzim_Resume.pdf"
    assert "resume_url" in upload_data

    # 4. Confirm profile with empty-state provided details
    profile_payload = {
        "full_name": "Tanzim Hasan",
        "headline": "Junior Software Engineer | AI Aspirant",
        "phone": "01711223344",
        "preferred_location_name": "Banani, Dhaka",
        "preferred_job_types": ["Internship", "Full-time"],
        "preferred_roles": ["Software Engineer", "Backend Developer"],
        "skills": ["Python", "FastAPI", "React", "PostgreSQL"],
        "education": [
            {
                "university": "Daffodil International University",
                "degree": "BSc in Software Engineering",
                "graduation_year": "2026",
                "cgpa": "3.85"
            }
        ],
        "experience": [],
        "projects": [],
        "certifications": []
    }
    confirm_res = client.post("/api/v1/resume/confirm-profile", json=profile_payload, headers=headers)
    assert confirm_res.status_code == 200
    confirm_data = confirm_res.json()
    assert confirm_data["profile_completed"] is True
    assert "new_matches_count" in confirm_data

    # 5. Verify seeker profile now reflects completed state and stored preferences
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["profile"]["profile_completed"] is True
    assert "Python" in me_data["profile"]["skills"]
    assert "FastAPI" in me_data["profile"]["skills"]

def test_recruiter_restricted_from_seeker_resume_endpoints():
    login_res = client.post("/api/v1/auth/demo-login/recruiter")
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Recruiter should receive 403 Forbidden on seeker-only resume status
    res = client.get("/api/v1/resume/status", headers=headers)
    assert res.status_code == 403

def test_recruiter_upload_company_logo():
    login_res = client.post("/api/v1/auth/demo-login/recruiter")
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    sample_logo = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    file_payload = {
        "file": ("enterprise_logo.png", io.BytesIO(sample_logo), "image/png")
    }
    res = client.post("/api/v1/recruiter/upload-logo", files=file_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "logo_url" in data
    assert "storage_provider" in data
