# backend/app/api/medical_records.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.session import get_db
from app.models.medical_record import MedicalRecord
from app.models.consultation import Consultation, ConsultationStatus

router = APIRouter(prefix="/api/medical-records", tags=["Medical Records"])

class MedicalRecordCreate(BaseModel):
    consultation_id: str
    chief_complaint: str
    diagnosis: str
    treatment_notes: Optional[str] = None
    prescription: Optional[str] = None

@router.post("/", status_code=status.HTTP_201_CREATED)
def save_medical_record(payload: MedicalRecordCreate, db: Session = Depends(get_db)):
    # 1. Cek ketersediaan sesi konsultasi
    consultation = db.query(Consultation).filter(Consultation.id == payload.consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Sesi konsultasi tidak ditemukan")

    # 2. Buat rekam medis baru
    record = MedicalRecord(
        consultation_id=payload.consultation_id,
        chief_complaint=payload.chief_complaint,
        diagnosis=payload.diagnosis,
        treatment_notes=payload.treatment_notes,
        prescription=payload.prescription
    )
    db.add(record)

    # 3. Ubah status sesi menjadi COMPLETED
    consultation.status = ConsultationStatus.COMPLETED

    db.commit()
    db.refresh(record)

    return {"status": "success", "message": "Catatan medis berhasil disimpan", "data": record}

@router.get("/consultation/{consultation_id}")
def get_record_by_consultation(consultation_id: str, db: Session = Depends(get_db)):
    record = db.query(MedicalRecord).filter(MedicalRecord.consultation_id == consultation_id).first()
    if not record:
        return {"status": "success", "data": None}
    return {"status": "success", "data": record}