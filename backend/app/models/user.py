from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

# Sesuaikan path import ini dengan struktur folder project Anda
from app.db.session import get_db

# Asumsi Anda memiliki file security.py untuk mengurus hashing password
# Jika belum ada, Anda bisa menggunakan library passlib (contoh di bawah)
from app.utils.security import get_password_hash 

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# --- SKEMA REQUEST PYDANTIC ---
class ForgotPasswordSchema(BaseModel):
    email: EmailStr

class ResetPasswordSchema(BaseModel):
    email: EmailStr
    new_password: str

# --- ENDPOINT API ---

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordSchema, db: Session = Depends(get_db)):
    # 1. Cek apakah email terdaftar di database
    user = db.query(User).filter(User.email == data.email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Email tidak terdaftar.")
    
    # 2. Opsional: Generate token reset password dan kirim ke email user di sini
    
    return {"message": "Email terverifikasi. Silakan masukkan kata sandi baru."}


@router.post("/reset-password")
def reset_password(data: ResetPasswordSchema, db: Session = Depends(get_db)):
    # 1. Cari user berdasarkan email
    user = db.query(User).filter(User.email == data.email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Akun dengan email tersebut tidak ditemukan.")

    # 2. Hash password baru
    hashed_password_baru = get_password_hash(data.new_password)

    # 3. Update password di database MENGGUNAKAN KOLOM hashed_password
    user.hashed_password = hashed_password_baru
    
    # 4. Simpan perubahan ke database
    db.commit()
    db.refresh(user) # Memastikan data di objek user sinkron dengan database

    return {"message": "Kata sandi berhasil diperbarui! Silakan login."}