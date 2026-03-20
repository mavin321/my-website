from __future__ import annotations

import ctypes
import sys
from ctypes import POINTER, Structure, c_double, c_int
from pathlib import Path


LIBRARY_NAME = "visualization_lab.dll" if sys.platform.startswith("win") else "libvisualization_lab.so"
LIBRARY_PATH = Path(__file__).resolve().parents[1] / "VisualizationLabSim" / "cpp_core" / LIBRARY_NAME


class VisualizationLabParams(Structure):
    _fields_ = [
        ("domain_size", c_double),
        ("diffusivity", c_double),
        ("advection_x", c_double),
        ("advection_y", c_double),
        ("advection_z", c_double),
        ("source_strength", c_double),
        ("source_sigma", c_double),
        ("vortex_strength", c_double),
        ("thermal_gain", c_double),
        ("time_value", c_double),
        ("grid_points", c_int),
    ]


class VisualizationLabPoint(Structure):
    _fields_ = [
        ("x", c_double),
        ("y", c_double),
        ("z", c_double),
        ("concentration", c_double),
        ("temperature", c_double),
        ("vx", c_double),
        ("vy", c_double),
        ("vz", c_double),
        ("speed", c_double),
    ]


class VisualizationLabSummary(Structure):
    _fields_ = [
        ("max_concentration", c_double),
        ("max_temperature", c_double),
        ("mean_speed", c_double),
        ("plume_radius", c_double),
    ]


class VisualizationLabCLib:
    def __init__(self) -> None:
        if not LIBRARY_PATH.exists():
            raise FileNotFoundError(f"Visualization lab C++ library not found at {LIBRARY_PATH}")
        self.lib = ctypes.CDLL(str(LIBRARY_PATH))
        self.lib.simulate_visualization_lab.argtypes = [
            POINTER(VisualizationLabParams),
            POINTER(VisualizationLabPoint),
            POINTER(VisualizationLabSummary),
        ]
        self.lib.simulate_visualization_lab.restype = c_int


def run_visualization_lab_simulation(payload: dict) -> dict:
    grid_points = int(payload.get("grid_points", 14))
    if grid_points < 5:
        raise ValueError("grid_points must be at least 5")

    params = VisualizationLabParams(
        domain_size=_positive(payload.get("domain_size", 12.0), "domain_size"),
        diffusivity=_positive(payload.get("diffusivity", 0.18), "diffusivity"),
        advection_x=float(payload.get("advection_x", 0.55)),
        advection_y=float(payload.get("advection_y", -0.18)),
        advection_z=float(payload.get("advection_z", 0.10)),
        source_strength=_positive(payload.get("source_strength", 48.0), "source_strength"),
        source_sigma=_positive(payload.get("source_sigma", 0.95), "source_sigma"),
        vortex_strength=_positive(payload.get("vortex_strength", 6.5), "vortex_strength"),
        thermal_gain=_positive(payload.get("thermal_gain", 24.0), "thermal_gain"),
        time_value=_positive(payload.get("time_value", 4.5), "time_value"),
        grid_points=grid_points,
    )

    total_points = grid_points ** 3
    points = (VisualizationLabPoint * total_points)()
    summary = VisualizationLabSummary()
    c_lib = VisualizationLabCLib()
    status = c_lib.lib.simulate_visualization_lab(
        ctypes.byref(params),
        points,
        ctypes.byref(summary),
    )
    if status != 0:
        raise RuntimeError(f"Visualization lab C++ simulation failed with status {status}")

    point_list = list(points)
    return {
        "meta": {
            "grid_points": grid_points,
            "point_count": total_points,
            "domain_size": params.domain_size,
        },
        "summary": {
            "max_concentration": summary.max_concentration,
            "max_temperature": summary.max_temperature,
            "mean_speed": summary.mean_speed,
            "plume_radius": summary.plume_radius,
        },
        "points": [
            {
                "x": point.x,
                "y": point.y,
                "z": point.z,
                "concentration": point.concentration,
                "temperature": point.temperature,
                "vx": point.vx,
                "vy": point.vy,
                "vz": point.vz,
                "speed": point.speed,
            }
            for point in point_list
        ],
    }


def _positive(value, field_name: str) -> float:
    numeric_value = float(value)
    if numeric_value <= 0:
        raise ValueError(f"{field_name} must be greater than 0")
    return numeric_value
