import os
import uuid
import csv
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import timezone, timedelta
from database import get_db
from models import Assignment, AssignmentSubmission, User, TeacherSubject
from check_user import teacher_only

UPLOAD_DIR = "uploads/assignments"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(
    prefix="/teacher/assignments",
    tags=["Teacher Assignments"]
)

# ======================================================
# CREATE ASSIGNMENT
# ======================================================
@router.post("/create")
def create_assignment(
    subject: str = Form(...),
    year: str = Form(...),
    title: str = Form(...),
    description: str | None = Form(None),
    due_date: datetime | None = Form(None),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    teacher=Depends(teacher_only)
):
    assignment_check = db.query(TeacherSubject).filter(
        TeacherSubject.teacher_id == teacher.id,
        TeacherSubject.subject == subject,
        TeacherSubject.year == year,
        TeacherSubject.branch == teacher.branch
    ).first()

    if not assignment_check:
        raise HTTPException(status_code=403, detail="You are not assigned to this subject")

    file_path = None
    if file:
        ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as f:
            f.write(file.file.read())

    assignment = Assignment(
        teacher_id=teacher.id,
        subject=subject,
        branch=teacher.branch,
        year=year,
        title=title,
        description=description,
        file_path=file_path,
        due_date=due_date
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return {"message": "Assignment created successfully", "assignment_id": assignment.id}


# ======================================================
# LIST ASSIGNMENTS
# ======================================================
@router.get("/")
def list_teacher_assignments(
    db: Session = Depends(get_db),
    teacher=Depends(teacher_only)
):
    assignments = db.query(Assignment).filter(
        Assignment.teacher_id == teacher.id
    ).order_by(Assignment.created_at.desc()).all()

    return [
        {
            "id": a.id,
            "subject": a.subject,
            "year": a.year,
            "title": a.title,
            "due_date": a.due_date,
            "created_at": a.created_at
        }
        for a in assignments
    ]


# ======================================================
# LIST SUBMISSIONS (🔥 MISSING PIECE)
# ======================================================
@router.get("/{assignment_id}/submissions")
def list_assignment_submissions(
    assignment_id: int,
    db: Session = Depends(get_db),
    teacher=Depends(teacher_only)
):
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.teacher_id == teacher.id
    ).first()

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    submissions = (
        db.query(AssignmentSubmission, User)
        .join(User, User.id == AssignmentSubmission.student_id)
        .filter(AssignmentSubmission.assignment_id == assignment_id)
        .order_by(AssignmentSubmission.submitted_at.desc())
        .all()
    )

    return [
        {
            "submission_id": s.id,
            "student_id": u.id,
            "student_name": u.name,
            "file_path": s.file_path,
            "status": s.status,
            "remarks": s.remarks,
            "submitted_at": s.submitted_at
        }
        for s, u in submissions
    ]


# ======================================================
# EXPORT SUBMISSIONS (CSV)
# ======================================================
@router.get("/{assignment_id}/submissions/export")
def export_submissions_csv(
    assignment_id: int,
    db: Session = Depends(get_db),
    teacher=Depends(teacher_only)
):
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.teacher_id == teacher.id
    ).first()

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    submissions = (
        db.query(AssignmentSubmission, User)
        .join(User, User.id == AssignmentSubmission.student_id)
        .filter(AssignmentSubmission.assignment_id == assignment_id)
        .all()
    )

    def generate():
        yield "Student Name,Status,Remarks,Submitted At\n"

    ist = timezone(timedelta(hours=5, minutes=30))

    for s, u in submissions:
        if s.submitted_at:
            submitted_at_ist = (
                s.submitted_at
                .replace(tzinfo=timezone.utc)
                .astimezone(ist)
                .strftime("%Y-%m-%d %H:%M:%S")
            )
        else:
            submitted_at_ist = ""

        yield (
            f'{u.name},'
            f'{s.status},'
            f'{s.remarks or ""},'
            f'{submitted_at_ist}\n'
        )



# ======================================================
# DELETE ASSIGNMENT
# ======================================================
from models import Assignment, AssignmentSubmission
import os

# ======================================================
# DELETE ASSIGNMENT (FIXED)
# ======================================================
@router.delete("/{assignment_id}")
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    teacher=Depends(teacher_only)
):
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.teacher_id == teacher.id
    ).first()

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # ✅ FIX: delete related submissions first
    submissions = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment.id
    ).all()

    for s in submissions:
        if s.file_path and os.path.exists(s.file_path):
            os.remove(s.file_path)

    db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment.id
    ).delete()

    # delete assignment file if exists
    if assignment.file_path and os.path.exists(assignment.file_path):
        os.remove(assignment.file_path)

    db.delete(assignment)
    db.commit()

    return {"message": "Assignment and related submissions deleted successfully"}



# ======================================================
# APPROVE / REJECT
# ======================================================
@router.post("/submissions/{submission_id}/approve")
def approve_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    teacher=Depends(teacher_only)
):
    submission = db.query(AssignmentSubmission).join(Assignment).filter(
        AssignmentSubmission.id == submission_id,
        Assignment.teacher_id == teacher.id
    ).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    submission.status = "approved"
    submission.remarks = None
    db.commit()

    return {"message": "Submission approved"}


@router.post("/submissions/{submission_id}/reject")
def reject_submission(
    submission_id: int,
    remarks: str = Form(...),
    db: Session = Depends(get_db),
    teacher=Depends(teacher_only)
):
    submission = db.query(AssignmentSubmission).join(Assignment).filter(
        AssignmentSubmission.id == submission_id,
        Assignment.teacher_id == teacher.id
    ).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    submission.status = "rejected"
    submission.remarks = remarks
    db.commit()

    return {"message": "Submission rejected"}

from fastapi.responses import FileResponse
from urllib.parse import quote


# ======================================================
# VIEW STUDENT SUBMISSION FILE (PDF)
# ======================================================
@router.get("/submissions/{submission_id}/file")
def view_submission_file(
    submission_id: int,
    db: Session = Depends(get_db),
    teacher=Depends(teacher_only)
):
    submission = (
        db.query(AssignmentSubmission)
        .join(Assignment, Assignment.id == AssignmentSubmission.assignment_id)
        .filter(
            AssignmentSubmission.id == submission_id,
            Assignment.teacher_id == teacher.id
        )
        .first()
    )

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if not submission.file_path or not os.path.exists(submission.file_path):
        raise HTTPException(status_code=404, detail="File not found")

    filename = os.path.basename(submission.file_path)

    return FileResponse(
        path=submission.file_path,
        media_type="application/pdf",
        filename=quote(filename)
    )
