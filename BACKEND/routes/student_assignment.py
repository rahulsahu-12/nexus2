import os
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from database import get_db
from models import Assignment, AssignmentSubmission, User
from utils import SECRET_KEY, ALGORITHM

UPLOAD_DIR = "uploads/assignments/submissions"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(
    prefix="/student/assignments",
    tags=["Student Assignments"]
)


# =========================
# INTERNAL AUTH (HEADER OR QUERY)
# =========================
def get_student_from_token(
    db: Session,
    token: str | None
):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    student = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.role == "student",
            User.is_active == True
        )
        .first()
    )

    if not student:
        raise HTTPException(status_code=403, detail="Student only")

    return student


# =========================
# LIST ASSIGNMENTS
# =========================
@router.get("/")
def list_student_assignments(
    db: Session = Depends(get_db),
    token: str | None = Query(default=None)
):
    student = get_student_from_token(db, token)

    assignments = (
        db.query(Assignment)
        .filter(
            Assignment.branch == student.branch,
            Assignment.year == student.year
        )
        .order_by(Assignment.due_date)
        .all()
    )

    result = []

    for a in assignments:
        submission = (
            db.query(AssignmentSubmission)
            .filter(
                AssignmentSubmission.assignment_id == a.id,
                AssignmentSubmission.student_id == student.id
            )
            .first()
        )

        result.append({
            "assignment_id": a.id,
            "subject": a.subject,
            "title": a.title,
            "description": a.description,
            "due_date": a.due_date,
            "assignment_file": a.file_path,
            "status": submission.status if submission else "not_submitted",
            "score": submission.score if submission else None,
            "remarks": submission.remarks if submission else None
        })

    return result


# =========================
# VIEW ASSIGNMENT FILE (SECURE)
# =========================
@router.get("/{assignment_id}/file")
def view_assignment_file(
    assignment_id: int,
    db: Session = Depends(get_db),
    token: str | None = Query(default=None)
):
    student = get_student_from_token(db, token)

    assignment = (
        db.query(Assignment)
        .filter(
            Assignment.id == assignment_id,
            Assignment.branch == student.branch,
            Assignment.year == student.year
        )
        .first()
    )

    if not assignment or not assignment.file_path:
        raise HTTPException(status_code=404, detail="File not found")

    if not os.path.exists(assignment.file_path):
        raise HTTPException(status_code=404, detail="File missing")

    return FileResponse(
        assignment.file_path,
        media_type="application/pdf",
        filename=os.path.basename(assignment.file_path)
    )


# =========================
# VIEW OWN SUBMISSION FILE
# =========================
@router.get("/{assignment_id}/submission/file")
def view_own_submission_file(
    assignment_id: int,
    db: Session = Depends(get_db),
    token: str | None = Query(default=None)
):
    student = get_student_from_token(db, token)

    submission = (
        db.query(AssignmentSubmission)
        .filter(
            AssignmentSubmission.assignment_id == assignment_id,
            AssignmentSubmission.student_id == student.id
        )
        .first()
    )

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if not os.path.exists(submission.file_path):
        raise HTTPException(status_code=404, detail="File missing")

    return FileResponse(
        submission.file_path,
        media_type="application/pdf",
        filename=os.path.basename(submission.file_path)
    )


# =========================
# SUBMIT / RESUBMIT ASSIGNMENT
# =========================
@router.post("/{assignment_id}/submit")
def submit_assignment(
    assignment_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    token: str | None = Query(default=None)
):
    student = get_student_from_token(db, token)

    assignment = (
        db.query(Assignment)
        .filter(
            Assignment.id == assignment_id,
            Assignment.branch == student.branch,
            Assignment.year == student.year
        )
        .first()
    )

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    existing = (
        db.query(AssignmentSubmission)
        .filter(
            AssignmentSubmission.assignment_id == assignment_id,
            AssignmentSubmission.student_id == student.id
        )
        .first()
    )

    if existing and existing.status in ("pending", "approved"):
        raise HTTPException(
            status_code=400,
            detail="Submission already under review or approved"
        )

    if existing and existing.status == "rejected":
        if os.path.exists(existing.file_path):
            os.remove(existing.file_path)
        db.delete(existing)
        db.commit()

    if assignment.due_date and datetime.utcnow() > assignment.due_date:
        raise HTTPException(
            status_code=400,
            detail="Submission deadline passed"
        )

    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    submission = AssignmentSubmission(
        assignment_id=assignment_id,
        student_id=student.id,
        file_path=file_path,
        status="pending"
    )

    db.add(submission)
    db.commit()

    return {"message": "Assignment submitted successfully"}
