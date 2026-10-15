import json
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.config import settings
from app.services.location_service import calculate_location_fit

def compute_hybrid_match(
    seeker_profile: Dict[str, Any],
    job: Dict[str, Any],
    weights: Dict[str, float] = None
) -> Dict[str, Any]:
    """
    Computes hybrid AI match score between a candidate profile and a job.
    Weights default to:
      - Semantic similarity: 40%
      - Skill overlap: 30%
      - Education & Experience fit: 15%
      - Location & Job type preference: 15%
    """
    if weights is None:
        weights = {
            "semantic": settings.WEIGHT_SEMANTIC,
            "skill": settings.WEIGHT_SKILL,
            "exp_edu": settings.WEIGHT_EXP_EDU,
            "location": settings.WEIGHT_LOCATION,
        }

    # 1. Skill Overlap (30%)
    seeker_skills = set(s.strip().lower() for s in seeker_profile.get("skills", []))
    req_skills = set(s.strip().lower() for s in job.get("required_skills", []))
    pref_skills = set(s.strip().lower() for s in job.get("preferred_skills", []))
    
    all_job_skills = req_skills.union(pref_skills)
    if not all_job_skills:
        skill_score = 80.0
        matched_skills = list(seeker_profile.get("skills", []))[:3]
        missing_skills = []
    else:
        matched_req = seeker_skills.intersection(req_skills)
        matched_pref = seeker_skills.intersection(pref_skills)
        
        req_ratio = len(matched_req) / len(req_skills) if req_skills else 1.0
        pref_ratio = len(matched_pref) / len(pref_skills) if pref_skills else 1.0
        
        raw_skill_score = (req_ratio * 0.75 + pref_ratio * 0.25) * 100.0
        skill_score = min(100.0, max(20.0, raw_skill_score))
        
        # Display list preserving canonical normalized case
        from app.ai.resume_parser import normalize_skill
        matched_skills = [normalize_skill(s) for s in (matched_req.union(matched_pref))]
        missing_skills = [normalize_skill(s) for s in (all_job_skills - seeker_skills)]

    # 2. Semantic Similarity via TF-IDF (40%)
    seeker_doc_parts = [
        " ".join(seeker_profile.get("skills", [])),
        seeker_profile.get("headline", ""),
        json.dumps(seeker_profile.get("experience", [])),
        json.dumps(seeker_profile.get("projects", [])),
        json.dumps(seeker_profile.get("education", [])),
    ]
    seeker_doc = " ".join(seeker_doc_parts).strip() or "software engineer developer programming"
    
    job_doc_parts = [
        job.get("title", ""),
        job.get("description", ""),
        job.get("requirements", ""),
        " ".join(job.get("required_skills", [])),
        " ".join(job.get("preferred_skills", [])),
    ]
    job_doc = " ".join(job_doc_parts).strip() or "software engineer internship developer"

    try:
        vectorizer = TfidfVectorizer(stop_words='english', token_pattern=r'(?u)\b\w+\b')
        matrix = vectorizer.fit_transform([seeker_doc, job_doc])
        cos_sim = float(cosine_similarity(matrix[0:1], matrix[1:2])[0][0])
        # Scale cosine similarity from roughly 0.1-0.8 range to 40-98%
        semantic_score = min(98.0, max(35.0, round((cos_sim * 60.0) + 40.0, 1)))
    except Exception:
        semantic_score = 75.0

    # 3. Education & Experience Fit (15%)
    exp_edu_score = 80.0
    edu_list = seeker_profile.get("education", [])
    has_cs_degree = False
    for edu in edu_list:
        degree_str = str(edu.get("degree", "")).lower()
        if any(kw in degree_str for kw in ["software", "computer", "cs", "cse", "it"]):
            has_cs_degree = True
            break
            
    if has_cs_degree:
        exp_edu_score += 15.0
    if len(seeker_profile.get("experience", [])) > 0 or len(seeker_profile.get("projects", [])) >= 2:
        exp_edu_score += 5.0
    exp_edu_score = min(100.0, max(40.0, exp_edu_score))

    # 4. Location & Job Type Fit (15%)
    alert_radius = float(seeker_profile.get("alert_radius_km", 10.0))
    loc_fit = calculate_location_fit(
        seeker_lat=seeker_profile.get("preferred_latitude"),
        seeker_lon=seeker_profile.get("preferred_longitude"),
        job_lat=job.get("latitude"),
        job_lon=job.get("longitude"),
        is_remote=job.get("is_remote", False),
        alert_radius_km=alert_radius
    )
    
    # Check job type alignment
    preferred_types = [t.lower() for t in seeker_profile.get("preferred_job_types", ["internship"])]
    job_type = str(job.get("job_type", "internship")).lower()
    type_bonus = 5.0 if job_type in preferred_types else -10.0
    
    final_loc_score = min(100.0, max(30.0, loc_fit["score"] + type_bonus))

    # 5. Composite Hybrid Score (0 - 100)
    composite = (
        (weights["semantic"] * semantic_score) +
        (weights["skill"] * skill_score) +
        (weights["exp_edu"] * exp_edu_score) +
        (weights["location"] * final_loc_score)
    )
    final_score = round(min(99.0, max(30.0, composite)), 1)

    # 6. Generate Explainable Match Reasoning
    explanation = []
    if matched_skills:
        primary_skills = ", ".join(matched_skills[:3])
        explanation.append(f"Your {primary_skills} experience matches the required stack")
    if has_cs_degree:
        explanation.append("Your Software Engineering / CS background matches the academic requirement")
    if loc_fit["is_nearby"]:
        explanation.append(f"Located {loc_fit['note']} (within your {int(alert_radius)} km alert radius)")
    elif job.get("is_remote"):
        explanation.append("Fully remote opportunity matching your flexible preferences")
    if missing_skills:
        explanation.append(f"Skill gap identified: {', '.join(missing_skills[:2])}")

    return {
        "match_score": final_score,
        "semantic_score": semantic_score,
        "skill_score": round(skill_score, 1),
        "exp_edu_score": round(exp_edu_score, 1),
        "location_score": round(final_loc_score, 1),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "explanation": explanation,
        "distance_km": loc_fit["distance_km"],
        "is_nearby": loc_fit["is_nearby"],
        "location_note": loc_fit["note"]
    }

def get_skill_roadmap(missing_skills: List[str]) -> List[Dict[str, Any]]:
    """Generates personalized learning path recommendations for missing skills."""
    learning_resources = {
        "docker": {"site": "Docker Hands-On Guide", "url": "https://docs.docker.com/get-started/", "duration": "1 week", "level": "Beginner to Intermediate"},
        "kubernetes": {"site": "Kubernetes Basics", "url": "https://kubernetes.io/docs/tutorials/", "duration": "2 weeks", "level": "Intermediate"},
        "aws": {"site": "AWS Cloud Practitioner", "url": "https://aws.amazon.com/training/", "duration": "2 weeks", "level": "Foundational"},
        "fastapi": {"site": "FastAPI Web Framework", "url": "https://fastapi.tiangolo.com/tutorial/", "duration": "1 week", "level": "Beginner"},
        "react": {"site": "React Docs & Roadmaps", "url": "https://react.dev/learn", "duration": "2 weeks", "level": "Intermediate"},
        "postgresql": {"site": "PostgreSQL Tutorial", "url": "https://www.postgresqltutorial.com/", "duration": "1.5 weeks", "level": "Foundational"},
        "redis": {"site": "Redis University", "url": "https://university.redis.com/", "duration": "5 days", "level": "Intermediate"},
        "graphql": {"site": "How to GraphQL", "url": "https://www.howtographql.com/", "duration": "1 week", "level": "Intermediate"},
        "machine learning": {"site": "Machine Learning Specialization", "url": "https://www.coursera.org/", "duration": "4 weeks", "level": "Advanced"},
        "ci/cd": {"site": "GitHub Actions Guide", "url": "https://docs.github.com/en/actions", "duration": "4 days", "level": "Foundational"},
    }
    
    roadmap = []
    for skill in missing_skills:
        key = skill.lower()
        res = learning_resources.get(key, {
            "site": f"freeCodeCamp / {skill} Fundamentals",
            "url": f"https://www.freecodecamp.org/news/search/?query={skill}",
            "duration": "1-2 weeks",
            "level": "Intermediate"
        })
        roadmap.append({
            "skill": skill,
            "resource": res["site"],
            "url": res["url"],
            "duration": res["duration"],
            "level": res["level"]
        })
    return roadmap
