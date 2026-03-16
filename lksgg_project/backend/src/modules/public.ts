import { Router } from "express";
import { db } from "../lib/db";
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

// GET /public/company/:slug -- minimal public info for complaints portal
router.get("/company/:slug", async (req, res) => {
  try {
    const c = await db.query("SELECT id,name,slug FROM companies WHERE slug=$1", [req.params.slug]);
    if (!c.rows.length) return res.status(404).json({ error: "Company not found" });

    const company = c.rows[0];
    const suppliers = await db.query(
      "SELECT id,name,country,industry FROM suppliers WHERE company_id=$1 ORDER BY name ASC",
      [company.id]
    );
    res.json({ company, suppliers: suppliers.rows });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// In-memory spam protection: max 3 complaints per IP per hour
const complaintRateLimiter = new Map<string, { count: number; resetAt: number }>();

// POST /public/complaints/:slug -- anonymous complaint submission
router.post("/complaints/:slug", async (req, res) => {
  try {
    // Rate limit: 3 per IP per hour
    const ip = String(req.ip || req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
    const now = Date.now();
    const rec = complaintRateLimiter.get(ip);
    if (rec && rec.resetAt > now && rec.count >= 3) {
      return res.status(429).json({ error: "Zu viele Einreichungen. Bitte spaeter erneut versuchen." });
    }
    if (!rec || rec.resetAt <= now) {
      complaintRateLimiter.set(ip, { count: 1, resetAt: now + 3600000 });
    } else {
      rec.count++;
    }

    const slug = req.params.slug;
    const c = await db.query("SELECT id,name,slug FROM companies WHERE slug=$1", [slug]);
    if (!c.rows.length) return res.status(404).json({ error: "Company not found" });

    const companyId   = c.rows[0].id as string;
    const companyName = c.rows[0].name as string;

    const supplierId      = optionalString(req.body.supplierId);
    const supplierNameRaw = optionalString(req.body.supplierName);
    const category        = requireString(req.body.category ?? "human_rights", "category");
    const description     = requireString(req.body.description, "description");
    const reporterContact = optionalString(req.body.reporterContact);
    const refNumber       = makeRefNumber();
    const severity        = ["low","medium","high","critical"].includes(req.body.severity) ? req.body.severity : "medium";

    // Supplier snapshot
    let supplierNameSnapshot: string | null = null;
    let supplierCountrySnapshot: string | null = null;

    if (supplierId) {
      const s = await db.query(
        "SELECT name,country FROM suppliers WHERE id=$1 AND company_id=$2",
        [supplierId, companyId]
      );
      if (!s.rows.length) return res.status(400).json({ error: "Invalid supplierId" });
      supplierNameSnapshot  = s.rows[0].name;
      supplierCountrySnapshot = s.rows[0].country;
    } else if (supplierNameRaw) {
      supplierNameSnapshot = supplierNameRaw;
    }

    const feedbackDueAt = new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(); // 90 days = HinSchG §16 + LkSG §8 Abs.5
    const r = await db.query(
      `INSERT INTO complaints(company_id, supplier_id, supplier_name, category, description,
                              status, severity, is_anonymous, contact_info, reference_number,
                              feedback_due_at, source)
       VALUES($1,$2,$3,$4,$5,'open',$6,true,$7,$8,$9,'public')
       RETURNING id, reference_number, created_at`,
      [companyId, supplierId ?? null, supplierNameSnapshot, category, description,
       severity, reporterContact ?? null, refNumber, feedbackDueAt]
    );

    const complaint = r.rows[0];

    // Notify admin (fire-and-forget)
    (async () => {
      try {
        const u = await db.query(
          "SELECT email FROM users WHERE company_id=$1 AND role='admin' LIMIT 1",
          [companyId]
        );
        if (u.rows.length) {
          await sendEmail(
            u.rows[0].email,
            `[LkSGCompass] Neue Beschwerde (extern): ${refNumber} -- ${categoryLabel(category)}`,
            complaintNotificationHtml({
              companyName,
              refNumber,
              category: categoryLabel(category),
              description: description.substring(0, 500) + (description.length > 500 ? "..." : ""),
              severity,
              supplierName: supplierNameSnapshot || undefined,
              isAnonymous: true,
              portalUrl: `${PORTAL}/app`,
            })
          );
        }
      } catch {}

      // §8 Abs.5 LkSG: Send acknowledgment to non-anonymous complainants
      // (only if contact email provided)
      if (reporterContact && reporterContact.includes("@")) {
        try {
          await sendEmail(
            reporterContact,
            `[LkSGCompass] Eingangsbestaetigung Beschwerde ${refNumber}`,
            `<h2 style="margin:0 0 8px">Ihre Beschwerde ist eingegangen</h2>
<p style="color:#6B7280;font-size:14px;margin:0 0 20px">Gemaess <strong>§8 Abs.5 LkSG</strong> bestaetigen wir den Eingang Ihrer Meldung.</p>
<div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:14px;margin-bottom:20px">
  <strong>Referenznummer: ${refNumber}</strong><br>
  <span style="color:#6B7280;font-size:13px">Eingegangen: ${new Date().toLocaleDateString("de-DE")}</span>
</div>
<p style="font-size:13px;color:#374151">
  Wir werden Ihre Beschwerde pruefen und Sie innerhalb von <strong>90 Tagen</strong> ueber das Ergebnis informieren.
  Gemaess §8 Abs.5 LkSG sind Sie als Hinweisgeber/-in vor Benachteiligungen gesetzlich geschuetzt.
</p>
<p style="font-size:12px;color:#9CA3AF">
  Bitte bewahren Sie diese Referenznummer auf. Sie benoetigen sie fuer Rueckfragen.
</p>`
          );
          // Mark acknowledged
          await db.query(
            "UPDATE complaints SET acknowledged_at=now() WHERE id=$1",
            [complaint.id]
          ).catch(() => {});
        } catch {}
      }
    })();

    res.json({ ok: true, id: complaint.id, reference_number: complaint.reference_number, created_at: complaint.created_at });
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "Create public complaint failed" });
  }
});

export default router;
