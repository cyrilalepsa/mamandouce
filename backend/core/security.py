"""
Security utilities for MamanDouce
Authentication, JWT, password hashing
"""
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timezone, timedelta
from typing import Optional

from .config import SECRET_KEY, ALGORITHM
from .database import db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user from JWT token"""
    from models.schemas import User
    
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token invalide")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
    from core.privileges import apply_superadmin_overlay, ensure_superadmin_privileges, is_superadmin_email

    if is_superadmin_email(user.get("email") or email):
        await ensure_superadmin_privileges(user.get("email") or email)
    user = apply_superadmin_overlay(user)
    return User(**user)

async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))):
    """Get current user if authenticated, otherwise return None (for optional auth)"""
    from models.schemas import User
    
    if credentials is None:
        return None
    
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
    
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if user is None:
        return None
    from core.privileges import apply_superadmin_overlay

    user = apply_superadmin_overlay(user)
    return User(**user)

async def get_admin_user(current_user: "User" = Depends(get_current_user)):
    """Verify that the current user is an admin"""
    from core.privileges import is_superadmin_email

    if current_user.role == "admin" or is_superadmin_email(current_user.email):
        return current_user
    raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
