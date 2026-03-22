from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from utils.file_store import ensure_data_store
from services.seed_service import seed_data_if_needed
from routers import auth

app = FastAPI(title="MIRRA Backend")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    ensure_data_store()
    seed_data_if_needed()

app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "MIRRA backend running 💖"}


from routers import auth, profiles, recommendations, feedback, insights
from routers import feedback
from routers import wearables
app.include_router(wearables.router)
app.include_router(feedback.router, prefix="/feedback")
app.include_router(profiles.router)
app.include_router(recommendations.router)
app.include_router(feedback.router)
app.include_router(insights.router)