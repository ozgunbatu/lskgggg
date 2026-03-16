/**
 * Evidence Vault -- §10 LkSG Documentation
 * Supports file upload (base64 → DB or Supabase Storage)
 */
import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../middleware/auth";

const router = Router();

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const BUCKET       = process.env.EVIDENCE_BUCKET || "evidence";

// Upload to Supabase Storage if configured, else store inline
async function storeFile(companyId: string, fileBase64: string, fileName: string, mimeType: string): Promise<string> {
  if (SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL !== "https://placeholder.supabase.co") {
    try {
      const buf = Buffer.from(fileBase64, "base64");
      const path = `${companyId}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const resp = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": mimeType,
          "x-upsert": "false",
        },
        body: buf,
      });
      if (resp.ok) {
        return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
      }
    } catch (e: any) {
      console.warn("[evidence] Supabase upload failed, falling back to inline:", e.message);
    }
  }
  // Fallback: data URL stored in DB (max ~4MB safe with PostgreSQL)
  return `data:${mimeType};base64,${fileBase64}`;
}

async function ensureTable() {
  await db.query(`
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
  `);
}

// GET /evidence
router.get("/", requireAuth, async (req, res) => {
  try {
    await ensureTable();
    const { supplier_id, type } = req.query;
    let q = `SELECT e.id, e.type, e.title, e.description, e.file_name, e.file_size, e.mime_type,
                    e.lksg_ref, e.created_at, e.supplier_id, e.action_id, e.complaint_id,
                    s.name AS supplier_name
             FROM evidence e
             LEFT JOIN suppliers s ON s.id = e.supplier_id
             WHERE e.company_id = $1`;
    const params: any[] = [req.auth!.companyId];
    if (supplier_id) { params.push(supplier_id); q += ` AND e.supplier_id=$${params.length}`; }
    if (type)        { params.push(type);        q += ` AND e.type=$${params.length}`; }
    q += " ORDER BY e.created_at DESC LIMIT 200";
    const { rows } = await db.query(q, params);
    res.json(rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /evidence/:id/download -- returns file_url (includes inline data or Supabase URL)
router.get("/:id/download", requireAuth, async (req, res) => {
  try {
    await ensureTable();
    const r = await db.query(
      "SELECT file_url, file_name, mime_type FROM evidence WHERE id=$1 AND company_id=$2",
      [req.params.id, req.auth!.companyId]
    );
    if (!r.rows.length) return res.status(404).json({ error: "Not found" });
    const { file_url, file_name, mime_type } = r.rows[0];
    if (!file_url) return res.status(404).json({ error: "No file" });

    // Redirect for Supabase URLs
    if (file_url.startsWith("https://")) {
      return res.redirect(file_url);
    }
    // Inline base64
    if (file_url.startsWith("data:")) {
      const [header, b64] = file_url.split(",");
      const buf = Buffer.from(b64, "base64");
      res.setHeader("Content-Type", mime_type || "application/octet-stream");
      res.setHeader("Content-Disposition", `inline; filename="${file_name || "file"}"`);
      return res.send(buf);
    }
    res.json({ url: file_url });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /evidence -- create with optional file upload
router.post("/", requireAuth, async (req, res) => {
  try {
    await ensureTable();
    const companyId = req.auth!.companyId;
    const { supplier_id, action_id, complaint_id, type, title, description, lksg_ref, created_by } = req.body;

    if (!title?.trim()) return res.status(400).json({ error: "title required" });

    let fileUrl: string | null = null;
    let fileName: string | null = req.body.file_name || null;
    let fileSize: number | null = req.body.file_size || null;
    let mimeType: string | null = req.body.mime_type || null;

    // Handle base64 file upload
    if (req.body.file_data && fileName) {
      fileUrl  = await storeFile(companyId, req.body.file_data, fileName, mimeType || "application/octet-stream");
    } else if (req.body.file_url) {
      fileUrl = req.body.file_url;
    }

    const { rows } = await db.query(
      `INSERT INTO evidence (company_id, supplier_id, action_id, complaint_id, type, title,
                             description, file_url, file_name, file_size, mime_type, lksg_ref, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id, type, title, file_name, file_size, lksg_ref, created_at`,
      [companyId, supplier_id || null, action_id || null, complaint_id || null,
       type || "other", title.trim(), description || null,
       fileUrl, fileName, fileSize, mimeType, lksg_ref || null, created_by || null]
    );
    res.json(rows[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// DELETE /evidence/:id -- §10 LkSG: 7-year retention for compliance docs
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await ensureTable();
    const r = await db.query(
      "SELECT created_at, type, lksg_ref FROM evidence WHERE id=$1 AND company_id=$2",
      [req.params.id, req.auth!.companyId]
    );
    if (!r.rows.length) return res.status(404).json({ error: "Not found" });

    const ev = r.rows[0];
    // §10 Abs.1 LkSG: Audit reports, CoC, and evidence with LkSG reference must be kept 7 years
    const isCompliance = ev.lksg_ref || ["audit_report","coc_signed","saq_response","cap_document"].includes(ev.type);
    if (isCompliance) {
      const ageYears = (Date.now() - new Date(ev.created_at).getTime()) / (365.25 * 24 * 3600 * 1000);
      if (ageYears < 7) {
        return res.status(403).json({
          error: `§10 Abs.1 LkSG: Compliance-Nachweise muessen 7 Jahre aufbewahrt werden. Loeschung ab ${new Date(new Date(ev.created_at).getTime() + 7*365.25*24*3600*1000).toLocaleDateString("de-DE")} moeglich.`
        });
      }
    }

    await db.query("DELETE FROM evidence WHERE id=$1 AND company_id=$2", [req.params.id, req.auth!.companyId]);
    res.json({ ok: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /evidence/stats
router.get("/stats", requireAuth, async (req, res) => {
  try {
    await ensureTable();
    const { rows } = await db.query(
      "SELECT type, COUNT(*) AS count FROM evidence WHERE company_id=$1 GROUP BY type ORDER BY count DESC",
      [req.auth!.companyId]
    );
    res.json(rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
