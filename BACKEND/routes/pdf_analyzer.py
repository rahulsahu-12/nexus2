from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import os, shutil, uuid
import fitz  # PyMuPDF

from check_user import get_current_user
from models import User
from ai_helper import generate_learning_content

router = APIRouter(prefix="/pdf-analyzer", tags=["PDF Analyzer"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    doc = fitz.open(file_path)
    for page in doc:
        text += page.get_text()
    return text

@router.post("/analyze")
def analyze_pdf(
    file: UploadFile = File(...),
    # current_user: User = Depends(get_current_user),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    unique_name = f"{uuid.uuid4()}.pdf"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text
    text = extract_text_from_pdf(file_path)

    if len(text.strip()) < 100:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail="PDF content too small")

    # AI processing
    result = generate_learning_content(
        topic=text[:3000],  # prevent token overload
        source="pdf"
    )

    # Cleanup
    os.remove(file_path)

    return {
        "success": True,
        "data": result
    }
