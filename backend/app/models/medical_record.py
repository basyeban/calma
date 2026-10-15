# backend/app/models/medical_record.py
import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.session import Base

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    consultation_id = Column(String, ForeignKey("consultations.id"), nullable=False, unique=True)
    chief_complaint = Column(Text, nullable=False)   # Keluhan Utama
    diagnosis = Column(Text, nullable=False)         # Diagnosis / Ringkasan Konsultasi
    treatment_notes = Column(Text, nullable=True)    # Catatan Penanganan
    prescription = Column(Text, nullable=True)       # Resep Obat
    created_at = Column(DateTime(timezone=True), server_default=func.now())