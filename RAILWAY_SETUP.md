# Railway Deployment — LkSG Compass

## Kritische Umgebungsvariablen

### ANTHROPIC_API_KEY (AI-Funktionen)

Ohne diesen Key funktionieren **alle KI-Features nicht**:
- KI-Assistent (AI-Tab)
- BAFA-Report KI-Generierung
- Lieferanten-Risikoanalyse (KI)
- CAP-Generierung (KI)
- Beschwerde-Triage (KI)

**Schritte:**
1. Railway Dashboard → Ihr **Backend-Service** auswählen
2. Tab: **Variables**
3. Variable hinzufügen:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-api03-…` (Ihren Key von console.anthropic.com)
4. Service **neu deployen** (Deploy → Redeploy)

**Diagnose-URL** (ohne Auth): `GET /ai/health`
```json
{ "ok": true, "key_prefix": "sk-ant-api03…", "model": "claude-sonnet-4-6" }
```

---

## Alle Pflicht-Variablen (Backend)

| Variable | Beispiel | Zweck |
|---|---|---|
| `DATABASE_URL` | `postgresql://…` | PostgreSQL (Railway Postgres) |
| `JWT_SECRET` | zufälliger String ≥32 Zeichen | Auth-Token-Signierung |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-…` | KI-Features |
| `FRONTEND_URL` | `https://www.lksgcompass.de` | CORS, Beschwerde-Links |
| `PORT` | `4000` | Wird von Railway automatisch gesetzt |

## Alle Pflicht-Variablen (Frontend)

| Variable | Beispiel | Zweck |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://backend.lksgcompass.up.railway.app` | Backend-URL |

---

## Modell

Das Projekt verwendet `claude-sonnet-4-6` (Standard). Das Modell kann in
`backend/src/modules/ai.ts` in der Konstante `MODEL` geändert werden.

---

## Häufige Fehler

### "KI nicht verfügbar"
→ `ANTHROPIC_API_KEY` fehlt oder ist falsch. Prüfen: `/ai/health`

### CORS-Fehler
→ `FRONTEND_URL` im Backend auf die exakte Frontend-Domain setzen (kein trailing slash)

### 500 bei Lieferant anlegen
→ War ein TypeScript-Bug in `useWorkspaceMutations.ts` (saveSupplier fehlte useCallback-Wrapper). **In v107 behoben.**

### AI-Antworten verstummen (leere Response)
→ War falscher Model-String `claude-opus-4-5`. **In v107 behoben** → `claude-sonnet-4-6`
