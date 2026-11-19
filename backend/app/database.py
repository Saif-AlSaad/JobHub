from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Normalize database URL for SQLAlchemy 2.0 (Supabase provides postgres:// or postgresql://)
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

# Auto-strip literal brackets or encode password if present
if ":[" in db_url and "]@" in db_url:
    import urllib.parse
    start_idx = db_url.find(":[")
    end_idx = db_url.find("]@", start_idx)
    raw_pwd = db_url[start_idx + 2 : end_idx]
    encoded_pwd = urllib.parse.quote_plus(raw_pwd)
    db_url = db_url[:start_idx + 1] + encoded_pwd + db_url[end_idx + 1:]

# Production-ready Engine Configuration
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine = create_engine(
        db_url,
        connect_args=connect_args,
        pool_pre_ping=True
    )
else:
    # Supabase PostgreSQL (Supports direct port 5432 and Transaction Pooler port 6543)
    engine = create_engine(
        db_url,
        pool_size=10,
        max_overflow=20,
        pool_recycle=300,
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes all database tables and ensures critical unique indexes on the configured engine."""
    Base.metadata.create_all(bind=engine)
    from sqlalchemy import text
    with engine.begin() as conn:
        try:
            conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS uq_job_seeker_match ON match_records (job_id, seeker_id)"))
        except Exception:
            pass
        try:
            conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS uq_job_seeker_application ON applications (job_id, seeker_id)"))
        except Exception:
            pass
