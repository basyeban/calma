from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt

from app.db.session import get_db
from app.models.user import User, UserRole
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    SECRET_KEY,
    ALGORITHM,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])


# --- Schemas ---

class RegisterSchema(BaseModel):
    full_name: str
    birth_date: Optional[str] = None  # Format 'YYYY-MM-DD'
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    email: EmailStr
    password: str


class LoginSchema(BaseModel):
    # Mengubah ke str biasa agar tidak error 422 saat menerima username 'admin'
    email: str  
    password: str


class ForgotPasswordSchema(BaseModel):
    email: EmailStr


class ResetPasswordSchema(BaseModel):
    token: str
    new_password: str


# --- Helper Function ---

def create_reset_token(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode = {"sub": email, "exp": expire, "type": "reset_password"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# --- Endpoints ---

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_patient(payload: RegisterSchema, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar. Silakan gunakan email lain atau login."
        )

    parsed_birth_date = None
    if payload.birth_date:
        try:
            parsed_birth_date = datetime.strptime(payload.birth_date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Format tanggal lahir tidak valid. Gunakan format YYYY-MM-DD."
            )

    new_user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        birth_date=parsed_birth_date,
        gender=payload.gender,
        phone_number=payload.phone_number,
        role=UserRole.PATIENT
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Terjadi kesalahan saat menyimpan data pendaftaran: {str(e)}"
        )

    return {
        "status": "success",
        "message": "Registrasi berhasil!",
        "user_id": new_user.id
    }


@router.post("/login")
def login(payload: LoginSchema, db: Session = Depends(get_db)):
    # 1. VERIFIKASI AKUN SUPER ADMIN KHUSUS
    if payload.email == "admin" and payload.password == "adminudb":
        access_token = create_access_token(
            data={"sub": "admin-super-1", "role": "ADMIN"}
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": "ADMIN",
            "full_name": "Budi Santoso"
        }

    # 2. VERIFIKASI USER BIASA DARI DATABASE
    user = db.query(User).filter(User.email == payload.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email/Username atau password salah."
        )

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email/Username atau password salah."
        )

    role_str = user.role.value if hasattr(user.role, 'value') else str(user.role)
    access_token = create_access_token(data={"sub": str(user.id), "role": role_str})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": role_str,
        "full_name": user.full_name
    }


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user:
        return {
            "status": "success",
            "message": "Jika email terdaftar, instruksi reset password telah dikirimkan."
        }

    reset_token = create_reset_token(user.email)
    reset_link = f"http://localhost:3000/reset-password?token={reset_token}"

    print(f"\n==========================================")
    print(f"[RESET PASSWORD] Link untuk {user.email}:")
    print(reset_link)
    print(f"==========================================\n")

    return {
        "status": "success",
        "message": "Instruksi reset password telah dikirimkan ke email Anda."
    }


@router.post("/reset-password")
def reset_password(payload: ResetPasswordSchema, db: Session = Depends(get_db)):
    try:
        decoded_token = jwt.decode(payload.token, SECRET_KEY, algorithms=[ALGORITHM])
        email: Optional[str] = decoded_token.get("sub")
        token_type: Optional[str] = decoded_token.get("type")

        if not email or token_type != "reset_password":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token reset tidak valid."
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Link reset password tidak valid atau sudah kadaluwarsa."
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pengguna tidak ditemukan."
        )

    user.hashed_password = get_password_hash(payload.new_password)
    db.commit()

    return {
        "status": "success",
        "message": "Password berhasil diperbarui! Silakan login kembali."
    }