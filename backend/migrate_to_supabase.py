"""
JobHub Database Migration & Supabase Initialization Utility
Run this script whenever connecting a new Supabase project or migrating databases.
Usage:
    python backend/migrate_to_supabase.py
    python backend/migrate_to_supabase.py --seed
"""

import sys
import os
import argparse
from sqlalchemy import inspect

# Ensure backend root is on Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.config import settings
from app.models.models import (
    User, Company, RecruiterProfile, JobSeekerProfile, Job,
    Application, MatchRecord, Notification, NotificationPreference,
    Conversation, Message, AdminReport
)

def run_migration(seed: bool = False):
    print("=" * 60)
    print(" JobHub Database Migration & Initialization Tool")
    print("=" * 60)
    
    dialect = engine.dialect.name
    print(f"[*] Target Database Dialect: {dialect.upper()}")
    
    # Hide password in connection string for security
    raw_url = str(engine.url)
    if "@" in raw_url:
        masked_url = raw_url.split("@")[-1]
        print(f"[*] Target Host / Pooler   : ...@{masked_url}")
    else:
        print(f"[*] Target Connection      : {raw_url}")

    if "postgres" in dialect:
        print("[*] Detected Supabase / PostgreSQL database engine.")
    else:
        print("[*] Detected local SQLite database engine.")

    # 1. Create tables
    print("\n[1/3] Generating tables from SQLAlchemy schema...")
    try:
        Base.metadata.create_all(bind=engine)
        print("  -> Schema successfully created or verified.")
    except Exception as e:
        print(f"  [ERROR] Failed to create tables: {e}")
        sys.exit(1)

    # 2. Inspect created tables
    print("\n[2/3] Inspecting active database tables...")
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    for t in sorted(tables):
        print(f"  - Table: {t}")

    print(f"\n[OK] Found {len(tables)} tables verified in the database.")

    # 3. Seed data if requested
    if seed:
        print("\n[3/3] Seeding initial active jobs, companies, and test accounts...")
        try:
            from seed_data import seed_database
            seed_database()
            print("  -> Seed data inserted successfully.")
        except Exception as e:
            print(f"  [WARNING] Seeding encountered an issue: {e}")
    else:
        print("\n[3/3] Table generation complete. (Pass --seed to insert sample jobs & companies).")

    print("\n" + "=" * 60)
    print(" Database setup ready for JobHub!")
    print("=" * 60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate and initialize JobHub database schema.")
    parser.add_argument("--seed", action="store_true", help="Seed sample jobs, companies, and demo users.")
    args = parser.parse_args()
    run_migration(seed=args.seed)
