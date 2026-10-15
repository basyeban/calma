from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.screening import MentalScreening
from app.schemas.screening import ScreeningSubmit

router = APIRouter(prefix="/api/screenings", tags=["Screening"])

def calculate_category(score: int) -> tuple[str, str]:
    if score <= 4:
        return "Minimal", "Kondisi emosional Anda relatif stabil. Pertahankan gaya hidup sehat."
    elif score <= 9:
        return "Ringan", "Anda mengalami tingkat stres/gejala ringan. Disarankan untuk relaksasi atau bercerita ke kerabat."
    elif score <= 14:
        return "Sedang", "Indikasi tingkat kecemasan sedang. Sangat disarankan berkonsultasi dengan psikiater/psikolog."
    else:
        return "Berat", "Gejala berat terdeteksi. Disarankan segera menjadwalkan konsultasi dengan profesional medis."

@router.post("/submit", status_code=status.HTTP_201_CREATED)
def submit_screening(payload: ScreeningSubmit, db: Session = Depends(get_db)):
    total_score = sum(ans.score_value for ans in payload.answers)
    category, summary = calculate_category(total_score)

    screening = MentalScreening(
        patient_id=payload.patient_id,
        score=total_score,
        category=category,
        summary=summary
    )
    db.add(screening)
    db.commit()
    db.refresh(screening)

    return {
        "status": "success",
        "data": {
            "id": screening.id,
            "score": total_score,
            "category": category,
            "summary": summary,
            "created_at": str(screening.created_at)
        }
    }

@router.get("/latest/{patient_id}")
def get_latest_screening(patient_id: str, db: Session = Depends(get_db)):
    latest = db.query(MentalScreening).filter(
        MentalScreening.patient_id == patient_id
    ).order_by(MentalScreening.created_at.desc()).first()

    if not latest:
        return {"status": "success", "data": None}
        
    return {"status": "success", "data": latest}