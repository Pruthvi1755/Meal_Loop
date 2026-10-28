from datetime import datetime, timezone
from pydantic import BaseModel, Field


class HealthCheckResponse(BaseModel):
    """Schema returned by the /health endpoint."""
    status: str = Field(..., example="ok")
    service: str = Field(..., example="MealLoop API")
    version: str = Field(..., example="1.0.0")
    environment: str = Field(..., example="development")
    database: str = Field(..., example="connected")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
