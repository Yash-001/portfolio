# Yash Ranjan — Portfolio Monorepo

Enterprise-structured monorepo for the portfolio platform.

## Structure

```
├── frontend/        # Vue 3 + TypeScript portfolio SPA
├── backend/         # API server (future)
├── ai-service/      # AI/ML microservice (future)
├── docs/            # Project documentation
├── docker/          # Docker Compose and service Dockerfiles
├── nginx/           # Nginx reverse proxy config
└── scripts/         # CI/CD and utility scripts
```

## Quick Start

```bash
# Install frontend dependencies
cd frontend && npm install

# Run dev server (from root)
npm run dev

# Production build (from root)
npm run build
```

## Frontend

Built with Vue 3, TypeScript, Vite, Tailwind CSS, PrimeVue, GSAP, and vue-i18n.

See [`frontend/README.md`](./frontend/README.md) for full details.
