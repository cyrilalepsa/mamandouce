"""
Food routes for MamanDouce
Handles: Barcode scan, Food search, Food library, User-added foods, Favorites
"""
from fastapi import APIRouter, File, Form, HTTPException, Depends, UploadFile
from typing import Optional
from datetime import datetime, timezone
import base64
import httpx
import logging

from core.database import db
from core.security import get_current_user
from models.schemas import User, UserAddedFood, AddFoodRequest, Favorite, AddFavoriteRequest

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/food", tags=["food"])

# Import food database
from data.food_database import FOOD_SAFETY_DATABASE as FOOD_DATABASE

async def get_food_safety_database():
    """Get the food safety database"""
    return FOOD_DATABASE

# Pydantic model for search history (inline to avoid circular import)
from pydantic import BaseModel, Field
import uuid

class SearchHistoryItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    query: str
    result_type: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== SCAN & SEARCH ====================

@router.post("/scan/barcode")
async def scan_barcode(barcode: str, current_user: User = Depends(get_current_user)):
    """Scan a barcode and get food information"""
    try:
        # Vérifier les limites pour utilisateurs gratuits
        user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0, "subscription_status": 1})
        is_premium = user_doc.get("subscription_status") == "premium"
        
        if not is_premium:
            # Compter les scans de cette semaine
            from datetime import timedelta
            week_start = datetime.now(timezone.utc) - timedelta(days=7)
            scans_this_week = await db.food_scans.count_documents({
                "user_id": current_user.id,
                "scanned_at": {"$gte": week_start.isoformat()}
            })
            
            if scans_this_week >= 5:
                raise HTTPException(
                    status_code=403, 
                    detail="Limite de 5 scans par semaine atteinte. Passez à Premium pour des scans illimités !"
                )
        
        food_safety_db = await get_food_safety_database()
        product_info = food_safety_db.get(barcode, None)
        
        if not product_info:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://world.openfoodfacts.org/api/v0/product/{barcode}.json",
                    timeout=10.0
                )
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == 1:
                        product = data.get("product", {})
                        product_info = {
                            "barcode": barcode,
                            "name": product.get("product_name", "Produit inconnu"),
                            "brand": product.get("brands", ""),
                            "image_url": product.get("image_url", ""),
                            "categories": product.get("categories", ""),
                            "ingredients": product.get("ingredients_text_fr", ""),
                            "safe_for_pregnancy": "unknown"
                        }
        
        if product_info:
            # Enregistrer le scan
            await db.food_scans.insert_one({
                "user_id": current_user.id,
                "barcode": barcode,
                "scanned_at": datetime.now(timezone.utc).isoformat()
            })
            
            history = SearchHistoryItem(
                user_id=current_user.id,
                query=barcode,
                result_type="barcode"
            )
            history_dict = history.model_dump()
            history_dict["created_at"] = history_dict["created_at"].isoformat()
            await db.search_history.insert_one(history_dict)
        
        return product_info or {"barcode": barcode, "name": "Produit non trouvé", "safe_for_pregnancy": "unknown"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur scan barcode: {str(e)}")
        return {"barcode": barcode, "name": "Erreur lors du scan", "safe_for_pregnancy": "unknown"}

@router.post("/scan/search")
async def search_food(query: str, current_user: User = Depends(get_current_user)):
    """Search for food by name"""
    # Vérifier les limites pour utilisateurs gratuits (même limite que les scans)
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0, "subscription_status": 1})
    is_premium = user_doc.get("subscription_status") == "premium"
    
    if not is_premium:
        from datetime import timedelta
        week_start = datetime.now(timezone.utc) - timedelta(days=7)
        scans_this_week = await db.food_scans.count_documents({
            "user_id": current_user.id,
            "scanned_at": {"$gte": week_start.isoformat()}
        })
        
        if scans_this_week >= 5:
            raise HTTPException(
                status_code=403, 
                detail="Limite de 5 recherches par semaine atteinte. Passez à Premium pour des recherches illimitées !"
            )
    
    food_safety_db = await get_food_safety_database()
    results = []
    
    for key, value in food_safety_db.items():
        if query.lower() in value["name"].lower():
            results.append(value)
    
    if results:
        # Enregistrer la recherche comme un scan
        await db.food_scans.insert_one({
            "user_id": current_user.id,
            "query": query,
            "scanned_at": datetime.now(timezone.utc).isoformat()
        })
        
        history = SearchHistoryItem(
            user_id=current_user.id,
            query=query,
            result_type="search"
        )
        history_dict = history.model_dump()
        history_dict["created_at"] = history_dict["created_at"].isoformat()
        await db.search_history.insert_one(history_dict)
    
    return results[:10]

@router.get("/foods/safe")
async def get_safe_foods(current_user: User = Depends(get_current_user)):
    """Get all safe foods"""
    food_db = await get_food_safety_database()
    safe_foods = [v for v in food_db.values() if v["safe_for_pregnancy"] == "safe"]
    return safe_foods

# ==================== FOOD LIBRARY ====================

@router.get("/food-library")
async def get_food_library(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    """Get complete food library with search and filtering"""
    food_db = await get_food_safety_database()
    
    foods = sorted(food_db.values(), key=lambda x: x["name"].lower())
    
    if search:
        search_lower = search.lower()
        foods = [f for f in foods if search_lower in f["name"].lower() or search_lower in f.get("category", "").lower()]
    
    if category:
        foods = [f for f in foods if f.get("category", "").lower() == category.lower()]
    
    if status:
        foods = [f for f in foods if f.get("safe_for_pregnancy") == status]
    
    all_foods = list(food_db.values())
    categories = sorted(list(set(f.get("category", "Autre") for f in all_foods)))
    
    total = len(foods)
    start = (page - 1) * limit
    end = start + limit
    foods_page = foods[start:end]
    
    return {
        "foods": foods_page,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
        "categories": categories
    }

# ==================== USER-ADDED FOODS ====================

@router.post("/user-added-foods")
async def add_user_food(food_data: AddFoodRequest, current_user: User = Depends(get_current_user)):
    """Allow users to submit new foods not in the database"""
    food_db = await get_food_safety_database()
    normalized_name = food_data.name.lower().strip()
    
    for key, value in food_db.items():
        if normalized_name == value["name"].lower():
            raise HTTPException(
                status_code=400, 
                detail=f"Cet aliment existe déjà dans la base: {value['name']}"
            )
    
    existing = await db.user_added_foods.find_one({
        "name": {"$regex": f"^{normalized_name}$", "$options": "i"}
    })
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Cet aliment a déjà été soumis par un utilisateur"
        )
    
    user_food = UserAddedFood(
        user_id=current_user.id,
        name=food_data.name.strip(),
        barcode=food_data.barcode,
        status="pending",
        safety_level="unknown",
        is_safe=False,
        category=food_data.category,
        notes=food_data.notes
    )
    
    food_dict = user_food.model_dump()
    food_dict["created_at"] = food_dict["created_at"].isoformat()
    
    await db.user_added_foods.insert_one(food_dict)
    
    return {
        "success": True,
        "message": f"L'aliment '{food_data.name}' a été soumis pour vérification",
        "food": {
            "id": user_food.id,
            "name": user_food.name,
            "status": user_food.status
        }
    }

@router.get("/user-added-foods")
async def get_user_added_foods(current_user: User = Depends(get_current_user)):
    """Get foods submitted by current user"""
    foods = await db.user_added_foods.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return foods

@router.get("/history/search")
async def get_search_history(current_user: User = Depends(get_current_user)):
    """Get user's search history"""
    history = await db.search_history.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    return history

# ==================== FAVORITES ====================

@router.post("/favorites")
async def add_favorite(request: AddFavoriteRequest, current_user: User = Depends(get_current_user)):
    """Add a food to favorites"""
    existing = await db.favorites.find_one({
        "user_id": current_user.id,
        "food_name": request.food_name
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Aliment déjà dans les favoris")
    
    favorite = Favorite(
        user_id=current_user.id,
        food_name=request.food_name,
        safety_level=request.safety_level,
        notes=request.notes
    )
    
    fav_dict = favorite.model_dump()
    fav_dict["created_at"] = fav_dict["created_at"].isoformat()
    await db.favorites.insert_one(fav_dict)
    
    return {"success": True, "message": "Ajouté aux favoris", "favorite": fav_dict}

@router.get("/favorites")
async def get_favorites(current_user: User = Depends(get_current_user)):
    """Get user's favorite foods"""
    favorites = await db.favorites.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return favorites

@router.delete("/favorites/{food_name}")
async def remove_favorite(food_name: str, current_user: User = Depends(get_current_user)):
    """Remove a food from favorites"""
    result = await db.favorites.delete_one({
        "user_id": current_user.id,
        "food_name": food_name
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favori non trouvé")
    
    return {"success": True, "message": "Retiré des favoris"}

@router.get("/favorites/check/{food_name}")
async def check_favorite(food_name: str, current_user: User = Depends(get_current_user)):
    """Check if a food is in favorites"""
    favorite = await db.favorites.find_one({
        "user_id": current_user.id,
        "food_name": food_name
    })
    return {"is_favorite": favorite is not None}


# ==================== AI FOOD SCANNER ====================

MAX_FOOD_IMAGE_BYTES = 8 * 1024 * 1024
ACCEPTED_IMAGE_MIMES = {
    "image/jpeg",
    "image/jpg",
    "image/pjpeg",
    "image/png",
    "image/webp",
}


class FoodImageScanRequest(BaseModel):
    """Requête de scan d'image alimentaire"""
    image_base64: str  # Image encodée en base64 (JPEG/PNG/WebP)
    context: Optional[str] = None  # Contexte optionnel


def _scan_http_error(status: int, code: str, message: str) -> None:
    raise HTTPException(status_code=status, detail={"code": code, "message": message})


def _looks_like_image(data: bytes) -> bool:
    if len(data) >= 3 and data[:3] == b"\xff\xd8\xff":
        return True
    if len(data) >= 8 and data[:8] == b"\x89PNG\r\n\x1a\n":
        return True
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return True
    return False


def decode_food_image(image_base64: str) -> bytes:
    """Valide une image base64 (vide / MIME / corrompu / trop lourd)."""
    raw = (image_base64 or "").strip()
    if not raw:
        _scan_http_error(400, "empty_image", "Image vide ou manquante")
    payload = raw
    if raw.startswith("data:") and "," in raw:
        header, payload = raw.split(",", 1)
        mime = header[5:].split(";")[0].strip().lower()
        if mime and mime not in ACCEPTED_IMAGE_MIMES:
            _scan_http_error(400, "bad_mime", f"Type MIME non supporté : {mime}")
    try:
        data = base64.b64decode(payload, validate=False)
    except Exception:
        _scan_http_error(400, "corrupt_image", "Image corrompue : base64 invalide")
    if not data or len(data) < 24:
        _scan_http_error(400, "corrupt_image", "Fichier image vide ou corrompu")
    if len(data) > MAX_FOOD_IMAGE_BYTES:
        _scan_http_error(413, "too_large", "Image trop volumineuse (max 8 MB)")
    if not _looks_like_image(data):
        _scan_http_error(400, "corrupt_image", "Fichier image corrompu ou format illisible")
    return data


def _food_scan_payload(result) -> dict:
    data = {
        "food_name": result.food_name,
        "verdict": result.verdict,
        "verdict_color": result.verdict_color,
        "explanation": result.explanation,
        "nutrients_info": result.nutrients_info,
        "alternatives": result.alternatives,
        "ingredients": result.ingredients,
        "packaging_text": result.packaging_text,
        "extracted_text": result.packaging_text or result.explanation,
        "confidence": result.confidence,
        "is_unknown": result.is_unknown,
    }
    return {
        "success": True,
        "status": "success",
        "data": data,
        "result": data,
    }


async def _execute_food_image_scan(
    image_base64: str,
    context: Optional[str],
    current_user: User,
) -> dict:
    from services.food_scanner_ai import food_scanner

    user_doc = await db.users.find_one(
        {"id": current_user.id}, {"_id": 0, "subscription_status": 1}
    )
    is_premium = (user_doc or {}).get("subscription_status") == "premium"

    if not is_premium:
        from datetime import timedelta

        week_start = datetime.now(timezone.utc) - timedelta(days=7)
        scans_this_week = await db.ai_food_scans.count_documents(
            {
                "user_id": current_user.id,
                "scanned_at": {"$gte": week_start.isoformat()},
            }
        )
        if scans_this_week >= 3:
            raise HTTPException(
                status_code=403,
                detail="Limite de 3 scans IA par semaine atteinte. Passez à Premium pour des scans illimités !",
            )

    try:
        result = await food_scanner.analyze_food_image(
            image_base64=image_base64,
            user_context=context,
        )
        scan_record = {
            "user_id": current_user.id,
            "food_name": result.food_name,
            "verdict": result.verdict,
            "confidence": result.confidence,
            "scanned_at": result.scanned_at,
        }
        await db.ai_food_scans.insert_one(scan_record)
        history_item = SearchHistoryItem(
            user_id=current_user.id,
            query=f"[IA] {result.food_name}",
            result_type="ai_scan",
        )
        await db.search_history.insert_one(history_item.dict())
        logger.info(
            "[FoodScanner] User %s scanned: %s -> %s",
            current_user.id,
            result.food_name,
            result.verdict,
        )
        return _food_scan_payload(result)
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=400, detail={"code": "invalid_scan", "message": str(e)}
        )
    except Exception as e:
        logger.error("[FoodScanner] Error: %s", e)
        raise HTTPException(status_code=500, detail="Erreur lors de l'analyse de l'image")


@router.post("/scan/image")
async def scan_food_image(
    request: FoodImageScanRequest,
    current_user: User = Depends(get_current_user),
):
    """Scanner IA JSON (image_base64 JPEG/PNG/WebP)."""
    decode_food_image(request.image_base64)
    return await _execute_food_image_scan(
        request.image_base64, request.context, current_user
    )


@router.post("/scan/upload")
async def scan_food_upload(
    file: UploadFile = File(...),
    context: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
):
    """Scanner IA multipart (ticket / étiquette JPG, PNG, WebP)."""
    mime = (file.content_type or "").lower().split(";")[0].strip()
    if mime not in ACCEPTED_IMAGE_MIMES:
        _scan_http_error(400, "bad_mime", f"Type MIME non supporté : {mime or 'inconnu'}")
    content = await file.read()
    if not content:
        _scan_http_error(400, "empty_image", "Fichier vide")
    if len(content) > MAX_FOOD_IMAGE_BYTES:
        _scan_http_error(413, "too_large", "Image trop volumineuse (max 8 MB)")
    if not _looks_like_image(content):
        _scan_http_error(400, "corrupt_image", "Fichier image corrompu ou format illisible")
    image_b64 = base64.b64encode(content).decode("ascii")
    return await _execute_food_image_scan(image_b64, context, current_user)


@router.get("/scan/history")
async def get_scan_history(
    limit: int = 20,
    current_user: User = Depends(get_current_user)
):
    """Récupérer l'historique des scans IA"""
    scans = await db.ai_food_scans.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("scanned_at", -1).limit(limit).to_list(limit)
    
    return {"scans": scans}

