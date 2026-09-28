import pytest
from app import app
from flask_jwt_extended import create_access_token


@pytest.fixture
def client():
    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client


def test_add_student_requires_login(client):
    response = client.post(
        "/api/admin/students",
        json={}
    )

    assert response.status_code == 401


def test_add_student_rejects_non_admin(client):
    with app.app_context():
        token = create_access_token(
            identity="2",
            additional_claims={"role": "teacher"}
        )

    response = client.post(
        "/api/admin/students",
        json={},
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 403


def test_add_student_requires_fields(client):
    with app.app_context():
        token = create_access_token(
            identity="1",
            additional_claims={"role": "admin"}
        )

    response = client.post(
        "/api/admin/students",
        json={},
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["message"] == (
        "Username, password, name and email are required"
    )


def test_add_teacher_requires_login(client):
    response = client.post(
        "/api/admin/teachers",
        json={}
    )

    assert response.status_code == 401


def test_add_teacher_requires_fields(client):
    with app.app_context():
        token = create_access_token(
            identity="1",
            additional_claims={"role": "admin"}
        )

    response = client.post(
        "/api/admin/teachers",
        json={},
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["message"] == (
        "Username, password, name and email are required"
    )
