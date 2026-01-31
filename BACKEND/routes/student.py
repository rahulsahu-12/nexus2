from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from check_user import teacher_only

router = APIRouter(
    prefix="/teacher",
    tags=["Teacher Students"]
)

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
        { "id": s.id, "name": s.name }
        for s in students
    ]
