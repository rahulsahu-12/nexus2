from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os

from database import Base, engine, get_db, SessionLocal
from models import User, Attendance
from utils import get_password_hash

from auth import router as auth_router
from admin_routes import router as admin_router
from chatbot_routes import router as chatbot_router
from routes import notes, pdf_analyzer, youtube_learning
from user_routes import router as user_router
from check_user import get_current_user, admin_only, teacher_only, student_only
from student_attendance import router as student_attendance_router
from manual_attendance import router as manual_attendance_router
from routes.student_attendance_history import router as student_attendance_history_router
from routes.teacher_attendance_history import router as teacher_attendance_history_router
from routes.student_assignment import router as student_assignment_router
from routes.teacher_assignment import router as teacher_assignment_router
from routes.teacher_dashboard import router as teacher_dashboard_router
from teacher_attendance import router as teacher_attendance_router
from routes import student

# ------------------------
# APP INIT
# ------------------------
app = FastAPI(title="NEXUS Backend")

Base.metadata.create_all(bind=engine)
# ------------------------
# FOLDERS
# ------------------------
os.makedirs("uploads/assignments/submissions", exist_ok=True)
os.makedirs("media/notes", exist_ok=True)

# ------------------------
# CORS
# ------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:3000",
    "http://192.168.1.7:3000",
    "https://your-frontend-url.onrender.com"
]
,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------
# STATIC FILES
# ------------------------
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ------------------------
# STARTUP (SAFE)
# ------------------------
@app.on_event("startup")
def startup_event():
    # ✅ Create tables safely
    Base.metadata.create_all(bind=engine)

    # ✅ Ensure admin exists
    db: Session = SessionLocal()
    try:
        admin = db.query(User).filter(User.role == "admin").first()
        if not admin:
            admin = User(
                name="Super Admin",
                mobile="9999999999",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                branch="ADMIN",
                year=None,
                dob="2000-01-01",
                gender="Other"
            )
            db.add(admin)
            db.commit()
            print("✅ Default admin created")
        else:
            print("ℹ️ Admin already exists")
    finally:
        db.close()

# ------------------------
# ROUTERS
# ------------------------
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(teacher_dashboard_router)
app.include_router(chatbot_router)
app.include_router(notes.router)
app.include_router(pdf_analyzer.router)
app.include_router(youtube_learning.router)
app.include_router(user_router)
app.include_router(student_assignment_router)
app.include_router(teacher_assignment_router)
app.include_router(student_attendance_router)
app.include_router(manual_attendance_router)
app.include_router(student_attendance_history_router)
app.include_router(teacher_attendance_history_router)
app.include_router(teacher_attendance_router)
app.include_router(student.router)

# ------------------------
# ROOT
# ------------------------
@app.get("/")
def root():
    return {"message": "NEXUS backend running"}

# ------------------------
# DASHBOARDS
# ------------------------
@app.get("/admin/dashboard")
def admin_dashboard(user=Depends(admin_only)):
    return {"message": f"Welcome Admin {user['username']}"}

@app.get("/teacher/dashboard")
def teacher_dashboard(
    db: Session = Depends(get_db),
    user=Depends(teacher_only)
):
    teacher = db.query(User).filter(User.id == user["user_id"]).first()
    return {
        "message": f"Welcome Teacher {teacher.name}",
        "attendance": {},
        "assignments": {},
        "recent_notes": []
    }

@app.get("/student/dashboard")
def student_dashboard(user=Depends(student_only)):
    return {"message": f"Welcome Student {user['username']}"}

# ------------------------
# TEST ROUTES
# ------------------------
@app.get("/test-protected")
def test(user=Depends(get_current_user)):
    return {"user": user}

@app.get("/me")
def read_me(user=Depends(get_current_user)):
    return user

# ------------------------
# STUDENT ATTENDANCE
# ------------------------
@app.get("/student/attendance")
def get_student_attendance(
    current_user=Depends(student_only),
    db: Session = Depends(get_db)
):
    student_id = current_user["id"]
    records = db.query(Attendance).filter(
        Attendance.student_id == student_id
    ).all()

    return [
        {
            "id": r.id,
            "subject": r.subject,
            "date": r.date,
            "status": r.status
        }
        for r in records
    ]
