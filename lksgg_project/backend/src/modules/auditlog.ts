/**
 * Audit Log -- §10 LkSG "Wer hat was wann geaendert"
 * Immutable event trail for BAFA compliance verification
 */
import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../middleware/auth";

const router = Router();

export async function ensureAuditTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      user_email   TEXT,
      action       TEXT NOT NULL,
      entity_type  TEXT NOT NULL,
      entity_id    TEXT,
      entity_name  TEXT,
      old_value    JSONB,
      new_value    JSONB,
      ip_address   TEXT,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_audit_company ON audit_log(company_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_entity  ON audit_log(entity_type, entity_id);
  `);
}

export async function logAudit(params: {
  companyId: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress?: string;
}) {
  try {
    await ensureAuditTable();
    await db.query(
      `INSERT INTO audit_log(company_id, user_email, action, entity_type, entity_id, entity_name, old_value, new_value, ip_address)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        params.companyId,
        params.userEmail || null,
        params.action,
        params.entityType,
        params.entityId || null,
        params.entityName || null,
        params.oldValue ? JSON.stringify(params.oldValue) : null,
        params.newValue ? JSON.stringify(params.newValue) : null,
        params.ipAddress || null,
      ]
    );
  } catch (e) {
    console.warn("[auditlog] Failed to write:", (e as any)?.message);
  }
}

// GET /audit -- list with filters
router.get("/", requireAuth, async (req, res) => {
  try {
    await ensureAuditTable();
    const { entity_type, entity_id, limit = "100", offset = "0" } = req.query;
    let q = `SELECT * FROM audit_log WHERE company_id=$1`;
    const params: any[] = [req.auth!.companyId];
    if (entity_type) { params.push(entity_type); q += ` AND entity_type=$${params.length}`; }
    if (entity_id)   { params.push(entity_id);   q += ` AND entity_id=$${params.length}`; }
    q += ` ORDER BY created_at DESC LIMIT ${Math.min(Number(limit)||100, 500)} OFFSET ${Number(offset)||0}`;
    const { rows } = await db.query(q, params);
    res.json(rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /audit/stats
router.get("/stats", requireAuth, async (req, res) => {
  try {
    await ensureAuditTable();
    const { rows } = await db.query(
      `SELECT entity_type, action, COUNT(*) as count
       FROM audit_log WHERE company_id=$1 AND created_at > now() - interval '30 days'
       GROUP BY entity_type, action ORDER BY count DESC LIMIT 20`,
      [req.auth!.companyId]
    );
    res.json(rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
