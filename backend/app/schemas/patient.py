from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime

# Schema Jurnal Harian
class JournalCreate(BaseModel):
    mood: str
    notes: Optional[str] = None

class JournalResponse(BaseModel):
    id: int
    patient_id: int
    mood: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Schema Booking Janji Temu (Appointment)
class AppointmentCreate(BaseModel):
    doctor_id: int
    booking_date: date
    booking_time: str  # Format string "09:00"
    consultation_type: str = "Video"

class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    booking_date: date
    booking_time: time
    consultation_type: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True