"""
Birth List routes for MamanDouce
Handles: Birth list creation, Items management, Sharing
"""
from fastapi import APIRouter, HTTPException, Depends

from core.database import db
from core.security import get_current_user
from models.schemas import User, BirthList, BirthListItem, AddBirthListItemRequest

router = APIRouter(tags=["birth_list"])

@router.get("/birth-list")
async def get_birth_list(current_user: User = Depends(get_current_user)):
    """Get user's birth list"""
    list_doc = await db.birth_lists.find_one(
        {"user_id": current_user.id},
        {"_id": 0}
    )
    return list_doc

@router.post("/birth-list")
async def create_birth_list(current_user: User = Depends(get_current_user)):
    """Create a new birth list for user"""
    existing = await db.birth_lists.find_one({"user_id": current_user.id})
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez déjà une liste de naissance")
    
    birth_list = BirthList(
        user_id=current_user.id,
        items=[]
    )
    
    list_dict = birth_list.model_dump()
    list_dict["created_at"] = list_dict["created_at"].isoformat()
    list_dict["updated_at"] = list_dict["updated_at"].isoformat()
    list_dict["owner_name"] = current_user.name or current_user.email.split('@')[0]
    
    await db.birth_lists.insert_one(list_dict)
    
    return {k: v for k, v in list_dict.items() if k != "_id"}

@router.post("/birth-list/items")
async def add_birth_list_item(item: AddBirthListItemRequest, current_user: User = Depends(get_current_user)):
    """Add item to birth list"""
    list_doc = await db.birth_lists.find_one({"user_id": current_user.id})
    if not list_doc:
        raise HTTPException(status_code=404, detail="Liste non trouvée")
    
    new_item = BirthListItem(
        name=item.name,
        store=item.store,
        url=item.url,
        price=item.price,
        quantity=item.quantity,
        notes=item.notes
    )
    
    await db.birth_lists.update_one(
        {"user_id": current_user.id},
        {"$push": {"items": new_item.model_dump()}}
    )
    
    updated_list = await db.birth_lists.find_one(
        {"user_id": current_user.id},
        {"_id": 0}
    )
    
    return updated_list

@router.delete("/birth-list/items/{item_id}")
async def remove_birth_list_item(item_id: str, current_user: User = Depends(get_current_user)):
    """Remove item from birth list"""
    await db.birth_lists.update_one(
        {"user_id": current_user.id},
        {"$pull": {"items": {"id": item_id}}}
    )
    
    updated_list = await db.birth_lists.find_one(
        {"user_id": current_user.id},
        {"_id": 0}
    )
    
    return updated_list

@router.post("/birth-list/items/{item_id}/toggle")
async def toggle_item_reserved(item_id: str, current_user: User = Depends(get_current_user)):
    """Toggle reserved status of an item (owner)"""
    list_doc = await db.birth_lists.find_one({"user_id": current_user.id})
    if not list_doc:
        raise HTTPException(status_code=404, detail="Liste non trouvée")
    
    items = list_doc.get("items", [])
    for item in items:
        if item.get("id") == item_id:
            item["reserved"] = not item.get("reserved", False)
            break
    
    await db.birth_lists.update_one(
        {"user_id": current_user.id},
        {"$set": {"items": items}}
    )
    
    return {"items": items}

# ==================== PUBLIC SHARED ENDPOINTS ====================

@router.get("/birth-list/shared/{share_id}")
async def get_shared_birth_list(share_id: str):
    """Get shared birth list (public, no auth required)"""
    list_doc = await db.birth_lists.find_one(
        {"share_id": share_id},
        {"_id": 0, "user_id": 0}
    )
    
    if not list_doc:
        raise HTTPException(status_code=404, detail="Liste non trouvée")
    
    return list_doc

@router.post("/birth-list/shared/{share_id}/items/{item_id}/toggle")
async def toggle_shared_item_reserved(share_id: str, item_id: str):
    """Toggle reserved status from shared link (public, no auth required)"""
    list_doc = await db.birth_lists.find_one({"share_id": share_id})
    if not list_doc:
        raise HTTPException(status_code=404, detail="Liste non trouvée")
    
    items = list_doc.get("items", [])
    for item in items:
        if item.get("id") == item_id:
            item["reserved"] = not item.get("reserved", False)
            break
    
    await db.birth_lists.update_one(
        {"share_id": share_id},
        {"$set": {"items": items}}
    )
    
    updated_list = await db.birth_lists.find_one(
        {"share_id": share_id},
        {"_id": 0, "user_id": 0}
    )
    
    return updated_list
