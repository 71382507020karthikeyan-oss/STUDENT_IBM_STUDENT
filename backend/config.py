import os
from datetime import timedelta
from urllib.parse import quote_plus

from dotenv import load_dotenv

load_dotenv()

password = quote_plus(
    os.getenv("DB_PASSWORD", "")
)


class Config:

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://"
        f"{os.getenv('DB_USER')}:"
        f"{password}@"
        f"{os.getenv('DB_HOST')}:"
        f"{os.getenv('DB_PORT')}/"
        f"{os.getenv('DB_NAME')}"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY"
    )

    # Keep login token valid for 8 hours
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        hours=8
    )