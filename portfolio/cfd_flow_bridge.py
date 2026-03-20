from __future__ import annotations

import ctypes
import sys
from ctypes import POINTER, Structure, c_double, c_int
from pathlib import Path


LIBRARY_NAME = "cfd_flow.dll" if sys.platform.startswith("win") else "libcfd_flow.so"
LIBRARY_PATH = Path(__file__).resolve().parents[1] / "CFDFlowSim" / "cpp_core" / LIBRARY_NAME


class CFDFlowParams(Structure):
    _fields_ = [
        ("length", c_double),
        ("diameter", c_double),
        ("mass_flow", c_double),
        ("density", c_double),
        ("viscosity", c_double),
        ("roughness", c_double),
        ("inlet_temp", c_double),
        ("wall_temp", c_double),
        ("cp", c_double),
        ("conductivity", c_double),
        ("axial_points", c_int),
        ("radial_points", c_int),
    ]


class CFDFlowPoint(Structure):
    _fields_ = [
        ("x", c_double),
        ("r", c_double),
        ("velocity", c_double),
        ("temperature", c_double),
        ("pressure", c_double),
        ("turbulence_intensity", c_double),
    ]


class CFDFlowSummary(Structure):
    _fields_ = [
        ("reynolds", c_double),
        ("friction_factor", c_double),
        ("pressure_drop", c_double),
        ("nusselt", c_double),
        ("heat_transfer_coeff", c_double),
        ("bulk_velocity", c_double),
        ("max_velocity", c_double),
    ]


class CFDFlowCLib:
    def __init__(self) -> None:
        if not LIBRARY_PATH.exists():
            raise FileNotFoundError(f"CFD flow C++ library not found at {LIBRARY_PATH}")
        self.lib = ctypes.CDLL(str(LIBRARY_PATH))
        self.lib.simulate_pipe_flow.argtypes = [
            POINTER(CFDFlowParams),
            POINTER(CFDFlowPoint),
            POINTER(CFDFlowSummary),
        ]
        self.lib.simulate_pipe_flow.restype = c_int


def run_cfd_flow_simulation(payload: dict) -> dict:
    axial_points = int(payload.get("axial_points", 60))
    radial_points = int(payload.get("radial_points", 26))
    if axial_points < 2 or radial_points < 2:
        raise ValueError("axial_points and radial_points must be at least 2")

    params = CFDFlowParams(
        length=_positive(payload.get("length", 8.0), "length"),
        diameter=_positive(payload.get("diameter", 0.18), "diameter"),
        mass_flow=_positive(payload.get("mass_flow", 5.5), "mass_flow"),
        density=_positive(payload.get("density", 998.0), "density"),
        viscosity=_positive(payload.get("viscosity", 0.001), "viscosity"),
        roughness=max(float(payload.get("roughness", 0.000045)), 0.0),
        inlet_temp=_positive(payload.get("inlet_temp", 295.0), "inlet_temp"),
        wall_temp=_positive(payload.get("wall_temp", 335.0), "wall_temp"),
        cp=_positive(payload.get("cp", 4180.0), "cp"),
        conductivity=_positive(payload.get("conductivity", 0.6), "conductivity"),
        axial_points=axial_points,
        radial_points=radial_points,
    )

    total_points = axial_points * radial_points
    points = (CFDFlowPoint * total_points)()
    summary = CFDFlowSummary()
    c_lib = CFDFlowCLib()

    status = c_lib.lib.simulate_pipe_flow(
        ctypes.byref(params),
        points,
        ctypes.byref(summary),
    )
    if status < 0:
        raise RuntimeError(f"CFD flow simulation failed with status {status}")

    point_list = list(points)
    return {
        "meta": {
            "axial_points": axial_points,
            "radial_points": radial_points,
            "point_count": total_points,
        },
        "summary": {
            "reynolds": summary.reynolds,
            "friction_factor": summary.friction_factor,
            "pressure_drop": summary.pressure_drop,
            "nusselt": summary.nusselt,
            "heat_transfer_coeff": summary.heat_transfer_coeff,
            "bulk_velocity": summary.bulk_velocity,
            "max_velocity": summary.max_velocity,
        },
        "points": [
            {
                "x": point.x,
                "r": point.r,
                "velocity": point.velocity,
                "temperature": point.temperature,
                "pressure": point.pressure,
                "turbulence_intensity": point.turbulence_intensity,
            }
            for point in point_list
        ],
    }


def _positive(value, field_name: str) -> float:
    numeric_value = float(value)
    if numeric_value <= 0:
        raise ValueError(f"{field_name} must be greater than 0")
    return numeric_value
