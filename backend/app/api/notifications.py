from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import os

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

class WhatsAppRequest(BaseModel):
    phone_number: str
    message: str

@router.post("/whatsapp")
def send_whatsapp_notification(data: WhatsAppRequest):
    # Mengambil token dari .env backend atau menggunakan fallback
    fonnte_token = os.getenv("FONNTE_API_TOKEN", "TOKEN_API_WHATSAPP_ANDA")
    
    phone = data.phone_number.strip()
    if phone.startswith("0"):
        phone = "62" + phone[1:]
    elif phone.startswith("+"):
        phone = phone[1:]

    payload = {
        "target": phone,
        "message": data.message,
        "countryCode": "ID",
    }
    
    headers = {
        "Authorization": fonnte_token
    }

    try:
        response = requests.post("https://api.fonnte.com/send", data=payload, headers=headers)
        result = response.json()
        
        if not response.ok or not result.get("status"):
            raise HTTPException(
                status_code=400, 
                detail=result.get("reason", "Gagal mengirim pesan WhatsApp melalui Gateway.")
            )
            
        return {
            "status": "success", 
            "message": "Pesan pengingat WhatsApp berhasil dikirim!",
            "gateway_response": result
        }
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Kesalahan koneksi ke WhatsApp Gateway: {str(e)}")