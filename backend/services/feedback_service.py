import json
import os

BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data_store")
INSIGHTS_FILE = os.path.join(BASE_DIR, "insights_snapshots.json")

def read_json(path):
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        return json.load(f)

def write_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

# rest of your code stays exactly the same

def apply_feedback_logic(profile_id, entry):
    action = entry["action"]

    insights = read_json(INSIGHTS_FILE)

    # find or create profile stats
    profile_stats = next((i for i in insights if i["profile_id"] == profile_id), None)

    if not profile_stats:
        profile_stats = {
            "profile_id": profile_id,
            "accepted": 0,
            "rejected": 0,
            "modified": 0,
            "time_saved_minutes": 0
        }
        insights.append(profile_stats)

    # ✅ APPLY EFFECTS
    if action == "accept":
        profile_stats["accepted"] += 1
        profile_stats["time_saved_minutes"] += 15  # simple heuristic

    elif action == "reject":
        profile_stats["rejected"] += 1

    elif action == "modify":
        profile_stats["modified"] += 1
        profile_stats["time_saved_minutes"] += 10

    write_json(INSIGHTS_FILE, insights)
    print("UPDATED STATS:", profile_stats)
    return profile_stats