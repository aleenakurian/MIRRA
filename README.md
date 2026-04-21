# MIRRA — Your Life, Intelligently Simplified

MIRRA is a personal assistant designed for women, focused on reducing mental load across work, home, and self. It uses a **living hypothesis profile model** that evolves over time through declared preferences, observed signals, and inferred patterns.

---

## What It Does

- Generates daily personalised recommendations for meals, groceries, and work tasks
- Adapts to each user's context — family load, cycle phase, wearable data, energy levels
- Learns from accept/reject/modify feedback and updates insights over time
- Supports two demo profiles (Aarohi & Naina) plus new user onboarding

---
## Running the App

### Backend

```bash
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload
```

On first startup it automatically seeds Aarohi and Naina's profiles from the seed files.

### Frontend

```bash
cd frontend
npm install
npm run dev
```
---

## User Flow

```
Welcome screen
    ↓
ProfileSelector
    ├── Aarohi / Naina  →  Dashboard (skips onboarding)
    └── Create New
            ↓
        Basic Info (name + job)
            ↓
        ChatOnboarding (5 questions: food, work rhythm, pain point, tone, quiet time)
            ↓
        Permissions screen (smartwatch + Flo cycle app)
            ↓
        POST /profiles/create
            ↓
        Dashboard
```

---

## How Recommendations Work

Each day, three recommendations are generated:

1. **Meal** — uses food preference + cycle phase (fatigue/pain scores) + wearable (sleep, stress) + family constraints (mild for kids, low-salt for elder)
2. **Grocery** — uses meal type + reorder patterns + family-specific items (elder meds, kid snacks)
3. **Work** — uses calendar meeting density + deep work windows + family homework window or Naina's peak focus window

Every recommendation includes a justification with signals used (declared / observed / inferred), explanation text, and confidence score.

---

## Profile Personalisation

### Aarohi Mehta (MIRRA-F-0001)
Married, Mumbai, Senior Program Manager. Has a 7-year-old child and 68-year-old elder parent. High meeting load. Family context drives meal constraints, homework reminders, and dinner time planning.

### Naina Iyer (MIRRA-F-0002)
Single, Bengaluru, Business Analyst transitioning to Data Product. Lives alone, actively interviewing. Recommendations use gentle, non-judgmental tone. Focuses on peak energy windows (11:30–14:30), interview prep, small wins, and avoiding rumination after 21:30.

### New Users
Start with a confidence score of 0.1–0.5 based on onboarding answers. No wearable or cycle data — analysis falls back to safe defaults. Recommendations improve as feedback is collected.

---

## Feedback Loop

When a user clicks Accept / Reject / Modify on a recommendation:

1. `POST /feedback/{profile_id}/recommendation/{reco_id}` saves the action
2. `apply_feedback_logic()` updates `insights_snapshots.json` — increments accepted/rejected/modified counts and adds time saved (15 min per accept, 10 min per modify)
3. `GET /insights/{profile_id}/summary` reads from the snapshot and returns live counts
4. The InsightsCard updates without reloading recommendations (cards stay mounted, buttons stay in accepted/rejected state)

---

LLM integration is stubbed — the app runs fully in mock mode without any API keys.
