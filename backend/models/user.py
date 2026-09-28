from database.db import db


class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum("admin", "teacher", "student"), nullable=False)
    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )