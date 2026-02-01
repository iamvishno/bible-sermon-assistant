from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from app.routers import sermons, auth, subscriptions

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting Bible Sermon Assistant API...")
    # Initialize Redis connection, DB connections, etc.
    yield
    # Shutdown
    print("Shutting down Bible Sermon Assistant API...")
    # Close connections, cleanup

# Create FastAPI app
app = FastAPI(
    title=os.getenv("APP_NAME", "Bible Sermon Assistant API"),
    version=os.getenv("APP_VERSION", "1.0.0"),
    description="AI-powered sermon generation API for Telugu pastors and preachers",
    lifespan=lifespan,
)

# CORS middleware
allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return JSONResponse(
        content={
            "status": "healthy",
            "service": "Bible Sermon Assistant API",
            "version": os.getenv("APP_VERSION", "1.0.0"),
        }
    )

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Bible Sermon Assistant API",
        "version": os.getenv("APP_VERSION", "1.0.0"),
        "documentation": "/docs",
    }

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(sermons.router, prefix="/api/v1/sermons", tags=["Sermons"])
app.include_router(subscriptions.router, prefix="/api/v1/subscriptions", tags=["Subscriptions"])

if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=os.getenv("DEBUG", "False").lower() == "true",
    )
