# backend/app/models/screening.py
import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.session import Base

class MentalScreening(Base):
    __tablename__ = "mental_screenings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False)  # Minimal, Ringan, Sedang, Berat
    summary = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())