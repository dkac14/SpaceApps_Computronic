# backend/server.py
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from urllib.parse import urlparse
from typing import List, Dict
import os, csv, re

app = FastAPI()  # 👈👈 IMPORTANT: "app" variable must be at module level

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(__file__)
CSV_PATH = os.path.join(BASE_DIR, "data", os.getenv("CSV_FILE", "SB_publication_PMC.csv"))

def _first_nonempty(d: dict, keys: list[str]) -> str:
    for k in keys:
        v = d.get(k)
        if v is not None:
            v = v.strip()
            if v:
                return v
    return ""

def _domain(u: str) -> str | None:
    try:
        return urlparse(u).netloc or None
    except:
        return None

def load_csv_or_fallback() -> List[Dict]:
    """
    Loads data from the CSV file. If not found, uses fallback data.
    """
    data: List[Dict] = []
    if os.path.exists(CSV_PATH):
        try:
            with open(CSV_PATH, newline="", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                for i, row in enumerate(reader):
                    title = _first_nonempty(row, ["title", "Title"])
                    url   = _first_nonempty(row, ["url", "URL", "Url", "link", "Link", "HREF", "Href"])
                    if not title or not url:
                        continue
                    source = _first_nonempty(row, ["source", "Source", "domain", "Domain"]) or _domain(url)
                    data.append({"id": i+1, "title": title, "url": url, "source": source})
        except Exception as e:
            print("[CSV] Error reading CSV:", e)
    if not data:
        data = [
            {"id": 1, "title": "Example row", "url": "https://example.org/a", "source": "example.org"},
        ]
    return data

DATA = load_csv_or_fallback()

def score_match(title: str, terms: List[str]) -> int:
    """
    Scores how well the title matches the search terms.
    """
    t = (title or "").lower()
    s = 0
    for w in terms:
        if w in t: s += 2
        if re.search(rf"\b{re.escape(w)}\b", t): s += 3
    if terms and t.startswith(terms[0]): s += 3
    return s

@app.get("/api/health")
def health():
    """
    Health check endpoint.
    """
    return {"ok": True, "count": len(DATA), "csv": os.path.basename(CSV_PATH)}

@app.get("/api/search")
def search(q: str = Query("", min_length=0)):
    """
    Search endpoint. Returns all items whose title matches the query terms.
    """
    q = (q or "").strip().lower()
    if not q:
        return []
    terms = [w for w in q.split() if w]
    results = [item for item in DATA if all(w in (item["title"] or "").lower() for w in terms)]
    results.sort(key=lambda it: score_match(it["title"], terms), reverse=True)
    return results

# /api/summarize (if you have summary.py)
# ...same imports...
try:
    from summary import summarize_url_dict

    @app.get("/api/summarize")
    def summarize(
        url: str = Query(...),
        userType: str = Query("enthusiast"),
        userName: str = Query("", alias="userName"),
        userInterests: str = Query("", alias="userInterests"),
        userExperience: str = Query("", alias="userExperience"),
    ):
        """
        Summarizes an article given its URL and user profile information.
        """
        if not url.lower().startswith(("http://", "https://")):
            raise HTTPException(status_code=400, detail="Invalid URL")
        try:
            user_ctx = {
                "name": userName.strip(),
                "interests": [s.strip() for s in userInterests.split(",") if s.strip()],
                "experience": userExperience.strip(),
            }
            return summarize_url_dict(url, userType, user_context=user_ctx)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Could not summarize the URL: {e}")
except Exception as e:
    print("[summary] Summary endpoint disabled:", e)
