from database.db import db


class Mark(db.Model):
    __tablename__ = "marks"

    mark_id = db.Column(
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

    internal_mark = db.Column(
        db.Numeric(5, 2)
    )

    external_mark = db.Column(
        db.Numeric(5, 2)
    )

    total_mark = db.Column(
        db.Numeric(5, 2)
    )