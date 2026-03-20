import numpy as np

from fermentation_sim.models.batch_model import BatchFermentationModel
from fermentation_sim.utils.validation import SimulationRequest


def test_batch_model_runs_and_has_reasonable_shapes():
    model = BatchFermentationModel()
    req = SimulationRequest()
    result = model.simulate(req)

    assert result.time.shape[0] == req.n_points
    assert result.state.shape == (req.n_points, 6)

    # basic monotonic sanity: biomass should not go negative
    assert np.all(result.state[:, 0] >= 0)
    # volume should stay non-decreasing with non-negative feed
    assert np.all(np.diff(result.state[:, 5]) >= -1e-9)
