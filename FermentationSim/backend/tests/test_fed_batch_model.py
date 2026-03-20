import numpy as np

from fermentation_sim.models.fed_batch_model import FedBatchFermentationModel
from fermentation_sim.utils.validation import SimulationRequest


def test_fed_batch_volume_grows_with_feed():
    model = FedBatchFermentationModel()
    req = SimulationRequest(feed_rate=0.5, feed_start=0.0, t_end=5.0, n_points=51)
    result = model.simulate(req)

    assert result.state.shape == (req.n_points, 6)
    # volume should grow approximately linearly with feed rate and time
    assert result.volume[-1] > result.volume[0]
    assert np.all(np.diff(result.volume) >= -1e-9)


def test_ramp_feed_increases_rate_over_time():
    model = FedBatchFermentationModel()
    req = SimulationRequest(
        feed_rate=0.1,
        feed_rate_end=1.0,
        feed_mode="ramp",
        feed_start=0.0,
        feed_tau=2.0,
        t_end=4.0,
        n_points=41,
    )
    result = model.simulate(req)
    # Later volume increments should exceed early increments
    early_delta = result.volume[10] - result.volume[0]
    late_delta = result.volume[-1] - result.volume[20]
    assert late_delta > early_delta
