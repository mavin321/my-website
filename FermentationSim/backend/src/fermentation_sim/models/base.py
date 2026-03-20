from abc import ABC, abstractmethod
from typing import Protocol

import numpy as np


class SimulationResult(Protocol):
    time: np.ndarray
    state: np.ndarray


class BaseFermentationModel(ABC):
    """Abstract base class for fermentation models."""

    @abstractmethod
    def simulate(self, request) -> SimulationResult:
        """Run simulation given a validated request."""
        raise NotImplementedError
