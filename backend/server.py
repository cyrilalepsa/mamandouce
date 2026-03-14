"""
MamanDouce API Server
Main FastAPI application with modular routes
"""
from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="MamanDouce API",
    description="API pour l'application MamanDouce - Accompagnement grossesse",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create main API router
api_router = APIRouter(prefix="/api")

# Import and include all route modules
from routes.auth import router as auth_router
from routes.pregnancy import router as pregnancy_router
from routes.food import router as food_router
from routes.medical import router as medical_router
from routes.birth_list import router as birth_list_router
from routes.admin import router as admin_router
from routes.contact import router as contact_router
from routes.push_notifications import router as push_notifications_router
from routes.payments import router as payments_router
from routes.tips import router as tips_router
from routes.postpartum import router as postpartum_router
from routes.referral import router as referral_router

# Include all routers
api_router.include_router(auth_router)
api_router.include_router(pregnancy_router)
api_router.include_router(food_router)
api_router.include_router(medical_router)
api_router.include_router(birth_list_router)
api_router.include_router(admin_router)
api_router.include_router(contact_router)
api_router.include_router(push_notifications_router)
api_router.include_router(payments_router)
api_router.include_router(tips_router)
api_router.include_router(postpartum_router)
api_router.include_router(referral_router)

# Include main router
app.include_router(api_router)

# Startup/Shutdown events
@app.on_event("startup")
async def startup_db_client():
    from core.database import client
    logger.info("Connected to MongoDB")

@app.on_event("shutdown")
async def shutdown_db_client():
    from core.database import client
    client.close()
    logger.info("Disconnected from MongoDB")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
