from fastapi import APIRouter, HTTPException
from models.auth_models import RegisterRequest, LoginRequest, AuthResponse
from services.auth_service import register_user, login_user, social_login_stub

router = APIRouter(prefix="/auth")

@router.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest):
    try:
        register_user(req.email, req.password)
        token = login_user(req.email, req.password)
        return {"token": token}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    try:
        token = login_user(req.email, req.password)
        return {"token": token}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/social-login")
def social(provider: str):
    token = social_login_stub(provider)
    return {"token": token}