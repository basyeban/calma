# backend/app/schemas/screening.py
from pydantic import BaseModel
from typing import List

class QuizAnswer(BaseModel):
    question_id: int
    score_value: int # Skor 0 - 3 per pertanyaan

class ScreeningSubmit(BaseModel):
    patient_id: str
    answers: List[QuizAnswer]

class ScreeningResponse(BaseModel):
    id: str
    score: int
    category: str
    summary: str
    created_at: str

    class Config:
        from_attributes = True