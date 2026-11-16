import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_supabase_sync_job_seeker():
    unique_id = str(uuid.uuid4())
    email = f"seeker_{unique_id[:8]}@example.com"
    
    payload = {
        "supabase_uid": unique_id,
        "email": email,
        "role": "JOB_SEEKER",
        "full_name": "Test Candidate",
    }
    
    response = client.post("/api/v1/auth/supabase-sync", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == email
    assert data["role"] == "JOB_SEEKER"
    assert data["supabase_uid"] == unique_id
    assert data["is_verified"] is True
    assert data["profile"] is not None
    assert data["profile"]["full_name"] == "Test Candidate"
    assert data["profile"]["profile_completed"] is False

def test_supabase_sync_recruiter():
    unique_id = str(uuid.uuid4())
    email = f"recruiter_{unique_id[:8]}@enterprise.com"
    
    payload = {
        "supabase_uid": unique_id,
        "email": email,
        "role": "RECRUITER",
        "full_name": "Senior Talent Partner",
        "company_name": "Apex Global Innovations",
    }
    
    response = client.post("/api/v1/auth/supabase-sync", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == email
    assert data["role"] == "RECRUITER"
    assert data["supabase_uid"] == unique_id
    assert data["is_verified"] is True
    assert data["profile"] is not None
    assert data["profile"]["full_name"] == "Senior Talent Partner"
    assert data["profile"]["company"] is not None
    assert data["profile"]["company"]["name"] == "Apex Global Innovations"
