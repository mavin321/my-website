from dataclasses import dataclass

import numpy as np

from .base import BaseFermentationModel
from .c_binding import (
    FermentationCLib,
    KineticParams,
    OperatingConditions,
)
from ..utils.validation import SimulationRequest


@dataclass
class BatchSimulationResult:
    time: np.ndarray
    state: np.ndarray  # shape (n_points, 6) : X, S, P, DO, T, V


class BatchFermentationModel(BaseFermentationModel):
    """Batch (and base fed-batch) fermentation model with dilution/feed dynamics."""

    def __init__(self, c_lib: FermentationCLib | None = None) -> None:
        self.c_lib = c_lib or FermentationCLib()
        self._max_dt = 0.01  # tighter internal step to avoid stiffness blow-ups

    def _build_param_maps(self, request: SimulationRequest) -> tuple[dict, dict]:
        params = {
            "mu_max": request.mu_max,
            "Ks": request.Ks,
            "Yxs": request.Yxs,
            "Ypx": request.Ypx,
            "kd": request.kd,
            "Kio": request.Kio,
            "Kp": request.Kp,
            "maintenance": request.maintenance,
            "Q10": request.Q10,
            "T_ref": request.T_ref,
            "Kla": request.Kla,
            "C_star": request.C_star,
            "O2_maintenance": request.O2_maintenance,
            "delta_H": request.delta_H,
            "Cp": request.Cp,
            "U": request.U,
            "A": request.A,
            "rho": request.rho,
        }
        ops = {
            "volume": request.volume,
            "feed_rate": request.feed_rate,
            "feed_substrate_conc": request.feed_substrate_conc,
            "feed_start": request.feed_start,
            "feed_rate_end": request.feed_rate_end,
            "feed_tau": request.feed_tau,
            "feed_mode": request.feed_mode,
            "do_setpoint": request.do_setpoint,
            "do_Kp": request.do_Kp,
            "aeration_rate": request.aeration_rate,
            "agitation_speed": request.agitation_speed,
            "cooling_temp": request.cooling_temp,
            "coolant_flow": request.coolant_flow,
            "agit_power_coeff": request.agit_power_coeff,
            "agit_heat_eff": request.agit_heat_eff,
        }
        return params, ops

    def _compute_feed_rate(self, t: float, DO: float, ops: dict) -> float:
        if t < ops["feed_start"]:
            return 0.0
        fr0 = ops["feed_rate"]
        fr1 = ops["feed_rate_end"]
        mode = ops.get("feed_mode", "constant")
        if mode == "ramp":
            dt = t - ops["feed_start"]
            if fr1 > fr0 and ops["feed_tau"] > 0:
                slope = (fr1 - fr0) / ops["feed_tau"]
                return min(fr1, fr0 + slope * dt)
            return fr0
        if mode == "exponential":
            dt = t - ops["feed_start"]
            tau = max(ops["feed_tau"], 1e-6)
            target = fr1 if fr1 > 0 else fr0
            return target + (fr0 - target) * np.exp(-dt / tau)
        if mode == "do_control":
            error = ops.get("do_setpoint", 0.0) - DO
            return max(0.0, fr0 + ops.get("do_Kp", 0.0) * error)
        return fr0

    def _derivatives(self, t: float, state: np.ndarray, params: dict, ops: dict) -> np.ndarray:
        X, S, P, DO, T, V = state

        # Keep state in physical bounds to avoid runaway stiffness
        X = max(X, 0.0)
        S = max(S, 0.0)
        P = max(P, 0.0)
        V_safe = max(V, 1e-6)
        DO_safe = max(DO, 1e-8)
        S_safe = max(S, 1e-8)

        temp_factor = params["Q10"] ** ((T - params["T_ref"]) / 10.0)
        mu_monod = params["mu_max"] * temp_factor * S_safe / (params["Ks"] + S_safe)
        o2_factor = DO_safe / (params["Kio"] + DO_safe)
        product_factor = 1.0 / (1.0 + P / params["Kp"])
        mu = mu_monod * o2_factor * product_factor

        feed_rate = self._compute_feed_rate(t, DO_safe, ops)
        dilution = feed_rate / V_safe

        rX = (mu - params["kd"] - dilution) * X
        rS = (
            -(1.0 / params["Yxs"]) * mu * X
            - params["maintenance"] * X
            + dilution * (ops["feed_substrate_conc"] - S)
        )
        rP = params["Ypx"] * mu * X - dilution * P

        # Oxygen transfer with saturation clamp
        kla_effective = max(
            params["Kla"]
            * max(ops["aeration_rate"], 1e-6) ** 0.5
            * (max(ops["agitation_speed"], 1e-6) / 300.0) ** 0.7,
            0.0,
        )
        OTR = kla_effective * max(params["C_star"] - DO, 0.0)
        OUR = params["O2_maintenance"] * X
        dDOdt = OTR - OUR - dilution * DO

        # Simple heat balance with dynamic volume
        Q_gen = params["delta_H"] * mu * X * V_safe
        Q_loss = params["U"] * params["A"] * (T - ops["cooling_temp"])
        agit_power = ops["agit_power_coeff"] * V_safe * max(ops["agitation_speed"], 0.0) ** 3
        Q_agit = ops["agit_heat_eff"] * agit_power
        dTdt = (Q_gen + Q_agit - Q_loss) / (params["rho"] * V_safe * params["Cp"])
        dVdt = feed_rate

        return np.array([rX, rS, rP, dDOdt, dTdt, dVdt], dtype="float64")

    def _integrate_fallback(
        self, t: np.ndarray, y0: np.ndarray, params: dict, ops: dict
    ) -> np.ndarray:
        """Numerically integrate with internal sub-steps and clamping."""
        n_points = t.size
        state_dim = y0.size
        y = np.zeros((n_points, state_dim), dtype="float64")
        y[0] = y0
        current = y0.copy()

        for i in range(1, n_points):
            segment_dt = t[i] - t[i - 1]
            steps = max(1, int(np.ceil(segment_dt / self._max_dt)))
            dt = segment_dt / steps

            for _ in range(steps):
                k1 = self._derivatives(t[i - 1], current, params, ops)
                k2 = self._derivatives(t[i - 1] + 0.5 * dt, current + 0.5 * dt * k1, params, ops)
                k3 = self._derivatives(t[i - 1] + 0.5 * dt, current + 0.5 * dt * k2, params, ops)
                k4 = self._derivatives(t[i - 1] + dt, current + dt * k3, params, ops)
                current = current + dt * (k1 + 2 * k2 + 2 * k3 + k4) / 6.0

                # Clamp to physical/finite ranges
                current = np.where(np.isfinite(current), current, 0.0)
                current[:4] = np.maximum(current[:4], 0.0)
                current[3] = min(current[3], params["C_star"] * 1.5)
                current[4] = max(current[4], 0.0)
                current[5] = max(current[5], 1e-6)

            y[i] = current

        return y

    def simulate(self, request: SimulationRequest) -> BatchSimulationResult:
        t = np.linspace(request.t_start, request.t_end, request.n_points)
        y0 = np.array(
            [request.X0, request.S0, request.P0, request.DO0, request.T0, request.volume],
            dtype="float64",
        )

        use_c = self.c_lib is not None

        kinetic = KineticParams(
            mu_max=request.mu_max,
            Ks=request.Ks,
            Yxs=request.Yxs,
            Ypx=request.Ypx,
            kd=request.kd,
            Kio=request.Kio,
            Kp=request.Kp,
            maintenance=request.maintenance,
            Q10=request.Q10,
            T_ref=request.T_ref,
            Kla=request.Kla,
            C_star=request.C_star,
            O2_maintenance=request.O2_maintenance,
            delta_H=request.delta_H,
            Cp=request.Cp,
            U=request.U,
            A=request.A,
            rho=request.rho,
        )

        ops = OperatingConditions(
            volume=request.volume,
            feed_rate=request.feed_rate,
            feed_substrate_conc=request.feed_substrate_conc,
            feed_start=request.feed_start,
            feed_rate_end=request.feed_rate_end,
            feed_tau=request.feed_tau,
            feed_mode={"constant": 0, "ramp": 1, "exponential": 2, "do_control": 3}[request.feed_mode],
            do_setpoint=request.do_setpoint,
            do_Kp=request.do_Kp,
            aeration_rate=request.aeration_rate,
            agitation_speed=request.agitation_speed,
            cooling_temp=request.cooling_temp,
            coolant_flow=request.coolant_flow,
            agit_power_coeff=request.agit_power_coeff,
            agit_heat_eff=request.agit_heat_eff,
        )

        y_out = None
        if use_c:
            try:
                status, y_out = self.c_lib.integrate(t, y0, kinetic, ops)
                if status != 0 or not np.isfinite(y_out).all():
                    y_out = None
            except Exception:
                y_out = None

        if y_out is None:
            params_map, ops_map = self._build_param_maps(request)
            y_out = self._integrate_fallback(t, y0, params_map, ops_map)
        else:
            # If C core does not fill volume (older builds), backfill constant volume
            if np.allclose(y_out[:, 5], 0):
                y_out[:, 5] = request.volume

        return BatchSimulationResult(time=t, state=y_out)
