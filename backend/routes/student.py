from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from models.user import User
from models.student import Student
from models.marks import Mark
from models.attendance import Attendance
from models.subject import Subject


student_bp = Blueprint("student", __name__)


def get_current_student():

    claims = get_jwt()

    if claims.get("role") != "student":
        return None

    user_id = int(claims.get("sub"))

    student = Student.query.filter_by(
        user_id=user_id
    ).first()

    return student


# ==============================
# STUDENT PROFILE
# ==============================

@student_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():

    student = get_current_student()

    if not student:
        return jsonify({
            "message": "Student access required"
        }), 403

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


# ==============================
# STUDENT MARKS
# ==============================

@student_bp.route("/marks", methods=["GET"])
@jwt_required()
def marks():

    student = get_current_student()

    if not student:
        return jsonify({
            "message": "Student access required"
        }), 403

    records = Mark.query.filter_by(
        student_id=student.student_id
    ).all()

    result = []

    for mark in records:

        subject = Subject.query.get(
            mark.subject_id
        )

        result.append({
            "mark_id": mark.mark_id,
            "subject_id": mark.subject_id,
            "subject_name": subject.subject_name
            if subject else "Unknown",
            "internal_mark": float(mark.internal_mark)
            if mark.internal_mark is not None else 0,
            "external_mark": float(mark.external_mark)
            if mark.external_mark is not None else 0,
            "total_mark": float(mark.total_mark)
            if mark.total_mark is not None else 0
        })

    return jsonify({
        "student_id": student.student_id,
        "marks": result
    }), 200


# ==============================
# STUDENT ATTENDANCE
# ==============================

@student_bp.route("/attendance", methods=["GET"])
@jwt_required()
def attendance():

    student = get_current_student()

    if not student:
        return jsonify({
            "message": "Student access required"
        }), 403

    records = Attendance.query.filter_by(
        student_id=student.student_id
    ).all()

    result = []

    for record in records:

        subject = Subject.query.get(
            record.subject_id
        )

        result.append({
            "attendance_id": record.attendance_id,
            "subject_id": record.subject_id,
            "subject_name": subject.subject_name
            if subject else "Unknown",
            "total_classes": record.total_classes,
            "attended_classes": record.attended_classes,
            "percentage": float(record.percentage)
            if record.percentage is not None else 0
        })

    return jsonify({
        "student_id": student.student_id,
        "attendance": result
    }), 200


# ==============================
# STUDENT PERFORMANCE
# ==============================

@student_bp.route("/performance", methods=["GET"])
@jwt_required()
def performance():

    student = get_current_student()

    if not student:
        return jsonify({
            "message": "Student access required"
        }), 403

    marks = Mark.query.filter_by(
        student_id=student.student_id
    ).all()

    attendance = Attendance.query.filter_by(
        student_id=student.student_id
    ).all()

    total_marks = sum(
        float(mark.total_mark or 0)
        for mark in marks
    )

    average_marks = (
        total_marks / len(marks)
        if marks else 0
    )

    average_attendance = (
        sum(
            float(a.percentage or 0)
            for a in attendance
        ) / len(attendance)
        if attendance else 0
    )

    return jsonify({
        "student_id": student.student_id,
        "total_subjects": len(marks),
        "average_marks": round(average_marks, 2),
        "average_attendance": round(
            average_attendance,
            2
        ),
        "performance": {
            "marks": round(average_marks, 2),
            "attendance": round(
                average_attendance,
                2
            )
        }
    }), 200