from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
import os, uuid
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse

from database import get_db
from models import Notes, TeacherSubject
from check_user import teacher_only, student_only

UPLOAD_DIR = "uploads/notes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(
    prefix="/notes",
    tags=["Notes"]
)

@router.post("/upload")
def upload_notes(
    subject: str = Form(...),
    year: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    teacher=Depends(teacher_only)
):
    # ✅ validate assignment
    assignment = db.query(TeacherSubject).filter(
        TeacherSubject.teacher_id == teacher.id,
        TeacherSubject.subject == subject,
        TeacherSubject.year == year,
        TeacherSubject.branch == teacher.branch
    ).first()

    if not assignment:
        raise HTTPException(403, "You are not assigned to this subject")

    folder = f"{teacher.branch}_{year}_{subject}".replace(" ", "_")
    folder_path = os.path.join(UPLOAD_DIR, folder)
    os.makedirs(folder_path, exist_ok=True)

    ext = os.path.splitext(file.filename)[1]
    stored_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(folder_path, stored_filename)

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    note = Notes(
        subject=subject,
        year=year,
        branch=teacher.branch,
        filename=file.filename,
        file_path=file_path,
        uploaded_by=teacher.id,
        created_at=datetime.utcnow()
    )

    db.add(note)
    db.commit()
    db.refresh(note)

    return {"message": "Notes uploaded successfully"}


@router.get("/student")
def get_student_notes(
    db: Session = Depends(get_db),
    student=Depends(student_only)
):
    """
    Students fetch notes for their branch & year ONLY
    """

    notes = db.query(Notes).filter(
        Notes.branch == student.branch,
        Notes.year == student.year
    ).order_by(Notes.created_at.desc()).all()

    return [
        {
            "id": n.id,
            "subject": n.subject,
            "filename": n.filename,
            "uploaded_at": n.created_at
        }
        for n in notes
    ]

@router.delete("/{note_id}")
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    teacher=Depends(teacher_only)
):
    """
    Teacher deletes their own notes
    """

    note = db.query(Notes).filter(
        Notes.id == note_id,
        Notes.uploaded_by == teacher.id
    ).first()

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Note not found or not owned by you"
        )

    # delete file from disk
    if note.file_path and os.path.exists(note.file_path):
        os.remove(note.file_path)

    db.delete(note)
    db.commit()

    return {
        "message": "Note deleted successfully"
    }

@router.get("/download/{note_id}")
def download_note(
    note_id: int,
    db: Session = Depends(get_db),
    user=Depends(lambda: None),   # placeholder, resolved below
    student=Depends(student_only),
):
    """
    Student downloads notes of their class
    """

    note = db.query(Notes).filter(Notes.id == note_id).first()

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    # student access check
    if note.branch != student.branch or note.year != student.year:
        raise HTTPException(status_code=403, detail="Access denied")

    if not os.path.exists(note.file_path):
        raise HTTPException(status_code=404, detail="File missing")

    return FileResponse(
        path=note.file_path,
        filename=note.filename,
        media_type="application/octet-stream"
    )

@router.get("/download/teacher/{note_id}")
def teacher_download_note(
    note_id: int,
    db: Session = Depends(get_db),
    teacher=Depends(teacher_only)
):
    """
    Teacher downloads their own uploaded notes
    """

    note = db.query(Notes).filter(
        Notes.id == note_id,
        Notes.uploaded_by == teacher.id
    ).first()

    if not note:
        raise HTTPException(status_code=404, detail="Note not found or access denied")

    if not os.path.exists(note.file_path):
        raise HTTPException(status_code=404, detail="File missing")

    return FileResponse(
        path=note.file_path,
        filename=note.filename,
        media_type="application/octet-stream"
    )

@router.get("/teacher/subjects")
def get_teacher_subjects(
    db: Session = Depends(get_db),
    teacher=Depends(teacher_only)
):
    """
    Fetch subjects assigned to logged-in teacher
    """

    assignments = db.query(TeacherSubject).filter(
        TeacherSubject.teacher_id == teacher.id
    ).all()

    return [
        {
            "subject": a.subject,
            "year": a.year,
            "branch": a.branch
        }
        for a in assignments
    ]
@router.get("/teacher")
def get_teacher_notes(
    db: Session = Depends(get_db),
    teacher=Depends(teacher_only)
):
    """
    Teacher fetches their uploaded notes
    """

    notes = db.query(Notes).filter(
        Notes.uploaded_by == teacher.id
    ).order_by(Notes.created_at.desc()).all()

    return [
        {
            "id": n.id,
            "subject": n.subject,
            "filename": n.filename,
            "created_at": n.created_at.strftime("%Y-%m-%d %H:%M")
        }
        for n in notes
    ]
