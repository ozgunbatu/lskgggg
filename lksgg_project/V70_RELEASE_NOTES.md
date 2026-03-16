# LkSGCompass v70 — Release Notes

## 🔴 Critical Fixes

### Infinite Request Loop — RESOLVED
**Root cause:** React `useCallback` hooks in all 5 data-fetching hooks had state values
(`company`, `suppliers`, `complaints`, `events`, `kpiLive`, etc.) in their dependency arrays.
When data loaded → state updated → new callback reference → `useEffect` re-fired → loop.

**Fix:** Introduced `useRef` mirrors alongside every state value that was used only as a
"do we already have data?" guard inside callbacks. Callbacks now read from refs (stable)
instead of state (unstable), completely eliminating the dependency chain.

**Files changed:**
- `hooks/feature-data/useSuppliersData.ts` — companyRef, suppliersRef
- `hooks/feature-data/useComplaintsData.ts` — complaintsRef, actionsRef
- `hooks/feature-data/useReportsData.ts` — saqsRef, evidencesRef, auditLogRef
- `hooks/useWorkspaceData.ts` — eventsRef, screeningsRef, kpiLiveRef, kpiTrendRef
- `lib/api.ts` — inflight Map deduplication for concurrent GET requests

### Toast Spam — RESOLVED
- Identical toasts are now deduplicated (same message = no second toast)
- `rate_limited` / `429` errors are silently swallowed at both API and toast layer
- Max 3 visible toasts at once (oldest trimmed)
- Dismiss button on every toast

### Rate Limiter — IMPROVED
- Switched from IP-based to **JWT user-based** keying → shared office IPs no longer
  exhaust each other's limits
- Memory leak fixed: bucket Map cleaned up every 10 minutes
- `monitoring.ts` GET routes now have `try/catch` (were bare async, could crash)

---

## ✅ Test Suite — NEW

**26 unit tests, all passing** (`npm test` in `/backend`)

| Suite | Tests |
|-------|-------|
| `validate.test.ts` | requireString, optionalString, requireInt — 10 tests |
| `risk-engine.test.ts` | score range, country risk, violation penalty, audit reduction — 8 tests |
| `kpi.test.ts` | calcComplianceScore edge cases, getGrade boundaries — 8 tests |

**Setup:** ts-jest with separate `tsconfig.test.json` (production tsconfig stays clean,
test files excluded from `tsc --noEmit`)

---

## 🔧 Backend Improvements

### Input Validation
- `suppliers.ts` PUT now validates `name` via `requireString` before touching DB
- Parallel `recalculate` (was sequential `for...await`, now `Promise.all`)

### Security
- Global 404 catch-all route added
- Global Express error handler added (unhandled thrown errors now return clean JSON)
- `auth.ts` — `console.log` of OTP in dev mode is clearly labeled dev-only

### Health endpoint
- Returns version, uptime, DB status — now consumed by Settings tab in frontend

---

## 🖥 Frontend Improvements

### UI Components
- **SkeletonCard** — shimmer loading placeholder shown in Dashboard during initial load
- **ErrorBoundary** — catches React render errors, shows recovery UI
- **WorkspaceToasts** — dismiss button, deduplication, max-3 cap
- **SettingsTab** — System Status card shows version / DB / uptime from `/health`

### UX
- Dashboard shows 3-column skeleton grid while suppliers load (no blank flash)
- Error toasts cap at 3 items, deduped, silent on rate limit

---

## 📦 Version

| Component | Version |
|-----------|---------|
| Backend | 0.70.0 |
| Frontend | 0.70.0 |
| DB schema | unchanged (no new migrations needed) |

## Running tests

```bash
# Backend unit tests
cd backend
npm test
# → 26 tests, 0 failures

# TypeScript check (production files only)
npx tsc --noEmit
# → 0 errors

# Frontend build
cd frontend
npx next build
# → ✓ Compiled successfully, 25/25 pages
```
