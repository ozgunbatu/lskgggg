# LkSGCompass — Deployment Guide

## Quick Start (Local Docker)

```bash
# 1. Clone / unzip the project
# 2. The .env file is pre-configured for local Docker.
#    For production, update DATABASE_URL, JWT_SECRET, and NEXT_PUBLIC_API_URL.
docker compose up --build
```

App: **http://localhost:3000**  
API: **http://localhost:4000**

Demo login (after running seed):
- Email: `demo@lksgcompass.com`
- Password: `demo12345`

To seed demo data:
```bash
docker compose exec backend npm run seed
```

---

## Environment Variables

Copy `.env.example` to `.env` and set:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Random secret ≥32 chars (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_API_URL` | ✅ | Backend URL (e.g. `https://api.lksgcompass.de`) |
| `ANTHROPIC_API_KEY` | Optional | Enables AI assistant (Claude) |
| `RESEND_API_KEY` | Optional | Enables email delivery |
| `RESEND_FROM` | Optional | Sender address |
| `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` | Optional | Cloud evidence storage (falls back to local disk) |

---

## Production Deployment (Railway recommended)

### Backend
1. New service → Deploy from GitHub → `backend/` root
2. Set all environment variables from `.env.example`
3. PostgreSQL: add a Railway Postgres plugin, copy the `DATABASE_URL`

### Frontend
1. Deploy to Vercel → `frontend/` root
2. Set `NEXT_PUBLIC_API_URL` to your backend Railway URL

### DNS
- `lksgcompass.de` → Vercel frontend
- `api.lksgcompass.de` → Railway backend
- Update `CORS_ORIGIN` in backend env: `https://lksgcompass.de,https://www.lksgcompass.de`

---

## Health Checks

- `GET /health` — version, uptime, DB status
- `GET /ready` — DB connectivity check (use for Railway health checks)
- `GET /ping` — returns "pong"

---

## Architecture

| Service | Port | Stack |
|---|---|---|
| Frontend | 3000 | Next.js 14, TypeScript, standalone build |
| Backend | 4000 | Express, TypeScript, tsx runtime |
| Database | 5432 | PostgreSQL 15 |

---

## Backup

```bash
# Local backup
DATABASE_URL=<your-url> npm run backup

# Or manually
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```
