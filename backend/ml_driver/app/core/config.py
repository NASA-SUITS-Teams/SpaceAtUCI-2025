from pydantic import BaseModel

class Settings(BaseModel):
    API_V1_STR: str = ""  # Remove version prefix
    PROJECT_NAME: str = "SUITS ML Driver"
    
    # Add more settings as needed
    
    class Config:
        case_sensitive = True

settings = Settings() 