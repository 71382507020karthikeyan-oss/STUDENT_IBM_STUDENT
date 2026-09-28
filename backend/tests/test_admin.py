import pytest
from app import app
from flask_jwt_extended import create_access_token


@pytest.fixture
def client():
    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client


def test_admin_dashboard_requires_login(client):
    response = client.get("/api/admin/dashboard")

    assert response.status_code == 401


def test_admin_dashboard_rejects_teacher(client):
    with app.app_context():
        token = create_access_token(
            identity="2",
            additional_claims={"role": "teacher"}
        )

    response = client.get(
        "/api/admin/dashboard",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 403

    data = response.get_json()

    assert data["message"] == "Admin access required"


def test_admin_dashboard_rejects_student(client):
    with app.app_context():
        token = create_access_token(
            identity="3",
            additional_claims={"role": "student"}
        )

    response = client.get(
        "/api/admin/dashboard",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 403

    data = response.get_json()

    assert data["message"] == "Admin access required"
