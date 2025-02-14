from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints.ml import router as ml_router

app = FastAPI(
    title="SUITS ML Driver",
    description="Machine Learning and Adaptive Guidance API for SUITS 2025",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the ML router directly
app.include_router(ml_router, prefix="/ml", tags=["ml"])

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "SUITS ML Driver",
        "version": "0.1.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 