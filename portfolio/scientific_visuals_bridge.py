from __future__ import annotations

import ctypes
import sys
from ctypes import POINTER, Structure, c_double, c_int
from pathlib import Path


SCENES = {
    "electron_motion": {"index": 0, "label": "Electron Motion", "accent": "cyan"},
    "molecular_vibrations": {"index": 1, "label": "Molecular Vibrations", "accent": "rose"},
    "chemical_reactions": {"index": 2, "label": "Chemical Reactions", "accent": "orange"},
    "crystal_lattice": {"index": 3, "label": "Crystal Lattice Dynamics", "accent": "violet"},
    "wave_interference": {"index": 4, "label": "Wave Interference", "accent": "amber"},
    "electromagnetic_fields": {"index": 5, "label": "Electromagnetic Fields", "accent": "blue"},
    "gravitational_orbits": {"index": 6, "label": "Gravitational Orbits", "accent": "emerald"},
    "fluid_turbulence": {"index": 7, "label": "Fluid Flow and Turbulence", "accent": "teal"},
    "heat_diffusion": {"index": 8, "label": "Heat Diffusion", "accent": "red"},
    "sound_waves": {"index": 9, "label": "Sound Waves", "accent": "sky"},
    "quantum_probability": {"index": 10, "label": "Quantum Probability Cloud", "accent": "indigo"},
    "phase_transitions": {"index": 11, "label": "Phase Transitions", "accent": "pink"},
    "neural_signal": {"index": 12, "label": "Neural Signal Propagation", "accent": "lime"},
}

LIBRARY_NAME = "scientific_visuals.dll" if sys.platform.startswith("win") else "libscientific_visuals.so"
LIBRARY_PATH = Path(__file__).resolve().parents[1] / "ScientificVisualsSim" / "cpp_core" / LIBRARY_NAME


class ScientificVisualsParams(Structure):
    _fields_ = [
        ("scene_index", c_int),
        ("frame_count", c_int),
        ("points_per_frame", c_int),
    ]


class ScientificVisualPoint(Structure):
    _fields_ = [
        ("time_value", c_double),
        ("x", c_double),
        ("y", c_double),
        ("z", c_double),
        ("intensity", c_double),
        ("scalar_a", c_double),
        ("scalar_b", c_double),
        ("category", c_int),
    ]


class ScientificVisualSummary(Structure):
    _fields_ = [
        ("scale", c_double),
        ("metric_a", c_double),
        ("metric_b", c_double),
        ("metric_c", c_double),
    ]


class ScientificVisualsCLib:
    def __init__(self) -> None:
        if not LIBRARY_PATH.exists():
            raise FileNotFoundError(f"Scientific visuals C++ library not found at {LIBRARY_PATH}")
        self.lib = ctypes.CDLL(str(LIBRARY_PATH))
        self.lib.generate_scientific_visual_scene.argtypes = [
            POINTER(ScientificVisualsParams),
            POINTER(ScientificVisualPoint),
            POINTER(ScientificVisualSummary),
        ]
        self.lib.generate_scientific_visual_scene.restype = c_int


def list_scientific_scenes() -> list[dict]:
    return [
        {"id": scene_id, "label": meta["label"], "accent": meta["accent"]}
        for scene_id, meta in SCENES.items()
    ]


def run_scientific_visual_scene(scene_id: str, frame_count: int = 32, points_per_frame: int = 180) -> dict:
    if scene_id not in SCENES:
        raise ValueError("Unknown scene")
    if frame_count < 2:
        raise ValueError("frame_count must be at least 2")
    if points_per_frame < 32:
        raise ValueError("points_per_frame must be at least 32")

    params = ScientificVisualsParams(
        scene_index=SCENES[scene_id]["index"],
        frame_count=frame_count,
        points_per_frame=points_per_frame,
    )
    total_points = frame_count * points_per_frame
    points = (ScientificVisualPoint * total_points)()
    summary = ScientificVisualSummary()
    c_lib = ScientificVisualsCLib()
    status = c_lib.lib.generate_scientific_visual_scene(
        ctypes.byref(params),
        points,
        ctypes.byref(summary),
    )
    if status != 0:
        raise RuntimeError(f"Scientific visuals C++ scene generation failed with status {status}")

    point_list = list(points)
    frames: list[list[dict]] = []
    for frame_idx in range(frame_count):
        start = frame_idx * points_per_frame
        stop = start + points_per_frame
        frames.append([
            {
                "t": point.time_value,
                "x": point.x,
                "y": point.y,
                "z": point.z,
                "intensity": point.intensity,
                "a": point.scalar_a,
                "b": point.scalar_b,
                "category": point.category,
            }
            for point in point_list[start:stop]
        ])

    return {
        "scene": {
            "id": scene_id,
            "label": SCENES[scene_id]["label"],
            "accent": SCENES[scene_id]["accent"],
        },
        "meta": {
            "frame_count": frame_count,
            "points_per_frame": points_per_frame,
        },
        "summary": {
            "scale": summary.scale,
            "metric_a": summary.metric_a,
            "metric_b": summary.metric_b,
            "metric_c": summary.metric_c,
        },
        "frames": frames,
    }
