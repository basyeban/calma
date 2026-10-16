import os
import firebase_admin
from firebase_admin import credentials, db

if not firebase_admin._apps:
    cred = credentials.Certificate(
        os.environ["FIREBASE_SERVICE_ACCOUNT_PATH"]
    )

    firebase_admin.initialize_app(
        cred,
        {
            "databaseURL": (
                "https://calma-app-48ab1-default-rtdb."
                "asia-southeast1.firebasedatabase.app"
            )
        },
    )

def save_consultation(consultation_id: str, data: dict):
    ref = db.reference(f"consultations/{consultation_id}")
    ref.set(data)