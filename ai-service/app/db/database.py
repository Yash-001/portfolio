# app/db/database.py
# Async SQLite connection via aiosqlite.
# A single shared connection is opened at startup and closed at shutdown.

import logging
import aiosqlite
from typing import Optional

from app.core.config import get_settings

logger = logging.getLogger("ai.db")
settings = get_settings()

_db: Optional[aiosqlite.Connection] = None


async def get_db() -> aiosqlite.Connection:
    global _db
    if _db is None:
        raise RuntimeError("Database not initialised — call init_db() first")
    return _db


async def init_db() -> None:
    global _db
    _db = await aiosqlite.connect(settings.DB_PATH)
    _db.row_factory = aiosqlite.Row
    await _db.execute("PRAGMA journal_mode=WAL")
    await _db.execute("PRAGMA foreign_keys=ON")
    await _db.commit()
    logger.info("Database connected: %s", settings.DB_PATH)


async def close_db() -> None:
    global _db
    if _db:
        await _db.close()
        _db = None
        logger.info("Database connection closed")
