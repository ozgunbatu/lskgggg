/**
 * Team / Multi-user — Invite, roles, membership
 */
import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import { requireString, optionalString } from "../lib/validate";
import { sendEmail } from "../lib/email";
import jwt from "jsonwebtoken";

const router = Router();
const APP_URL = process.env.PUBLIC_APP_URL || "https://lksgcompass.de";

async function ensureTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS team_members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      status TEXT NOT NULL DEFAULT 'active',
      invited_by TEXT,
      invite_token TEXT UNIQUE,
      invite_expires_at TIMESTAMPTZ,
      joined_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(company_id, email)
    );
    CREATE INDEX IF NOT EXISTS idx_team_company ON team_members(company_id);
    CREATE INDEX IF NOT EXISTS idx_team_token ON team_members(invite_token);
  `);
}

// GET /team — list team members
router.get("/", requireAuth, async (req, res) => {
  try {
    await ensureTables();
    const { companyId } = req.auth!;
    const r = await db.query(
      `SELECT tm.id, tm.email, tm.role, tm.status, tm.joined_at, tm.created_at,
              u.id AS user_id
       FROM team_members tm
       LEFT JOIN users u ON u.id = tm.user_id
       WHERE tm.company_id = $1
       ORDER BY tm.created_at ASC`,
      [companyId]
    );
    // Also include the owner (admin user)
    const owner = await db.query(
      "SELECT id, email, role FROM users WHERE company_id=$1 AND role='admin' LIMIT 1",
      [companyId]
    );
    res.json({ members: r.rows, owner: owner.rows[0] || null });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /team/invite — invite a new team member
router.post("/invite", requireAuth, async (req, res) => {
  try {
    await ensureTables();
    const { companyId, email: inviterEmail, role: inviterRole } = req.auth!;
    if (inviterRole !== "admin") return res.status(403).json({ error: "Only admins can invite members." });

    const inviteeEmail = requireString(req.body.email, "email").toLowerCase();
    const inviteeRole = ["member", "viewer"].includes(req.body.role) ? req.body.role : "member";

    // Check not already member
    const existing = await db.query(
      "SELECT id, status FROM team_members WHERE company_id=$1 AND email=$2",
      [companyId, inviteeEmail]
    );
    if (existing.rows.length && existing.rows[0].status === "active") {
      return res.status(400).json({ error: "This person is already a team member." });
    }

    // Also check they're not the account owner
    const ownerCheck = await db.query("SELECT id FROM users WHERE company_id=$1 AND email=$2", [companyId, inviteeEmail]);
    if (ownerCheck.rows.length) return res.status(400).json({ error: "This person already has an account in this workspace." });

    const co = await db.query("SELECT name FROM companies WHERE id=$1", [companyId]);
    const companyName = co.rows[0]?.name || "the team";

    const inviteToken = jwt.sign(
      { companyId, email: inviteeEmail, role: inviteeRole, type: "invite" },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const inviteUrl = `${APP_URL}/register?invite=${inviteToken}`;

    await db.query(
      `INSERT INTO team_members(company_id, email, role, status, invited_by, invite_token, invite_expires_at)
       VALUES($1,$2,$3,'invited',$4,$5,$6)
       ON CONFLICT(company_id, email) DO UPDATE SET
         role=$3, status='invited', invited_by=$4, invite_token=$5, invite_expires_at=$6, updated_at=now()`,
      [companyId, inviteeEmail, inviteeRole, inviterEmail, inviteToken, expiresAt]
    );

    // Send invite email
    await sendEmail(
      inviteeEmail,
      `Einladung zu ${companyName} auf LkSGCompass`,
      `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:40px auto">
          <div style="background:#1B3D2B;padding:28px;border-radius:12px 12px 0 0;text-align:center">
            <div style="font-size:20px;font-weight:800;color:#fff">LkSGCompass</div>
          </div>
          <div style="background:#fff;border:1px solid #e6e6e6;border-top:none;padding:32px;border-radius:0 0 12px 12px">
            <h2 style="margin:0 0 12px;font-size:20px">Sie wurden eingeladen</h2>
            <p style="color:#6b7280;margin:0 0 20px;line-height:1.6">
              <strong>${inviterEmail}</strong> hat Sie eingeladen, dem Workspace von
              <strong>${companyName}</strong> auf LkSGCompass beizutreten.
            </p>
            <a href="${inviteUrl}" style="display:inline-block;background:#1B3D2B;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">
              Einladung annehmen →
            </a>
            <p style="margin:20px 0 0;font-size:12px;color:#9ca3af">
              Link gültig für 7 Tage. Falls Sie diese Einladung nicht erwartet haben, können Sie diese E-Mail ignorieren.
            </p>
          </div>
        </div>
      `
    ).catch(() => {}); // fire-and-forget

    res.json({ ok: true, inviteUrl, expiresAt });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

// GET /team/accept/:token — accept invite (used in register flow)
router.get("/accept/:token", async (req, res) => {
  try {
    await ensureTables();
    const { token } = req.params;
    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    } catch {
      return res.status(400).json({ error: "Einladungslink ungültig oder abgelaufen." });
    }
    if (payload.type !== "invite") return res.status(400).json({ error: "Invalid token type." });

    const tm = await db.query(
      "SELECT * FROM team_members WHERE invite_token=$1",
      [token]
    );
    if (!tm.rows.length) return res.status(404).json({ error: "Einladung nicht gefunden." });

    const co = await db.query("SELECT name FROM companies WHERE id=$1", [payload.companyId]);
    res.json({
      valid: true,
      email: payload.email,
      role: payload.role,
      companyId: payload.companyId,
      companyName: co.rows[0]?.name || "",
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// DELETE /team/:id — remove member (admin only)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await ensureTables();
    const { companyId, role } = req.auth!;
    if (role !== "admin") return res.status(403).json({ error: "Only admins can remove members." });

    await db.query(
      "DELETE FROM team_members WHERE id=$1 AND company_id=$2",
      [req.params.id, companyId]
    );

    // Also remove user access if they have an account
    const tm = await db.query("SELECT user_id FROM team_members WHERE id=$1", [req.params.id]).catch(() => ({ rows: [] }));
    if (tm.rows[0]?.user_id) {
      await db.query(
        "DELETE FROM users WHERE id=$1 AND company_id=$2 AND role != 'admin'",
        [tm.rows[0].user_id, companyId]
      );
    }

    res.json({ ok: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// PATCH /team/:id/role — change member role (admin only)
router.patch("/:id/role", requireAuth, async (req, res) => {
  try {
    await ensureTables();
    const { companyId, role } = req.auth!;
    if (role !== "admin") return res.status(403).json({ error: "Only admins can change roles." });
    const newRole = requireString(req.body.role, "role");
    if (!["member", "viewer"].includes(newRole)) return res.status(400).json({ error: "Invalid role." });

    await db.query(
      "UPDATE team_members SET role=$1, updated_at=now() WHERE id=$2 AND company_id=$3",
      [newRole, req.params.id, companyId]
    );
    res.json({ ok: true });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

export default router;
