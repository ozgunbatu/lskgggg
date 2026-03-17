"use client";
import { useState } from "react";
import { canWrite } from "@/lib/workspace-access";

// ── All 10 BAFA sections matching backend ReportDraft keys exactly ──────────
const BAFA_SECTIONS = [
  { id:"reporting_scope",       para:"§10",  de:"1. Berichtsumfang",                       en:"1. Reporting scope",               req:false },
  { id:"organization_structure",para:"§10",  de:"2. Unternehmensstruktur",                  en:"2. Org structure",                 req:true  },
  { id:"responsible_persons",   para:"§4",   de:"3. Verantwortliche Personen",              en:"3. Responsible persons",           req:true  },
  { id:"risk_methodology",      para:"§5",   de:"4. Risikoanalyse — Methodik",              en:"4. Risk methodology",              req:false },
  { id:"prioritized_risks",     para:"§5",   de:"5. Priorisierte Risiken",                  en:"5. Prioritised risks",             req:false },
  { id:"prevention_measures",   para:"§6",   de:"6. Präventionsmaßnahmen",                  en:"6. Prevention measures",           req:false },
  { id:"remediation_measures",  para:"§7",   de:"7. Abhilfemaßnahmen (CAPs)",               en:"7. Remediation measures",          req:false },
  { id:"complaints_procedure",  para:"§8",   de:"8. Beschwerdeverfahren",                   en:"8. Complaints procedure",          req:false },
  { id:"complaints_access_groups",para:"§8", de:"8b. Zugangsberechtigte Gruppen",           en:"8b. Access groups",                req:false },
  { id:"effectiveness_review",  para:"§9",   de:"9. Wirksamkeitskontrolle",                 en:"9. Effectiveness review",          req:true  },
];

// Required sections that must be filled (shown with warning if empty)
const REQUIRED_IDS = ["organization_structure","responsible_persons","effectiveness_review"];

export default function ReportsTab(props: any) {
  const { L, draft, setDraft, draftTs, rYear, setRYear, genLd, setGenLd,
    loadDraft, saveDraft, exportCSV, suppliers, complaints, actions,
    score, kpis, actionStats, approvalMeta, toast } = props;

  const writable = canWrite(approvalMeta?.currentRole || "admin");
  const [activeSection, setActiveSection] = useState<string>("reporting_scope");
  const [generating, setGenerating] = useState(false);

  // draft is an object with field keys — normalise
  const draftObj: Record<string,string> = (draft && typeof draft === "object" && !Array.isArray(draft))
    ? draft
    : typeof draft === "string"
      ? { reporting_scope: draft }
      : {};

  const filled = BAFA_SECTIONS.filter(s => draftObj[s.id]?.trim()).length;
  const totalSections = BAFA_SECTIONS.length;
  const pct = Math.round((filled / totalSections) * 100);

  // How many required sections are empty
  const missingRequired = BAFA_SECTIONS.filter(s => s.req && !draftObj[s.id]?.trim()).length;

  // Load + auto-generate all sections at once
  const handleLoad = async () => {
    setGenerating(true);
    try { await loadDraft(); }
    finally { setGenerating(false); }
  };

  // Generate single section via AI (calls loadDraft which auto-generates)
  const handleGenSection = async (sectionId: string) => {
    if (!writable) return;
    if (setGenLd) setGenLd(sectionId);
    setGenerating(true);
    try {
      // Call the draft endpoint which auto-generates all sections
      await loadDraft();
      // Jump to the generated section
      setActiveSection(sectionId);
    } finally {
      setGenerating(false);
      if (setGenLd) setGenLd("");
    }
  };

  const handleSaveField = (sectionId: string, value: string) => {
    const updated = { ...draftObj, [sectionId]: value };
    setDraft(updated);
  };

  // Full text export (all sections concatenated)
  const handleExportText = () => {
    const lines: string[] = [];
    lines.push(`BAFA-Rechenschaftsbericht ${rYear}`);
    lines.push("=".repeat(60));
    lines.push("");
    BAFA_SECTIONS.forEach(s => {
      const label = L === "de" ? s.de : s.en;
      const content = draftObj[s.id] || "";
      lines.push(`${label} (${s.para} LkSG)`);
      lines.push("-".repeat(40));
      lines.push(content || (L === "de" ? "[Noch nicht ausgefüllt]" : "[Not yet filled]"));
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `bafa-bericht-${rYear}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const activeS = BAFA_SECTIONS.find(s => s.id === activeSection)!;
  const activeContent = draftObj[activeSection] || "";
  const isRequiredEmpty = REQUIRED_IDS.includes(activeSection) && !activeContent.trim();

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--g2)", textTransform:"uppercase", letterSpacing:".1em", fontFamily:"'DM Mono',monospace", marginBottom:3 }}>§10 LkSG · BAFA</div>
          <div style={{ fontSize:20, fontWeight:800, color:"var(--t1)", letterSpacing:"-.04em" }}>
            {L==="de" ? "BAFA-Rechenschaftsbericht" : "BAFA Accountability Report"}
          </div>
          <div style={{ fontSize:12.5, color:"var(--t3)", marginTop:2 }}>
            {L==="de"
              ? "Alle 10 Pflichtabschnitte nach §10 Abs.2 LkSG. Automatisch generiert, manuell verfeinerbar."
              : "All 10 mandatory sections per §10 para.2 LkSG. Auto-generated, manually refinable."}
          </div>
        </div>
        <div className="brow">
          <select className="sel" style={{ width:90, height:32, fontSize:12.5 }} value={rYear} onChange={e => setRYear(+e.target.value)}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-ai btn-sm" onClick={handleLoad} disabled={generating}>
            {generating ? <span className="spin-d"/> : "✦"} {L==="de" ? "KI-Generierung" : "AI Generate"}
          </button>
          <button className="btn btn-g btn-sm" onClick={saveDraft} disabled={!writable || !draft}>
            ✓ {L==="de" ? "Speichern" : "Save"}
          </button>
          <button className="btn btn-g btn-sm" onClick={handleExportText} disabled={!draft}>
            ↓ {L==="de" ? "Export" : "Export"}
          </button>
          {draftTs && (
            <span style={{ fontSize:10.5, color:"var(--t4)", fontFamily:"'DM Mono',monospace" }}>
              {L==="de" ? "Gespeichert" : "Saved"} {new Date(draftTs).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* ── WARNINGS ────────────────────────────────────────────────── */}
      {missingRequired > 0 && (
        <div className="al al-warn">
          <span className="al-icon">⚠</span>
          <div style={{ fontSize:12.5 }}>
            <strong>{L==="de" ? "BAFA-Pflichtfelder ausstehend:" : "BAFA mandatory fields missing:"}</strong>{" "}
            {L==="de"
              ? `${missingRequired} Pflichtabschnitt(e) müssen ausgefüllt werden, bevor der Bericht eingereicht werden kann.`
              : `${missingRequired} mandatory section(s) must be filled before report submission.`}
          </div>
        </div>
      )}

      {/* ── PROGRESS + STATS ────────────────────────────────────────── */}
      <div className="card-sm" style={{ display:"flex", alignItems:"center", gap:16 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ fontSize:11, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:".08em", fontFamily:"'DM Mono',monospace" }}>
              {filled}/{totalSections} {L==="de" ? "Abschnitte" : "sections"}
            </span>
            <span style={{ fontSize:11, fontWeight:700, color:pct===100?"var(--g)":pct>=60?"var(--amb)":"var(--red)", fontFamily:"'DM Mono',monospace" }}>{pct}%</span>
          </div>
          <div className="prog" style={{ height:5 }}>
            <div className="prog-fill" style={{ width:`${pct}%`, background:pct===100?"var(--g)":pct>=60?"var(--amb)":"var(--red)" }}/>
          </div>
        </div>
        <div style={{ display:"flex", gap:0, borderRadius:"var(--r2)", border:"1px solid var(--line)", overflow:"hidden", flexShrink:0 }}>
          {[
            { l:L==="de"?"Lieferanten":"Suppliers", v:kpis.total,       c:"var(--blu)" },
            { l:"CAPs",                             v:actionStats.total, c:"var(--amb)" },
            { l:L==="de"?"Meldungen":"Complaints",  v:complaints.length, c:"var(--vio)" },
            { l:"Score",                            v:score?.total??0,   c:"var(--g)"   },
          ].map((s,i) => (
            <div key={s.l} style={{ textAlign:"center", padding:"8px 12px", borderLeft:i>0?"1px solid var(--line)":"none", minWidth:64 }}>
              <div style={{ fontSize:18, fontWeight:800, color:s.c, fontVariantNumeric:"tabular-nums" }}>{s.v}</div>
              <div style={{ fontSize:10, color:"var(--t3)" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN: section list + editor ─────────────────────────────── */}
      <div className="g2" style={{ gap:14 }}>

        {/* Section list */}
        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
          {BAFA_SECTIONS.map(s => {
            const isFilled = !!draftObj[s.id]?.trim();
            const isActive = activeSection === s.id;
            const isReq = s.req;
            const missing = isReq && !isFilled;
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"10px 13px", borderRadius:"var(--r2)",
                background: isActive ? "var(--g3)" : "var(--card)",
                border: `1.5px solid ${isActive ? "var(--g4)" : missing ? "var(--red-bd)" : isFilled ? "var(--g4)" : "var(--line)"}`,
                textAlign:"left", cursor:"pointer",
                transition:"all .12s", width:"100%",
                boxShadow: isActive ? "inset 3px 0 0 var(--g)" : "none",
              }}>
                {/* Status dot */}
                <span style={{
                  width:8, height:8, borderRadius:"50%", flexShrink:0,
                  background: isFilled ? "var(--g)" : missing ? "var(--red)" : "var(--line2)",
                }}/>
                {/* Para badge */}
                <span style={{
                  fontSize:9, fontWeight:700, fontFamily:"'DM Mono',monospace",
                  color:isFilled?"var(--g2)":"var(--t4)",
                  background:isFilled?"var(--g3)":"var(--bg)",
                  border:`1px solid ${isFilled?"var(--g4)":"var(--line)"}`,
                  borderRadius:20, padding:"1px 6px", flexShrink:0,
                }}>{s.para}</span>
                <span style={{ flex:1, fontSize:12.5, color:isActive?"var(--g)":isFilled?"var(--t1)":"var(--t2)", fontWeight:isActive||isFilled?600:400, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {L==="de" ? s.de : s.en}
                </span>
                {isReq && !isFilled && (
                  <span style={{ fontSize:9, color:"var(--red)", fontWeight:700, flexShrink:0 }}>
                    {L==="de"?"Pflicht":"Req."}
                  </span>
                )}
                {isFilled && <span style={{ fontSize:11, color:"var(--g)", flexShrink:0 }}>✓</span>}
                {!isFilled && !generating && (
                  <button
                    className="btn btn-g btn-xs"
                    style={{ flexShrink:0 }}
                    onClick={e => { e.stopPropagation(); handleGenSection(s.id); }}
                    disabled={generating || !writable}
                  >
                    ✦
                  </button>
                )}
              </button>
            );
          })}

          {/* Generate all */}
          <button className="btn btn-ai" style={{ width:"100%", marginTop:4 }} onClick={handleLoad} disabled={generating || !writable}>
            {generating ? <span className="spin"/> : "✦"} {L==="de" ? "Alle Abschnitte generieren" : "Generate all sections"}
          </button>
        </div>

        {/* Editor panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {/* Section header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:"var(--card)", borderRadius:"var(--r3)", border:"1px solid var(--line)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:10, fontWeight:700, fontFamily:"'DM Mono',monospace", color:"var(--g2)", background:"var(--g3)", border:"1px solid var(--g4)", borderRadius:20, padding:"2px 8px" }}>
                {activeS.para}
              </span>
              <span style={{ fontSize:13.5, fontWeight:700, color:"var(--t1)" }}>{L==="de" ? activeS.de : activeS.en}</span>
              {REQUIRED_IDS.includes(activeS.id) && (
                <span style={{ fontSize:9, fontWeight:700, color:"var(--amb)", background:"var(--amb-bg)", border:"1px solid var(--amb-bd)", borderRadius:20, padding:"1px 6px", fontFamily:"'DM Mono',monospace" }}>
                  {L==="de" ? "BAFA-PFLICHTFELD" : "BAFA REQUIRED"}
                </span>
              )}
            </div>
            <button className="btn btn-ai btn-xs" onClick={() => handleGenSection(activeS.id)} disabled={generating || !writable}>
              {generating ? <span className="spin-d"/> : "✦"} {L==="de" ? "Generieren" : "Generate"}
            </button>
          </div>

          {isRequiredEmpty && (
            <div className="al al-warn" style={{ marginBottom:0 }}>
              <span className="al-icon">⚠</span>
              <div style={{ fontSize:12 }}>
                {L==="de"
                  ? "Pflichtfeld: Muss vor BAFA-Einreichung ausgefüllt sein. Klick auf «Generieren» für einen KI-Entwurf."
                  : "Required: Must be filled before BAFA submission. Click «Generate» for an AI draft."}
              </div>
            </div>
          )}

          <textarea
            className="ta"
            style={{ minHeight:400, fontFamily:"'DM Mono',monospace", fontSize:12, lineHeight:1.8, resize:"none" }}
            value={activeContent}
            onChange={e => handleSaveField(activeS.id, e.target.value)}
            placeholder={generating
              ? (L==="de" ? "KI generiert gerade…" : "AI is generating…")
              : (L==="de" ? `${activeS.de} hier eingeben oder KI-Generierung starten…` : `Enter ${activeS.en} here or start AI generation…`)
            }
            disabled={!writable || generating}
          />

          <div className="brow">
            <button className="btn btn-p btn-sm" onClick={saveDraft} disabled={!writable || !draft}>
              ✓ {L==="de" ? "Speichern" : "Save"}
            </button>
            <button className="btn btn-g btn-sm" onClick={handleExportText} disabled={!draft}>
              ↓ {L==="de" ? "Als .txt exportieren" : "Export as .txt"}
            </button>
            <div style={{ flex:1 }}/>
            {/* Nav between sections */}
            <button className="btn btn-g btn-xs" onClick={() => {
              const idx = BAFA_SECTIONS.findIndex(s => s.id === activeSection);
              if (idx > 0) setActiveSection(BAFA_SECTIONS[idx - 1].id);
            }} disabled={BAFA_SECTIONS[0].id === activeSection}>← {L==="de"?"Zurück":"Prev"}</button>
            <button className="btn btn-g btn-xs" onClick={() => {
              const idx = BAFA_SECTIONS.findIndex(s => s.id === activeSection);
              if (idx < BAFA_SECTIONS.length - 1) setActiveSection(BAFA_SECTIONS[idx + 1].id);
            }} disabled={BAFA_SECTIONS[BAFA_SECTIONS.length - 1].id === activeSection}>{L==="de"?"Weiter":"Next"} →</button>
          </div>

          {/* Approval section */}
          {approvalMeta && (
            <div className="card-sm" style={{ marginTop:4 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexWrap:"wrap" }}>
                <div>
                  <div style={{ fontSize:12.5, fontWeight:600, color:"var(--t1)", marginBottom:2 }}>
                    {L==="de" ? "Freigabestatus" : "Approval status"}
                    <span className={`chip ${approvalMeta.lastStatus==="approved"?"cl":approvalMeta.lastStatus==="rejected"?"ch":approvalMeta.lastStatus==="pending"?"cm":"cu"}`} style={{ marginLeft:8, fontSize:9.5 }}>
                      {approvalMeta.lastStatus==="approved"?(L==="de"?"Freigegeben":"Approved"):approvalMeta.lastStatus==="rejected"?(L==="de"?"Abgelehnt":"Rejected"):approvalMeta.lastStatus==="pending"?(L==="de"?"Ausstehend":"Pending"):(L==="de"?"Kein Antrag":"No request")}
                    </span>
                  </div>
                  <div style={{ fontSize:11.5, color:"var(--t3)" }}>
                    {approvalMeta.pending > 0 ? `${approvalMeta.pending} ${L==="de"?"ausstehende Genehmigung(en)":"pending approval(s)"}` : L==="de"?"Kein offener Freigabeantrag":"No pending approval request"}
                  </div>
                </div>
                <div className="brow">
                  {approvalMeta.canRequest && approvalMeta.lastStatus !== "pending" && (
                    <button className="btn btn-p btn-sm" onClick={() => approvalMeta.requestApproval(rYear)} disabled={!draft}>
                      {L==="de" ? "Freigabe beantragen" : "Request approval"}
                    </button>
                  )}
                  {approvalMeta.canApprove && approvalMeta.lastStatus === "pending" && (
                    <>
                      <button className="btn btn-ai btn-sm" onClick={() => approvalMeta.reviewApproval(rYear, "approved")}>✓ {L==="de"?"Freigeben":"Approve"}</button>
                      <button className="btn btn-r btn-sm" onClick={() => approvalMeta.reviewApproval(rYear, "rejected")}>✕ {L==="de"?"Ablehnen":"Reject"}</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
