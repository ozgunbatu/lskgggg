import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /companies/me -- full company profile including regulatory fields
router.get("/me", requireAuth, async (req, res) => {
  const companyId = req.auth!.companyId;
  const r = await db.query(
    `SELECT id, name, slug, size_employees, industry,
            grundsatzerklaerung, grundsatzerklaerung_updated_at,
            hr_officer_name, hr_officer_email, hr_officer_phone, hr_officer_appointed_at,
            complaints_officer_name, complaints_officer_email,
            bafa_submitted_at, bafa_submission_year, bafa_report_public_url,
            address_street, address_city, address_country,
            created_at
     FROM companies WHERE id=$1`,
    [companyId]
  );
  res.json(r.rows[0] ?? null);
});

// PUT /companies/me -- update company profile & regulatory fields
router.put("/me", requireAuth, async (req, res) => {
  const companyId = req.auth!.companyId;
  const allowed = [
    "name", "size_employees", "industry",
    "grundsatzerklaerung",
    "hr_officer_name", "hr_officer_email", "hr_officer_phone",
    "complaints_officer_name", "complaints_officer_email",
    "bafa_report_public_url",
    "address_street", "address_city", "address_country",
    // §6 Abs.4 + HinSchG
    "industry_initiatives",
    "hinschg_officer_name", "hinschg_officer_email",
  ];

  const fields: string[] = [];
  const vals: any[] = [];
  let i = 1;

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      fields.push(`${key}=$${i++}`);
      vals.push(req.body[key]);
    }
  }

  // Auto-set timestamps
  if (req.body.grundsatzerklaerung !== undefined) {
    fields.push(`grundsatzerklaerung_updated_at=now()`);
  }
  if (req.body.hr_officer_name !== undefined && !req.body.hr_officer_appointed_at) {
    fields.push(`hr_officer_appointed_at=now()`);
  }

  if (!fields.length) return res.status(400).json({ error: "Nothing to update" });
  fields.push(`updated_at=now()`);

  vals.push(companyId);
  const r = await db.query(
    `UPDATE companies SET ${fields.join(",")} WHERE id=$${i} RETURNING *`,
    vals
  );
  res.json(r.rows[0]);
});

// POST /companies/bafa-submit -- mark BAFA report as submitted
router.post("/bafa-submit", requireAuth, async (req, res) => {
  const companyId = req.auth!.companyId;
  const year = parseInt(req.body.year) || new Date().getFullYear();
  const publicUrl = req.body.publicUrl || null;

  await db.query(
    `UPDATE companies SET bafa_submitted_at=now(), bafa_submission_year=$1, bafa_report_public_url=$2, updated_at=now()
     WHERE id=$3`,
    [year, publicUrl, companyId]
  );

  // Log to audit
  await db.query(
    `INSERT INTO audit_log(company_id, user_email, action, entity_type, entity_name)
     VALUES($1,$2,'BAFA_SUBMIT','report',$3)`,
    [companyId, req.auth!.email, `Jahresbericht ${year}`]
  ).catch(() => {});

  res.json({ ok: true, year, submittedAt: new Date().toISOString() });
});

export default router;
