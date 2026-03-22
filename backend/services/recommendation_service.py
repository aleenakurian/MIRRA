import uuid

def generate_id():
    return str(uuid.uuid4())

def build_base_recommendation(category, title, default, alternatives, explanation):
    return {
        "reco_id": generate_id(),
        "category": category,
        "title": title,
        "default_action": default,
        "alternatives": alternatives[:2],
        "justification": {
            "signals_used": {"declared": [], "observed": [], "inferred": []},
            "explanation_text": explanation,
            "confidence_score": 0.8
        },
        "feedback_required": True
    }

def extract_user_preferences(profile):
    meal_type = "Quick & easy"
    work_style = "Flexible"

    if profile.get("preference_model"):
        food = profile["preference_model"].get("food", {})
        if isinstance(food, dict):
            meal_type = food.get("default_style", meal_type)
            if not meal_type or meal_type == "Quick & easy":
                meal_type = food.get("diet_style", meal_type)
        elif isinstance(food, str) and food:
            meal_type = food

    if profile.get("work_profile"):
        work_style = profile["work_profile"].get("role", work_style)

    declared = profile.get("signals", {}).get("declared", [])
    if declared and isinstance(declared, list):
        first = declared[0]
        if isinstance(first, dict) and "data" in first:
            meal_type = first["data"].get("food", meal_type) or meal_type
            work_style = first["data"].get("work", work_style) or work_style

    return {"meal_type": meal_type, "work_style": work_style}

def extract_family_context(profile):
    household = profile.get("demographics", {}).get("household", {})
    dependents = household.get("dependents", [])
    home = profile.get("home_profile", {})
    rules = home.get("household_rules", {})
    food = profile.get("preference_model", {}).get("food", {})
    family_constraints = food.get("family_constraints", {}) if isinstance(food, dict) else {}

    has_child = any(d.get("type") == "child" for d in dependents)
    has_elder = any(d.get("type") == "elder_parent" for d in dependents)

    return {
        "has_child": has_child,
        "has_elder": has_elder,
        "dinner_time": rules.get("weekday_dinner_time"),
        "homework_window": rules.get("kid_homework_window"),
        "child_flavor": family_constraints.get("child", ""),
        "elder_diet": family_constraints.get("elder", ""),
        "dependents": dependents
    }

def extract_naina_context(profile):
    """Pull solo-living, motivation, and career context"""
    household = profile.get("demographics", {}).get("household", {})
    dependents = household.get("dependents", [])
    if dependents:
        return None  # Only for solo profiles

    self_profile = profile.get("self_profile", {})
    motivation = profile.get("preference_model", {}).get("motivation_profile", {})
    work = profile.get("work_profile", {})
    energy = self_profile.get("energy_patterns", {})

    return {
        "responds_to": motivation.get("responds_to", []),
        "does_not_respond_to": motivation.get("does_not_respond_to", []),
        "reward_style": motivation.get("reward_style", ""),
        "is_interviewing": work.get("current_focus", {}).get("job_search_stage") == "active interviewing",
        "career_goal": work.get("current_focus", {}).get("career_goal", ""),
        "peak_window": energy.get("peak", ""),
        "rumination_window": energy.get("rumination_risk_window", ""),
        "wellbeing": self_profile.get("wellbeing_goals", {})
    }

def meal_recommendation(context, analysis):
    profile = context["profile"]
    prefs = extract_user_preferences(profile)
    family = extract_family_context(profile)
    naina = extract_naina_context(profile)
    meal_type = prefs["meal_type"]

    low_energy = (
        analysis["cycle"].get("low_energy_flag", False)
        or analysis["wearable"].get("low_sleep_flag", False)
        or analysis["wearable"].get("high_stress_flag", False)
    )

    # Family meal note for Aarohi
    family_note = ""
    if family["has_child"] and family["child_flavor"]:
        family_note += f" ({family['child_flavor']} for kids"
        if family["has_elder"] and family["elder_diet"]:
            family_note += f", {family['elder_diet']} for elder)"
        else:
            family_note += ")"
    elif family["has_elder"] and family["elder_diet"]:
        family_note += f" ({family['elder_diet']} for elder)"

    if low_energy:
        if meal_type.lower() in ["quick & easy", "mostly vegetarian", "eggetarian"]:
            default = f"Khichdi / curd rice (15 min, easy digestion){family_note}"
            alt = ["Veg omelette + toast", "Simple dal + rice"]
        elif meal_type.lower() == "healthy":
            default = f"Light quinoa bowl with veggies{family_note}"
            alt = ["Grilled paneer salad", "Smoothie + nuts"]
        else:
            default = f"Comfort dal + rice{family_note}"
            alt = ["Simple sabzi + roti", "Light khichdi"]

        title = f"{meal_type} | Low-effort meal"

        # Naina: gentle tone, no shame
        if naina:
            explanation = "Low energy today — a simple meal is a win 🌸"
            if naina["wellbeing"].get("nutrition"):
                explanation += " (fewer delivery orders = progress!)"
        else:
            explanation = "Low energy detected"
            if family["has_child"] or family["has_elder"]:
                explanation += f" · Family: {family_note.strip('()')}"
    else:
        if meal_type.lower() in ["quick & easy", "mostly vegetarian", "eggetarian"]:
            default = f"Roti + sabzi + dal (balanced){family_note}"
            alt = ["Rice bowl with veggies", "Wrap + yogurt"]
        elif meal_type.lower() == "healthy":
            default = f"Grilled paneer + sautéed veggies{family_note}"
            alt = ["Salad bowl", "Lentil soup + toast"]
        else:
            default = f"Dal, roti, sabzi{family_note}"
            alt = ["Rice + curry", "Stir-fry + carbs"]

        title = f"{meal_type} | Balanced meal"

        if naina:
            explanation = "Steady meal = steady energy. Small win ✨"
        else:
            explanation = "Stable energy today"
            if family["has_child"] or family["has_elder"]:
                explanation += f" · Family: {family_note.strip('()')}"

    if family["dinner_time"]:
        explanation += f" · Dinner at {family['dinner_time']}"

    reco = build_base_recommendation("meal", title, default, alt, explanation)
    reco["justification"]["signals_used"] = {
        "declared": ["food preference", "family constraints"] if not naina else ["food preference", "wellbeing goals"],
        "observed": ["cycle", "sleep", "stress"],
        "inferred": ["energy level"]
    }
    return reco


def grocery_recommendation(context, analysis):
    profile = context["profile"]
    prefs = extract_user_preferences(profile)
    family = extract_family_context(profile)
    naina = extract_naina_context(profile)
    meal_type = prefs["meal_type"]

    title = "Grocery check"
    default = f"Replenish items for {meal_type.lower()} meals"
    alt = ["Order essentials", "Delay by 1-2 days"]

    if naina:
        explanation = "Stocking up = fewer delivery temptations later 🛒"
        if naina["is_interviewing"]:
            explanation += " · Keep easy meals ready for interview days"
    else:
        explanation = "Based on your meal pattern and weekly usage"
        extras = []
        if family["has_elder"]:
            extras.append("elder meds / low-salt staples")
        if family["has_child"]:
            extras.append("mild snacks for kids")
        if extras:
            explanation += f" · Don't forget: {', '.join(extras)}"

    return build_base_recommendation("grocery", title, default, alt, explanation)


def work_recommendation(context, analysis):
    profile = context["profile"]
    prefs = extract_user_preferences(profile)
    family = extract_family_context(profile)
    naina = extract_naina_context(profile)
    work_style = prefs["work_style"]

    heavy_meetings = analysis["calendar"].get("heavy_meeting_day", False)

    if heavy_meetings:
        title = f"{work_style} | Light task focus"
        default = "Handle small tasks + avoid deep work"
        alt = ["Reschedule focus work", "Add buffer time"]
        if naina:
            explanation = "Busy day — protect energy for what matters most 💛"
        else:
            explanation = "High meeting load detected"
    else:
        title = f"{work_style} | Deep work block"
        if naina and naina["peak_window"]:
            default = f"Use {naina['peak_window']} for your most important task"
            alt = ["Batch smaller tasks", "Review learning goals"]
            explanation = f"Peak focus window is {naina['peak_window']} — use it well ⚡"
            if naina["is_interviewing"]:
                explanation += " · Great slot for interview prep"
        else:
            default = "Focus on 1–2 important tasks"
            alt = ["Batch tasks", "Plan ahead"]
            explanation = "Good window for focused work"

    # Aarohi homework reminder
    if not naina and family["has_child"] and family["homework_window"]:
        explanation += f" · Homework window: {family['homework_window']}"

    return build_base_recommendation("work", title, default, alt, explanation)


from services.analysis_service import analyze_calendar, analyze_cycle, analyze_wearable

def generate_recommendations(context):
    calendar_analysis = analyze_calendar(context["calendar_events"])
    cycle_analysis = analyze_cycle(context["cycle_day"])
    wearable_analysis = analyze_wearable(context["wearable_day"])

    analysis = {
        "calendar": calendar_analysis,
        "cycle": cycle_analysis,
        "wearable": wearable_analysis
    }

    return [
        meal_recommendation(context, analysis),
        grocery_recommendation(context, analysis),
        work_recommendation(context, analysis)
    ]
