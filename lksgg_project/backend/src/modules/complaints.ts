import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import { requireWriteAccess } from "../middleware/access";
import { requireString, optionalString } from "../lib/validate";
import { sendEmail, complaintNotificationHtml } from "../lib/email";

const router = Router();

const PORTAL = process.env.FRONTEND_URL || "https://lksgcompass.de";

function makeRefNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `BSWD-${ts}-${rand}`;
}

function categoryLabel(cat: string): string {
  const m: Record<string, string> = {
    human_rights:  "Menschenrechtsverletzung (§2 Abs. 1 LkSG)",
    child_labor:   "Kinderarbeit (§2 Abs. 2 Nr. 1-3 LkSG)",
    forced_labor:  "Zwangsarbeit (§2 Abs. 2 Nr. 4-5 LkSG)",
    discrimination:"Diskriminierung (§2 Abs. 2 Nr. 6 LkSG)",
    environment:   "Umweltverstoss (§2 Abs. 3 LkSG)",
    safety:        "Arbeitsschutz (§2 Abs. 2 Nr. 5 LkSG)",
    corruption:    "Korruption (§2 Abs. 2 Nr. 10 LkSG)",
    other:         "Sonstiger Verstoss",
  };
  return m[cat] || cat;
}

// Notify company admin after new complaint
async function notifyAdmin(companyId: string, complaint: any, supplierName?: string) {
  try {
    // Get admin email
    const u = await db.query(
      "SELECT email FROM users WHERE company_id=$1 AND role='admin' LIMIT 1",
      [companyId]
    );
    if (!u.rows.length) return;

    const co = await db.query("SELECT name FROM companies WHERE id=$1", [companyId]);
    const companyName = co.rows[0]?.name || "Ihr Unternehmen";

    await sendEmail(
      u.rows[0].email,
      `[LkSGCompass] Neue Beschwerde: ${complaint.reference_number} -- ${categoryLabel(complaint.category)}`,
      complaintNotificationHtml({
        companyName,
        refNumber: complaint.reference_number,
        category: categoryLabel(complaint.category),
        description: complaint.description.substring(0, 500) + (complaint.description.length > 500 ? "..." : ""),
        severity: complaint.severity || "medium",
        supplierName,
        isAnonymous: complaint.is_anonymous ?? false,
        portalUrl: `${PORTAL}/app`,
      })
    );
  } catch (e: any) {
    console.warn("[complaints] notify admin failed:", e?.message);
  }
}

// GET /complaints -- list all for company
router.get("/", requireAuth, requireWriteAccess, async (req, res) => {
  try {
    const companyId = req.auth!.companyId;
    const r = await db.query(
      `SELECT c.id, c.category, c.description, c.status, c.severity,
              c.is_anonymous, c.reference_number, c.internal_notes,
              c.created_at, c.updated_at,
              s.id AS supplier_id, COALESCE(s.name, c.supplier_name) AS supplier_name
       FROM complaints c
       LEFT JOIN suppliers s ON s.id = c.supplier_id
       WHERE c.company_id = $1
       ORDER BY c.created_at DESC`,
      [companyId]
    );
    res.json(r.rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /complaints -- internal submission (logged-in user)
router.post("/", requireAuth, requireWriteAccess, async (req, res) => {
  try {
    const companyId = req.auth!.companyId;
    const supplierId = optionalString(req.body.supplierId);
    const category   = requireString(req.body.category ?? "human_rights", "category");
    const description = requireString(req.body.description, "description");
    const severity   = ["low","medium","high","critical"].includes(req.body.severity) ? req.body.severity : "medium";
    const refNumber  = makeRefNumber();

    // Supplier snapshot
    let supplierName: string | null = null;
    if (supplierId) {
      const s = await db.query("SELECT name FROM suppliers WHERE id=$1 AND company_id=$2", [supplierId, companyId]);
      supplierName = s.rows[0]?.name || null;
    }

    const r = await db.query(
      `INSERT INTO complaints(company_id, supplier_id, supplier_name, category, description, severity,
                              status, is_anonymous, reference_number, source)
       VALUES($1,$2,$3,$4,$5,$6,'open',false,$7,'internal')
       RETURNING id, category, description, status, severity, is_anonymous, reference_number, created_at, supplier_id`,
      [companyId, supplierId ?? null, supplierName, category, description, severity, refNumber]
    );

    const complaint = r.rows[0];
    // Fire-and-forget notification
    notifyAdmin(companyId, complaint, supplierName || undefined);

    res.json({ ...complaint, supplier_name: supplierName });
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "Create complaint failed" });
  }
});

// PUT /complaints/:id/status
router.put("/:id/status", requireAuth, requireWriteAccess, async (req, res) => {
  try {
    const companyId = req.auth!.companyId;
    const id       = req.params.id;
    const status   = requireString(req.body.status, "status");
    const allowed  = new Set(["open","in_review","investigating","resolved","closed"]);
    if (!allowed.has(status)) return res.status(400).json({ error: "Invalid status" });

    const isResolved = status === "resolved" || status === "closed";
    const r = await db.query(
      `UPDATE complaints SET status=$1, updated_at=now()
       ${isResolved ? ", resolved_at=now(), reporter_notified_at=now()" : ""}
       WHERE id=$2 AND company_id=$3
       RETURNING *`,
      [status, id, companyId]
    );
    if (!r.rows.length) return res.status(404).json({ error: "Not found" });

    const cmp = r.rows[0];

    // §8 Abs.5: Notify non-anonymous complainant of resolution
    if (isResolved && !cmp.is_anonymous && cmp.contact_info && cmp.contact_info.includes("@")) {
      try {
        await sendEmail(
          cmp.contact_info,
          `[LkSGCompass] Ihre Beschwerde ${cmp.reference_number} wurde bearbeitet`,
          `<h2>Ihre Beschwerde wurde bearbeitet</h2>
<p>Ihre Beschwerde mit der Referenznummer <strong>${cmp.reference_number}</strong> wurde abgeschlossen.</p>
<p>Status: <strong>${status === "resolved" ? "Geloest" : "Geschlossen"}</strong></p>
<p>Vielen Dank fuer Ihre Meldung. Sie haben zur Einhaltung der Menschenrechtssorgfaltspflichten beigetragen.</p>
<p style="font-size:12px;color:#9CA3AF">Gemaess §8 Abs.5 LkSG sind Sie als Hinweisgeber/-in vor Benachteiligungen gesetzlich geschuetzt.</p>`
        );
      } catch {}
    }

    res.json(r.rows[0]);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// PUT /complaints/:id/notes -- internal notes
router.put("/:id/notes", requireAuth, requireWriteAccess, async (req, res) => {
  try {
    const companyId = req.auth!.companyId;
    const notes = optionalString(req.body.notes) ?? "";
    const r = await db.query(
      "UPDATE complaints SET internal_notes=$1, updated_at=now() WHERE id=$2 AND company_id=$3 RETURNING id, internal_notes",
      [notes, req.params.id, companyId]
    );
    if (!r.rows.length) return res.status(404).json({ error: "Not found" });
    res.json(r.rows[0]);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});


// GET /complaints/export/csv
router.get("/export/csv", requireAuth, requireWriteAccess, async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT reference_number,category,severity,status,source,description,created_at,resolved_at FROM complaints WHERE company_id=$1 ORDER BY created_at DESC",
      [req.auth!.companyId]
    );
    const headers = ["reference_number","category","severity","status","source","created_at","resolved_at","description"];
    const lines = [
      headers.join(","),
      ...rows.map((r: any) => headers.map(h => {
        const v = r[h] ?? "";
        return String(v).includes(",") || String(v).includes("\n") ? `"${String(v).replace(/"/g,'""')}"` : v;
      }).join(","))
    ];
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="complaints_${new Date().toISOString().slice(0,10)}.csv"`);
    res.send(lines.join("\n"));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
