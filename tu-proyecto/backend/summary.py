# summary.py
from __future__ import annotations

import io
import os
import re
import time
from typing import Dict, List, Tuple, Optional
from urllib.parse import urlparse

import requests
import trafilatura
from PyPDF2 import PdfReader
from dotenv import load_dotenv
from openai import OpenAI

# ============================================================================
# Configuration
# ============================================================================
load_dotenv()

API_KEY = os.getenv("API_KEY")
if not API_KEY:
    raise RuntimeError("Missing API_KEY in .env")

BASE_URL = os.getenv("OPENAI_BASE_URL", "https://openrouter.ai/api/v1")
MODEL_NAME = os.getenv("MODEL_NAME", "openai/gpt-4o-mini")

client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0 Safari/537.36"
)

DEFAULT_TIMEOUT = 30
MAX_ATTEMPTS = 4
RETRY_DELAY = 2
MAX_CHARS_DEFAULT = 12_000

# ============================================================================
# Network and parsing utilities
# ============================================================================
def is_pdf_url(url: str) -> bool:
    return url.lower().split("?")[0].endswith(".pdf")

def domain_of(url: str) -> str:
    try:
        return urlparse(url).netloc or "(unknown)"
    except Exception:
        return "(unknown)"

def fetch_pdf_text(url: str, timeout: int = DEFAULT_TIMEOUT) -> str:
    r = requests.get(url, headers={"User-Agent": UA}, timeout=timeout)
    r.raise_for_status()
    bio = io.BytesIO(r.content)
    reader = PdfReader(bio)
    pages: List[str] = []
    for p in reader.pages:
        pages.append(p.extract_text() or "")
    return "\n".join(pages)

def clean_inline(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()

def infer_title_from_html(html: str) -> Optional[str]:
    m = re.search(r"<title>(.*?)</title>", html, flags=re.I | re.S)
    if m:
        return clean_inline(m.group(1))
    m2 = re.search(
        r'property=["\']og:title["\']\s+content=["\'](.*?)["\']',
        html,
        flags=re.I | re.S,
    )
    if m2:
        return clean_inline(m2.group(1))
    return None

def infer_title_from_text(text: str) -> Optional[str]:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    if not lines:
        return None
    return lines[0][:140]

def extract_text_from_url(url: str, max_html_timeout: int = DEFAULT_TIMEOUT) -> Tuple[str, str, str]:
    """
    Returns (title, source, text) from an HTML or PDF URL.
    - HTML: uses trafilatura
    - PDF: uses PyPDF2
    """
    src = domain_of(url)

    # 1) PDF by file extension
    if is_pdf_url(url):
        pdf_text = fetch_pdf_text(url)
        title = infer_title_from_text(pdf_text) or "Article (PDF)"
        return title, src, pdf_text

    # 2) HEAD/GET to inspect Content-Type
    r = requests.get(url, headers={"User-Agent": UA}, timeout=max_html_timeout)
    r.raise_for_status()
    ctype = (r.headers.get("Content-Type") or "").lower()
    if "pdf" in ctype:
        pdf_text = fetch_pdf_text(url)
        title = infer_title_from_text(pdf_text) or "Article (PDF)"
        return title, src, pdf_text

    html = r.text

    # 3) HTML → trafilatura
    downloaded = trafilatura.extract(html, include_comments=False, favor_recall=True)
    if not downloaded or len(downloaded.strip()) < 300:
        fetched = trafilatura.fetch_url(url)
        downloaded = trafilatura.extract(
            fetched, include_comments=False, favor_recall=True
        ) if fetched else None

    text = (downloaded or "").strip()
    title = infer_title_from_html(html) or "Article"
    return title, src, text

# ============================================================================
# Base prompt and variants by user type
# ============================================================================
BASE_SYSTEM = (
    "You are an AI specialized in summarizing web articles. "
    "Explain the main and secondary ideas, facts, data, and conclusions in clear language. "
    "If the article is technical or scientific, simplify the concepts. "
    "Maintain neutrality and accuracy."
)

def system_by_user_type(user_type: str, personalize: bool = False) -> str:
    ut = (user_type or "").strip().lower()

    if ut in {"estudiante", "student"}:
        # Includes an additional block 'According to your preferences'
        base = (
            BASE_SYSTEM + "\n"
            "OUTPUT FORMAT:\n"
            "**Article Title:** [extracted]\n"
            "**Source:** [domain]\n"
            "**Summary:**\n"
            "- 5–7 bullet points with key ideas.\n"
            "- Define technical terms in simple language.\n"
            "- Include one short example if applicable.\n"
        )
        if personalize:
            base += (
                "\n**According to your preferences:**\n"
                "🔎 Connect each user interest to the article topic (1–2 lines per interest).\n"
                "✨ Use motivational and friendly language; avoid jargon.\n"
                "➡️ Format: 3–6 bullets; each starts with an emoji and a hook word ('Application:', 'Fact:', 'Tip:', 'Curiosity:').\n"
                "🧩 Explicitly mention the interest in **bold** and how it relates to the title/findings.\n"
                "🎯 Add one suggested action ('Try:', 'Explore:', 'Compare:') aligned with their interests.\n"
            )
        return base

    if ut in {"cientifico", "científico", "scientist"}:
        return (
            BASE_SYSTEM + "\n"
            "OUTPUT FORMAT:\n"
            "**Article Title:** [extracted]\n"
            "**Source:** [domain]\n"
            "**Summary:**\n"
            "1) Objective\n"
            "2) Methodology (design, sample, instruments)\n"
            "3) Results (include figures/effects if present)\n"
            "4) Limitations\n"
            "5) Implications\n"
            "6) Key citation(s) (brief APA style if available)\n"
        )

    if ut in {"educador", "docente", "teacher"}:
        return (
            BASE_SYSTEM + "\n"
            "OUTPUT FORMAT:\n"
            "**Article Title:** [extracted]\n"
            "**Source:** [domain]\n"
            "**Summary:**\n"
            "- Learning objective (1–2 sentences)\n"
            "- Key ideas for class (3–5 points)\n"
            "- Suggested activities (2 short ones)\n"
            "- Discussion questions (3)\n"
            "- Quick assessment (1 brief instrument)\n"
            "- Curricular/STEAM connections if applicable\n"
        )

    # Enthusiast (default)
    return (
        BASE_SYSTEM + "\n"
        "OUTPUT FORMAT:\n"
        "**Article Title:** [extracted]\n"
        "**Source:** [domain]\n"
        "**Summary:**\n"
        "• Accessible explanation (2–3 paragraphs) with simple analogies.\n"
        "• 3 key takeaways.\n"
        "• Why it matters / impact.\n"
    )


def build_user_context_block(user_context: Dict, article_title: str) -> str:
    """
    Context text to guide the personalized section for the 'student' profile.
    """
    name = (user_context.get("name") or "").strip()
    interests: List[str] = user_context.get("interests") or []
    experience = (user_context.get("experience") or "").strip()

    return (
        "User Context:\n"
        f"- Name: {name or '(not specified)'}\n"
        f"- Interests: {', '.join(interests) if interests else '(not specified)'}\n"
        f"- Experience: {experience or '(not specified)'}\n"
        f"- Article topic: {article_title}\n"
        "Instructions:\n"
        "- Use the EXACT interests for the '**According to your preferences**' section if the profile is 'student'.\n"
        "- Link each interest to the article title/topic and its findings in an engaging and clear way.\n"
        "- Avoid unnecessary technical language; prioritize motivation and clarity.\n"
    )

# ============================================================================
# Main functions
# ============================================================================
def summarize_url_dict(
    url: str,
    user_type: str = "enthusiast",
    user_context: Optional[Dict] = None,
    max_chars: int = MAX_CHARS_DEFAULT,
) -> Dict[str, str]:
    """
    Returns a dictionary ready for the frontend:
    { title, source, summary }
    """
    title, src, body = extract_text_from_url(url)
    if not body or len(body) < 200:
        return {
            "title": title or "Article",
            "source": src,
            "summary": "It was not possible to extract enough content from the article.",
        }

    body = body[:max_chars]
    personalize = (user_type or "").strip().lower() in {"estudiante", "student"}
    system_prompt = system_by_user_type(user_type, personalize=personalize)

    messages: List[Dict[str, str]] = [{"role": "system", "content": system_prompt}]

    if personalize and user_context:
        messages.append({
            "role": "user",
            "content": build_user_context_block(user_context, title)
        })

    messages.append({
        "role": "user",
        "content": (
            f"Title: {title}\n"
            f"Link: {url}\n"
            f"Source: {src}\n\n"
            f"Article content:\n{body}"
        ),
    })

    last_err = None
    for _ in range(MAX_ATTEMPTS):
        try:
            chat = client.chat.completions.create(
                model=MODEL_NAME,
                messages=messages,
                temperature=0.3,
            )
            content = chat.choices[0].message.content
            if content and content.strip():
                return {
                    "title": title or "Article",
                    "source": src,
                    "summary": content.strip(),
                }
        except Exception as e:
            last_err = str(e)
        time.sleep(RETRY_DELAY)

    return {
        "title": title or "Article",
        "source": src,
        "summary": f"Unable to generate the summary. Error: {last_err or 'unknown'}",
    }

def summarize_url(
    url: str,
    user_type: str = "enthusiast",
    user_context: Optional[Dict] = None,
    max_chars: int = MAX_CHARS_DEFAULT,
) -> str:
    """
    Returns a text block with:
    **Article Title:** ...
    **Source:** ...
    **Summary:** ...
    """
    out = summarize_url_dict(url, user_type=user_type, user_context=user_context, max_chars=max_chars)
    return (
        f"**Article Title:** {out.get('title', 'Article')}\n"
        f"**Source:** {out.get('source', '(unknown)')}\n"
        f"**Summary:** {out.get('summary', '')}"
    )
