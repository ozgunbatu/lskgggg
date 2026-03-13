# LkSGCompass v80 — Release Notes

## 🔴 Critical Fixes (login/register)

### Root Cause #1 — `.gitignore` missing `.env`
`.env` was being committed to git. On Railway, the committed file was used instead of 
environment variables → `NEXT_PUBLIC_API_URL` stayed as `http://localhost:4000` in 
production → frontend couldn't reach backend → every API call failed.

**Fix:** `.gitignore` now excludes `.env` and all variants. `.env.example` kept.

### Root Cause #2 — No Next.js middleware
`/app/*` routes had no server-side auth protection. Token check only ran in 
`useWorkspaceSession` client-side — too late, page flashed then redirected.

**Fix:** `frontend/middleware.ts` added. Protects `/app/*` server-side using the 
`lksg_token` cookie. Redirects to `/login?next=/app/...` if no token.

### Root Cause #3 — `NEXT_PUBLIC_API_URL` build-time baking
Next.js bakes `NEXT_PUBLIC_*` variables at build time. If not set in Vercel's build 
environment, it defaults to the hardcoded fallback (`https://api.lksgcompass.de`), 
which may not match the actual Railway URL.

**Fix:** README and `.env.example` now explicitly document this. `dev-setup.sh` 
configures this correctly for local development.

---

## ✅ New Features

### Stripe Billing (`backend/src/modules/billing.ts`)
- Plans: **Free** | **Pro €149/mo** | **Enterprise €499/mo**
- 14-day trial on paid plans
- Stripe Checkout integration
- Stripe Customer Portal (manage/cancel)
- Webhook handler (`/billing/webhook`)
- `subscriptions` table auto-created on first use
- Gracefully disabled when `STRIPE_SECRET_KEY` not set

### Team Invites (`backend/src/modules/team.ts`)
- Admin invites team members by email
- Roles: `member` | `viewer`
- JWT-signed invite tokens (7-day expiry)
- Email sent via Resend
- `team_members` table auto-created
- Register page handles `?invite=TOKEN` — skips OTP, joins existing company
- Remove member, change role

### PostHog Analytics
- `AnalyticsProvider` now loads PostHog script when `NEXT_PUBLIC_POSTHOG_KEY` is set
- Exports `trackEvent()` and `identifyUser()` helpers
- Gracefully no-ops when key not configured

### Settings Tab — Rebuilt
Four tabs: **Unternehmen** | **Team** | **Billing** | **Legal**

- **Team tab:** invite form, member list with roles/status, remove button
- **Billing tab:** plan comparison cards, upgrade CTA, portal link
- **Legal tab:** DSGVO export, links to Datenschutz/AGB/Impressum

### Dev Setup Script
`bash dev-setup.sh` — one command:
1. Creates `.env` from `.env.example` with generated JWT secret
2. Installs npm dependencies
3. Starts docker compose stack
4. Prints demo credentials

---

## 📦 What ships in v80

```
backend/
  src/modules/billing.ts     ← NEW: Stripe billing
  src/modules/team.ts        ← NEW: Team invites  
  src/modules/auth.ts        ← UPDATED: invite token in register
  src/server.ts              ← UPDATED: billing + team routes, v80

frontend/
  middleware.ts              ← NEW: server-side auth protection
  app/register/page.tsx      ← REBUILT: invite flow, cleaner design
  components/AnalyticsProvider.tsx  ← UPDATED: PostHog
  components/workspace-tabs/SettingsTab.tsx  ← REBUILT: 4 tabs

.gitignore                   ← FIXED: excludes .env
.env.example                 ← UPDATED: all vars documented
dev-setup.sh                 ← NEW: one-command local setup
README.md                    ← REWRITTEN: complete docs
```

---

## 🔢 Test results

```
Backend TypeScript: 0 errors
Backend tests:      26/26 passing
Frontend build:     ✓ Compiled successfully, 25/25 pages
```

---

## 🚀 Deploy checklist

### Railway (backend)
- [ ] `DATABASE_URL` set (Railway PostgreSQL addon)
- [ ] `JWT_SECRET` set (`openssl rand -hex 32`)
- [ ] `FRONTEND_URL` set (`https://lksgcompass.de`)
- [ ] `RESEND_API_KEY` set (optional, for OTP + invites)
- [ ] `ANTHROPIC_API_KEY` set (optional, for AI tab)
- [ ] `STRIPE_SECRET_KEY` set (optional, for billing)
- [ ] `STRIPE_WEBHOOK_SECRET` set (after Stripe webhook created)

### Vercel (frontend)
- [ ] `NEXT_PUBLIC_API_URL` = Railway backend URL **← MOST CRITICAL**
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` set (optional)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set (optional)

### Stripe setup (optional)
1. Create products in Stripe Dashboard
2. Copy Price IDs → set `STRIPE_PRO_PRICE_ID` and `STRIPE_ENTERPRISE_PRICE_ID`
3. Create webhook endpoint: `https://api.lksgcompass.de/billing/webhook`
4. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET`
