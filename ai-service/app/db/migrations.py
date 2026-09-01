# app/db/migrations.py
# Idempotent schema creation — safe to run on every startup.
# Never drops existing tables or data.

import logging
from app.db.database import get_db

logger = logging.getLogger("ai.db.migrations")

_SCHEMA = """
CREATE TABLE IF NOT EXISTS clients (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL,
    email           TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    company         TEXT,
    role            TEXT,
    location        TEXT,
    engagement_type TEXT,
    active          INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_clients_email  ON clients(email COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(active);

CREATE TABLE IF NOT EXISTS client_reviews (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id   INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    review_text TEXT    NOT NULL,
    rating      INTEGER NOT NULL DEFAULT 5 CHECK(rating BETWEEN 1 AND 5),
    project_ref TEXT,
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    UNIQUE(client_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_client_id ON client_reviews(client_id);
"""

# Additive ALTER TABLE statements — safe to run repeatedly (errors are swallowed)
_MIGRATIONS = [
    "ALTER TABLE clients ADD COLUMN role TEXT",
    "ALTER TABLE clients ADD COLUMN location TEXT",
    "ALTER TABLE clients ADD COLUMN engagement_type TEXT",
    "ALTER TABLE client_reviews ADD COLUMN project_ref TEXT",
]


async def run_migrations() -> None:
    db = await get_db()
    await db.executescript(_SCHEMA)
    # Apply additive columns for existing databases (ignore "duplicate column" errors)
    for stmt in _MIGRATIONS:
        try:
            await db.execute(stmt)
        except Exception:
            pass  # column already exists
    await db.commit()
    logger.info("Database schema verified/created")
