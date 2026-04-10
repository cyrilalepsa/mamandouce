from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime, timezone
from core.database import db
from core.security import get_current_user
from models.schemas import User

router = APIRouter(prefix="/user", tags=["user-layout"])

class LayoutItem(BaseModel):
    id: str
    type: str
    category: Optional[str] = None
    expanded: Optional[bool] = False
    size: Optional[str] = None

class LayoutPage(BaseModel):
    id: str
    name: str
    isDefault: bool = False
    theme: Optional[str] = None
    items: List[LayoutItem] = []

class UserLayout(BaseModel):
    pages: List[LayoutPage]
    currentPageIndex: int = 0
    defaultPageId: Optional[str] = None
    version: int = 1

class LayoutRequest(BaseModel):
    layout: UserLayout

# Obtenir le layout de l'utilisateur
@router.get("/layout")
async def get_user_layout(current_user: User = Depends(get_current_user)):
    try:
        user_layout = await db.user_layouts.find_one(
            {"user_email": current_user.email},
            {"_id": 0, "user_email": 0}
        )
        
        if user_layout:
            return {"layout": user_layout.get("layout")}
        
        return {"layout": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Sauvegarder le layout de l'utilisateur
@router.put("/layout")
async def save_user_layout(
    request: LayoutRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        layout_data = {
            "user_email": current_user.email,
            "layout": request.layout.dict(),
            "updated_at": datetime.now(timezone.utc)
        }
        
        result = await db.user_layouts.update_one(
            {"user_email": current_user.email},
            {"$set": layout_data},
            upsert=True
        )
        
        return {"success": True, "message": "Layout sauvegardé"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Supprimer le layout personnalisé (réinitialiser)
@router.delete("/layout")
async def delete_user_layout(current_user: User = Depends(get_current_user)):
    try:
        await db.user_layouts.delete_one({"user_email": current_user.email})
        return {"success": True, "message": "Layout réinitialisé"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
