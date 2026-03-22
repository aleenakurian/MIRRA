from fastapi import APIRouter
from services.insights_service import compute_insights

router = APIRouter(prefix="/insights")

@router.get("/{profile_id}/summary")
def summary(profile_id: str):
    return compute_insights(profile_id)