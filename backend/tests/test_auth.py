import pytest
from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client


def test_login_requires_username_and_password(client):
    response = client.post(
        "/api/auth/login",
        json={}
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["message"] == (
        "Username and password are required"
    )


def test_login_requires_password(client):
    response = client.post(
        "/api/auth/login",
        json={
            "username": "admin"
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["message"] == (
        "Username and password are required"
    )


def test_login_requires_username(client):
    response = client.post(
        "/api/auth/login",
        json={
            "password": "admin123"
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["message"] == (
        "Username and password are required"
    )
