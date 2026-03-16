/**
 * Supplier Self-Assessment Questionnaire (SAQ) -- §5 LkSG Befragungsmethode
 * 
 * Flow: Company admin sends SAQ link → supplier fills form → 
 *       responses stored → supplier risk parameters auto-updated
 */
import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import { requireString, optionalString } from "../lib/validate";
import { sendEmail } from "../lib/email";
import { calculateRisk } from "../risk/engine";

// Node 18+ has globalThis.crypto; fallback
function genToken(): string {
  try {
    return require("crypto").randomBytes(24).toString("hex");
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

const router = Router();
const PORTAL = process.env.FRONTEND_URL || "https://lksgcompass.de";

// ── §2 LkSG aligned questionnaire ──────────────────────────────────────────
export const SAQ_QUESTIONS = [
  {
    id: "q_child_labor",
    paragraph: "§2 Abs. 2 Nr. 1-3",
    de: "Wird in Ihrem Unternehmen oder bei Ihren Zulieferern Kinderarbeit (unter 15 Jahren) eingesetzt?",
    en: "Is child labour (under 15 years) employed in your company or by your suppliers?",
    type: "yesno_inverse", // yes = bad
    risk_param: "d1",
  },
  {
    id: "q_forced_labor",
    paragraph: "§2 Abs. 2 Nr. 4-5",
    de: "Werden Arbeitnehmer gegen ihren Willen zur Arbeit gezwungen (Zwangsarbeit, Schuldknechtschaft)?",
    en: "Are workers forced to work against their will (forced labour, debt bondage)?",
    type: "yesno_inverse",
    risk_param: "d1",
  },
  {
    id: "q_child_labor_hazardous",
    paragraph: "§2 Abs. 2 Nr. 2",
    de: "Werden Jugendliche unter 18 Jahren mit gefaehrlichen oder gesundheitsschaedlichen Taetigkeiten beschaftigt?",
    en: "Are young people under 18 employed in hazardous or health-damaging activities?",
    type: "yesno_inverse",
    risk_param: "a2",
  },
  {
    id: "q_contract_clause",
    paragraph: "§4 Abs. 1",
    de: "Hat Ihr Unternehmen vertragliche Menschenrechts- und Umweltklauseln mit seinen eigenen Lieferanten vereinbart?",
    en: "Has your company agreed contractual human rights and environmental clauses with its own suppliers?",
    type: "yesno",
    risk_param: "c5",
  },
  {
    id: "q_discrimination",
    paragraph: "§2 Abs. 2 Nr. 6",
    de: "Verfuegt Ihr Unternehmen uber eine schriftliche Anti-Diskriminierungs-Richtlinie (Geschlecht, Ethnie, Religion, Behinderung)?",
    en: "Does your company have a written anti-discrimination policy (gender, ethnicity, religion, disability)?",
    type: "yesno",
    risk_param: "c5",
  },
  {
    id: "q_union_rights",
    paragraph: "§2 Abs. 2 Nr. 8-9",
    de: "Haben Arbeitnehmer das Recht, Gewerkschaften beizutreten und Tarifverhandlungen zu fuhren?",
    en: "Do workers have the right to join trade unions and engage in collective bargaining?",
    type: "yesno",
    risk_param: "a4",
  },
  {
    id: "q_min_wage",
    paragraph: "§2 Abs. 2 Nr. 7",
    de: "Zahlt Ihr Unternehmen mindestens den gesetzlichen Mindestlohn (oder banchentypischen Tariflohn)?",
    en: "Does your company pay at least the statutory minimum wage (or industry-standard collective wage)?",
    type: "yesno",
    risk_param: "c5",
  },
  {
    id: "q_safety",
    paragraph: "§2 Abs. 2 Nr. 5",
    de: "Verfuegt Ihr Unternehmen uber ein dokumentiertes Arbeitsschutzmanagementsystem (ISO 45001 oder aquivalent)?",
    en: "Does your company have a documented occupational health and safety management system (ISO 45001 or equivalent)?",
    type: "yesno",
    risk_param: "c2",
  },
  {
    id: "q_environment",
    paragraph: "§2 Abs. 3 LkSG",
    de: "Verfugt Ihr Unternehmen uber ein Umweltmanagementsystem (ISO 14001 oder aquivalent)?",
    en: "Does your company have an environmental management system (ISO 14001 or equivalent)?",
    type: "yesno",
    risk_param: "c2",
  },
  {
    id: "q_coc",
    paragraph: "§4 Abs. 1 LkSG",
    de: "Haben Sie den Code of Conduct unseres Unternehmens unterzeichnet oder haben Sie einen gleichwertigen eigenen Verhaltenskodex?",
    en: "Have you signed our company's Code of Conduct or do you have an equivalent own code of conduct?",
    type: "yesno",
    risk_param: "c5",
  },
  {
    id: "q_audit",
    paragraph: "§5 Abs. 2 LkSG",
    de: "Waren Sie in den letzten 3 Jahren Gegenstand eines Sozial- oder Nachhaltigkeitsaudits (z.B. SMETA, BSCI, SA8000)?",
    en: "Have you been subject to a social or sustainability audit in the last 3 years (e.g. SMETA, BSCI, SA8000)?",
    type: "yesno",
    risk_param: "c3",
  },
  {
    id: "q_sub_suppliers",
    paragraph: "§5 Abs. 2 LkSG",
    de: "Wie viele direkte Zulieferer (Sub-Supplier) hat Ihr Unternehmen (Schieben Sie)?",
    en: "How many direct sub-suppliers does your company have (approximate)?",
    type: "range", // 0=none, 1=1-10, 2=11-50, 3=51-100, 4=100+
    risk_param: "b4",
  },
  {
    id: "q_transparency",
    paragraph: "§5 Abs. 2 LkSG",
    de: "Wie hoch scha tzen Sie die Bereitschaft Ihres Unternehmens, Informationen uber Ihre Lieferkette offenzulegen (1=sehr gering, 5=sehr hoch)?",
    en: "How would you rate your company's willingness to disclose supply chain information (1=very low, 5=very high)?",
    type: "scale_1_5",
    risk_param: "c4",
  },
  {
    id: "q_violations",
    paragraph: "§5 Abs. 1 LkSG",
    de: "Gab es in den letzten 5 Jahren bekannte oder vermutete Verstose gegen Menschenrechte oder Umweltstandards in Ihrem Unternehmen?",
    en: "Have there been any known or suspected violations of human rights or environmental standards in your company in the last 5 years?",
    type: "yesno_inverse",
    risk_param: "d3",
  },
];

// ── Ensure SAQ table exists ──────────────────────────────────────────────────
async function ensureSaqTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS supplier_saq (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
      supplier_name TEXT,
      token       TEXT UNIQUE NOT NULL,
      sent_to     TEXT,
      status      TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','opened','completed','expired')),
      sent_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      opened_at   TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      expires_at  TIMESTAMPTZ NOT NULL,
      responses   JSONB,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_saq_company ON supplier_saq(company_id);
    CREATE INDEX IF NOT EXISTS idx_saq_token   ON supplier_saq(token);
  `);
}

// Risk param update from SAQ responses
function calcRiskImpact(responses: Record<string, any>): Record<string, number> {
  const delta: Record<string, number> = {};

  // Each question maps to a risk parameter adjustment (-2 to +2)
  for (const q of SAQ_QUESTIONS) {
    const answer = responses[q.id];
    if (answer === undefined || answer === null) continue;

    let adjustment = 0;
    if (q.type === "yesno") {
      // yes=good, no=bad
      adjustment = answer === "yes" ? -1 : answer === "no" ? 1 : 0;
    } else if (q.type === "yesno_inverse") {
      // yes=bad, no=good
      adjustment = answer === "yes" ? 2 : answer === "no" ? -1 : 0;
    } else if (q.type === "scale_1_5") {
      // high = good (transparency), low = bad
      const v = parseInt(answer) || 3;
      adjustment = v >= 4 ? -1 : v <= 2 ? 1 : 0;
    } else if (q.type === "range") {
      // more sub-suppliers = higher complexity
      const v = parseInt(answer) || 2;
      delta["b4"] = (delta["b4"] || 0) + (v - 2);
      continue;
    }

    delta[q.risk_param] = (delta[q.risk_param] || 0) + adjustment;
  }
  return delta;
}

async function applyRiskDelta(supplierId: string, delta: Record<string, number>) {
  if (!Object.keys(delta).length) return;

  const s = await db.query(
    "SELECT country, industry, annual_spend_eur, workers, has_audit, has_code_of_conduct, risk_parameters FROM suppliers WHERE id=$1",
    [supplierId]
  );
  if (!s.rows.length) return;
  const sup = s.rows[0];

  // Merge SAQ deltas into existing parameters
  let params: Record<string, number> = sup.risk_parameters || {};
  for (const [k, d] of Object.entries(delta)) {
    params[k] = Math.min(5, Math.max(0, (params[k] || 2) + d));
  }

  // Re-run full risk engine (country + industry + profile + SAQ-adjusted params)
  // SAQ flags update has_audit / has_code_of_conduct directly if answered positively
  const saqAudit = delta["c3"] !== undefined && delta["c3"] < 0; // audit question answered yes
  const saqCoc   = delta["c5"] !== undefined && delta["c5"] < 0; // coc question answered yes
  const risk = calculateRisk({
    country:             sup.country,
    industry:            sup.industry,
    annual_spend_eur:    sup.annual_spend_eur,
    workers:             sup.workers,
    has_audit:           sup.has_audit || saqAudit,
    has_code_of_conduct: sup.has_code_of_conduct || saqCoc,
  });

  // Blend: base engine score (70%) + SAQ parameter adjustment (30%)
  const paramVals = Object.values(params);
  const paramScore = paramVals.length ? paramVals.reduce((a: number, b) => a + b, 0) / paramVals.length * 20 : 50;
  const blendedScore = Math.round(risk.score * 0.7 + paramScore * 0.3);
  const newLevel = blendedScore >= 70 ? "high" : blendedScore >= 40 ? "medium" : "low";

  const updates: string[] = ["risk_parameters=$1", "risk_score=$2", "risk_level=$3", "updated_at=now()"];
  const vals: any[] = [JSON.stringify(params), blendedScore, newLevel];
  if (saqAudit) { updates.push(`has_audit=true`); }
  if (saqCoc)   { updates.push(`has_code_of_conduct=true`); }
  vals.push(supplierId);

  await db.query(
    `UPDATE suppliers SET ${updates.join(",")} WHERE id=$${vals.length}`,
    vals
  );
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /saq -- list all SAQs for company
router.get("/", requireAuth, async (req, res) => {
  try {
    await ensureSaqTable();
    const r = await db.query(
      `SELECT s.*, sup.name AS supplier_name_live, sup.country, sup.industry, sup.risk_level
       FROM supplier_saq s
       LEFT JOIN suppliers sup ON sup.id = s.supplier_id
       WHERE s.company_id = $1
       ORDER BY s.created_at DESC`,
      [req.auth!.companyId]
    );
    res.json(r.rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /saq -- send SAQ to supplier
router.post("/", requireAuth, async (req, res) => {
  try {
    await ensureSaqTable();
    const companyId  = req.auth!.companyId;
    const supplierId = optionalString(req.body.supplierId);
    const sentTo     = optionalString(req.body.email);
    const daysValid  = parseInt(req.body.daysValid) || 30;
    const expiresAt  = new Date(Date.now() + daysValid * 86400000).toISOString();
    const token      = genToken();

    let supplierName: string | null = null;
    let supplierCountry: string | null = null;
    if (supplierId) {
      const s = await db.query("SELECT name, country FROM suppliers WHERE id=$1 AND company_id=$2", [supplierId, companyId]);
      if (!s.rows.length) return res.status(400).json({ error: "Supplier not found" });
      supplierName    = s.rows[0].name;
      supplierCountry = s.rows[0].country;
    }

    const row = await db.query(
      `INSERT INTO supplier_saq(company_id, supplier_id, supplier_name, token, sent_to, expires_at)
       VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [companyId, supplierId || null, supplierName, token, sentTo || null, expiresAt]
    );

    const saqUrl = `${PORTAL}/saq/${token}`;

    // Get company name for email
    const co = await db.query("SELECT name FROM companies WHERE id=$1", [companyId]);
    const companyName = co.rows[0]?.name || "Ihr Auftraggeber";

    if (sentTo) {
      await sendEmail(
        sentTo,
        `[LkSGCompass] Lieferanten-Selbstauskunft (SAQ) -- ${companyName}`,
        `
<h2 style="margin:0 0 8px;font-size:20px;font-weight:800">Lieferanten-Selbstauskunft</h2>
<p style="color:#6B7280;margin:0 0 20px;font-size:14px"><strong>${companyName}</strong> bittet Sie, einen kurzen Fragenbogen zu Ihrer Lieferketten-Compliance auszufuellen (§5 LkSG).</p>

<div style="background:#f0f5f1;border:1px solid #d1e7d9;border-radius:8px;padding:14px;margin-bottom:20px;font-size:13px;color:#1B3D2B;line-height:1.5">
  <strong>Was ist das?</strong> Dieser Fragebogen ist Teil der gesetzlichen Lieferkettensorgfaltspflicht (LkSG). Ihre Angaben helfen ${companyName}, das Risikoniveau in der gemeinsamen Lieferkette einzuschaetzen.<br><br>
  <strong>Dauer:</strong> Ca. 5-10 Minuten &bull; <strong>Vertraulich:</strong> Ja &bull; <strong>Gultig bis:</strong> ${new Date(expiresAt).toLocaleDateString("de-DE")}
</div>

${supplierName ? `<p style="font-size:13px;color:#6B7280">Lieferant: <strong>${supplierName}</strong>${supplierCountry ? ` (${supplierCountry})` : ""}</p>` : ""}

<a href="${saqUrl}" style="display:inline-block;background:#1B3D2B;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin-top:8px">
  Fragebogen ausfuellen &rarr;
</a>

<p style="font-size:12px;color:#9CA3AF;margin-top:16px">Link: ${saqUrl} (gultig ${daysValid} Tage)</p>
`
      );
    }

    res.json({ ...row.rows[0], url: saqUrl });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

// GET /saq/questions -- return question schema (public)
router.get("/questions", async (_req, res) => {
  res.json(SAQ_QUESTIONS);
});

// GET /public/saq/:token -- public: get SAQ form data
router.get("/public/:token", async (req, res) => {
  try {
    await ensureSaqTable();
    const r = await db.query(
      `SELECT s.*, co.name AS company_name, co.slug AS company_slug
       FROM supplier_saq s
       JOIN companies co ON co.id = s.company_id
       WHERE s.token = $1`,
      [req.params.token]
    );
    if (!r.rows.length) return res.status(404).json({ error: "Fragebogen nicht gefunden" });
    const saq = r.rows[0];

    if (saq.status === "expired" || new Date(saq.expires_at) < new Date()) {
      return res.status(410).json({ error: "Dieser Fragebogen ist abgelaufen." });
    }
    if (saq.status === "completed") {
      return res.json({ completed: true, company_name: saq.company_name });
    }

    // Mark as opened
    if (saq.status === "sent") {
      await db.query("UPDATE supplier_saq SET status='opened', opened_at=now() WHERE token=$1", [req.params.token]);
    }

    res.json({
      id: saq.id,
      token: saq.token,
      company_name: saq.company_name,
      supplier_name: saq.supplier_name,
      expires_at: saq.expires_at,
      questions: SAQ_QUESTIONS,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /public/saq/:token -- public: submit SAQ responses
router.post("/public/:token", async (req, res) => {
  try {
    await ensureSaqTable();
    const r = await db.query(
      "SELECT * FROM supplier_saq WHERE token=$1",
      [req.params.token]
    );
    if (!r.rows.length) return res.status(404).json({ error: "Not found" });
    const saq = r.rows[0];

    if (saq.status === "completed") return res.json({ ok: true, already: true });
    if (new Date(saq.expires_at) < new Date()) return res.status(410).json({ error: "Abgelaufen" });

    const responses = req.body.responses || {};
    const delta = calcRiskImpact(responses);

    await db.query(
      "UPDATE supplier_saq SET status='completed', completed_at=now(), responses=$1 WHERE token=$2",
      [JSON.stringify(responses), req.params.token]
    );

    // Update supplier risk if linked
    if (saq.supplier_id) {
      await applyRiskDelta(saq.supplier_id, delta);
    }

    // Notify company admin
    try {
      const u = await db.query("SELECT email FROM users WHERE company_id=$1 AND role='admin' LIMIT 1", [saq.company_id]);
      if (u.rows.length) {
        await sendEmail(
          u.rows[0].email,
          `[LkSGCompass] SAQ ausgefullt: ${saq.supplier_name || "Lieferant"}`,
          `<h2>SAQ abgeschlossen</h2>
<p>Der Lieferant <strong>${saq.supplier_name || "Unbekannt"}</strong> hat den Selbstauskunft-Fragebogen ausgefullt.</p>
<p>Risikoscore wurde automatisch aktualisiert.</p>
<a href="${PORTAL}/app" style="background:#1B3D2B;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700">Dashboard offnen</a>`
        );
      }
    } catch {}

    res.json({ ok: true, delta });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

// DELETE /saq/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await db.query("DELETE FROM supplier_saq WHERE id=$1 AND company_id=$2", [req.params.id, req.auth!.companyId]);
    res.json({ ok: true });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

export default router;
