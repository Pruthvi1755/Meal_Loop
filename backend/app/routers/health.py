from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.db.session import get_db
from app.schemas.health import HealthCheckResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="Application & Database Health Check"
)
def check_health(db: Session = Depends(get_db)):
    """
    Health-check endpoint that verifies:
    1. FastAPI process is responsive.
    2. Database engine is reachable by executing a low-overhead 'SELECT 1'.
    """
    db_status = "connected"
    try:
        # Execute minimal query to verify connection
        db.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"disconnected: {str(exc)}"
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "degraded", "database": db_status}
        )

    return HealthCheckResponse(
        status="ok",
        service=settings.PROJECT_NAME,
        version="1.0.0",
        environment=settings.ENVIRONMENT,
        database=db_status
    )
