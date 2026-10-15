# backend/app/models/financial.py
import uuid
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.session import Base

class FinancialTransaction(Base):
    __tablename__ = "financial_transactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    consultation_id = Column(String, ForeignKey("consultations.id"), nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False)   # Tarif Total Konsultasi
    platform_fee = Column(Numeric(12, 2), nullable=False)   # Potongan Komisi Platform (misal 20%)
    doctor_payout = Column(Numeric(12, 2), nullable=False)  # Komisi Bersih Dokter (misal 80%)
    status = Column(String(50), default="PAID")
    created_at = Column(DateTime(timezone=True), server_default=func.now())