"""
Authentication routes for MamanDouce
Handles: Register, Login, Get current user
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import timedelta

from core.database import db
from core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from core.security import pwd_context, create_access_token, get_current_user
from models.schemas import UserCreate, UserLogin, Token, User

router = APIRouter(tags=["auth"])

@router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user"""
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    hashed_password = pwd_context.hash(user_data.password)
    user = User(email=user_data.email, name=user_data.name)
    user_dict = user.model_dump()
    user_dict["hashed_password"] = hashed_password
    user_dict["created_at"] = user_dict["created_at"].isoformat()
    
    await db.users.insert_one(user_dict)
    
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return Token(access_token=access_token, token_type="bearer")

@router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    """Login user and return JWT token"""
    user = await db.users.find_one({"email": user_data.email})
    if not user:
        raise HTTPException(status_code=400, detail="Email ou mot de passe incorrect")
    
    if not pwd_context.verify(user_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Email ou mot de passe incorrect")
    
    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return Token(access_token=access_token, token_type="bearer")

@router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user"""
    return current_user
