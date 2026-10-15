from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    specialization = Column(String, nullable=False)
    str_number = Column(String, nullable=False, unique=True)
    consultation_fee = Column(Float, default=150000.0)
    is_verified = Column(Boolean, default=True)

    user = relationship("User", backref="doctor_profile")