from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.consultation import Consultation, ConsultationStatus
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/consultations", tags=["Consultations"])

class ConsultationCreate(BaseModel):
    doctor_id: str
    patient_id: str
    scheduled_at: datetime
    price: float

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_consultation(payload: ConsultationCreate, db: Session = Depends(get_db)):
    code_gen = f"CLM-{int(datetime.now().timestamp())}"
    consultation = Consultation(
        code=code_gen,
        patient_id=payload.patient_id,
        doctor_id=payload.doctor_id,
        scheduled_at=payload.scheduled_at,
        price=payload.price,
        status=ConsultationStatus.SCHEDULED
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)
    return {"status": "success", "data": consultation}

@router.get("/doctor/{doctor_id}/today")
def get_today_queue(doctor_id: str, db: Session = Depends(get_db)):
    # Mengambil antrean hari ini untuk dashboard dokter (PDF Hal. 9)
    items = db.query(Consultation).filter(
        Consultation.doctor_id == doctor_id
    ).all()
    return {"status": "success", "data": items}