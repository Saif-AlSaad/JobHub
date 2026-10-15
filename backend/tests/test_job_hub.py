import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.location_service import haversine_distance, calculate_location_fit
from app.services.matching_service import compute_hybrid_match
from app.ai.resume_parser import extract_skills_from_text, parse_resume_to_profile
from app.ai.job_parser import extract_job_requirements

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"

def test_haversine_distance_calculation():
    # Distance between Savar (23.8560, 90.2600) and Dhanmondi (23.7461, 90.3742)
    dist = haversine_distance(23.8560, 90.2600, 23.7461, 90.3742)
    assert dist > 15.0 and dist < 20.0  # Approx 16.9 km

    # Zero distance test
    assert haversine_distance(23.8103, 90.4125, 23.8103, 90.4125) == 0.0

def test_location_fit_scoring():
    # Same area (within 2 km)
    fit_close = calculate_location_fit(23.8560, 90.2600, 23.8570, 90.2610, alert_radius_km=5.0)
    assert fit_close["is_nearby"] is True
    assert fit_close["score"] >= 95.0

    # Far area (beyond 10 km)
    fit_far = calculate_location_fit(23.8560, 90.2600, 23.7461, 90.3742, alert_radius_km=5.0)
    assert fit_far["is_nearby"] is False

    # Remote job always 100% fit
    fit_remote = calculate_location_fit(23.8560, 90.2600, 22.3569, 91.7832, is_remote=True)
    assert fit_remote["is_nearby"] is True
    assert fit_remote["score"] == 100.0

def test_skill_extraction_taxonomy():
    sample_text = """
    Software engineering graduate experienced with Python, FastAPI, and PostgreSQL.
    Built frontend apps using React, Tailwind CSS, and Git.
    Interested in Docker, Kubernetes, and Machine Learning.
    """
    skills = extract_skills_from_text(sample_text)
    assert "Python" in skills
    assert "FastAPI" in skills
    assert "PostgreSQL" in skills
    assert "React" in skills
    assert "Docker" in skills

def test_ai_hybrid_matching_engine():
    seeker = {
        "skills": ["Python", "FastAPI", "PostgreSQL", "React", "Git"],
        "headline": "Junior Software Engineer",
        "education": [{"degree": "BSc in Software Engineering", "university": "Daffodil International University"}],
        "experience": [{"title": "Software Intern", "company": "TechNova Labs"}],
        "projects": [{"title": "Job Hub Portal", "tech_stack": ["Python", "FastAPI", "React"]}],
        "preferred_job_types": ["Internship"],
        "preferred_latitude": 23.8560,
        "preferred_longitude": 90.2600,
        "alert_radius_km": 5.0
    }

    job = {
        "title": "Backend Engineering Intern",
        "description": "Looking for FastAPI and PostgreSQL developers in Savar.",
        "requirements": "Strong Python knowledge and REST API fundamentals.",
        "job_type": "Internship",
        "location_name": "Savar, Dhaka",
        "latitude": 23.8560,
        "longitude": 90.2600,
        "is_remote": False,
        "required_skills": ["Python", "FastAPI", "PostgreSQL"],
        "preferred_skills": ["Docker"]
    }

    match_result = compute_hybrid_match(seeker, job)
    assert match_result["match_score"] >= 70.0
    assert "FastAPI" in match_result["matched_skills"]
    assert "Docker" in match_result["missing_skills"]
    assert match_result["is_nearby"] is True
    assert len(match_result["explanation"]) >= 2

def test_ai_job_requirements_extractor():
    res = extract_job_requirements(
        title="Junior React & Python Developer",
        description="We are developing web apps with React, Tailwind, and FastAPI backends with PostgreSQL databases."
    )
    assert "required_skills" in res
    assert len(res["required_skills"]) >= 2
    assert "job_type" in res

def test_demo_login_flow():
    # 1. Seeker demo login
    res_seeker = client.post("/api/v1/auth/demo-login/seeker")
    assert res_seeker.status_code == 200
    seeker_data = res_seeker.json()
    assert "access_token" in seeker_data
    assert seeker_data["user"]["role"] == "JOB_SEEKER"

    # 2. Recruiter demo login
    res_recruiter = client.post("/api/v1/auth/demo-login/recruiter")
    assert res_recruiter.status_code == 200
    recruiter_data = res_recruiter.json()
    assert recruiter_data["user"]["role"] == "RECRUITER"

    # 3. Admin demo login
    res_admin = client.post("/api/v1/auth/demo-login/admin")
    assert res_admin.status_code == 200
    admin_data = res_admin.json()
    assert admin_data["user"]["role"] == "ADMIN"

def test_job_seeker_dashboard_summary():
    # Login as Sarah Rahman
    login_res = client.post("/api/v1/auth/demo-login/seeker")
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/seekers/dashboard-summary", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "profile_strength" in data
    assert "stats" in data
    assert len(data["top_matches"]) > 0
    assert "skill_gap_roadmap" in data

def test_job_search_and_filters():
    res = client.get("/api/v1/jobs/?location=Savar")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] > 0
    assert all("Savar" in j["location_name"] for j in data["jobs"])

def test_notifications_unread_and_mark():
    login_res = client.post("/api/v1/auth/demo-login/seeker")
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/notifications/", headers=headers)
    assert res.status_code == 200
    notifications = res.json()
    assert len(notifications) > 0
