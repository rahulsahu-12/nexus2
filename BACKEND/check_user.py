from fastapi import Depends, HTTPException, Header
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from database import get_db
from models import User
from utils import SECRET_KEY, ALGORITHM


# =========================
# GET CURRENT USER (JWT)
# =========================
def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    print("AUTH HEADER:", authorization)

    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")

    token = authorization.split(" ")[1]

    # ✅ 🔥 IMPORTANT FIX (THIS IS THE KEY)
    if not token or token == "undefined":
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = (
        db.query(
            User.id,
            User.role,
            User.branch,
            User.year,
            User.is_active
        )
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="User inactive")

    return {
        "user_id": user.id,
        "role": user.role,
        "branch": user.branch,
        "year": user.year
    }

     


# =========================
# ROLE GUARDS
# =========================
def admin_only(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


def teacher_only(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user = (
        db.query(User)
        .filter(User.id == current_user["user_id"])
        .first()
    )

    if not user or user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not a teacher")

    return user  # ✅ ORM User



def student_only(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user = (
        db.query(User)
        .filter(User.id == current_user["user_id"])
        .first()
    )

    if not user or user.role != "student":
        raise HTTPException(status_code=403, detail="Student only")

    return user  # ✅ ORM User

