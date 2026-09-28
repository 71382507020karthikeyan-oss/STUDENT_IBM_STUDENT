from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from werkzeug.security import generate_password_hash

from database.db import db
from models.user import User
from models.student import Student
from models.teacher import Teacher


admin_bp = Blueprint("admin", __name__)


# =========================================================
# ADMIN ACCESS CHECK
# =========================================================

def admin_only():

    claims = get_jwt()

    return claims.get("role") == "admin"


# =========================================================
# ADMIN DASHBOARD
# =========================================================

@admin_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():

    if not admin_only():
        return jsonify({
            "message": "Admin access required"
        }), 403

    return jsonify({
        "message": "Welcome to Admin Dashboard"
    }), 200


# =========================================================
# ADD STUDENT
# =========================================================

@admin_bp.route("/students", methods=["POST"])
@jwt_required()
def add_student():

    if not admin_only():
        return jsonify({
            "message": "Admin access required"
        }), 403

    data = request.get_json() or {}

    username = data.get("username")
    password = data.get("password")
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    department = data.get("department")
    year = data.get("year")
    section = data.get("section")
    date_of_birth = data.get("date_of_birth")
    address = data.get("address")

    if not username or not password or not name or not email:
        return jsonify({
            "message": "Username, password, name and email are required"
        }), 400

    existing_user = User.query.filter_by(
        username=username
    ).first()

    if existing_user:
        return jsonify({
            "message": "Username already exists"
        }), 409

    existing_student = Student.query.filter_by(
        email=email
    ).first()

    if existing_student:
        return jsonify({
            "message": "Student email already exists"
        }), 409

    try:

        user = User(
            username=username,
            password=generate_password_hash(password),
            role="student"
        )

        db.session.add(user)

        db.session.flush()

        student = Student(
            user_id=user.user_id,
            name=name,
            email=email,
            phone=phone,
            department=department,
            year=year,
            section=section,
            date_of_birth=date_of_birth,
            address=address
        )

        db.session.add(student)

        db.session.commit()

        return jsonify({

            "message": "Student created successfully",

            "student": {

                "student_id": student.student_id,

                "user_id": user.user_id,

                "username": user.username,

                "name": student.name,

                "email": student.email,

                "phone": student.phone,

                "department": student.department,

                "year": student.year,

                "section": student.section,

                "date_of_birth":
                    str(student.date_of_birth)
                    if student.date_of_birth
                    else None,

                "address": student.address

            }

        }), 201

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "message": "Failed to create student",
            "error": str(e)
        }), 500


# =========================================================
# GET ALL STUDENTS
# =========================================================

@admin_bp.route("/students", methods=["GET"])
@jwt_required()
def get_students():

    if not admin_only():
        return jsonify({
            "message": "Admin access required"
        }), 403

    students = Student.query.order_by(
        Student.student_id
    ).all()

    result = []

    for student in students:

        user = db.session.get(
            User,
            student.user_id
        )

        result.append({

            "student_id": student.student_id,

            "user_id": student.user_id,

            "username":
                user.username
                if user
                else None,

            "name": student.name,

            "email": student.email,

            "phone": student.phone,

            "department": student.department,

            "year": student.year,

            "section": student.section,

            "date_of_birth":
                str(student.date_of_birth)
                if student.date_of_birth
                else None,

            "address": student.address

        })

    return jsonify({

        "count": len(result),

        "students": result

    }), 200


# =========================================================
# UPDATE STUDENT
# Includes profile + username + password
# Password is optional.
# =========================================================

@admin_bp.route("/students/<int:student_id>", methods=["PUT"])
@jwt_required()
def update_student(student_id):

    if not admin_only():
        return jsonify({
            "message": "Admin access required"
        }), 403

    student = db.session.get(
        Student,
        student_id
    )

    if not student:
        return jsonify({
            "message": "Student not found"
        }), 404

    user = db.session.get(
        User,
        student.user_id
    )

    if not user:
        return jsonify({
            "message": "Student user account not found"
        }), 404

    data = request.get_json() or {}

    # -----------------------------------------------------
    # PROFILE DETAILS
    # -----------------------------------------------------

    if "name" in data:
        student.name = data["name"]

    if "email" in data:

        existing_student = Student.query.filter(
            Student.email == data["email"],
            Student.student_id != student_id
        ).first()

        if existing_student:
            return jsonify({
                "message": "Student email already exists"
            }), 409

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

    # -----------------------------------------------------
    # USERNAME CHANGE
    # -----------------------------------------------------

    if "username" in data:

        new_username = str(
            data["username"]
        ).strip()

        if not new_username:

            return jsonify({
                "message": "Username cannot be empty"
            }), 400

        existing_user = User.query.filter(
            User.username == new_username,
            User.user_id != user.user_id
        ).first()

        if existing_user:

            return jsonify({
                "message": "Username already exists"
            }), 409

        user.username = new_username

    # -----------------------------------------------------
    # PASSWORD CHANGE
    # -----------------------------------------------------

    if "password" in data:

        new_password = str(
            data["password"]
        )

        # Empty password means don't change it
        if new_password.strip():

            user.password = generate_password_hash(
                new_password
            )

    # -----------------------------------------------------
    # SAVE
    # -----------------------------------------------------

    try:

        db.session.commit()

        return jsonify({

            "message": "Student updated successfully",

            "student": {

                "student_id":
                    student.student_id,

                "user_id":
                    user.user_id,

                "username":
                    user.username,

                "name":
                    student.name,

                "email":
                    student.email,

                "phone":
                    student.phone,

                "department":
                    student.department,

                "year":
                    student.year,

                "section":
                    student.section

            }

        }), 200

    except Exception as e:

        db.session.rollback()

        return jsonify({

            "message": "Failed to update student",

            "error": str(e)

        }), 500


# =========================================================
# ADD TEACHER
# =========================================================

@admin_bp.route("/teachers", methods=["POST"])
@jwt_required()
def add_teacher():

    if not admin_only():
        return jsonify({
            "message": "Admin access required"
        }), 403

    data = request.get_json() or {}

    username = data.get("username")
    password = data.get("password")
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    department = data.get("department")

    if not username or not password or not name or not email:
        return jsonify({
            "message": "Username, password, name and email are required"
        }), 400

    existing_user = User.query.filter_by(
        username=username
    ).first()

    if existing_user:
        return jsonify({
            "message": "Username already exists"
        }), 409

    existing_teacher = Teacher.query.filter_by(
        email=email
    ).first()

    if existing_teacher:
        return jsonify({
            "message": "Teacher email already exists"
        }), 409

    try:

        user = User(
            username=username,
            password=generate_password_hash(password),
            role="teacher"
        )

        db.session.add(user)

        db.session.flush()

        teacher = Teacher(
            user_id=user.user_id,
            name=name,
            email=email,
            phone=phone,
            department=department
        )

        db.session.add(teacher)

        db.session.commit()

        return jsonify({

            "message": "Teacher created successfully",

            "teacher": {

                "teacher_id":
                    teacher.teacher_id,

                "user_id":
                    user.user_id,

                "username":
                    user.username,

                "name":
                    teacher.name,

                "email":
                    teacher.email,

                "phone":
                    teacher.phone,

                "department":
                    teacher.department

            }

        }), 201

    except Exception as e:

        db.session.rollback()

        return jsonify({

            "message": "Failed to create teacher",

            "error": str(e)

        }), 500


# =========================================================
# GET ALL TEACHERS
# =========================================================

@admin_bp.route("/teachers", methods=["GET"])
@jwt_required()
def get_teachers():

    if not admin_only():
        return jsonify({
            "message": "Admin access required"
        }), 403

    teachers = Teacher.query.order_by(
        Teacher.teacher_id
    ).all()

    result = []

    for teacher in teachers:

        user = db.session.get(
            User,
            teacher.user_id
        )

        result.append({

            "teacher_id":
                teacher.teacher_id,

            "user_id":
                teacher.user_id,

            "username":
                user.username
                if user
                else None,

            "name":
                teacher.name,

            "email":
                teacher.email,

            "phone":
                teacher.phone,

            "department":
                teacher.department

        })

    return jsonify({

        "count": len(result),

        "teachers": result

    }), 200


# =========================================================
# UPDATE TEACHER
# Includes profile + username + password
# Password is optional.
# =========================================================

@admin_bp.route("/teachers/<int:teacher_id>", methods=["PUT"])
@jwt_required()
def update_teacher(teacher_id):

    if not admin_only():
        return jsonify({
            "message": "Admin access required"
        }), 403

    teacher = db.session.get(
        Teacher,
        teacher_id
    )

    if not teacher:
        return jsonify({
            "message": "Teacher not found"
        }), 404

    user = db.session.get(
        User,
        teacher.user_id
    )

    if not user:
        return jsonify({
            "message": "Teacher user account not found"
        }), 404

    data = request.get_json() or {}

    # -----------------------------------------------------
    # PROFILE DETAILS
    # -----------------------------------------------------

    if "name" in data:
        teacher.name = data["name"]

    if "email" in data:

        existing_teacher = Teacher.query.filter(
            Teacher.email == data["email"],
            Teacher.teacher_id != teacher_id
        ).first()

        if existing_teacher:
            return jsonify({
                "message": "Teacher email already exists"
            }), 409

        teacher.email = data["email"]

    if "phone" in data:
        teacher.phone = data["phone"]

    if "department" in data:
        teacher.department = data["department"]

    # -----------------------------------------------------
    # USERNAME CHANGE
    # -----------------------------------------------------

    if "username" in data:

        new_username = str(
            data["username"]
        ).strip()

        if not new_username:

            return jsonify({
                "message": "Username cannot be empty"
            }), 400

        existing_user = User.query.filter(
            User.username == new_username,
            User.user_id != user.user_id
        ).first()

        if existing_user:

            return jsonify({
                "message": "Username already exists"
            }), 409

        user.username = new_username

    # -----------------------------------------------------
    # PASSWORD CHANGE
    # -----------------------------------------------------

    if "password" in data:

        new_password = str(
            data["password"]
        )

        # Empty password means don't change it
        if new_password.strip():

            user.password = generate_password_hash(
                new_password
            )

    # -----------------------------------------------------
    # SAVE
    # -----------------------------------------------------

    try:

        db.session.commit()

        return jsonify({

            "message": "Teacher updated successfully",

            "teacher": {

                "teacher_id":
                    teacher.teacher_id,

                "user_id":
                    user.user_id,

                "username":
                    user.username,

                "name":
                    teacher.name,

                "email":
                    teacher.email,

                "phone":
                    teacher.phone,

                "department":
                    teacher.department

            }

        }), 200

    except Exception as e:

        db.session.rollback()

        return jsonify({

            "message": "Failed to update teacher",

            "error": str(e)

        }), 500