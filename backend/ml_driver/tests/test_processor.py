from app.ml.processor import MLProcessor

def test_processor_prediction():
    processor = MLProcessor()
    
    # Test prediction
    input_data = {"test": "data"}
    result = processor.predict(input_data)
    
    assert "prediction" in result
    assert "confidence" in result
    assert 0 <= result["prediction"] <= 1
    assert 0 <= result["confidence"] <= 1

def test_processor_health():
    processor = MLProcessor()
    
    # Test health check
    health = processor.health_check()
    
    assert "status" in health
    assert "version" in health
    assert health["status"] in ["healthy", "not ready"] 