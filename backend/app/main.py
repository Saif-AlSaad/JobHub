import os
import json
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import engine, Base, SessionLocal, init_db
from app.auth.deps import resolve_user_from_token
from app.models.models import UserRole
from app.api import auth, jobs, seekers, applications, recruiters, notifications, chat, admin, resume
from app.websocket.connection_manager import manager

# Create database tables and safe indexes
init_db()

# Create uploads directory if not exists
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="JOB HUB - AI-Powered Placement & Semantic Matching Platform"
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    settings.FRONTEND_URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://.*\.vercel\.app|https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(seekers.router, prefix=settings.API_V1_STR)
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(applications.router, prefix=settings.API_V1_STR)
app.include_router(recruiters.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(resume.router, prefix=settings.API_V1_STR)

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: int,
    token: Optional[str] = Query(None)
):
    # Support token in query parameter (?token=... or ?access_token=...) or Authorization header
    auth_token = token or websocket.query_params.get("token") or websocket.query_params.get("access_token")
    if not auth_token:
        auth_header = websocket.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            auth_token = auth_header.split(" ")[1]

    if not auth_token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Authentication token missing")
        return

    # Authenticate and authorize against database
    db = SessionLocal()
    try:
        user = resolve_user_from_token(auth_token, db)
        if not user or not user.is_active:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid or inactive user credentials")
            return
        # Enforce authorization: only the matching user or an ADMIN may connect to this user stream
        if user.id != user_id and user.role != UserRole.ADMIN:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Unauthorized access to user stream")
            return
    finally:
        db.close()

    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Heartbeat / ping-pong support
            try:
                payload = json.loads(data)
                if payload.get("type") == "PING":
                    await websocket.send_text(json.dumps({"type": "PONG"}))
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
