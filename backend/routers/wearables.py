from fastapi import APIRouter
from utils.file_store import read_json

router = APIRouter(prefix="/wearables")

@router.get("/{profile_id}/today")
def get_today_wearable(profile_id: str):
    contexts = read_json("contexts.json")
    context = next((c["data"] for c in contexts if c["profile_id"] == profile_id), None)

    if not context:
        return {"steps": None, "calories": None, "date": None}

    wearable = context.get("wearable_weekly_daily", {})
    daily = wearable.get("daily", [])

    if not daily:
        return {"steps": None, "calories": None, "date": None}

    # get the latest day
    latest = sorted(daily, key=lambda d: d["date"])[-1]
    activity = latest["wearable"]["activity"]

    return {
        "date": latest["date"],
        "steps": activity["steps"],
        "calories": activity["calories_burned"]
    }