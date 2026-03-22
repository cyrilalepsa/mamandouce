"""
Favorites sync routes for cloud storage
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime, timezone
from core.database import db
from core.security import get_current_user
from models.schemas import User

router = APIRouter(prefix="/babynames-favorites", tags=["Baby Names Favorites"])

class FavoritesSync(BaseModel):
    favorites: List[str]

class FavoritesResponse(BaseModel):
    favorites: List[str]
    synced_at: str

@router.get("", response_model=FavoritesResponse)
async def get_favorites(current_user: User = Depends(get_current_user)):
    """Get user's synced favorites from cloud"""
    try:
        user_data = await db.users.find_one(
            {"email": current_user.email},
            {"baby_name_favorites": 1, "favorites_synced_at": 1}
        )
        
        favorites = user_data.get("baby_name_favorites", []) if user_data else []
        synced_at = user_data.get("favorites_synced_at", "") if user_data else ""
        
        return {
            "favorites": favorites,
            "synced_at": str(synced_at) if synced_at else ""
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=FavoritesResponse)
async def sync_favorites(
    data: FavoritesSync,
    current_user: User = Depends(get_current_user)
):
    """Sync favorites to cloud storage"""
    try:
        now = datetime.now(timezone.utc)
        
        await db.users.update_one(
            {"email": current_user.email},
            {
                "$set": {
                    "baby_name_favorites": data.favorites,
                    "favorites_synced_at": now
                }
            }
        )
        
        return {
            "favorites": data.favorites,
            "synced_at": now.isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/merge", response_model=FavoritesResponse)
async def merge_favorites(
    data: FavoritesSync,
    current_user: User = Depends(get_current_user)
):
    """Merge local favorites with cloud favorites (union of both)"""
    try:
        user_data = await db.users.find_one(
            {"email": current_user.email},
            {"baby_name_favorites": 1}
        )
        
        cloud_favorites = set(user_data.get("baby_name_favorites", []) if user_data else [])
        local_favorites = set(data.favorites)
        
        # Merge both sets
        merged = list(cloud_favorites.union(local_favorites))
        
        now = datetime.now(timezone.utc)
        
        await db.users.update_one(
            {"email": current_user.email},
            {
                "$set": {
                    "baby_name_favorites": merged,
                    "favorites_synced_at": now
                }
            }
        )
        
        return {
            "favorites": merged,
            "synced_at": now.isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("")
async def clear_favorites(current_user: User = Depends(get_current_user)):
    """Clear all synced favorites"""
    try:
        await db.users.update_one(
            {"email": current_user.email},
            {
                "$set": {
                    "baby_name_favorites": [],
                    "favorites_synced_at": datetime.now(timezone.utc)
                }
            }
        )
        
        return {"message": "Favoris supprimés", "favorites": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
