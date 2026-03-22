from utils.file_store import read_json

def compute_insights(profile_id):
    feedback = read_json("feedback.json")
    user_feedback = [f for f in feedback if f["profile_id"] == profile_id]

    accepted = len([f for f in user_feedback if f["action"] == "accept"])
    rejected = len([f for f in user_feedback if f["action"] == "reject"])
    modified = len([f for f in user_feedback if f["action"] == "modify"])

    return {
        "accepted": accepted,
        "rejected": rejected,
        "modified": modified,
        "time_saved_minutes": (accepted * 15) + (modified * 10),
    }