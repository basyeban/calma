from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.db.session import get_db
from app.models.financial import FinancialTransaction

router = APIRouter(prefix="/api/admin/financials", tags=["Admin Financials"])

@router.get("/summary")
def get_financial_summary(db: Session = Depends(get_db)):
    total_revenue = db.query(func.sum(FinancialTransaction.total_amount)).scalar() or 0
    total_platform_fee = db.query(func.sum(FinancialTransaction.platform_fee)).scalar() or 0
    total_doctor_payout = db.query(func.sum(FinancialTransaction.doctor_payout)).scalar() or 0
    total_transactions = db.query(func.count(FinancialTransaction.id)).scalar() or 0

    return {
        "status": "success",
        "data": {
            "total_revenue": total_revenue,
            "platform_commission": total_platform_fee,
            "doctor_payout": total_doctor_payout,
            "total_transactions": total_transactions
        }
    }