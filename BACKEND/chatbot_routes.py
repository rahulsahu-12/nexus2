from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import concurrent.futures
import re

from sqlalchemy.orm import Session
from database import get_db
from models import ChatHistory, ChatSession
from check_user import get_current_user
from concurrent.futures import TimeoutError as FuturesTimeout

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

# -------------------------
# Gemini setup
# -------------------------
genai.configure(api_key="AIzaSyA6qBgkxk5hUGuOMBmlAfzDMmS8evAiuaM")
model = genai.GenerativeModel("gemini-2.5-flash")

# -------------------------
# Schemas
# -------------------------
class ChatRequest(BaseModel):
    message: str
    session_id: int | None = None


class RenameSessionRequest(BaseModel):
    title: str


# -------------------------
# Utils
# -------------------------
SYSTEM_PROMPT = """
You are a college assistant chatbot.
Rules:
1. Answer ONLY educational questions.
2. Code only inside code blocks.
3. No asterisks.
"""

def clean_ai_output(text: str) -> str:
    return re.sub(r"\*", "", text).strip()


def generate_with_timeout(prompt: str, timeout=15):
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future = executor.submit(model.generate_content, prompt)
        try:
            return future.result(timeout=timeout)
        except FuturesTimeout:
            raise HTTPException(
                status_code=504,
                detail="AI response timed out"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"AI error: {str(e)}"
            )


def extract_gemini_reply(response) -> str:
    """
    Safely extract text from Gemini response.
    Handles empty / STOP / safety-blocked responses.
    """
    try:
        if not response or not hasattr(response, "candidates"):
            return "I couldn’t generate a response. Please try again."

        if not response.candidates:
            return "I couldn’t generate a response. Please try again."

        candidate = response.candidates[0]

        if not candidate.content or not candidate.content.parts:
            return "I couldn’t generate a response. Please try again."

        for part in candidate.content.parts:
            if hasattr(part, "text") and part.text:
                return part.text.strip()

        return "I couldn’t generate a response. Please try again."

    except Exception:
        return "I couldn’t generate a response. Please try again."


# =================================================
# CREATE CHAT SESSION
# =================================================
@router.post("/session")
def create_chat_session(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    session = ChatSession(user_id=user["user_id"])
    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "session_id": session.id,
        "title": session.title
    }


# =================================================
# RENAME CHAT SESSION
# =================================================
@router.put("/session/{session_id}")
def rename_chat_session(
    session_id: int,
    data: RenameSessionRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user["user_id"]
    ).first()

    if not session:
        raise HTTPException(404, "Session not found")

    session.title = data.title
    db.commit()

    return {"message": "Chat renamed"}


# =================================================
# SEND MESSAGE
# =================================================
@router.post("/chat")
def chat(
    req: ChatRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if not req.session_id:
        session = ChatSession(user_id=user["user_id"])
        db.add(session)
        db.commit()
        db.refresh(session)
        session_id = session.id
    else:
        session_id = req.session_id

    prompt = SYSTEM_PROMPT + "\nUser: " + req.message

    response = generate_with_timeout(prompt)

    # 🔒 SAFE EXTRACTION (FIX)
    raw_reply = extract_gemini_reply(response)
    reply = clean_ai_output(raw_reply)

    chat = ChatHistory(
        session_id=session_id,
        user_id=user["user_id"],
        message=req.message,
        reply=reply
    )
    db.add(chat)
    db.commit()

    return {
        "reply": reply,
        "session_id": session_id
    }


# =================================================
# DELETE MESSAGE
# =================================================
@router.delete("/message/{message_id}")
def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    msg = db.query(ChatHistory).filter(
        ChatHistory.id == message_id,
        ChatHistory.user_id == user["user_id"]
    ).first()

    if not msg:
        raise HTTPException(404, "Message not found")

    db.delete(msg)
    db.commit()

    return {"message": "Message deleted"}


# =================================================
# DELETE CHAT SESSION
# =================================================
@router.delete("/session/{session_id}")
def delete_chat_session(
    session_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    db.query(ChatHistory).filter(
        ChatHistory.session_id == session_id,
        ChatHistory.user_id == user["user_id"]
    ).delete()

    db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user["user_id"]
    ).delete()

    db.commit()

    return {"message": "Chat deleted"}
