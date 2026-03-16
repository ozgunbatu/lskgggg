import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../lib/db";
import { requireString } from "../lib/validate";
import { sendEmail } from "../lib/email";

const router = Router();

// -- Helpers -------------------------------------------------------------------

function getTokenFromReq(req: any) {
  const header = String(req.headers.authorization || "");
  if (header.startsWith("Bearer ")) return header.slice(7);
  const cookie = String(req.headers.cookie || "");
  const match = cookie.match(/(?:^|; )lksg_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!) as any;
}

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

async function uniqueCompanySlug(base: string) {
  let slug = base || "company";
  for (let i = 0; i < 1000; i++) {
    const candidate = i === 0 ? slug : `${slug}-${i}`;
    const exists = await db.query("SELECT 1 FROM companies WHERE slug=$1", [candidate]);
    if (!exists.rows.length) return candidate;
  }
  return `${slug}-${Date.now()}`;
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function makeToken(userId: string, companyId: string, role: string, email?: string) {
  return jwt.sign(
    { userId, companyId, role, email },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );
}

async function createAccount(email: string, passwordHash: string, companyName: string) {
  const slugBase = slugify(companyName);
  const slug = await uniqueCompanySlug(slugBase);
  const c = await db.query(
    "INSERT INTO companies(name,slug) VALUES($1,$2) RETURNING id,name,slug",
    [companyName, slug]
  );
  const companyId = c.rows[0].id as string;
  const u = await db.query(
    "INSERT INTO users(company_id,email,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id,email,role,company_id",
    [companyId, email, passwordHash, "admin"]
  );
  return { user: u.rows[0], company: c.rows[0] };
}

async function tryResendEmail(email: string, otp: string, companyName: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.length < 10 || key === "re_test" || key.includes("xxxx")) return false;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(key);
    const from = process.env.RESEND_FROM || "LkSGCompass <noreply@lksgcompass.de>";
    await resend.emails.send({
      from,
      to: email,
      subject: `Ihr Bestaetigungscode: ${otp}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:40px auto">
          <div style="background:#1B3D2B;padding:28px;border-radius:12px 12px 0 0;text-align:center">
            <div style="font-size:20px;font-weight:800;color:#fff">LkSGCompass</div>
          </div>
          <div style="background:#fff;border:1px solid #e6e6e6;border-top:none;padding:32px;border-radius:0 0 12px 12px">
            <h2 style="margin:0 0 12px;font-size:20px">Willkommen, ${companyName}!</h2>
            <p style="color:#6b7280;margin:0 0 24px">Ihr Bestaetigungscode:</p>
            <div style="background:#f0f5f1;border:2px solid #d1e7d9;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px">
              <div style="font-size:40px;font-weight:800;color:#1B3D2B;letter-spacing:8px;font-family:monospace">${otp}</div>
              <div style="font-size:12px;color:#9ca3af;margin-top:8px">Gueltig fuer 15 Minuten</div>
            </div>
            <p style="font-size:13px;color:#9ca3af">Falls Sie keine Registrierung beantragt haben, koennen Sie diese E-Mail ignorieren.</p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (e) {
    console.warn("[auth] Resend failed:", (e as any)?.message);
    return false;
  }
}

// -- POST /auth/register -------------------------------------------------------
// Mode A (Resend configured): sends OTP -> returns { requiresOtp: true }
// Mode B (no Resend):          direct registration -> returns { token, user, company }
router.post("/register", async (req, res) => {
  try {
    const companyName = requireString(req.body.companyName, "companyName");
    const email = requireString(req.body.email, "email").toLowerCase();
    const password = requireString(req.body.password, "password");

    if (password.length < 8) {
      return res.status(400).json({ error: "Passwort muss mindestens 8 Zeichen lang sein." });
    }

    const existing = await db.query("SELECT 1 FROM users WHERE email=$1", [email]);
    if (existing.rows.length) {
      return res.status(400).json({ error: "Diese E-Mail-Adresse ist bereits registriert." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Try to send OTP email
    // Handle invite token — skip company creation, join existing company
    const inviteToken = req.body.inviteToken;
    if (inviteToken) {
      try {
        const inv = jwt.verify(inviteToken, process.env.JWT_SECRET!) as any;
        if (inv.type !== "invite" || inv.email !== email) {
          return res.status(400).json({ error: "Einladungstoken ungültig oder E-Mail stimmt nicht überein." });
        }
        // Create user in existing company
        const u = await db.query(
          "INSERT INTO users(company_id,email,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id,email,role,company_id",
          [inv.companyId, email, passwordHash, inv.role || "member"]
        );
        // Mark invite as accepted
        await db.query(
          "UPDATE team_members SET status='active', user_id=$1, joined_at=now(), updated_at=now() WHERE invite_token=$2",
          [u.rows[0].id, inviteToken]
        ).catch(() => {});
        const token = makeToken(u.rows[0].id, inv.companyId, inv.role || "member", email);
        return res.json({ requiresOtp: false, token, user: u.rows[0] });
      } catch (e: any) {
        return res.status(400).json({ error: "Einladungstoken ungültig oder abgelaufen." });
      }
    }

    const emailSent = await tryResendEmail(email, otp, companyName);

    if (emailSent) {
      // Mode A: OTP flow
      await db.query("DELETE FROM pending_registrations WHERE email=$1", [email]);
      await db.query(
        "INSERT INTO pending_registrations(email,company_name,password_hash,otp_code,expires_at) VALUES($1,$2,$3,$4,$5)",
        [email, companyName, passwordHash, otp, expiresAt]
      );
      return res.json({ requiresOtp: true, message: "Code gesendet. Bitte pruefen Sie Ihre E-Mail." });
    } else {
      // Mode B: Direct registration (no email service configured)
      const { user, company } = await createAccount(email, passwordHash, companyName);
      const token = makeToken(user.id, company.id, user.role, email);
      return res.json({ requiresOtp: false, token, user, company });
    }
  } catch (e: any) {
    console.error("[auth] register error:", e?.message);
    if (e?.message?.includes("password authentication") || e?.message?.includes("connection")) {
      return res.status(503).json({ error: "Datenbankfehler. Bitte versuchen Sie es spaeter erneut." });
    }
    res.status(400).json({ error: e.message ?? "Registrierung fehlgeschlagen." });
  }
});

// -- POST /auth/verify-otp -----------------------------------------------------
router.post("/verify-otp", async (req, res) => {
  try {
    const email = requireString(req.body.email, "email").toLowerCase();
    const otp = requireString(req.body.otp, "otp").trim();

    const r = await db.query(
      "SELECT * FROM pending_registrations WHERE email=$1 ORDER BY created_at DESC LIMIT 1",
      [email]
    );
    if (!r.rows.length) {
      return res.status(400).json({ error: "Keine ausstehende Registrierung gefunden." });
    }

    const pending = r.rows[0];
    if (new Date() > new Date(pending.expires_at)) {
      await db.query("DELETE FROM pending_registrations WHERE email=$1", [email]);
      return res.status(400).json({ error: "Code abgelaufen. Bitte neu registrieren." });
    }

    // Brute-force protection: max 5 attempts → 15-minute lockout (no deletion)
    const attempts = (pending.otp_attempts || 0) + 1;
    if (pending.otp_code !== otp) {
      if (attempts >= 5) {
        // Lock: extend expiry by 15 min from now, reset attempts counter
        // User can request new code via /resend-otp after lockout
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        await db.query(
          "UPDATE pending_registrations SET otp_attempts=$1, expires_at=$2 WHERE email=$3",
          [attempts, lockUntil, email]
        );
        return res.status(429).json({
          error: "Zu viele Fehlversuche. Konto gesperrt fuer 15 Minuten. Neuen Code per 'Code erneut senden' anfordern.",
          locked: true,
          unlockAt: lockUntil,
        });
      }
      await db.query("UPDATE pending_registrations SET otp_attempts=$1 WHERE email=$2", [attempts, email]);
      return res.status(400).json({ error: `Ungueltiger Code. Noch ${5 - attempts} Versuche.`, remaining: 5 - attempts });
    }

    const { user, company } = await createAccount(email, pending.password_hash, pending.company_name);
    await db.query("DELETE FROM pending_registrations WHERE email=$1", [email]);

    const token = makeToken(user.id, company.id, user.role, email);
    res.json({ token, user, company });
  } catch (e: any) {
    console.error("[auth] verify-otp error:", e?.message);
    res.status(400).json({ error: e.message ?? "Verifizierung fehlgeschlagen." });
  }
});

// -- POST /auth/resend-otp -----------------------------------------------------
router.post("/resend-otp", async (req, res) => {
  try {
    const email = requireString(req.body.email, "email").toLowerCase();
    const r = await db.query(
      "SELECT * FROM pending_registrations WHERE email=$1 ORDER BY created_at DESC LIMIT 1",
      [email]
    );
    if (!r.rows.length) {
      return res.status(400).json({ error: "Keine ausstehende Registrierung gefunden." });
    }

    const pending = r.rows[0];

    // If locked (5+ attempts AND still within original lockout window), enforce cooldown
    // Cooldown is embedded in expires_at when locked - but resend is always allowed to issue new code
    // We do rate-limit resend itself: only one resend per 60 seconds
    const resendKey = `resend_${email}`;
    const now = Date.now();
    const resendCooldownMap = (global as any).__resendCooldown || ((global as any).__resendCooldown = new Map());
    const lastResend = resendCooldownMap.get(resendKey) || 0;
    if (now - lastResend < 60_000) {
      const secondsLeft = Math.ceil((60_000 - (now - lastResend)) / 1000);
      return res.status(429).json({
        error: `Bitte warten Sie ${secondsLeft} Sekunden bevor Sie einen neuen Code anfordern.`,
        retryAfter: secondsLeft,
      });
    }
    resendCooldownMap.set(resendKey, now);

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    // Reset attempts counter when new code is issued
    await db.query(
      "UPDATE pending_registrations SET otp_code=$1, expires_at=$2, otp_attempts=0 WHERE email=$3",
      [otp, expiresAt, email]
    );
    await tryResendEmail(email, otp, r.rows[0].company_name);
    res.json({ ok: true, message: "Neuer Code gesendet." });
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "Fehler." });
  }
});

// -- POST /auth/login ----------------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    // Rate limiting: 20 attempts per IP per 15 min
    const ip = String(req.ip || req.headers["x-forwarded-for"] || "unknown");
    const checkRL = (req.app as any).checkLoginRateLimit;
    if (checkRL && !checkRL(ip)) {
      return res.status(429).json({ error: "Zu viele Anmeldeversuche. Bitte 15 Minuten warten." });
    }

    const email = requireString(req.body.email, "email").toLowerCase();
    const password = requireString(req.body.password, "password");

    const u = await db.query(
      "SELECT id,email,role,company_id,password_hash FROM users WHERE email=$1",
      [email]
    );
    if (!u.rows.length) return res.status(401).json({ error: "E-Mail oder Passwort ungueltig." });

    const user = u.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "E-Mail oder Passwort ungueltig." });

    const token = makeToken(user.id, user.company_id, user.role, user.email);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, company_id: user.company_id } });
  } catch (e: any) {
    if (e?.message?.includes("password authentication") || e?.message?.includes("connection")) {
      return res.status(503).json({ error: "Datenbankfehler. Bitte versuchen Sie es spaeter erneut." });
    }
    res.status(400).json({ error: e.message ?? "Login fehlgeschlagen." });
  }
});


// -- GET /auth/me --------------------------------------------------------------
router.get("/me", async (req, res) => {
  try {
    const token = getTokenFromReq(req);
    if (!token) return res.status(401).json({ error: "Auth required" });
    const decoded = verifyToken(token);
    const [userRes, companyRes] = await Promise.all([
      db.query("SELECT id,email,role,company_id,created_at FROM users WHERE id=$1", [decoded.userId]),
      db.query("SELECT id,name,slug,created_at FROM companies WHERE id=$1", [decoded.companyId]),
    ]);
    const user = userRes.rows[0];
    const company = companyRes.rows[0];
    if (!user || !company) return res.status(401).json({ error: "Session invalid" });
    res.json({ ok: true, user, company });
  } catch {
    res.status(401).json({ error: "Session invalid" });
  }
});

// -- POST /auth/forgot-password -----------------------------------------------
router.post("/forgot-password", async (req, res) => {
  try {
    const email = requireString(req.body.email, "email").toLowerCase();
    const userRes = await db.query("SELECT id,email FROM users WHERE email=$1 LIMIT 1", [email]);
    if (!userRes.rows.length) return res.json({ ok: true });

    const user = userRes.rows[0];
    const resetToken = jwt.sign({ userId: user.id, email: user.email, scope: "password-reset" }, process.env.JWT_SECRET!, { expiresIn: "60m" });
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.query("DELETE FROM password_reset_tokens WHERE user_id=$1", [user.id]).catch(() => {});
    await db.query(
      "INSERT INTO password_reset_tokens(user_id, token, expires_at) VALUES($1,$2,$3)",
      [user.id, resetToken, expiresAt]
    );

    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://lksgcompass.de";
    const resetUrl = `${appUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(resetToken)}`;
    const sent = await sendEmail(
      email,
      "Passwort zuruecksetzen",
      `
        <h2 style="margin:0 0 10px;font-size:20px;font-weight:800">Passwort zuruecksetzen</h2>
        <p style="color:#6B7280;font-size:14px;line-height:1.6;margin:0 0 20px">Es wurde eine Anfrage zum Zuruecksetzen Ihres LkSGCompass-Passworts gestellt. Der Link ist 60 Minuten gueltig.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#1B3D2B;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:700">Neues Passwort vergeben</a>
        <p style="margin:18px 0 0;font-size:12px;color:#9CA3AF;word-break:break-all">Falls der Button nicht funktioniert, kopieren Sie diesen Link: ${resetUrl}</p>
      `
    );

    if (!sent) console.log(`[auth] Password reset link for ${email}: ${resetUrl}`);
    res.json({ ok: true, preview: sent ? undefined : resetUrl });
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "Fehler." });
  }
});

// -- POST /auth/reset-password -------------------------------------------------
router.post("/reset-password", async (req, res) => {
  try {
    const token = requireString(req.body.token, "token");
    const password = requireString(req.body.password, "password");
    if (password.length < 8) return res.status(400).json({ error: "Passwort muss mindestens 8 Zeichen lang sein." });

    const decoded = verifyToken(token);
    if (decoded.scope !== "password-reset") return res.status(400).json({ error: "Token ungueltig." });

    const tokenRes = await db.query(
      "SELECT * FROM password_reset_tokens WHERE token=$1 AND user_id=$2 AND used_at IS NULL AND expires_at > now() LIMIT 1",
      [token, decoded.userId]
    );
    if (!tokenRes.rows.length) return res.status(400).json({ error: "Reset-Link ist ungueltig oder abgelaufen." });

    const passwordHash = await bcrypt.hash(password, 12);
    await db.query("UPDATE users SET password_hash=$1, updated_at=now() WHERE id=$2", [passwordHash, decoded.userId]);
    await db.query("UPDATE password_reset_tokens SET used_at=now() WHERE token=$1", [token]);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "Reset fehlgeschlagen." });
  }
});


// -- DELETE /auth/account -- DSGVO Art.17: Recht auf Loeschung -----------------
// Soft-delete: anonymizes personal data, retains compliance evidence (§10 LkSG 7-yr)
router.delete("/account", async (req, res) => {
  try {
    const token = getTokenFromReq(req);
    if (!token) return res.status(401).json({ error: "Auth required" });

    const jwt_ = await import("jsonwebtoken");
    const decoded = verifyToken(token);
    const { userId, companyId } = decoded;

    // Re-verify password for safety
    const passwordInput = req.body.password;
    if (!passwordInput) return res.status(400).json({ error: "Passwort erforderlich zur Bestaetigung" });

    const u = await db.query("SELECT password_hash FROM users WHERE id=$1", [userId]);
    if (!u.rows.length) return res.status(404).json({ error: "Account nicht gefunden" });

    const bcrypt_ = await import("bcryptjs");
    const ok = await bcrypt_.default.compare(passwordInput, u.rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: "Passwort falsch. Loeschung abgebrochen." });

    // DSGVO + §10 LkSG: anonymize personal data, retain compliance records
    // 1. Anonymize user
    await db.query(
      "UPDATE users SET email=$1, password_hash='DELETED', updated_at=now() WHERE id=$2",
      [`deleted_${userId}@anonymized`, userId]
    );

    // 2. Anonymize company (keep structure for audit trail)
    await db.query(
      `UPDATE companies SET name=$1, slug=$2, hr_officer_email=null,
       complaints_officer_email=null, updated_at=now() WHERE id=$3`,
      [`Geloeschtes Unternehmen ${companyId.slice(0,8)}`, `deleted-${companyId.slice(0,8)}`, companyId]
    );

    // 3. Anonymize complaints (keep category/status for §10 but remove personal info)
    await db.query(
      "UPDATE complaints SET contact_info=null, description=LEFT(description,20)||'...[geloescht]' WHERE company_id=$1 AND is_anonymous=false",
      [companyId]
    );

    // 4. Remove SAQ tokens + responses (personal supplier data)
    await db.query("UPDATE supplier_saq SET sent_to=null, responses=null WHERE company_id=$1", [companyId]);

    // 5. Log deletion for audit
    await db.query(
      "INSERT INTO audit_log(company_id, user_email, action, entity_type, entity_name) VALUES($1,$2,'GDPR_DELETE','account','DSGVO Art.17 Loeschantrag')",
      [companyId, decoded.email]
    ).catch(() => {});

    res.json({
      ok: true,
      message: "Account anonymisiert (DSGVO Art.17). Compliance-Aufzeichnungen werden gemaess §10 LkSG 7 Jahre aufbewahrt.",
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "Loeschung fehlgeschlagen" });
  }
});

// -- GET /auth/export -- DSGVO Art.20: Datenportabilitaet ----------------------
router.get("/export", async (req, res) => {
  try {
    const token = getTokenFromReq(req);
    if (!token) return res.status(401).json({ error: "Auth required" });

    const jwt_ = await import("jsonwebtoken");
    const decoded = verifyToken(token);
    const { userId, companyId } = decoded;

    const [company, user, suppliers, actions, complaints, saqList, evidence] = await Promise.all([
      db.query("SELECT id,name,slug,size_employees,industry,created_at FROM companies WHERE id=$1", [companyId]),
      db.query("SELECT id,email,role,created_at FROM users WHERE id=$1", [userId]),
      db.query("SELECT * FROM suppliers WHERE company_id=$1", [companyId]),
      db.query("SELECT * FROM action_plans WHERE company_id=$1", [companyId]).catch(() => ({ rows: [] })),
      db.query("SELECT id,category,status,severity,reference_number,created_at FROM complaints WHERE company_id=$1", [companyId]).catch(() => ({ rows: [] })),
      db.query("SELECT id,supplier_name,status,sent_at,completed_at FROM supplier_saq WHERE company_id=$1", [companyId]).catch(() => ({ rows: [] })),
      db.query("SELECT id,type,title,lksg_ref,created_at FROM evidence WHERE company_id=$1", [companyId]).catch(() => ({ rows: [] })),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      exportBasis: "DSGVO Art.20 - Recht auf Datenuebertragbarkeit",
      company: company.rows[0],
      user: user.rows[0],
      suppliers: suppliers.rows,
      actionPlans: (actions as any).rows,
      complaints: (complaints as any).rows,
      saqs: (saqList as any).rows,
      evidence: (evidence as any).rows,
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="lksgcompass_export_${new Date().toISOString().slice(0,10)}.json"`);
    res.json(exportData);
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "Export fehlgeschlagen" });
  }
});

export default router;
