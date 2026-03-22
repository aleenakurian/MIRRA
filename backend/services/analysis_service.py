def analyze_calendar(events):
    if not events:
        return {
            "meeting_count": 0,
            "high_energy_load": 0,
            "heavy_meeting_day": False
        }
    meeting_count = len(events)
    high_energy_events = [
        e for e in events
        if e.get("meta", {}).get("tags", {}).get("energy_cost") == "high"
    ]
    return {
        "meeting_count": meeting_count,
        "high_energy_load": len(high_energy_events),
        "heavy_meeting_day": meeting_count >= 5 or len(high_energy_events) >= 2
    }

def analyze_cycle(cycle_day):
    if not cycle_day:  # ← new users have no cycle data
        return {
            "phase": "unknown",
            "low_energy_flag": False,
            "symptoms": []
        }
    phase = cycle_day["cycle"]["phase"]
    fatigue = cycle_day["cycle"]["scores"]["fatigue_0_10"]
    pain = cycle_day["cycle"]["scores"]["pain_cramps_0_10"]
    low_energy = fatigue > 6 or pain > 5
    return {
        "phase": phase,
        "low_energy_flag": low_energy,
        "symptoms": cycle_day["cycle"]["symptoms"]
    }

def analyze_wearable(wearable_day):
    if not wearable_day:  # ← new users have no wearable data
        return {
            "sleep_hours": 7,
            "low_sleep_flag": False,
            "readiness": 70,
            "high_stress_flag": False
        }
    sleep = wearable_day["wearable"]["sleep"]["total_hours"]
    readiness = wearable_day["wearable"]["recovery"]["readiness_score_0_100"]
    stress = wearable_day["wearable"]["stress"]["stress_index_0_1"]
    return {
        "sleep_hours": sleep,
        "low_sleep_flag": sleep < 6.5,
        "readiness": readiness,
        "high_stress_flag": stress > 0.7
    }