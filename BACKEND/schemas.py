from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# =========================
# USER SCHEMAS
# =========================

class UserBase(BaseModel):
    name: str
    mobile: str
    role: str


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: int


# =========================
# AUTH / LOGIN
# =========================

class LoginSchema(BaseModel):
    mobile: str
    password: str


# =========================
# OTP
# =========================

class SendOTPRequest(BaseModel):
    mobile: str


class VerifyOTPRequest(BaseModel):
    mobile: str
    otp: str


class ResetPasswordRequest(BaseModel):
    mobile: str
    otp: str
    new_password: str


# =========================
# REGISTRATION
# =========================

class RegisterRequest(BaseModel):
    mobile: str
    password: str
    name: str
    dob: str
    gender: str
    branch: str
    year: Optional[int] = None   # MUST be string (matches DB)


# =========================
# TEACHER
# =========================

class CreateTeacherRequest(BaseModel):
    name: str
    mobile: str
    password: str
    branch: str
    dob: str
    gender: str


class AssignTeacherSubjectRequest(BaseModel):
    subject: str
    year: int

# =========================
# ATTENDANCE
# =========================

class CreateAttendanceSessionRequest(BaseModel):
    subject: str
    year: str


class AttendanceSessionResponse(BaseModel):
    session_id: int
    session_code: str
    expires_at: datetime


class MarkAttendanceRequest(BaseModel):
    session_code: str
 # =========================
# ASSIGNMENT SUBMISSION
# =========================

class AssignmentSubmissionOut(BaseModel):
    id: int
    student_id: int
    file_path: str
    submitted_at: datetime
    status: str
    score: Optional[int]
    remarks: Optional[str]

    class Config:
        from_attributes = True


class ReviewSubmissionRequest(BaseModel):
    status: str        # approved | rejected
    score: Optional[int] = None
    remarks: Optional[str] = None


class AttendanceMarkSchema(BaseModel):
    session_code: str
