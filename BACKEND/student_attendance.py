from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date
from pydantic import BaseModel

from database import get_db
from models import AttendanceSession, Attendance
from check_user import student_only

router = APIRouter(prefix="/student/attendance", tags=["Student Attendance"])


class MarkAttendanceRequest(BaseModel):
    digit_code: str


@router.post("/mark")
def mark_attendance(
    data: MarkAttendanceRequest,
    db: Session = Depends(get_db),
    student=Depends(student_only)
):
    now = datetime.utcnow()

    session = (
        db.query(AttendanceSession)
        .filter(
            AttendanceSession.digit_code == data.digit_code,
            AttendanceSession.is_active == True,
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=400,
            detail="Invalid attendance code"
        )

    if session.expires_at < now:
        raise HTTPException(
            status_code=400,
            detail="Attendance session expired"
        )

    # 🔐 class security
    if student.branch != session.branch or student.year != session.year:
        raise HTTPException(
            status_code=403,
            detail="Not allowed for this class"
        )

    today = date.today()

    existing = (
        db.query(Attendance)
        .filter(
            Attendance.student_id == student.id,
            Attendance.subject == session.subject,
            Attendance.date == today
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Attendance already marked"
        )

    attendance = Attendance(
        student_id=student.id,
        subject=session.subject,
        date=today,
        status="present"
    )

    db.add(attendance)
    db.commit()

    return {"message": "Attendance marked successfully"}
