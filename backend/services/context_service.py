import datetime
from utils.file_store import read_json

def get_profile(profile_id):
    profiles = read_json("profiles.json")
    return next((p for p in profiles if p["profile_id"] == profile_id), None)

def get_context_data(profile_id):
    contexts = read_json("contexts.json")
    return next((c["data"] for c in contexts if c["profile_id"] == profile_id), None)

def get_latest_date(wearable_data):
    dates = [d["date"] for d in wearable_data["daily"]]
    return max(dates)

def get_today_context(profile_id):
    profile = get_profile(profile_id)
    context_data = get_context_data(profile_id)
    today = datetime.date.today().isoformat()

    # ← new users won't have context data, use empty defaults
    if not context_data:
        return {
            "date": today,
            "profile": profile,
            "calendar_events": [],
            "cycle_day": None,
            "wearable_day": None
        }

    wearable = context_data.get("wearable_weekly_daily")
    calendar = context_data.get("work_calendar_week_detailed")
    cycle = context_data.get("menstrual_cycle_month_detailed")

    # use latest available date from wearable if present, else today
    if wearable and wearable.get("daily"):
        today = get_latest_date(wearable)

    wearable_today = None
    if wearable:
        wearable_today = next((d for d in wearable["daily"] if d["date"] == today), None)

    cycle_today = None
    if cycle:
        cycle_today = next((d for d in cycle["daily"] if d["date"] == today), None)

    events_today = []
    if calendar:
        events_today = [e for e in calendar["events"] if e["start"].startswith(today)]

    return {
        "date": today,
        "profile": profile,
        "calendar_events": events_today,
        "cycle_day": cycle_today,
        "wearable_day": wearable_today
    }