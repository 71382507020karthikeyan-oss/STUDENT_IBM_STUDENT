from database.db import db


class Attendance(db.Model):
    __tablename__ = "attendance"

    attendance_id = db.Column(
        db.Integer,
        primary_key=True
    )

    student_id = db.Column(
        db.Integer,
        db.ForeignKey("students.student_id"),
        nullable=False
    )

    subject_id = db.Column(
        db.Integer,
        db.ForeignKey("subjects.subject_id"),
        nullable=False
    )

    total_classes = db.Column(
        db.Integer,
        nullable=False
    )

    attended_classes = db.Column(
        db.Integer,
        nullable=False
    )

    percentage = db.Column(
        db.Numeric(5, 2)
    )