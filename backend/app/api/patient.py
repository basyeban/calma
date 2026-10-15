from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import time

from app.db.session import get_db
from app.models.patient import DailyJournal, Appointment
from app.schemas.patient import JournalCreate, JournalResponse, AppointmentCreate, AppointmentResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/api/patient", tags=["Patient Portal"])

@router.get("/dashboard")
def get_patient_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Mengambil data chart GAD-7, catatan psikiater, dan quote harian."""
    return {
        "gad7_chart": [
            {"week": "Min 1", "score": 12},
            {"week": "Min 2", "score": 14},
            {"week": "Min 3", "score": 10},
            {"week": "Min 4", "score": 11},
            {"week": "Min 5", "score": 8},
            {"week": "Min 6", "score": 8},
        ],
        "psychiatrist_note": "Dr. Adrian menyebutkan kemajuan Anda sangat baik. Tetap pertahankan rutinitas meditasi 10 menit pagi hari.",
        "daily_quote": "Kesehatan mental bukanlah tujuan akhir, melainkan perjalanan bagaimana Anda belajar menyayangi diri sendiri di sepanjang jalan."
    }

@router.post("/journal", response_model=JournalResponse)
def create_journal(
    payload: JournalCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Menyimpan entri jurnal harian pasien."""
    new_entry = DailyJournal(
        patient_id=current_user["id"],
        mood=payload.mood,
        notes=payload.notes
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

@router.post("/appointment", response_model=AppointmentResponse)
def book_appointment(
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Membuat janji temu baru dengan dokter."""
    try:
        t_hour, t_min = map(int, payload.booking_time.split(":"))
        appointment_time = time(t_hour, t_min)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format waktu tidak valid. Gunakan format HH:MM"
        )

    new_app = Appointment(
        patient_id=current_user["id"],
        doctor_id=payload.doctor_id,
        booking_date=payload.booking_date,
        booking_time=appointment_time,
        consultation_type=payload.consultation_type
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app