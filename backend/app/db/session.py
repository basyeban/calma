import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Untuk psycopg3, matikan prepared statements dengan prepare_threshold: None
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args={
        "prepare_threshold": None  # Opsi resmi psycopg3 untuk mematikan prepared statements
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()