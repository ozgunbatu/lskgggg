# LkSGCompass Test Suite

## Test categories

### Backend unit tests (`tests/backend/`)
- `validate.test.ts` — input validation helpers
- `risk-engine.test.ts` — risk calculation logic
- `kpi.test.ts` — KPI formula & scoring

### Backend integration tests (`tests/integration/`)
- `auth.test.ts` — register/login/OTP flow
- `suppliers.test.ts` — CRUD + risk recalc
- `complaints.test.ts` — create/status/notes
- `kpi.test.ts` — live KPI + snapshot

### Frontend hook tests (`tests/frontend/`)
- `loop-prevention.test.ts` — verifies no infinite renders

## Running tests
```bash
cd backend && npm test       # unit + integration
cd frontend && npm test      # hook tests (Jest + RTL)
```
