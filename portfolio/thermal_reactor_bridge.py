from __future__ import annotations

import ctypes
import sys
from ctypes import POINTER, Structure, c_double, c_int, c_size_t
from pathlib import Path


LIBRARY_NAME = "thermal_reactor.dll" if sys.platform.startswith("win") else "libthermal_reactor.so"
LIBRARY_PATH = (
    Path(__file__).resolve().parents[1] / "ThermalReactorSim" / "cpp_core" / LIBRARY_NAME
)


class ThermalReactorParams(Structure):
    _fields_ = [
        ("ca_feed", c_double),
        ("cb_feed", c_double),
        ("feed_temp", c_double),
        ("coolant_inlet_temp", c_double),
        ("ambient_temp", c_double),
        ("flow_rate", c_double),
        ("reactor_volume", c_double),
        ("jacket_tau", c_double),
        ("rho_cp", c_double),
        ("coolant_gain", c_double),
        ("ua", c_double),
        ("ambient_ua", c_double),
        ("delta_h", c_double),
        ("pre_exponential", c_double),
        ("activation_energy", c_double),
        ("order_a", c_double),
        ("catalyst_factor", c_double),
        ("product_decay", c_double),
    ]


class ThermalReactorState(Structure):
    _fields_ = [
        ("ca", c_double),
        ("cb", c_double),
        ("reactor_temp", c_double),
        ("coolant_temp", c_double),
    ]


class ThermalReactorDerived(Structure):
    _fields_ = [
        ("heat_release", c_double),
        ("heat_removal", c_double),
        ("conversion", c_double),
        ("reaction_rate", c_double),
    ]


class ThermalReactorCLib:
    def __init__(self) -> None:
        if not LIBRARY_PATH.exists():
            raise FileNotFoundError(f"Thermal reactor C++ library not found at {LIBRARY_PATH}")
        self.lib = ctypes.CDLL(str(LIBRARY_PATH))
        self.lib.integrate_thermal_reactor_rk4.argtypes = [
            POINTER(c_double),
            c_size_t,
            POINTER(ThermalReactorState),
            POINTER(ThermalReactorState),
            POINTER(ThermalReactorDerived),
            POINTER(ThermalReactorParams),
        ]
        self.lib.integrate_thermal_reactor_rk4.restype = c_int


def run_reactor_simulation(payload: dict) -> dict:
    c_lib = ThermalReactorCLib()

    horizon = _positive(payload.get("horizon"), "horizon")
    n_points = int(payload.get("n_points", payload.get("nPoints", 240)))
    if n_points < 2:
        raise ValueError("n_points must be at least 2")

    params = ThermalReactorParams(
        ca_feed=_positive(payload.get("ca_feed", payload.get("caFeed", payload.get("ca0", 2.4))), "ca_feed"),
        cb_feed=max(float(payload.get("cb_feed", payload.get("cbFeed", 0.0))), 0.0),
        feed_temp=_positive(payload.get("feed_temp", payload.get("feedTemp", 330.0)), "feed_temp"),
        coolant_inlet_temp=_positive(payload.get("coolant_inlet_temp", payload.get("coolantInletTemp", payload.get("tc0", 300.0))), "coolant_inlet_temp"),
        ambient_temp=_positive(payload.get("ambient_temp", payload.get("ambientTemp", 298.0)), "ambient_temp"),
        flow_rate=max(float(payload.get("flow_rate", payload.get("flow", 0.08))), 0.0),
        reactor_volume=_positive(payload.get("reactor_volume", payload.get("reactorVolume", 1.0)), "reactor_volume"),
        jacket_tau=_positive(payload.get("jacket_tau", payload.get("jacketTau", 6.0)), "jacket_tau"),
        rho_cp=_positive(payload.get("rho_cp", payload.get("rhoCp", payload.get("cp", 4200.0))), "rho_cp"),
        coolant_gain=max(float(payload.get("coolant_gain", payload.get("coolantGain", 0.03))), 0.0),
        ua=max(float(payload.get("ua", 180.0)), 0.0),
        ambient_ua=max(float(payload.get("ambient_ua", payload.get("ambientUa", 10.0))), 0.0),
        delta_h=float(payload.get("delta_h", payload.get("deltaH", -85000.0))),
        pre_exponential=_positive(payload.get("pre_exponential", payload.get("preExponential", payload.get("k0", 7.2e6))), "pre_exponential"),
        activation_energy=_positive(payload.get("activation_energy", payload.get("activationEnergy", payload.get("ea", 68000.0))), "activation_energy"),
        order_a=_positive(payload.get("order_a", payload.get("orderA", 1.0)), "order_a"),
        catalyst_factor=_positive(payload.get("catalyst_factor", payload.get("catalystFactor", 1.0)), "catalyst_factor"),
        product_decay=max(float(payload.get("product_decay", payload.get("productDecay", 0.01))), 0.0),
    )

    initial_state = ThermalReactorState(
        ca=_positive(payload.get("ca0", params.ca_feed), "ca0"),
        cb=max(float(payload.get("cb0", 0.0)), 0.0),
        reactor_temp=_positive(payload.get("t0", 335.0), "t0"),
        coolant_temp=_positive(payload.get("tc0", params.coolant_inlet_temp), "tc0"),
    )

    dt = horizon / (n_points - 1)
    time_points = (c_double * n_points)(*[(i * dt) for i in range(n_points)])
    states = (ThermalReactorState * n_points)()
    derived = (ThermalReactorDerived * n_points)()

    status = c_lib.lib.integrate_thermal_reactor_rk4(
        time_points,
        c_size_t(n_points),
        ctypes.byref(initial_state),
        states,
        derived,
        ctypes.byref(params),
    )
    if status != 0:
        raise RuntimeError(f"Thermal reactor C++ integration failed with status {status}")

    state_list = list(states)
    derived_list = list(derived)
    peak_temp = max(state.reactor_temp for state in state_list)
    peak_heat_release = max(item.heat_release for item in derived_list)
    final_conversion = derived_list[-1].conversion
    safety_limit = float(payload.get("safety_limit_temp", payload.get("safetyLimitTemp", 450.0)))

    return {
        "meta": {
            "n_points": n_points,
            "horizon": horizon,
            "request": {
                "ca0": initial_state.ca,
                "cb0": initial_state.cb,
                "t0": initial_state.reactor_temp,
                "tc0": initial_state.coolant_temp,
                "ca_feed": params.ca_feed,
                "flow_rate": params.flow_rate,
                "reactor_volume": params.reactor_volume,
                "jacket_tau": params.jacket_tau,
                "rho_cp": params.rho_cp,
                "coolant_gain": params.coolant_gain,
                "ua": params.ua,
                "ambient_ua": params.ambient_ua,
                "delta_h": params.delta_h,
                "pre_exponential": params.pre_exponential,
                "activation_energy": params.activation_energy,
                "order_a": params.order_a,
                "catalyst_factor": params.catalyst_factor,
                "product_decay": params.product_decay,
                "safety_limit_temp": safety_limit,
            },
        },
        "time": [float(value) for value in time_points],
        "states": {
            "CA": [state.ca for state in state_list],
            "CB": [state.cb for state in state_list],
            "T": [state.reactor_temp for state in state_list],
            "Tc": [state.coolant_temp for state in state_list],
        },
        "derived": {
            "heat_release": [item.heat_release for item in derived_list],
            "heat_removal": [item.heat_removal for item in derived_list],
            "conversion": [item.conversion for item in derived_list],
            "reaction_rate": [item.reaction_rate for item in derived_list],
        },
        "summary": {
            "peak_temp": peak_temp,
            "peak_heat_release": peak_heat_release,
            "final_conversion": final_conversion,
            "safety_margin": safety_limit - peak_temp,
        },
    }


def _positive(value, field_name: str) -> float:
    numeric_value = float(value)
    if numeric_value <= 0:
        raise ValueError(f"{field_name} must be greater than 0")
    return numeric_value
