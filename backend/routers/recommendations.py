from fastapi import APIRouter
from services.orchestrator import handle_today_recommendations
from utils.file_store import read_json, write_json_atomic

router = APIRouter(prefix="/recommendations")


@router.post("/{profile_id}/today")
def get_today(profile_id: str):
    result = handle_today_recommendations(profile_id)

    # store history
    history = read_json("recommendations.json")
    history.append({
        "profile_id": profile_id,
        "date": result["date"],
        "recommendations": result["recommendations"]
    })

    write_json_atomic("recommendations.json", history)

    return result


@router.get("/{profile_id}/history")
def history(profile_id: str):
    data = read_json("recommendations.json")
    return [d for d in data if d["profile_id"] == profile_id]