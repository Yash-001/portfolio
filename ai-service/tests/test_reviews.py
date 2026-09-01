# tests/test_reviews.py
import pytest

ADMIN_KEY = "test-admin-key"
ADMIN_HEADERS = {"X-Admin-Key": ADMIN_KEY}


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _create_client(client, name="Alice Smith", email="alice@example.com", company="Acme"):
    r = await client.post("/api/v1/admin/clients",
                          json={"name": name, "email": email, "company": company},
                          headers=ADMIN_HEADERS)
    assert r.status_code == 201
    return r.json()["id"]


# ── Email normalisation ───────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_email_normalised_on_validate(client):
    await _create_client(client, email="Alice@Example.COM")
    r = await client.post("/api/v1/reviews/validate-email",
                          json={"email": "  ALICE@EXAMPLE.COM  "})
    assert r.status_code == 200
    assert r.json()["verified"] is True


# ── Registered email validation ───────────────────────────────────────────────

@pytest.mark.asyncio
async def test_validate_registered_email(client):
    await _create_client(client)
    r = await client.post("/api/v1/reviews/validate-email",
                          json={"email": "alice@example.com"})
    assert r.status_code == 200
    data = r.json()
    assert data["verified"] is True
    assert data["client_name"] == "Alice Smith"


@pytest.mark.asyncio
async def test_validate_unregistered_email(client):
    r = await client.post("/api/v1/reviews/validate-email",
                          json={"email": "nobody@example.com"})
    assert r.status_code == 200
    assert r.json()["verified"] is False


@pytest.mark.asyncio
async def test_validate_inactive_client(client):
    cid = await _create_client(client)
    await client.put(f"/api/v1/admin/clients/{cid}",
                     json={"active": False}, headers=ADMIN_HEADERS)
    r = await client.post("/api/v1/reviews/validate-email",
                          json={"email": "alice@example.com"})
    assert r.json()["verified"] is False


@pytest.mark.asyncio
async def test_validate_invalid_email_format(client):
    r = await client.post("/api/v1/reviews/validate-email",
                          json={"email": "not-an-email"})
    assert r.status_code == 422


# ── Review submission ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_submit_review(client):
    await _create_client(client)
    r = await client.post("/api/v1/reviews",
                          json={"email": "alice@example.com",
                                "review_text": "Excellent work, very professional and delivered on time.",
                                "rating": 5})
    assert r.status_code == 201
    assert r.json()["updated"] is False


@pytest.mark.asyncio
async def test_submit_review_unregistered_email(client):
    r = await client.post("/api/v1/reviews",
                          json={"email": "ghost@example.com",
                                "review_text": "Great work on the project overall.",
                                "rating": 4})
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_submit_review_too_short(client):
    await _create_client(client)
    r = await client.post("/api/v1/reviews",
                          json={"email": "alice@example.com",
                                "review_text": "Short.",
                                "rating": 5})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_submit_review_too_long(client):
    await _create_client(client)
    r = await client.post("/api/v1/reviews",
                          json={"email": "alice@example.com",
                                "review_text": "x" * 2001,
                                "rating": 5})
    assert r.status_code == 422


# ── Duplicate review prevention ───────────────────────────────────────────────

@pytest.mark.asyncio
async def test_duplicate_review_updates_existing(client):
    await _create_client(client)
    payload = {"email": "alice@example.com",
               "review_text": "First review, very happy with the outcome.",
               "rating": 4}
    r1 = await client.post("/api/v1/reviews", json=payload)
    assert r1.status_code == 201
    assert r1.json()["updated"] is False

    payload["review_text"] = "Updated review after further reflection on the project."
    r2 = await client.post("/api/v1/reviews", json=payload)
    assert r2.status_code == 200
    assert r2.json()["updated"] is True

    # Only one review should exist
    reviews = (await client.get("/api/v1/reviews/public")).json()
    assert len(reviews) == 1
    assert reviews[0]["review_text"] == "Updated review after further reflection on the project."


# ── XSS sanitisation ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_xss_stripped_from_review(client):
    await _create_client(client)
    r = await client.post("/api/v1/reviews",
                          json={"email": "alice@example.com",
                                "review_text": "<script>alert('xss')</script>Great work on the project.",
                                "rating": 5})
    assert r.status_code == 201
    reviews = (await client.get("/api/v1/reviews/public")).json()
    assert "<script>" not in reviews[0]["review_text"]


# ── Public review retrieval ───────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_public_reviews_no_email_exposed(client):
    await _create_client(client)
    await client.post("/api/v1/reviews",
                      json={"email": "alice@example.com",
                            "review_text": "Delivered the project on time and within budget.",
                            "rating": 5})
    reviews = (await client.get("/api/v1/reviews/public")).json()
    assert len(reviews) == 1
    assert "email" not in reviews[0]
    assert "client_id" not in reviews[0]


# ── Admin auth ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_admin_requires_key(client):
    r = await client.get("/api/v1/admin/clients")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_admin_wrong_key(client):
    r = await client.get("/api/v1/admin/clients",
                         headers={"X-Admin-Key": "wrong-key"})
    assert r.status_code == 401


# ── Admin client CRUD ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_admin_create_client(client):
    r = await client.post("/api/v1/admin/clients",
                          json={"name": "Bob Jones", "email": "bob@example.com"},
                          headers=ADMIN_HEADERS)
    assert r.status_code == 201
    assert "id" in r.json()


@pytest.mark.asyncio
async def test_admin_duplicate_email_rejected(client):
    await _create_client(client)
    r = await client.post("/api/v1/admin/clients",
                          json={"name": "Alice Duplicate", "email": "alice@example.com"},
                          headers=ADMIN_HEADERS)
    assert r.status_code == 409


@pytest.mark.asyncio
async def test_admin_update_client(client):
    cid = await _create_client(client)
    r = await client.put(f"/api/v1/admin/clients/{cid}",
                         json={"company": "New Corp"},
                         headers=ADMIN_HEADERS)
    assert r.status_code == 200
    clients = (await client.get("/api/v1/admin/clients", headers=ADMIN_HEADERS)).json()
    assert clients[0]["company"] == "New Corp"


@pytest.mark.asyncio
async def test_admin_delete_client(client):
    cid = await _create_client(client)
    r = await client.delete(f"/api/v1/admin/clients/{cid}", headers=ADMIN_HEADERS)
    assert r.status_code == 200
    clients = (await client.get("/api/v1/admin/clients", headers=ADMIN_HEADERS)).json()
    assert len(clients) == 0


@pytest.mark.asyncio
async def test_admin_delete_client_cascades_review(client):
    cid = await _create_client(client)
    await client.post("/api/v1/reviews",
                      json={"email": "alice@example.com",
                            "review_text": "Excellent work on the backend architecture.",
                            "rating": 5})
    await client.delete(f"/api/v1/admin/clients/{cid}", headers=ADMIN_HEADERS)
    reviews = (await client.get("/api/v1/admin/reviews", headers=ADMIN_HEADERS)).json()
    assert len(reviews) == 0


# ── Admin review CRUD ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_admin_create_review(client):
    cid = await _create_client(client)
    r = await client.post("/api/v1/admin/reviews",
                          json={"client_id": cid,
                                "review_text": "Manually added review for testing purposes.",
                                "rating": 4},
                          headers=ADMIN_HEADERS)
    assert r.status_code == 201


@pytest.mark.asyncio
async def test_admin_update_review(client):
    cid = await _create_client(client)
    rid = (await client.post("/api/v1/admin/reviews",
                             json={"client_id": cid,
                                   "review_text": "Original review text for this client.",
                                   "rating": 3},
                             headers=ADMIN_HEADERS)).json()["id"]
    r = await client.put(f"/api/v1/admin/reviews/{rid}",
                         json={"review_text": "Updated review text after admin correction.",
                               "rating": 5},
                         headers=ADMIN_HEADERS)
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_admin_delete_review(client):
    cid = await _create_client(client)
    rid = (await client.post("/api/v1/admin/reviews",
                             json={"client_id": cid,
                                   "review_text": "Review to be deleted by admin.",
                                   "rating": 5},
                             headers=ADMIN_HEADERS)).json()["id"]
    r = await client.delete(f"/api/v1/admin/reviews/{rid}", headers=ADMIN_HEADERS)
    assert r.status_code == 200
    reviews = (await client.get("/api/v1/admin/reviews", headers=ADMIN_HEADERS)).json()
    assert len(reviews) == 0


@pytest.mark.asyncio
async def test_admin_search_clients(client):
    await _create_client(client, name="Alice Smith", email="alice@example.com")
    await _create_client(client, name="Bob Jones", email="bob@example.com")
    r = await client.get("/api/v1/admin/clients?search=alice", headers=ADMIN_HEADERS)
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["name"] == "Alice Smith"
