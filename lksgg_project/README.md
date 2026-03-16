# LkSGCompass v80

**LkSG compliance platform — BAFA-ready, audit-proof, production-grade.**

Supplier risk analysis · Complaint management · CAP tracking · BAFA reporting · Evidence vault · AI assistant

---

## Quick start (local)

```bash
git clone https://github.com/your-org/lksgg_project.git
cd lksgg_project
bash dev-setup.sh
```

Open http://localhost:3000

Demo login: `demo@lksgcompass.com` / `demo12345`

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router, standalone) |
| Backend | Express + TypeScript + tsx |
| Database | PostgreSQL 15 |
| Auth | JWT + OTP email verification |
| Email | Resend |
| AI | Anthropic Claude |
| Billing | Stripe |
| Analytics | PostHog |
| Deploy | Vercel (frontend) + Railway (backend + DB) |

---

## Environment variables

Copy `.env.example` → `.env` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | `openssl rand -hex 32` |
| `NEXT_PUBLIC_API_URL` | ✅ | Backend URL (e.g. `https://api.lksgcompass.de`) |
| `RESEND_API_KEY` | Optional | Email sending (OTP, invites) |
| `ANTHROPIC_API_KEY` | Optional | AI assistant tab |
| `STRIPE_SECRET_KEY` | Optional | Billing |
| `STRIPE_WEBHOOK_SECRET` | Optional | Stripe webhooks |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional | Frontend Stripe |
| `NEXT_PUBLIC_POSTHOG_KEY` | Optional | Analytics |

> ⚠️ **Never commit `.env`** — it's in `.gitignore`

---

## Railway deployment (production)

### Backend

1. New project → Deploy from GitHub → select `backend/` folder
2. Environment variables (copy from `.env.example`):
   - `DATABASE_URL` — Railway PostgreSQL addon
   - `JWT_SECRET` — `openssl rand -hex 32`
   - `FRONTEND_URL` — `https://lksgcompass.de`
   - `RESEND_API_KEY`, `ANTHROPIC_API_KEY` (optional)
3. Railway detects `Dockerfile` automatically

### Frontend (Vercel)

1. Import repo → Vercel
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Environment variables:
   - `NEXT_PUBLIC_API_URL` = Railway backend URL (e.g. `https://api-xxx.railway.app`)
5. Deploy

> **Critical:** `NEXT_PUBLIC_API_URL` must be set **before** the Vercel build runs — it gets baked in at build time.

---

## Features

### §5 Risk Analysis
- Country risk scoring (190+ countries, CPI + Human Rights Index)
- Industry weighting
- Supplier profile signals (audit, CoC, certifications)
- Automatic risk level: low / medium / high

### §8 Complaint Management
- Public whistleblowing portal (`/complaints/[slug]`)
- Anonymous + identified reports
- Status workflow: open → investigating → resolved
- Reporter notification on resolution

### CAP Tracking (§6)
- Corrective Action Plans with due dates + priority
- Evidence attachment
- Overdue detection

### BAFA Reporting (§9)
- Auto-generated PDF report
- Compliance score formula (risk 55% + process 45%)
- KPI trend charts

### Evidence Vault (§10)
- 7-year retention enforcement
- File upload (Supabase Storage or inline DB)

### Team (multi-user)
- Admin invites team members by email
- Roles: admin, member, viewer
- Invite link with 7-day expiry

### Billing (Stripe)
- Free / Pro (€149/mo) / Enterprise (€499/mo)
- 14-day trial on Pro/Enterprise
- Stripe Customer Portal for self-service

---

## Tests

```bash
cd backend
npm test
# 26 tests, 0 failures
```

```bash
cd backend
npx tsc --noEmit
# 0 errors
```

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Next.js 14     │────▶│  Express API     │────▶│  PostgreSQL  │
│  (Vercel)       │     │  (Railway)       │     │  (Railway)   │
│                 │     │                  │     │              │
│  /app/*         │     │  /auth/*         │     │  20+ tables  │
│  /complaints/*  │     │  /suppliers/*    │     │              │
│  /saq/*         │     │  /complaints/*   │     └──────────────┘
└─────────────────┘     │  /billing/*      │
                        │  /team/*         │
                        │  /kpi/*          │
                        │  /monitoring/*   │
                        │  /ai/*           │
                        └──────────────────┘
```

---

## Legal compliance

- **§§4–10 LkSG** — full workflow coverage
- **DSGVO Art.17** — account deletion (anonymization)
- **DSGVO Art.20** — data export (JSON)
- **HinSchG §16** — whistleblower protection
- **§10 Abs.1 LkSG** — 7-year evidence retention

---

## Changelog

### v80 (current)
- ✅ Fix: auth middleware protecting `/app/*` routes
- ✅ Fix: `.gitignore` — `.env` no longer committed
- ✅ New: Stripe billing (Free/Pro/Enterprise + trial)
- ✅ New: Team invite (multi-user, roles, email)
- ✅ New: PostHog analytics
- ✅ New: Settings tab with Billing + Team + Legal sections
- ✅ New: `dev-setup.sh` — one-command local setup
- ✅ New: `middleware.ts` — server-side auth protection

### v70
- ✅ Infinite request loop fix (useRef pattern)
- ✅ 26 unit tests (validate, risk engine, KPI)
- ✅ Rate limiter: per-user JWT keying
- ✅ Toast deduplication

### v65
- ✅ Excel bulk import (SheetJS)
- ✅ Onboarding auto-open fix
