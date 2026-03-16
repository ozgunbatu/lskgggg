/**
 * Shared email helper -- LkSGCompass
 * Uses Resend if RESEND_API_KEY is configured, silently skips otherwise.
 */

const FROM = process.env.RESEND_FROM || "LkSGCompass <noreply@lksgcompass.de>";

function brandWrap(body: string): string {
  return `
<div style="font-family:system-ui,sans-serif;max-width:540px;margin:40px auto;color:#0D1110">
  <div style="background:#1B3D2B;padding:22px 28px;border-radius:12px 12px 0 0;display:flex;align-items:center;gap:12px">
    <span style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-.3px">LkSG<span style="color:rgba(255,255,255,0.45)">Compass</span></span>
  </div>
  <div style="background:#fff;border:1px solid #E5E7E5;border-top:none;padding:32px;border-radius:0 0 12px 12px">
    ${body}
  </div>
  <div style="text-align:center;font-size:11px;color:#9CA3AF;margin-top:16px">
    LkSGCompass &mdash; LkSG Compliance Platform &mdash; <a href="https://lksgcompass.de" style="color:#1B3D2B">lksgcompass.de</a>
  </div>
</div>`;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.length < 10 || key === "re_test" || key.includes("xxxx")) {
    console.log(`[email] No Resend key -- skipping email to ${to}: ${subject}`);
    return false;
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(key);
    await resend.emails.send({ from: FROM, to, subject, html: brandWrap(html) });
    console.log(`[email] Sent to ${to}: ${subject}`);
    return true;
  } catch (e: any) {
    console.warn(`[email] Failed to send to ${to}:`, e?.message);
    return false;
  }
}

// ── Templates ─────────────────────────────────────────────────────────────────

export function complaintNotificationHtml(opts: {
  companyName: string;
  refNumber: string;
  category: string;
  description: string;
  severity: string;
  supplierName?: string;
  isAnonymous: boolean;
  portalUrl: string;
}): string {
  const sevColor = opts.severity === "critical" || opts.severity === "high" ? "#DC2626" : opts.severity === "medium" ? "#D97706" : "#16A34A";
  return `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:800">Neue Beschwerde eingegangen</h2>
    <p style="color:#6B7280;margin:0 0 24px;font-size:14px">Eine neue Beschwerde wurde uber das LkSG-Portal von <strong>${opts.companyName}</strong> eingereicht.</p>

    <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:16px;margin-bottom:20px">
      <div style="font-size:11px;font-weight:700;color:#991B1B;text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px">Referenznummer</div>
      <div style="font-size:22px;font-weight:800;color:#991B1B;letter-spacing:2px;font-family:monospace">${opts.refNumber}</div>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:13.5px;margin-bottom:20px">
      <tr><td style="padding:8px 12px;background:#F9FAFB;font-weight:700;width:140px;border:1px solid #E5E7E5">Kategorie</td><td style="padding:8px 12px;border:1px solid #E5E7E5">${opts.category}</td></tr>
      <tr><td style="padding:8px 12px;background:#F9FAFB;font-weight:700;border:1px solid #E5E7E5">Schweregrad</td><td style="padding:8px 12px;border:1px solid #E5E7E5"><span style="color:${sevColor};font-weight:700">${opts.severity.toUpperCase()}</span></td></tr>
      ${opts.supplierName ? `<tr><td style="padding:8px 12px;background:#F9FAFB;font-weight:700;border:1px solid #E5E7E5">Lieferant</td><td style="padding:8px 12px;border:1px solid #E5E7E5">${opts.supplierName}</td></tr>` : ""}
      <tr><td style="padding:8px 12px;background:#F9FAFB;font-weight:700;border:1px solid #E5E7E5">Anonym</td><td style="padding:8px 12px;border:1px solid #E5E7E5">${opts.isAnonymous ? "Ja" : "Nein"}</td></tr>
    </table>

    <div style="background:#F9FAFB;border:1px solid #E5E7E5;border-radius:8px;padding:16px;margin-bottom:24px">
      <div style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;margin-bottom:8px">Sachverhalt</div>
      <div style="font-size:13.5px;line-height:1.65">${opts.description}</div>
    </div>

    <div style="background:#f0f5f1;border:1px solid #d1e7d9;border-radius:8px;padding:14px;margin-bottom:20px;font-size:12.5px;color:#1B3D2B;line-height:1.5">
      <strong>§8 Abs. 5 LkSG:</strong> Sie sind verpflichtet, dem Beschwerdefuhrer innerhalb von 3 Werktagen den Eingang zu bestatigen und den weiteren Bearbeitungsstand mitzuteilen.
    </div>

    <a href="${opts.portalUrl}" style="display:inline-block;background:#1B3D2B;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
      Beschwerde im Dashboard offnen &rarr;
    </a>`;
}

export function capCreatedHtml(opts: {
  companyName: string;
  supplierName: string;
  title: string;
  dueDate: string;
  priority: string;
  lksgParagraph: string;
  dashboardUrl: string;
}): string {
  return `
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:800">Neuer Corrective Action Plan</h2>
    <p style="color:#6B7280;margin:0 0 24px;font-size:14px">Ein CAP nach §${opts.lksgParagraph} LkSG wurde fur <strong>${opts.supplierName}</strong> erstellt.</p>

    <table style="width:100%;border-collapse:collapse;font-size:13.5px;margin-bottom:20px">
      <tr><td style="padding:8px 12px;background:#F9FAFB;font-weight:700;width:140px;border:1px solid #E5E7E5">Massnahme</td><td style="padding:8px 12px;border:1px solid #E5E7E5"><strong>${opts.title}</strong></td></tr>
      <tr><td style="padding:8px 12px;background:#F9FAFB;font-weight:700;border:1px solid #E5E7E5">Falligkeitsdatum</td><td style="padding:8px 12px;border:1px solid #E5E7E5">${opts.dueDate}</td></tr>
      <tr><td style="padding:8px 12px;background:#F9FAFB;font-weight:700;border:1px solid #E5E7E5">Prioritat</td><td style="padding:8px 12px;border:1px solid #E5E7E5">${opts.priority.toUpperCase()}</td></tr>
      <tr><td style="padding:8px 12px;background:#F9FAFB;font-weight:700;border:1px solid #E5E7E5">LkSG-Bezug</td><td style="padding:8px 12px;border:1px solid #E5E7E5">§${opts.lksgParagraph}</td></tr>
    </table>

    <a href="${opts.dashboardUrl}" style="display:inline-block;background:#1B3D2B;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
      CAP im Dashboard anzeigen &rarr;
    </a>`;
}
