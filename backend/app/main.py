from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Asumsi struktur folder Anda:
# app/
#  ├── main.py
#  └── api/
#       └── auth.py

# 1. IMPORT DARI FOLDER YANG TEPAT (Pilih salah satu yang sesuai dengan folder Anda)
# Jika auth.py ada di dalam folder app/api:
from app.api.auth import router as auth_router

# ATAU, jika auth.py satu folder (sebelahan) dengan main.py:
# from auth import router as auth_router

app = FastAPI(title="API Klinik")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. DAFTARKAN ROUTER
app.include_router(auth_router)