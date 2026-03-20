from functools import lru_cache

from fermentation_sim.config import settings
from ..services.simulation_service import SimulationService
from fermentation_sim.utils.logging_config import configure_logging


@lru_cache(maxsize=1)
def get_simulation_service() -> SimulationService:
    configure_logging(debug=settings.debug)
    return SimulationService()
