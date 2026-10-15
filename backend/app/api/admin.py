import os
import shutil
from uuid import uuid4
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile, Form
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User, UserRole
from app.core.security import get_password_hash

router = APIRouter(prefix="/api/admin", tags=["Admin Control"])

# Directory penyimpanan foto profil dokter
UPLOAD_DIR = "static/uploads/doctors"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_patients = db.query(User).filter(User.role == UserRole.PATIENT).count()
    total_doctors = db.query(User).filter(User.role == UserRole.DOCTOR).count()
    
    return {
        "active_patients": total_patients,
        "verified_doctors": total_doctors,
        "monthly_consultations": 1420,
        "monthly_revenue": "Rp 148.5M"
    }

@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="Cari berdasarkan nama atau email")
):
    """Mengambil seluruh pengguna dari tabel users."""
    query = db.query(User)
    
    if search:
        query = query.filter(
            (User.full_name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )
        
    users = query.order_by(User.id.desc()).all()
    
    result = []
    for user in users:
        role_str = user.role.value if hasattr(user.role, 'value') else str(user.role)
        result.append({
            "id": user.id,
            "full_name": user.full_name or "-",
            "email": user.email,
            "role": role_str,
            "status": "Terverifikasi",
            "created_at": user.created_at.strftime("%d %b %Y") if hasattr(user, "created_at") and user.created_at else "-"
        })
        
    return result

@router.post("/doctors", status_code=status.HTTP_201_CREATED)
async def add_doctor(
    full_name: str = Form(...),
    specialization: str = Form(...),
    sip_number: str = Form(...),
    email: str = Form(...),
    temporary_password: str = Form(...),
    profile_photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # 1. Cek duplikasi email
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email dokter sudah terdaftar."
        )

    # 2. Proses upload gambar jika ada
    photo_url = None
    if profile_photo:
        ext = profile_photo.filename.split(".")[-1].lower()
        if ext not in ["jpg", "jpeg", "png", "webp"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Format file foto harus berupa JPG, PNG, atau WEBP."
            )

        filename = f"{uuid4().hex}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(profile_photo.file, buffer)

        photo_url = f"/static/uploads/doctors/{filename}"

    # 3. Simpan data dokter baru
    new_doctor = User(
        full_name=full_name,
        email=email,
        hashed_password=get_password_hash(temporary_password),
        role=UserRole.DOCTOR,
    )

    try:
        db.add(new_doctor)
        db.commit()
        db.refresh(new_doctor)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal menyimpan data dokter ke database: {str(e)}"
        )

    return {
        "status": "success",
        "message": "Akun dokter berhasil didaftarkan.",
        "doctor_id": new_doctor.id,
        "photo_url": photo_url
    }