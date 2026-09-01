# app/routers/reviews_router.py
# Public endpoints:
#   POST /api/v1/reviews/validate-email
#   POST /api/v1/reviews
#   GET  /api/v1/reviews/public
#
# Admin endpoints (require X-Admin-Key header):
#   GET    /api/v1/admin/clients
#   POST   /api/v1/admin/clients
#   PUT    /api/v1/admin/clients/{id}
#   DELETE /api/v1/admin/clients/{id}
#   GET    /api/v1/admin/reviews
#   POST   /api/v1/admin/reviews
#   PUT    /api/v1/admin/reviews/{id}
#   DELETE /api/v1/admin/reviews/{id}

import logging
import re
import time
from collections import defaultdict, deque
from typing import Optional

import bleach
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from pydantic import BaseModel, Field, field_validator

from app.core.config import get_settings
from app.db.database import get_db

logger = logging.getLogger("ai.reviews")
settings = get_settings()

router = APIRouter(tags=["Reviews"])

# ── Simple in-memory per-IP rate limiter for public endpoints ─────────────────
_review_windows: dict[str, deque] = defaultdict(deque)


def _check_review_rate(ip: str) -> None:
    now = time.time()
    dq = _review_windows[ip]
    while dq and now - dq[0] > 3600:
        dq.popleft()
    if len(dq) >= settings.REVIEW_RATE_LIMIT_PER_HOUR:
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
    dq.append(now)


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("X-Forwarded-For")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "anonymous"


# ── Admin auth dependency ─────────────────────────────────────────────────────

def _require_admin(x_admin_key: str = Header(default="")) -> None:
    key = settings.ADMIN_API_KEY
    if not key or x_admin_key != key:
        raise HTTPException(status_code=401, detail="Unauthorized")


# ── Input sanitisation ────────────────────────────────────────────────────────

_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def _sanitise(text: str) -> str:
    """Strip all HTML tags and normalise whitespace."""
    return bleach.clean(text, tags=[], strip=True).strip()


def _normalise_email(email: str) -> str:
    return email.strip().lower()


# ── Pydantic models ───────────────────────────────────────────────────────────

class ValidateEmailRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=254)

    @field_validator("email")
    @classmethod
    def check_format(cls, v: str) -> str:
        v = v.strip().lower()
        if not _EMAIL_RE.match(v):
            raise ValueError("Invalid email format")
        return v


class SubmitReviewRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=254)
    review_text: str = Field(..., min_length=1, max_length=300)
    rating: int = Field(default=5, ge=1, le=5)

    @field_validator("email")
    @classmethod
    def check_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not _EMAIL_RE.match(v):
            raise ValueError("Invalid email format")
        return v

    @field_validator("review_text")
    @classmethod
    def check_length(cls, v: str) -> str:
        v = _sanitise(v)
        if len(v) < settings.REVIEW_MIN_LENGTH:
            raise ValueError(f"Review must be at least {settings.REVIEW_MIN_LENGTH} characters")
        if len(v) > settings.REVIEW_MAX_LENGTH:
            raise ValueError(f"Review must be at most {settings.REVIEW_MAX_LENGTH} characters")
        return v


class ClientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: str = Field(..., min_length=3, max_length=254)
    company: Optional[str] = Field(default=None, max_length=120)
    role: Optional[str] = Field(default=None, max_length=120)
    location: Optional[str] = Field(default=None, max_length=120)
    engagement_type: Optional[str] = Field(default=None, max_length=120)
    active: bool = True

    @field_validator("email")
    @classmethod
    def check_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not _EMAIL_RE.match(v):
            raise ValueError("Invalid email format")
        return v

    @field_validator("name", "company", "role", "location", "engagement_type")
    @classmethod
    def sanitise_text(cls, v: Optional[str]) -> Optional[str]:
        return _sanitise(v) if v else v


class ClientUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    email: Optional[str] = Field(default=None, min_length=3, max_length=254)
    company: Optional[str] = Field(default=None, max_length=120)
    role: Optional[str] = Field(default=None, max_length=120)
    location: Optional[str] = Field(default=None, max_length=120)
    engagement_type: Optional[str] = Field(default=None, max_length=120)
    active: Optional[bool] = None

    @field_validator("email")
    @classmethod
    def check_email(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip().lower()
        if not _EMAIL_RE.match(v):
            raise ValueError("Invalid email format")
        return v

    @field_validator("name", "company", "role", "location", "engagement_type")
    @classmethod
    def sanitise_text(cls, v: Optional[str]) -> Optional[str]:
        return _sanitise(v) if v else v


class ReviewCreate(BaseModel):
    client_id: int
    review_text: str = Field(..., min_length=1, max_length=300)
    rating: int = Field(default=5, ge=1, le=5)
    project_ref: Optional[str] = Field(default=None, max_length=120)

    @field_validator("review_text")
    @classmethod
    def check_and_sanitise(cls, v: str) -> str:
        v = _sanitise(v)
        if len(v) < settings.REVIEW_MIN_LENGTH:
            raise ValueError(f"Review must be at least {settings.REVIEW_MIN_LENGTH} characters")
        return v

    @field_validator("project_ref")
    @classmethod
    def sanitise_ref(cls, v: Optional[str]) -> Optional[str]:
        return _sanitise(v) if v else v


class ReviewUpdate(BaseModel):
    review_text: Optional[str] = Field(default=None, max_length=300)
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    project_ref: Optional[str] = Field(default=None, max_length=120)

    @field_validator("review_text")
    @classmethod
    def sanitise(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = _sanitise(v)
        if len(v) < settings.REVIEW_MIN_LENGTH:
            raise ValueError(f"Review must be at least {settings.REVIEW_MIN_LENGTH} characters")
        return v

    @field_validator("project_ref")
    @classmethod
    def sanitise_ref(cls, v: Optional[str]) -> Optional[str]:
        return _sanitise(v) if v else v


# ── Public: validate email ────────────────────────────────────────────────────

@router.post("/reviews/validate-email", status_code=200)
async def validate_email(body: ValidateEmailRequest, request: Request):
    _check_review_rate(_client_ip(request))
    db = await get_db()
    email = _normalise_email(body.email)
    async with db.execute(
        "SELECT id, name FROM clients WHERE email = ? AND active = 1", (email,)
    ) as cur:
        row = await cur.fetchone()

    if not row:
        # Generic message — do not reveal whether email exists
        return {"verified": False, "message": "We couldn't verify this email address."}

    return {
        "verified": True,
        "message": "Email verified. You can now leave your review.",
        "client_name": row["name"],
    }


# ── Public: submit review ─────────────────────────────────────────────────────

@router.post("/reviews")
async def submit_review(body: SubmitReviewRequest, request: Request):
    _check_review_rate(_client_ip(request))
    db = await get_db()
    email = _normalise_email(body.email)

    # Re-verify client server-side — never trust frontend state
    async with db.execute(
        "SELECT id FROM clients WHERE email = ? AND active = 1", (email,)
    ) as cur:
        client_row = await cur.fetchone()

    if not client_row:
        raise HTTPException(status_code=403, detail="We couldn't verify this email address.")

    client_id = client_row["id"]

    # Check for existing review (one per client)
    async with db.execute(
        "SELECT id FROM client_reviews WHERE client_id = ?", (client_id,)
    ) as cur:
        existing = await cur.fetchone()

    if existing:
        # Update existing review
        await db.execute(
            """UPDATE client_reviews
               SET review_text = ?, rating = ?,
                   updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
               WHERE client_id = ?""",
            (body.review_text, body.rating, client_id),
        )
        await db.commit()
        from fastapi.responses import JSONResponse as _JSONResponse
        return _JSONResponse(status_code=200, content={"updated": True, "message": "Your review has been updated."})

    await db.execute(
        "INSERT INTO client_reviews (client_id, review_text, rating) VALUES (?, ?, ?)",
        (client_id, body.review_text, body.rating),
    )
    await db.commit()
    from fastapi.responses import JSONResponse as _JSONResponse
    return _JSONResponse(status_code=201, content={"updated": False, "message": "Thank you for your review!"})


# ── Public: get all reviews ───────────────────────────────────────────────────

@router.get("/reviews/public", status_code=200)
async def get_public_reviews():
    db = await get_db()
    async with db.execute(
        """SELECT r.id, r.review_text, r.rating, r.project_ref, r.created_at, r.updated_at,
                  c.name AS client_name, c.company, c.role, c.location, c.engagement_type
           FROM client_reviews r
           JOIN clients c ON c.id = r.client_id
           WHERE c.active = 1
           ORDER BY r.created_at DESC""",
    ) as cur:
        rows = await cur.fetchall()

    return [
        {
            "id": row["id"],
            "client_name": row["client_name"],
            "company": row["company"],
            "role": row["role"],
            "location": row["location"],
            "engagement_type": row["engagement_type"],
            "review_text": row["review_text"],
            "rating": row["rating"],
            "project_ref": row["project_ref"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        }
        for row in rows
    ]


# ── Admin: clients ────────────────────────────────────────────────────────────

@router.get("/admin/clients", status_code=200, dependencies=[Depends(_require_admin)])
async def admin_list_clients(search: str = ""):
    db = await get_db()
    if search:
        pattern = f"%{search}%"
        async with db.execute(
            """SELECT c.id, c.name, c.email, c.company, c.role, c.location, c.engagement_type,
                      c.active, c.created_at,
                      (SELECT COUNT(*) FROM client_reviews r WHERE r.client_id = c.id) AS review_count
               FROM clients c
               WHERE c.name LIKE ? OR c.email LIKE ? OR c.company LIKE ?
               ORDER BY c.created_at DESC""",
            (pattern, pattern, pattern),
        ) as cur:
            rows = await cur.fetchall()
    else:
        async with db.execute(
            """SELECT c.id, c.name, c.email, c.company, c.role, c.location, c.engagement_type,
                      c.active, c.created_at,
                      (SELECT COUNT(*) FROM client_reviews r WHERE r.client_id = c.id) AS review_count
               FROM clients c
               ORDER BY c.created_at DESC""",
        ) as cur:
            rows = await cur.fetchall()

    return [dict(row) for row in rows]


@router.post("/admin/clients", status_code=201, dependencies=[Depends(_require_admin)])
async def admin_create_client(body: ClientCreate):
    db = await get_db()
    try:
        await db.execute(
            "INSERT INTO clients (name, email, company, role, location, engagement_type, active) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (body.name, body.email, body.company, body.role, body.location, body.engagement_type, int(body.active)),
        )
        await db.commit()
    except Exception as exc:
        if "UNIQUE" in str(exc):
            raise HTTPException(status_code=409, detail="A client with this email already exists.")
        raise HTTPException(status_code=500, detail="Failed to create client.")

    async with db.execute("SELECT last_insert_rowid() AS id") as cur:
        row = await cur.fetchone()
    return {"id": row["id"], "message": "Client created."}


@router.put("/admin/clients/{client_id}", status_code=200, dependencies=[Depends(_require_admin)])
async def admin_update_client(client_id: int, body: ClientUpdate):
    db = await get_db()
    async with db.execute("SELECT id FROM clients WHERE id = ?", (client_id,)) as cur:
        if not await cur.fetchone():
            raise HTTPException(status_code=404, detail="Client not found.")

    fields, values = [], []
    if body.name is not None:
        fields.append("name = ?"); values.append(body.name)
    if body.email is not None:
        fields.append("email = ?"); values.append(body.email)
    if body.company is not None:
        fields.append("company = ?"); values.append(body.company)
    if body.role is not None:
        fields.append("role = ?"); values.append(body.role)
    if body.location is not None:
        fields.append("location = ?"); values.append(body.location)
    if body.engagement_type is not None:
        fields.append("engagement_type = ?"); values.append(body.engagement_type)
    if body.active is not None:
        fields.append("active = ?"); values.append(int(body.active))

    if not fields:
        return {"message": "Nothing to update."}

    fields.append("updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')")
    values.append(client_id)

    try:
        await db.execute(f"UPDATE clients SET {', '.join(fields)} WHERE id = ?", values)
        await db.commit()
    except Exception as exc:
        if "UNIQUE" in str(exc):
            raise HTTPException(status_code=409, detail="A client with this email already exists.")
        raise HTTPException(status_code=500, detail="Failed to update client.")

    return {"message": "Client updated."}


@router.delete("/admin/clients/{client_id}", status_code=200, dependencies=[Depends(_require_admin)])
async def admin_delete_client(client_id: int):
    db = await get_db()
    async with db.execute("SELECT id FROM clients WHERE id = ?", (client_id,)) as cur:
        if not await cur.fetchone():
            raise HTTPException(status_code=404, detail="Client not found.")
    # CASCADE deletes the review too
    await db.execute("DELETE FROM clients WHERE id = ?", (client_id,))
    await db.commit()
    return {"message": "Client deleted."}


# ── Admin: reviews ────────────────────────────────────────────────────────────

@router.get("/admin/reviews", status_code=200, dependencies=[Depends(_require_admin)])
async def admin_list_reviews(search: str = ""):
    db = await get_db()
    if search:
        pattern = f"%{search}%"
        async with db.execute(
            """SELECT r.id, r.review_text, r.rating, r.project_ref, r.created_at, r.updated_at,
                      c.id AS client_id, c.name AS client_name, c.company
               FROM client_reviews r
               JOIN clients c ON c.id = r.client_id
               WHERE c.name LIKE ? OR r.review_text LIKE ?
               ORDER BY r.created_at DESC""",
            (pattern, pattern),
        ) as cur:
            rows = await cur.fetchall()
    else:
        async with db.execute(
            """SELECT r.id, r.review_text, r.rating, r.project_ref, r.created_at, r.updated_at,
                      c.id AS client_id, c.name AS client_name, c.company
               FROM client_reviews r
               JOIN clients c ON c.id = r.client_id
               ORDER BY r.created_at DESC""",
        ) as cur:
            rows = await cur.fetchall()

    return [dict(row) for row in rows]


@router.post("/admin/reviews", status_code=201, dependencies=[Depends(_require_admin)])
async def admin_create_review(body: ReviewCreate):
    db = await get_db()
    async with db.execute("SELECT id FROM clients WHERE id = ?", (body.client_id,)) as cur:
        if not await cur.fetchone():
            raise HTTPException(status_code=404, detail="Client not found.")
    try:
        await db.execute(
            "INSERT INTO client_reviews (client_id, review_text, rating, project_ref) VALUES (?, ?, ?, ?)",
            (body.client_id, body.review_text, body.rating, body.project_ref),
        )
        await db.commit()
    except Exception as exc:
        if "UNIQUE" in str(exc):
            raise HTTPException(status_code=409, detail="This client already has a review. Use PUT to update it.")
        raise HTTPException(status_code=500, detail="Failed to create review.")

    async with db.execute("SELECT last_insert_rowid() AS id") as cur:
        row = await cur.fetchone()
    return {"id": row["id"], "message": "Review created."}


@router.put("/admin/reviews/{review_id}", status_code=200, dependencies=[Depends(_require_admin)])
async def admin_update_review(review_id: int, body: ReviewUpdate):
    db = await get_db()
    async with db.execute("SELECT id FROM client_reviews WHERE id = ?", (review_id,)) as cur:
        if not await cur.fetchone():
            raise HTTPException(status_code=404, detail="Review not found.")

    fields, values = [], []
    if body.review_text is not None:
        fields.append("review_text = ?"); values.append(body.review_text)
    if body.rating is not None:
        fields.append("rating = ?"); values.append(body.rating)
    if body.project_ref is not None:
        fields.append("project_ref = ?"); values.append(body.project_ref)

    if not fields:
        return {"message": "Nothing to update."}

    fields.append("updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')")
    values.append(review_id)

    await db.execute(f"UPDATE client_reviews SET {', '.join(fields)} WHERE id = ?", values)
    await db.commit()
    return {"message": "Review updated."}


@router.delete("/admin/reviews/{review_id}", status_code=200, dependencies=[Depends(_require_admin)])
async def admin_delete_review(review_id: int):
    db = await get_db()
    async with db.execute("SELECT id FROM client_reviews WHERE id = ?", (review_id,)) as cur:
        if not await cur.fetchone():
            raise HTTPException(status_code=404, detail="Review not found.")
    await db.execute("DELETE FROM client_reviews WHERE id = ?", (review_id,))
    await db.commit()
    return {"message": "Review deleted."}
