"""
MamanDouce API Server
Main FastAPI application with modular routes
Optimized for Low Memory Profile (Railway)
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

# Configure logging - Reduce verbosity in production
log_level = logging.DEBUG if os.environ.get('DEBUG') == 'true' else logging.INFO
logging.basicConfig(level=log_level)
logger = logging.getLogger(__name__)

# Create FastAPI app with optimized settings
app = FastAPI(
    title="MamanDouce API",
    description="API pour l'application MamanDouce - Accompagnement grossesse",
    version="2.1.0",
    docs_url="/api/docs",  # Swagger UI accessible
    redoc_url="/api/redoc",  # ReDoc accessible
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
from routes.preferences import router as preferences_router
from routes.chatbot import router as chatbot_router
from routes.favorites import router as favorites_router
from routes.name_stats import router as name_stats_router
from routes.translation import router as translation_router
from routes.user_layout import router as user_layout_router
from routes.guardian import router as guardian_router
from routes.solidarity import router as solidarity_router
from routes.contributions import router as contributions_router
from routes.accounting import router as accounting_router
from routes.emotional import router as emotional_router
from routes.tirelire import router as tirelire_router
from routes.babynames import router as babynames_router

# Include all routers
api_router.include_router(auth_router)
api_router.include_router(pregnancy_router)
api_router.include_router(food_router)
api_router.include_router(medical_router)
api_router.include_router(birth_list_router)
api_router.include_router(admin_router)
api_router.include_router(contact_router)
api_router.include_router(push_notifications_router)
api_router.include_router(payments_router, prefix="/payments")
api_router.include_router(tips_router)
api_router.include_router(postpartum_router)
api_router.include_router(referral_router)
api_router.include_router(preferences_router)
api_router.include_router(chatbot_router)
api_router.include_router(favorites_router)
api_router.include_router(name_stats_router)
api_router.include_router(translation_router)
api_router.include_router(user_layout_router)
api_router.include_router(guardian_router)
api_router.include_router(solidarity_router)
api_router.include_router(contributions_router)
api_router.include_router(accounting_router)
api_router.include_router(emotional_router)
api_router.include_router(tirelire_router)
api_router.include_router(babynames_router)

# Include main router
app.include_router(api_router)

# Health check endpoint - Simple and fast, no dependencies
@app.get("/api/health")
async def health_check():
    """Simple health check endpoint for Railway healthcheck"""
    return {"status": "ok"}

# Detailed health check with database and services status
@app.get("/api/health/detailed")
async def detailed_health_check():
    """Detailed health check with all service statuses"""
    status = {
        "status": "ok",
        "message": "MamanDouce API is running",
        "version": "2.1.0",
        "services": {}
    }
    
    # Check MongoDB
    try:
        from core.database import client
        client.admin.command('ping')
        status["services"]["mongodb"] = "connected"
    except Exception as e:
        status["services"]["mongodb"] = f"error: {str(e)}"
        status["status"] = "degraded"
    
    # Check Guardian
    try:
        from services.guardian_agent import guardian_agent
        status["services"]["guardian"] = "active" if guardian_agent else "inactive"
    except:
        status["services"]["guardian"] = "unavailable"
    
    # Check Memory Optimizer
    try:
        from core.memory_optimizer import memory_optimizer
        status["services"]["memory_optimizer"] = "active" if memory_optimizer else "inactive"
    except:
        status["services"]["memory_optimizer"] = "unavailable"
    
    return status

# Memory stats endpoint (for monitoring)
@app.get("/api/health/memory")
async def memory_stats():
    """Get memory usage statistics for monitoring"""
    from core.memory_optimizer import memory_optimizer
    return memory_optimizer.get_memory_stats()

# Manual cleanup endpoint (admin only in production)
@app.post("/api/health/cleanup")
async def trigger_cleanup():
    """Trigger a manual memory cleanup"""
    from core.memory_optimizer import memory_optimizer
    freed, temp_cleaned = await memory_optimizer.run_cleanup()
    return {
        "status": "ok",
        "gc_objects_freed": freed,
        "temp_files_cleaned": temp_cleaned
    }

# Startup/Shutdown events - SIMPLIFIED FOR RAILWAY
@app.on_event("startup")
async def startup_db_client():
    """Minimal startup - only essential services"""
    try:
        from core.database import client
        logger.info("✅ MongoDB connection initialized")
    except Exception as e:
        logger.warning(f"⚠️ MongoDB: {e}")
    
    logger.info("🚀 MamanDouce API startup complete - Railway ready")

@app.on_event("shutdown")
async def shutdown_db_client():
    """Minimal shutdown"""
    try:
        from core.database import client
        client.close()
        logger.info("✅ MongoDB disconnected")
    except Exception as e:
        logger.warning(f"⚠️ Shutdown: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
