from fastapi import APIRouter, HTTPException
from database.connection import db
from schemas.user import UserRegister
import bcrypt
import jwt
import os
from datetime import datetime, timezone, timedelta


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


# -----------------------------
# REGISTER
# -----------------------------

@router.post("/register")
def register_user(user: UserRegister):

    existing_user = db.users.find_one({"email": user.email})

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    user_document = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "role": user.role,
        "created_at": datetime.now(timezone.utc)
    }

    result = db.users.insert_one(user_document)

    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id)
    }


# -----------------------------
# LOGIN
# -----------------------------

@router.post("/login")
def login_user(email: str, password: str):

    user = db.users.find_one({"email": email})

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    password_correct = bcrypt.checkpw(
        password.encode("utf-8"),
        user["password"].encode("utf-8")
    )

    if not password_correct:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    secret_key = os.getenv("JWT_SECRET")

    payload = {
        "user_id": str(user["_id"]),
        "email": user["email"],
        "role": user["role"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=24)
    }

    token = jwt.encode(
        payload,
        secret_key,
        algorithm="HS256"
    )

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }