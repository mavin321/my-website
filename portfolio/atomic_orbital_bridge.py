from __future__ import annotations

import ctypes
import sys
from ctypes import POINTER, Structure, c_double, c_int, c_uint
from pathlib import Path


LIBRARY_NAME = "atomic_orbital.dll" if sys.platform.startswith("win") else "libatomic_orbital.so"
LIBRARY_PATH = (
    Path(__file__).resolve().parents[1] / "AtomicOrbitalSim" / "cpp_core" / LIBRARY_NAME
)


class AtomicOrbitalParams(Structure):
    _fields_ = [
        ("n", c_int),
        ("l", c_int),
        ("m", c_int),
        ("sample_count", c_int),
        ("radial_max", c_double),
        ("seed", c_uint),
    ]


class AtomicOrbitalSample(Structure):
    _fields_ = [
        ("x", c_double),
        ("y", c_double),
        ("z", c_double),
        ("radius", c_double),
        ("theta", c_double),
        ("phi", c_double),
        ("probability_density", c_double),
        ("normalized_intensity", c_double),
    ]


class AtomicOrbitalCLib:
    def __init__(self) -> None:
        if not LIBRARY_PATH.exists():
            raise FileNotFoundError(f"Atomic orbital C++ library not found at {LIBRARY_PATH}")
        self.lib = ctypes.CDLL(str(LIBRARY_PATH))
        self.lib.sample_atomic_orbital.argtypes = [
            POINTER(AtomicOrbitalParams),
            POINTER(AtomicOrbitalSample),
        ]
        self.lib.sample_atomic_orbital.restype = c_int


def run_atomic_orbital_simulation(payload: dict) -> dict:
    n = int(payload.get("n", 2))
    l = int(payload.get("l", 1))
    m = int(payload.get("m", 0))
    sample_count = int(payload.get("sample_count", 1400))
    radial_max = float(payload.get("radial_max", max(12.0, n * n * 4.0)))
    seed = int(payload.get("seed", 12345))

    params = AtomicOrbitalParams(
        n=n,
        l=l,
        m=m,
        sample_count=sample_count,
        radial_max=radial_max,
        seed=seed,
    )
    if n <= 0 or l < 0 or l >= n or abs(m) > l:
        raise ValueError("Quantum numbers must satisfy n > 0, 0 <= l < n, and |m| <= l")
    if sample_count <= 0:
        raise ValueError("sample_count must be greater than 0")
    if radial_max <= 0:
        raise ValueError("radial_max must be greater than 0")

    c_lib = AtomicOrbitalCLib()
    samples = (AtomicOrbitalSample * sample_count)()
    status = c_lib.lib.sample_atomic_orbital(ctypes.byref(params), samples)
    if status != 0:
        raise RuntimeError(f"Atomic orbital C++ sampling failed with status {status}")

    sample_list = list(samples)
    max_radius = max(sample.radius for sample in sample_list)
    mean_radius = sum(sample.radius for sample in sample_list) / sample_count
    mean_intensity = sum(sample.normalized_intensity for sample in sample_list) / sample_count

    return {
        "meta": {
            "n": n,
            "l": l,
            "m": m,
            "sample_count": sample_count,
            "radial_max": radial_max,
        },
        "samples": [
            {
                "x": sample.x,
                "y": sample.y,
                "z": sample.z,
                "radius": sample.radius,
                "theta": sample.theta,
                "phi": sample.phi,
                "probability_density": sample.probability_density,
                "normalized_intensity": sample.normalized_intensity,
            }
            for sample in sample_list
        ],
        "summary": {
            "max_radius": max_radius,
            "mean_radius": mean_radius,
            "mean_intensity": mean_intensity,
        },
    }
