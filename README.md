# MIRRA — Your Life, Intelligently Simplified

MIRRA is a GenAI-powered personal assistant designed for women, focused on reducing mental load across work, home, and self. It uses a **living hypothesis profile model** that evolves over time through declared preferences, observed signals, and inferred patterns.

---

## What It Does

- Generates daily personalised recommendations for meals, groceries, and work tasks
- Adapts to each user's context — family load, cycle phase, wearable data, energy levels
- Learns from accept/reject/modify feedback and updates insights over time
- Supports two demo profiles (Aarohi & Naina) plus new user onboarding

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| Backend | Python FastAPI |
| Persistence | JSON files (no database) |
| Styling | Inline styles + CSS |

---

## Project Structure

```
AI-Club/
├── backend/
│   ├── main.py                          # FastAPI app entry point, registers all routers
│   ├── requirements.txt                 # fastapi, uvicorn, pydantic, python-dotenv
│   ├── .env.example                     # LLM config placeholders
│   │
│   ├── routers/
│   │   ├── auth.py                      # POST /auth/register, /auth/login (stub)
│   │   ├── profiles.py                  # GET/POST /profiles — list, create, get, confidence, family, selfcare
│   │   ├── recommendations.py           # POST /recommendations/{profile_id}/today
│   │   ├── feedback.py                  # POST /feedback/{profile_id}/recommendation/{reco_id}
│   │   ├── insights.py                  # GET /insights/{profile_id}/summary
│   │   └── wearables.py                 # GET /wearables/{profile_id}/today
│   │
│   ├── services/
│   │   ├── orchestrator.py              # Routes request → context → recommendations
│   │   ├── context_service.py           # Assembles today's context (profile + calendar + cycle + wearable)
│   │   ├── recommendation_service.py    # Generates meal, grocery, work recommendations with justification
│   │   ├── analysis_service.py          # Analyzes calendar density, cycle phase, wearable signals
│   │   ├── feedback_service.py          # Applies feedback to insights_snapshots.json
│   │   ├── insights_service.py          # Computes accepted/rejected/modified/time_saved
│   │   ├── seed_service.py              # Seeds Aarohi + Naina profiles on first startup
│   │   └── auth_service.py              # Auth helpers (stub)
│   │
│   ├── models/
│   │   └── auth_models.py               # Pydantic models for auth
│   │
│   ├── utils/
│   │   ├── file_store.py                # read_json, write_json_atomic — all JSON persistence
│   │   └── locks.py                     # File-level locking to prevent write corruption
│   │
│   ├── data/
│   │   └── seed/                        # Seed JSON files (do not edit)
│   │       ├── MIRRA-F-0001_Aarohi_Mehta.json
│   │       ├── MIRRA-F-0002_Naina_Iyer.json
│   │       ├── MIRRA-F-0001_week_calendar_cycle_wearable_detailed.json
│   │       └── MIRRA-F-0002_week_calendar_cycle_wearable_detailed.json
│   │
│   └── data_store/                      # Runtime JSON files (auto-created on startup)
│       ├── profiles.json
│       ├── contexts.json
│       ├── feedback.json
│       ├── insights_snapshots.json
│       ├── signals.json
│       ├── recommendations.json
│       ├── users.json
│       ├── sessions.json
│       └── integrations.json
│
└── frontend/
    └── src/
        ├── App.jsx                      # Root — renders Dashboard
        ├── main.jsx                     # Vite entry point
        ├── styles.css                   # Global styles, shimmer, animations
        │
        ├── pages/
        │   └── Dashboard.jsx            # Main page — manages all stages and state
        │
        ├── components/
        │   ├── ProfileSelector.jsx      # Welcome screen — pick Aarohi, Naina, or create new
        │   ├── ChatOnboarding.jsx       # Conversational onboarding for new users + permissions screen
        │   ├── ChatView.jsx             # MIRRA intro message + recommendation summary as chat bubbles
        │   ├── WearableCard.jsx         # Left panel — steps/calories + family card (Aarohi) or selfcare card (Naina)
        │   ├── CyclePhaseCard.jsx       # Cycle phase indicator for seed profiles
        │   ├── RecommendationCard.jsx   # Individual recommendation with Accept/Reject/Modify buttons
        │   ├── InsightsCard.jsx         # "Your Impact" — accepted, rejected, time saved, acceptance rate
        │   └── TomorrowPreview.jsx      # Tomorrow's preview — family events, learning, grocery, interview prep
        │
        └── services/
            └── api.js                   # All axios calls to the backend
```

---

## Running the App

### Backend

```bash
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload
```

Backend runs at `http://127.0.0.1:8000`. On first startup it automatically seeds Aarohi and Naina's profiles from the seed files.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profiles/list` | List all profiles |
| POST | `/profiles/create` | Create a new user profile |
| GET | `/profiles/{id}` | Get a single profile |
| GET | `/profiles/{id}/family` | Get family context (dependents, dinner time, homework) |
| GET | `/profiles/{id}/selfcare` | Get solo-living context (Naina — goals, energy, career) |
| POST | `/recommendations/{id}/today` | Generate today's 3 recommendations |
| POST | `/feedback/{id}/recommendation/{reco_id}` | Submit accept/reject/modify feedback |
| GET | `/insights/{id}/summary` | Get accepted/rejected/time saved counts |
| GET | `/wearables/{id}/today` | Get latest steps and calories |

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

## Key Design Decisions

- **No database** — all state is in JSON files with atomic writes (write to temp → rename) and file-level locks to prevent corruption
- **Profile stays mounted** — feedback refresh only reloads insights, not recommendations, so button states are preserved using a `feedbackStatus` map in Dashboard state
- **Stale closure fix** — `profileRef` (useRef) is used in `refreshAfterFeedback` so it always has the current profile ID even after re-renders
- **Family vs selfcare detection** — backend checks `dependents[]` length to decide whether to return family context (Aarohi) or selfcare/motivation context (Naina). No hardcoded profile IDs.
- **Graceful degradation** — all analysis functions return safe defaults when cycle/wearable data is missing (new users), so recommendations always generate without crashing

---

## Environment Variables

```env
# backend/.env.example
LLM_PROVIDER=openai         # or anthropic, etc.
LLM_API_KEY=your_key_here
LLM_ENDPOINT=https://...
LLM_MODEL=gpt-4
```

LLM integration is stubbed — the app runs fully in mock mode without any API keys.
