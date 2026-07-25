# AI Service

FastAPI microservice providing a provider-agnostic AI abstraction layer.

## Architecture

```
ai-service/
├── app/
│   ├── core/
│   │   ├── config.py          # All settings from env vars (pydantic-settings)
│   │   ├── logging.py         # Structured JSON logging + AI request/response hooks
│   │   ├── rate_limiter.py    # Sliding window rate limiter (swap for Redis to scale)
│   │   └── retry.py           # Exponential backoff retry strategy
│   ├── models/
│   │   └── ai_models.py       # Pydantic request/response models
│   ├── providers/
│   │   ├── base.py            # BaseAIProvider abstract interface
│   │   ├── openai_provider.py # OpenAI implementation (active)
│   │   ├── anthropic_provider.py  # Anthropic stub (ready to implement)
│   │   ├── gemini_provider.py     # Gemini stub (ready to implement)
│   │   └── registry.py        # Provider registry — single place to add providers
│   ├── services/
│   │   ├── ai_service.py      # Orchestration: rate limit → provider → retry
│   │   └── exceptions.py      # Typed domain exceptions
│   ├── middleware/
│   │   ├── logging_middleware.py  # HTTP request/response logging
│   │   └── error_handler.py       # Maps exceptions to HTTP responses
│   ├── routers/
│   │   └── ai_router.py       # POST /ai/chat, POST /ai/complete, GET /ai/health
│   └── main.py                # FastAPI app factory
├── .env.example
└── requirements.txt
```

## Setup

```bash
cd ai-service

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — add your OPENAI_API_KEY

# Run
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/ai/chat` | Multi-turn chat completion |
| POST | `/api/v1/ai/complete` | Single-turn text completion |
| GET | `/api/v1/ai/health` | Provider configuration status |

## Adding a New Provider

1. Add API key to `.env.example` and `app/core/config.py`
2. Implement `BaseAIProvider` in `app/providers/<name>_provider.py`
3. Register in `app/providers/registry.py`

That's it. No other files change.

## Key Design Decisions

- **Keys never in frontend** — all API keys live in `ai-service/.env` only
- **Provider abstraction** — routers/services never import concrete providers
- **Retry at service layer** — exponential backoff with configurable attempts
- **Rate limiting** — per-client sliding window, swap storage for Redis to scale
- **Structured logging** — JSON in prod, request IDs on every log line
