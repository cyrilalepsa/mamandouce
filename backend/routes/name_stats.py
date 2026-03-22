"""
Baby Names Statistics routes
Tracks views and provides popularity statistics
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from core.database import db
from core.security import get_current_user_optional
from models.schemas import User

router = APIRouter(prefix="/babynames-stats", tags=["Baby Names Statistics"])

class NameView(BaseModel):
    name: str
    country: str
    gender: str

class NameStat(BaseModel):
    name: str
    country: str
    gender: str
    views: int
    country_flag: Optional[str] = None
    country_name: Optional[str] = None

class StatsResponse(BaseModel):
    top_girls: List[NameStat]
    top_boys: List[NameStat]
    total_views: int

# Country flags mapping
COUNTRY_FLAGS = {
    'FR': ('🇫🇷', 'France'), 'ES': ('🇪🇸', 'Espagne'), 'IT': ('🇮🇹', 'Italie'),
    'DE': ('🇩🇪', 'Allemagne'), 'GB': ('🇬🇧', 'Royaume-Uni'), 'US': ('🇺🇸', 'États-Unis'),
    'PT': ('🇵🇹', 'Portugal'), 'BR': ('🇧🇷', 'Brésil'), 'CA': ('🇨🇦', 'Canada'),
    'MX': ('🇲🇽', 'Mexique'), 'AR': ('🇦🇷', 'Argentine'), 'JP': ('🇯🇵', 'Japon'),
    'MA': ('🇲🇦', 'Maroc'), 'BE': ('🇧🇪', 'Belgique'), 'CH': ('🇨🇭', 'Suisse'),
}

@router.post("/view")
async def track_name_view(data: NameView, request: Request, current_user: Optional[User] = Depends(get_current_user_optional)):
    """Track when a user views/expands a name - 1 view per user per name (unique)"""
    try:
        # Determine unique viewer identifier
        if current_user:
            viewer_id = current_user.email
        else:
            # For non-logged users, use IP + session-like identifier
            client_ip = request.client.host if request.client else "unknown"
            viewer_id = f"anon_{client_ip}"
        
        # Create unique key for this viewer + name combination
        unique_key = f"{viewer_id}_{data.name}_{data.country}_{data.gender}"
        
        # Check if this viewer has already viewed this name
        existing_view = await db.name_views_unique.find_one({"unique_key": unique_key})
        
        if existing_view:
            # Already viewed - don't count again
            return {"success": True, "counted": False, "message": "Already viewed"}
        
        # Record this unique view
        await db.name_views_unique.insert_one({
            "unique_key": unique_key,
            "viewer_id": viewer_id,
            "name": data.name,
            "country": data.country,
            "gender": data.gender,
            "viewed_at": datetime.now(timezone.utc)
        })
        
        # Increment the global view count
        await db.name_stats.update_one(
            {
                "name": data.name,
                "country": data.country,
                "gender": data.gender
            },
            {
                "$inc": {"views": 1},
                "$set": {"last_viewed": datetime.now(timezone.utc)},
                "$setOnInsert": {"created_at": datetime.now(timezone.utc)}
            },
            upsert=True
        )
        
        return {"success": True, "counted": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top", response_model=StatsResponse)
async def get_top_names(limit: int = 10):
    """Get top viewed names by gender"""
    try:
        # Get top girls names
        top_girls_cursor = db.name_stats.find(
            {"gender": "girls"}
        ).sort("views", -1).limit(limit)
        
        top_girls = []
        async for doc in top_girls_cursor:
            flag_info = COUNTRY_FLAGS.get(doc["country"], ('🌍', doc["country"]))
            top_girls.append(NameStat(
                name=doc["name"],
                country=doc["country"],
                gender=doc["gender"],
                views=doc["views"],
                country_flag=flag_info[0],
                country_name=flag_info[1]
            ))
        
        # Get top boys names
        top_boys_cursor = db.name_stats.find(
            {"gender": "boys"}
        ).sort("views", -1).limit(limit)
        
        top_boys = []
        async for doc in top_boys_cursor:
            flag_info = COUNTRY_FLAGS.get(doc["country"], ('🌍', doc["country"]))
            top_boys.append(NameStat(
                name=doc["name"],
                country=doc["country"],
                gender=doc["gender"],
                views=doc["views"],
                country_flag=flag_info[0],
                country_name=flag_info[1]
            ))
        
        # Get total views
        pipeline = [{"$group": {"_id": None, "total": {"$sum": "$views"}}}]
        total_result = await db.name_stats.aggregate(pipeline).to_list(1)
        total_views = total_result[0]["total"] if total_result else 0
        
        return StatsResponse(
            top_girls=top_girls,
            top_boys=top_boys,
            total_views=total_views
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trending")
async def get_trending_names(days: int = 7, limit: int = 5):
    """Get trending names from the last X days"""
    try:
        from datetime import timedelta
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        
        # Find names viewed recently, sorted by views
        cursor = db.name_stats.find(
            {"last_viewed": {"$gte": cutoff}}
        ).sort("views", -1).limit(limit)
        
        trending = []
        async for doc in cursor:
            flag_info = COUNTRY_FLAGS.get(doc["country"], ('🌍', doc["country"]))
            trending.append({
                "name": doc["name"],
                "country": doc["country"],
                "country_flag": flag_info[0],
                "gender": doc["gender"],
                "views": doc["views"]
            })
        
        return {"trending": trending, "period_days": days}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
