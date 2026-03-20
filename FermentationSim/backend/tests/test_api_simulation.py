from fastapi.testclient import TestClient

from fermentation_sim.api.main import app

client = TestClient(app)


def test_health():
    resp = client.get("/meta/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_simulation_run_default():
    payload = {
        "X0": 1,
        "S0": 20,
        "P0": 0,
        "DO0": 0.005,
        "T0": 30
    }
    resp = client.post("/simulation/run?mode=batch", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "time" in data
    assert "states" in data
    assert len(data["time"]) == data["meta"]["n_points"]
