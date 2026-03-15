"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── CINEMATIC DEMO — inspired by Linear, Vercel, Stripe product tours ────────
// Design: Full-screen immersive with spotlight effects, chapter system,
// typewriter subtitles, and speech-synced auto-advance.

type Chapter = {
  id: string;
  num: string;
  title: string;
  law: string;
  color: string;
  frames: { narration: string; spotlight?: string; modal?: string; variant?: string }[];
};

const CHAPTERS: Chapter[] = [
  {
    id: "intro", num: "00", title: "Das Problem", law: "§24 LkSG", color: "#ef4444",
    frames: [
      { narration: "BAFA-Bußgelder bis 2% des Jahresumsatzes. Für fehlende LkSG-Dokumentation.", variant: "stat" },
      { narration: "Die meisten Compliance-Teams verwalten das noch mit Excel. Das muss sich ändern.", variant: "stat2" },
    ],
  },
  {
    id: "register", num: "01", title: "Onboarding", law: "§4 LkSG", color: "#4ade80",
    frames: [
      { narration: "Konto erstellen. Keine IT-Abteilung nötig. In unter 60 Sekunden einsatzbereit.", variant: "register" },
      { narration: "E-Mail bestätigen. Der Compliance-Workspace ist sofort aktiv.", variant: "otp" },
    ],
  },
  {
    id: "dashboard", num: "02", title: "Compliance-Score", law: "§9 LkSG", color: "#60a5fa",
    frames: [
      { narration: "72 von 100. Grade B. Der Score berechnet sich nach §9 LkSG: 55% Risikoqualität, 45% Prozessqualität.", spotlight: "score" },
      { narration: "Die BAFA-Bereitschaftsliste zeigt genau, was noch fehlt. Complaints-Beauftragter nicht besetzt.", spotlight: "bafa" },
      { narration: "Neuen Lieferanten hinzufügen. Die Risk Engine bewertet automatisch — kein manuelles Scoring.", spotlight: "addsup", modal: "new-supplier" },
    ],
  },
  {
    id: "suppliers", num: "03", title: "Risikoanalyse", law: "§5 LkSG", color: "#f59e0b",
    frames: [
      { narration: "Shenzhen Parts: 78 von 100. Hochrisiko. Länderrisiko China, fehlender Audit, kein CoC.", spotlight: "shenzhen", modal: "risk-detail" },
      { narration: "Excel-Import. Automatische Spaltenerkennung — auch türkische Spaltenbezeichnungen werden erkannt.", spotlight: "excel", modal: "excel-import" },
    ],
  },
  {
    id: "complaints", num: "04", title: "Hinweisgebersystem", law: "§8 LkSG", color: "#a78bfa",
    frames: [
      { narration: "Öffentliches Meldeportal, automatisch erstellt. Anonym, verschlüsselt, DSGVO-konform.", spotlight: "portal" },
      { narration: "Kritischer Hinweis: Kinderarbeit. 7-Tage-Frist nach §8 Abs.5. Korrekturmaßnahmenplan direkt verknüpfen.", spotlight: "critical", modal: "complaint-detail" },
    ],
  },
  {
    id: "legal", num: "05", title: "Rechtsassistent", law: "§6 Abs.2 LkSG", color: "#34d399",
    frames: [
      { narration: "6 rechtssichere Dokumentvorlagen. Verhaltenskodex, Vertragsklausel, SAQ, Auditprotokoll.", variant: "templates" },
      { narration: "Claude schreibt den kompletten Verhaltenskodex in Sekunden. Deutsch oder Englisch. Alle §2-Kategorien.", modal: "coc", variant: "templates" },
      { narration: "Vertragscheck: Text einfügen, LkSG-Lücken werden automatisch erkannt und behoben.", variant: "review" },
    ],
  },
  {
    id: "reports", num: "06", title: "BAFA-Bericht", law: "§10 LkSG", color: "#38bdf8",
    frames: [
      { narration: "KI-BAFA-Berichtsgenerator. Claude liest Ihre Echtdaten und schreibt §5 bis §10.", spotlight: "ai-btn", modal: "ai-gen" },
      { narration: "Entwurf fertig. Genehmigungsworkflow mit vollständigem Audit-Trail. Dann PDF-Export für BAFA.", modal: "ai-done" },
    ],
  },
  {
    id: "defense", num: "07", title: "Verteidigungsakte", law: "§10 LkSG — NEU", color: "#2563EB",
    frames: [
      { narration: "BAFA-Kontrollverfahren gestartet? Ein Klick: alle §5–§10-Nachweise strukturiert exportiert.", variant: "defense" },
      { narration: "200 Audit-Trail-Einträge, Zeitstempel, Lieferantenprofile. Was Anwälte tagelang kompilieren.", variant: "defense", spotlight: "download" },
    ],
  },
  {
    id: "cta", num: "08", title: "Jetzt starten", law: "14 Tage kostenlos", color: "#4ade80",
    frames: [
      { narration: "§4 bis §10 LkSG. KI-Assistent. Rechtsvorlagen. BAFA-Verteidigungsakte. 14 Tage kostenlos.", variant: "cta" },
    ],
  },
];

// ─── RENDER HELPERS ───────────────────────────────────────────────────────────
function AppNav({ active }: { active: string }) {
  return (
    <div style={{ background: "#1B3D2B", width: 165, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "11px 11px 9px", borderBottom: "1px solid rgba(255,255,255,.09)", fontSize: 12.5, fontWeight: 800, color: "#fff" }}>
        LkSG<span style={{ color: "rgba(255,255,255,.3)" }}>Compass</span>
      </div>
      <div style={{ padding: "8px 5px", display: "flex", flexDirection: "column", gap: 1 }}>
        {[["dashboard","Dashboard"],["suppliers","Lieferanten"],["complaints","Beschwerden"],["actions","Aktionspläne"],["legal","Rechtsassistent"],["reports","BAFA-Bericht"],["settings","Einstellungen"]].map(([id,label]) => (
          <div key={id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: active === id ? "rgba(255,255,255,.11)" : "transparent", color: active === id ? "#fff" : "rgba(255,255,255,.45)" }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "currentColor", opacity: .5, flexShrink: 0 }} />{label}
          </div>
        ))}
      </div>
    </div>
  );
}

function Browser({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", background: "#1a2018", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {["#ef4444","#f59e0b","#22c55e"].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
        </div>
        <div style={{ flex: 1, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 4, padding: "3px 9px", fontSize: 10, color: "rgba(255,255,255,.3)", fontFamily: "monospace", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ color: "#4ade80", fontSize: 9 }}>🔒</span>{url}
        </div>
      </div>
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>{children}</div>
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(3px)", zIndex: 30, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .2s ease" }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 20, width: 300, boxShadow: "0 20px 60px rgba(0,0,0,.35)", animation: "slideUp .25s ease" }}>
        {children}
      </div>
    </div>
  );
}

const Mh = ({ children }: { children: React.ReactNode }) => <div style={{ fontSize: 14, fontWeight: 800, color: "#0b0f0c", marginBottom: 4, letterSpacing: "-.2px" }}>{children}</div>;
const Ms = ({ children }: { children: React.ReactNode }) => <div style={{ fontSize: 11.5, color: "#6b7280", marginBottom: 12, lineHeight: 1.5 }}>{children}</div>;
const Mfield = ({ label, value }: { label: string; value: string }) => (
  <div style={{ marginBottom: 9 }}>
    <div style={{ fontSize: 9.5, fontWeight: 800, color: "#6b7280", textTransform: "uppercase" as const, letterSpacing: ".6px", marginBottom: 3 }}>{label}</div>
    <div style={{ padding: "8px 10px", border: "1.5px solid #1B3D2B", borderRadius: 7, fontSize: 12.5, color: "#0b0f0c", background: "#f0f5f1" }}>{value}</div>
  </div>
);
const Msub = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: "100%", padding: 10, background: "#1B3D2B", color: "#fff", border: "none", borderRadius: 8, fontSize: 12.5, fontWeight: 800, cursor: "pointer", textAlign: "center" as const, marginTop: 4 }}>{children}</div>
);
const Mrow = ({ children }: { children: React.ReactNode }) => <div style={{ display: "flex", gap: 7 }}>{children}</div>;
const Mrrow = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #F3F4F6", fontSize: 11.5 }}>
    <span style={{ color: "#6b7280" }}>{label}</span>
    <span style={{ fontWeight: 700, color: accent ? "#DC2626" : "#0b0f0c" }}>{value}</span>
  </div>
);
const Sbadge = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#16A34A", fontSize: 11.5, fontWeight: 700, padding: "5px 10px", borderRadius: 7, marginBottom: 10 }}>{children}</div>
);
const Genbar = ({ text }: { text: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 12px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, marginBottom: 10 }}>
    {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A", animation: `pulse 1s ${i * .2}s infinite` }} />)}
    <span style={{ fontSize: 11, color: "#16A34A", fontWeight: 700 }}>{text}</span>
  </div>
);
const Bh = ({ children }: { children: React.ReactNode }) => <span style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", fontSize: 9.5, fontWeight: 700, padding: "1px 6px", borderRadius: 4, whiteSpace: "nowrap" as const }}>{children}</span>;
const Bl = ({ children }: { children: React.ReactNode }) => <span style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0", fontSize: 9.5, fontWeight: 700, padding: "1px 6px", borderRadius: 4, whiteSpace: "nowrap" as const }}>{children}</span>;
const Bm = ({ children }: { children: React.ReactNode }) => <span style={{ background: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A", fontSize: 9.5, fontWeight: 700, padding: "1px 6px", borderRadius: 4, whiteSpace: "nowrap" as const }}>{children}</span>;
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: "#fff", border: "1.5px solid #e4e6e4", borderRadius: 12, padding: 12, ...style }}>{children}</div>
);
const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1.5px solid #F3F4F6" }}>{children}</div>
);
const Bar = ({ pct, color }: { pct: number; color: string }) => (
  <div style={{ height: 4, background: "#F3F4F6", borderRadius: 3, overflow: "hidden", width: 55 }}>
    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3 }} />
  </div>
);

// ─── SCENE RENDERER ───────────────────────────────────────────────────────────
function Scene({ chapter, frame, hl, color }: { chapter: Chapter; frame: Chapter["frames"][0]; hl: boolean; color: string }) {
  const sp = frame.spotlight;
  const mo = frame.modal;
  const va = frame.variant;

  const glow = (id: string) => sp === id ? { boxShadow: `0 0 0 2px ${color}, 0 0 20px ${color}60`, borderRadius: 10, transition: "box-shadow .3s" } : {};

  // ── STAT screens (intro) ──
  if (va === "stat") return (
    <div style={{ height: "100%", background: "#0b1209", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 32 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.3)", textTransform: "uppercase" as const, letterSpacing: "2px" }}>§24 LkSG — Sanktionen</div>
      <div style={{ fontSize: "clamp(48px,6vw,88px)", fontWeight: 900, color: "#ef4444", letterSpacing: "-3px", lineHeight: 1 }}>2%</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,.7)", textAlign: "center" as const, maxWidth: 460, lineHeight: 1.5 }}>des Jahresumsatzes — mögliches BAFA-Bußgeld bei fehlender LkSG-Dokumentation</div>
      <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" as const, justifyContent: "center" }}>
        {["§5 Risikoanalyse fehlt","§10 Dokumentation unvollständig","§8 Kein Beschwerdekanal"].map(t => (
          <div key={t} style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", color: "#fca5a5", fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 99 }}>{t}</div>
        ))}
      </div>
    </div>
  );

  if (va === "stat2") return (
    <div style={{ height: "100%", background: "#0b1209", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, padding: 32 }}>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,.4)", fontStyle: "italic", marginBottom: 4 }}>Aktuelle Realität der meisten Compliance-Teams</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 520, width: "100%" }}>
        {[{ icon: "📊", t: "Excel & Word", s: "Manuelles Tracking, kein Audit-Trail" }, { icon: "📧", t: "E-Mail-Ablage", s: "Keine strukturierte Dokumentation" }, { icon: "📅", t: "Fristen vergessen", s: "§8 Abs.5: 7-Tage-Frist unbekannt" }, { icon: "⚖️", t: "Anwaltsstunden", s: "€300+/h für BAFA-Vorbereitung" }].map(({ icon, t, s }) => (
          <div key={t} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{t}</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.4)", lineHeight: 1.5 }}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{ color: "#4ade80", fontSize: 14, fontWeight: 700, marginTop: 4 }}>↓ Es geht besser.</div>
    </div>
  );

  // ── REGISTER ──
  if (va === "register") return (
    <Browser url="lksgcompass.de/register">
      <div style={{ background: "#f0f2f0", overflow: "auto", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", border: "1.5px solid #e4e6e4", borderRadius: 14, padding: 24, width: 340 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0b0f0c", marginBottom: 4, letterSpacing: "-.3px" }}>Workspace erstellen</div>
          <div style={{ fontSize: 12.5, color: "#6b7280", marginBottom: 16, lineHeight: 1.5 }}>LkSG-Compliance in 60 Sekunden. Kostenlose Testversion.</div>
          {[["Firmenname","Muster Automotive GmbH"],["E-Mail","max@muster-auto.de"],["Passwort","••••••••••"]].map(([l, v]) => (
            <div key={l} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, color: "#6b7280", textTransform: "uppercase" as const, letterSpacing: ".7px", marginBottom: 4 }}>{l}</div>
              <div style={{ padding: "9px 12px", border: "1.5px solid #1B3D2B", borderRadius: 8, fontSize: 13, color: l === "Passwort" ? "#9ca3af" : "#0b0f0c", background: "#f0f5f1" }}>{v}</div>
            </div>
          ))}
          <div style={{ width: "100%", padding: 11, background: "#1B3D2B", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 800, cursor: "pointer", textAlign: "center" as const, marginTop: 4, transform: "scale(.98)" }}>
            Workspace wird erstellt…
          </div>
          <div style={{ textAlign: "center" as const, fontSize: 11, color: "#9ca3af", marginTop: 10 }}>✓ 14 Tage kostenlos · Keine Kreditkarte</div>
        </div>
      </div>
    </Browser>
  );

  if (va === "otp") return (
    <Browser url="lksgcompass.de/register">
      <div style={{ background: "#f0f2f0", overflow: "auto", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", border: "1.5px solid #e4e6e4", borderRadius: 14, padding: 24, width: 340 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0b0f0c", marginBottom: 4, letterSpacing: "-.3px" }}>E-Mail bestätigen</div>
          <div style={{ fontSize: 12.5, color: "#6b7280", marginBottom: 14 }}>6-stelliger Code an <strong>max@muster-auto.de</strong></div>
          <div style={{ background: "#f0f5f1", border: "1px solid #d1e7d9", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#1B3D2B", marginBottom: 14 }}>✓ Code gesendet — gültig 15 Minuten</div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 14 }}>
            {["4","7","3","","",""].map((d, i) => (
              <div key={i} style={{ width: 42, height: 52, border: `1.5px solid ${d ? "#1B3D2B" : "#e4e6e4"}`, borderRadius: 8, fontSize: 22, fontWeight: 800, fontFamily: "monospace", background: d ? "#f0f5f1" : "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", color: d ? "#1B3D2B" : "#9ca3af" }}>{d}</div>
            ))}
          </div>
          <div style={{ width: "100%", padding: 10, background: "#1B3D2B", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 800, textAlign: "center" as const, cursor: "pointer" }}>Bestätigen →</div>
        </div>
      </div>
    </Browser>
  );

  // ── DASHBOARD ──
  if (chapter.id === "dashboard") return (
    <Browser url="lksgcompass.de/app/dashboard">
      <div style={{ display: "grid", gridTemplateColumns: "165px 1fr", height: "100%", background: "#f0f2f0" }}>
        <AppNav active="dashboard" />
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1.5px solid #e4e6e4", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0b0f0c", letterSpacing: "-.3px" }}>Dashboard</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 7, padding: "5px 10px", fontSize: 10.5, fontWeight: 700, cursor: "pointer" }}>↻</button>
              <button style={{ background: "#1B3D2B", color: "#fff", border: "none", borderRadius: 7, padding: "5px 10px", fontSize: 10.5, fontWeight: 700, cursor: "pointer", ...glow("addsup") }}>+ Lieferant</button>
            </div>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, ...glow("score") }}>
              {[["72","Score","#16A34A"],["5","Lieferanten","#0b0f0c"],["2","Offene CAPs","#DC2626"],["1","Beschwerden","#D97706"]].map(([n,l,c]) => (
                <div key={l} style={{ background: "#fff", border: "1.5px solid #e4e6e4", borderRadius: 10, padding: 10 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: c, letterSpacing: "-.5px" }}>{n}</div>
                  <div style={{ fontSize: 9.5, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: ".4px" }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Card>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#0b0f0c", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                  Risikoverteilung <span style={{ fontSize: 9, fontWeight: 700, color: "#1B3D2B", background: "#f0f5f1", border: "1px solid #d1e7d9", padding: "1px 6px", borderRadius: 4 }}>§5</span>
                </div>
                {[["Hoch","1 Lieferant","#ef4444",20],["Mittel","2 Lieferanten","#f59e0b",40],["Niedrig","2 Lieferanten","#22c55e",40]].map(([l,s,c,p]) => (
                  <Row key={String(l)}>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 11.5, fontWeight: 700, color: "#0b0f0c" }}>{String(l)}</div><div style={{ fontSize: 10, color: "#9CA3AF" }}>{String(s)}</div></div>
                    <Bar pct={p as number} color={String(c)} />
                  </Row>
                ))}
              </Card>
              <Card style={{ ...glow("bafa") }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#0b0f0c", marginBottom: 8 }}>BAFA-Bereitschaft</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {[["ok","§4 HR-Beauftragter ✓"],["ok","§5 Risikoanalyse ✓"],["warn","§6 CAPs: 2 offen"],["err","§8 Beauftragter fehlt"]].map(([t,l]) => (
                    <div key={String(l)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 7px", borderRadius: 6, background: t==="ok"?"#F0FDF4":t==="warn"?"#FFFBEB":"#FEF2F2", fontSize: 11, fontWeight: 600, color: t==="ok"?"#16A34A":t==="warn"?"#D97706":"#DC2626" }}>
                      <div style={{ width: 13, height: 13, borderRadius: "50%", background: t==="ok"?"#16A34A":t==="warn"?"#D97706":"#DC2626", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, flexShrink: 0 }}>{t==="ok"?"✓":t==="warn"?"!":"✕"}</div>
                      {String(l)}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      {mo==="new-supplier" && <Overlay>
        <Mh>Neuen Lieferanten hinzufügen</Mh><Ms>Risk Engine bewertet aus 190 Länderprofilen.</Ms>
        <Mfield label="Lieferantenname" value="Ankara Tekstil A.Ş." />
        <Mrow><Mfield label="Land" value="Türkei" /><Mfield label="Branche" value="Textil" /></Mrow>
        <Msub>Risiko berechnen →</Msub>
      </Overlay>}
    </Browser>
  );

  // ── SUPPLIERS ──
  if (chapter.id === "suppliers") return (
    <Browser url="lksgcompass.de/app/suppliers">
      <div style={{ display: "grid", gridTemplateColumns: "165px 1fr", height: "100%", background: "#f0f2f0" }}>
        <AppNav active="suppliers" />
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1.5px solid #e4e6e4", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0b0f0c" }}>Lieferanten <span style={{ fontSize: 11, color: "#9CA3AF" }}>5 gesamt</span></div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ background: "#F3F4F6", border: "none", borderRadius: 7, padding: "5px 10px", fontSize: 10.5, fontWeight: 700, cursor: "pointer", color: "#374151", ...glow("excel") }}>📤 Excel-Import</button>
              <button style={{ background: "#1B3D2B", color: "#fff", border: "none", borderRadius: 7, padding: "5px 10px", fontSize: 10.5, fontWeight: 700, cursor: "pointer" }}>+ Neu</button>
            </div>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "12px 16px" }}>
            <Card>
              {[{n:"Shenzhen Parts Co.",c:"🇨🇳 China",i:"Elektronik",s:78,r:"h"},{n:"Ankara Tekstil",c:"🇹🇷 Türkei",i:"Textil",s:52,r:"m"},{n:"Hanoi Electro",c:"🇻🇳 Vietnam",i:"Elektronik",s:61,r:"m"},{n:"Schmidt Logistik",c:"🇩🇪 Deutschland",i:"Logistik",s:18,r:"l"},{n:"Warsaw Auto Parts",c:"🇵🇱 Polen",i:"Automotive",s:24,r:"l"}].map(s => (
                <Row key={s.n} style={sp==="shenzhen"&&s.r==="h"?{...glow("shenzhen"),background:"rgba(239,68,68,.03)"}:{}}>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 700, color: "#0b0f0c", whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{s.n}</div><div style={{ fontSize: 10, color: "#9CA3AF" }}>{s.c} · {s.i}</div></div>
                  <Bar pct={s.s} color={s.r==="h"?"#ef4444":s.r==="m"?"#f59e0b":"#22c55e"} />
                  {s.r==="h"?<Bh>Hoch</Bh>:s.r==="m"?<Bm>Mittel</Bm>:<Bl>Niedrig</Bl>}
                </Row>
              ))}
            </Card>
          </div>
        </div>
      </div>
      {mo==="risk-detail" && <Overlay>
        <Mh>🇨🇳 Shenzhen Parts Co.</Mh><Ms>§5 LkSG — Vollständige Risikozerlegung</Ms>
        {[["Länderrisiko (China)","+ 35","#DC2626"],["Branche (Elektronik)","+ 18","#D97706"],["Kein Verhaltenskodex","+ 12","#DC2626"],["Kein Audit","+ 13","#DC2626"]].map(([l,v,c]) => <Mrrow key={String(l)} label={String(l)} value={String(v)} accent />)}
        <div style={{ marginTop: 10, padding: "8px 10px", background: "#FEF2F2", borderRadius: 7, border: "1px solid #FECACA", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>Gesamtscore</span><span style={{ fontSize: 17, fontWeight: 800, color: "#DC2626" }}>78 — Hoch</span>
        </div>
        <Msub>Korrekturmaßnahmen erstellen →</Msub>
      </Overlay>}
      {mo==="excel-import" && <Overlay>
        <Mh>📤 Excel-Import</Mh><Ms>Automatische Spaltenerkennung — auch türkische Bezeichnungen.</Ms>
        <div style={{ border: "2px dashed #d1e7d9", borderRadius: 9, padding: 20, textAlign: "center" as const, background: "#f0f5f1", marginBottom: 12 }}>
          <div style={{ fontSize: 24, marginBottom: 5 }}>📊</div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1B3D2B" }}>lieferanten_2024.xlsx</div>
          <div style={{ fontSize: 10.5, color: "#6b7280", marginTop: 2 }}>48 Zeilen · Spalten erkannt</div>
        </div>
        {[["BİNA / APT İSMİ","→ Firmenname"],["ÜLKE","→ Land"],["YÖN TELEFONU","→ Telefon"]].map(([a,b]) => (
          <div key={a} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #F3F4F6", fontSize: 11.5 }}>
            <span style={{ fontFamily: "monospace", color: "#6b7280" }}>{a}</span>
            <span style={{ color: "#16A34A", fontWeight: 700 }}>{b} ✓</span>
          </div>
        ))}
        <Msub>48 Lieferanten importieren →</Msub>
      </Overlay>}
    </Browser>
  );

  // ── COMPLAINTS ──
  if (chapter.id === "complaints") return (
    <Browser url="lksgcompass.de/app/complaints">
      <div style={{ display: "grid", gridTemplateColumns: "165px 1fr", height: "100%", background: "#f0f2f0" }}>
        <AppNav active="complaints" />
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1.5px solid #e4e6e4", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0b0f0c" }}>Beschwerden</div>
            <button style={{ background: "#F3F4F6", border: "none", borderRadius: 7, padding: "5px 10px", fontSize: 10.5, fontWeight: 700, cursor: "pointer", color: "#374151", ...glow("portal") }}>🔗 Portal-Link</button>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 9 }}>
            <div style={{ borderColor: "#FECACA", background: "#FFF5F5", cursor: "pointer", ...glow("critical"), border: "1.5px solid #FECACA", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 9.5, fontWeight: 800, color: "#DC2626", marginBottom: 2 }}>⚠ NEU · KRITISCH · Frist: 7 Tage</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0b0f0c" }}>Kinderarbeit bei Tier-2-Lieferant</div>
                  <div style={{ fontSize: 10, color: "#6b7280" }}>Shenzhen Parts · §2 Nr.1 LkSG</div>
                </div>
                <Bh>Kritisch</Bh>
              </div>
              <div style={{ fontSize: 11, color: "#374151", lineHeight: 1.6, padding: "7px 9px", background: "#fff", borderRadius: 6, border: "1px solid #FECACA", marginBottom: 8 }}>
                „Minderjährige unter 15 auf dem Produktionsflur beobachtet..."
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                <button style={{ background: "#1B3D2B", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 10.5, fontWeight: 700, cursor: "pointer" }}>CAP erstellen</button>
                <button style={{ background: "#F3F4F6", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 10.5, fontWeight: 700, cursor: "pointer", color: "#374151" }}>Bestätigen</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {mo==="complaint-detail" && <Overlay>
        <span style={{ display: "inline-flex", background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 4, marginBottom: 10 }}>§2 Nr.1 — Kinderarbeit</span>
        <Mh>Fall BSWD-3A1B</Mh><Ms>Vollständige Details, Fristen, Audit-Trail.</Ms>
        <div style={{ background: "#FFF5F5", border: "1px solid #FECACA", borderRadius: 8, padding: "9px 11px", marginBottom: 10, fontSize: 11, color: "#374151", lineHeight: 1.6 }}>
          „Minderjährige unter 15 bei unangemeldetem Besuch am 03.03.2025 beobachtet."
        </div>
        {[["Eingegangen","04.03.2025"],["Bestätigung bis","11.03 (7 Tage)"],["Untersuchung bis","04.06 (3 Monate)"]].map(([l,v]) => <Mrrow key={l} label={l} value={v} />)}
        <Msub>Korrekturmaßnahmenplan erstellen →</Msub>
      </Overlay>}
    </Browser>
  );

  // ── LEGAL ──
  if (chapter.id === "legal") return (
    <Browser url="lksgcompass.de/app/legal">
      <div style={{ display: "grid", gridTemplateColumns: "165px 1fr", height: "100%", background: "#f0f2f0" }}>
        <AppNav active="legal" />
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1.5px solid #e4e6e4", background: "#fff", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0b0f0c" }}>Rechtsassistent</div>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: "#7C3AED", background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 4, padding: "1px 6px" }}>NEU</span>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const }}>
              {[["📄 Vorlagen",va==="templates"],["❓ Rechtsfrage",false],["🔍 Vertragscheck",va==="review"],["🛡 Verteidigungsakte",false]].map(([l,on]) => (
                <div key={String(l)} style={{ padding: "5px 10px", borderRadius: 7, background: on?"#1B3D2B":"transparent", color: on?"#fff":"#6b7280", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{String(l)}</div>
              ))}
            </div>
            {va === "templates" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[{t:"Verhaltenskodex Lieferanten",r:"§6 Abs.2",tag:"Pflicht"},{t:"Vertragsklausel LkSG",r:"§6 Abs.3",tag:"Vertrag"},{t:"Lieferanten-SAQ",r:"§5 Abs.2",tag:"Fragebogen"},{t:"Auditprotokoll",r:"§6 Nr.2",tag:"Prozess"},{t:"Hinweisgeberschutz",r:"§8, HinSchG",tag:"Pflicht"},{t:"Risikoanalyse §5",r:"§5 Abs.1-4",tag:"Methodik"}].map(({ t, r, tag }) => (
                  <Card key={t} style={{ padding: "10px 11px" }}>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: "#0b0f0c", marginBottom: 5 }}>{t}</div>
                    <div style={{ display: "flex", gap: 4, marginBottom: 7 }}>
                      <span style={{ background: "#f0f5f1", border: "1px solid #d1e7d9", color: "#1B3D2B", fontSize: 9.5, fontWeight: 700, padding: "1px 6px", borderRadius: 4 }}>{r}</span>
                      <span style={{ background: "#F3F4F6", color: "#6b7280", fontSize: 9.5, fontWeight: 600, padding: "1px 6px", borderRadius: 4 }}>{tag}</span>
                    </div>
                    <div style={{ width: "100%", padding: "6px 0", background: "#1B3D2B", color: "#fff", borderRadius: 7, fontSize: 10.5, fontWeight: 700, textAlign: "center" as const, cursor: "pointer" }}>Generieren →</div>
                  </Card>
                ))}
              </div>
            )}
            {va === "review" && (
              <Card>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0b0f0c", marginBottom: 8 }}>🔍 Vertragscheck</div>
                <div style={{ padding: "9px 11px", border: "1.5px solid #e4e6e4", borderRadius: 9, fontSize: 11.5, color: "#9ca3af", minHeight: 60, marginBottom: 9 }}>Vertragstext einfügen — KI prüft §5–§10 LkSG-Abdeckung...</div>
                <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, padding: "10px 12px", fontSize: 11.5, color: "#374151", lineHeight: 1.65 }}>
                  <strong style={{ color: "#D97706", display: "block", marginBottom: 4 }}>⚠ 2 Lücken gefunden</strong>
                  (1) Auditrecht fehlt — §6 Abs.3 erfordert explizites Prüfungsrecht.<br />
                  (2) Weitergabepflicht an Sub-Lieferanten nicht enthalten.
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
      {mo==="coc" && <Overlay>
        <Mh>🤖 Verhaltenskodex wird erstellt...</Mh><Ms>Claude schreibt vollständigen §6 Abs.2-CoC auf Deutsch.</Ms>
        <Genbar text="§2 Menschenrechte wird verfasst..." />
        {["§2 Menschenrechte & Arbeit ✓","§2 Abs.3 Umweltstandards ✓","§2 Nr.10 Anti-Korruption..."].map((s, i) => (
          <div key={s} style={{ display: "flex", gap: 7, padding: "4px 0", fontSize: 11.5, color: i < 2 ? "#16A34A" : "#9CA3AF" }}><span>{i < 2 ? "✓" : "○"}</span>{s}</div>
        ))}
      </Overlay>}
    </Browser>
  );

  // ── REPORTS ──
  if (chapter.id === "reports") return (
    <Browser url="lksgcompass.de/app/reports">
      <div style={{ display: "grid", gridTemplateColumns: "165px 1fr", height: "100%", background: "#f0f2f0" }}>
        <AppNav active="reports" />
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1.5px solid #e4e6e4", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0b0f0c" }}>BAFA-Bericht 2024</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ background: "#F3F4F6", border: "none", borderRadius: 7, padding: "5px 10px", fontSize: 10.5, fontWeight: 700, cursor: "pointer", color: "#374151", ...glow("ai-btn") }}>🤖 KI-Entwurf</button>
              <button style={{ background: "#1B3D2B", color: "#fff", border: "none", borderRadius: 7, padding: "5px 10px", fontSize: 10.5, fontWeight: 700, cursor: "pointer" }}>📄 PDF</button>
            </div>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            <Card>
              {["§5 Risikoanalyse","§6 Präventionsmaßnahmen","§7 Abhilfe","§8 Beschwerdeverfahren","§9 Wirksamkeit","§10 Dokumentation"].map((s, i) => (
                <Row key={s}><div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: "#0b0f0c" }}>{s}</div></div>{i<4?<Bl>✓ Vollständig</Bl>:i===4?<Bm>In Bearbeitung</Bm>:<Bh>Offen</Bh>}</Row>
              ))}
            </Card>
          </div>
        </div>
      </div>
      {mo==="ai-gen" && <Overlay>
        <Mh>🤖 KI erstellt BAFA-Bericht...</Mh><Ms>Claude liest Ihre Echtdaten: 5 Lieferanten, 3 CAPs, 1 Beschwerde.</Ms>
        <Genbar text="§5 Risikodaten analysiert ✓" />
        {["§5 Risikodaten analysiert ✓","§6 Präventionsmaßnahmen ✓","§8 Beschwerdezusammenfassung..."].map((s,i) => (
          <div key={s} style={{ display: "flex", gap: 7, padding: "4px 0", fontSize: 11.5, color: i<2?"#16A34A":"#9CA3AF" }}><span>{i<2?"✓":"○"}</span>{s}</div>
        ))}
      </Overlay>}
      {mo==="ai-done" && <Overlay>
        <Sbadge>✓ KI-Entwurf fertig — 847 Wörter</Sbadge>
        <Mh>BAFA-Berichtsentwurf</Mh>
        <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "9px 11px", fontSize: 11, color: "#374151", lineHeight: 1.7, marginBottom: 10 }}>
          „Die Muster Automotive GmbH hat gemäß §5 LkSG eine Risikoanalyse für 5 direkte Lieferanten durchgeführt. Ein Lieferant wurde als hochriskant eingestuft und ein Abhilfemaßnahmenplan nach §7 LkSG initiiert..."
        </div>
        <div style={{ display: "flex", gap: 7 }}><div style={{ flex: 1 }}><Msub>Genehmigung einreichen →</Msub></div><button style={{ padding: "9px 12px", background: "#F3F4F6", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer", color: "#374151" }}>Bearbeiten</button></div>
      </Overlay>}
    </Browser>
  );

  // ── DEFENSE ──
  if (chapter.id === "defense") return (
    <Browser url="lksgcompass.de/app/legal">
      <div style={{ display: "grid", gridTemplateColumns: "165px 1fr", height: "100%", background: "#f0f2f0" }}>
        <AppNav active="legal" />
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1.5px solid #e4e6e4", background: "#fff", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0b0f0c" }}>BAFA-Verteidigungsakte</div>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: "#2563EB", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 4, padding: "1px 6px" }}>NEU</span>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            <Card style={{ border: "1.5px solid #1B3D2B" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0b0f0c", marginBottom: 4 }}>🛡 §5–§10 Compliance-Nachweis exportieren</div>
              <div style={{ fontSize: 11.5, color: "#6b7280", lineHeight: 1.55, marginBottom: 12 }}>Wenn BAFA ein Kontrollverfahren einleitet: alle Nachweise in einem strukturierten Dokument. Was Anwälte früher tagelang zusammengestellt haben.</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
                {["§5 Risikoanalyse","§6 Prävention","§7 Abhilfe","§8 Beschwerden","§9 KPI-Nachweise","§10 Audit-Trail (200 Einträge)"].map(s => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 9px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 7, fontSize: 11, fontWeight: 600, color: "#16A34A" }}>✓ {s}</div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <select style={{ padding: "8px 12px", border: "1.5px solid #e4e6e4", borderRadius: 8, fontSize: 13, background: "#fff", fontWeight: 700, color: "#0b0f0c" }}><option>2024</option><option>2023</option></select>
                <button style={{ padding: "9px 20px", background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, fontSize: 12.5, fontWeight: 800, cursor: "pointer", ...glow("download") }}>⬇ Akte herunterladen</button>
              </div>
            </Card>
            <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "11px 14px", fontSize: 11.5, color: "#2563EB", lineHeight: 1.6 }}>
              <strong>Enthält:</strong> Alle §5–§10-Daten, 200+ Audit-Trail-Einträge, vollständige Lieferantenprofile, Zeitstempel. Direkt an den Anwalt übergeben.
            </div>
          </div>
        </div>
      </div>
    </Browser>
  );

  // ── CTA ──
  if (chapter.id === "cta") return (
    <div style={{ height: "100%", background: "linear-gradient(135deg, #060d05 0%, #0d1f14 60%, #1B3D2B 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "40px 32px", textAlign: "center" as const, position: "relative" as const, overflow: "hidden" as const }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(74,222,128,.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,.3)", textTransform: "uppercase" as const, letterSpacing: "2px", marginBottom: 20, fontFamily: "monospace" }}>§4 · §5 · §6 · §7 · §8 · §9 · §10 LkSG</div>
      <div style={{ fontSize: "clamp(30px,4vw,52px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 14, maxWidth: 600 }}>
        LkSG-Compliance.<br /><span style={{ color: "#4ade80" }}>Vollständig.</span> Automatisiert.
      </div>
      <div style={{ fontSize: 15, color: "rgba(255,255,255,.5)", lineHeight: 1.7, marginBottom: 32, maxWidth: 440 }}>
        Von der Risikoanalyse bis zur BAFA-Verteidigungsakte. Kein IT-Projekt, keine Monate Einführung.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, maxWidth: 520, width: "100%", marginBottom: 32 }}>
        {[{t:"§5 Risiko-Scoring",s:"190 Länderprofile"},{t:"🤖 KI-BAFA-Bericht",s:"Entwurf in Sekunden"},{t:"⚖️ 6 Rechtsvorlagen",s:"CoC, SAQ, Vertrag..."},{t:"🛡 Verteidigungsakte",s:"§5–§10 auf Knopfdruck"},{t:"§8 Hinweisgebersystem",s:"Anonym & DSGVO"},{t:"👥 Team & Rollen",s:"5 Nutzer im Pro-Plan"}].map(({ t, s }) => (
          <div key={t} style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 11, padding: "12px 14px", textAlign: "left" as const }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", marginBottom: 3 }}>{t}</div>
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.4)" }}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" as const, marginBottom: 18 }}>
        <a href="/register" style={{ background: "#4ade80", color: "#0b1209", border: "none", borderRadius: 10, padding: "13px 30px", fontSize: 14.5, fontWeight: 800, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>Kostenlos starten →</a>
        <a href="mailto:hello@lksgcompass.de" style={{ border: "1.5px solid rgba(255,255,255,.2)", color: "rgba(255,255,255,.8)", background: "transparent", borderRadius: 10, padding: "12px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>Demo-Termin buchen</a>
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", fontFamily: "monospace", letterSpacing: ".3px" }}>✓ 14 Tage kostenlos · Keine Kreditkarte · DSGVO-konform · EU-Hosting</div>
    </div>
  );

  return null;
}

// ─── MAIN DEMO ────────────────────────────────────────────────────────────────
const CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body{font-family:'DM Sans',system-ui,sans-serif;background:#05090400;color:#fff;height:100%;overflow:hidden}
  html,body{background:#060d05}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
  @keyframes pulse{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
  @keyframes ticker{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  @keyframes chapterIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:none}}
  @keyframes barFill{from{width:0}to{width:var(--target)}}
  .shell{display:grid;grid-template-rows:52px 1fr 64px;height:100vh;overflow:hidden;background:#060d05}
  /* topbar */
  .tb{display:flex;align-items:center;justify-content:space-between;padding:0 24px;background:rgba(6,9,4,.92);border-bottom:1px solid rgba(255,255,255,.06);backdrop-filter:blur(12px);z-index:50}
  .logo{font-size:16px;font-weight:800;color:#fff;text-decoration:none;letter-spacing:-.3px}
  .logo em{font-style:normal;color:rgba(255,255,255,.28)}
  .tb-r{display:flex;align-items:center;gap:10px}
  .tb-badge{font-size:10px;font-weight:700;letter-spacing:.5px;color:#4ade80;background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.18);padding:3px 10px;border-radius:99px;text-transform:uppercase}
  .tb-cta{background:#4ade80;color:#060d05;border:none;border-radius:8px;padding:7px 18px;font-size:13px;font-weight:800;cursor:pointer;text-decoration:none;transition:all .2s}
  .tb-cta:hover{background:#22c55e;transform:translateY(-1px)}
  /* main */
  .main{display:grid;grid-template-columns:220px 1fr;overflow:hidden;height:100%}
  /* sidebar */
  .sidebar{display:flex;flex-direction:column;border-right:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.015);overflow:hidden;padding:12px 0}
  .ch-btn{display:flex;align-items:center;gap:10px;width:100%;padding:10px 16px;background:none;border:none;cursor:pointer;text-align:left;position:relative;transition:background .15s}
  .ch-btn:hover{background:rgba(255,255,255,.04)}
  .ch-btn.on{background:rgba(255,255,255,.06)}
  .ch-num{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;flex-shrink:0;font-family:monospace;background:rgba(255,255,255,.06);color:rgba(255,255,255,.3);transition:all .2s}
  .on .ch-num{color:#060d05}
  .done .ch-num{background:rgba(74,222,128,.15);color:#4ade80}
  .ch-info{min-width:0}
  .ch-title{font-size:12px;font-weight:700;color:rgba(255,255,255,.45);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color .15s}
  .on .ch-title{color:#fff}
  .ch-law{font-size:9.5px;color:rgba(255,255,255,.22);margin-top:1px;font-family:monospace}
  .on .ch-law{color:rgba(255,255,255,.45)}
  .ch-done{margin-left:auto;font-size:11px;opacity:0;transition:opacity .2s;flex-shrink:0;color:#4ade80}
  .done .ch-done{opacity:1}
  /* viewport */
  .viewport{position:relative;overflow:hidden}
  .vf{position:absolute;inset:0;opacity:0;transform:translateY(8px) scale(.99);transition:opacity .45s cubic-bezier(.4,0,.2,1),transform .45s cubic-bezier(.4,0,.2,1);pointer-events:none}
  .vf.vis{opacity:1;transform:none;pointer-events:auto}
  /* bottom bar */
  .bbar{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 24px;background:rgba(6,9,4,.92);border-top:1px solid rgba(255,255,255,.06);backdrop-filter:blur(12px)}
  .bbar-l{display:flex;align-items:center;gap:8px}
  .bbar-c{display:flex;flex-direction:column;align-items:center;gap:7px}
  .bbar-r{display:flex;align-items:center;gap:8px;justify-content:flex-end}
  .btn{display:flex;align-items:center;gap:5px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.6);font-size:12px;font-weight:700;padding:7px 14px;border-radius:8px;cursor:pointer;transition:all .15s}
  .btn:hover{background:rgba(255,255,255,.1);color:#fff}
  .btn:disabled{opacity:.2;cursor:not-allowed}
  .btn-p{background:rgba(74,222,128,.12);border-color:rgba(74,222,128,.25);color:#4ade80}
  .btn-p:hover{background:rgba(74,222,128,.2)}
  .btn-cta{background:#4ade80;border:none;color:#060d05;font-weight:800}
  .btn-cta:hover{background:#22c55e;color:#060d05}
  .fdots{display:flex;gap:4px}
  .fd{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.15);cursor:pointer;transition:all .3s}
  .fd.on{background:#4ade80;width:16px;border-radius:3px}
  .fd.done{background:rgba(74,222,128,.4)}
  /* subtitle */
  .subtitle{position:absolute;bottom:0;left:0;right:0;padding:16px 24px 0;background:linear-gradient(transparent,rgba(0,0,0,.7) 30%);pointer-events:none;z-index:20;min-height:64px;display:flex;align-items:flex-end}
  .subtitle-inner{font-size:14px;font-weight:600;color:#fff;line-height:1.55;text-shadow:0 1px 4px rgba(0,0,0,.8);max-width:800px;font-style:italic}
  /* progress */
  .prog{position:absolute;top:0;left:0;right:0;height:2px;z-index:30;overflow:hidden;background:rgba(255,255,255,.05)}
  .prog-fill{height:100%;transition:width .1s linear}
  /* narr panel — hidden, narrations shown as subtitles */
  @media(max-width:860px){.main{grid-template-columns:1fr}.sidebar{display:none}}
`;

export default function DemoPage() {
  const [cIdx, setCIdx] = useState(0);
  const [fIdx, setFIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [visited, setVisited] = useState(new Set([0]));
  const [pct, setPct] = useState(0);
  const [subtitle, setSubtitle] = useState("");
  const [subtitleKey, setSubtitleKey] = useState(0);

  const ch = CHAPTERS[cIdx];
  const fr = ch.frames[fIdx];
  const nf = ch.frames.length;

  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const playRef    = useRef(true);
  const speechRef  = useRef(false);
  const minRef2    = useRef(false);

  useEffect(() => { playRef.current = playing; }, [playing]);

  const clearAll = useCallback(() => {
    [timerRef, minRef].forEach(r => { if (r.current) { clearTimeout(r.current); r.current = null; } });
    if (progRef.current) { clearInterval(progRef.current); progRef.current = null; }
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, []);

  const runProg = useCallback((dur: number) => {
    if (progRef.current) clearInterval(progRef.current);
    setPct(0);
    const tick = 80, steps = dur / tick;
    let i = 0;
    progRef.current = setInterval(() => {
      i++;
      setPct(Math.min(88, (i / steps) * 100));
      if (i >= steps) clearInterval(progRef.current!);
    }, tick);
  }, []);

  const go = useCallback((ci: number, fi: number) => {
    if (!playRef.current) return;
    const chapter = CHAPTERS[ci];
    const frame = chapter.frames[fi];

    clearAll();
    setCIdx(ci); setFIdx(fi); setPct(0);
    setSubtitle(frame.narration);
    setSubtitleKey(k => k + 1);
    setVisited(v => new Set([...v, ci]));

    speechRef.current = false;
    minRef2.current = false;

    const MIN = 5500;
    const MAX = 16000;
    runProg(MAX);

    const advance = () => {
      if (!speechRef.current || !minRef2.current || !playRef.current) return;
      setPct(100);
      clearInterval(progRef.current!);
      timerRef.current = setTimeout(() => {
        const nextFi = fi + 1;
        if (nextFi < chapter.frames.length) go(ci, nextFi);
        else go((ci + 1) % CHAPTERS.length, 0); // seamless loop
      }, 900);
    };

    minRef.current = setTimeout(() => {
      minRef2.current = true;
      advance();
      // hard fallback
      timerRef.current = setTimeout(() => { speechRef.current = true; minRef2.current = true; advance(); }, MAX - MIN + 2000);
    }, MIN);

    // Speech
    if (!muted && typeof window !== "undefined" && window.speechSynthesis) {
      setTimeout(() => {
        const u = new SpeechSynthesisUtterance(frame.narration);
        u.lang = "de-DE"; u.rate = 0.88; u.pitch = 1.05; u.volume = 1;
        const voices = window.speechSynthesis.getVoices();
        const v = voices.find(v =>
          (v.lang.startsWith("de") &&
           (v.name.includes("Anna") || v.name.includes("Google") || v.name.includes("Petra") || v.name.includes("Yannick"))) ||
          (v.lang.startsWith("en") &&
           (v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Daniel")))
        );
        if (v) { u.voice = v; u.lang = v.lang; }
        u.onend = () => { speechRef.current = true; advance(); };
        u.onerror = () => { speechRef.current = true; advance(); };
        window.speechSynthesis.speak(u);
      }, 200);
    } else {
      speechRef.current = true;
    }
  }, [muted, clearAll, runProg]);

  useEffect(() => {
    const t = setTimeout(() => go(0, 0), 700);
    return () => { clearTimeout(t); clearAll(); };
  }, []);

  useEffect(() => { if (!playing) { clearAll(); setPct(0); } else go(cIdx, fIdx); }, [playing]);
  useEffect(() => { if (muted) window.speechSynthesis?.cancel(); }, [muted]);

  function jumpTo(ci: number, fi = 0) {
    if (playing) go(ci, fi);
    else { clearAll(); setCIdx(ci); setFIdx(fi); setPct(0); setSubtitle(CHAPTERS[ci].frames[fi].narration); setSubtitleKey(k=>k+1); setVisited(v => new Set([...v, ci])); }
  }

  const overall = ((cIdx + fIdx / Math.max(nf, 1)) / CHAPTERS.length) * 100;
  const isLast = cIdx === CHAPTERS.length - 1 && fIdx === nf - 1;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="shell">
        {/* Top bar */}
        <div className="tb">
          <a href="/" className="logo">LkSG<em>Compass</em></a>
          <div className="tb-r">
            <div className="tb-badge">Live Demo</div>
            <a href="/register" className="tb-cta">Kostenlos starten →</a>
          </div>
        </div>

        {/* Main */}
        <div className="main">
          {/* Sidebar chapters */}
          <div className="sidebar">
            <div style={{ padding: "0 16px 10px", fontSize: 9.5, fontWeight: 800, color: "rgba(255,255,255,.22)", textTransform: "uppercase", letterSpacing: "1.5px" }}>Kapitel</div>
            {CHAPTERS.map((ch, i) => (
              <button key={ch.id}
                className={`ch-btn${cIdx===i?" on":""}${visited.has(i)&&cIdx!==i?" done":""}`}
                onClick={() => jumpTo(i)}
                style={{ position: "relative" }}>
                {cIdx === i && (
                  <div style={{ position: "absolute", left: 0, top: "15%", bottom: "15%", width: 3, borderRadius: "0 2px 2px 0", background: ch.color }} />
                )}
                <div className="ch-num" style={cIdx===i ? { background: ch.color, color: "#060d05" } : {}}>{ch.num}</div>
                <div className="ch-info">
                  <div className="ch-title">{ch.title}</div>
                  <div className="ch-law">{ch.law}</div>
                </div>
                <div className="ch-done">✓</div>
              </button>
            ))}
          </div>

          {/* Viewport */}
          <div className="viewport">
            {/* Progress bar */}
            <div className="prog">
              <div className="prog-fill" style={{ width: `${pct}%`, background: ch.color }} />
            </div>
            {/* Chapter title overlay */}
            <div style={{ position: "absolute", top: 14, left: 16, zIndex: 25, display: "flex", alignItems: "center", gap: 8, pointerEvents: "none" }}>
              <div style={{ background: "rgba(0,0,0,.55)", backdropFilter: "blur(8px)", border: `1px solid ${ch.color}30`, borderRadius: 8, padding: "5px 11px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: ch.color, animation: playing?"pulse 2s infinite":"none" }} />
                <span style={{ fontSize: 10.5, fontWeight: 800, color: "rgba(255,255,255,.7)", fontFamily: "monospace", letterSpacing: ".5px" }}>{ch.num} — {ch.title}</span>
                <span style={{ fontSize: 9.5, color: "rgba(255,255,255,.3)", fontFamily: "monospace" }}>{ch.law}</span>
              </div>
            </div>
            {/* Frames */}
            {CHAPTERS.map((chapter, ci) =>
              chapter.frames.map((frame, fi) => (
                <div key={`${ci}-${fi}`} className={`vf${cIdx===ci&&fIdx===fi?" vis":""}`}>
                  <Scene chapter={chapter} frame={frame} hl={cIdx===ci&&fIdx===fi} color={chapter.color} />
                </div>
              ))
            )}
            {/* Subtitles */}
            <div className="subtitle">
              <div key={subtitleKey} className="subtitle-inner" style={{ animation: "ticker .35s ease forwards" }}>
                "{subtitle}"
              </div>
            </div>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="bbar">
          <div className="bbar-l">
            <button className="btn" disabled={cIdx===0&&fIdx===0}
              onClick={() => { setPlaying(false); if(fIdx>0) jumpTo(cIdx,fIdx-1); else if(cIdx>0) jumpTo(cIdx-1,CHAPTERS[cIdx-1].frames.length-1); }}>
              ← Zurück
            </button>
            <button className="btn" onClick={() => setMuted(m=>!m)} style={{ padding: "7px 10px" }}>
              {muted ? "🔇" : "🔊"}
            </button>
          </div>
          <div className="bbar-c">
            <div className="fdots">
              {ch.frames.map((_,fi) => (
                <div key={fi} className={`fd${fIdx===fi?" on":fi<fIdx?" done":""}`} onClick={()=>jumpTo(cIdx,fi)} />
              ))}
            </div>
            <button className="btn btn-p" onClick={() => { if(playing){clearAll();setPlaying(false);}else{setPlaying(true);go(cIdx,fIdx);} }}>
              {playing ? "⏸ Pause" : "▶ Abspielen"}
            </button>
          </div>
          <div className="bbar-r">
            {isLast
              ? <a href="/register" className="btn btn-cta" style={{ textDecoration: "none" }}>Kostenlos starten →</a>
              : <button className="btn btn-p" onClick={() => { setPlaying(false); if(fIdx<nf-1) jumpTo(cIdx,fIdx+1); else jumpTo(cIdx+1,0); }}>
                  Weiter →
                </button>
            }
          </div>
        </div>
      </div>
    </>
  );
}
