from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from database.db import db

# Models
from models.user import User
from models.student import Student
from models.teacher import Teacher
from models.subject import Subject
from models.marks import Mark
from models.attendance import Attendance

# Routes
from routes.auth import auth_bp
from routes.admin import admin_bp
from routes.teacher import teacher_bp
from routes.academic import academic_bp
from routes.student import student_bp

app = Flask(__name__)

# Load configuration
app.config.from_object(Config)

# Enable CORS
CORS(app)

# Initialize database
db.init_app(app)

# Initialize JWT
jwt = JWTManager(app)


# ==============================
# REGISTER ROUTES
# ==============================

app.register_blueprint(
    auth_bp,
    url_prefix="/api/auth"
)

app.register_blueprint(
    admin_bp,
    url_prefix="/api/admin"
)

app.register_blueprint(
    teacher_bp,
    url_prefix="/api/teacher"
)

app.register_blueprint(
    academic_bp,
    url_prefix="/api/academic"
)
app.register_blueprint(
    student_bp,
    url_prefix="/api/student"
)

# ==============================
# HOME
# ==============================

@app.route("/")
def home():

    return {
        "message": "Student Management System API",
        "status": "running"
    }


# ==============================
# DATABASE TEST
# ==============================

@app.route("/api/test-db")
def test_database():

    try:

        db.session.execute(
            db.text("SELECT 1")
        )

        return {
            "database": "connected",
            "status": "success"
        }

    except Exception as e:

        return {
            "database": "connection failed",
            "error": str(e)
        }, 500


# ==============================
# RUN APPLICATION
# ==============================

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )