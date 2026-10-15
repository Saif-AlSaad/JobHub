-- JOB HUB Database Schema (PostgreSQL + pgvector compatible)
-- Automatically managed by SQLAlchemy Base.metadata.create_all

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'JOB_SEEKER' NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    website VARCHAR(255),
    industry VARCHAR(100) DEFAULT 'Information Technology',
    description TEXT,
    location_name VARCHAR(255) DEFAULT 'Dhaka, Bangladesh',
    latitude FLOAT DEFAULT 23.8103,
    longitude FLOAT DEFAULT 90.4125,
    size VARCHAR(50) DEFAULT '50-200 employees',
    founded_year INT DEFAULT 2018,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recruiter_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_id INT REFERENCES companies(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    designation VARCHAR(150) DEFAULT 'Talent Acquisition Specialist',
    phone VARCHAR(50),
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_seeker_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    headline VARCHAR(255) DEFAULT 'Aspiring Software Engineer | Recent Graduate',
    phone VARCHAR(50),
    preferred_job_types TEXT DEFAULT '["Internship", "Full-time"]',
    preferred_roles TEXT DEFAULT '["Software Engineer", "Backend Developer"]',
    preferred_skills TEXT DEFAULT '["Python", "FastAPI", "React"]',
    preferred_location_name VARCHAR(255) DEFAULT 'Dhaka, Bangladesh',
    preferred_latitude FLOAT DEFAULT 23.8103,
    preferred_longitude FLOAT DEFAULT 90.4125,
    alert_radius_km FLOAT DEFAULT 10.0,
    min_match_score FLOAT DEFAULT 70.0,
    education TEXT DEFAULT '[]',
    experience TEXT DEFAULT '[]',
    projects TEXT DEFAULT '[]',
    certifications TEXT DEFAULT '[]',
    skills TEXT DEFAULT '[]',
    resume_url VARCHAR(500),
    resume_filename VARCHAR(255),
    resume_raw_text TEXT,
    profile_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    recruiter_id INT REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    job_type VARCHAR(50) DEFAULT 'Internship',
    location_name VARCHAR(255) DEFAULT 'Dhaka, Bangladesh',
    latitude FLOAT DEFAULT 23.8103,
    longitude FLOAT DEFAULT 90.4125,
    is_remote BOOLEAN DEFAULT FALSE,
    salary_min INT,
    salary_max INT,
    salary_currency VARCHAR(10) DEFAULT 'BDT',
    required_skills TEXT DEFAULT '[]',
    preferred_skills TEXT DEFAULT '[]',
    experience_level VARCHAR(100) DEFAULT 'Entry-level / Fresh Graduate',
    education_level VARCHAR(100) DEFAULT 'BSc in Computer Science or Software Engineering',
    deadline TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
    seeker_id INT REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'APPLIED' NOT NULL,
    match_score FLOAT DEFAULT 0.0,
    match_breakdown TEXT DEFAULT '{}',
    notes TEXT,
    cover_note TEXT,
    resume_used VARCHAR(255),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) DEFAULT 'JOB_MATCH',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    data_json TEXT DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    job_id INT REFERENCES jobs(id) ON DELETE SET NULL,
    seeker_id INT REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    recruiter_id INT REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
