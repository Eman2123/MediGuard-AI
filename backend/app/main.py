from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = FastAPI(
    title="MediGuard AI",
    description="Hyperlocal cooling intelligence for life-critical cargo",
    version="1.0.0"
)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = FastAPI(
    title="MediGuard AI",
    description="Hyperlocal cooling intelligence for life-critical cargo",
    version="1.0.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://medi-guard-ai-liart.vercel.app",
        "https://medi-guard-ai-eman16.vercel.app",
    ],
    allow_origin_regex=r"https://medi-guard.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routes
from app.routes import shipment, health, environment

# Include routers
app.include_router(health.router)
app.include_router(shipment.router)
app.include_router(environment.router)

@app.get("/")
def root():
    return {
        "message": "MediGuard AI API",
        "docs": "/docs",
        "status": "running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://medi-guard-ai-liart.vercel.app",
        "https://medi-guard-ai-eman16.vercel.app",
    ],
    allow_origin_regex=r"https://medi-guard.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routes
from app.routes import shipment, health, environment

# Include routers
app.include_router(health.router)
app.include_router(shipment.router)
app.include_router(environment.router)

@app.get("/")
def root():
    return {
        "message": "MediGuard AI API",
        "docs": "/docs",
        "status": "running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
