from werkzeug.security import generate_password_hash

from app import app
from database.db import db
from models.user import User


with app.app_context():

    existing_admin = User.query.filter_by(
        username="admin"
    ).first()

    if existing_admin:
        print("Admin already exists.")

    else:
        admin = User(
            username="admin",
            password=generate_password_hash("admin123"),
            role="admin"
        )

        db.session.add(admin)
        db.session.commit()

        print("Admin account created successfully.")
        print("Username: admin")
        print("Password: admin123")