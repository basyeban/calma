from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

router = APIRouter(prefix="/api/patient", tags=["Patient Profile"])

@router.get("/profile")
def get_patient_profile(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Mengambil data dari tabel users dan relasi patient_profiles jika ada
    return {
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone_number": current_user.phone_number,
        "birth_date": current_user.birth_date,
    }

@router.put("/profile")
def update_patient_profile(payload: PatientUpdateSchema, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    current_user.full_name = payload.full_name
    current_user.phone_number = payload.phone_number
    current_user.birth_date = payload.birth_date
    db.commit()
    return {"message": "Profil berhasil diperbarui"}