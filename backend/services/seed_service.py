import json
import os
from utils.file_store import write_json_atomic, read_json

SEED_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "seed")

def load_seed_file(filename):
    with open(os.path.join(SEED_DIR, filename), "r") as f:
        return json.load(f)

def seed_data_if_needed():
    profiles = read_json("profiles.json")

    if profiles:
        return  # already seeded

    print("🌱 Seeding initial profiles...")

    aarohi = load_seed_file("MIRRA-F-0001_Aarohi_Mehta.json")
    naina = load_seed_file("MIRRA-F-0002_Naina_Iyer.json")

    write_json_atomic("profiles.json", [aarohi, naina])

    # store context data
    contexts = [
        {
            "profile_id": "MIRRA-F-0001",
            "data": load_seed_file("MIRRA-F-0001_week_calendar_cycle_wearable_detailed.json")
        },
        {
            "profile_id": "MIRRA-F-0002",
            "data": load_seed_file("MIRRA-F-0002_week_calendar_cycle_wearable_detailed.json")
        }
    ]

    write_json_atomic("contexts.json", contexts)

    # initialize empty stores
    write_json_atomic("users.json", [])
    write_json_atomic("sessions.json", [])
    write_json_atomic("signals.json", [])
    write_json_atomic("feedback.json", [])
    write_json_atomic("recommendations.json", [])
    write_json_atomic("insights_snapshots.json", [])
    write_json_atomic("integrations.json", [])