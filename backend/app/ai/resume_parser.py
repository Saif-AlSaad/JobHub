import re
import os
import io
import json
from typing import Dict, Any, List
import pdfplumber
import docx
from app.ai.llm_client import llm_service

# Comprehensive skill taxonomy
SKILL_TAXONOMY = [
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "golang", "rust", "php", "ruby", "swift", "kotlin", "sql", "html", "css",
    # Frontend
    "react", "react.js", "next.js", "nextjs", "vue", "vue.js", "nuxt", "angular", "tailwind", "tailwind css", "bootstrap", "redux", "zustand", "sass",
    # Backend & Frameworks
    "fastapi", "django", "flask", "node.js", "nodejs", "express", "express.js", "nest.js", "spring boot", "laravel", "asp.net", "graphql", "rest api",
    # Databases & Caching
    "postgresql", "postgres", "mysql", "mongodb", "sqlite", "redis", "elasticsearch", "supabase", "firebase", "cassandra",
    # DevOps & Cloud
    "docker", "kubernetes", "aws", "amazon web services", "gcp", "google cloud", "azure", "ci/cd", "github actions", "linux", "git", "github", "terraform", "nginx",
    # AI / ML & Data Science
    "machine learning", "deep learning", "nlp", "natural language processing", "scikit-learn", "tensorflow", "pytorch", "pandas", "numpy", "opencv", "llm", "huggingface", "data analysis", "powerbi", "tableau",
    # Methodologies & Tools
    "agile", "scrum", "jira", "figma", "postman", "unit testing", "pytest", "jest", "cypress"
]

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """Extracts raw text content from uploaded PDF or DOCX file."""
    text = ""
    lower_name = filename.lower()
    
    if lower_name.endswith(".pdf"):
        try:
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
        except Exception as e:
            text = f"Error reading PDF: {e}"
    elif lower_name.endswith(".docx"):
        try:
            doc = docx.Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                if para.text:
                    text += para.text + "\n"
        except Exception as e:
            text = f"Error reading DOCX: {e}"
    else:
        # Fallback to UTF-8 decoded text
        try:
            text = file_bytes.decode('utf-8', errors='ignore')
        except Exception:
            text = ""

    return text.strip()

def normalize_skill(skill: str) -> str:
    mapping = {
        "fastapi": "FastAPI",
        "react": "React",
        "react.js": "React",
        "next.js": "Next.js",
        "nextjs": "Next.js",
        "vue": "Vue.js",
        "vue.js": "Vue.js",
        "node.js": "Node.js",
        "nodejs": "Node.js",
        "postgresql": "PostgreSQL",
        "postgres": "PostgreSQL",
        "mongodb": "MongoDB",
        "aws": "AWS",
        "gcp": "GCP",
        "rest api": "REST APIs",
        "ci/cd": "CI/CD",
        "scikit-learn": "Scikit-Learn",
        "sql": "SQL",
        "html": "HTML5",
        "css": "CSS3",
        "tailwind": "Tailwind CSS",
        "tailwind css": "Tailwind CSS",
        "powerbi": "Power BI",
        "ui/ux": "UI/UX",
        "machine learning": "Machine Learning",
        "deep learning": "Deep Learning",
        "nlp": "NLP"
    }
    return mapping.get(skill.lower(), skill.title())

def extract_skills_from_text(text: str) -> List[str]:
    text_lower = text.lower()
    matched = set()
    for skill in SKILL_TAXONOMY:
        # word boundary regex
        pattern = r'(?<!\w)' + re.escape(skill) + r'(?!\w)'
        if re.search(pattern, text_lower):
            matched.add(normalize_skill(skill))
    return sorted(list(matched))

def extract_profile_with_fallback(raw_text: str) -> Dict[str, Any]:
    """Deterministic, high-accuracy rule-based extraction without inserting fake filler data."""
    lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
    
    # 1. Email extraction
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', raw_text)
    email = email_match.group(0) if email_match else ""

    # 2. Phone extraction (Bangladeshi & international format)
    phone_match = re.search(r'(\+?880[\s-]?)?01[3-9]\d{8}|\+?\d{1,3}[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}', raw_text)
    phone = phone_match.group(0) if phone_match else ""

    # 3. Name candidate (first line without contact details)
    full_name = ""
    for line in lines[:5]:
        if not re.search(r'@|http|\.com|\+?\d{4}', line) and len(line) < 40 and len(line) > 2:
            full_name = line
            break

    # 4. Skills extraction - only actual skills found in text
    skills = extract_skills_from_text(raw_text)

    # 5. Education detection - only actual education keywords found in text
    education = []
    edu_keywords = ["daffodil", "brac", "buet", "north south", "nsu", "aiub", "iut", "university", "college", "bachelor", "bsc", "b.sc", "b.tech", "master", "diploma"]
    for line in lines:
        line_lower = line.lower()
        if any(kw in line_lower for kw in edu_keywords):
            degree = "BSc in Software Engineering" if "software" in line_lower else ("BSc in Computer Science" if "computer" in line_lower else ("Bachelor Degree" if "bachelor" in line_lower or "bsc" in line_lower else line[:40]))
            uni = "Daffodil International University" if "daffodil" in line_lower else ("BUET" if "buet" in line_lower else ("BRAC University" if "brac" in line_lower else ("North South University" if "north south" in line_lower or "nsu" in line_lower else ("AIUB" if "aiub" in line_lower else ""))))
            
            # graduation year detection if present
            year_match = re.search(r'\b(20[1-3]\d)\b', line)
            grad_year = int(year_match.group(1)) if year_match else None
            
            # CGPA detection if present
            cgpa_match = re.search(r'cgpa[:\s]*([0-4]\.\d{1,2})', line_lower)
            cgpa_val = float(cgpa_match.group(1)) if cgpa_match else None

            education.append({
                "degree": degree,
                "university": uni,
                "graduation_year": grad_year,
                "cgpa": cgpa_val
            })
            break

    # 6. Projects detection - only if explicitly in text
    projects = []
    proj_pattern = re.compile(r'(?:Project|System|App|Platform|Portal|Tracker|Engine|Hub)\b', re.IGNORECASE)
    for i, line in enumerate(lines):
        if proj_pattern.search(line) and len(line) < 60:
            desc = lines[i+1] if i+1 < len(lines) else ""
            projects.append({
                "title": line.strip("•- "),
                "description": desc,
                "tech_stack": [],
                "link": ""
            })
            if len(projects) >= 2:
                break

    # 7. Location detection if mentioned in resume
    detected_location = ""
    loc_keywords = ["savar", "banani", "mohakhali", "dhanmondi", "uttara", "gulshan", "dhaka", "chittagong", "sylhet", "rajshahi"]
    for kw in loc_keywords:
        if kw in raw_text.lower():
            detected_location = kw.title() + (", Dhaka" if kw in ["savar", "banani", "mohakhali", "dhanmondi", "uttara", "gulshan"] else ", Bangladesh")
            break

    return {
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "headline": "",
        "education": education,
        "skills": skills,
        "experience": [],
        "projects": projects,
        "certifications": [],
        "preferred_location_name": detected_location
    }

def parse_resume_to_profile(raw_text: str) -> Dict[str, Any]:
    """Extracts structured career profile from resume using LLM with deterministic NLP fallback."""
    if not raw_text or len(raw_text.strip()) < 10:
        return {
            "full_name": "",
            "email": "",
            "phone": "",
            "headline": "",
            "education": [],
            "skills": [],
            "experience": [],
            "projects": [],
            "certifications": [],
            "preferred_location_name": ""
        }

    # Attempt LLM extraction if client available
    prompt = f"""Extract the career profile details from this resume text into this exact JSON schema:
{{
  "full_name": "Full Name",
  "email": "email",
  "phone": "phone",
  "headline": "Professional Headline",
  "skills": ["Skill1", "Skill2"],
  "education": [
    {{"degree": "Degree Name", "university": "University Name", "graduation_year": 2026, "cgpa": 3.7}}
  ],
  "experience": [
    {{"title": "Role Title", "company": "Company", "duration": "Duration", "description": "Brief description"}}
  ],
  "projects": [
    {{"title": "Project Title", "description": "Description", "tech_stack": ["Tech1", "Tech2"], "link": "url"}}
  ],
  "certifications": [
    {{"title": "Certification", "issuer": "Issuer", "year": 2025}}
  ],
  "preferred_location_name": "City, Country"
}}

Resume text:
{raw_text[:4000]}
"""
    llm_result = llm_service.generate_json(prompt, system_instruction="You are an expert ATS and career profile parser.")
    if llm_result and isinstance(llm_result, dict) and "skills" in llm_result:
        # Normalize extracted skills
        llm_result["skills"] = [normalize_skill(s) for s in llm_result.get("skills", [])]
        return llm_result

    # Fallback to rule-based NLP extraction
    return extract_profile_with_fallback(raw_text)
