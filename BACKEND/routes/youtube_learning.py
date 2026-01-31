from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import re
import requests

from ai_helper import generate_learning_content
from youtube_utils import fetch_transcript_text

router = APIRouter(
    prefix="/youtube-analyzer",
    tags=["YouTube Analyzer"]
)

class YouTubeInput(BaseModel):
    title: str
    channel: str | None = ""

def is_url(text: str) -> bool:
    return bool(re.match(r"https?://", text))


def build_seed_from_title(title: str) -> str:
    title_lower = title.lower()

    if "html" in title_lower:
        return f"""
        This video titled "{title}" introduces HTML for beginners.
        It explains what HTML is and why it is used to build websites.
        The structure of an HTML document is explained clearly.
        Basic tags such as html, head, body, and title are introduced.
        The video demonstrates how to create a simple HTML file.
        Viewers learn how a browser reads and displays HTML code.
        Common beginner mistakes are discussed.
        This video helps learners build their first web page confidently.
        """

    if "css" in title_lower:
        return f"""
        This video titled "{title}" introduces CSS and its role in styling web pages.
        It explains how CSS works with HTML.
        Core styling concepts such as colors, fonts, and layouts are explained.
        Practical examples demonstrate how to apply styles.
        """

    if "javascript" in title_lower:
        return f"""
        This video titled "{title}" introduces JavaScript programming.
        It explains how JavaScript adds interactivity to websites.
        Basic concepts such as variables, functions, and events are discussed.
        """

    # 🔹 Generic fallback
    return f"""
    This video titled "{title}" explains an educational topic.
    It introduces the subject in a simple and understandable manner.
    Core concepts related to the topic are discussed.
    Key ideas are explained step by step.
    The video is useful for learning and revision.
    """


def fetch_youtube_title(url: str) -> str | None:
    try:
        res = requests.get(
            "https://www.youtube.com/oembed",
            params={"url": url, "format": "json"},
            timeout=5
        )
        if res.status_code == 200:
            return res.json().get("title")
    except:
        pass
    return None


@router.post("/analyze")
def analyze_youtube(data: YouTubeInput):
    if not data.title:
        raise HTTPException(status_code=400, detail="Video title required")

    transcript_text = None
    display_topic = "YouTube Video Notes"

    # 🔹 If URL, try transcript + title extraction
    if is_url(data.title):
        transcript_text = fetch_transcript_text(data.title)
        real_title = fetch_youtube_title(data.title)
        if real_title:
            display_topic = real_title
    else:
        display_topic = data.title

    # 🔹 DECISION TREE (IMPORTANT)
    if transcript_text:
        seed_text = transcript_text            # BEST CASE
    else:
        seed_text = build_seed_from_title(display_topic)  # FALLBACK TO PREVIOUS LOGIC

    result = generate_learning_content(
        topic=seed_text,
        source="youtube"
    )

    result["topic"] = display_topic

    return {
        "success": True,
        "data": result
    }
