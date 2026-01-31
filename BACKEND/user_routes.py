from fastapi import APIRouter, Depends, HTTPException
from check_user import get_current_user
from models import User

router = APIRouter()

@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    # 🔒 PERMANENT RULE:
    # A student must always have a year
    if current_user.role == "student" and current_user.year is None:
        raise HTTPException(
            status_code=400,
            detail="Student year is missing. Please contact admin."
        )

    return {
        "id": current_user.id,
        "name": current_user.name,
        "mobile": current_user.mobile,
        "role": current_user.role,
        "branch": current_user.branch,
        "year": current_user.year   # ✅ ALWAYS RETURN YEAR
    }
