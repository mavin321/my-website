from pydantic import BaseModel, ConfigDict, Field


class SimulationRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    # Contextual preset selectors
    microbe_id: str | None = Field(None, description="Optional microbe preset id")
    substrate_id: str | None = Field(None, description="Optional substrate preset id")

    # Initial conditions
    X0: float = Field(1.0, gt=0, description="Initial biomass (g/L)")
    S0: float = Field(20.0, gt=0, description="Initial substrate (g/L)")
    P0: float = Field(0, ge=0, description="Initial product (g/L)")
    DO0: float = Field(0.005, gt=0, description="Initial DO (g/L)")
    T0: float = Field(30.0, gt=0, description="Initial temperature (°C)")

    # Time
    t_start: float = Field(0, ge=0)
    t_end: float = Field(24.0, gt=0)
    n_points: int = Field(241, ge=2)

    # Kinetic parameters
    mu_max: float = Field(0.4, gt=0)
    Ks: float = Field(0.1, gt=0)
    Yxs: float = Field(0.5, gt=0)
    Ypx: float = Field(0.1, ge=0)
    kd: float = Field(0.01, ge=0)
    Kio: float = Field(0.0001, gt=0)
    Kp: float = Field(50.0, gt=0, description="Product inhibition constant (g/L)")
    maintenance: float = Field(0.005, ge=0, description="Non-growth substrate maintenance (g/gX/h)")
    Q10: float = Field(2.0, ge=0, description="Temperature factor for mu")
    T_ref: float = Field(30.0, gt=0, description="Reference temperature (°C)")
    Kla: float = Field(200.0, gt=0)
    C_star: float = Field(0.007, gt=0)
    O2_maintenance: float = Field(0.0005, ge=0)
    delta_H: float = Field(4e5, ge=0)
    Cp: float = Field(4.18e3, gt=0)
    U: float = Field(500.0, ge=0)
    A: float = Field(2.0, ge=0)
    rho: float = Field(1000.0, gt=0)

    # Operating conditions
    volume: float = Field(5.0, gt=0)
    feed_rate: float = Field(0.0, ge=0)
    feed_start: float = Field(0.0, ge=0, description="Feed start time (h)")
    feed_substrate_conc: float = Field(500.0, ge=0)
    feed_rate_end: float = Field(0.0, ge=0, description="Target feed rate for ramp/exponential (L/h)")
    feed_tau: float = Field(2.0, ge=0, description="Time constant for exponential feed (h)")
    feed_mode: str = Field(
        "constant",
        pattern="^(constant|ramp|exponential|do_control)$",
        description="Feed strategy",
    )
    do_setpoint: float = Field(0.0, ge=0, description="DO setpoint for do_control mode (g/L)")
    do_Kp: float = Field(0.0, ge=0, description="Proportional gain for DO-based feed control")
    aeration_rate: float = Field(1.0, gt=0)
    agitation_speed: float = Field(300.0, gt=0)
    cooling_temp: float = Field(25.0, gt=0)
    coolant_flow: float = Field(1.0, ge=0)
    agit_power_coeff: float = Field(2.0, ge=0, description="Mechanical power coefficient (W/(L*rpm^3))")
    agit_heat_eff: float = Field(0.5, ge=0, le=1, description="Fraction of mechanical power to heat")
