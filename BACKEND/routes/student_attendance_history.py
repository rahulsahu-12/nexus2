from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Attendance
from check_user import student_only

router = APIRouter(
    prefix="/student/attendance",
    tags=["Student Attendance History"]
)

@router.get("/summary")
def student_attendance_summary(
    db: Session = Depends(get_db),
    student=Depends(student_only)
):
    """
    Student sees attendance percentage per subject
    """

    records = (
        db.query(
            Attendance.subject,
            func.count(Attendance.id).label("present_days")
        )
        .filter(
            Attendance.student_id == student.id,
            Attendance.status == "present"
        )
        .group_by(Attendance.subject)
        .all()
    )

    return [
        {
            "subject": r.subject,
            "present_days": r.present_days
        }
        for r in records
    ]

@router.get("/history")
def student_attendance_history(
    db: Session = Depends(get_db),
    student=Depends(student_only)
):
    """
    Student sees their full attendance log
    """

    records = (
        db.query(Attendance)
        .filter(Attendance.student_id == student.id)
        .order_by(Attendance.date.desc())
        .all()
    )

    return [
        {
            "subject": r.subject,
            "date": r.date,
            "status": r.status
        }
        for r in records
    ]
