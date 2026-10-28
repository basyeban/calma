from sqlalchemy import Column, Integer, String, Date, Enum as SQLEnum
import enum
from app.db.session import Base

# Definisikan peran (Role) pengguna di sistem
class UserRole(str, enum.Enum):
    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"
    ADMIN = "ADMIN"

# Model tabel User untuk database
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)  # Wajib ada agar auth.py bisa menyimpannya
    birth_date = Column(Date, nullable=True)
    gender = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    
    role = Column(SQLEnum(UserRole), default=UserRole.PATIENT, nullable=False)