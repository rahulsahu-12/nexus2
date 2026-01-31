import random
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User, OTPVerification
from schemas import SendOTPRequest, RegisterRequest, VerifyOTPRequest
from utils import get_password_hash, verify_password, create_access_token

router = APIRouter(tags=["Auth"])


# ================= LOGIN (ADMIN + TEACHER + STUDENT) =================
@router.post("/token")
def token_login(data: dict, db: Session = Depends(get_db)):
    mobile = data.get("mobile")
    password = data.get("password")

    if not mobile or not password:
        raise HTTPException(status_code=400, detail="Mobile and password required")

    # ================= ADMIN LOGIN (✅ ADDED) =================
    admin = db.query(User).filter(
        User.mobile == mobile,
        User.role == "admin",
        User.is_active == True
    ).first()

    if admin and verify_password(password, admin.hashed_password):
        token = create_access_token({
            "user_id": admin.id,
            "role": "admin",
            "branch": admin.branch
        })

        return {
            "access_token": token,
            "role": "admin"
        }

    # ================= TEACHER LOGIN =================
    teacher = db.query(User).filter(
        User.mobile == mobile,
        User.role == "teacher",
        User.is_active == True
    ).first()

    if teacher and verify_password(password, teacher.hashed_password):
        token = create_access_token({
            "user_id": teacher.id,
            "role": "teacher",
            "branch": teacher.branch
        })

        return {
            "access_token": token,
            "role": "teacher"
        }

    # ================= STUDENT LOGIN =================
    student = db.query(User).filter(
        User.mobile == mobile,
        User.role == "student"
    ).first()

    if student and verify_password(password, student.hashed_password):
        token = create_access_token({
            "user_id": student.id,
            "role": "student",
            "branch": student.branch,
            "year": student.year
        })

        return {
            "access_token": token,
            "role": "student"
        }

    raise HTTPException(status_code=401, detail="Invalid credentials")


# ================= SEND OTP =================
@router.post("/auth/send-otp")
def send_otp(data: SendOTPRequest, db: Session = Depends(get_db)):
    otp = str(random.randint(100000, 999999))

    db.query(OTPVerification).filter_by(mobile=data.mobile).delete()

    db.add(
        OTPVerification(
            mobile=data.mobile,
            otp=otp,
            expires_at=datetime.utcnow() + timedelta(minutes=5)
        )
    )
    db.commit()

    # DEV MODE ONLY
    return {
        "message": "OTP generated (DEV MODE)",
        "otp": otp
    }


# ================= VERIFY OTP =================
@router.post("/auth/verify-otp")
def verify_otp(data: VerifyOTPRequest, db: Session = Depends(get_db)):
    otp_record = db.query(OTPVerification).filter_by(mobile=data.mobile).first()

    if not otp_record or otp_record.otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if otp_record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")

    return {"message": "OTP verified"}


# ================= REGISTER STUDENT ONLY =================
@router.post("/auth/register")
def register_user(data: RegisterRequest, db: Session = Depends(get_db)):
    otp_record = db.query(OTPVerification).filter_by(mobile=data.mobile).first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="OTP not verified")

    if db.query(User).filter_by(mobile=data.mobile).first():
        raise HTTPException(status_code=400, detail="User already exists")

    if not data.year:
        raise HTTPException(
            status_code=400,
            detail="Year is required for student registration"
        )

    user = User(
        mobile=data.mobile,
        hashed_password=get_password_hash(data.password),
        name=data.name,
        dob=data.dob,
        gender=data.gender,
        branch=data.branch,
        year=data.year,
        role="student",
        is_active=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    db.delete(otp_record)
    db.commit()

    token = create_access_token({
        "user_id": user.id,
        "role": "student",
        "branch": user.branch,
        "year": user.year
    })

    return {
        "message": "User registered successfully",
        "token": token,
        "role": "student"
    }
