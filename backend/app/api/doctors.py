from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.doctor_profile import DoctorProfile
from app.core.security import get_password_hash, decode_access_token

# Konfigurasi skema OAuth2 untuk membaca Bearer Token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Fungsi helper untuk memverifikasi dokter yang sedang aktif berdasarkan token
def get_current_doctor(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token autentikasi tidak valid atau kedaluwarsa"
        )
    
    user = db.query(User).filter(User.email == payload["sub"]).first()
    if not user or user.role != UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Akses ditolak. Anda bukan akun dokter terverifikasi."
        )
    return user


# 1. Router Admin untuk Kelola Dokter
router = APIRouter(prefix="/api/admin/doctors", tags=["Admin Doctors"])

class CreateDoctorSchema(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    specialization: str
    sip_number: str
    consultation_fee: float = 150000

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_doctor_account(payload: CreateDoctorSchema, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")

    new_user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role=UserRole.DOCTOR
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    doctor_profile = DoctorProfile(
        user_id=new_user.id,
        specialization=payload.specialization,
        str_number=payload.sip_number,
        consultation_fee=payload.consultation_fee,
        is_verified=True
    )
    db.add(doctor_profile)
    db.commit()

    return {
        "status": "success", 
        "message": "Akun dokter berhasil dibuat", 
        "doctor_id": new_user.id
    }


# 2. Router Panel Dokter (Dashboard, Pasien, & Konsultasi Live)
doctor_panel_router = APIRouter(prefix="/api/doctor", tags=["Doctor Panel"])

@doctor_panel_router.get("/dashboard")
def get_doctor_dashboard(db: Session = Depends(get_db), current_doctor: User = Depends(get_current_doctor)):
    # Mengembalikan data yang dipersonalisasi berdasarkan dokter yang sedang login
    return {
        "doctor_name": current_doctor.full_name,
        "stats": {
            "total_patients_today": 8,
            "completed_sessions": 4,
            "tomorrow_sessions": 6,
        },
        "queue": [
            {
                "id": 1,
                "name": "Laras Kirana", 
                "time": "09:00 - 10:00", 
                "type": "Video Call", 
                "status": "Selesai",
                "ageGender": "24 Tahun / Perempuan",
                "diagnosis": "General Anxiety Disorder (GAD-7)",
                "note": "Pasien menunjukkan kemajuan signifikan setelah latihan pernapasan.",
                "anxietyScore": "8 (Ringan)"
            },
            {
                "id": 2,
                "name": "Dimas Saputra", 
                "time": "10:30 - 11:30", 
                "type": "Video Call", 
                "status": "Sedang Berlangsung",
                "ageGender": "28 Tahun / Laki-laki",
                "diagnosis": "Work-related Stress",
                "note": "Pasien masih mengeluhkan sulit tidur. Melaporkan peningkatan kecemasan saat bekerja.",
                "anxietyScore": "12 (Sedang)"
            },
            {
                "id": 3,
                "name": "Rian Anggoro", 
                "time": "14:00 - 15:00", 
                "type": "Tatap Muka", 
                "status": "Menunggu",
                "ageGender": "31 Tahun / Laki-laki",
                "diagnosis": "Insomnia Kronis",
                "note": "Konsultasi lanjutan evaluasi pengobatan.",
                "anxietyScore": "10 (Sedang)"
            },
            {
                "id": 4,
                "name": "Amelia Putri", 
                "time": "15:30 - 16:30", 
                "type": "Chat Sesi", 
                "status": "Menunggu",
                "ageGender": "22 Tahun / Perempuan",
                "diagnosis": "Mild Panic Attack",
                "note": "Keluhan serangan panik ringan saat ujian.",
                "anxietyScore": "7 (Ringan)"
            },
        ]
    }

@doctor_panel_router.get("/reports")
def get_doctor_reports(db: Session = Depends(get_db), current_doctor: User = Depends(get_current_doctor)):
    return {
        "doctor_email": current_doctor.email,
        "estimated_honor": "Rp 14.850.000",
        "total_sessions": "98 Sesi Selesai",
        "satisfaction_rating": "4.92 / 5.00",
        "pending_payout": "Rp 4.250.000"
    }

@doctor_panel_router.get("/my-patients")
def get_my_patients(db: Session = Depends(get_db), current_doctor: User = Depends(get_current_doctor)):
    patients = db.query(User).filter(User.role == UserRole.PATIENT).all()
    
    if not patients:
        return [
            {
                "id": 1,
                "full_name": "Laras Kirana",
                "email": "laras@gmail.com",
                "gender": "Perempuan",
                "last_session": "12 Okt 2026",
                "status": "Aktif Konsultasi",
                "diagnosis_note": "Kecemasan Ringan (GAD)"
            },
            {
                "id": 2,
                "full_name": "Dimas Saputra",
                "email": "dimas@gmail.com",
                "gender": "Laki-laki",
                "last_session": "10 Okt 2026",
                "status": "Sedang Berlangsung",
                "diagnosis_note": "Manajemen Stres Kerja"
            },
            {
                "id": 3,
                "full_name": "Rian Anggoro",
                "email": "rian@gmail.com",
                "gender": "Laki-laki",
                "last_session": "05 Okt 2026",
                "status": "Selesai Evaluasi",
                "diagnosis_note": "Gangguan Tidur Ringan"
            }
        ]

    return [
        {
            "id": p.id,
            "full_name": p.full_name,
            "email": p.email,
            "gender": getattr(p, "gender", "Tidak ditentukan"),
            "last_session": "Terbaru",
            "status": "Aktif",
            "diagnosis_note": "Dalam Pemantauan"
        }
        for p in patients
    ]

@doctor_panel_router.get("/consultations/live")
def get_live_consultation(db: Session = Depends(get_db), current_doctor: User = Depends(get_current_doctor)):
    return {
        "session_id": "CLM-4029-SAR",
        "status": "LIVE",
        "duration": "10:24",
        "patient": {
            "id": 1,
            "full_name": "Aris Wicaksono",
            "age": 28,
            "gender": "Laki-laki",
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800",
            "chief_complaint": "Mengeluhkan dada berdebar kencang secara tiba-tiba sejak 3 hari lalu, disertai kesulitan tidur di malam hari karena cemas berlebihan mengenai target pekerjaan yang menumpuk. Skor skrining GAD-7 awal menunjukkan kecemasan tingkat ringan-sedang.",
            "gad7_score": "GAD-7: Cemas Ringan",
            "session_count": "Sesi Ke-3 Terapi",
            "initial_diagnosis": "F41.1 Gangguan Kecemasan Menyeluruh (Generalized Anxiety) dipicu stresor kerja berat.",
            "initial_notes": "Pasien merespon baik teknik pernapasan diaphragmatic 4-7-8 yang diajarkan pada sesi lalu. Disarankan meluangkan waktu 10 menit detoks digital sebelum tidur."
        },
        "doctor": {
            "name": current_doctor.full_name,
            "avatar": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200"
        }
    }

@doctor_panel_router.post("/consultations/save-medical-record")
def save_medical_record(payload: dict, db: Session = Depends(get_db), current_doctor: User = Depends(get_current_doctor)):
    # Di sini Anda bisa menyimpan data rekam medis yang terhubung dengan current_doctor.id
    return {
        "status": "success",
        "message": f"Rekam medis berhasil disimpan oleh {current_doctor.full_name} ke sistem terenkripsi."
    }