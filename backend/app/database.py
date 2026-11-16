from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Normalize database URL for SQLAlchemy 2.0 (Supabase provides postgres:// or postgresql://)
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

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
    """Initializes all database tables on the configured engine."""
    Base.metadata.create_all(bind=engine)
