/**
 * Actions module -- CAP (Corrective Action Plan) tracking
 * §6, §7 LkSG compliant
 */
import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import { requireWriteAccess } from "../middleware/access";
import { requireString, optionalString } from "../lib/validate";
import { sendEmail, capCreatedHtml } from "../lib/email";

const router = Router();
const PORTAL = process.env.FRONTEND_URL || "https://lksgcompass.de";

// GET /actions -- list all action plans
router.get("/", requireAuth, requireWriteAccess, async (req, res) => {
  try {
    const companyId = req.auth!.companyId;
    const r = await db.query(
      `SELECT a.id, a.title, a.description, a.risk_level, a.lksg_paragraph,
              a.due_date, a.status, a.priority, a.assigned_to,
              a.completed_at, a.evidence_notes, a.created_at, a.updated_at,
              s.id AS supplier_id, s.name AS supplier_name, s.country AS supplier_country
       FROM action_plans a
       LEFT JOIN suppliers s ON s.id = a.supplier_id
       WHERE a.company_id = $1
       ORDER BY
         CASE a.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
         a.due_date ASC NULLS LAST`,
      [companyId]
    );
    res.json(r.rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /actions -- create a new action plan
router.post("/", requireAuth, requireWriteAccess, async (req, res) => {
  try {
    const companyId   = req.auth!.companyId;
    const title       = requireString(req.body.title, "title");
    const description = optionalString(req.body.description) ?? "";
    const supplierId  = optionalString(req.body.supplierId);
    const riskLevel   = optionalString(req.body.riskLevel) ?? "high";
    const lksgPara    = optionalString(req.body.lksgParagraph) ?? "6";
    const dueDate     = optionalString(req.body.dueDate);
    const priority    = ["low","medium","high","critical"].includes(req.body.priority) ? req.body.priority : "high";
    const assignedTo  = optionalString(req.body.assignedTo);

    // Mark overdue if past due
    const status = "open";

    const r = await db.query(
      `INSERT INTO action_plans(company_id, supplier_id, title, description, risk_level,
                                lksg_paragraph, due_date, status, priority, assigned_to)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [companyId, supplierId ?? null, title, description, riskLevel,
       lksgPara, dueDate ?? null, status, priority, assignedTo ?? null]
    );

    const action = r.rows[0];

    // Get supplier name for email
    let supplierName = "Unbekannt";
    if (supplierId) {
      const s = await db.query("SELECT name FROM suppliers WHERE id=$1", [supplierId]);
      supplierName = s.rows[0]?.name || supplierName;
    }

    // Notify admin
    try {
      const u = await db.query("SELECT email FROM users WHERE company_id=$1 AND role='admin' LIMIT 1", [companyId]);
      if (u.rows.length) {
        await sendEmail(
          u.rows[0].email,
          `[LkSGCompass] Neuer CAP: ${title} -- §${lksgPara} LkSG`,
          capCreatedHtml({
            companyName: "",
            supplierName,
            title,
            dueDate: dueDate || "Nicht festgelegt",
            priority,
            lksgParagraph: lksgPara,
            dashboardUrl: `${PORTAL}/app`,
          })
        );
      }
    } catch {}

    res.json({ ...action, supplier_name: supplierName });
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "Create action failed" });
  }
});

// PUT /actions/:id -- update action plan
router.put("/:id", requireAuth, requireWriteAccess, async (req, res) => {
  try {
    const companyId = req.auth!.companyId;
    const id = req.params.id;

    // Build dynamic update
    const fields: string[] = [];
    const vals: any[]      = [];
    let i = 1;

    const allowed = ["title","description","status","priority","due_date","assigned_to","evidence_notes","lksg_paragraph","progress_percent","relationship_status","relationship_status_reason"];
    for (const key of allowed) {
      const camel = key.replace(/_([a-z])/g, (_,c) => c.toUpperCase());
      const val = req.body[key] ?? req.body[camel];
      if (val !== undefined) {
        fields.push(`${key}=$${i++}`);
        vals.push(val);
      }
    }

    if (!fields.length) return res.status(400).json({ error: "Nothing to update" });

    // Auto-set completed_at
    if (req.body.status === "completed" || req.body.status === "closed") {
      fields.push(`completed_at=now()`);
    }
    // §7 Abs.4: Auto-timestamp relationship status changes
    if (req.body.relationship_status && req.body.relationship_status !== "active") {
      fields.push(`relationship_status_at=now()`);
    }
    fields.push(`updated_at=now()`);

    vals.push(id, companyId);
    const r = await db.query(
      `UPDATE action_plans SET ${fields.join(",")} WHERE id=$${i} AND company_id=$${i+1} RETURNING *`,
      vals
    );
    if (!r.rows.length) return res.status(404).json({ error: "Not found" });
    res.json(r.rows[0]);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE /actions/:id -- only if not completed (legal protection)
router.delete("/:id", requireAuth, requireWriteAccess, async (req, res) => {
  try {
    const companyId = req.auth!.companyId;
    const id = req.params.id;

    const check = await db.query(
      "SELECT status FROM action_plans WHERE id=$1 AND company_id=$2",
      [id, companyId]
    );
    if (!check.rows.length) return res.status(404).json({ error: "Not found" });
    if (check.rows[0].status === "completed") {
      return res.status(403).json({ error: "Completed actions cannot be deleted (§10 LkSG audit trail)" });
    }

    await db.query("DELETE FROM action_plans WHERE id=$1 AND company_id=$2", [id, companyId]);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// GET /actions/stats -- summary for dashboard
router.get("/stats", requireAuth, requireWriteAccess, async (req, res) => {
  try {
    const companyId = req.auth!.companyId;
    const r = await db.query(
      `SELECT
        COUNT(*) FILTER (WHERE status NOT IN ('completed','closed')) AS open_count,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
        COUNT(*) FILTER (WHERE due_date < NOW() AND status NOT IN ('completed','closed')) AS overdue_count,
        COUNT(*) FILTER (WHERE priority IN ('critical','high') AND status NOT IN ('completed','closed')) AS urgent_count
       FROM action_plans WHERE company_id=$1`,
      [companyId]
    );
    res.json(r.rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});


// GET /actions/export/csv
router.get("/export/csv", requireAuth, requireWriteAccess, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT a.title, a.description, a.status, a.priority, a.due_date,
              a.assigned_to, a.lksg_paragraph, a.progress_percent,
              s.name as supplier_name
       FROM action_plans a
       LEFT JOIN suppliers s ON s.id = a.supplier_id
       WHERE a.company_id=$1 ORDER BY a.due_date ASC NULLS LAST`,
      [req.auth!.companyId]
    );
    const headers = ["title","supplier_name","status","priority","due_date","assigned_to","lksg_paragraph","progress_percent","description"];
    const lines = [
      headers.join(","),
      ...rows.map((r: any) => headers.map(h => {
        const v = r[h] ?? "";
        return String(v).includes(",") || String(v).includes("\n") ? `"${String(v).replace(/"/g,'""')}"` : v;
      }).join(","))
    ];
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="action_plans_${new Date().toISOString().slice(0,10)}.csv"`);
    res.send(lines.join("\n"));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
