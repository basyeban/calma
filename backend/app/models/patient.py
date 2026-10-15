from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Date, Time
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base

class DailyJournal(Base):
    __tablename__ = "daily_journals"

    id = Column(Integer, primary_primary=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mood = Column(String(50), nullable=False)  # Sedih, Cemas, Biasa, Baik, Senang
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    patient = relationship("User", back_populates="daily_journals")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    booking_date = Column(Date, nullable=False)
    booking_time = Column(Time, nullable=False)
    consultation_type = Column(String(50), default="Video")  # Video, Chat, Offline
    status = Column(String(50), default="Scheduled")  # Scheduled, Completed, Cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    patient = relationship("User", foreign_keys=[patient_id])
    doctor = relationship("User", foreign_keys=[doctor_id])