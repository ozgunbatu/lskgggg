"use client";
import { useState, useEffect } from "react";

const css = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',system-ui,sans-serif}
  .dw{min-height:100vh;background:#0b1209;color:#fff}
  .dnav{display:flex;align-items:center;justify-content:space-between;padding:20px 40px;border-bottom:1px solid rgba(255,255,255,.08);position:sticky;top:0;background:#0b1209;z-index:100}
  .dlogo{font-size:18px;font-weight:800;color:#fff;text-decoration:none}
  .dlogo em{font-style:normal;color:rgba(255,255,255,.4)}
  .dnav-links{display:flex;align-items:center;gap:20px}
  .dnav-links a{color:rgba(255,255,255,.6);font-size:14px;font-weight:600;text-decoration:none;transition:color .15s}
  .dnav-links a:hover{color:#fff}
  .dbtn{background:#1B3D2B;color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:14px;font-weight:700;cursor:pointer;text-decoration:none;transition:all .2s}
  .dbtn:hover{background:#2d5c3f;transform:translateY(-1px)}
  
  .dhero{text-align:center;padding:80px 24px 60px;max-width:760px;margin:0 auto}
  .dhero-tag{display:inline-flex;align-items:center;gap:8px;background:rgba(27,61,43,.4);border:1px solid rgba(27,61,43,.6);color:#4ade80;font-size:12px;font-weight:700;padding:5px 14px;border-radius:99px;letter-spacing:.5px;text-transform:uppercase;margin-bottom:24px}
  .dhero h1{font-size:clamp(32px,5vw,52px);font-weight:800;line-height:1.1;letter-spacing:-.5px;margin-bottom:16px}
  .dhero h1 em{font-style:normal;color:#4ade80}
  .dhero p{font-size:17px;color:rgba(255,255,255,.6);line-height:1.7;max-width:560px;margin:0 auto 32px}
  .dhero-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
  .dbtn-outline{background:rgba(255,255,255,.06);color:#fff;border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:12px 24px;font-size:14px;font-weight:700;cursor:pointer;text-decoration:none;transition:all .2s}
  .dbtn-outline:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.3)}

  .dsteps{display:flex;gap:0;overflow-x:auto;padding:0 40px;margin-bottom:0;scrollbar-width:none;border-bottom:1px solid rgba(255,255,255,.08)}
  .dsteps::-webkit-scrollbar{display:none}
  .dstep{display:flex;align-items:center;gap:10px;padding:14px 20px;cursor:pointer;border-bottom:2px solid transparent;color:rgba(255,255,255,.45);font-size:13.5px;font-weight:600;white-space:nowrap;transition:all .2s;flex-shrink:0}
  .dstep:hover{color:rgba(255,255,255,.8)}
  .dstep.on{color:#4ade80;border-bottom-color:#4ade80}
  .dstep-n{width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0}
  .dstep.on .dstep-n{background:#1B3D2B;color:#4ade80}

  .dscreen{display:grid;grid-template-columns:1fr 380px;gap:0;min-height:600px}
  .dscreen-left{padding:40px;border-right:1px solid rgba(255,255,255,.08)}
  .dscreen-right{padding:40px;background:rgba(255,255,255,.02)}
  
  .dscreen-tag{font-size:11px;font-weight:800;color:#4ade80;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px}
  .dscreen-h{font-size:26px;font-weight:800;line-height:1.2;margin-bottom:12px;letter-spacing:-.3px}
  .dscreen-s{font-size:15px;color:rgba(255,255,255,.55);line-height:1.7;margin-bottom:28px}
  .dscreen-pts{display:grid;gap:12px;margin-bottom:32px}
  .dscreen-pt{display:flex;gap:12px;align-items:flex-start}
  .dscreen-pt-ic{width:28px;height:28px;border-radius:8px;background:#1B3D2B;border:1px solid rgba(27,61,43,.6);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;margin-top:1px}
  .dscreen-pt-tx{font-size:14px;color:rgba(255,255,255,.75);line-height:1.55}
  .dscreen-pt-tx strong{color:#fff;display:block;margin-bottom:2px}
  .dscreen-law{display:inline-flex;align-items:center;gap:6px;background:rgba(74,222,128,.08);border:1px solid rgba(74,222,128,.2);color:#4ade80;font-size:12px;font-weight:700;padding:5px 12px;border-radius:6px}

  .dpreview{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:16px;overflow:hidden;height:100%;min-height:400px;display:flex;flex-direction:column}
  .dpreview-bar{display:flex;align-items:center;gap:8px;padding:12px 16px;background:rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.08)}
  .dpreview-dot{width:10px;height:10px;border-radius:50%}
  .dpreview-url{flex:1;background:rgba(255,255,255,.06);border-radius:6px;padding:4px 12px;font-size:11px;color:rgba(255,255,255,.4);font-family:monospace}
  .dpreview-body{flex:1;padding:20px;display:flex;flex-direction:column;gap:12px}

  .dmock-nav{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}
  .dmock-tab{font-size:11px;font-weight:700;padding:5px 10px;border-radius:6px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.5);cursor:pointer}
  .dmock-tab.on{background:#1B3D2B;color:#4ade80}
  .dmock-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:14px}
  .dmock-h{font-size:11px;font-weight:800;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
  .dmock-row{display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:12px}
  .dmock-row:last-child{border-bottom:none}
  .dmock-badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px}
  .dmock-h-badge{background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.2)}
  .dmock-m-badge{background:rgba(245,158,11,.15);color:#fbbf24;border:1px solid rgba(245,158,11,.2)}
  .dmock-l-badge{background:rgba(74,222,128,.1);color:#4ade80;border:1px solid rgba(74,222,128,.2)}
  .dmock-score{font-size:28px;font-weight:800;color:#4ade80}
  .dmock-stat{text-align:center;padding:10px}
  .dmock-stat-n{font-size:22px;font-weight:800;color:#fff;margin-bottom:2px}
  .dmock-stat-l{font-size:10px;color:rgba(255,255,255,.4);font-weight:700;text-transform:uppercase}
  .dmock-bar{height:6px;border-radius:3px;background:rgba(255,255,255,.1);overflow:hidden;margin-top:6px}
  .dmock-bar-fill{height:100%;border-radius:3px;background:#4ade80;transition:width .5s ease}

  .dnav-footer{display:flex;align-items:center;justify-content:space-between;padding:32px 40px;border-top:1px solid rgba(255,255,255,.08);margin-top:auto}
  .dstep-btn{display:flex;align-items:center;gap:8px;background:none;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.7);font-size:13.5px;font-weight:700;padding:10px 18px;border-radius:8px;cursor:pointer;transition:all .2s}
  .dstep-btn:hover{background:rgba(255,255,255,.06);color:#fff}
  .dstep-btn:disabled{opacity:.25;cursor:not-allowed}
  .dstep-btn.primary{background:#1B3D2B;border-color:#1B3D2B;color:#fff}
  .dstep-btn.primary:hover{background:#2d5c3f}
  .dprog{display:flex;gap:6px;align-items:center}
  .dprog-dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.15);transition:all .3s;cursor:pointer}
  .dprog-dot.on{background:#4ade80;width:20px;border-radius:4px}

  @media(max-width:900px){.dscreen{grid-template-columns:1fr}.dscreen-right{display:none}.dnav{padding:16px 20px}.dhero{padding:60px 20px 40px}.dsteps{padding:0 20px}.dscreen-left{padding:28px 20px}}
`;

const STEPS = [
  {
    tag: "Schritt 1 — Registrierung",
    law: "§4 LkSG — Interne Verantwortung",
    title: "Account & Workspace einrichten",
    sub: "In unter 60 Sekunden einen compliance-fähigen Workspace erstellen. E-Mail-Verifizierung über OTP. Kein Kreditkartenzwang für 14-tägige Testphase.",
    points: [
      { ic: "🏢", title: "Unternehmensname", text: "Wird als Mandant-Identifier verwendet. Multi-tenant-fähig." },
      { ic: "📧", title: "OTP-Verifikation", text: "Sicherer Registrierungsfluss via einmaligem 6-stelligem Code." },
      { ic: "🔐", title: "JWT + Cookie", text: "7-tägige Sessions, sicher gespeichert in localStorage + httpOnly Cookie." },
    ],
    preview: "register",
  },
  {
    tag: "Schritt 2 — Dashboard",
    law: "§9 LkSG — Wirksamkeitskontrolle",
    title: "Compliance-Score auf einen Blick",
    sub: "Das Dashboard zeigt den aktuellen Compliance-Score (0–100), Risiko-Portfolio, offene CAPs und den BAFA-Readiness-Status in einer kompakten Ansicht.",
    points: [
      { ic: "📊", title: "Score-Formel", text: "Risikokomponente (55%) + Prozesskomponente (45%). §9-konform." },
      { ic: "🔴", title: "Overdue-Alerts", text: "Überfällige CAPs und offene Beschwerden direkt sichtbar." },
      { ic: "✓", title: "BAFA-Readiness", text: "Checkliste zeigt fehlende Pflichtfelder für §4 Abs.3 LkSG." },
    ],
    preview: "dashboard",
  },
  {
    tag: "Schritt 3 — Lieferanten",
    law: "§5 LkSG — Risikoanalyse",
    title: "Lieferanten-Register & Risikobewertung",
    sub: "Lieferanten einzeln anlegen, per CSV importieren oder per XLSX-Upload hochladen. Automatische Risikobewertung nach Land, Branche und Supplier-Profil.",
    points: [
      { ic: "🌍", title: "190+ Länder", text: "CPI-Index, Human Rights Score, Branchengewichtung — alles automatisch." },
      { ic: "📤", title: "Excel-Import", text: "XLSX-Upload mit automatischer Spaltenerkennung (inkl. türkische Header)." },
      { ic: "⚡", title: "Sofortige Neubewertung", text: "Audit/CoC/Zertifikate ergeben sofort aktualisierten Risiko-Score." },
    ],
    preview: "suppliers",
  },
  {
    tag: "Schritt 4 — Beschwerden",
    law: "§8 LkSG — Beschwerdeverfahren",
    title: "Beschwerdemanagement & Whistleblowing",
    sub: "Öffentliches Whistleblowing-Portal unter /complaints/[company-slug]. Anonym oder identifiziert. Statusverfolgung mit §8 Abs.5 Rückmeldepflicht.",
    points: [
      { ic: "🛡️", title: "Anonym & sicher", text: "IP-Hash statt IP-Adresse. HinSchG §16 Schutz integriert." },
      { ic: "🔄", title: "Status-Workflow", text: "open → in_review → investigating → resolved/closed." },
      { ic: "📮", title: "Hinweisgeber-Benachrichtigung", text: "Automatische E-Mail bei Abschluss gemäß §8 Abs.5." },
    ],
    preview: "complaints",
  },
  {
    tag: "Schritt 5 — Maßnahmen",
    law: "§6 LkSG — Präventions- & Abhilfemaßnahmen",
    title: "CAP-Tracking & Maßnahmenplan",
    sub: "Corrective Action Plans (CAPs) mit Fälligkeitsdatum, Priorität, Zuweisung und Fortschrittsanzeige. Evidence kann direkt angehängt werden.",
    points: [
      { ic: "📋", title: "Prioritäten", text: "Critical / High / Medium / Low mit visueller Priorisierung." },
      { ic: "📎", title: "Evidence-Verknüpfung", text: "Dokumente direkt am CAP anhängen (§10 Abs.1: 7 Jahre Pflicht)." },
      { ic: "⏰", title: "Fälligkeits-Alerts", text: "Überfällige CAPs erscheinen rot in Dashboard + Navigation." },
    ],
    preview: "actions",
  },
  {
    tag: "Schritt 6 — BAFA-Bericht",
    law: "§9 LkSG — Berichterstattungspflicht",
    title: "BAFA-Report generieren & einreichen",
    sub: "Automatisch generierter PDF-Bericht auf Knopfdruck. KI-gestützter Entwurf via Claude-API. Genehmigungsworkflow für Enterprise-Teams.",
    points: [
      { ic: "🤖", title: "KI-Entwurf", text: "Claude generiert einen BAFA-konformen Berichtsentwurf aus Ihren Daten." },
      { ic: "✍️", title: "Genehmigungsworkflow", text: "Draft → Under Review → Approved. Audit Trail dokumentiert jeden Schritt." },
      { ic: "📄", title: "PDF-Export", text: "Barrierefreier PDF mit BAFA-Gliederung, Zeitstempel und Signatur." },
    ],
    preview: "reports",
  },
  {
    tag: "Schritt 7 — Team & Billing",
    law: "§4 Abs.3 — Interner Beauftragter",
    title: "Team einladen & Plan upgraden",
    sub: "Mehrere Nutzer in einem Workspace. Admin lädt per E-Mail ein. Rollen: Admin, Member, Viewer. Stripe-Integration für Free/Pro/Enterprise.",
    points: [
      { ic: "👥", title: "Team-Invite", text: "Einladungslink mit 7-tägiger Gültigkeit, JWT-signiert." },
      { ic: "💳", title: "Stripe-Billing", text: "Pro €149/mo · Enterprise €499/mo · 14 Tage Trial." },
      { ic: "🎛️", title: "Rollen-System", text: "Viewer: Nur lesen. Member: Bearbeiten. Admin: Volle Kontrolle." },
    ],
    preview: "team",
  },
];

const PREVIEW_CONTENTS: Record<string, React.ReactNode> = {
  register: (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Account erstellen</div>
      {["Unternehmensname", "E-Mail-Adresse", "Passwort"].map(label => (
        <div key={label}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4 }}>{label}</div>
          <div style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "rgba(255,255,255,.3)" }}>
            {label === "Unternehmensname" ? "Muster GmbH" : label === "E-Mail-Adresse" ? "max@muster-gmbh.de" : "••••••••••"}
          </div>
        </div>
      ))}
      <div style={{ background: "#1B3D2B", borderRadius: 8, padding: "12px", textAlign: "center", fontSize: 13, fontWeight: 800, color: "#fff", marginTop: 4 }}>Konto erstellen →</div>
      <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,.3)" }}>✓ 14 Tage kostenlos · Keine Kreditkarte</div>
    </div>
  ),
  dashboard: (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[["72", "Score"], ["5", "Lieferanten"], ["2", "Offen CAPs"]].map(([n, l]) => (
          <div key={l} className="dmock-stat" style={{ background: "rgba(255,255,255,.05)", borderRadius: 8, border: "1px solid rgba(255,255,255,.08)" }}>
            <div className="dmock-stat-n" style={{ color: l === "Score" ? "#4ade80" : "#fff" }}>{n}</div>
            <div className="dmock-stat-l">{l}</div>
          </div>
        ))}
      </div>
      <div className="dmock-card">
        <div className="dmock-h">Risiko-Portfolio</div>
        {[["Hoch", "1", "h"], ["Mittel", "2", "m"], ["Niedrig", "2", "l"]].map(([l, n, t]) => (
          <div key={l} className="dmock-row">
            <span style={{ color: "rgba(255,255,255,.7)", fontSize: 12 }}>{l}</span>
            <span className={`dmock-badge dmock-${t}-badge`}>{n}</span>
          </div>
        ))}
      </div>
      <div className="dmock-card">
        <div className="dmock-h">BAFA-Readiness</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
          <span style={{ color: "rgba(255,255,255,.6)" }}>Fortschritt</span>
          <span style={{ color: "#4ade80", fontWeight: 700 }}>68%</span>
        </div>
        <div className="dmock-bar"><div className="dmock-bar-fill" style={{ width: "68%" }} /></div>
      </div>
    </div>
  ),
  suppliers: (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Lieferanten (5)</div>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ background: "rgba(74,222,128,.15)", border: "1px solid rgba(74,222,128,.3)", color: "#4ade80", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5 }}>+ Neu</div>
          <div style={{ background: "rgba(255,255,255,.08)", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.6)", padding: "3px 8px", borderRadius: 5 }}>Excel</div>
        </div>
      </div>
      {[
        { name: "Shenzhen Parts Co.", country: "🇨🇳 China", risk: "h" },
        { name: "Ankara Tekstil A.Ş.", country: "🇹🇷 Türkei", risk: "m" },
        { name: "Schmidt GmbH", country: "🇩🇪 Deutschland", risk: "l" },
        { name: "Hanoi Electro", country: "🇻🇳 Vietnam", risk: "m" },
      ].map(s => (
        <div key={s.name} className="dmock-card" style={{ padding: "10px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{s.country}</div>
            </div>
            <span className={`dmock-badge dmock-${s.risk}-badge`}>{s.risk === "h" ? "Hoch" : s.risk === "m" ? "Mittel" : "Niedrig"}</span>
          </div>
        </div>
      ))}
    </div>
  ),
  complaints: (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="dmock-card" style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#f87171", marginBottom: 6 }}>⚠ Neue Beschwerde</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", lineHeight: 1.5 }}>Kinderarbeit bei Tier-2 Lieferant beobachtet. Referenz: BSWD-ABC-123.</div>
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <span className="dmock-badge dmock-h-badge">Kritisch</span>
          <span className="dmock-badge" style={{ background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.5)" }}>§2 Nr.1 LkSG</span>
        </div>
      </div>
      {[
        { ref: "BSWD-1A2B", cat: "Umweltverstoss", status: "In Prüfung", s: "m" },
        { ref: "BSWD-3C4D", cat: "Diskriminierung", status: "Gelöst", s: "l" },
      ].map(c => (
        <div key={c.ref} className="dmock-card" style={{ padding: "10px 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.4)", fontFamily: "monospace" }}>{c.ref}</div>
              <div style={{ fontSize: 12, color: "#fff", marginTop: 2 }}>{c.cat}</div>
            </div>
            <span className={`dmock-badge dmock-${c.s}-badge`}>{c.status}</span>
          </div>
        </div>
      ))}
    </div>
  ),
  actions: (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="dmock-card" style={{ background: "rgba(239,68,68,.06)", border: "1px solid rgba(239,68,68,.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "#f87171", fontWeight: 800, marginBottom: 4 }}>⏰ ÜBERFÄLLIG — 3 Tage</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Code of Conduct einfordern</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 2 }}>Shenzhen Parts Co. · §6 Abs.2</div>
          </div>
          <span className="dmock-badge dmock-h-badge">Kritisch</span>
        </div>
      </div>
      {[
        { title: "Audit-Bericht anfordern", due: "15.04.2025", pri: "m" },
        { title: "Lieferanten-SAQ versenden", due: "30.04.2025", pri: "l" },
      ].map(a => (
        <div key={a.title} className="dmock-card" style={{ padding: "10px 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{a.title}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 2 }}>Fällig: {a.due}</div>
            </div>
            <span className={`dmock-badge dmock-${a.pri}-badge`}>{a.pri === "m" ? "Hoch" : "Mittel"}</span>
          </div>
        </div>
      ))}
    </div>
  ),
  reports: (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="dmock-card" style={{ background: "rgba(74,222,128,.06)", border: "1px solid rgba(74,222,128,.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>BAFA-Bericht 2024</div>
          <span className="dmock-badge dmock-l-badge">Genehmigt</span>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", lineHeight: 1.5 }}>§5 Risikoanalyse · §6 Maßnahmen · §9 Wirksamkeit · §10 Dokumentation</div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <div style={{ flex: 1, background: "#1B3D2B", borderRadius: 6, padding: "8px", textAlign: "center", fontSize: 11, fontWeight: 800, color: "#4ade80" }}>PDF exportieren</div>
          <div style={{ background: "rgba(255,255,255,.08)", borderRadius: 6, padding: "8px", textAlign: "center", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.6)" }}>Vorschau</div>
        </div>
      </div>
      <div className="dmock-card">
        <div className="dmock-h">KI-Entwurf</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", lineHeight: 1.6 }}>
          "Das Unternehmen hat gemäß §5 LkSG eine anlassbezogene Risikoanalyse für 5 direkte Lieferanten durchgeführt. 1 Lieferant wurde als hochriskant eingestuft..."
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
          {["Weiter schreiben", "Kürzen", "Formaler"].map(a => (
            <div key={a} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 5, padding: "3px 8px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.5)" }}>{a}</div>
          ))}
        </div>
      </div>
    </div>
  ),
  team: (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="dmock-card">
        <div className="dmock-h">Team einladen</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 6, padding: "8px 10px", fontSize: 11, color: "rgba(255,255,255,.3)" }}>kollegin@muster-gmbh.de</div>
          <div style={{ background: "#1B3D2B", borderRadius: 6, padding: "8px 12px", fontSize: 11, fontWeight: 800, color: "#fff", whiteSpace: "nowrap" }}>Einladen</div>
        </div>
      </div>
      <div className="dmock-card">
        <div className="dmock-h">Mitglieder</div>
        {[
          { email: "max@muster-gmbh.de", role: "Admin", status: "l" },
          { email: "anna@muster-gmbh.de", role: "Member", status: "l" },
          { email: "jo@extern.de", role: "Viewer", status: "m" },
        ].map(m => (
          <div key={m.email} className="dmock-row">
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{m.email}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>{m.role}</div>
            </div>
            <span className={`dmock-badge dmock-${m.status}-badge`}>{m.status === "l" ? "Aktiv" : "Eingeladen"}</span>
          </div>
        ))}
      </div>
      <div className="dmock-card" style={{ background: "rgba(124,58,237,.08)", border: "1px solid rgba(124,58,237,.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>Pro Plan</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", marginTop: 2 }}>€149/mo · bis zu 5 Nutzer</div>
          </div>
          <span className="dmock-badge" style={{ background: "rgba(74,222,128,.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,.2)" }}>Aktiv</span>
        </div>
      </div>
    </div>
  ),
};

export default function DemoPage() {
  const [step, setStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    if (!autoPlay) return;
    const t = setInterval(() => {
      setStep(s => {
        if (s >= STEPS.length - 1) { setAutoPlay(false); return s; }
        return s + 1;
      });
    }, 5000);
    return () => clearInterval(t);
  }, [autoPlay]);

  const current = STEPS[step];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="dw">
        <nav className="dnav">
          <a href="/" className="dlogo">LkSG<em>Compass</em></a>
          <div className="dnav-links">
            <a href="/pricing">Pricing</a>
            <a href="/login">Login</a>
            <a href="/register" className="dbtn">Kostenlos starten</a>
          </div>
        </nav>

        <div className="dhero">
          <div className="dhero-tag">
            <span>▶</span> Interaktive Produkt-Demo
          </div>
          <h1>LkSGCompass in <em>7 Schritten</em></h1>
          <p>Vollständige LkSG-Compliance vom ersten Lieferanten bis zum BAFA-Bericht. Sehen Sie wie die Plattform in der Praxis funktioniert.</p>
          <div className="dhero-btns">
            <button className="dbtn" onClick={() => setAutoPlay(a => !a)} style={{ padding: "13px 28px", fontSize: 15 }}>
              {autoPlay ? "⏸ Pause" : "▶ Auto-Play"}
            </button>
            <a href="/register" className="dbtn-outline" style={{ padding: "13px 28px", fontSize: 15 }}>Jetzt testen →</a>
          </div>
        </div>

        <div className="dsteps">
          {STEPS.map((s, i) => (
            <button key={i} className={`dstep${step === i ? " on" : ""}`} onClick={() => { setStep(i); setAutoPlay(false); }}>
              <span className="dstep-n">{i + 1}</span>
              {s.tag.split("—")[1]?.trim() || s.tag}
            </button>
          ))}
        </div>

        <div className="dscreen">
          <div className="dscreen-left">
            <div className="dscreen-tag">{current.tag}</div>
            <div className="dscreen-h">{current.title}</div>
            <div className="dscreen-s">{current.sub}</div>
            <div className="dscreen-pts">
              {current.points.map((pt, i) => (
                <div key={i} className="dscreen-pt">
                  <div className="dscreen-pt-ic">{pt.ic}</div>
                  <div className="dscreen-pt-tx"><strong>{pt.title}</strong>{pt.text}</div>
                </div>
              ))}
            </div>
            <div className="dscreen-law">{current.law}</div>
          </div>

          <div className="dscreen-right">
            <div className="dpreview">
              <div className="dpreview-bar">
                <div className="dpreview-dot" style={{ background: "#ef4444" }} />
                <div className="dpreview-dot" style={{ background: "#f59e0b" }} />
                <div className="dpreview-dot" style={{ background: "#22c55e" }} />
                <div className="dpreview-url">lksgcompass.de/{current.preview === "register" ? "register" : `app/${current.preview}`}</div>
              </div>
              <div className="dpreview-body">
                {PREVIEW_CONTENTS[current.preview]}
              </div>
            </div>
          </div>
        </div>

        <div className="dnav-footer">
          <button className="dstep-btn" onClick={() => { setStep(s => Math.max(0, s - 1)); setAutoPlay(false); }} disabled={step === 0}>
            ← Zurück
          </button>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div className="dprog">
              {STEPS.map((_, i) => (
                <div key={i} className={`dprog-dot${step === i ? " on" : ""}`} onClick={() => { setStep(i); setAutoPlay(false); }} />
              ))}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>{step + 1} / {STEPS.length}</div>
          </div>
          {step < STEPS.length - 1 ? (
            <button className="dstep-btn primary" onClick={() => { setStep(s => Math.min(STEPS.length - 1, s + 1)); setAutoPlay(false); }}>
              Weiter →
            </button>
          ) : (
            <a href="/register" className="dstep-btn primary" style={{ textDecoration: "none" }}>
              Jetzt starten →
            </a>
          )}
        </div>
      </div>
    </>
  );
}
