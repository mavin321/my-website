from __future__ import annotations

from fermentation_sim.data.microbe_database import (
    flatten_preset,
    get_preset,
    list_microbes,
    list_substrates,
)
from fermentation_sim.utils.validation import SimulationRequest


def merge_request_with_preset(payload: SimulationRequest) -> SimulationRequest:
    """
    Merge a SimulationRequest with a preset.

    - If microbe_id/substrate_id missing or preset not found: return payload as-is.
    - Uses model_fields_set to detect user-provided overrides; preset only fills missing fields.
    """
    if not payload.microbe_id or not payload.substrate_id:
        return payload

    preset = get_preset(payload.microbe_id, payload.substrate_id)
    if not preset:
        return payload

    provided = payload.model_fields_set
    data = payload.model_dump()
    preset_flat = flatten_preset(preset)

    for key, val in preset_flat.items():
        if key not in provided:
            data[key] = val

    # keep the selectors
    data["microbe_id"] = payload.microbe_id
    data["substrate_id"] = payload.substrate_id
    return SimulationRequest(**data)


__all__ = [
    "list_microbes",
    "list_substrates",
    "get_preset",
    "merge_request_with_preset",
]
