from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
import json
import os
from services.feedback_service import apply_feedback_logic

router = APIRouter()
import os

# resolves to the actual directory this file (feedback.py) is in
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "..", "data_store", "feedback.json")

class FeedbackRequest(BaseModel):
    action: str  # accept | reject | edit
    edits: dict = {}

def read_data():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def write_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

@router.post("/{profile_id}/recommendation/{reco_id}")
def submit_feedback(profile_id: str, reco_id: str, body: FeedbackRequest):
    data = read_data()

    entry = {
        "profile_id": profile_id,
        "reco_id": reco_id,
        "action": body.action,
        "edits": body.edits,
        "timestamp": datetime.utcnow().isoformat()
    }

    data.append(entry)
    write_data(data)

    # ✅ NEW: trigger system updates
    result = apply_feedback_logic(profile_id, entry)

    return {
        "status": "ok",
        "effect": result
    }