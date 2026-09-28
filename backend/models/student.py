from database.db import db


class Student(db.Model):
    __tablename__ = "students"

    student_id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        unique=True
    )

    name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(150),
        unique=True,
        nullable=False
    )

    phone = db.Column(
        db.String(20)
    )

    department = db.Column(
        db.String(100)
    )

    year = db.Column(
        db.Integer
    )

    section = db.Column(
        db.String(20)
    )

    date_of_birth = db.Column(
        db.Date
    )

    address = db.Column(
        db.String(255)
    )