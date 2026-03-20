from __future__ import annotations

from typing import Dict, List, Optional

# Simple in-memory preset store for organisms and substrates.
# Values are illustrative starting points meant to be calibrated later.

MICROBE_DB: Dict[str, Dict[str, dict]] = {
    "E_coli_K12": {
        "glucose": {
            "label": "E. coli K-12 on glucose",
            "default_initials": {"X0": 0.5, "S0": 20.0, "P0": 0.0, "DO0": 0.005, "T0": 37.0},
            "kinetics": {
                "mu_max": 0.65,
                "Ks": 0.02,
                "Yxs": 0.5,
                "Ypx": 0.05,
                "kd": 0.01,
                "Kio": 0.0001,
                "Kp": 50.0,
                "maintenance": 0.006,
                "O2_maintenance": 0.0008,
            },
            "thermal": {"delta_H": 4.2e5, "Cp": 4.18e3, "U": 500.0, "A": 2.0, "rho": 1000.0},
            "mass_transfer": {"Kla": 220.0, "C_star": 0.007},
        },
        "glycerol": {
            "label": "E. coli K-12 on glycerol",
            "default_initials": {"X0": 0.4, "S0": 25.0, "P0": 0.0, "DO0": 0.006, "T0": 37.0},
            "kinetics": {
                "mu_max": 0.45,
                "Ks": 0.05,
                "Yxs": 0.45,
                "Ypx": 0.03,
                "kd": 0.012,
                "Kio": 0.00012,
                "Kp": 40.0,
                "maintenance": 0.007,
                "O2_maintenance": 0.0009,
            },
            "thermal": {"delta_H": 4.3e5, "Cp": 4.0e3, "U": 480.0, "A": 2.0, "rho": 1000.0},
            "mass_transfer": {"Kla": 210.0, "C_star": 0.007},
        },
        "lactose": {
            "label": "E. coli K-12 on lactose",
            "default_initials": {"X0": 0.3, "S0": 30.0, "P0": 0.0, "DO0": 0.006, "T0": 37.0},
            "kinetics": {
                "mu_max": 0.35,
                "Ks": 0.08,
                "Yxs": 0.48,
                "Ypx": 0.02,
                "kd": 0.012,
                "Kio": 0.0001,
                "Kp": 35.0,
                "maintenance": 0.0075,
                "O2_maintenance": 0.001,
            },
            "thermal": {"delta_H": 4.1e5, "Cp": 4.18e3, "U": 480.0, "A": 2.0, "rho": 1000.0},
            "mass_transfer": {"Kla": 200.0, "C_star": 0.007},
        },
    },
    "Saccharomyces_cerevisiae": {
        "glucose": {
            "label": "S. cerevisiae on glucose",
            "default_initials": {"X0": 0.8, "S0": 30.0, "P0": 0.0, "DO0": 0.004, "T0": 30.0},
            "kinetics": {
                "mu_max": 0.42,
                "Ks": 0.05,
                "Yxs": 0.48,
                "Ypx": 0.1,
                "kd": 0.005,
                "Kio": 0.00008,
                "Kp": 60.0,
                "maintenance": 0.004,
                "O2_maintenance": 0.0006,
            },
            "thermal": {"delta_H": 3.8e5, "Cp": 4.0e3, "U": 520.0, "A": 2.2, "rho": 1020.0},
            "mass_transfer": {"Kla": 180.0, "C_star": 0.0065},
        },
        "sucrose": {
            "label": "S. cerevisiae on sucrose",
            "default_initials": {"X0": 0.8, "S0": 40.0, "P0": 0.0, "DO0": 0.004, "T0": 30.0},
            "kinetics": {
                "mu_max": 0.38,
                "Ks": 0.06,
                "Yxs": 0.46,
                "Ypx": 0.12,
                "kd": 0.006,
                "Kio": 0.00009,
                "Kp": 55.0,
                "maintenance": 0.0045,
                "O2_maintenance": 0.0007,
            },
            "thermal": {"delta_H": 3.9e5, "Cp": 3.9e3, "U": 520.0, "A": 2.2, "rho": 1020.0},
            "mass_transfer": {"Kla": 175.0, "C_star": 0.0065},
        },
        "xylose": {
            "label": "S. cerevisiae on xylose (engineered)",
            "default_initials": {"X0": 0.5, "S0": 25.0, "P0": 0.0, "DO0": 0.004, "T0": 30.0},
            "kinetics": {
                "mu_max": 0.28,
                "Ks": 0.07,
                "Yxs": 0.4,
                "Ypx": 0.08,
                "kd": 0.006,
                "Kio": 0.0001,
                "Kp": 40.0,
                "maintenance": 0.004,
                "O2_maintenance": 0.0007,
            },
            "thermal": {"delta_H": 3.7e5, "Cp": 3.9e3, "U": 520.0, "A": 2.2, "rho": 1020.0},
            "mass_transfer": {"Kla": 170.0, "C_star": 0.0065},
        },
    },
    "Bacillus_subtilis": {
        "glucose": {
            "label": "B. subtilis on glucose",
            "default_initials": {"X0": 0.6, "S0": 20.0, "P0": 0.0, "DO0": 0.006, "T0": 37.0},
            "kinetics": {
                "mu_max": 0.5,
                "Ks": 0.03,
                "Yxs": 0.47,
                "Ypx": 0.05,
                "kd": 0.01,
                "Kio": 0.00012,
                "Kp": 45.0,
                "maintenance": 0.006,
                "O2_maintenance": 0.0008,
            },
            "thermal": {"delta_H": 4.0e5, "Cp": 4.1e3, "U": 520.0, "A": 2.1, "rho": 1010.0},
            "mass_transfer": {"Kla": 210.0, "C_star": 0.007},
        },
        "starch_hydrolysate": {
            "label": "B. subtilis on starch hydrolysate",
            "default_initials": {"X0": 0.5, "S0": 40.0, "P0": 0.0, "DO0": 0.006, "T0": 37.0},
            "kinetics": {
                "mu_max": 0.42,
                "Ks": 0.08,
                "Yxs": 0.44,
                "Ypx": 0.04,
                "kd": 0.011,
                "Kio": 0.00012,
                "Kp": 40.0,
                "maintenance": 0.007,
                "O2_maintenance": 0.0009,
            },
            "thermal": {"delta_H": 4.0e5, "Cp": 4.1e3, "U": 520.0, "A": 2.1, "rho": 1010.0},
            "mass_transfer": {"Kla": 200.0, "C_star": 0.007},
        },
    },
    "Pichia_pastoris": {
        "glycerol": {
            "label": "Pichia pastoris on glycerol (growth)",
            "default_initials": {"X0": 0.5, "S0": 30.0, "P0": 0.0, "DO0": 0.005, "T0": 30.0},
            "kinetics": {
                "mu_max": 0.2,
                "Ks": 0.03,
                "Yxs": 0.5,
                "Ypx": 0.01,
                "kd": 0.004,
                "Kio": 0.00008,
                "Kp": 70.0,
                "maintenance": 0.003,
                "O2_maintenance": 0.0004,
            },
            "thermal": {"delta_H": 3.5e5, "Cp": 3.9e3, "U": 500.0, "A": 2.0, "rho": 1015.0},
            "mass_transfer": {"Kla": 220.0, "C_star": 0.0065},
        },
        "methanol": {
            "label": "Pichia pastoris on methanol (induction)",
            "default_initials": {"X0": 1.0, "S0": 20.0, "P0": 0.0, "DO0": 0.005, "T0": 28.0},
            "kinetics": {
                "mu_max": 0.08,
                "Ks": 0.02,
                "Yxs": 0.3,
                "Ypx": 0.0,
                "kd": 0.006,
                "Kio": 0.00006,
                "Kp": 30.0,
                "maintenance": 0.005,
                "O2_maintenance": 0.0005,
            },
            "thermal": {"delta_H": 3.6e5, "Cp": 3.9e3, "U": 520.0, "A": 2.0, "rho": 1015.0},
            "mass_transfer": {"Kla": 230.0, "C_star": 0.0065},
        },
    },
    "Lactococcus_lactis": {
        "glucose": {
            "label": "Lactococcus lactis on glucose",
            "default_initials": {"X0": 0.3, "S0": 30.0, "P0": 0.0, "DO0": 0.002, "T0": 30.0},
            "kinetics": {
                "mu_max": 0.9,
                "Ks": 0.05,
                "Yxs": 0.48,
                "Ypx": 0.12,
                "kd": 0.02,
                "Kio": 0.00005,
                "Kp": 25.0,
                "maintenance": 0.01,
                "O2_maintenance": 0.0003,
            },
            "thermal": {"delta_H": 3.2e5, "Cp": 4.0e3, "U": 480.0, "A": 1.8, "rho": 1030.0},
            "mass_transfer": {"Kla": 150.0, "C_star": 0.006},
        },
        "lactose": {
            "label": "Lactococcus lactis on lactose",
            "default_initials": {"X0": 0.3, "S0": 40.0, "P0": 0.0, "DO0": 0.002, "T0": 30.0},
            "kinetics": {
                "mu_max": 0.7,
                "Ks": 0.08,
                "Yxs": 0.45,
                "Ypx": 0.15,
                "kd": 0.02,
                "Kio": 0.00005,
                "Kp": 20.0,
                "maintenance": 0.011,
                "O2_maintenance": 0.0003,
            },
            "thermal": {"delta_H": 3.1e5, "Cp": 4.0e3, "U": 480.0, "A": 1.8, "rho": 1030.0},
            "mass_transfer": {"Kla": 140.0, "C_star": 0.006},
        },
    },
    "Clostridium_acetobutylicum": {
        "glucose": {
            "label": "Clostridium acetobutylicum on glucose",
            "default_initials": {"X0": 0.4, "S0": 60.0, "P0": 0.0, "DO0": 0.0005, "T0": 34.0},
            "kinetics": {
                "mu_max": 0.25,
                "Ks": 0.1,
                "Yxs": 0.4,
                "Ypx": 0.2,
                "kd": 0.015,
                "Kio": 0.00001,
                "Kp": 30.0,
                "maintenance": 0.008,
                "O2_maintenance": 0.0,
            },
            "thermal": {"delta_H": 3.0e5, "Cp": 3.9e3, "U": 350.0, "A": 2.0, "rho": 1030.0},
            "mass_transfer": {"Kla": 20.0, "C_star": 0.0005},
        },
        "xylose": {
            "label": "Clostridium acetobutylicum on xylose",
            "default_initials": {"X0": 0.35, "S0": 50.0, "P0": 0.0, "DO0": 0.0005, "T0": 34.0},
            "kinetics": {
                "mu_max": 0.18,
                "Ks": 0.12,
                "Yxs": 0.38,
                "Ypx": 0.18,
                "kd": 0.015,
                "Kio": 0.00001,
                "Kp": 25.0,
                "maintenance": 0.008,
                "O2_maintenance": 0.0,
            },
            "thermal": {"delta_H": 2.9e5, "Cp": 3.9e3, "U": 350.0, "A": 2.0, "rho": 1030.0},
            "mass_transfer": {"Kla": 18.0, "C_star": 0.0005},
        },
    },
    "Aspergillus_niger": {
        "glucose": {
            "label": "Aspergillus niger on glucose",
            "default_initials": {"X0": 0.2, "S0": 80.0, "P0": 0.0, "DO0": 0.003, "T0": 30.0},
            "kinetics": {
                "mu_max": 0.12,
                "Ks": 0.15,
                "Yxs": 0.45,
                "Ypx": 0.1,
                "kd": 0.01,
                "Kio": 0.00005,
                "Kp": 70.0,
                "maintenance": 0.006,
                "O2_maintenance": 0.0005,
            },
            "thermal": {"delta_H": 3.3e5, "Cp": 3.8e3, "U": 450.0, "A": 2.5, "rho": 1040.0},
            "mass_transfer": {"Kla": 160.0, "C_star": 0.006},
        },
        "molasses": {
            "label": "Aspergillus niger on molasses",
            "default_initials": {"X0": 0.25, "S0": 120.0, "P0": 0.0, "DO0": 0.003, "T0": 30.0},
            "kinetics": {
                "mu_max": 0.1,
                "Ks": 0.2,
                "Yxs": 0.42,
                "Ypx": 0.12,
                "kd": 0.011,
                "Kio": 0.00005,
                "Kp": 60.0,
                "maintenance": 0.0065,
                "O2_maintenance": 0.0005,
            },
            "thermal": {"delta_H": 3.4e5, "Cp": 3.8e3, "U": 450.0, "A": 2.5, "rho": 1040.0},
            "mass_transfer": {"Kla": 150.0, "C_star": 0.006},
        },
    },
}


def list_microbes() -> List[dict]:
    return [
        {
            "id": microbe_id,
            "label": next(iter(subs.values())).get("label", microbe_id).split(" on ")[0].strip(),
        }
        for microbe_id, subs in MICROBE_DB.items()
    ]


def list_substrates(microbe_id: str) -> List[dict]:
    microbe = MICROBE_DB.get(microbe_id, {})
    return [
        {"id": substrate_id, "label": preset.get("label", substrate_id)}
        for substrate_id, preset in microbe.items()
    ]


def get_preset(microbe_id: str, substrate_id: str) -> Optional[dict]:
    return MICROBE_DB.get(microbe_id, {}).get(substrate_id)


def flatten_preset(preset: dict) -> dict:
    """Flatten preset sections into a single dict keyed by SimulationRequest fields."""
    merged: dict = {}
    for section in ("default_initials", "kinetics", "thermal", "mass_transfer", "operations"):
        merged.update(preset.get(section, {}))
    return merged
