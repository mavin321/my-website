import ctypes
from ctypes import POINTER, c_double, c_size_t, c_int
from pathlib import Path
from typing import Tuple

import numpy as np

from fermentation_sim.config import settings


class KineticParams(ctypes.Structure):
    _fields_ = [
        ("mu_max", c_double),
        ("Ks", c_double),
        ("Yxs", c_double),
        ("Ypx", c_double),
        ("kd", c_double),
        ("Kio", c_double),
        ("Kp", c_double),
        ("maintenance", c_double),
        ("Q10", c_double),
        ("T_ref", c_double),
        ("Kla", c_double),
        ("C_star", c_double),
        ("O2_maintenance", c_double),
        ("delta_H", c_double),
        ("Cp", c_double),
        ("U", c_double),
        ("A", c_double),
        ("rho", c_double),
    ]


class OperatingConditions(ctypes.Structure):
    _fields_ = [
        ("volume", c_double),
        ("feed_rate", c_double),
        ("feed_substrate_conc", c_double),
        ("feed_start", c_double),
        ("feed_rate_end", c_double),
        ("feed_tau", c_double),
        ("feed_mode", c_int),
        ("do_setpoint", c_double),
        ("do_Kp", c_double),
        ("aeration_rate", c_double),
        ("agitation_speed", c_double),
        ("cooling_temp", c_double),
        ("coolant_flow", c_double),
        ("agit_power_coeff", c_double),
        ("agit_heat_eff", c_double),
    ]


class FermentationCLib:
    """Wrapper around the compiled C fermentation library."""

    def __init__(self, library_path: str | Path | None = None) -> None:
        lib_path = Path(library_path or settings.c_library_path)
        if not lib_path.exists():
            raise FileNotFoundError(f"C library not found at {lib_path}")

        self.lib = ctypes.CDLL(str(lib_path))
        self._configure_signatures()

    def _configure_signatures(self) -> None:
        self.lib.integrate_fermentation_rk4.argtypes = [
            POINTER(c_double),  # time_points
            c_size_t,           # n_points
            POINTER(c_double),  # y0
            POINTER(c_double),  # y_out
            POINTER(KineticParams),
            POINTER(OperatingConditions),
        ]
        self.lib.integrate_fermentation_rk4.restype = c_int

    def integrate(
        self,
        t: np.ndarray,
        y0: np.ndarray,
        kinetic: KineticParams,
        ops: OperatingConditions,
    ) -> Tuple[int, np.ndarray]:
        """Run integration; returns (status, y_out)."""
        n_points = t.size
        state_dim = y0.size

        t_c = t.astype("float64")
        y0_c = y0.astype("float64")
        y_out = np.zeros((n_points, state_dim), dtype="float64")

        status = self.lib.integrate_fermentation_rk4(
            t_c.ctypes.data_as(POINTER(c_double)),
            c_size_t(n_points),
            y0_c.ctypes.data_as(POINTER(c_double)),
            y_out.ctypes.data_as(POINTER(c_double)),
            ctypes.byref(kinetic),
            ctypes.byref(ops),
        )
        return status, y_out
