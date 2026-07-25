# DEPLOYMENT_CHECKLIST.md

## Pre-Deployment Audit — Results

All items below were verified or fixed during the pre-deployment audit.

---

## 1. Secrets & Environment Files

| Check | Status | Notes |
|---|---|---|
| `frontend/.env` is gitignored | ✅ | Covered by `.gitignore` → `.env` rule |
| `frontend/.env.production` is gitignored | ✅ Fixed | Added `**/.env.production` to root and frontend `.gitignore` |
| `ai-service/.env` is gitignored | ✅ | Covered by root `.gitignore` → `**/.env` rule |
| Real EmailJS keys scrubbed from `frontend/.env` | ✅ Fixed | Replaced with `xxxxxxx` placeholders |
| Real EmailJS keys scrubbed from `frontend/.env.production` | ✅ Fixed | Replaced with `xxxxxxx` placeholders |
| Real OpenAI key scrubbed from `ai-service/.env` | ✅ Fixed | Replaced with `sk-...` placeholder |
| Real Gemini key scrubbed from `ai-service/.env` | ✅ Fixed | Replaced with placeholder |
| `frontend/.env.example` covers all variables | ✅ | All 12 VITE_ vars present including `VITE_BLOG_API_URL` |
| `ai-service/.env.example` covers all variables | ✅ | All vars match `config.py` Settings class |

> **Before deploying**: populate real values in your hosting provider's environment variables panel.
> Never commit `.env`, `.env.production`, or `ai-service/.env` with real keys.

---

## 2. Unused Dependencies Removed

| Package | Location | Action |
|---|---|---|
| `axios` | `frontend/dependencies` | ✅ Removed — only used in dead `ai.client.ts` |
| `vite-plugin-sitemap` | `frontend/devDependencies` | ✅ Removed — never imported in `vite.config.ts` |
| `@types/dompurify` | `frontend/dependencies` (wrong) | ✅ Moved to `devDependencies` |
| `httpx` (duplicate) | `ai-service/requirements.txt` | ✅ Removed duplicate entry |

---

## 3. Dead Code Removed

| File | Action |
|---|---|
| `frontend/src/services/ai/ai.client.ts` | ✅ Deleted — axios-based client, never consumed by any component or store |
| `frontend/src/services/ai/ai.types.ts` | ✅ Deleted — only used by `ai.client.ts` |
| `frontend/src/services/ai/index.ts` | ✅ Cleaned — removed re-exports of deleted files |
| `frontend/vite.config.ts` manualChunks | ✅ Removed `axios` from `utils-vendor` chunk |

---

## 4. Console Statements

All remaining `console.*` calls are intentional and appropriate:

| Location | Type | Reason |
|---|---|---|
| `analytics/providers/clarity.ts` | `console.warn` | Script load failure — user-facing analytics error |
| `analytics/providers/ga4.ts` | `console.warn` | Script load failure — user-facing analytics error |
| `analytics/providers/plausible.ts` | `console.warn` | Script load failure — user-facing analytics error |
| `services/ai/chat.service.ts` | `console.warn` | Production misconfiguration warning (PROD only) |
| `services/contact.service.ts` | `console.warn` | Spam detection (DEV only, guarded by `import.meta.env.DEV`) |
| `services/contact.service.ts` | `console.warn` | EmailJS not configured — operator alert |
| `services/contact.service.ts` | `console.warn` | Auto-reply failure — non-critical, non-blocking |
| `scripts/export-knowledge.ts` | `process.stdout.write` | Build-time progress output (not `console.log`) |

No `console.log` statements exist in the codebase.

---

## 5. Commented Code

All comments are legitimate documentation (section headers, explanations, usage instructions, example data stubs for content files). No dead commented-out code blocks were found.

---

## 6. Build Verification

| Command | Status | Output |
|---|---|---|
| `npm run lint` | ✅ | 0 errors, 0 warnings |
| `npm run build` | ✅ | 735 modules, 0 errors |
| `vue-tsc --noEmit` | ✅ | 0 type errors |
| `knowledge-export` | ✅ | `portfolio_data.json` written successfully |

---

## 7. Pre-Deployment Steps (Required Before Going Live)

### Frontend

- [ ] Set all `VITE_*` environment variables in your hosting provider (Vercel / Netlify / etc.)
- [ ] Set `VITE_APP_URL` to your real domain (e.g. `https://yashranjan.dev`)
- [ ] Set `VITE_AI_SERVICE_URL` to your deployed ai-service URL (e.g. `https://ai.yashranjan.dev`)
- [ ] Set real `VITE_EMAILJS_*` values from your EmailJS dashboard
- [ ] Set real `VITE_CALENDLY_URL` from your Calendly account
- [ ] Set real analytics IDs (`VITE_GA_MEASUREMENT_ID`, `VITE_PLAUSIBLE_DOMAIN`, `VITE_CLARITY_PROJECT_ID`)
- [ ] Confirm `VITE_ANALYTICS_DEV=false` (default — analytics off in dev)
- [ ] Run `npm run build` from repo root and verify 0 errors

### AI Service

- [ ] Set `ENVIRONMENT=production` in ai-service environment
- [ ] Set `APP_DEBUG=false` (hides `/docs` and `/redoc` endpoints)
- [ ] Set `ALLOWED_ORIGINS=https://yourdomain.com` (no trailing slash, no localhost)
- [ ] Set real `GEMINI_API_KEY` (or `OPENAI_API_KEY` if switching providers)
- [ ] Set `DEFAULT_AI_PROVIDER=gemini` (or `openai`)
- [ ] Set `LOG_AI_RESPONSES=false` (never log AI response content in production)
- [ ] Run `uvicorn app.main:app --host 0.0.0.0 --port 8000` and verify `POST /api/v1/chat` returns 200

### DNS / Infrastructure

- [ ] Point domain to frontend hosting
- [ ] Point `ai.yourdomain.com` (or equivalent) to ai-service host
- [ ] Confirm HTTPS is enabled on both
- [ ] Confirm CORS `ALLOWED_ORIGINS` matches the exact frontend origin

---

## 8. Knowledge Sync

The AI assistant's knowledge is generated from `frontend/src/content/*`.

- [ ] Run `npm run build` (or `npx vite-node scripts/export-knowledge.ts`) to regenerate `ai-service/app/knowledge/portfolio_data.json`
- [ ] Deploy the updated `portfolio_data.json` alongside the ai-service
- [ ] No uvicorn restart needed — the mtime-aware cache reloads automatically on next request

---

## 9. Post-Deployment Smoke Tests

- [ ] Homepage loads and animations play
- [ ] AI chat dialog opens and returns a response
- [ ] Contact form submits successfully (check EmailJS dashboard)
- [ ] Calendly popup opens
- [ ] Resume download works (`/resume.pdf`)
- [ ] All routes resolve (no 404s on direct navigation)
- [ ] Analytics events fire (check GA4 / Plausible real-time view)
- [ ] `https://yourdomain.com/robots.txt` is accessible
