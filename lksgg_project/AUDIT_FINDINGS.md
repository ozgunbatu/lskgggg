# LkSGCompass - Deep Audit Findings

## CRITICAL BUGS (will crash or give wrong data)

### 1. monitoring.ts - column name mismatch
- BUG: Inserts into `monitoring_events.payload` column
- REALITY: server.ts creates column as `raw_data`
- IMPACT: Every monitoring run crashes silently

### 2. sanctions_entities - missing columns
- BUG: integrations.ts inserts `listed_at`, `raw` columns
- REALITY: server.ts migration doesn't create these columns  
- IMPACT: Sanctions sync always fails with column error

### 3. esg_entities - missing columns
- BUG: integrations.ts inserts `score`, `issues`, `raw` columns
- REALITY: server.ts only creates `id`, `source`, `name`, `score`, `issues`, `updated_at`
- STATUS: `score` and `issues` are fine, but `raw` column is missing

### 4. Monthly snapshot - invalid SQL (window fn in aggregate)
- BUG: `SUM(CASE ... THEN 55.0/NULLIF(COUNT(*) OVER(),0))` - window function in aggregate context
- IMPACT: Monthly cron crashes with PostgreSQL error, NO snapshots ever saved
- IMPACT: KPI trend chart always empty

### 5. ai.ts - still uses old portfolio score formula
- BUG: Calculates score as `100 - (high/n)*55 - (med/n)*20` 
- REALITY: New formula is risk(55%) + process(45%)
- IMPACT: AI advice based on inflated score, contradicts what user sees in UI

### 6. suppliers table - missing UNIQUE constraint
- BUG: `auto.ts` does `ON CONFLICT (company_id, name)` but no UNIQUE index exists
- IMPACT: Auto-run CSV import always fails with "no unique constraint" error

## MEDIUM BUGS

### 7. complaints.ts - missing source='internal'
- BUG: Internal complaints submitted via app don't set source='internal'
- IMPACT: source stays 'public' by default, BAFA report shows wrong external/internal split

### 8. SAQ applyRiskDelta - ignores country/industry
- BUG: After SAQ completion, risk is recalculated from parameters only (avg*20)
- REALITY: Should recalculate using full engine with country+industry+profile
- IMPACT: SAQ responses can override country risk entirely

### 9. Frontend saqs loaded at mount but calcPortfolioScore needs them
- STATUS: Actually OK - saqs IS loaded in initial Promise.all (line 498)

## SECURITY GAPS

### 10. No rate limiting on auth endpoints
- Risk: Brute-force OTP attacks (only 1,000,000 combinations)
- Risk: Password spray attacks on /auth/login

### 11. Public complaint endpoint - no spam protection
- Risk: Flood of fake complaints, email spam to admin

## LEGAL GAPS

### 12. Evidence deletion allowed - §10 LkSG 7-year retention
- BUG: DELETE /evidence/:id has no retention check
- LEGAL: §10 Abs.1 LkSG requires 7-year retention

### 13. Completed complaint deletion not protected (unlike CAP)
- BUG: No similar protection as action_plans (which blocks delete of completed)
