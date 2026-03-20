from dataclasses import dataclass


@dataclass
class PIDConfig:
    kp: float
    ki: float
    kd: float
    setpoint: float
    output_min: float
    output_max: float


class PIDController:
    """Discrete PID controller."""

    def __init__(self, config: PIDConfig) -> None:
        self.config = config
        self.integral = 0.0
        self.prev_error = 0.0

    def reset(self) -> None:
        self.integral = 0.0
        self.prev_error = 0.0

    def step(self, measured: float, dt: float) -> float:
        error = self.config.setpoint - measured
        self.integral += error * dt
        derivative = (error - self.prev_error) / dt if dt > 0 else 0.0

        output = (
            self.config.kp * error
            + self.config.ki * self.integral
            + self.config.kd * derivative
        )

        # Clamp output
        output = max(self.config.output_min, min(self.config.output_max, output))
        self.prev_error = error
        return output
