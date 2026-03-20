from __future__ import annotations

import sys
from pathlib import Path
from typing import Any


FERMENTATION_BACKEND_SRC = (
    Path(__file__).resolve().parents[1] / "FermentationSim" / "backend" / "src"
)


def _ensure_backend_path() -> None:
    backend_src = str(FERMENTATION_BACKEND_SRC)
    if backend_src not in sys.path:
        sys.path.insert(0, backend_src)


def list_microbes() -> list[dict[str, Any]]:
    _ensure_backend_path()
    from fermentation_sim.data.preset_service import list_microbes as _list_microbes

    return _list_microbes()


def list_substrates(microbe_id: str) -> list[dict[str, Any]]:
    _ensure_backend_path()
    from fermentation_sim.data.preset_service import list_substrates as _list_substrates

    return _list_substrates(microbe_id)


def get_preset_details(microbe_id: str, substrate_id: str) -> dict[str, Any] | None:
    _ensure_backend_path()
    from fermentation_sim.data.preset_service import get_preset
    from fermentation_sim.data.microbe_database import flatten_preset

    preset = get_preset(microbe_id, substrate_id)
    if not preset:
        return None

    return {
        "microbe_id": microbe_id,
        "substrate_id": substrate_id,
        "label": preset.get("label", f"{microbe_id} on {substrate_id}"),
        "defaults": flatten_preset(preset),
        "sections": preset,
    }


def run_simulation(payload: dict[str, Any], mode: str) -> dict[str, Any]:
    _ensure_backend_path()
    try:
        from fermentation_sim.services.simulation_service import SimulationService
        from fermentation_sim.utils.validation import SimulationRequest
    except ModuleNotFoundError as exc:
        package_name = exc.name or "unknown package"
        raise RuntimeError(
            f"FermentationSim dependency missing: {package_name}. "
            "Install the project requirements and retry."
        ) from exc

    service = SimulationService()
    request = SimulationRequest(**payload)
    return service.run_simulation(request, mode=mode)  # type: ignore[arg-type]
