import sys
import os
from fastapi.testclient import TestClient

# Import the app from the main module
from main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_predict():
    response = client.post("/ml/predict", json={"input": "test input"})
    assert response.status_code == 200
    assert "prediction" in response.json()
    assert "confidence" in response.json()
