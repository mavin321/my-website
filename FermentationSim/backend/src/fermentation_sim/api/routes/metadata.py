from fastapi import APIRouter

router = APIRouter(prefix="/meta", tags=["metadata"])


@router.get("/health")
async def health_check() -> dict:
    return {"status": "ok"}


@router.get("/variables")
async def variables() -> dict:
    """Describe variables for the frontend."""
    return {
        "states": [
            {"name": "X", "label": "Biomass", "unit": "g/L"},
            {"name": "S", "label": "Substrate", "unit": "g/L"},
            {"name": "P", "label": "Product", "unit": "g/L"},
            {"name": "DO", "label": "Dissolved Oxygen", "unit": "g/L"},
            {"name": "T", "label": "Temperature", "unit": "°C"},
        ],
        "modes": ["batch", "fed_batch"],
    }
