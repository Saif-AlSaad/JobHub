import re
from typing import Dict, Any, List
from app.ai.llm_client import llm_service
from app.ai.resume_parser import extract_skills_from_text, normalize_skill

def extract_job_requirements(title: str, description: str, raw_requirements: str = "") -> Dict[str, Any]:
    """
    Extracts structured requirements from raw job title and description.
    Uses LLM when available; otherwise falls back to deterministic NLP.
    """
    full_text = f"{title}\n{description}\n{raw_requirements}"

    prompt = f"""Analyze this job posting and extract requirements into this exact JSON:
{{
  "title": "{title}",
  "required_skills": ["Skill1", "Skill2"],
  "preferred_skills": ["Skill3"],
  "experience_level": "Entry-level / Fresh Graduate or 1-2 years",
  "education_level": "BSc in Computer Science or Software Engineering",
  "job_type": "Internship or Full-time",
  "key_responsibilities": ["Responsibility 1", "Responsibility 2"],
  "requirements_summary": "Brief summary of key prerequisites"
}}

Job Posting:
{full_text[:3500]}
"""
    llm_result = llm_service.generate_json(prompt, system_instruction="You are a senior technical recruiter and talent parsing specialist.")
    if llm_result and isinstance(llm_result, dict) and "required_skills" in llm_result:
        llm_result["required_skills"] = [normalize_skill(s) for s in llm_result.get("required_skills", [])]
        llm_result["preferred_skills"] = [normalize_skill(s) for s in llm_result.get("preferred_skills", [])]
        return llm_result

    # Deterministic fallback
    all_found = extract_skills_from_text(full_text)
    if not all_found:
        all_found = ["Python", "FastAPI", "SQL", "Git"]

    # Split into required (first 65%) and preferred (remaining)
    split_idx = max(1, int(len(all_found) * 0.7))
    req_skills = all_found[:split_idx]
    pref_skills = all_found[split_idx:] if len(all_found) > split_idx else ["Docker"]

    job_type = "Internship" if any(w in full_text.lower() for w in ["intern", "trainee", "fresh"]) else "Full-time"
    exp_level = "Entry-level / Fresh Graduate" if "intern" in full_text.lower() or "fresh" in full_text.lower() else "0-1 Years Experience"

    return {
        "title": title,
        "required_skills": req_skills,
        "preferred_skills": pref_skills,
        "experience_level": exp_level,
        "education_level": "BSc in Software Engineering or Computer Science",
        "job_type": job_type,
        "key_responsibilities": [
            "Design, implement, and maintain high-quality software solutions and RESTful endpoints.",
            "Collaborate with senior software engineers, participate in code reviews and agile sprints."
        ],
        "requirements_summary": f"Proficiency in {', '.join(req_skills[:3])} and strong problem-solving fundamentals."
    }
