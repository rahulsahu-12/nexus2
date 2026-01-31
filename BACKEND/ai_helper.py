import re
from typing import Dict, List
import os
import google.generativeai as genai


# ⚠️ DEV ONLY — DO NOT COMMIT THIS
GEMINI_API_KEY = "AIzaSyA6qBgkxk5hUGuOMBmlAfzDMmS8evAiuaM"

genai.configure(api_key=GEMINI_API_KEY)

gemini_model = genai.GenerativeModel("gemini-2.5-flash")


# --------------------------------------------------
# TEXT UTILS
# --------------------------------------------------
def clean_text(text: str) -> str:
    text = re.sub(r"\n+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def split_sentences(text: str) -> List[str]:
    return re.split(r"(?<=[.!?])\s+", text)

# --------------------------------------------------
# FIXED HEADINGS (DETERMINISTIC)
# --------------------------------------------------
HEADINGS = [
    "Introduction",
    "Core Concepts",
    "Key Ideas",
    "Examples and Use Cases",
    "Summary and Insights"
]

# --------------------------------------------------
# MAIN FUNCTION
# --------------------------------------------------
def generate_learning_content(topic: str, source: str):
    cleaned = clean_text(topic)
    sentences = split_sentences(cleaned)

    if not sentences:
        sentences = [cleaned]

    headings = [
        "Introduction",
        "Core Concepts",
        "Key Ideas",
        "Examples and Use Cases",
        "Summary and Insights"
    ]

    total = len(sentences)
    sections = []
    notes_blocks = []

    index = 0
    remaining = total

    for i, heading in enumerate(headings):
        if index >= total:
            break

        # 🔹 Last section takes all remaining sentences
        if i == len(headings) - 1:
            section_sentences = sentences[index:]
        else:
            take = max(1, remaining // (len(headings) - i))
            section_sentences = sentences[index:index + take]

        index += len(section_sentences)
        remaining -= len(section_sentences)

        section_text = " ".join(section_sentences)

        sections.append({
            "heading": heading,
            "content": section_text
        })

        notes_blocks.append(f"{heading}\n{section_text}")

    final_notes = "\n\n".join(notes_blocks)

    return {
        "topic": topic[:80],
        "source": source,
        "notes": final_notes,
        "sections": sections,
        "mcqs": [],
        "interview_questions": []
    }
def gemini_summarize(text: str) -> str:
    try:
        response = gemini_model.generate_content(
            f"""
            Convert the following transcript into clear study notes.
            Use simple language.
            Keep explanations concise.
            Do not add headings.

            TRANSCRIPT:
            {text[:6000]}
            """,
            generation_config={
                "temperature": 0.3,
                "max_output_tokens": 700
            }
        )

        if hasattr(response, "text") and response.text:
            return response.text.strip()

    except:
        pass

    return text  # 🔹 fallback (guaranteed)
