from __future__ import annotations

import ctypes
import sys
from ctypes import POINTER, Structure, c_double, c_int, c_size_t
from pathlib import Path


LIBRARY_NAME = "separation_process.dll" if sys.platform.startswith("win") else "libseparation_process.so"
LIBRARY_PATH = (
    Path(__file__).resolve().parents[1] / "SeparationProcessSim" / "cpp_core" / LIBRARY_NAME
)


class SeparationParams(Structure):
    _fields_ = [
        ("feed_flow", c_double),
        ("feed_z_light", c_double),
        ("feed_temp", c_double),
        ("feed_pressure", c_double),
        ("reflux_ratio", c_double),
        ("boilup_ratio", c_double),
        ("tray_efficiency", c_double),
        ("relative_volatility_ref", c_double),
        ("alpha_temp_coeff", c_double),
        ("condenser_ua", c_double),
        ("reboiler_ua", c_double),
        ("condenser_temp", c_double),
        ("steam_temp", c_double),
        ("top_holdup", c_double),
        ("bottom_holdup", c_double),
        ("top_tau", c_double),
        ("bottom_tau", c_double),
        ("cp_mixture", c_double),
    ]


class SeparationState(Structure):
    _fields_ = [
        ("top_x_light", c_double),
        ("bottom_x_light", c_double),
        ("top_temp", c_double),
        ("bottom_temp", c_double),
    ]


class SeparationDerived(Structure):
    _fields_ = [
        ("top_y_light", c_double),
        ("bottom_y_light", c_double),
        ("distillate_flow", c_double),
        ("bottoms_flow", c_double),
        ("condenser_duty", c_double),
        ("reboiler_duty", c_double),
        ("separation_index", c_double),
    ]


class SeparationCLib:
    def __init__(self) -> None:
        if not LIBRARY_PATH.exists():
            raise FileNotFoundError(f"Separation process C++ library not found at {LIBRARY_PATH}")
        self.lib = ctypes.CDLL(str(LIBRARY_PATH))
        self.lib.integrate_separation_process_rk4.argtypes = [
            POINTER(c_double),
            c_size_t,
            POINTER(SeparationState),
            POINTER(SeparationState),
            POINTER(SeparationDerived),
            POINTER(SeparationParams),
        ]
        self.lib.integrate_separation_process_rk4.restype = c_int


def run_separation_simulation(payload: dict) -> dict:
    c_lib = SeparationCLib()
    horizon = _positive(payload.get("horizon"), "horizon")
    n_points = int(payload.get("n_points", 240))
    if n_points < 2:
        raise ValueError("n_points must be at least 2")

    params = SeparationParams(
        feed_flow=_positive(payload.get("feed_flow", 100.0), "feed_flow"),
        feed_z_light=_fraction(payload.get("feed_z_light", 0.5), "feed_z_light"),
        feed_temp=_positive(payload.get("feed_temp", 360.0), "feed_temp"),
        feed_pressure=_positive(payload.get("feed_pressure", 1.8), "feed_pressure"),
        reflux_ratio=_positive(payload.get("reflux_ratio", 2.2), "reflux_ratio"),
        boilup_ratio=_positive(payload.get("boilup_ratio", 1.6), "boilup_ratio"),
        tray_efficiency=_fraction(payload.get("tray_efficiency", 0.72), "tray_efficiency"),
        relative_volatility_ref=_positive(payload.get("relative_volatility_ref", 2.2), "relative_volatility_ref"),
        alpha_temp_coeff=max(float(payload.get("alpha_temp_coeff", 0.004)), 0.0),
        condenser_ua=_positive(payload.get("condenser_ua", 240.0), "condenser_ua"),
        reboiler_ua=_positive(payload.get("reboiler_ua", 280.0), "reboiler_ua"),
        condenser_temp=_positive(payload.get("condenser_temp", 305.0), "condenser_temp"),
        steam_temp=_positive(payload.get("steam_temp", 420.0), "steam_temp"),
        top_holdup=_positive(payload.get("top_holdup", 12.0), "top_holdup"),
        bottom_holdup=_positive(payload.get("bottom_holdup", 18.0), "bottom_holdup"),
        top_tau=_positive(payload.get("top_tau", 8.0), "top_tau"),
        bottom_tau=_positive(payload.get("bottom_tau", 10.0), "bottom_tau"),
        cp_mixture=_positive(payload.get("cp_mixture", 3200.0), "cp_mixture"),
    )

    initial_state = SeparationState(
        top_x_light=_fraction(payload.get("top_x_light", 0.9), "top_x_light"),
        bottom_x_light=_fraction(payload.get("bottom_x_light", 0.12), "bottom_x_light"),
        top_temp=_positive(payload.get("top_temp", 338.0), "top_temp"),
        bottom_temp=_positive(payload.get("bottom_temp", 392.0), "bottom_temp"),
    )

    dt = horizon / (n_points - 1)
    time_points = (c_double * n_points)(*[(i * dt) for i in range(n_points)])
    states = (SeparationState * n_points)()
    derived = (SeparationDerived * n_points)()

    status = c_lib.lib.integrate_separation_process_rk4(
        time_points,
        c_size_t(n_points),
        ctypes.byref(initial_state),
        states,
        derived,
        ctypes.byref(params),
    )
    if status != 0:
        raise RuntimeError(f"Separation process C++ integration failed with status {status}")

    state_list = list(states)
    derived_list = list(derived)
    top_purity = max(state.top_x_light for state in state_list)
    bottom_impurity = min(state.bottom_x_light for state in state_list)
    energy_intensity = max(
        (item.condenser_duty + item.reboiler_duty) / max(item.distillate_flow, 1e-6)
        for item in derived_list
    )

    return {
        "meta": {
            "n_points": n_points,
            "horizon": horizon,
        },
        "time": [float(value) for value in time_points],
        "states": {
            "x_top": [item.top_x_light for item in state_list],
            "x_bottom": [item.bottom_x_light for item in state_list],
            "T_top": [item.top_temp for item in state_list],
            "T_bottom": [item.bottom_temp for item in state_list],
        },
        "derived": {
            "y_top": [item.top_y_light for item in derived_list],
            "y_bottom": [item.bottom_y_light for item in derived_list],
            "distillate_flow": [item.distillate_flow for item in derived_list],
            "bottoms_flow": [item.bottoms_flow for item in derived_list],
            "condenser_duty": [item.condenser_duty for item in derived_list],
            "reboiler_duty": [item.reboiler_duty for item in derived_list],
            "separation_index": [item.separation_index for item in derived_list],
        },
        "summary": {
            "top_purity": top_purity,
            "bottom_impurity": bottom_impurity,
            "energy_intensity": energy_intensity,
            "max_separation_index": max(item.separation_index for item in derived_list),
        },
    }


def _positive(value, field_name: str) -> float:
    numeric_value = float(value)
    if numeric_value <= 0:
        raise ValueError(f"{field_name} must be greater than 0")
    return numeric_value


def _fraction(value, field_name: str) -> float:
    numeric_value = float(value)
    if not 0 < numeric_value < 1:
        raise ValueError(f"{field_name} must be between 0 and 1")
    return numeric_value
