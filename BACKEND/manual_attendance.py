from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User, Attendance, TeacherSubject
from check_user import teacher_only

router = APIRouter(
    prefix="/teacher/attendance",
    tags=["Teacher Attendance"]
)

# -----------------------------
# 📌 SCHEMAS
# -----------------------------
from pydantic import BaseModel


class ManualAttendanceItem(BaseModel):
    student_id: int
    status: str   # "present" or "absent"


class ManualAttendanceRequest(BaseModel):
    subject: str
    year: str
    attendance_date: date
    records: List[ManualAttendanceItem]


# -----------------------------
# ✅ MANUAL ATTENDANCE ENDPOINT
# -----------------------------
@router.post("/manual")
def mark_manual_attendance(
    data: ManualAttendanceRequest,
    db: Session = Depends(get_db),
    teacher: User = Depends(teacher_only)
):
    """
    Manual attendance fallback for teachers
    """

    # -----------------------------
    # 1️⃣ Validate teacher-subject assignment
    # -----------------------------
    assignment = db.query(TeacherSubject).filter(
        TeacherSubject.teacher_id == teacher.id,
        TeacherSubject.subject == data.subject,
        TeacherSubject.year == data.year,
        TeacherSubject.branch == teacher.branch
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=403,
            detail="You are not assigned to this subject for this year"
        )

    # -----------------------------
    # 2️⃣ Fetch valid students (same branch + year)
    # -----------------------------
    students = db.query(User).filter(
        User.role == "student",
        User.branch == teacher.branch,
        User.year == data.year,
        User.is_active == True
    ).all()

    if not students:
        raise HTTPException(
            status_code=404,
            detail="No students found for this class"
        )

    valid_student_ids = {s.id for s in students}

    # -----------------------------
    # 3️⃣ Validate submitted records
    # -----------------------------
    for record in data.records:
        if record.student_id not in valid_student_ids:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid student ID: {record.student_id}"
            )

        if record.status not in ("present", "absent"):
            raise HTTPException(
                status_code=400,
                detail="Status must be 'present' or 'absent'"
            )

    # -----------------------------
    # 4️⃣ Prevent duplicate attendance for same date & subject
    # -----------------------------
    existing = db.query(Attendance).filter(
        Attendance.subject == data.subject,
        Attendance.date == data.attendance_date,
        Attendance.student_id.in_(valid_student_ids)
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Attendance already exists for this subject and date"
        )

    # -----------------------------
    # 5️⃣ Save attendance records
    # -----------------------------
    for record in data.records:
        attendance = Attendance(
            student_id=record.student_id,
            subject=data.subject,
            date=data.attendance_date,
            status=record.status
        )
        db.add(attendance)

    db.commit()

    return {
        "message": "Manual attendance saved successfully",
        "subject": data.subject,
        "date": str(data.attendance_date),
        "total_students": len(data.records)
    }



@router.get("/students")
def get_teacher_students(
    year: str,
    db: Session = Depends(get_db),
    teacher=Depends(teacher_only)
):
    students = db.query(User).filter(
        User.role == "student",
        User.branch == teacher.branch,
        User.year == year,
        User.is_active == True
    ).order_by(User.name).all()

    return [
        {
            "id": s.id,
            "name": s.name
        }
        for s in students
    ]
