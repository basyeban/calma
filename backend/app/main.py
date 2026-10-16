import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.admin import router as admin_router
from app.api.doctors import router as doctor_router, doctor_panel_router
from app.api.notifications import router as notification_router

app = FastAPI(
    title="Calma Mental Health API",
    description="Backend API untuk Portal Kesehatan Mental Calma",
    version="1.0.0"
)

# # 1. Buat folder penyimpan file upload foto
# os.makedirs("static/uploads/doctor", exist_ok=True)

# # 2. Mount folder static untuk URL publik
# app.mount("/static", StaticFiles(directory="static"), name="static")

# 3. Konfigurasi CORS Origin
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

# 4. Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. Registrasi Router
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(doctor_router)
app.include_router(doctor_panel_router)
app.include_router(notification_router)

# 6. Root Endpoint Test
@app.get("/", tags=["Root"])
def root():
    return {"message": "API Calma Berjalan dengan Sukses!"}