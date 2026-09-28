import pytest
from app import app
from flask_jwt_extended import create_access_token


@pytest.fixture
def client():
    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client


def token(role, user_id):
    with app.app_context():
        return create_access_token(
            identity=str(user_id),
            additional_claims={"role": role}
        )


def test_admin_dashboard_rejects_student(client):
    response = client.get(
        "/api/admin/dashboard",
        headers={"Authorization": f"Bearer {token('student', 3)}"}
    )

    assert response.status_code == 403


def test_admin_dashboard_rejects_teacher(client):
    response = client.get(
        "/api/admin/dashboard",
        headers={"Authorization": f"Bearer {token('teacher', 2)}"}
    )

    assert response.status_code == 403


def test_teacher_dashboard_rejects_admin(client):
    response = client.get(
        "/api/teacher/dashboard",
        headers={"Authorization": f"Bearer {token('admin', 1)}"}
    )

    assert response.status_code == 403


def test_teacher_dashboard_rejects_student(client):
    response = client.get(
        "/api/teacher/dashboard",
        headers={"Authorization": f"Bearer {token('student', 3)}"}
    )

    assert response.status_code == 403


def test_student_profile_rejects_admin(client):
    response = client.get(
        "/api/student/profile",
        headers={"Authorization": f"Bearer {token('admin', 1)}"}
    )

    assert response.status_code == 403


def test_student_profile_rejects_teacher(client):
    response = client.get(
        "/api/student/profile",
        headers={"Authorization": f"Bearer {token('teacher', 2)}"}
    )

    assert response.status_code == 403
