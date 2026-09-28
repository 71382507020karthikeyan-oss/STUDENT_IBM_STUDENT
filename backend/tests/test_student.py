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


def test_student_profile_requires_login(client):
    response = client.get("/api/student/profile")
    assert response.status_code == 401


def test_student_marks_requires_login(client):
    response = client.get("/api/student/marks")
    assert response.status_code == 401


def test_student_attendance_requires_login(client):
    response = client.get("/api/student/attendance")
    assert response.status_code == 401


def test_student_performance_requires_login(client):
    response = client.get("/api/student/performance")
    assert response.status_code == 401


def test_student_profile_rejects_teacher(client):
    token = make_token("teacher", 2)

    response = client.get(
        "/api/student/profile",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 403

    data = response.get_json()
    assert data["message"] == "Student access required"


def test_student_marks_rejects_teacher(client):
    token = make_token("teacher", 2)

    response = client.get(
        "/api/student/marks",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 403

    data = response.get_json()
    assert data["message"] == "Student access required"


def test_student_attendance_rejects_teacher(client):
    token = make_token("teacher", 2)

    response = client.get(
        "/api/student/attendance",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 403

    data = response.get_json()
    assert data["message"] == "Student access required"


def test_student_performance_rejects_teacher(client):
    token = make_token("teacher", 2)

    response = client.get(
        "/api/student/performance",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 403

    data = response.get_json()
    assert data["message"] == "Student access required"
