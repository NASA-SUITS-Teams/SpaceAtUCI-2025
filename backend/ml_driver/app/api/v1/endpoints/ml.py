from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from app.ml.processor import processor

router = APIRouter()

class PredictionInput(BaseModel):
    """Input data model"""
    data: Dict[str, Any]
    
    class Config:
        json_schema_extra = {
            "example": {
                "data": {
                    "feature1": 0.5,
                    "feature2": 0.3,
                    "feature3": 0.7,
                    "feature4": 0.2
                }
            }
        }

class PredictionResponse(BaseModel):
    prediction: float
    confidence: float
    feature_importance: Optional[List[float]] = None

@router.get("/predict")
async def get_prediction():
    """
    Get a sample prediction (for testing/documentation purposes)
    """
    result = processor.predict({"test": "data"})
    return PredictionResponse(**result)

@router.post("/predict", response_model=PredictionResponse)
async def create_prediction(input_data: PredictionInput):
    """
    Create a new prediction based on input data.
    """
    try:
        result = processor.predict(input_data.data)
        return PredictionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def model_health():
    """
    Check ML processor health
    """
    return processor.health_check() 