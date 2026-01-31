from datetime import date, timedelta, datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import (
    Attendance,
    Assignment,
    AssignmentSubmission,
    Notes,
    User
)
from check_user import teacher_only

router = APIRouter(
    prefix="/teacher/dashboard",
    tags=["Teacher Dashboard"]
)


@router.get("")
def teacher_dashboard_root(
    db: Session = Depends(get_db),
    teacher=Depends(teacher_only)
):
    today = date.today()
    now = datetime.utcnow()
    last_7_days = now - timedelta(days=7)

    # =====================
    # ATTENDANCE SUMMARY
    # =====================
    present_count = (
        db.query(func.count(Attendance.id))
        .join(User, User.id == Attendance.student_id)
        .filter(
            Attendance.date == today,
            Attendance.status == "present",
            User.branch == teacher.branch
        )
        .scalar()
    ) or 0

    total_students = (
        db.query(func.count(User.id))
        .filter(
            User.role == "student",
            User.branch == teacher.branch
        )
        .scalar()
    ) or 0

    attendance = {
        "active": False,          # you can update later
        "subject": None,
        "session_code": None,
        "present": present_count,
        "total_students": total_students
    }

    # =====================
    # ASSIGNMENTS SUMMARY
    # =====================
    assignments = db.query(Assignment).filter(
        Assignment.teacher_id == teacher.id
    ).all()

    assignment_summary = {
        "total": len(assignments),
        "due_today": 0,
        "overdue": 0,
        "pending_submissions": 0
    }

    for a in assignments:
        if a.due_date:
            if a.due_date.date() == today:
                assignment_summary["due_today"] += 1
            elif a.due_date < now:
                assignment_summary["overdue"] += 1

        total_students = db.query(User).filter(
            User.role == "student",
            User.branch == a.branch,
            User.year == a.year
        ).count()

        submitted = db.query(AssignmentSubmission).filter(
            AssignmentSubmission.assignment_id == a.id
        ).count()

        assignment_summary["pending_submissions"] += max(
            total_students - submitted, 0
        )

    # =====================
    # RECENT NOTES (7 DAYS)
    # =====================
    notes = db.query(Notes).filter(
        Notes.uploaded_by == teacher.id,
        Notes.created_at >= last_7_days
    ).order_by(Notes.created_at.desc()).limit(5).all()

    recent_notes = [
        {
            "id": n.id,
            "subject": n.subject,
            "year": n.year,
            "filename": n.filename,
            "uploaded_at": n.created_at
        }
        for n in notes
    ]

    # =====================
    # FINAL RESPONSE
    # =====================
    return {
        "attendance": attendance,
        "assignments": assignment_summary,
        "recent_notes": recent_notes
    }
