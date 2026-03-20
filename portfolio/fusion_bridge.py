from __future__ import annotations

import ctypes
import sys
from ctypes import POINTER, Structure, c_double, c_int
from pathlib import Path


LIBRARY_NAME = "fusion_plasma.dll" if sys.platform.startswith("win") else "libfusion_plasma.so"
LIBRARY_PATH = Path(__file__).resolve().parents[1] / "FusionSim" / "cpp_core" / LIBRARY_NAME


class FusionPlasmaParams(Structure):
    _fields_ = [
        ("major_radius", c_double),
        ("minor_radius", c_double),
        ("magnetic_field", c_double),
        ("plasma_current", c_double),
        ("density_0", c_double),
        ("temperature_0", c_double),
        ("helium_fraction_0", c_double),
        ("confinement_time", c_double),
        ("auxiliary_power", c_double),
        ("wall_reflectivity", c_double),
        ("impurity_fraction", c_double),
        ("fueling_rate", c_double),
        ("radiation_coeff", c_double),
        ("alpha_heating_fraction", c_double),
        ("time_end", c_double),
        ("n_points", c_int),
    ]


class FusionPlasmaPoint(Structure):
    _fields_ = [
        ("time", c_double),
        ("density", c_double),
        ("temperature", c_double),
        ("helium_fraction", c_double),
        ("beta_n", c_double),
        ("reactivity", c_double),
        ("fusion_power", c_double),
        ("alpha_power", c_double),
        ("bremsstrahlung_loss", c_double),
        ("confinement_loss", c_double),
        ("q_value", c_double),
    ]


class FusionPlasmaSummary(Structure):
    _fields_ = [
        ("peak_temperature", c_double),
        ("peak_fusion_power", c_double),
        ("max_q", c_double),
        ("final_density", c_double),
        ("final_temperature", c_double),
        ("triple_product_peak", c_double),
    ]


class FusionCLib:
    def __init__(self) -> None:
        if not LIBRARY_PATH.exists():
            raise FileNotFoundError(f"Fusion plasma C++ library not found at {LIBRARY_PATH}")
        self.lib = ctypes.CDLL(str(LIBRARY_PATH))
        self.lib.simulate_fusion_plasma.argtypes = [
            POINTER(FusionPlasmaParams),
            POINTER(FusionPlasmaPoint),
            POINTER(FusionPlasmaSummary),
        ]
        self.lib.simulate_fusion_plasma.restype = c_int


def run_fusion_simulation(payload: dict) -> dict:
    n_points = int(payload.get("n_points", 280))
    if n_points < 2:
        raise ValueError("n_points must be at least 2")

    params = FusionPlasmaParams(
        major_radius=_positive(payload.get("major_radius", 6.2), "major_radius"),
        minor_radius=_positive(payload.get("minor_radius", 2.0), "minor_radius"),
        magnetic_field=_positive(payload.get("magnetic_field", 5.3), "magnetic_field"),
        plasma_current=_positive(payload.get("plasma_current", 15.0e6), "plasma_current"),
        density_0=_positive(payload.get("density_0", 8.5e19), "density_0"),
        temperature_0=_positive(payload.get("temperature_0", 12.0), "temperature_0"),
        helium_fraction_0=max(float(payload.get("helium_fraction_0", 0.02)), 0.0),
        confinement_time=_positive(payload.get("confinement_time", 3.5), "confinement_time"),
        auxiliary_power=_positive(payload.get("auxiliary_power", 4.5e7), "auxiliary_power"),
        wall_reflectivity=max(float(payload.get("wall_reflectivity", 0.25)), 0.0),
        impurity_fraction=max(float(payload.get("impurity_fraction", 0.015)), 0.0),
        fueling_rate=max(float(payload.get("fueling_rate", 1.4e18)), 0.0),
        radiation_coeff=_positive(payload.get("radiation_coeff", 5.35e-37), "radiation_coeff"),
        alpha_heating_fraction=max(float(payload.get("alpha_heating_fraction", 0.88)), 0.0),
        time_end=_positive(payload.get("time_end", 18.0), "time_end"),
        n_points=n_points,
    )

    points = (FusionPlasmaPoint * n_points)()
    summary = FusionPlasmaSummary()
    c_lib = FusionCLib()
    status = c_lib.lib.simulate_fusion_plasma(
        ctypes.byref(params),
        points,
        ctypes.byref(summary),
    )
    if status != 0:
        raise RuntimeError(f"Fusion plasma simulation failed with status {status}")

    point_list = list(points)
    return {
        "meta": {
            "n_points": n_points,
            "time_end": params.time_end,
        },
        "states": {
            "time": [point.time for point in point_list],
            "density": [point.density for point in point_list],
            "temperature": [point.temperature for point in point_list],
            "helium_fraction": [point.helium_fraction for point in point_list],
            "beta_n": [point.beta_n for point in point_list],
            "reactivity": [point.reactivity for point in point_list],
            "fusion_power": [point.fusion_power for point in point_list],
            "alpha_power": [point.alpha_power for point in point_list],
            "bremsstrahlung_loss": [point.bremsstrahlung_loss for point in point_list],
            "confinement_loss": [point.confinement_loss for point in point_list],
            "q_value": [point.q_value for point in point_list],
        },
        "summary": {
            "peak_temperature": summary.peak_temperature,
            "peak_fusion_power": summary.peak_fusion_power,
            "max_q": summary.max_q,
            "final_density": summary.final_density,
            "final_temperature": summary.final_temperature,
            "triple_product_peak": summary.triple_product_peak,
        },
    }


def _positive(value, field_name: str) -> float:
    numeric_value = float(value)
    if numeric_value <= 0:
        raise ValueError(f"{field_name} must be greater than 0")
    return numeric_value
