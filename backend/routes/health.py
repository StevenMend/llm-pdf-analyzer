
from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/health")
def health_check():
    return JSONResponse(content={"status": "ok"})