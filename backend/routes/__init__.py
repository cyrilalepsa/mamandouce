"""
Routes module - exports all routers
"""
from .auth import router as auth_router
from .pregnancy import router as pregnancy_router
from .food import router as food_router
from .medical import router as medical_router
from .birth_list import router as birth_list_router
from .admin import router as admin_router
from .contact import router as contact_router
from .push_notifications import router as push_notifications_router
from .payments import router as payments_router

# List of all routers to be included
all_routers = [
    auth_router,
    pregnancy_router,
    food_router,
    medical_router,
    birth_list_router,
    admin_router,
    contact_router,
    push_notifications_router,
    payments_router,
]
