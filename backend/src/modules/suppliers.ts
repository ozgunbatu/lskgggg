import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import { requireWriteAccess } from "../middleware/access";
import { calculateRisk } from "../risk/engine";
import { requireString, optionalString } from "../lib/validate";
import { logAudit } from "./auditlog";

const router = Router();

router.get("/", requireAuth, requireWriteAccess, async (req, res) => {
  try {
    const r = await db.query(
      "SELECT * FROM suppliers WHERE company_id=$1 ORDER BY risk_score DESC, name ASC",
      [req.auth!.companyId]
    );
    res.json(r.rows);
  } catch (e: any) { res.status(503).json({ error: e.message }); }
});

router.get("/:id", requireAuth, requireWriteAccess, async (req, res) => {
  try {
    const r = await db.query("SELECT * FROM suppliers WHERE id=$1 AND company_id=$2", [req.params.id, req.auth!.companyId]);
    if (!r.rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(r.rows[0]);
  } catch (e: any) { res.status(503).json({ error: e.message }); }
});

function buildRisk(body: any) {
  return calculateRisk({
    country:             body.country,
    industry:            body.industry,
    annual_spend_eur:    body.annual_spend_eur    || null,
    workers:             body.workers              || null,
    has_audit:           body.has_audit            || false,
    has_code_of_conduct: body.has_code_of_conduct  || false,
    certification_count: body.certification_count  || 0,
    sub_supplier_count:  body.sub_supplier_count   || 0,
    transparency_score:  body.transparency_score   || null,
    complaint_count:     body.complaint_count       || 0,
    previous_violations: body.previous_violations   || false,
  });
}

router.post("/", requireAuth, requireWriteAccess, async (req, res) => {
  try {
    const { name, country, industry } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "name required" });
    const risk = buildRisk(req.body);
    const r = await db.query(
      `INSERT INTO suppliers (company_id,name,country,industry,annual_spend_eur,workers,has_audit,has_code_of_conduct,
       certification_count,sub_supplier_count,transparency_score,complaint_count,previous_violations,
       risk_score,risk_level,risk_parameters,risk_explanation)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [req.auth!.companyId, name.trim(), country||"Germany", industry||"services",
       req.body.annual_spend_eur||null, req.body.workers||null,
       req.body.has_audit||false, req.body.has_code_of_conduct||false,
       req.body.certification_count||0, req.body.sub_supplier_count||0,
       req.body.transparency_score||null, req.body.complaint_count||0,
       req.body.previous_violations||false,
       risk.score, risk.risk_level, JSON.stringify(risk.parameters), JSON.stringify(risk.explanation)]
    );
    await logAudit({ companyId: req.auth!.companyId, userEmail: req.auth!.email, action: "CREATE", entityType: "supplier", entityId: r.rows[0].id, entityName: name.trim(), newValue: { country, industry, risk_level: risk.risk_level, risk_score: risk.score } });
    res.status(201).json(r.rows[0]);
  } catch (e: any) { res.status(503).json({ error: e.message }); }
});

router.put("/:id", requireAuth, requireWriteAccess, async (req, res) => {
  try {
    const old = await db.query("SELECT name,country,industry,risk_level,risk_score FROM suppliers WHERE id=$1 AND company_id=$2", [req.params.id, req.auth!.companyId]);
    if (!old.rows[0]) return res.status(404).json({ error: "Not found" });
    const nameVal = requireString(req.body.name, "name");
    req.body.name = nameVal;
    const risk = buildRisk(req.body);
    const r = await db.query(
      `UPDATE suppliers SET name=$1,country=$2,industry=$3,annual_spend_eur=$4,workers=$5,
       has_audit=$6,has_code_of_conduct=$7,certification_count=$8,sub_supplier_count=$9,
       transparency_score=$10,complaint_count=$11,previous_violations=$12,notes=$13,
       risk_score=$14,risk_level=$15,risk_parameters=$16,risk_explanation=$17,updated_at=now()
       WHERE id=$18 AND company_id=$19 RETURNING *`,
      [req.body.name, req.body.country, req.body.industry,
       req.body.annual_spend_eur||null, req.body.workers||null,
       req.body.has_audit||false, req.body.has_code_of_conduct||false,
       req.body.certification_count||0, req.body.sub_supplier_count||0,
       req.body.transparency_score||null, req.body.complaint_count||0,
       req.body.previous_violations||false, req.body.notes||null,
       risk.score, risk.risk_level, JSON.stringify(risk.parameters), JSON.stringify(risk.explanation),
       req.params.id, req.auth!.companyId]
    );
    await logAudit({ companyId: req.auth!.companyId, userEmail: req.auth!.email, action: "UPDATE", entityType: "supplier", entityId: req.params.id, entityName: req.body.name, oldValue: old.rows[0], newValue: { country: req.body.country, industry: req.body.industry, risk_level: risk.risk_level, risk_score: risk.score } });
    res.json(r.rows[0]);
  } catch (e: any) { res.status(503).json({ error: e.message }); }
});

router.delete("/:id", requireAuth, requireWriteAccess, async (req, res) => {
  try {
    const old = await db.query("SELECT name,country,risk_level FROM suppliers WHERE id=$1 AND company_id=$2", [req.params.id, req.auth!.companyId]);
    await db.query("DELETE FROM suppliers WHERE id=$1 AND company_id=$2", [req.params.id, req.auth!.companyId]);
    if (old.rows[0]) await logAudit({ companyId: req.auth!.companyId, userEmail: req.auth!.email, action: "DELETE", entityType: "supplier", entityId: req.params.id, entityName: old.rows[0].name, oldValue: old.rows[0] });
    res.json({ ok: true });
  } catch (e: any) { res.status(503).json({ error: e.message }); }
});

router.post("/recalculate", requireAuth, requireWriteAccess, async (req, res) => {
  try {
    const all = await db.query("SELECT * FROM suppliers WHERE company_id=$1", [req.auth!.companyId]);
    await Promise.all(all.rows.map(async (s: any) => {
      const risk = buildRisk(s);
      await db.query(
        "UPDATE suppliers SET risk_score=$1,risk_level=$2,risk_parameters=$3,risk_explanation=$4,updated_at=now() WHERE id=$5",
        [risk.score, risk.risk_level, JSON.stringify(risk.parameters), JSON.stringify(risk.explanation), s.id]
      );
    }));
    await logAudit({ companyId: req.auth!.companyId, userEmail: req.auth!.email, action: "RECALCULATE_ALL", entityType: "supplier", entityName: `${all.rows.length} suppliers` });
    res.json({ updated: all.rows.length });
  } catch (e: any) { res.status(503).json({ error: e.message }); }
});

router.post("/import/csv", requireAuth, requireWriteAccess, async (req, res) => {
  try {
    const { csv } = req.body;
    if (!csv) return res.status(400).json({ error: "csv required" });
    const lines = csv.trim().split("\n").filter((l: string) => l.trim());
    if (lines.length < 2) return res.status(400).json({ error: "Need header + data rows" });
    const headers = lines[0].split(",").map((h: string) => h.trim().toLowerCase());
    const col = (name: string) => headers.indexOf(name);
    let imported = 0;
    for (const line of lines.slice(1)) {
      const cols = line.split(",").map((c: string) => c.trim());
      const name = cols[col("name")]; if (!name) continue;
      const country = cols[col("country")] || "Germany";
      const industry = cols[col("industry")] || "services";
      const body = { country, industry, annual_spend_eur: parseFloat(cols[col("annual_spend_eur")])||null, workers: parseInt(cols[col("workers")])||null, has_audit: cols[col("has_audit")]?.toLowerCase()==="true", has_code_of_conduct: cols[col("has_code_of_conduct")]?.toLowerCase()==="true" };
      const risk = buildRisk(body);
      await db.query(
        `INSERT INTO suppliers(company_id,name,country,industry,annual_spend_eur,workers,has_audit,has_code_of_conduct,risk_score,risk_level,risk_parameters,risk_explanation)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT DO NOTHING`,
        [req.auth!.companyId,name,country,industry,body.annual_spend_eur,body.workers,body.has_audit,body.has_code_of_conduct,risk.score,risk.risk_level,JSON.stringify(risk.parameters),JSON.stringify(risk.explanation)]
      );
      imported++;
    }
    await logAudit({ companyId: req.auth!.companyId, userEmail: req.auth!.email, action: "IMPORT_CSV", entityType: "supplier", entityName: `${imported} imported` });
    res.json({ imported });
  } catch (e: any) { res.status(503).json({ error: e.message }); }
});


// GET /suppliers/export/csv
router.get("/export/csv", requireAuth, requireWriteAccess, async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT name,country,industry,risk_level,risk_score,has_audit,has_code_of_conduct,annual_spend_eur,workers,complaint_count,previous_violations,notes FROM suppliers WHERE company_id=$1 ORDER BY risk_score DESC",
      [req.auth!.companyId]
    );
    const headers = ["name","country","industry","risk_level","risk_score","has_audit","has_code_of_conduct","annual_spend_eur","workers","complaint_count","previous_violations","notes"];
    const lines = [
      headers.join(","),
      ...rows.map((r: any) => headers.map(h => {
        const v = r[h] ?? "";
        return String(v).includes(",") ? `"${v}"` : v;
      }).join(","))
    ];
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="suppliers_${new Date().toISOString().slice(0,10)}.csv"`);
    res.send(lines.join("\n"));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
