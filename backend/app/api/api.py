from fastapi import APIRouter

from app.api.endpoints import users, auth, leave_requests, leave_types

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(leave_requests.router, prefix="/leave-requests", tags=["leave requests"])
api_router.include_router(leave_types.router, prefix="/leave-types", tags=["leave types"])