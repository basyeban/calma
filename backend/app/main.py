from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. IMPORT DARI FOLDER YANG TEPAT (sesuai struktur folder backend/app/api/auth.py)
from app.api.auth import router as auth_router
from app.api.admin import router as admin_router


app = FastAPI(title="API Klinik")

origins = [
    "http://localhost:3000",
    "https://calma-app-omega.vercel.app", # Tambahkan domain Vercel Anda di sini
]

# 2. KONFIGURASI CORS (Mengatasi error akses dari http://localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Atau ganti dengan ["http://localhost:3000"] untuk lebih spesifik
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. DAFTARKAN ROUTER
app.include_router(auth_router)
app.include_router(admin_router)

@app.get("/")
def read_root():
    return {"message": "Backend FastAPI Berjalan dengan Baik!"}