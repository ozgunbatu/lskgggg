/**
 * Automated Email Reminders -- LkSGCompass v5
 * Runs periodically to send compliance reminders:
 * - Overdue CAPs → responsible person
 * - SAQ not opened after 7 days → resend reminder
 * - Complaint not reviewed after 3 days → §8 Abs. 5 warning
 * - Monthly KPI snapshot (1st of month)
 */
import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import { sendEmail } from "../lib/email";

const router = Router();
const PORTAL = process.env.FRONTEND_URL || "https://lksgcompass.de";

async function ensureReminderTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS reminder_log (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      type        TEXT NOT NULL,
      entity_id   TEXT,
      sent_to     TEXT,
      sent_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_reminder_company ON reminder_log(company_id, type, sent_at);
  `);
}

async function alreadySentToday(companyId: string, type: string, entityId: string): Promise<boolean> {
  const r = await db.query(
    `SELECT 1 FROM reminder_log WHERE company_id=$1 AND type=$2 AND entity_id=$3
     AND sent_at > now() - interval '23 hours' LIMIT 1`,
    [companyId, type, entityId]
  );
  return r.rows.length > 0;
}

async function logReminder(companyId: string, type: string, entityId: string, sentTo: string) {
  await db.query(
    "INSERT INTO reminder_log(company_id,type,entity_id,sent_to) VALUES($1,$2,$3,$4)",
    [companyId, type, entityId, sentTo]
  );
}

// ── 1. Overdue CAPs ───────────────────────────────────────────────────────────
async function sendOverdueCapReminders() {
  const overdue = await db.query(`
    SELECT a.id, a.title, a.due_date, a.assigned_to, a.lksg_paragraph, a.priority,
           a.company_id, co.name as company_name
    FROM action_plans a
    JOIN companies co ON co.id = a.company_id
    WHERE a.status NOT IN ('completed','closed')
      AND a.due_date < CURRENT_DATE
      AND a.assigned_to IS NOT NULL
      AND a.assigned_to LIKE '%@%'
  `).catch(() => ({ rows: [] }));

  let sent = 0;
  for (const cap of overdue.rows) {
    if (await alreadySentToday(cap.company_id, "overdue_cap", cap.id)) continue;
    const daysOver = Math.floor((Date.now() - new Date(cap.due_date).getTime()) / 86400000);
    const ok = await sendEmail(
      cap.assigned_to,
      `[LkSGCompass] Ueberfaelliger CAP: ${cap.title}`,
      `<h2 style="color:#DC2626;margin:0 0 8px">&#9888; CAP Ueberfaellig -- ${daysOver} Tage</h2>
<p style="color:#6B7280;font-size:14px;margin:0 0 20px">${cap.company_name} &bull; ${cap.lksg_paragraph || "LkSG"}</p>
<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:14px;margin-bottom:20px">
  <strong>${cap.title}</strong><br>
  <span style="color:#DC2626;font-size:13px">Faellig war: ${new Date(cap.due_date).toLocaleDateString("de-DE")} (${daysOver} Tage ueberfaellig)</span><br>
  <span style="color:#6B7280;font-size:12px">Prioritaet: ${cap.priority || "normal"}</span>
</div>
<p style="font-size:13px;color:#374151">Bitte Massnahme sofort bearbeiten oder Faelligkeitsdatum aktualisieren. §10 LkSG erfordert lueckenlose Dokumentation.</p>
<a href="${PORTAL}/app" style="display:inline-block;background:#1B3D2B;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">CAP bearbeiten &rarr;</a>`
    );
    if (ok) { await logReminder(cap.company_id, "overdue_cap", cap.id, cap.assigned_to); sent++; }
  }
  return sent;
}

// ── 2. SAQ not opened after 7 days ───────────────────────────────────────────
async function sendSaqReminders() {
  let sent = 0;
  try {
    const pending = await db.query(`
      SELECT s.id, s.token, s.sent_to, s.supplier_name, s.company_id, s.sent_at, s.expires_at,
             co.name as company_name
      FROM supplier_saq s
      JOIN companies co ON co.id = s.company_id
      WHERE s.status = 'sent'
        AND s.sent_to IS NOT NULL
        AND s.sent_at < now() - interval '7 days'
        AND s.expires_at > now()
    `);
    for (const saq of pending.rows) {
      if (await alreadySentToday(saq.company_id, "saq_reminder", saq.id)) continue;
      const saqUrl = `${PORTAL}/saq/${saq.token}`;
      const ok = await sendEmail(
        saq.sent_to,
        `[LkSGCompass] Erinnerung: Lieferanten-Selbstauskunft noch offen`,
        `<h2 style="margin:0 0 8px">Erinnerung: SAQ noch nicht ausgefuellt</h2>
<p style="color:#6B7280;font-size:14px;margin:0 0 16px">${saq.company_name} bittet um Ausfuellung des LkSG-Fragebogens.</p>
<p style="font-size:13px">Der Fragebogen wurde vor 7+ Tagen gesendet und ist noch nicht beantwortet worden.
Gueltig bis: <strong>${new Date(saq.expires_at).toLocaleDateString("de-DE")}</strong></p>
<a href="${saqUrl}" style="display:inline-block;background:#1B3D2B;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin-top:12px">
  Fragebogen ausfuellen &rarr;</a>`
      );
      if (ok) { await logReminder(saq.company_id, "saq_reminder", saq.id, saq.sent_to); sent++; }
    }
  } catch {}
  return sent;
}

// ── 3. Complaint not reviewed after 3 days → §8 Abs. 5 ──────────────────────
async function sendComplaintReminders() {
  let sent = 0;
  try {
    const stale = await db.query(`
      SELECT c.id, c.reference_number, c.category, c.severity, c.company_id, c.created_at,
             co.name as company_name
      FROM complaints c
      JOIN companies co ON co.id = c.company_id
      WHERE c.status = 'open'
        AND c.created_at < now() - interval '3 days'
    `);
    for (const cmp of stale.rows) {
      if (await alreadySentToday(cmp.company_id, "complaint_stale", cmp.id)) continue;
      const admin = await db.query(
        "SELECT email FROM users WHERE company_id=$1 AND role='admin' LIMIT 1",
        [cmp.company_id]
      );
      if (!admin.rows.length) continue;
      const daysOpen = Math.floor((Date.now() - new Date(cmp.created_at).getTime()) / 86400000);
      const ok = await sendEmail(
        admin.rows[0].email,
        `[LkSGCompass] §8 LkSG: Beschwerde ${cmp.reference_number} seit ${daysOpen} Tagen offen`,
        `<h2 style="color:#D97706;margin:0 0 8px">&#9888; Beschwerde ohne Rueckmeldung</h2>
<p style="color:#6B7280;font-size:14px;margin:0 0 16px">${cmp.company_name}</p>
<div style="background:#FEF9C3;border:1px solid #FDE68A;border-radius:8px;padding:14px;margin-bottom:16px">
  <strong>${cmp.reference_number}</strong> &bull; ${cmp.category}<br>
  <span style="color:#D97706;font-size:13px">Seit ${daysOpen} Tagen offen (Schwere: ${cmp.severity})</span>
</div>
<p style="font-size:13px;color:#374151">
  <strong>§8 Abs. 5 LkSG:</strong> Eingangsbestaetigung innerhalb 7 Tage erforderlich.
  Bitte Beschwerde bearbeiten und Melder informieren.
</p>
<a href="${PORTAL}/app" style="display:inline-block;background:#1B3D2B;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Beschwerde bearbeiten &rarr;</a>`
      );
      if (ok) { await logReminder(cmp.company_id, "complaint_stale", cmp.id, admin.rows[0].email); sent++; }
    }
  } catch {}
  return sent;
}

// ── 4. Monthly KPI snapshot ───────────────────────────────────────────────────
// Uses calcLiveKPIs to get accurate score (same formula as UI)
async function takeMonthlySnapshots() {
  let done = 0;
  try {
    // Only run on 1st of month
    if (new Date().getDate() !== 1) return 0;
    // Lazy import to avoid circular
    const { calcLiveKPIs } = await import("./kpi");
    const companies = await db.query("SELECT id FROM companies");
    for (const co of companies.rows) {
      try {
        const k = await calcLiveKPIs(co.id);
        await db.query(
          `INSERT INTO kpi_snapshots(company_id, snapshot_at,
             compliance_score, high_risk_count, med_risk_count, low_risk_count, supplier_count,
             cap_open, cap_done, cap_overdue, complaint_open, complaint_total, audit_coverage, coc_coverage)
           VALUES($1, CURRENT_DATE, $2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
           ON CONFLICT(company_id, snapshot_at) DO UPDATE SET
             compliance_score=EXCLUDED.compliance_score,
             high_risk_count=EXCLUDED.high_risk_count,
             audit_coverage=EXCLUDED.audit_coverage,
             coc_coverage=EXCLUDED.coc_coverage`,
          [co.id, k.portfolioScore, k.highRisk, k.medRisk, k.lowRisk,
           k.supplierCount, k.capOpen, k.capDone, k.capOverdue,
           k.complaintOpen, k.complaintTotal, k.auditCoverage, k.cocCoverage]
        );
        done++;
      } catch {}
    }
  } catch {}
  return done;
}

// ── 5. Complaints near 90-day feedback deadline ──────────────────────────────
async function sendFeedbackDueReminders() {
  let sent = 0;
  try {
    // Remind admin of complaints approaching or past 90-day feedback deadline
    const due = await db.query(`
      SELECT c.id, c.reference_number, c.category, c.feedback_due_at, c.company_id,
             co.name as company_name
      FROM complaints c
      JOIN companies co ON co.id = c.company_id
      WHERE c.status NOT IN ('resolved','closed')
        AND c.feedback_due_at IS NOT NULL
        AND c.feedback_due_at < now() + interval '14 days'
        AND (c.feedback_sent_at IS NULL OR c.feedback_sent_at < now() - interval '30 days')
    `).catch(() => ({ rows: [] }));

    for (const cmp of (due as any).rows) {
      if (await alreadySentToday(cmp.company_id, "feedback_due", cmp.id)) continue;
      const admin = await db.query("SELECT email FROM users WHERE company_id=$1 AND role='admin' LIMIT 1", [cmp.company_id]);
      if (!admin.rows.length) continue;
      const daysLeft = Math.ceil((new Date(cmp.feedback_due_at).getTime() - Date.now()) / 86400000);
      const isOverdue = daysLeft < 0;
      const ok = await sendEmail(
        admin.rows[0].email,
        `[LkSGCompass] ${isOverdue ? "UEBERFAELLIG" : "Frist naehert sich"}: 90-Tage-Rueckmeldung ${cmp.reference_number}`,
        `<h2 style="color:${isOverdue ? "#DC2626" : "#D97706"};margin:0 0 8px">
          &#9888; 90-Tage-Rueckmeldung ${isOverdue ? "UEBERFAELLIG" : "faellig in " + daysLeft + " Tagen"}
        </h2>
        <p style="color:#6B7280;font-size:14px;margin:0 0 16px">${cmp.company_name}</p>
        <div style="background:#FEF9C3;border:1px solid #FDE68A;border-radius:8px;padding:14px;margin-bottom:16px">
          <strong>${cmp.reference_number}</strong><br>
          <span style="font-size:13px">Faellig: ${new Date(cmp.feedback_due_at).toLocaleDateString("de-DE")}</span>
        </div>
        <p style="font-size:13px;color:#374151">
          <strong>§8 Abs.5 LkSG + HinSchG §16 Abs.2:</strong>
          Melder muss innerhalb von 3 Monaten ueber Ergebnis informiert werden.
          Bitte Beschwerde bearbeiten und Melder (sofern nicht anonym) benachrichtigen.
        </p>
        <a href="${PORTAL}/app" style="display:inline-block;background:#1B3D2B;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
          Beschwerde bearbeiten &rarr;
        </a>`
      );
      if (ok) { await logReminder(cmp.company_id, "feedback_due", cmp.id, admin.rows[0].email); sent++; }
    }
  } catch {}
  return sent;
}

// ── Run all reminders ─────────────────────────────────────────────────────────
async function runAllReminders() {
  await ensureReminderTable();
  const [caps, saqs, cmps, feedbacks, snaps] = await Promise.all([
    sendOverdueCapReminders(),
    sendSaqReminders(),
    sendComplaintReminders(),
    sendFeedbackDueReminders(),
    takeMonthlySnapshots(),
  ]);
  return { caps, saqs, cmps, feedbacks, snapshots: snaps };
}

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /reminders/run -- manual trigger (also called by Railway cron)
router.post("/run", requireAuth, async (req, res) => {
  try {
    const results = await runAllReminders();
    res.json({ ok: true, sent: results });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /reminders/log -- recent reminder history
router.get("/log", requireAuth, async (req, res) => {
  try {
    await ensureReminderTable();
    const { rows } = await db.query(
      "SELECT * FROM reminder_log WHERE company_id=$1 ORDER BY sent_at DESC LIMIT 100",
      [req.auth!.companyId]
    );
    res.json(rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Internal: called by auto-scheduler
export async function runRemindersInternal() {
  return runAllReminders();
}

export default router;
