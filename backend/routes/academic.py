from math import isfinite

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from database.db import db
from models.student import Student
from models.subject import Subject
from models.marks import Mark
from models.attendance import Attendance


academic_bp = Blueprint("academic", __name__)


# =========================================================
# TEACHER ACCESS CHECK
# =========================================================

def teacher_only():

    claims = get_jwt()

    return claims.get("role") == "teacher"


# =========================================================
# GET ALL SUBJECTS
# =========================================================

@academic_bp.route("/subjects", methods=["GET"])
@jwt_required()
def get_subjects():

    if not teacher_only():
        return jsonify({
            "message": "Teacher access required"
        }), 403

    subjects = Subject.query.order_by(
        Subject.subject_id
    ).all()

    result = []

    for subject in subjects:

        result.append({
            "subject_id": subject.subject_id,
            "subject_name": subject.subject_name,
            "department": subject.department,
            "semester": subject.semester
        })

    return jsonify({
        "count": len(result),
        "subjects": result
    }), 200


# =========================================================
# ADD SUBJECT
# =========================================================

@academic_bp.route("/subjects", methods=["POST"])
@jwt_required()
def add_subject():

    if not teacher_only():
        return jsonify({
            "message": "Teacher access required"
        }), 403

    data = request.get_json() or {}

    subject_name = data.get("subject_name")
    department = data.get("department")
    semester = data.get("semester")

    if not subject_name:
        return jsonify({
            "message": "Subject name is required"
        }), 400

    # Prevent duplicate subject names
    existing_subject = Subject.query.filter_by(
        subject_name=subject_name,
        department=department
    ).first()

    if existing_subject:

        return jsonify({
            "message": "Subject already exists",
            "subject": {
                "subject_id": existing_subject.subject_id,
                "subject_name": existing_subject.subject_name,
                "department": existing_subject.department,
                "semester": existing_subject.semester
            }
        }), 409

    try:

        subject = Subject(
            subject_name=subject_name,
            department=department,
            semester=semester
        )

        db.session.add(subject)
        db.session.commit()

        return jsonify({
            "message": "Subject added successfully",
            "subject_id": subject.subject_id,
            "subject_name": subject.subject_name,
            "department": subject.department,
            "semester": subject.semester
        }), 201

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "message": "Failed to add subject",
            "error": str(e)
        }), 500


# =========================================================
# GET ALL MARKS - TEACHER
# =========================================================

@academic_bp.route("/marks", methods=["GET"])
@jwt_required()
def get_marks():

    if not teacher_only():
        return jsonify({
            "message": "Teacher access required"
        }), 403

    # Latest mark_id is treated as the latest submitted record.
    all_marks = Mark.query.order_by(
        Mark.mark_id.desc()
    ).all()

    latest_marks = []
    seen_pairs = set()

    for mark in all_marks:

        pair = (
            mark.student_id,
            mark.subject_id
        )

        if pair in seen_pairs:
            continue

        seen_pairs.add(pair)
        latest_marks.append(mark)

    result = []

    for mark in latest_marks:

        student = db.session.get(
            Student,
            mark.student_id
        )

        subject = db.session.get(
            Subject,
            mark.subject_id
        )

        result.append({
            "mark_id": mark.mark_id,
            "student_id": mark.student_id,
            "student_name": (
                student.name
                if student
                else None
            ),
            "subject_id": mark.subject_id,
            "subject_name": (
                subject.subject_name
                if subject
                else None
            ),
            "internal_mark": float(
                mark.internal_mark or 0
            ),
            "external_mark": float(
                mark.external_mark or 0
            ),
            "total_mark": float(
                mark.total_mark or 0
            )
        })

    return jsonify({
        "count": len(result),
        "marks": result
    }), 200


# =========================================================
# ADD / UPDATE MARKS
# =========================================================

@academic_bp.route("/marks", methods=["POST"])
@jwt_required()
def add_marks():

    if not teacher_only():
        return jsonify({
            "message": "Teacher access required"
        }), 403

    data = request.get_json() or {}

    student_id = data.get("student_id")
    subject_id = data.get("subject_id")
    internal_mark = data.get("internal_mark", 0)
    external_mark = data.get("external_mark", 0)

    if student_id is None or subject_id is None:

        return jsonify({
            "message": "Student and subject are required"
        }), 400

    try:

        student_id = int(student_id)
        subject_id = int(subject_id)
        internal_mark = float(internal_mark)
        external_mark = float(external_mark)

    except (TypeError, ValueError):

        return jsonify({
            "message": "Student, subject and marks must be numeric"
        }), 400

    if (
        not isfinite(internal_mark)
        or not isfinite(external_mark)
    ):

        return jsonify({
            "message": "Marks must be valid numbers"
        }), 400

    student = db.session.get(
        Student,
        student_id
    )

    if not student:

        return jsonify({
            "message": "Student not found"
        }), 404

    subject = db.session.get(
        Subject,
        subject_id
    )

    if not subject:

        return jsonify({
            "message": "Subject not found"
        }), 404

    # Internal mark is out of 40.
    if internal_mark < 0 or internal_mark > 40:

        return jsonify({
            "message": "Internal mark must be between 0 and 40"
        }), 400

    # External mark is out of 60.
    if external_mark < 0 or external_mark > 60:

        return jsonify({
            "message": "External mark must be between 0 and 60"
        }), 400

    total_mark = internal_mark + external_mark

    try:

        # IMPORTANT BEHAVIOUR:
        # One student + one subject = one mark record.
        # If a mark already exists for the selected student and subject,
        # update that record instead of creating a second record.
        #
        # If older duplicate records already exist, keep the latest
        # mark_id and remove the extra records. The newly submitted marks
        # become the current marks for that student + subject.
        existing_marks = Mark.query.filter_by(
            student_id=student_id,
            subject_id=subject_id
        ).order_by(
            Mark.mark_id.desc()
        ).all()

        if existing_marks:

            # Keep the latest record for this student + subject.
            mark = existing_marks[0]
            old_mark_count = len(existing_marks)

            mark.internal_mark = internal_mark
            mark.external_mark = external_mark
            mark.total_mark = total_mark

            # Remove accidental duplicate rows created by the old logic.
            for duplicate_mark in existing_marks[1:]:
                db.session.delete(duplicate_mark)

            db.session.commit()

            return jsonify({
                "message": "Marks updated successfully",
                "mark_id": mark.mark_id,
                "student_id": student_id,
                "subject_id": subject_id,
                "subject_name": subject.subject_name,
                "internal_mark": internal_mark,
                "external_mark": external_mark,
                "total_mark": total_mark,
                "duplicate_records_removed": max(
                    old_mark_count - 1,
                    0
                )
            }), 200

        # No existing record: create the first mark record.
        mark = Mark(
            student_id=student_id,
            subject_id=subject_id,
            internal_mark=internal_mark,
            external_mark=external_mark,
            total_mark=total_mark
        )

        db.session.add(mark)
        db.session.commit()

        return jsonify({
            "message": "Marks added successfully",
            "mark_id": mark.mark_id,
            "student_id": student_id,
            "subject_id": subject_id,
            "subject_name": subject.subject_name,
            "internal_mark": internal_mark,
            "external_mark": external_mark,
            "total_mark": total_mark
        }), 201

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "message": "Failed to save marks",
            "error": str(e)
        }), 500


# =========================================================
# ADD ATTENDANCE
# =========================================================

@academic_bp.route("/attendance", methods=["POST"])
@jwt_required()
def add_attendance():

    if not teacher_only():
        return jsonify({
            "message": "Teacher access required"
        }), 403

    data = request.get_json() or {}

    student_id = data.get("student_id")
    subject_id = data.get("subject_id")
    total_classes = data.get("total_classes")
    attended_classes = data.get("attended_classes")

    if student_id is None or subject_id is None:

        return jsonify({
            "message": "Student and subject are required"
        }), 400

    if total_classes is None or attended_classes is None:

        return jsonify({
            "message": "Total classes and attended classes are required"
        }), 400

    try:

        total_classes = int(total_classes)
        attended_classes = int(attended_classes)

    except (TypeError, ValueError):

        return jsonify({
            "message": "Class values must be numbers"
        }), 400

    if total_classes <= 0:

        return jsonify({
            "message": "Total classes must be greater than zero"
        }), 400

    if attended_classes < 0:

        return jsonify({
            "message": "Attended classes cannot be negative"
        }), 400

    if attended_classes > total_classes:

        return jsonify({
            "message": "Attended classes cannot exceed total classes"
        }), 400

    student = db.session.get(
        Student,
        student_id
    )

    if not student:

        return jsonify({
            "message": "Student not found"
        }), 404

    subject = db.session.get(
        Subject,
        subject_id
    )

    if not subject:

        return jsonify({
            "message": "Subject not found"
        }), 404

    percentage = (
        attended_classes /
        total_classes
    ) * 100

    attendance = Attendance(
        student_id=student_id,
        subject_id=subject_id,
        total_classes=total_classes,
        attended_classes=attended_classes,
        percentage=percentage
    )

    try:

        db.session.add(attendance)
        db.session.commit()

        return jsonify({
            "message": "Attendance added successfully",
            "attendance_id": attendance.attendance_id,
            "student_id": student_id,
            "subject_id": subject_id,
            "subject_name": subject.subject_name,
            "total_classes": total_classes,
            "attended_classes": attended_classes,
            "percentage": round(
                percentage,
                2
            )
        }), 201

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "message": "Failed to add attendance",
            "error": str(e)
        }), 500
