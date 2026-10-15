import enum
from sqlalchemy import Column, Integer, String, Date, Enum, DateTime
from sqlalchemy.sql import func
from app.db.session import Base  # Import Base dari session.py

class UserRole(str, enum.Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    birth_date = Column(Date, nullable=True)
    gender = Column(String(50), nullable=True)
    phone_number = Column(String(50), nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(
        Enum(UserRole, native_enum=False, values_callable=lambda x: [e.value for e in x]),
        default=UserRole.PATIENT,
        nullable=False
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())