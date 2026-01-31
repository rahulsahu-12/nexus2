import qrcode
from fastapi import APIRouter

router = APIRouter()

@router.get("/qr")
def generate_qr(text: str):
    img = qrcode.make(text)
    path = "qr.png"
    img.save(path)
    return {"message": "QR generated", "file": path}
