from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta,date
import uuid
from pydantic import BaseModel
from models import User,TeacherSubject,Attendance

from database import get_db
from models import AttendanceSession
from check_user import teacher_only
import random

router = APIRouter(prefix="/teacher/attendance", tags=["Teacher Attendance"])

class StartAttendanceRequest(BaseModel):
    subject: str
    year: int


@router.post("/start")
def start_attendance(
    data: StartAttendanceRequest,
    db: Session = Depends(get_db),
    teacher=Depends(teacher_only)
):
    teacher_id = teacher.id
    branch = teacher.branch

    # deactivate old sessions
    db.query(AttendanceSession).filter(
        AttendanceSession.teacher_id == teacher_id,
        AttendanceSession.is_active == True
    ).update({"is_active": False})
    db.commit()

    session = AttendanceSession(
        teacher_id=teacher_id,
        branch=branch,
        year=data.year,
        subject=data.subject,
        session_code=str(uuid.uuid4())[:8],
        digit_code=str(random.randint(100000, 999999)),  # ✅ 6-digit
        expires_at=datetime.utcnow() + timedelta(minutes=3),
        is_active=True
    )

    db.add(session)
    db.commit()
    db.refresh(session)
    print("🕒 SERVER UTC NOW:", datetime.utcnow())
    print("🕒 EXPIRES AT:", session.expires_at)

    return {
        "session_id": session.id,
        "session_code": session.session_code,
        "digit_code": session.digit_code,     # ✅ RETURNED
        "expires_at": session.expires_at
    }

# teacher_attendance.py

@router.get("/subjects")
def get_teacher_subjects(
    db: Session = Depends(get_db),
    user = Depends(teacher_only)
):
    subjects = (
        db.query(TeacherSubject.subject)
        .filter(TeacherSubject.teacher_id == user.id)
        .distinct()
        .all()
    )

    return [s[0] for s in subjects]

@router.get("/subject-years/{subject}")
def get_subject_years(
    subject: str,
    db: Session = Depends(get_db),
    teacher = Depends(teacher_only)
):
    years = (
        db.query(TeacherSubject.year)
        .filter(
            TeacherSubject.teacher_id == teacher.id,
            TeacherSubject.subject == subject
        )
        .distinct()
        .all()
    )

    return [y[0] for y in years]

@router.get("/manual/check")
def check_manual_attendance(
    subject: str,
    year: int,
    date: date,
    db: Session = Depends(get_db),
    teacher=Depends(teacher_only)
):
    exists = db.query(Attendance).filter(
        Attendance.subject == subject,
        Attendance.year == year,
        Attendance.date == date
    ).first() is not None

    return {"exists": exists}
