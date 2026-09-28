from datetime import timedelta

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash

from database.db import db
from models.user import User


auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json() or {}

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({
            "message": "Username and password are required"
        }), 400

    user = User.query.filter_by(
        username=username
    ).first()

    if not user:
        return jsonify({
            "message": "Invalid username or password"
        }), 401

    if not check_password_hash(
        user.password,
        password
    ):
        return jsonify({
            "message": "Invalid username or password"
        }), 401

    access_token = create_access_token(
        identity=str(user.user_id),
        additional_claims={
            "role": user.role
        },
        expires_delta=timedelta(hours=8)
    )

    return jsonify({
        "message": "Login successful",
        "token": access_token,
        "user": {
            "user_id": user.user_id,
            "username": user.username,
            "role": user.role
        }
    }), 200