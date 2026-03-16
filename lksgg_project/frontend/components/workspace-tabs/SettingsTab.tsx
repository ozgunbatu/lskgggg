"use client";
import { useEffect, useState } from "react";
import { API } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Props = {
  L: string;
  company: any;
  apiFn: (path: string, init?: RequestInit) => Promise<any>;
  toastFn: (type: "ok" | "err" | "info", msg: string) => void;
};

type TabKey = "company" | "team" | "billing" | "legal";

export default function SettingsTab({ L, company, apiFn, toastFn }: Props) {
  const [tab, setTab] = useState<TabKey>("company");
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [health, setHealth] = useState<any>(null);
  // Team
  const [members, setMembers] = useState<any[]>([]);
  const [owner, setOwner] = useState<any>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  // Billing
  const [billing, setBilling] = useState<any>(null);
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    apiFn("/companies/me").then((d: any) => setForm(d || {})).catch(() => {});
    fetch("/api/health")
      .then(r => r.json()).then(setHealth).catch(() => {});
  }, [apiFn]);

  useEffect(() => {
    if (tab === "team") loadTeam();
    if (tab === "billing") loadBilling();
  }, [tab]);

  async function loadTeam() {
    try { const d = await apiFn("/team"); setMembers(d.members || []); setOwner(d.owner); } catch {}
  }
  async function loadBilling() {
    try { const d = await apiFn("/billing/status"); setBilling(d); } catch {}
  }

  async function save() {
    setSaving(true);
    try {
      await apiFn("/companies/me", { method: "PUT", body: JSON.stringify(form) });
      toastFn("ok", L === "de" ? "Gespeichert" : "Saved");
    } catch (e: any) { toastFn("err", e.message); }
    setSaving(false);
  }

  async function invite() {
    if (!inviteEmail.trim()) return toastFn("err", "E-Mail erforderlich");
    setInviting(true); setInviteLink("");
    try {
      const d = await apiFn("/team/invite", { method: "POST", body: JSON.stringify({ email: inviteEmail, role: inviteRole }) });
      toastFn("ok", L === "de" ? `Einladung an ${inviteEmail} gesendet` : `Invite sent to ${inviteEmail}`);
      setInviteLink(d.inviteUrl || "");
      setInviteEmail("");
      loadTeam();
    } catch (e: any) { toastFn("err", e.message); }
    setInviting(false);
  }

  async function removeMember(id: string) {
    if (!confirm(L === "de" ? "Mitglied entfernen?" : "Remove member?")) return;
    try {
      await apiFn(`/team/${id}`, { method: "DELETE" });
      toastFn("ok", L === "de" ? "Entfernt" : "Removed");
      loadTeam();
    } catch (e: any) { toastFn("err", e.message); }
  }

  async function startCheckout(plan: string) {
    setBillingLoading(true);
    try {
      const d = await apiFn("/billing/create-checkout", { method: "POST", body: JSON.stringify({ plan }) });
      if (d.url) window.location.href = d.url;
      else toastFn("err", d.error || "Checkout failed");
    } catch (e: any) { toastFn("err", e.message); }
    setBillingLoading(false);
  }

  async function openPortal() {
    setBillingLoading(true);
    try {
      const d = await apiFn("/billing/portal", { method: "POST" });
      if (d.url) window.location.href = d.url;
    } catch (e: any) { toastFn("err", e.message); }
    setBillingLoading(false);
  }

  async function markBAFASubmitted() {
    const year = new Date().getFullYear();
    const url = window.prompt(L === "de" ? "Öffentlicher URL des Berichts (optional):" : "Public URL of report (optional):", form?.bafa_report_public_url || "");
    if (url === null) return;
    try {
      await apiFn("/companies/bafa-submit", { method: "POST", body: JSON.stringify({ year, publicUrl: url }) });
      setForm((f: any) => ({ ...f, bafa_submitted_at: new Date().toISOString(), bafa_submission_year: year, bafa_report_public_url: url }));
      toastFn("ok", L === "de" ? `BAFA-Einreichung ${year} dokumentiert` : `BAFA submission ${year} documented`);
    } catch (e: any) { toastFn("err", e.message); }
  }

  if (!form) return <div className="card" style={{ padding: 40, textAlign: "center" }}><span className="spin" /></div>;

  function Inp({ k, label, type = "text", required = false, help = "" }: any) {
    return (
      <div className="fl" style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 5 }}>{label}{required && <span style={{ color: "#DC2626", marginLeft: 2 }}>*</span>}</label>
        <input className="inp" type={type} value={form[k] || ""} onChange={e => setForm((f: any) => ({ ...f, [k]: e.target.value }))} />
        {help && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}>{help}</div>}
      </div>
    );
  }

  const tabStyle = (t: TabKey) => ({
    padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
    background: tab === t ? "#1B3D2B" : "transparent",
    color: tab === t ? "#fff" : "#6B7280",
    transition: "all .15s",
  });

  const planColor = { free: "#6B7280", pro: "#1B3D2B", enterprise: "#7C3AED" }[billing?.plan || "free"] || "#6B7280";
  const planLabel = { free: "Free", pro: "Pro", enterprise: "Enterprise" }[billing?.plan || "free"] || "Free";

  return (
    <>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, padding: "4px", background: "#F3F4F6", borderRadius: 10, width: "fit-content" }}>
        {(["company", "team", "billing", "legal"] as TabKey[]).map(t => (
          <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
            {{ company: L === "de" ? "Unternehmen" : "Company", team: "Team", billing: "Billing", legal: "Legal" }[t]}
          </button>
        ))}
      </div>

      {tab === "company" && (
        <div style={{ display: "grid", gap: 16 }}>
          <div className="card">
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>§4 Abs.3 LkSG — Menschenrechtsbeauftragter</div>
            {!form.hr_officer_name && <div className="al al-warn" style={{ marginBottom: 10, padding: "7px 12px", fontSize: 12.5 }}><span className="al-icon">!</span> Pflichtfeld</div>}
            <Inp k="hr_officer_name" label={L === "de" ? "Name" : "Name"} required />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Inp k="hr_officer_email" label="E-Mail" type="email" />
              <Inp k="hr_officer_phone" label={L === "de" ? "Telefon" : "Phone"} type="tel" />
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>§8 Abs.4 LkSG — Beschwerdebeauftragter</div>
            <Inp k="complaints_officer_name" label={L === "de" ? "Name" : "Name"} />
            <Inp k="complaints_officer_email" label="E-Mail" type="email" help="Empfängt Beschwerde-Alerts." />
          </div>

          <div className="card">
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>{L === "de" ? "Unternehmensprofil" : "Company Profile"}</div>
            <Inp k="name" label={L === "de" ? "Unternehmensname" : "Company name"} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div className="fl">
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 5 }}>{L === "de" ? "Mitarbeiterzahl" : "Employees"}</label>
                <input className="inp" type="number" value={form.size_employees || ""} onChange={e => setForm((f: any) => ({ ...f, size_employees: parseInt(e.target.value) || null }))} />
                {form.size_employees && form.size_employees < 1000 && <div style={{ fontSize: 11, color: "#D97706", marginTop: 2 }}>⚠ LkSG gilt ab 1.000 MA</div>}
              </div>
              <Inp k="industry" label={L === "de" ? "Branche" : "Industry"} />
            </div>

            <div className="card" style={{ marginTop: 14, background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>BAFA-Einreichung</div>
              {form.bafa_submitted_at ? (
                <div style={{ fontSize: 13, color: "#16A34A" }}>✓ {form.bafa_submission_year} eingereicht am {new Date(form.bafa_submitted_at).toLocaleDateString("de-DE")}</div>
              ) : (
                <div style={{ fontSize: 13, color: "#6B7280" }}>{L === "de" ? "Noch nicht eingereicht." : "Not yet submitted."}</div>
              )}
              <button className="btn btn-sm" style={{ marginTop: 8 }} onClick={markBAFASubmitted}>
                {L === "de" ? "Einreichung dokumentieren" : "Document submission"}
              </button>
            </div>
          </div>

          {health && (
            <div className="card">
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>{L === "de" ? "System-Status" : "System status"}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { label: "Version", value: health.version || "—", color: "#1B3D2B" },
                  { label: "Database", value: health.db === "ok" ? "✓ OK" : "✗ Down", bg: health.db === "ok" ? "#F0FDF4" : "#FEF2F2", color: health.db === "ok" ? "#16A34A" : "#DC2626" },
                  { label: "Uptime", value: health.uptimeSec != null ? (health.uptimeSec < 3600 ? `${Math.round(health.uptimeSec / 60)}m` : `${Math.round(health.uptimeSec / 3600)}h`) : "—" },
                ].map(item => (
                  <div key={item.label} style={{ padding: "10px 14px", background: (item as any).bg || "#F9FAFB", borderRadius: 8, border: "1px solid #E5E7EB" }}>
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: item.color || "#374151" }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-p" onClick={save} disabled={saving}>{saving ? <span className="spin" /> : "✓"} {L === "de" ? "Speichern" : "Save"}</button>
          </div>
        </div>
      )}

      {tab === "team" && (
        <div style={{ display: "grid", gap: 16 }}>
          <div className="card">
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>{L === "de" ? "Mitglied einladen" : "Invite member"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10, alignItems: "end" }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 5 }}>E-Mail</label>
                <input className="inp" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="kollegin@firma.de" onKeyDown={e => e.key === "Enter" && invite()} />
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 5 }}>{L === "de" ? "Rolle" : "Role"}</label>
                <select className="inp" value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ width: "auto" }}>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <button className="btn btn-p" onClick={invite} disabled={inviting}>{inviting ? <span className="spin" /> : L === "de" ? "Einladen" : "Invite"}</button>
            </div>
            {inviteLink && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, fontSize: 12.5 }}>
                <strong>Einladungslink:</strong>{" "}
                <a href={inviteLink} style={{ color: "#1B3D2B", wordBreak: "break-all" }}>{inviteLink}</a>
                <button style={{ marginLeft: 8, fontSize: 12, background: "none", border: "none", cursor: "pointer", color: "#1B3D2B", fontWeight: 700 }} onClick={() => { navigator.clipboard.writeText(inviteLink); toastFn("ok", "Kopiert!"); }}>Kopieren</button>
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>
              {L === "de" ? "Team-Mitglieder" : "Team members"}
              <span className="mini" style={{ marginLeft: 8 }}>{members.length + 1} {L === "de" ? "gesamt" : "total"}</span>
            </div>
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>E-Mail</th>
                    <th>{L === "de" ? "Rolle" : "Role"}</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {owner && (
                    <tr>
                      <td><strong>{owner.email}</strong></td>
                      <td><span className="chip cl">Admin (Owner)</span></td>
                      <td><span className="chip cl">Aktiv</span></td>
                      <td></td>
                    </tr>
                  )}
                  {members.map((m: any) => (
                    <tr key={m.id}>
                      <td>{m.email}</td>
                      <td><span className="chip cm">{m.role}</span></td>
                      <td><span className={`chip ${m.status === "active" ? "cl" : "cm"}`}>{m.status === "invited" ? "Eingeladen" : "Aktiv"}</span></td>
                      <td>
                        <button className="btn btn-sm" style={{ color: "#DC2626", border: "1px solid #FECACA", background: "#FFF5F5" }} onClick={() => removeMember(m.id)}>
                          {L === "de" ? "Entfernen" : "Remove"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && !owner && (
                    <tr><td colSpan={4} style={{ textAlign: "center", color: "#9CA3AF", padding: "20px 0" }}>{L === "de" ? "Noch keine weiteren Mitglieder." : "No additional members yet."}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "billing" && (
        <div style={{ display: "grid", gap: 16 }}>
          <div className="card">
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>{L === "de" ? "Aktueller Plan" : "Current plan"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: planColor }}>{planLabel}</span>
              {billing?.status === "trialing" && <span className="chip cm">Trial bis {billing?.trialEndsAt ? new Date(billing.trialEndsAt).toLocaleDateString("de-DE") : "—"}</span>}
              {billing?.status === "active" && billing?.plan !== "free" && <span className="chip cl">Aktiv</span>}
              {billing?.cancelAtPeriodEnd && <span className="chip ch">Endet {billing?.currentPeriodEnd ? new Date(billing.currentPeriodEnd).toLocaleDateString("de-DE") : "—"}</span>}
            </div>

            {!billing?.stripeEnabled && (
              <div className="al al-info" style={{ marginBottom: 16 }}>
                <span className="al-icon">i</span>
                <span style={{ fontSize: 12.5 }}>Stripe nicht konfiguriert. Setzen Sie <code>STRIPE_SECRET_KEY</code> in der Backend-Umgebung, um Billing zu aktivieren.</span>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { key: "free", name: "Free", price: "€0", features: ["5 Lieferanten", "Basis-Risikoanalyse", "Beschwerdeportal", "1 Benutzer"] },
                { key: "pro", name: "Pro", price: "€149/mo", features: ["Unbegrenzte Lieferanten", "KI-Assistent", "BAFA PDF-Export", "Team (5 Nutzer)", "14 Tage kostenlos"], highlight: true },
                { key: "enterprise", name: "Enterprise", price: "€499/mo", features: ["Alles in Pro", "Unbegrenzte Nutzer", "SSO / SAML", "Dedizierter Support", "SLA-Garantie"] },
              ].map(plan => (
                <div key={plan.key} style={{
                  padding: "20px", borderRadius: 12,
                  border: `2px solid ${billing?.plan === plan.key ? "#1B3D2B" : plan.highlight ? "#1B3D2B" : "#E5E7EB"}`,
                  background: billing?.plan === plan.key ? "#F0FDF4" : plan.highlight ? "#F8FAF8" : "#fff",
                  position: "relative",
                }}>
                  {plan.highlight && billing?.plan !== plan.key && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#1B3D2B", color: "#fff", fontSize: 11, fontWeight: 800, padding: "2px 10px", borderRadius: 99 }}>Empfohlen</div>}
                  {billing?.plan === plan.key && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#16A34A", color: "#fff", fontSize: 11, fontWeight: 800, padding: "2px 10px", borderRadius: 99 }}>Aktuell</div>}
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{plan.name}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#1B3D2B", marginBottom: 14 }}>{plan.price}</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 7, marginBottom: 16 }}>
                    {plan.features.map(f => <li key={f} style={{ fontSize: 13, color: "#374151", display: "flex", gap: 6, alignItems: "center" }}><span style={{ color: "#16A34A", fontWeight: 800 }}>✓</span> {f}</li>)}
                  </ul>
                  {billing?.plan !== plan.key && plan.key !== "free" && billing?.stripeEnabled && (
                    <button className="btn btn-p btn-sm" style={{ width: "100%" }} onClick={() => startCheckout(plan.key)} disabled={billingLoading}>
                      {billingLoading ? <span className="spin" /> : L === "de" ? "Upgraden" : "Upgrade"}
                    </button>
                  )}
                  {billing?.plan === plan.key && plan.key !== "free" && (
                    <button className="btn btn-sm" style={{ width: "100%" }} onClick={openPortal} disabled={billingLoading}>
                      {L === "de" ? "Verwalten" : "Manage"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "legal" && (
        <div style={{ display: "grid", gap: 16 }}>
          <div className="card">
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>DSGVO / Datenschutz</div>
            <div style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.6, marginBottom: 16 }}>
              {L === "de"
                ? "Gemäß DSGVO Art.20 können Sie alle Ihre Daten exportieren. Gemäß DSGVO Art.17 können Sie die Löschung Ihres Accounts beantragen. Compliance-Nachweise werden gemäß §10 Abs.1 LkSG für 7 Jahre aufbewahrt."
                : "Under GDPR Art.20 you can export all your data. Under GDPR Art.17 you can request account deletion. Compliance evidence is retained for 7 years per §10 para.1 LkSG."}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <a href="#" onClick={async e => { e.preventDefault(); window.open(API + "/auth/export?token=" + getToken(), "_blank"); }} className="btn btn-sm">{L === "de" ? "Daten exportieren (Art.20)" : "Export data (Art.20)"}</a>
            </div>
          </div>
          <div className="card">
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Links</div>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                { label: "Datenschutzerklärung", href: "/datenschutz" },
                { label: "AGB", href: "/agb" },
                { label: "Impressum", href: "/impressum" },
              ].map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer" style={{ color: "#1B3D2B", fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 4 }}>
                  {l.label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
