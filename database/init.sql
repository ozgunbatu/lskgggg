-- LkSGCompass v7 CHECKED — Complete Database Schema
-- All tables and columns match backend code exactly
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS companies (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,
  size_employees INT,
  industry       TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'admin',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pending_registrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  company_name  TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  otp_code      TEXT NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pending_email ON pending_registrations(email);

-- Suppliers (§5 LkSG) — ALL columns used in backend
CREATE TABLE IF NOT EXISTS suppliers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  country             TEXT NOT NULL DEFAULT 'Germany',
  industry            TEXT NOT NULL DEFAULT 'services',
  annual_spend_eur    NUMERIC(15,2),
  workers             INT,
  has_audit           BOOLEAN DEFAULT false,
  has_code_of_conduct BOOLEAN DEFAULT false,
  certification_count INT DEFAULT 0,
  sub_supplier_count  INT DEFAULT 0,
  transparency_score  INT,
  complaint_count     INT DEFAULT 0,
  previous_violations BOOLEAN DEFAULT false,
  risk_score          INT NOT NULL DEFAULT 0,
  risk_level          TEXT NOT NULL DEFAULT 'unknown',
  risk_parameters     JSONB,
  risk_explanation    JSONB,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_suppliers_company ON suppliers(company_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_risk    ON suppliers(company_id, risk_level);

-- Action Plans (§6, §7 LkSG)
CREATE TABLE IF NOT EXISTS action_plans (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  supplier_id      UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  title            TEXT NOT NULL,
  description      TEXT,
  risk_level       TEXT,
  lksg_paragraph   TEXT,
  due_date         DATE,
  status           TEXT NOT NULL DEFAULT 'open',
  priority         TEXT NOT NULL DEFAULT 'medium',
  assigned_to      TEXT,
  progress_percent INT DEFAULT 0,
  completed_at     TIMESTAMPTZ,
  evidence_notes   TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_action_company ON action_plans(company_id);

-- Complaints (§8 LkSG)
CREATE TABLE IF NOT EXISTS complaints (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  supplier_id      UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  supplier_name    TEXT,
  category         TEXT NOT NULL,
  description      TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'open',
  severity         TEXT DEFAULT 'medium',
  is_anonymous     BOOLEAN DEFAULT true,
  contact_info     TEXT,
  ip_hash          TEXT,
  reference_number TEXT UNIQUE,
  source           TEXT DEFAULT 'public',
  internal_notes   TEXT,
  attachments      JSONB DEFAULT '[]',
  resolved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_complaints_company ON complaints(company_id);

-- Reports (§10 LkSG) — table name is 'reports' (not 'report_drafts')
CREATE TABLE IF NOT EXISTS reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  year         INT NOT NULL,
  created_by   TEXT,
  summary      JSONB NOT NULL DEFAULT '{}',
  status       TEXT NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, year)
);

-- Evidence (§10 LkSG)
CREATE TABLE IF NOT EXISTS evidence (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  supplier_id  UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  action_id    UUID REFERENCES action_plans(id) ON DELETE SET NULL,
  complaint_id UUID REFERENCES complaints(id) ON DELETE SET NULL,
  type         TEXT NOT NULL DEFAULT 'other',
  title        TEXT NOT NULL,
  description  TEXT,
  file_url     TEXT,
  file_name    TEXT,
  file_size    INTEGER,
  mime_type    TEXT,
  lksg_ref     TEXT,
  created_by   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_evidence_company ON evidence(company_id);

-- Monitoring events
CREATE TABLE IF NOT EXISTS monitoring_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  supplier_id  UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  event_type   TEXT NOT NULL,
  severity     TEXT DEFAULT 'medium',
  title        TEXT,
  url          TEXT,
  raw_data     JSONB,
  acknowledged BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_monitoring_company ON monitoring_events(company_id);

-- Sanctions & ESG reference data
CREATE TABLE IF NOT EXISTS sanctions_entities (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source     TEXT NOT NULL,
  name       TEXT NOT NULL,
  program    TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sanctions_name ON sanctions_entities(name);

CREATE TABLE IF NOT EXISTS esg_entities (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source     TEXT NOT NULL,
  name       TEXT NOT NULL,
  score      INT DEFAULT 0,
  issues     JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_esg_name ON esg_entities(name);

-- Supplier screenings
CREATE TABLE IF NOT EXISTS supplier_screenings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  supplier_id    UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  screening_type TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'clear',
  score          INT DEFAULT 0,
  hits           JSONB DEFAULT '[]',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_screenings_company ON supplier_screenings(company_id);

-- Auto-compliance runs
CREATE TABLE IF NOT EXISTS auto_runs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by        TEXT,
  year              INT,
  supplier_count    INT DEFAULT 0,
  high_risk_count   INT DEFAULT 0,
  medium_risk_count INT DEFAULT 0,
  low_risk_count    INT DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_auto_runs_company ON auto_runs(company_id);

-- Sync log
CREATE TABLE IF NOT EXISTS sync_runs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job        TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'success',
  details    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Country risk cache
CREATE TABLE IF NOT EXISTS country_risks (
  country_code TEXT PRIMARY KEY,
  country_name TEXT NOT NULL,
  risk_score   INT NOT NULL DEFAULT 50,
  risk_level   TEXT NOT NULL DEFAULT 'medium',
  hr_index     INT DEFAULT 3,
  cpi_score    INT DEFAULT 3,
  source       TEXT DEFAULT 'built-in',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit Log (§10 LkSG)
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_email  TEXT,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   TEXT,
  entity_name TEXT,
  old_value   JSONB,
  new_value   JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_company ON audit_log(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity  ON audit_log(entity_type, entity_id);

-- SAQ (§5 LkSG)
CREATE TABLE IF NOT EXISTS supplier_saq (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  supplier_id   UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  supplier_name TEXT,
  token         TEXT UNIQUE NOT NULL,
  sent_to       TEXT,
  status        TEXT NOT NULL DEFAULT 'sent',
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  opened_at     TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ NOT NULL,
  responses     JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_saq_company ON supplier_saq(company_id);
CREATE INDEX IF NOT EXISTS idx_saq_token   ON supplier_saq(token);

-- KPI Snapshots (§9 LkSG)
CREATE TABLE IF NOT EXISTS kpi_snapshots (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  snapshot_at      DATE NOT NULL DEFAULT CURRENT_DATE,
  compliance_score INT,
  high_risk_count  INT,
  med_risk_count   INT,
  low_risk_count   INT,
  supplier_count   INT,
  cap_open         INT,
  cap_done         INT,
  cap_overdue      INT,
  complaint_open   INT,
  complaint_total  INT,
  audit_coverage   NUMERIC(5,2),
  coc_coverage     NUMERIC(5,2),
  saq_sent         INT,
  saq_done         INT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, snapshot_at)
);
CREATE INDEX IF NOT EXISTS idx_snap_company ON kpi_snapshots(company_id, snapshot_at);

-- Reminder Log
CREATE TABLE IF NOT EXISTS reminder_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  entity_id  TEXT,
  sent_to    TEXT,
  sent_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reminder_company ON reminder_log(company_id, type, sent_at);

-- Migration safety: add columns that may be missing in existing DBs
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS certification_count INT DEFAULT 0;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS sub_supplier_count INT DEFAULT 0;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS transparency_score INT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS complaint_count INT DEFAULT 0;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS previous_violations BOOLEAN DEFAULT false;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS risk_parameters JSONB;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS risk_explanation JSONB;
ALTER TABLE action_plans ADD COLUMN IF NOT EXISTS progress_percent INT DEFAULT 0;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'public';


-- Approval workflow prep
CREATE TABLE IF NOT EXISTS approval_requests (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id           UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type          TEXT NOT NULL,
  entity_id            TEXT NOT NULL,
  requested_by         TEXT,
  requested_by_user_id UUID,
  status               TEXT NOT NULL DEFAULT 'pending',
  approval_notes       TEXT,
  sla_days             INT NOT NULL DEFAULT 5,
  due_at               TIMESTAMPTZ,
  requested_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at          TIMESTAMPTZ,
  reviewed_by          TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_approval_company ON approval_requests(company_id, entity_type, status);

ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS sla_days INT NOT NULL DEFAULT 5;
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS due_at TIMESTAMPTZ;
UPDATE approval_requests SET due_at = COALESCE(due_at, requested_at + make_interval(days => COALESCE(sla_days, 5))) WHERE due_at IS NULL;
