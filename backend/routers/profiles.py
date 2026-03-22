from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from utils.file_store import read_json, write_json_atomic

router = APIRouter(prefix="/profiles")

class NewUserData(BaseModel):
    name: str
    work: str
    food: str = ""
    work_rhythm: str = ""
    pain_point: str = ""
    tone: str = ""
    no_push_after: str = ""

@router.post("/create")
def create_profile(body: NewUserData):
    profiles = read_json("profiles.json")
    profile_id = "USER-" + str(int(datetime.utcnow().timestamp() * 1000))

    filled = sum(1 for f in [body.food, body.work_rhythm, body.pain_point, body.tone, body.no_push_after] if f)
    data_coverage = filled / 5

    new_profile = {
        "profile_id": profile_id,
        "profile_version": "1.0",
        "created_for": body.name,
        "generated_at": datetime.utcnow().isoformat(),
        "confidence": {
            "overall": round(0.1 + data_coverage * 0.4, 2),
            "breakdown": {
                "declared": round(data_coverage, 2),
                "observed": 0.0,
                "inferred": 0.0,
                "stability_index_90d": 0.0,
                "data_coverage": round(data_coverage, 2)
            }
        },
        "demographics": { "name_alias": body.name },
        "work_profile": { "role": body.work },
        "preference_model": { "food": body.food },
        "tone_contract": {
            "default_tone": body.tone or "warm",
            "format": { "max_options": 3, "always_provide_default": True }
        },
        "signals": {
            "declared": [
                {
                    "timestamp": datetime.utcnow().isoformat(),
                    "data": {
                        "name": body.name, "work": body.work, "food": body.food,
                        "work_rhythm": body.work_rhythm, "pain_point": body.pain_point,
                        "tone": body.tone, "no_push_after": body.no_push_after
                    }
                }
            ],
            "observed": [],
            "inferred": []
        }
    }

    profiles.append(new_profile)
    write_json_atomic("profiles.json", profiles)
    return {"profile_id": profile_id, "confidence": new_profile["confidence"]}


@router.get("/list")
def list_profiles():
    return read_json("profiles.json")


@router.get("/{profile_id}")
def get_profile(profile_id: str):
    profiles = read_json("profiles.json")
    return next((p for p in profiles if p["profile_id"] == profile_id), None)


@router.get("/{profile_id}/confidence")
def get_confidence(profile_id: str):
    profiles = read_json("profiles.json")
    profile = next((p for p in profiles if p["profile_id"] == profile_id), None)
    return profile.get("confidence", {})


@router.get("/{profile_id}/family")
def get_family(profile_id: str):
    """Returns family context for Aarohi-style profiles with dependents"""
    profiles = read_json("profiles.json")
    profile = next((p for p in profiles if p["profile_id"] == profile_id), None)
    if not profile:
        return {"dependents": [], "household_rules": {}, "no_push_after": None}

    demographics = profile.get("demographics", {})
    household = demographics.get("household", {})
    dependents = household.get("dependents", [])
    home = profile.get("home_profile", {})
    household_rules = home.get("household_rules", {})
    privacy = profile.get("privacy_preferences", {})
    no_push_after = privacy.get("sensitivity_flags", {}).get("no_push_after")
    food = profile.get("preference_model", {}).get("food", {})
    family_constraints = food.get("family_constraints", {}) if isinstance(food, dict) else {}

    return {
        "dependents": dependents,
        "household_rules": household_rules,
        "no_push_after": no_push_after,
        "family_constraints": family_constraints
    }


@router.get("/{profile_id}/selfcare")
def get_selfcare(profile_id: str):
    """Returns Naina-style solo living context: wellbeing goals, energy patterns, motivation, career focus"""
    profiles = read_json("profiles.json")
    profile = next((p for p in profiles if p["profile_id"] == profile_id), None)
    if not profile:
        return {}

    self_profile = profile.get("self_profile", {})
    wellbeing = self_profile.get("wellbeing_goals", {})
    energy = self_profile.get("energy_patterns", {})
    stress = self_profile.get("stress_and_recovery", {})
    motivation = profile.get("preference_model", {}).get("motivation_profile", {})
    work = profile.get("work_profile", {})
    current_focus = work.get("current_focus", {})
    household = profile.get("demographics", {}).get("household", {})
    living_setup = household.get("living_setup", "")
    dependents = household.get("dependents", [])

    # Only return selfcare data for solo/no-dependent profiles
    if dependents:
        return {}

    return {
        "living_setup": living_setup,
        "wellbeing_goals": wellbeing,
        "energy_patterns": {
            "peak": energy.get("peak"),
            "dip": energy.get("dip"),
            "rumination_risk_window": energy.get("rumination_risk_window")
        },
        "stress_recovery": stress.get("recovery_actions_that_work", []),
        "stress_signals": stress.get("early_signals", []),
        "motivation": motivation,
        "current_focus": current_focus
    }
