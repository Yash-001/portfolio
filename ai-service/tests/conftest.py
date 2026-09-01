# tests/conftest.py
import os
import pytest
import pytest_asyncio
import aiosqlite
from httpx import AsyncClient, ASGITransport

# Point to in-memory DB and set a test admin key before importing the app
os.environ.setdefault("DB_PATH", ":memory:")
os.environ.setdefault("ADMIN_API_KEY", "test-admin-key")
os.environ.setdefault("ENVIRONMENT", "development")
os.environ.setdefault("APP_DEBUG", "true")

import app.db.database as _db_module
from app.db.migrations import run_migrations
from app.main import create_app


@pytest_asyncio.fixture(scope="function")
async def db_conn():
    conn = await aiosqlite.connect(":memory:")
    conn.row_factory = aiosqlite.Row
    await conn.execute("PRAGMA foreign_keys=ON")
    _db_module._db = conn
    await run_migrations()
    yield conn
    await conn.close()
    _db_module._db = None


@pytest_asyncio.fixture(scope="function")
async def client(db_conn):
    application = create_app()
    async with AsyncClient(
        transport=ASGITransport(app=application), base_url="http://test"
    ) as ac:
        yield ac
