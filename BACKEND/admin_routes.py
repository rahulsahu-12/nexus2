
# admin_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func,case
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
from database import get_db
from models import Attendance, User,TeacherSubject
from schemas import CreateTeacherRequest,AssignTeacherSubjectRequest
from utils import get_password_hash
from check_user import admin_only
from fastapi.responses import FileResponse
import pandas as pd
import os
import io


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import LoginSchema
from utils import verify_password
from auth import create_access_token

router = APIRouter(
    prefix="/admin",
    tags=["Admin / Staff"]
)

# =====================================================
# 🔐 STAFF LOGIN (ADMIN + TEACHER)
# =====================================================
@router.post("/login")
def staff_login(
    data: LoginSchema,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.mobile == data.mobile).first()

    if not user or user.role not in ["admin", "teacher"]:
        raise HTTPException(
            status_code=401,
            detail="Not a staff account"
        )

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    access_token = create_access_token({
        "user_id": user.id,
        "role": user.role
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }



@router.get("/attendance")
def get_all_attendance(
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    records = (
        db.query(Attendance, User.name, User.mobile)
        .join(User, User.id == Attendance.student_id)
        .all()
    )

    return [
        {
            "student_name": name,
            "mobile": mobile,
            "subject": attendance.subject,
            "date": attendance.date,
            "status": attendance.status,
        }
        for attendance, name, mobile in records
    ]


# Export attendance to Excel


@router.get("/attendance/export")
def export_attendance(
    start_date: str,
    end_date: str,
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    records = (
    db.query(
        Attendance,
        User.name.label("student_name"),
        User.mobile.label("student_mobile")
    )
    .join(User, User.id == Attendance.student_id)
    .filter(Attendance.date.between(start_date, end_date))
    .all()
)


    data = [
    {
        "Student ID": attendance.student_id,
        "Student Name": student_name,
        "Mobile": student_mobile,
        "Subject": attendance.subject,
        "Date": attendance.date,
        "Status": attendance.status,
    }
    for attendance, student_name, student_mobile in records
]


    df = pd.DataFrame(data)

    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Attendance")

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=attendance.xlsx"},
    )





@router.put("/promote/{user_id}")
def promote_to_teacher(
    user_id: int,
    db: Session = Depends(get_db),
    admin = Depends(admin_only)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role != "student":
        raise HTTPException(
            status_code=400,
            detail="Only students can be promoted"
        )

    user.role = "teacher"
    db.commit()

    return {
        "message": "User promoted to teacher",
        "user_id": user.id
    }

@router.get("/students")
def get_students(
    db: Session = Depends(get_db),
    admin = Depends(admin_only)
):
    return db.query(User).filter(User.role == "student").all()

@router.get("/attendance/analytics")
def attendance_analytics(
    start_date: str,
    end_date: str,
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    # -----------------------
    # Daily attendance %
    # -----------------------
    daily = (
        db.query(
            Attendance.date.label("date"),
            func.count().label("total"),
            func.sum(
                case((Attendance.status == "present", 1), else_=0)
            ).label("present"),
        )
        .filter(Attendance.date.between(start_date, end_date))
        .group_by(Attendance.date)
        .order_by(Attendance.date)
        .all()
    )

    daily_attendance = [
        {
            "date": str(d.date),
            "percentage": round((d.present / d.total) * 100, 2),
        }
        for d in daily
    ]

    # -----------------------
    # Subject-wise attendance %
    # -----------------------
    subjects = (
        db.query(
            Attendance.subject.label("subject"),
            func.count().label("total"),
            func.sum(
                case((Attendance.status == "present", 1), else_=0)
            ).label("present"),
        )
        .filter(Attendance.date.between(start_date, end_date))
        .group_by(Attendance.subject)
        .all()
    )

    subject_wise = [
        {
            "subject": s.subject,
            "percentage": round((s.present / s.total) * 100, 2),
        }
        for s in subjects
    ]

    # -----------------------
    # Overall present vs absent
    # -----------------------
    overall = (
        db.query(
            func.sum(case((Attendance.status == "present", 1), else_=0)),
            func.sum(case((Attendance.status == "absent", 1), else_=0)),
        )
        .filter(Attendance.date.between(start_date, end_date))
        .first()
    )

    return {
        "daily_attendance": daily_attendance,
        "subject_wise": subject_wise,
        "overall": {
            "present": overall[0] or 0,
            "absent": overall[1] or 0,
        },
    }
@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin = Depends(admin_only)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete admin")

    db.delete(user)
    db.commit()

    return {"message": "User deleted"}

@router.get("/users")
def get_users(
    db: Session = Depends(get_db),
    admin = Depends(admin_only)
):
    return db.query(User).all()

@router.get("/stats")
def admin_stats(
    db: Session = Depends(get_db),
    admin = Depends(admin_only)
):
    return {
        "students": db.query(User).filter(User.role == "student").count(),
        "teachers": db.query(User).filter(User.role == "teacher").count(),
        "admins": db.query(User).filter(User.role == "admin").count(),
        "total_users": db.query(User).count(),
    }

@router.get("/branch/{branch}")
def get_users_by_branch(
    branch: str,
    year: int | None = None,
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    # Students → branch + year
    student_query = db.query(User).filter(
        User.role == "student",
        User.branch == branch
    )

    if year is not None:
        student_query = student_query.filter(User.year == year)

    students = student_query.all()

    # Teachers → branch ONLY
    teachers = db.query(User).filter(
        User.role == "teacher",
        User.branch == branch
    ).all()

    return {
        "branch": branch,
        "year": year,
        "students": [
            {"id": s.id, "name": s.name, "mobile": s.mobile}
            for s in students
        ],
        "teachers": [
            {"id": t.id, "name": t.name, "mobile": t.mobile}
            for t in teachers
        ]
    }




     
@router.get("/branch/{branch}/export")
def export_branch_users(
    branch: str,
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    students = (
        db.query(User)
        .filter(User.role == "student", User.branch == branch)
        .all()
    )

    teachers = (
        db.query(User)
        .filter(User.role == "teacher", User.branch == branch)
        .all()
    )

    rows = []

    for s in students:
        rows.append({
            "Role": "Student",
            "Name": s.name,
            "Mobile": s.mobile,
            "Branch": s.branch
        })

    for t in teachers:
        rows.append({
            "Role": "Teacher",
            "Name": t.name,
            "Mobile": t.mobile,
            "Branch": t.branch
        })

    df = pd.DataFrame(rows)

    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Branch Users")

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename={branch}_users.xlsx"
        }
    )

@router.put("/demote/{user_id}")
def demote_to_student(
    user_id: int,
    year: str | None = None,
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role != "teacher":
        raise HTTPException(
            status_code=400,
            detail="Only teachers can be demoted"
        )

    user.role = "student"

    # restore year if provided
    if year:
        user.year = year

    db.commit()

    return {
        "message": "Teacher demoted back to student",
        "user_id": user.id
    }


@router.post("/teachers")
def create_teacher(
    data: CreateTeacherRequest,
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    if db.query(User).filter(User.mobile == data.mobile).first():
        raise HTTPException(status_code=400, detail="Mobile already exists")

    teacher = User(
        name=data.name,
        mobile=data.mobile,
        hashed_password=get_password_hash(data.password),
        dob=data.dob,
        gender=data.gender,
        branch=data.branch,
        year=None,          # 🔑 IMPORTANT
        role="teacher",
        is_active=True
    )

    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    return {
        "message": "Teacher created successfully",
        "teacher_id": teacher.id
    }

@router.post("/teachers/{teacher_id}/subjects")
def assign_subject(
    teacher_id: int,
    payload: AssignTeacherSubjectRequest,
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == "teacher"
    ).first()

    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    # ❌ Prevent duplicate
    exists = db.query(TeacherSubject).filter(
        TeacherSubject.teacher_id == teacher_id,
        TeacherSubject.subject == payload.subject,
        TeacherSubject.year == payload.year
    ).first()

    if exists:
        raise HTTPException(
            status_code=400,
            detail="Subject already assigned for this year"
        )

    ts = TeacherSubject(
        teacher_id=teacher_id,
        subject=payload.subject,
        year=payload.year,
        branch=teacher.branch  # ✅ FIX HERE
    )

    db.add(ts)
    db.commit()
    db.refresh(ts)

    return {"message": "Subject assigned successfully"}

   





@router.get("/teachers")
def get_teachers(
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    teachers = db.query(User).filter(User.role == "teacher").all()
    return teachers

@router.get("/teachers/{teacher_id}/subjects")
def get_teacher_subjects(
    teacher_id: int,
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    subjects = db.query(TeacherSubject).filter(
        TeacherSubject.teacher_id == teacher_id
    ).all()

    return [
        {
            "id": s.id,
            "subject": s.subject,
            "year": s.year,
            "branch": s.branch
        }
        for s in subjects
    ]

@router.get("/teachers/{teacher_id}/subjects")
def get_teacher_subjects(
    teacher_id: int,
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    subjects = db.query(TeacherSubject).filter(
        TeacherSubject.teacher_id == teacher_id
    ).all()

    return [
        {
            "id": s.id,
            "subject": s.subject,
            "year": s.year,
            "branch": s.branch
        }
        for s in subjects
    ]

@router.delete("/teachers/subjects/{subject_id}")
def delete_teacher_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    subject = db.query(TeacherSubject).filter(
        TeacherSubject.id == subject_id
    ).first()

    if not subject:
        raise HTTPException(
            status_code=404,
            detail="Assigned subject not found"
        )

    db.delete(subject)
    db.commit()

    return {"message": "Subject deleted successfully"}

@router.put("/teachers/{id}/branch")
def change_teacher_branch(
    id: int,
    branch: str,
    db: Session = Depends(get_db),
    admin=Depends(admin_only)
):
    teacher = db.query(User).filter(
        User.id == id,
        User.role == "teacher"
    ).first()

    if not teacher:
        raise HTTPException(404, "Teacher not found")

    # 1️⃣ Update branch
    teacher.branch = branch

    # 2️⃣ Remove old subject assignments
    db.query(TeacherSubject).filter(
        TeacherSubject.teacher_id == teacher.id
    ).delete()

    db.commit()

    return {
        "message": "Teacher branch updated. Subjects cleared."
    }

@router.options("/{path:path}")
def admin_options_handler(path: str):
    return {}
