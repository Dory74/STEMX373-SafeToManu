import json
import os

# Ensure the NIWA API key check in apis.py passes during tests.
os.environ.setdefault("NIWA_API_KEY", "test-key")

from fastapi.testclient import TestClient
from app import main

client = TestClient(main.app)

def test_root():
    response = client.get("/api")
    assert response.status_code == 200
    assert response.json() == {"message": "Backend is running"}


def test_uv_success(monkeypatch):
    def fake_get_uv_info(lat, long):
        assert lat == "1.0"
        assert long == "2.0"
        return {"mock": True}

    def fake_current_hour_uv(response):
        assert response == {"mock": True}
        return 5.5

    monkeypatch.setattr(main.api, "get_uv_info", fake_get_uv_info)
    monkeypatch.setattr(main.api, "current_hour_uv", fake_current_hour_uv)
    monkeypatch.setattr(main.api, "get_uv_info_chart", lambda *args, **kwargs: None)

    response = client.get("/api/uv", params={"lat": 1.0, "long": 2.0})
    assert response.status_code == 200
    assert response.json() == {"lat": 1.0, "long": 2.0, "uv": 5.5}


def test_uv_returns_502_when_no_value(monkeypatch):
    monkeypatch.setattr(main.api, "get_uv_info", lambda lat, long: {"mock": True})
    monkeypatch.setattr(main.api, "current_hour_uv", lambda response: None)
    monkeypatch.setattr(main.api, "get_uv_info_chart", lambda *args, **kwargs: None)

    response = client.get("/api/uv", params={"lat": 0, "long": 0})
    assert response.status_code == 502
    assert response.json()["detail"] == "Could not fetch UV value"


def test_leaderboard_success(monkeypatch, tmp_path):
    fake_lb_path = tmp_path / "leaderboard.json"
    sample_entries = [
        {"score": 9.9, "video": "/tmp/path/to/video1.mp4"},
        {"score": 7.5, "video": "video2.mp4"},
    ]
    fake_lb_path.write_text(json.dumps(sample_entries))

    monkeypatch.setattr(main, "LEADERBOARD_FILE", str(fake_lb_path))

    response = client.get("/api/leaderboard")
    assert response.status_code == 200
    assert response.json() == [
        {"score": 9.9, "video": "video1.mp4"},
        {"score": 7.5, "video": "video2.mp4"},
    ]


def test_leaderboard_missing_file(monkeypatch, tmp_path):
    missing_path = tmp_path / "does_not_exist.json"
    monkeypatch.setattr(main, "LEADERBOARD_FILE", str(missing_path))

    response = client.get("/api/leaderboard")
    assert response.status_code == 404
