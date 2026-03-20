from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse

from fermentation_sim.api.dependencies import get_simulation_service
from fermentation_sim.services.simulation_service import SimulationService
from fermentation_sim.utils.validation import SimulationRequest

router = APIRouter(prefix="/simulation", tags=["simulation"])


@router.post("/run", response_model=dict)
async def run_simulation(
    payload: SimulationRequest,
    mode: str = Query("batch", pattern="^(batch|fed_batch)$"),
    svc: SimulationService = Depends(get_simulation_service),
):
    """
    Run a fermentation simulation.

    Body: SimulationRequest (all parameters).
    Query param: mode=batch|fed_batch
    """
    result = svc.run_simulation(payload, mode=mode)  # type: ignore[arg-type]
    import math

    # Clean NaNs before returning:
    def clean(obj):
        if isinstance(obj, float):
            if math.isnan(obj) or math.isinf(obj):
                return None
            return obj
        if isinstance(obj, dict):
            return {k: clean(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [clean(x) for x in obj]
        return obj

    return JSONResponse(content=clean(result))

