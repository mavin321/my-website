from dataclasses import asdict
from typing import Literal

import numpy as np

from fermentation_sim.data.preset_service import merge_request_with_preset
from fermentation_sim.models.batch_model import BatchFermentationModel
from fermentation_sim.models.fed_batch_model import FedBatchFermentationModel
from fermentation_sim.utils.validation import SimulationRequest


class SimulationService:
    """Orchestrates simulation runs and preps data for API."""

    def __init__(self) -> None:
        self._batch_model = BatchFermentationModel()
        self._fed_batch_model = FedBatchFermentationModel()

    def run_simulation(
        self,
        payload: SimulationRequest,
        mode: Literal["batch", "fed_batch"] = "batch",
    ) -> dict:
        payload = merge_request_with_preset(payload)
        if mode == "batch":
            result = self._batch_model.simulate(payload)
            state = result.state
        elif mode == "fed_batch":
            result = self._fed_batch_model.simulate(payload)
            state = result.state
        else:
            raise ValueError(f"Unsupported mode: {mode}")

        return {
            "meta": {
                "mode": mode,
                "n_points": int(state.shape[0]),
                "state_dim": int(state.shape[1]),
                "request": payload.model_dump(),
            },
            "time": result.time.tolist(),
            "states": {
                "X": state[:, 0].tolist(),
                "S": state[:, 1].tolist(),
                "P": state[:, 2].tolist(),
                "DO": state[:, 3].tolist(),
                "T": state[:, 4].tolist(),
                "V": state[:, 5].tolist(),
            },
        }
