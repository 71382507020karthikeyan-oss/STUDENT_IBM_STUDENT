from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from database.db import db
from models.student import Student


teacher_bp = Blueprint("teacher", __name__)


# =========================
# Teacher Dashboard
# =========================

@teacher_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():

    claims = get_jwt()

    if claims.get("role") != "teacher":
        return jsonify({
            "message": "Teacher access required"
        }), 403

    return jsonify({
        "message": "Welcome to Teacher Dashboard"
    }), 200


# =========================
# View All Students
# =========================

@teacher_bp.route("/students", methods=["GET"])
@jwt_required()
def get_students():

    claims = get_jwt()

    if claims.get("role") != "teacher":
        return jsonify({
            "message": "Teacher access required"
        }), 403

    students = Student.query.all()

    result = []

    for student in students:

        result.append({
            "student_id": student.student_id,
            "name": student.name,
            "email": student.email,
            "phone": student.phone,
            "department": student.department,
            "year": student.year,
            "section": student.section,
            "date_of_birth": str(student.date_of_birth)
            if student.date_of_birth else None,
            "address": student.address
        })

    return jsonify({
        "count": len(result),
        "students": result
    }), 200


# =========================
# View One Student
# =========================

@teacher_bp.route("/students/<int:student_id>", methods=["GET"])
@jwt_required()
def get_student(student_id):

    claims = get_jwt()

    if claims.get("role") != "teacher":
        return jsonify({
            "message": "Teacher access required"
        }), 403

    student = Student.query.get(student_id)

    if not student:
        return jsonify({
            "message": "Student not found"
        }), 404

    return jsonify({
        "student_id": student.student_id,
        "name": student.name,
        "email": student.email,
        "phone": student.phone,
        "department": student.department,
        "year": student.year,
        "section": student.section,
        "date_of_birth": str(student.date_of_birth)
        if student.date_of_birth else None,
        "address": student.address
    }), 200


# =========================
# Edit Student
# =========================

@teacher_bp.route("/students/<int:student_id>", methods=["PUT"])
@jwt_required()
def update_student(student_id):

    claims = get_jwt()

    if claims.get("role") != "teacher":
        return jsonify({
            "message": "Teacher access required"
        }), 403

    student = Student.query.get(student_id)

    if not student:
        return jsonify({
            "message": "Student not found"
        }), 404

    data = request.get_json()

    if "name" in data:
        student.name = data["name"]

    if "email" in data:
        student.email = data["email"]

    if "phone" in data:
        student.phone = data["phone"]

    if "department" in data:
        student.department = data["department"]

    if "year" in data:
        student.year = data["year"]

    if "section" in data:
        student.section = data["section"]

    if "date_of_birth" in data:
        student.date_of_birth = data["date_of_birth"]

    if "address" in data:
        student.address = data["address"]

    try:

        db.session.commit()

        return jsonify({
            "message": "Student updated successfully"
        }), 200

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "message": "Failed to update student",
            "error": str(e)
        }), 500