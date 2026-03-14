import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { requestLogger } from "./middleware/requestLogger";
import { authRateLimit, complaintRateLimit, aiRateLimit } from "./middleware/rateLimit";
import { healthcheck } from "./lib/db";
import billingRouter from "./modules/billing";
import teamRouter from "./modules/team";

dotenv.config();

// Clean DATABASE_URL immediately - before any imports use it
if (process.env.DATABASE_URL) {
  try {
    const u = new URL(process.env.DATABASE_URL);
    u.searchParams.delete("sslmode");
    u.searchParams.delete("channel_binding");
    process.env.DATABASE_URL = u.toString();
    console.log("[env] DATABASE_URL cleaned");
  } catch {
    // non-standard URL format, leave as is
  }
}

const app = express();
const port = parseInt(process.env.PORT || "4000", 10);

// In-memory rate limiting for auth endpoints (reset per process restart)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const rec = loginAttempts.get(ip);
  if (!rec || rec.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  rec.count++;
  if (rec.count > 20) return false; // 20 attempts per 15min per IP
  return true;
}
(app as any).checkLoginRateLimit = checkLoginRateLimit;

// ─── CORS: registered FIRST so preflight OPTIONS always works ─────────────────
const ORIGINS = [
  "https://lksgcompass.de",
  "https://www.lksgcompass.de",
  "http://localhost:3000",
  "http://localhost:3001",
  ...(process.env.CORS_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean),
];

const corsOpts: cors.CorsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // curl, mobile, same-origin
    if (ORIGINS.includes(origin)) return cb(null, true);
    if (origin.endsWith(".vercel.app")) return cb(null, true);
    if (origin.includes("railway.app")) return cb(null, true);
    console.warn("[cors] blocked:", origin);
    cb(null, false);
  },
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","X-Requested-With"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOpts));
app.options("*", cors(corsOpts)); // handle all preflight

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(requestLogger);
// Stripe webhook needs raw body — must come BEFORE express.json
app.post("/billing/webhook", express.raw({ type: "application/json" }), async (req, res, next) => {
  // Pass raw body to billing router
  (req as any).rawBody = req.body;
  next();
});
app.use(express.json({ limit: "6mb" }));
app.use("/auth", authRateLimit);
app.use("/complaints", complaintRateLimit);
app.use("/ai", aiRateLimit);

// ─── Health & readiness ───────────────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  const version = process.env.APP_VERSION || "v80";
  const uptimeSec = Math.round(process.uptime());
  let dbStatus: "ok" | "down" = "down";
  try {
    const ok = await healthcheck();
    dbStatus = ok ? "ok" : "down";
  } catch {}
  res.status(dbStatus === "ok" ? 200 : 503).json({ ok: dbStatus === "ok", version, uptimeSec, db: dbStatus, now: new Date().toISOString() });
});
app.get("/ready", async (_req, res) => {
  try {
    const ok = await healthcheck();
    return res.status(ok ? 200 : 503).json({ ready: ok });
  } catch {
    return res.status(503).json({ ready: false });
  }
});
app.get("/ping",   (_req, res) => res.send("pong"));

// ─── Global error handlers ───────────────────────────────────────────────────
// 404 catch-all
app.use((_req: any, res: any) => {
  res.status(404).json({ error: "Not found" });
});

// Unhandled errors
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("[error]", err?.message || err);
  res.status(500).json({ error: err?.message || "Internal server error" });
});

// ─── Bind port FIRST, then bootstrap everything else ─────────────────────────
app.listen(port, "0.0.0.0", () => {
  console.log(`[v80] LkSGCompass backend listening on 0.0.0.0:${port}`);
  bootstrap().catch(e => console.error("[bootstrap] fatal:", e?.message));
});

async function bootstrap() {
  // Load all route modules
  const [
    auth, suppliers, complaints, reports, auto_,
    companies, publicApi, countries, integrations,
    monitoring, ai, actions, evidence, saq,
    kpi, auditlog, reminders,
  ] = (await Promise.all([
    import("./modules/auth"),
    import("./modules/suppliers"),
    import("./modules/complaints"),
    import("./modules/reports"),
    import("./modules/auto"),
    import("./modules/companies"),
    import("./modules/public"),
    import("./modules/countries"),
    import("./modules/integrations"),
    import("./modules/monitoring"),
    import("./modules/ai"),
    import("./modules/actions"),
    import("./modules/evidence"),
    import("./modules/saq"),
    import("./modules/kpi"),
    import("./modules/auditlog"),
    import("./modules/reminders"),
  ])).map(m => m.default);

  app.use("/auth",         auth);
  app.use("/companies",    companies);
  app.use("/public",       publicApi);
  app.use("/countries",    countries);
  app.use("/integrations", integrations);
  app.use("/monitoring",   monitoring);
  app.use("/auto",         auto_);
  app.use("/suppliers",    suppliers);
  app.use("/complaints",   complaints);
  app.use("/reports",      reports);
  app.use("/ai",           ai);
  app.use("/actions",      actions);
  app.use("/evidence",     evidence);
  app.use("/saq",          saq);
  app.use("/kpi",          kpi);
  app.use("/audit",        auditlog);
  app.use("/reminders",    reminders);

  // Global error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(500).json({ error: String(err?.message ?? "Server error") });
  });

  console.log("[bootstrap] routes ok");

  // Run DB migrations
  await migrate();

  // Seed country risk data
  try {
    const { ensureCountrySeed, refreshCountryCache } = await import("./risk/countryRepo");
    await ensureCountrySeed();
    await refreshCountryCache();
    console.log("[bootstrap] country seed ok");
  } catch (e: any) {
    console.warn("[bootstrap] country seed skipped:", e?.message?.slice(0, 80));
  }

  // Start cron (email reminders every 6h)
  try {
    const { runRemindersInternal } = await import("./modules/reminders");
    setInterval(async () => { try { await runRemindersInternal(); } catch {} }, 6 * 60 * 60 * 1000);
    console.log("[bootstrap] cron started");
  } catch {}

  console.log("[bootstrap] complete");
}

async function migrate() {
  const { db } = await import("./lib/db");
  const stmts = [
    // Core tables
    `CREATE TABLE IF NOT EXISTS companies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      size_employees INT, industry TEXT,
      grundsatzerklaerung TEXT,
      grundsatzerklaerung_updated_at TIMESTAMPTZ,
      hr_officer_name TEXT, hr_officer_email TEXT, hr_officer_phone TEXT,
      hr_officer_appointed_at TIMESTAMPTZ,
      complaints_officer_name TEXT, complaints_officer_email TEXT,
      bafa_submitted_at TIMESTAMPTZ, bafa_submission_year INT,
      bafa_report_public_url TEXT,
      address_street TEXT, address_city TEXT,
      address_country TEXT DEFAULT 'Deutschland',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS grundsatzerklaerung TEXT`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS grundsatzerklaerung_updated_at TIMESTAMPTZ`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS hr_officer_name TEXT`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS hr_officer_email TEXT`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS hr_officer_phone TEXT`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS hr_officer_appointed_at TIMESTAMPTZ`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS complaints_officer_name TEXT`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS complaints_officer_email TEXT`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS bafa_submitted_at TIMESTAMPTZ`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS bafa_submission_year INT`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS bafa_report_public_url TEXT`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_street TEXT`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_city TEXT`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_country TEXT DEFAULT 'Deutschland'`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry_initiatives TEXT`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS hinschg_officer_name TEXT`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS hinschg_officer_email TEXT`,
    `ALTER TABLE companies ADD COLUMN IF NOT EXISTS complaint_3month_target BOOLEAN DEFAULT true`,
    `CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
    `CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id)`,
    `CREATE TABLE IF NOT EXISTS approval_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      requested_by TEXT,
      requested_by_user_id UUID,
      status TEXT NOT NULL DEFAULT 'pending',
      approval_notes TEXT,
      requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      reviewed_at TIMESTAMPTZ,
      reviewed_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_approval_company ON approval_requests(company_id, entity_type, status)`,
    `ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS sla_days INT NOT NULL DEFAULT 5`,
    `ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS due_at TIMESTAMPTZ`,
    `UPDATE approval_requests SET due_at = COALESCE(due_at, requested_at + make_interval(days => COALESCE(sla_days, 5))) WHERE due_at IS NULL`,
    `CREATE TABLE IF NOT EXISTS pending_registrations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL, company_name TEXT NOT NULL,
      password_hash TEXT NOT NULL, otp_code TEXT NOT NULL,
      otp_attempts INT NOT NULL DEFAULT 0,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `ALTER TABLE pending_registrations ADD COLUMN IF NOT EXISTS otp_attempts INT NOT NULL DEFAULT 0`,
    `CREATE INDEX IF NOT EXISTS idx_pending_email ON pending_registrations(email)`,
    // Suppliers - ALL columns
    `CREATE TABLE IF NOT EXISTS suppliers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL, country TEXT NOT NULL DEFAULT 'Germany',
      industry TEXT NOT NULL DEFAULT 'services',
      annual_spend_eur NUMERIC(15,2), workers INT,
      has_audit BOOLEAN DEFAULT false, has_code_of_conduct BOOLEAN DEFAULT false,
      certification_count INT DEFAULT 0, sub_supplier_count INT DEFAULT 0,
      transparency_score INT, complaint_count INT DEFAULT 0,
      previous_violations BOOLEAN DEFAULT false,
      risk_score INT NOT NULL DEFAULT 0, risk_level TEXT NOT NULL DEFAULT 'unknown',
      risk_parameters JSONB, risk_explanation JSONB, notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_suppliers_company ON suppliers(company_id)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_suppliers_company_name ON suppliers(company_id, name)`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS pays_minimum_wage BOOLEAN`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS has_env_management BOOLEAN`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS has_contract_clause BOOLEAN`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS hinschg_relevant BOOLEAN DEFAULT false`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS tier_level INT NOT NULL DEFAULT 1`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS parent_supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL`,
    // Action plans - ALL columns including progress_percent
    `CREATE TABLE IF NOT EXISTS action_plans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
      title TEXT NOT NULL, description TEXT, risk_level TEXT,
      lksg_paragraph TEXT, due_date DATE,
      status TEXT NOT NULL DEFAULT 'open', priority TEXT NOT NULL DEFAULT 'medium',
      assigned_to TEXT, progress_percent INT DEFAULT 0,
      completed_at TIMESTAMPTZ, evidence_notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_action_company ON action_plans(company_id)`,
    `ALTER TABLE action_plans ADD COLUMN IF NOT EXISTS relationship_status TEXT DEFAULT 'active' CHECK (relationship_status IN ('active','suspended','terminated'))`,
    `ALTER TABLE action_plans ADD COLUMN IF NOT EXISTS relationship_status_reason TEXT`,
    `ALTER TABLE action_plans ADD COLUMN IF NOT EXISTS relationship_status_at TIMESTAMPTZ`,
    // Complaints - ALL columns including source
    `CREATE TABLE IF NOT EXISTS complaints (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
      supplier_name TEXT, category TEXT NOT NULL, description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open', severity TEXT DEFAULT 'medium',
      is_anonymous BOOLEAN DEFAULT true, contact_info TEXT, ip_hash TEXT,
      reference_number TEXT UNIQUE, source TEXT DEFAULT 'public',
      internal_notes TEXT, attachments JSONB DEFAULT '[]',
      resolved_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_complaints_company ON complaints(company_id)`,
    `ALTER TABLE complaints ADD COLUMN IF NOT EXISTS reporter_notified_at TIMESTAMPTZ`,
    `ALTER TABLE complaints ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ`,
    `ALTER TABLE complaints ADD COLUMN IF NOT EXISTS feedback_due_at TIMESTAMPTZ`,
    `ALTER TABLE complaints ADD COLUMN IF NOT EXISTS feedback_sent_at TIMESTAMPTZ`,
    `ALTER TABLE complaints ADD COLUMN IF NOT EXISTS hinschg_relevant BOOLEAN DEFAULT false`,
    // Reports (NOT report_drafts)
    `CREATE TABLE IF NOT EXISTS reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      year INT NOT NULL, created_by TEXT,
      summary JSONB NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'draft',
      submitted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(company_id, year)
    )`,
    // Evidence (NOT evidence_vault)
    `CREATE TABLE IF NOT EXISTS evidence (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
      action_id UUID REFERENCES action_plans(id) ON DELETE SET NULL,
      complaint_id UUID REFERENCES complaints(id) ON DELETE SET NULL,
      type TEXT NOT NULL DEFAULT 'other', title TEXT NOT NULL,
      description TEXT, file_url TEXT, file_name TEXT,
      file_size INTEGER, mime_type TEXT, lksg_ref TEXT, created_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_evidence_company ON evidence(company_id)`,
    `CREATE TABLE IF NOT EXISTS monitoring_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
      event_type TEXT NOT NULL, severity TEXT DEFAULT 'medium',
      title TEXT, url TEXT, raw_data JSONB, acknowledged BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS sanctions_entities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      source TEXT NOT NULL, name TEXT NOT NULL, program TEXT,
      listed_at TEXT, raw JSONB,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `ALTER TABLE sanctions_entities ADD COLUMN IF NOT EXISTS listed_at TEXT`,
    `ALTER TABLE sanctions_entities ADD COLUMN IF NOT EXISTS raw JSONB`,
    `CREATE INDEX IF NOT EXISTS idx_sanctions_name ON sanctions_entities(name)`,
    `CREATE TABLE IF NOT EXISTS esg_entities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      source TEXT NOT NULL, name TEXT NOT NULL, score INT DEFAULT 0,
      issues JSONB, raw JSONB, updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `ALTER TABLE esg_entities ADD COLUMN IF NOT EXISTS raw JSONB`,
    `CREATE INDEX IF NOT EXISTS idx_esg_name ON esg_entities(name)`,
    `CREATE TABLE IF NOT EXISTS supplier_screenings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
      screening_type TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'clear',
      score INT DEFAULT 0, hits JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_screenings_company ON supplier_screenings(company_id)`,
    `CREATE TABLE IF NOT EXISTS auto_runs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      created_by TEXT, year INT,
      supplier_count INT DEFAULT 0, high_risk_count INT DEFAULT 0,
      medium_risk_count INT DEFAULT 0, low_risk_count INT DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS sync_runs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      job TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'success',
      details JSONB, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS country_risks (
      country_code TEXT PRIMARY KEY, country_name TEXT NOT NULL,
      risk_score INT NOT NULL DEFAULT 50, risk_level TEXT NOT NULL DEFAULT 'medium',
      hr_index INT DEFAULT 3, cpi_score INT DEFAULT 3,
      source TEXT DEFAULT 'built-in', updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS audit_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      user_email TEXT, action TEXT NOT NULL, entity_type TEXT NOT NULL,
      entity_id TEXT, entity_name TEXT,
      old_value JSONB, new_value JSONB, ip_address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_audit_company ON audit_log(company_id, created_at DESC)`,
    `CREATE TABLE IF NOT EXISTS supplier_saq (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
      supplier_name TEXT, token TEXT UNIQUE NOT NULL, sent_to TEXT,
      status TEXT NOT NULL DEFAULT 'sent',
      sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      opened_at TIMESTAMPTZ, completed_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ NOT NULL, responses JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_saq_company ON supplier_saq(company_id)`,
    `CREATE INDEX IF NOT EXISTS idx_saq_token ON supplier_saq(token)`,
    `CREATE TABLE IF NOT EXISTS kpi_snapshots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      snapshot_at DATE NOT NULL DEFAULT CURRENT_DATE,
      compliance_score INT, high_risk_count INT, med_risk_count INT,
      low_risk_count INT, supplier_count INT,
      cap_open INT, cap_done INT, cap_overdue INT,
      complaint_open INT, complaint_total INT,
      audit_coverage NUMERIC(5,2), coc_coverage NUMERIC(5,2),
      saq_sent INT, saq_done INT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(company_id, snapshot_at)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_snap_company ON kpi_snapshots(company_id, snapshot_at)`,
    `CREATE TABLE IF NOT EXISTS reminder_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      type TEXT NOT NULL, entity_id TEXT, sent_to TEXT,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_reminder_company ON reminder_log(company_id, type, sent_at)`,
    // Safety ALTERs for existing databases
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS certification_count INT DEFAULT 0`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS sub_supplier_count INT DEFAULT 0`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS transparency_score INT`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS complaint_count INT DEFAULT 0`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS previous_violations BOOLEAN DEFAULT false`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS notes TEXT`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS risk_parameters JSONB`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS risk_explanation JSONB`,
    `ALTER TABLE action_plans ADD COLUMN IF NOT EXISTS progress_percent INT DEFAULT 0`,
    `ALTER TABLE complaints ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'public'`,
    `ALTER TABLE complaints ADD COLUMN IF NOT EXISTS supplier_name TEXT`,
  ];

  let ok = 0;
  for (const sql of stmts) {
    try {
      await db.query(sql);
      ok++;
    } catch (e: any) {
      if (!e.message?.includes("already exists") && !e.message?.includes("duplicate")) {
        console.warn("[migrate]", e.message?.slice(0, 120));
      } else {
        ok++;
      }
    }
  }
  console.log(`[migrate] ${ok}/${stmts.length} ok`);
}
