from __future__ import annotations

import ctypes
import sys
from ctypes import POINTER, Structure, c_double, c_int
from pathlib import Path


LIBRARY_NAME = "design_space.dll" if sys.platform.startswith("win") else "libdesign_space.so"
LIBRARY_PATH = Path(__file__).resolve().parents[1] / "DesignSpaceSim" / "cpp_core" / LIBRARY_NAME


class DesignSpaceParams(Structure):
    _fields_ = [
        ("temp_min", c_double),
        ("temp_max", c_double),
        ("tau_min", c_double),
        ("tau_max", c_double),
        ("feed_concentration", c_double),
        ("coolant_temp", c_double),
        ("pre_exponential_main", c_double),
        ("activation_energy_main", c_double),
        ("pre_exponential_side", c_double),
        ("activation_energy_side", c_double),
        ("delta_h_main", c_double),
        ("delta_h_side", c_double),
        ("ua", c_double),
        ("rho_cp", c_double),
        ("reactor_volume", c_double),
        ("product_price", c_double),
        ("utility_cost", c_double),
        ("temp_points", c_int),
        ("tau_points", c_int),
    ]


class DesignSpacePoint(Structure):
    _fields_ = [
        ("temperature", c_double),
        ("residence_time", c_double),
        ("conversion", c_double),
        ("selectivity", c_double),
        ("yield_value", c_double),
        ("heat_release", c_double),
        ("heat_duty", c_double),
        ("space_time_yield", c_double),
        ("profitability", c_double),
        ("safety_index", c_double),
    ]


class DesignSpaceSummary(Structure):
    _fields_ = [
        ("best_yield", c_double),
        ("best_profitability", c_double),
        ("best_space_time_yield", c_double),
        ("lowest_heat_duty", c_double),
        ("pareto_count", c_int),
    ]


class DesignSpaceCLib:
    def __init__(self) -> None:
        if not LIBRARY_PATH.exists():
            raise FileNotFoundError(f"Design space C++ library not found at {LIBRARY_PATH}")
        self.lib = ctypes.CDLL(str(LIBRARY_PATH))
        self.lib.simulate_design_space.argtypes = [
            POINTER(DesignSpaceParams),
            POINTER(DesignSpacePoint),
            POINTER(c_int),
            POINTER(DesignSpaceSummary),
        ]
        self.lib.simulate_design_space.restype = c_int


def run_design_space_simulation(payload: dict) -> dict:
    temp_points = int(payload.get("temp_points", 24))
    tau_points = int(payload.get("tau_points", 20))
    if temp_points < 2 or tau_points < 2:
        raise ValueError("temp_points and tau_points must be at least 2")

    params = DesignSpaceParams(
        temp_min=_positive(payload.get("temp_min", 320.0), "temp_min"),
        temp_max=_positive(payload.get("temp_max", 430.0), "temp_max"),
        tau_min=_positive(payload.get("tau_min", 0.4), "tau_min"),
        tau_max=_positive(payload.get("tau_max", 6.0), "tau_max"),
        feed_concentration=_positive(payload.get("feed_concentration", 2.8), "feed_concentration"),
        coolant_temp=_positive(payload.get("coolant_temp", 305.0), "coolant_temp"),
        pre_exponential_main=_positive(payload.get("pre_exponential_main", 8.5e6), "pre_exponential_main"),
        activation_energy_main=_positive(payload.get("activation_energy_main", 68000.0), "activation_energy_main"),
        pre_exponential_side=_positive(payload.get("pre_exponential_side", 1.2e7), "pre_exponential_side"),
        activation_energy_side=_positive(payload.get("activation_energy_side", 76000.0), "activation_energy_side"),
        delta_h_main=float(payload.get("delta_h_main", -72000.0)),
        delta_h_side=float(payload.get("delta_h_side", -98000.0)),
        ua=_positive(payload.get("ua", 240.0), "ua"),
        rho_cp=_positive(payload.get("rho_cp", 4200.0), "rho_cp"),
        reactor_volume=_positive(payload.get("reactor_volume", 1.0), "reactor_volume"),
        product_price=_positive(payload.get("product_price", 1500.0), "product_price"),
        utility_cost=_positive(payload.get("utility_cost", 0.02), "utility_cost"),
        temp_points=temp_points,
        tau_points=tau_points,
    )

    total_points = temp_points * tau_points
    points = (DesignSpacePoint * total_points)()
    pareto_flags = (c_int * total_points)()
    summary = DesignSpaceSummary()
    c_lib = DesignSpaceCLib()
    status = c_lib.lib.simulate_design_space(
        ctypes.byref(params),
        points,
        pareto_flags,
        ctypes.byref(summary),
    )
    if status != 0:
        raise RuntimeError(f"Design space C++ simulation failed with status {status}")

    point_list = list(points)
    pareto_list = list(pareto_flags)
    return {
        "meta": {
            "temp_points": temp_points,
            "tau_points": tau_points,
            "point_count": total_points,
        },
        "summary": {
            "best_yield": summary.best_yield,
            "best_profitability": summary.best_profitability,
            "best_space_time_yield": summary.best_space_time_yield,
            "lowest_heat_duty": summary.lowest_heat_duty,
            "pareto_count": summary.pareto_count,
        },
        "points": [
            {
                "temperature": point.temperature,
                "residence_time": point.residence_time,
                "conversion": point.conversion,
                "selectivity": point.selectivity,
                "yield_value": point.yield_value,
                "heat_release": point.heat_release,
                "heat_duty": point.heat_duty,
                "space_time_yield": point.space_time_yield,
                "profitability": point.profitability,
                "safety_index": point.safety_index,
                "pareto": bool(pareto_list[index]),
            }
            for index, point in enumerate(point_list)
        ],
    }


def _positive(value, field_name: str) -> float:
    numeric_value = float(value)
    if numeric_value <= 0:
        raise ValueError(f"{field_name} must be greater than 0")
    return numeric_value
