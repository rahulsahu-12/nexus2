from sqlalchemy.sql import func
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Date
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


# ------------------------
# USER (STUDENT + TEACHER)
# ------------------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    mobile = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    name = Column(String, nullable=False)
    dob = Column(String, nullable=False)
    gender = Column(String, nullable=False)

    branch = Column(String, nullable=False)

    # 🔑 IMPORTANT CHANGE
    # Student → year is REQUIRED (handled in API)
    # Teacher → year is NULL
    year = Column(String, nullable=True)

    role = Column(String, default="student")  # student | teacher
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)


# ------------------------
# OTP VERIFICATION
# ------------------------

class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    mobile = Column(String, primary_key=True, index=True)
    otp = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)


# ------------------------
# ATTENDANCE SESSION (TEACHER)
# ------------------------

class AttendanceSession(Base):
    __tablename__ = "attendance_sessions"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"))

    # These will be used in QR validation later
    branch = Column(String, nullable=False)
    year = Column(String, nullable=False)
    subject = Column(String, nullable=False)

    session_code = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    digit_code = Column(String(6), index=True)
    expires_at = Column(DateTime)
    is_active = Column(Boolean, default=True)

    teacher = relationship("User")


# ------------------------
# ATTENDANCE (STUDENT RECORD)
# ------------------------

from sqlalchemy import Column, Integer, String, Date, ForeignKey, Enum, UniqueConstraint
from database import Base

class Attendance(Base):
    __tablename__ = "attendance"

    __table_args__ = (
        UniqueConstraint(
            "student_id", "subject", "date",
            name="unique_attendance_per_day"
        ),
    )

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    subject = Column(String, nullable=False)
    date = Column(Date, nullable=False)

    status = Column(
        Enum("present", "absent", name="attendance_status"),
        nullable=False
    )



# ------------------------
# CHAT HISTORY
# ------------------------

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(
        Integer,
        ForeignKey("chat_sessions.id"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # user message
    message = Column(String, nullable=False)

    # AI reply
    reply = Column(String, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ------------------------
# NOTES (TEACHER UPLOAD)
# ------------------------

class Notes(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False)
    year = Column(String, nullable=False)
    branch = Column(String, nullable=False)

    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)

    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, nullable=False)


class TeacherSubject(Base):
    __tablename__ = "teacher_subjects"

    id = Column(Integer, primary_key=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    subject = Column(String, nullable=False)
    year = Column(String, nullable=False)     # 1,2,3,4
    branch = Column(String, nullable=False)

    teacher = relationship("User")

# from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
# from sqlalchemy.orm import relationship
# from database import Base


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)

    # owner (student or teacher)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # session title (rename supported)
    title = Column(String, default="New Chat", nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    chats = relationship(
        "ChatHistory",
        backref="session",
        cascade="all, delete-orphan"
    )



class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)

    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    subject = Column(String, nullable=False)
    branch = Column(String, nullable=False)
    year = Column(String, nullable=False)

    title = Column(String, nullable=False)
    description = Column(String, nullable=True)

    file_path = Column(String, nullable=True)   # optional attachment
    due_date = Column(DateTime, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)


class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    id = Column(Integer, primary_key=True, index=True)

    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    file_path = Column(String, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    status = Column(String, default="pending")  
    # pending | approved | rejected

    score = Column(Integer, nullable=True)
    remarks = Column(String, nullable=True)

