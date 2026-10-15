import json
import datetime
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models.models import (
    User, UserRole, Company, RecruiterProfile, JobSeekerProfile,
    Job, Application, ApplicationStatus, MatchRecord,
    Notification, NotificationType, NotificationPreference,
    Conversation, Message
)
from app.auth.security import hash_password
from app.services.matching_service import compute_hybrid_match

def run_seed():
    print("[SEED] Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        existing_users = db.query(User).count()
        if existing_users > 5:
            print(f"[SEED] Database already contains {existing_users} users. Cleaning for fresh seed...")
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)

        default_pwd = hash_password("password123")

        # 1. Create Admin User
        admin_user = User(
            email="admin@jobhub.io",
            password_hash=default_pwd,
            role=UserRole.ADMIN,
            is_verified=True,
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        pref_admin = NotificationPreference(user_id=admin_user.id, email_alerts=True, in_app_alerts=True)
        db.add(pref_admin)

        # 2. Create 12 Bangladesh Tech Companies
        companies_data = [
            {
                "name": "TechNova Labs",
                "industry": "Software Engineering & Cloud AI",
                "location_name": "Savar, Dhaka",
                "latitude": 23.8560,
                "longitude": 90.2600,
                "website": "https://technova.io",
                "size": "50-150 employees",
                "description": "Leading cloud solutions and intelligent automation platform for international enterprises.",
                "logo_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80"
            },
            {
                "name": "Brain Station 23",
                "industry": "Enterprise Software & Fintech",
                "location_name": "Mohakhali, Dhaka",
                "latitude": 23.7776,
                "longitude": 90.4005,
                "website": "https://brainstation-23.com",
                "size": "500+ employees",
                "description": "Premier global software development outsourcing company delivering digital transformation.",
                "logo_url": "https://images.unsplash.com/photo-1551434678-e076c223a692?w=128&auto=format&fit=crop&q=80"
            },
            {
                "name": "Therap BD",
                "industry": "Healthcare Electronic Records",
                "location_name": "Banani, Dhaka",
                "latitude": 23.7937,
                "longitude": 90.4043,
                "website": "https://therapservices.net",
                "size": "300+ employees",
                "description": "The national leader in developmental disability electronic documentation software in the US.",
                "logo_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=128&auto=format&fit=crop&q=80"
            },
            {
                "name": "Enosis Solutions",
                "industry": "Custom Software Engineering",
                "location_name": "Dhanmondi, Dhaka",
                "latitude": 23.7461,
                "longitude": 90.3742,
                "website": "https://enosisbd.com",
                "size": "250+ employees",
                "description": "Offshore software development agency crafting robust web, desktop and mobile platforms.",
                "logo_url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=128&auto=format&fit=crop&q=80"
            },
            {
                "name": "Kaz Software",
                "industry": "Agile Software & Web Apps",
                "location_name": "Uttara, Dhaka",
                "latitude": 23.8759,
                "longitude": 90.3795,
                "website": "https://kaz.com.bd",
                "size": "100-200 employees",
                "description": "Award-winning software outsourcing firm building web applications for global startups.",
                "logo_url": "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=128&auto=format&fit=crop&q=80"
            },
            {
                "name": "Dynamic Solution Innovators (DSi)",
                "industry": "Enterprise Digital Solutions",
                "location_name": "Mirpur, Dhaka",
                "latitude": 23.8071,
                "longitude": 90.3686,
                "website": "https://dsinnovators.com",
                "size": "200+ employees",
                "description": "Enterprise software consultancy focused on high-concurrency architectures.",
                "logo_url": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=128&auto=format&fit=crop&q=80"
            },
            {
                "name": "Pathao",
                "industry": "Logistics & Consumer Tech",
                "location_name": "Gulshan, Dhaka",
                "latitude": 23.7925,
                "longitude": 90.4178,
                "website": "https://pathao.com",
                "size": "500+ employees",
                "description": "Digital platform moving Bangladesh forward through ride-sharing, food delivery, and payments.",
                "logo_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=128&auto=format&fit=crop&q=80"
            },
            {
                "name": "bKash Tech Hub",
                "industry": "FinTech & Mobile Financial Services",
                "location_name": "Banani, Dhaka",
                "latitude": 23.7937,
                "longitude": 90.4043,
                "website": "https://bkash.com",
                "size": "1000+ employees",
                "description": "Pioneering financial inclusion through real-time mobile transactions.",
                "logo_url": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&auto=format&fit=crop&q=80"
            },
            {
                "name": "ShopUp",
                "industry": "B2B Commerce & Supply Chain",
                "location_name": "Mohakhali, Dhaka",
                "latitude": 23.7776,
                "longitude": 90.4005,
                "website": "https://shopup.com.bd",
                "size": "500+ employees",
                "description": "Full-stack B2B commerce platform powering neighborhood stores with embedded supply.",
                "logo_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=128&auto=format&fit=crop&q=80"
            },
            {
                "name": "Chaldal",
                "industry": "E-Commerce & Warehouse Automation",
                "location_name": "Daffodil Smart City, Savar",
                "latitude": 23.8767,
                "longitude": 90.3204,
                "website": "https://chaldal.com",
                "size": "1000+ employees",
                "description": "Hyper-local grocery delivery platform with state of the art micro-fulfillment technology.",
                "logo_url": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=128&auto=format&fit=crop&q=80"
            },
            {
                "name": "Augmedix Bangladesh",
                "industry": "HealthTech & Ambient AI",
                "location_name": "Banani, Dhaka",
                "latitude": 23.7937,
                "longitude": 90.4043,
                "website": "https://augmedix.com",
                "size": "500+ employees",
                "description": "Ambient medical documentation and natural language clinical intelligence platform.",
                "logo_url": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=128&auto=format&fit=crop&q=80"
            },
            {
                "name": "Intelligent Cloud BD",
                "industry": "DevOps & Cloud Infrastructure",
                "location_name": "Uttara, Dhaka",
                "latitude": 23.8759,
                "longitude": 90.3795,
                "website": "https://cloudbd.io",
                "size": "30-80 employees",
                "description": "Managed cloud architectures, Kubernetes clusters, and Site Reliability Engineering.",
                "logo_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=128&auto=format&fit=crop&q=80"
            }
        ]

        created_companies = []
        for cdata in companies_data:
            comp = Company(**cdata)
            db.add(comp)
            created_companies.append(comp)
        db.commit()

        # 3. Create Recruiters (including demo recruiter for TechNova Labs)
        recruiters_list = []
        demo_recruiter_user = User(
            email="recruiter@technova.io",
            password_hash=default_pwd,
            role=UserRole.RECRUITER,
            is_verified=True,
            is_active=True
        )
        db.add(demo_recruiter_user)
        db.commit()

        demo_recruiter_profile = RecruiterProfile(
            user_id=demo_recruiter_user.id,
            company_id=created_companies[0].id, # TechNova
            full_name="Tanvir Ahmed",
            designation="Head of University Talent & Recruitment",
            phone="+880 1819-123456",
            is_approved=True
        )
        db.add(demo_recruiter_profile)
        recruiters_list.append(demo_recruiter_profile)

        # Additional recruiters for other companies
        other_recruiters = [
            ("Brain Station Talent", "hr@brainstation-23.com", created_companies[1].id),
            ("Therap Recruitment", "hr@therapbd.com", created_companies[2].id),
            ("Enosis People Team", "jobs@enosisbd.com", created_companies[3].id),
            ("DSi Campus Hiring", "campus@dsinnovators.com", created_companies[5].id),
            ("Chaldal Engineering", "tech-hiring@chaldal.com", created_companies[9].id),
        ]
        for name, email, comp_id in other_recruiters:
            u = User(email=email, password_hash=default_pwd, role=UserRole.RECRUITER, is_verified=True, is_active=True)
            db.add(u)
            db.commit()
            rp = RecruiterProfile(user_id=u.id, company_id=comp_id, full_name=name, designation="Talent Lead", is_approved=True)
            db.add(rp)
            recruiters_list.append(rp)
        db.commit()

        # 4. Create 32 Realistic Job Posts
        jobs_templates = [
            # TechNova (Savar)
            {
                "title": "Backend Engineering Intern",
                "comp_idx": 0, "rec_idx": 0, "job_type": "Internship",
                "location_name": "Savar, Dhaka", "latitude": 23.8560, "longitude": 90.2600, "is_remote": False,
                "salary_min": 20000, "salary_max": 28000,
                "required_skills": ["Python", "FastAPI", "PostgreSQL", "Git"],
                "preferred_skills": ["Docker", "Redis", "Linux"],
                "description": "TechNova Labs is looking for a passionate Backend Engineering Intern to join our core backend platform team in Savar near Daffodil Smart City. You will work closely with senior architects to build and deploy high-throughput microservices using FastAPI and PostgreSQL.",
                "requirements": "Strong foundation in Python and object-oriented programming. Hands-on experience developing REST APIs. Knowledge of relational databases like PostgreSQL. Familiarity with Git version control.",
                "responsibilities": "Develop clean, test-driven REST API endpoints using FastAPI. Optimize database queries and schema designs. Write unit tests with Pytest. Participate in daily standups and sprint planning.",
                "experience_level": "Fresh Graduate / Final Year Student",
                "education_level": "BSc in Software Engineering or Computer Science"
            },
            {
                "title": "Junior Full Stack Developer",
                "comp_idx": 0, "rec_idx": 0, "job_type": "Full-time",
                "location_name": "Savar, Dhaka", "latitude": 23.8560, "longitude": 90.2600, "is_remote": False,
                "salary_min": 45000, "salary_max": 65000,
                "required_skills": ["Python", "React", "FastAPI", "Tailwind CSS", "PostgreSQL"],
                "preferred_skills": ["Docker", "TypeScript", "AWS"],
                "description": "Join our fast-paced product engineering team building AI-driven client dashboards and web platforms. You will develop both intuitive frontend views in React and reliable backend endpoints.",
                "requirements": "BSc in CS or SE. Solid command of React hooks, Tailwind CSS, Python, and SQL. Ability to write modular, well-documented code.",
                "responsibilities": "Create reactive, accessible user interfaces. Implement RESTful APIs with authentication. Collaborate with UX designers and QA engineers.",
                "experience_level": "Entry-level / 0-1 Year",
                "education_level": "BSc in Software Engineering or CSE"
            },
            {
                "title": "AI & Machine Learning Intern",
                "comp_idx": 0, "rec_idx": 0, "job_type": "Internship",
                "location_name": "Savar, Dhaka", "latitude": 23.8560, "longitude": 90.2600, "is_remote": True,
                "salary_min": 22000, "salary_max": 30000,
                "required_skills": ["Python", "Scikit-Learn", "Pandas", "NLP", "Machine Learning"],
                "preferred_skills": ["PyTorch", "HuggingFace", "FastAPI"],
                "description": "Work on state-of-the-art NLP document parsing, semantic text embeddings, and intelligent recommendation algorithms for our candidate ranking engine.",
                "requirements": "Solid math and statistics background. Proficiency in Python and Scikit-Learn. Academic project experience in NLP or classification.",
                "responsibilities": "Prepare training datasets and evaluation benchmarks. Implement TF-IDF and vector similarity pipelines. Evaluate model metrics.",
                "experience_level": "University Student / Fresh Graduate",
                "education_level": "BSc in CSE or Data Science"
            },
            # Brain Station 23 (Mohakhali)
            {
                "title": "Software Engineering Trainee (Java / Spring)",
                "comp_idx": 1, "rec_idx": 1, "job_type": "Internship",
                "location_name": "Mohakhali, Dhaka", "latitude": 23.7776, "longitude": 90.4005, "is_remote": False,
                "salary_min": 25000, "salary_max": 32000,
                "required_skills": ["Java", "Spring Boot", "MySQL", "Git"],
                "preferred_skills": ["Docker", "Microservices", "Kafka"],
                "description": "Brain Station 23 is offering its prestigious graduate engineering incubation program. You will be trained in enterprise microservices and deployed into international banking projects.",
                "requirements": "BSc in Computer Science or Software Engineering. Strong grasp of OOP, data structures, and algorithms. Basic knowledge of Spring Boot.",
                "responsibilities": "Participate in structured enterprise training modules. Write robust Java unit tests. Assist in bug fixing and feature enhancements.",
                "experience_level": "Fresh Graduate",
                "education_level": "BSc in CSE / Software Engineering"
            },
            {
                "title": "Frontend React Developer Intern",
                "comp_idx": 1, "rec_idx": 1, "job_type": "Internship",
                "location_name": "Mohakhali, Dhaka", "latitude": 23.7776, "longitude": 90.4005, "is_remote": False,
                "salary_min": 22000, "salary_max": 28000,
                "required_skills": ["React", "JavaScript", "HTML5", "CSS3", "Tailwind CSS"],
                "preferred_skills": ["TypeScript", "Next.js", "Redux"],
                "description": "Build high-performance web applications using modern React, component libraries, and RESTful APIs for fintech and healthcare clients.",
                "requirements": "Strong foundation in modern JavaScript (ES6+), React state management, and semantic HTML.",
                "responsibilities": "Translate Figma designs into responsive React components. Integrate backend endpoints. Ensure cross-browser consistency.",
                "experience_level": "Fresh Graduate / Final Year",
                "education_level": "BSc in Computer Science or IT"
            },
            # Therap BD (Banani)
            {
                "title": "Associate Software Engineer",
                "comp_idx": 2, "rec_idx": 2, "job_type": "Full-time",
                "location_name": "Banani, Dhaka", "latitude": 23.7937, "longitude": 90.4043, "is_remote": False,
                "salary_min": 55000, "salary_max": 75000,
                "required_skills": ["Java", "SQL", "Spring Boot", "Git"],
                "preferred_skills": ["Linux", "Unit Testing", "REST APIs"],
                "description": "Therap BD is hiring enthusiastic problem solvers to build scalable, mission-critical healthcare applications serving thousands of providers across North America.",
                "requirements": "Graduated in Software Engineering or CS with minimum CGPA 3.5. Excellent algorithm and problem-solving skills.",
                "responsibilities": "Develop secure healthcare modules complying with HIPAA. Write complex database queries and procedures. Conduct peer code reviews.",
                "experience_level": "Fresh Graduate / 0-1 Year",
                "education_level": "BSc in Software Engineering or CSE"
            },
            {
                "title": "Quality Assurance & Automation Intern",
                "comp_idx": 2, "rec_idx": 2, "job_type": "Internship",
                "location_name": "Banani, Dhaka", "latitude": 23.7937, "longitude": 90.4043, "is_remote": False,
                "salary_min": 22000, "salary_max": 28000,
                "required_skills": ["Python", "Selenium", "Postman", "Git"],
                "preferred_skills": ["Pytest", "Jira", "CI/CD"],
                "description": "Learn real-world enterprise test automation. Create end-to-end regression suites and automated API tests.",
                "requirements": "Basic programming skill in Python or Java. Understanding of SDLC and STLC concepts.",
                "responsibilities": "Write automated test scripts using Selenium and Pytest. Validate API responses using Postman. Report defects in Jira.",
                "experience_level": "Final Year Student / Fresh Graduate",
                "education_level": "BSc in Engineering or Science"
            },
            # Enosis Solutions (Dhanmondi)
            {
                "title": "Junior Python / Django Developer",
                "comp_idx": 3, "rec_idx": 3, "job_type": "Full-time",
                "location_name": "Dhanmondi, Dhaka", "latitude": 23.7461, "longitude": 90.3742, "is_remote": False,
                "salary_min": 45000, "salary_max": 60000,
                "required_skills": ["Python", "Django", "PostgreSQL", "Git", "REST APIs"],
                "preferred_skills": ["Docker", "Celery", "Redis"],
                "description": "Work with a team of top software engineers building bespoke web systems for Silicon Valley startups. You will design database models and scalable web APIs.",
                "requirements": "Strong Python fundamentals and understanding of Django ORM, authentication, and viewsets.",
                "responsibilities": "Develop backend services with Django REST framework. Optimize SQL queries. Implement third-party integrations.",
                "experience_level": "0-1 Year Experience",
                "education_level": "BSc in Computer Science or CSE"
            },
            {
                "title": "Web Application Security Intern",
                "comp_idx": 3, "rec_idx": 3, "job_type": "Internship",
                "location_name": "Dhanmondi, Dhaka", "latitude": 23.7461, "longitude": 90.3742, "is_remote": True,
                "salary_min": 20000, "salary_max": 26000,
                "required_skills": ["Python", "Linux", "Git", "SQL"],
                "preferred_skills": ["OWASP", "Burp Suite", "Docker"],
                "description": "Participate in application security auditing, vulnerability scanning, and OWASP Top 10 remediation.",
                "requirements": "Knowledge of network protocols, web authentication, and basic penetration testing concepts.",
                "responsibilities": "Audit codebase for injection flaws and authentication bugs. Assist in creating security test checklists.",
                "experience_level": "Final Year Student",
                "education_level": "BSc in Software Engineering or Cybersecurity"
            },
            # Kaz Software (Uttara)
            {
                "title": "Junior Node.js / TypeScript Developer",
                "comp_idx": 4, "rec_idx": 0, "job_type": "Full-time",
                "location_name": "Uttara, Dhaka", "latitude": 23.8759, "longitude": 90.3795, "is_remote": False,
                "salary_min": 45000, "salary_max": 62000,
                "required_skills": ["JavaScript", "TypeScript", "Node.js", "MongoDB", "Git"],
                "preferred_skills": ["Express", "Docker", "GraphQL"],
                "description": "Develop modern server-side applications with Node.js and TypeScript for our international clientele.",
                "requirements": "Strong grasp of asynchronous programming, event loops, and TypeScript interfaces.",
                "responsibilities": "Build scalable REST endpoints. Model schemas in MongoDB. Implement authentication middleware.",
                "experience_level": "Fresh Graduate / 0-1 Year",
                "education_level": "BSc in CSE or equivalent"
            },
            {
                "title": "Frontend Engineer Trainee",
                "comp_idx": 4, "rec_idx": 0, "job_type": "Internship",
                "location_name": "Uttara, Dhaka", "latitude": 23.8759, "longitude": 90.3795, "is_remote": False,
                "salary_min": 20000, "salary_max": 26000,
                "required_skills": ["React", "JavaScript", "HTML5", "CSS3"],
                "preferred_skills": ["Tailwind CSS", "Figma", "Git"],
                "description": "Kickstart your frontend career by building slick interactive user interfaces with modern React and Tailwind CSS.",
                "requirements": "Passion for web design and clean UI code. Experience with React component lifecycles.",
                "responsibilities": "Implement pixel-perfect web pages from Figma designs. Ensure mobile responsiveness.",
                "experience_level": "Fresh Graduate",
                "education_level": "BSc in Software Engineering"
            },
            # Dynamic Solution Innovators (Mirpur)
            {
                "title": "Junior DevOps & Cloud Engineer",
                "comp_idx": 5, "rec_idx": 4, "job_type": "Full-time",
                "location_name": "Mirpur, Dhaka", "latitude": 23.8071, "longitude": 90.3686, "is_remote": False,
                "salary_min": 48000, "salary_max": 65000,
                "required_skills": ["Linux", "Docker", "Git", "Python", "CI/CD"],
                "preferred_skills": ["Kubernetes", "AWS", "Nginx"],
                "description": "Collaborate with developers to automate build pipelines, containerize microservices, and maintain server infrastructure.",
                "requirements": "Hands-on Linux command line experience. Familiarity with Docker containerization and GitHub Actions.",
                "responsibilities": "Configure automated CI/CD deployment pipelines. Monitor server health and container orchestration.",
                "experience_level": "Fresh Graduate / 0-1 Year",
                "education_level": "BSc in Computer Science or Networking"
            },
            {
                "title": "Backend Engineering Intern (Go / Golang)",
                "comp_idx": 5, "rec_idx": 4, "job_type": "Internship",
                "location_name": "Mirpur, Dhaka", "latitude": 23.8071, "longitude": 90.3686, "is_remote": False,
                "salary_min": 24000, "salary_max": 30000,
                "required_skills": ["Go", "Golang", "PostgreSQL", "Git", "REST APIs"],
                "preferred_skills": ["Docker", "Redis", "gRPC"],
                "description": "Join our high-performance systems engineering unit building microservices in Go for telecommunications clients.",
                "requirements": "Understanding of concurrency, goroutines, and channels in Go. Solid grasp of SQL.",
                "responsibilities": "Write lightweight, concurrent microservice endpoints. Benchmark and optimize response times.",
                "experience_level": "Final Year / Fresh Graduate",
                "education_level": "BSc in Computer Science or Software Engineering"
            },
            # Pathao (Gulshan)
            {
                "title": "Mobile App Developer Intern (Flutter)",
                "comp_idx": 6, "rec_idx": 0, "job_type": "Internship",
                "location_name": "Gulshan, Dhaka", "latitude": 23.7925, "longitude": 90.4178, "is_remote": False,
                "salary_min": 25000, "salary_max": 32000,
                "required_skills": ["Flutter", "Dart", "Git", "REST APIs"],
                "preferred_skills": ["Firebase", "State Management", "UI/UX"],
                "description": "Build high-impact cross-platform mobile experiences that touch millions of everyday users across Bangladesh.",
                "requirements": "Proficiency in Flutter framework and Dart programming. Experience building and publishing or demonstrating a Flutter app.",
                "responsibilities": "Build responsive widgets, integrate map APIs and payment SDKs, write smooth animations.",
                "experience_level": "Student / Fresh Graduate",
                "education_level": "BSc in CSE or related discipline"
            },
            {
                "title": "Data Analyst Intern",
                "comp_idx": 6, "rec_idx": 0, "job_type": "Internship",
                "location_name": "Gulshan, Dhaka", "latitude": 23.7925, "longitude": 90.4178, "is_remote": False,
                "salary_min": 22000, "salary_max": 28000,
                "required_skills": ["Python", "SQL", "Pandas", "Power BI", "Data Analysis"],
                "preferred_skills": ["Tableau", "NumPy", "Statistics"],
                "description": "Help extract insights from ride and delivery logs. Design business intelligence dashboards for operational commanders.",
                "requirements": "Exceptional SQL query writing skills. Experience using Pandas for data wrangling and Power BI for reporting.",
                "responsibilities": "Aggregate transactional data, produce weekly cohort analyses, build executive dashboards.",
                "experience_level": "Fresh Graduate",
                "education_level": "BSc in Computer Science, Data Science or Statistics"
            },
            # bKash (Banani)
            {
                "title": "Junior Security Operations Engineer",
                "comp_idx": 7, "rec_idx": 2, "job_type": "Full-time",
                "location_name": "Banani, Dhaka", "latitude": 23.7937, "longitude": 90.4043, "is_remote": False,
                "salary_min": 50000, "salary_max": 70000,
                "required_skills": ["Linux", "Python", "Git", "SQL"],
                "preferred_skills": ["SIEM", "Network Security", "Cloud"],
                "description": "Ensure the highest grade of financial cybersecurity across mobile banking services and API gateways.",
                "requirements": "BSc in CSE with focus on information security. Strong understanding of cryptography and network layers.",
                "responsibilities": "Monitor security event logs, analyze suspicious transactions, implement firewall policies.",
                "experience_level": "0-1 Year Experience",
                "education_level": "BSc in CSE or Information Security"
            },
            # ShopUp (Mohakhali)
            {
                "title": "Associate Product Engineer (React & Node)",
                "comp_idx": 8, "rec_idx": 1, "job_type": "Full-time",
                "location_name": "Mohakhali, Dhaka", "latitude": 23.7776, "longitude": 90.4005, "is_remote": False,
                "salary_min": 45000, "salary_max": 65000,
                "required_skills": ["React", "Node.js", "PostgreSQL", "JavaScript", "Git"],
                "preferred_skills": ["Docker", "TypeScript", "Redis"],
                "description": "Work on the merchant portal, inventory forecasting tools, and distribution systems powering 500,000+ small businesses.",
                "requirements": "Full stack project experience with React and Node.js. Good understanding of database indexing.",
                "responsibilities": "Deliver customer-facing features, fix performance bottlenecks, write clean integration tests.",
                "experience_level": "Fresh Graduate / 0-1 Year",
                "education_level": "BSc in Software Engineering"
            },
            # Chaldal (Daffodil Smart City, Savar)
            {
                "title": "Full Stack Engineering Intern (F# / C# / React)",
                "comp_idx": 9, "rec_idx": 5, "job_type": "Internship",
                "location_name": "Daffodil Smart City, Savar", "latitude": 23.8767, "longitude": 90.3204, "is_remote": False,
                "salary_min": 25000, "salary_max": 35000,
                "required_skills": ["React", "JavaScript", "SQL", "Git"],
                "preferred_skills": ["C#", "Functional Programming", "Docker"],
                "description": "Located right next to Daffodil Smart City campus in Savar! Work on automated warehouse picking algorithms and customer web apps.",
                "requirements": "Passionate about algorithms and functional paradigms. Familiarity with React and SQL databases.",
                "responsibilities": "Build intuitive interfaces for warehouse staff, optimize order matching queries, collaborate on agile deliverables.",
                "experience_level": "Final Year Student / Fresh Graduate",
                "education_level": "BSc in Software Engineering or CSE"
            },
            {
                "title": "Warehouse Systems Software Trainee",
                "comp_idx": 9, "rec_idx": 5, "job_type": "Internship",
                "location_name": "Daffodil Smart City, Savar", "latitude": 23.8767, "longitude": 90.3204, "is_remote": False,
                "salary_min": 22000, "salary_max": 28000,
                "required_skills": ["Python", "SQL", "Git", "REST APIs"],
                "preferred_skills": ["Linux", "IoT", "FastAPI"],
                "description": "Ideal for Daffodil University students! Help manage real-time inventory tracking and IoT sensor integrations at our main fulfillment hub.",
                "requirements": "Hands-on coding experience in Python. Basic understanding of relational database transactions.",
                "responsibilities": "Write diagnostic scripts, monitor sensor data pipelines, assist software maintenance.",
                "experience_level": "University Student",
                "education_level": "BSc in Software Engineering / CSE / EEE"
            },
            # Augmedix (Banani)
            {
                "title": "Junior NLP Software Engineer",
                "comp_idx": 10, "rec_idx": 2, "job_type": "Full-time",
                "location_name": "Banani, Dhaka", "latitude": 23.7937, "longitude": 90.4043, "is_remote": True,
                "salary_min": 50000, "salary_max": 75000,
                "required_skills": ["Python", "NLP", "Machine Learning", "FastAPI", "Git"],
                "preferred_skills": ["PyTorch", "Transformers", "Docker"],
                "description": "Build automated transcription and entity extraction systems for medical doctors using modern speech and NLP models.",
                "requirements": "Strong background in Natural Language Processing, text parsing, and Python web services.",
                "responsibilities": "Integrate LLM summarization endpoints, benchmark parsing accuracy, deploy FastAPI microservices.",
                "experience_level": "Fresh Graduate / 0-1 Year",
                "education_level": "BSc in CSE or Data Science"
            },
            # Intelligent Cloud BD (Uttara)
            {
                "title": "Cloud Infrastructure Trainee",
                "comp_idx": 11, "rec_idx": 0, "job_type": "Internship",
                "location_name": "Uttara, Dhaka", "latitude": 23.8759, "longitude": 90.3795, "is_remote": False,
                "salary_min": 20000, "salary_max": 26000,
                "required_skills": ["Linux", "Docker", "AWS", "Git"],
                "preferred_skills": ["Python", "Terraform", "Nginx"],
                "description": "Learn hands-on AWS cloud deployment, container security, and infrastructure as code.",
                "requirements": "Basic familiarity with Linux servers and AWS management console.",
                "responsibilities": "Assist in provisioning EC2 instances, configuring S3 buckets, writing Dockerfiles.",
                "experience_level": "Final Year / Fresh Graduate",
                "education_level": "BSc in CSE / IT"
            }
        ]

        # Duplicate/expand to reach 30+ jobs with varied categories
        additional_titles = [
            ("Frontend React & Next.js Trainee", ["React", "Next.js", "JavaScript", "Tailwind CSS"], "Dhanmondi, Dhaka", 23.7461, 90.3742, 3),
            ("Junior Database Administrator (PostgreSQL)", ["PostgreSQL", "SQL", "Linux", "Python"], "Mohakhali, Dhaka", 23.7776, 90.4005, 1),
            ("Software Test Automation Associate", ["Python", "Selenium", "Postman", "Pytest"], "Savar, Dhaka", 23.8560, 90.2600, 0),
            ("Junior Flutter Developer", ["Flutter", "Dart", "REST APIs", "Git"], "Uttara, Dhaka", 23.8759, 90.3795, 4),
            ("DevOps CI/CD Intern", ["Docker", "Linux", "Git", "CI/CD"], "Banani, Dhaka", 23.7937, 90.4043, 2),
            ("Data Science & Analytics Trainee", ["Python", "SQL", "Pandas", "Machine Learning"], "Gulshan, Dhaka", 23.7925, 90.4178, 6),
            ("Full Stack MERN Developer", ["React", "Node.js", "MongoDB", "Express"], "Mirpur, Dhaka", 23.8071, 90.3686, 5),
            ("API Integration Specialist", ["Python", "FastAPI", "REST APIs", "SQL"], "Savar, Dhaka", 23.8560, 90.2600, 0),
            ("UI/UX & Frontend Design Intern", ["Figma", "React", "HTML5", "CSS3", "Tailwind CSS"], "Dhanmondi, Dhaka", 23.7461, 90.3742, 3),
            ("Smart Logistics Software Engineer", ["Python", "PostgreSQL", "Docker", "Git"], "Daffodil Smart City, Savar", 23.8767, 90.3204, 9),
            ("Enterprise Java Engineer Intern", ["Java", "Spring Boot", "SQL", "Git"], "Banani, Dhaka", 23.7937, 90.4043, 2),
        ]

        for title, skills, loc, lat, lon, comp_i in additional_titles:
            jobs_templates.append({
                "title": title,
                "comp_idx": comp_i,
                "rec_idx": 0,
                "job_type": "Internship" if "Intern" in title or "Trainee" in title else "Full-time",
                "location_name": loc,
                "latitude": lat,
                "longitude": lon,
                "is_remote": False,
                "salary_min": 22000,
                "salary_max": 35000,
                "required_skills": skills,
                "preferred_skills": ["Git", "Docker"],
                "description": f"Exciting opportunity to build real-world software products at {created_companies[comp_i].name} with a talented engineering team in {loc}.",
                "requirements": f"Proficiency in {', '.join(skills[:3])} and strong CS fundamentals.",
                "responsibilities": "Write clean modular code, participate in sprint ceremonies, troubleshoot issues.",
                "experience_level": "Fresh Graduate",
                "education_level": "BSc in Software Engineering or CSE"
            })

        created_jobs = []
        now = datetime.datetime.utcnow()
        for idx, jt in enumerate(jobs_templates):
            job = Job(
                recruiter_id=recruiters_list[jt.get("rec_idx", 0)].id,
                company_id=created_companies[jt["comp_idx"]].id,
                title=jt["title"],
                description=jt["description"],
                requirements=jt["requirements"],
                responsibilities=jt["responsibilities"],
                job_type=jt["job_type"],
                location_name=jt["location_name"],
                latitude=jt["latitude"],
                longitude=jt["longitude"],
                is_remote=jt["is_remote"],
                salary_min=jt["salary_min"],
                salary_max=jt["salary_max"],
                salary_currency="BDT",
                required_skills=json.dumps(jt["required_skills"]),
                preferred_skills=json.dumps(jt["preferred_skills"]),
                experience_level=jt["experience_level"],
                education_level=jt["education_level"],
                deadline=now + datetime.timedelta(days=20 + (idx % 15)),
                status="ACTIVE",
                created_at=now - datetime.timedelta(days=(idx % 7))
            )
            db.add(job)
            created_jobs.append(job)
        db.commit()

        # 5. Create 20+ Job Seekers (including DEMO USER "Sarah Rahman")
        seekers_specs = [
            # Main Demo Seeker: Sarah Rahman (Savar, Daffodil International University SE graduate)
            {
                "name": "Sarah Rahman",
                "email": "sarah.rahman@jobhub.io",
                "headline": "Junior Software Engineer | Python, FastAPI & React Specialist",
                "phone": "+880 1711-234567",
                "location_name": "Savar, Dhaka",
                "latitude": 23.8560,
                "longitude": 90.2600,
                "alert_radius": 5.0,
                "min_match": 70.0,
                "skills": ["Python", "FastAPI", "PostgreSQL", "React", "Git", "SQL", "Tailwind CSS", "REST APIs"],
                "education": [{
                    "degree": "BSc in Software Engineering",
                    "university": "Daffodil International University",
                    "graduation_year": 2026,
                    "cgpa": 3.82
                }],
                "experience": [{
                    "title": "Software Engineering Intern",
                    "company": "TechNova Labs",
                    "duration": "Jun 2025 - Dec 2025",
                    "description": "Engineered REST APIs with FastAPI and PostgreSQL. Implemented automated Pytest suites and optimized database queries."
                }],
                "projects": [
                    {
                        "title": "AI Semantic Job Matching Portal",
                        "description": "Architected intelligent job recommendation engine using TF-IDF cosine similarity and Haversine distance proximity matching.",
                        "tech_stack": ["Python", "FastAPI", "React", "PostgreSQL"],
                        "link": "https://github.com/sarah-rahman/job-hub"
                    },
                    {
                        "title": "E-Commerce Microservices Engine",
                        "description": "Built distributed checkout and cart endpoints with JWT authentication and Redis caching.",
                        "tech_stack": ["Python", "FastAPI", "Docker", "PostgreSQL"],
                        "link": "https://github.com/sarah-rahman/ecommerce-backend"
                    }
                ],
                "certifications": [
                    {"title": "Meta Certified Front-End Developer", "issuer": "Coursera", "year": 2025},
                    {"title": "PostgreSQL High Performance Fundamentals", "issuer": "DataCamp", "year": 2025}
                ]
            },
            # Other 19+ diverse job seekers
            {
                "name": "Arif Hossain", "email": "arif.hossain@diu.edu.bd",
                "headline": "Full Stack MERN Developer | Daffodil Graduate",
                "location_name": "Savar, Dhaka", "latitude": 23.8560, "longitude": 90.2600,
                "alert_radius": 10.0, "skills": ["React", "Node.js", "Express", "MongoDB", "JavaScript", "Tailwind CSS", "Git"],
                "education": [{"degree": "BSc in CSE", "university": "Daffodil International University", "graduation_year": 2026, "cgpa": 3.70}],
                "experience": [], "projects": [{"title": "Inventory Management Web App", "description": "Full stack MERN portal with real-time stock sync.", "tech_stack": ["React", "Node.js", "MongoDB"], "link": "https://github.com/arif/inventory"}]
            },
            {
                "name": "Nafisa Anjum", "email": "nafisa.anjum@buet.ac.bd",
                "headline": "Junior AI & Data Scientist | BUET CSE",
                "location_name": "Dhanmondi, Dhaka", "latitude": 23.7461, "longitude": 90.3742,
                "alert_radius": 15.0, "skills": ["Python", "Scikit-Learn", "Pandas", "NLP", "Machine Learning", "PyTorch", "SQL"],
                "education": [{"degree": "BSc in CSE", "university": "BUET", "graduation_year": 2025, "cgpa": 3.91}],
                "experience": [], "projects": [{"title": "Bangla Sentiment Classifier", "description": "Trained transformer model on social media corpora.", "tech_stack": ["Python", "PyTorch", "NLP"], "link": "https://github.com/nafisa/bangla-nlp"}]
            },
            {
                "name": "Mahmudul Hasan", "email": "mahmudul@bracu.ac.bd",
                "headline": "Enterprise Java & Spring Boot Developer | BRAC University",
                "location_name": "Mohakhali, Dhaka", "latitude": 23.7776, "longitude": 90.4005,
                "alert_radius": 8.0, "skills": ["Java", "Spring Boot", "MySQL", "Git", "REST APIs", "Docker"],
                "education": [{"degree": "BSc in CSE", "university": "BRAC University", "graduation_year": 2026, "cgpa": 3.65}],
                "experience": [], "projects": [{"title": "Bank Account Microservices", "description": "Spring Boot API for deposits and transfers.", "tech_stack": ["Java", "Spring Boot", "MySQL"], "link": "https://github.com/mahmudul/banking"}]
            },
            {
                "name": "Tasnim Farhana", "email": "tasnim.farhana@northsouth.edu",
                "headline": "Frontend React & UI/UX Developer | NSU Graduate",
                "location_name": "Banani, Dhaka", "latitude": 23.7937, "longitude": 90.4043,
                "alert_radius": 10.0, "skills": ["React", "TypeScript", "Tailwind CSS", "Figma", "Next.js", "HTML5", "CSS3"],
                "education": [{"degree": "BSc in Computer Science", "university": "North South University", "graduation_year": 2026, "cgpa": 3.78}],
                "experience": [], "projects": [{"title": "Fintech Dashboard System", "description": "Interactive chart analytics for crypto payments.", "tech_stack": ["React", "TypeScript", "Tailwind CSS"], "link": "https://github.com/tasnim/dashboard"}]
            },
            {
                "name": "Kazi Tanvir", "email": "kazi.tanvir@diu.edu.bd",
                "headline": "Cloud & DevOps Aspirant | Daffodil International University",
                "location_name": "Savar, Dhaka", "latitude": 23.8560, "longitude": 90.2600,
                "alert_radius": 12.0, "skills": ["Linux", "Docker", "Git", "AWS", "Python", "CI/CD"],
                "education": [{"degree": "BSc in Software Engineering", "university": "Daffodil International University", "graduation_year": 2026, "cgpa": 3.55}],
                "experience": [], "projects": [{"title": "Automated Docker Swarm Deployer", "description": "Scripted pipeline deploying containers with zero downtime.", "tech_stack": ["Linux", "Docker", "Python"], "link": "https://github.com/kazi/devops"}]
            },
            {
                "name": "Sadia Islam", "email": "sadia.islam@aiub.edu",
                "headline": "Junior QA Automation Engineer | AIUB",
                "location_name": "Uttara, Dhaka", "latitude": 23.8759, "longitude": 90.3795,
                "alert_radius": 10.0, "skills": ["Python", "Selenium", "Postman", "Git", "Pytest"],
                "education": [{"degree": "BSc in Software Engineering", "university": "AIUB", "graduation_year": 2026, "cgpa": 3.68}],
                "experience": [], "projects": [{"title": "E-Commerce Test Automation Suite", "description": "End to end automated UI and API regressions.", "tech_stack": ["Selenium", "Python", "Pytest"], "link": "https://github.com/sadia/qa"}]
            },
            {
                "name": "Zubair Ahmed", "email": "zubair.ahmed@diu.edu.bd",
                "headline": "Cross-Platform Mobile App Developer | Flutter & Dart",
                "location_name": "Mirpur, Dhaka", "latitude": 23.8071, "longitude": 90.3686,
                "alert_radius": 15.0, "skills": ["Flutter", "Dart", "Firebase", "Git", "REST APIs"],
                "education": [{"degree": "BSc in CSE", "university": "Daffodil International University", "graduation_year": 2026, "cgpa": 3.62}],
                "experience": [], "projects": [{"title": "Campus Blood Donation App", "description": "Location-aware donor finder with push alerts.", "tech_stack": ["Flutter", "Firebase"], "link": "https://github.com/zubair/blood-finder"}]
            }
        ]

        # Add 12 more seekers programmatically
        names_pool = [
            ("Rashed Karim", "rashed@diu.edu.bd", ["Python", "Django", "PostgreSQL", "Git"], "Savar, Dhaka", 23.8560, 90.2600),
            ("Farzana Haque", "farzana@buet.ac.bd", ["Python", "FastAPI", "React", "Docker"], "Banani, Dhaka", 23.7937, 90.4043),
            ("Imtiaz Ahmed", "imtiaz@bracu.ac.bd", ["JavaScript", "React", "Node.js", "MongoDB"], "Mohakhali, Dhaka", 23.7776, 90.4005),
            ("Nusrat Jahan", "nusrat@nsu.edu", ["Data Analysis", "SQL", "Python", "Power BI"], "Gulshan, Dhaka", 23.7925, 90.4178),
            ("Shakil Mollah", "shakil@diu.edu.bd", ["Python", "FastAPI", "SQL", "Git"], "Daffodil Smart City, Savar", 23.8767, 90.3204),
            ("Mehedi Hasan", "mehedi@aiub.edu", ["Java", "Spring Boot", "MySQL", "Git"], "Mirpur, Dhaka", 23.8071, 90.3686),
            ("Sumaiya Akter", "sumaiya@diu.edu.bd", ["HTML5", "CSS3", "JavaScript", "React"], "Savar, Dhaka", 23.8560, 90.2600),
            ("Tariqul Islam", "tariqul@iut-dhaka.edu", ["Go", "Golang", "PostgreSQL", "Docker"], "Uttara, Dhaka", 23.8759, 90.3795),
            ("Sabrina Sultana", "sabrina@du.ac.bd", ["Python", "Pandas", "Scikit-Learn", "SQL"], "Dhanmondi, Dhaka", 23.7461, 90.3742),
            ("Adnan Sami", "adnan@diu.edu.bd", ["Python", "FastAPI", "PostgreSQL", "React"], "Savar, Dhaka", 23.8560, 90.2600),
            ("Lamia Tabassum", "lamia@nsu.edu", ["UI/UX", "Figma", "React", "CSS3"], "Banani, Dhaka", 23.7937, 90.4043),
            ("Hasan Al Banna", "hasan@diu.edu.bd", ["Linux", "Docker", "Python", "Git"], "Daffodil Smart City, Savar", 23.8767, 90.3204),
        ]

        for n, em, sk, loc, lat, lon in names_pool:
            seekers_specs.append({
                "name": n, "email": em, "headline": f"Junior Software Engineer | {sk[0]} & {sk[1]}",
                "location_name": loc, "latitude": lat, "longitude": lon, "alert_radius": 10.0,
                "skills": sk,
                "education": [{"degree": "BSc in Software Engineering", "university": "Daffodil International University", "graduation_year": 2026, "cgpa": 3.65}],
                "experience": [], "projects": [{"title": f"{n.split()[0]} Portfolio Project", "description": "RESTful web solution with automated testing.", "tech_stack": sk, "link": f"https://github.com/{n.split()[0].lower()}/portfolio"}]
            })

        created_seekers = []
        for sspec in seekers_specs:
            u = User(
                email=sspec["email"],
                password_hash=default_pwd,
                role=UserRole.JOB_SEEKER,
                is_verified=True,
                is_active=True
            )
            db.add(u)
            db.commit()

            pref = NotificationPreference(
                user_id=u.id,
                email_alerts=True,
                in_app_alerts=True,
                min_match_score=sspec.get("min_match", 70.0),
                alert_radius_km=sspec.get("alert_radius", 10.0)
            )
            db.add(pref)

            seeker_prof = JobSeekerProfile(
                user_id=u.id,
                full_name=sspec["name"],
                headline=sspec["headline"],
                phone=sspec.get("phone", "+880 1712-000000"),
                preferred_job_types=json.dumps(["Internship", "Full-time"]),
                preferred_roles=json.dumps(["Software Engineer", "Backend Developer"]),
                preferred_skills=json.dumps(sspec["skills"][:3]),
                preferred_location_name=sspec["location_name"],
                preferred_latitude=sspec["latitude"],
                preferred_longitude=sspec["longitude"],
                alert_radius_km=sspec.get("alert_radius", 10.0),
                min_match_score=sspec.get("min_match", 70.0),
                education=json.dumps(sspec["education"]),
                experience=json.dumps(sspec.get("experience", [])),
                projects=json.dumps(sspec.get("projects", [])),
                certifications=json.dumps(sspec.get("certifications", [])),
                skills=json.dumps(sspec["skills"]),
                resume_url=f"/uploads/seeker_{u.id}_resume.pdf",
                resume_filename=f"{sspec['name'].replace(' ', '_')}_Resume.pdf",
                profile_completed=True
            )
            db.add(seeker_prof)
            created_seekers.append(seeker_prof)
        db.commit()

        # 6. Generate Pre-Calculated Match Records for Sarah Rahman and All Candidates
        sarah = created_seekers[0]
        sarah_dict = {
            "skills": json.loads(sarah.skills),
            "headline": sarah.headline,
            "education": json.loads(sarah.education),
            "experience": json.loads(sarah.experience),
            "projects": json.loads(sarah.projects),
            "preferred_job_types": ["Internship", "Full-time"],
            "preferred_latitude": sarah.preferred_latitude,
            "preferred_longitude": sarah.preferred_longitude,
            "alert_radius_km": sarah.alert_radius_km,
        }

        # Calculate matches for Sarah across all jobs
        for job in created_jobs:
            jdict = {
                "id": job.id, "title": job.title, "description": job.description,
                "requirements": job.requirements, "job_type": job.job_type,
                "location_name": job.location_name, "latitude": job.latitude, "longitude": job.longitude,
                "is_remote": job.is_remote,
                "required_skills": json.loads(job.required_skills),
                "preferred_skills": json.loads(job.preferred_skills)
            }
            mres = compute_hybrid_match(sarah_dict, jdict)
            mr = MatchRecord(
                job_id=job.id,
                seeker_id=sarah.id,
                match_score=mres["match_score"],
                semantic_score=mres["semantic_score"],
                skill_score=mres["skill_score"],
                exp_score=mres["exp_edu_score"],
                loc_score=mres["location_score"],
                matched_skills=json.dumps(mres["matched_skills"]),
                missing_skills=json.dumps(mres["missing_skills"]),
                explanation=json.dumps(mres["explanation"]),
                distance_km=mres["distance_km"],
                is_nearby=mres["is_nearby"]
            )
            db.add(mr)
        db.commit()

        # 7. Create Seed Applications in various states
        # Sarah applies to 4 jobs
        tech_nova_backend_job = created_jobs[0]
        apps_data = [
            (tech_nova_backend_job.id, sarah.id, "SHORTLISTED", 87.5, "Strong candidate for Savar facility."),
            (created_jobs[1].id, sarah.id, "VIEWED", 84.0, "Portfolio reviewed by tech lead."),
            (created_jobs[2].id, sarah.id, "APPLIED", 76.5, None),
            (created_jobs[17].id, sarah.id, "INTERVIEW", 89.0, "Interview scheduled next Tuesday at 11 AM.")
        ]
        
        # Other seekers apply to TechNova Backend Job so recruiter sees ranked candidates
        for s in created_seekers[1:8]:
            s_dict = {
                "skills": json.loads(s.skills), "headline": s.headline, "education": json.loads(s.education),
                "experience": json.loads(s.experience), "projects": json.loads(s.projects),
                "preferred_job_types": ["Internship"], "preferred_latitude": s.preferred_latitude,
                "preferred_longitude": s.preferred_longitude, "alert_radius_km": 10.0
            }
            jdict = {
                "id": tech_nova_backend_job.id, "title": tech_nova_backend_job.title,
                "description": tech_nova_backend_job.description, "requirements": tech_nova_backend_job.requirements,
                "job_type": tech_nova_backend_job.job_type, "location_name": tech_nova_backend_job.location_name,
                "latitude": tech_nova_backend_job.latitude, "longitude": tech_nova_backend_job.longitude,
                "is_remote": tech_nova_backend_job.is_remote,
                "required_skills": json.loads(tech_nova_backend_job.required_skills),
                "preferred_skills": json.loads(tech_nova_backend_job.preferred_skills)
            }
            m = compute_hybrid_match(s_dict, jdict)
            apps_data.append((tech_nova_backend_job.id, s.id, "APPLIED", m["match_score"], None))

        for j_id, s_id, status_val, score, notes in apps_data:
            app = Application(
                job_id=j_id,
                seeker_id=s_id,
                status=status_val,
                match_score=score,
                match_breakdown=json.dumps({"match_score": score}),
                notes=notes,
                cover_note="I am excited about this role and confident my technical skills align with your roadmap.",
                applied_at=now - datetime.timedelta(days=2)
            )
            db.add(app)
        db.commit()

        # 8. Create Realistic Notifications for Sarah
        notifications_data = [
            (
                NotificationType.HIGH_MATCH,
                "New 87% match found",
                "Backend Engineering Intern at TechNova Labs is a strong match for your profile • 3.4 km away.",
                f"/jobs/{tech_nova_backend_job.id}",
                {"job_id": tech_nova_backend_job.id, "match_score": 87.5}
            ),
            (
                NotificationType.SHORTLISTED,
                "You've Been Shortlisted!",
                "Great news! TechNova Labs has shortlisted your profile for Backend Engineering Intern.",
                "/applications",
                {"application_id": 1}
            ),
            (
                NotificationType.JOB_MATCH,
                "Nearby Opportunity Alert",
                "Chaldal posted Full Stack Engineering Intern in Daffodil Smart City, Savar • 2.8 km away.",
                f"/jobs/{created_jobs[17].id}",
                {"job_id": created_jobs[17].id, "match_score": 89.0}
            ),
            (
                NotificationType.MESSAGE,
                "Recruiter Message",
                "Tanvir Ahmed from TechNova Labs sent you a message regarding your Backend Engineering application.",
                "/messages",
                {}
            ),
            (
                NotificationType.APPLICATION_VIEWED,
                "Application Viewed",
                "TechNova Labs reviewed your application for Junior Full Stack Developer.",
                "/applications",
                {}
            ),
            (
                NotificationType.PROFILE_REMINDER,
                "Profile Strength: 87%",
                "Adding Docker or AWS to your projects can boost your match score for 12 target engineering jobs.",
                "/profile",
                {}
            )
        ]

        for ntype, title, msg, link, djson in notifications_data:
            notif = Notification(
                user_id=sarah.user_id,
                type=ntype,
                title=title,
                message=msg,
                link=link,
                data_json=json.dumps(djson),
                is_read=False,
                created_at=now - datetime.timedelta(hours=4)
            )
            db.add(notif)
        db.commit()

        # 9. Create Active Conversation and Messages between Tanvir (TechNova) and Sarah
        conv = Conversation(
            job_id=tech_nova_backend_job.id,
            seeker_id=sarah.id,
            recruiter_id=demo_recruiter_profile.id,
            created_at=now - datetime.timedelta(days=1),
            updated_at=now - datetime.timedelta(minutes=30)
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

        chat_messages = [
            (demo_recruiter_user.id, "Hi Sarah, thank you for applying to TechNova Labs! We reviewed your profile and were really impressed by your FastAPI and semantic search projects."),
            (sarah.user_id, "Hello Tanvir! Thank you so much for getting in touch. I am very enthusiastic about TechNova's engineering culture and high-throughput systems."),
            (demo_recruiter_user.id, "That's great! Since you are located in Savar near Daffodil Smart City, our tech campus is right around the corner. Are you available for a brief technical walkthrough next Tuesday at 11:00 AM?"),
            (sarah.user_id, "Yes, Tuesday at 11:00 AM works perfectly for me! Should I prepare anything specific?"),
            (demo_recruiter_user.id, "Just have your GitHub repositories ready. Looking forward to speaking with you!")
        ]

        for sender_id, text in chat_messages:
            msg = Message(
                conversation_id=conv.id,
                sender_id=sender_id,
                content=text,
                is_read=True,
                created_at=now - datetime.timedelta(minutes=25)
            )
            db.add(msg)
        db.commit()

        print("[SEED] Successfully seeded database!")
        print(f"       Companies: {len(created_companies)}")
        print(f"       Jobs: {len(created_jobs)}")
        print(f"       Seekers: {len(created_seekers)}")
        print(f"       Applications: {len(apps_data)}")
        print(f"       Demo Seeker: sarah.rahman@jobhub.io (password: password123)")
        print(f"       Demo Recruiter: recruiter@technova.io (password: password123)")
        print(f"       Demo Admin: admin@jobhub.io (password: password123)")

    except Exception as e:
        db.rollback()
        print(f"[SEED ERROR]: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
