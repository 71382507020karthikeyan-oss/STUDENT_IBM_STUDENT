import pytest
from app import app
from flask_jwt_extended import create_access_token


@pytest.fixture
def client():
    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client


def make_token(role, user_id):
    with app.app_context():
        return create_access_token(
            identity=str(user_id),
            additional_claims={"role": role}
        )


def test_teacher_dashboard_requires_login(client):
    response = client.get("/api/teacher/dashboard")

    assert response.status_code == 401


def test_teacher_dashboard_accepts_teacher(client):
    token = make_token("teacher", 2)

    response = client.get(
        "/api/teacher/dashboard",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["message"] == "Welcome to Teacher Dashboard"


def test_teacher_dashboard_rejects_student(client):
    token = make_token("student", 3)

    response = client.get(
        "/api/teacher/dashboard",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 403

    data = response.get_json()

    assert data["message"] == "Teacher access required"


def test_teacher_students_rejects_non_teacher(client):
    token = make_token("student", 3)

    response = client.get(
        "/api/teacher/students",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 403

    data = response.get_json()

    assert data["message"] == "Teacher access required"


def test_teacher_update_student_rejects_non_teacher(client):
    token = make_token("admin", 1)

    response = client.put(
        "/api/teacher/students/1",
        json={
            "name": "Test Student"
        },
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 403

    data = response.get_json()

    assert data["message"] == "Teacher access required"
