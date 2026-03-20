import pytest

from fermentation_sim.data.preset_service import merge_request_with_preset, get_preset
from fermentation_sim.utils.validation import SimulationRequest


def test_merge_applies_preset_when_not_provided():
    req = SimulationRequest(microbe_id="E_coli_K12", substrate_id="glucose")
    merged = merge_request_with_preset(req)

    preset = get_preset("E_coli_K12", "glucose")
    assert preset is not None
    expected_mu = preset["kinetics"]["mu_max"]
    expected_X0 = preset["default_initials"]["X0"]

    assert merged.mu_max == expected_mu
    assert merged.X0 == expected_X0


def test_merge_respects_user_overrides():
    req = SimulationRequest(
        microbe_id="E_coli_K12",
        substrate_id="glucose",
        mu_max=1.23,  # user override
    )
    merged = merge_request_with_preset(req)

    assert merged.mu_max == pytest.approx(1.23)
    # non-overridden still come from preset
    assert merged.X0 == get_preset("E_coli_K12", "glucose")["default_initials"]["X0"]
