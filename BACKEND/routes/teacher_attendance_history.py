from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
import csv, io

from database import get_db
from models import Attendance, User, TeacherSubject
from check_user import teacher_only
from fastapi.responses import StreamingResponse

router = APIRouter(
    prefix="/teacher/attendance",
    tags=["Teacher Attendance"]
)

# -------------------------------------------------
# INTERNAL HELPER
# -------------------------------------------------
def verify_teacher_subject(db, teacher, subject, year):
    assignment = db.query(TeacherSubject).filter(
        TeacherSubject.teacher_id == teacher.id,
        TeacherSubject.subject == subject,
        TeacherSubject.year == year,
        TeacherSubject.branch == teacher.branch
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=403,
            detail="Not authorized for this subject"
        )

# -------------------------------------------------
# SUBJECT HISTORY (DATE + PRESENT COUNT)
# -------------------------------------------------
@router.get("/history/subject")
def history_by_subject(
    subject: str,
    year: str,
    db: Session = Depends(get_db),
    teacher=Depends(teacher_only)
):
    verify_teacher_subject(db, teacher, subject, year)

    records = (
        db.query(
            Attendance.date,
            func.count(Attendance.id).label("present_count")
        )
        .join(User, User.id == Attendance.student_id)
        .filter(
            Attendance.subject == subject,
            Attendance.status == "present",
            User.branch == teacher.branch,
            User.year == year
        )
        .group_by(Attendance.date)
        .order_by(Attendance.date.desc())
        .all()
    )

    return [
        {
            "date": str(r.date),
            "present_count": r.present_count
        }
        for r in records
    ]

# -------------------------------------------------
# DATE HISTORY (STUDENT LIST)
# -------------------------------------------------
@router.get("/history/date")
def history_by_date(
    subject: str,
    year: str,
    attendance_date: date,
    db: Session = Depends(get_db),
    teacher=Depends(teacher_only)
):
    verify_teacher_subject(db, teacher, subject, year)

    records = (
        db.query(User.id, User.name, Attendance.status)
        .join(Attendance, Attendance.student_id == User.id)
        .filter(
            Attendance.subject == subject,
            Attendance.date == attendance_date,
            User.branch == teacher.branch,
            User.year == year
        )
        .order_by(User.name)
        .all()
    )

    return [
        {
            "id": r.id,
            "name": r.name,
            "status": r.status
        }
        for r in records
    ]

# -------------------------------------------------
# EXPORT CSV
# -------------------------------------------------
@router.get("/export/csv")
def export_attendance_csv(
    subject: str,
    year: str,
    attendance_date: date,
    db: Session = Depends(get_db),
    teacher=Depends(teacher_only)
):
    verify_teacher_subject(db, teacher, subject, year)

    records = (
        db.query(
            User.name,
            User.mobile,
            Attendance.subject,
            Attendance.date,
            Attendance.status
        )
        .join(User, User.id == Attendance.student_id)
        .filter(
            Attendance.subject == subject,
            Attendance.date == attendance_date,
            User.branch == teacher.branch,
            User.year == year
        )
        .order_by(User.name)
        .all()
    )

    if not records:
        raise HTTPException(404, "No attendance data found")

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["Student Name", "Mobile", "Subject", "Date", "Status"])

    for r in records:
        writer.writerow([r.name, r.mobile, r.subject, r.date, r.status])

    output.seek(0)

    filename = f"{subject}_{year}_{attendance_date}.csv"

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
