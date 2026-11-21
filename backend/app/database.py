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
    from sqlalchemy import event
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
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
    
    is_sqlite = engine.url.drivername.startswith("sqlite")
    boolean_default = "0" if is_sqlite else "FALSE"
    
    statements = [
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_job_seeker_match ON match_records (job_id, seeker_id)",
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_job_seeker_application ON applications (job_id, seeker_id)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_uid VARCHAR(64)" if not is_sqlite else "ALTER TABLE users ADD COLUMN supabase_uid VARCHAR(64)",
        f"ALTER TABLE recruiter_profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT {boolean_default}" if not is_sqlite else f"ALTER TABLE recruiter_profiles ADD COLUMN profile_completed BOOLEAN DEFAULT {boolean_default}",
        "ALTER TABLE recruiter_profiles ADD COLUMN IF NOT EXISTS skills TEXT DEFAULT '[]'" if not is_sqlite else "ALTER TABLE recruiter_profiles ADD COLUMN skills TEXT DEFAULT '[]'",
    ]

    for stmt in statements:
        try:
            with engine.connect() as conn:
                conn.execute(text(stmt))
                conn.commit()
        except Exception:
            pass
