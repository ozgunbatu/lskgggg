import React from "react";
import WorkspaceDataState from "../workspace/WorkspaceDataState";
import WorkspaceSectionMeta from "../workspace/WorkspaceSectionMeta";
import WorkspaceApprovalSummary from "../workspace/WorkspaceApprovalSummary";
import SkeletonCard from "@/components/workspace/SkeletonCard";
import type { DashboardTabProps, Supplier } from "@/lib/workspace-types";

const PAL = {
  high: { c:"var(--red)",   bg:"var(--red-5)",  b:"var(--red-15)"  },
  medium:{ c:"var(--amb)",  bg:"var(--amb-5)",  b:"var(--amb-15)"  },
  low:   { c:"var(--g-lo)", bg:"var(--g-5)",    b:"var(--g-20)"    },
  unknown:{ c:"var(--t3)", bg:"var(--c3)",      b:"var(--b2)"      },
};

export default function DashboardTab(props: DashboardTabProps) {
  const {
    L, requestState, reloads, showQuickstart, dismissQuickstart,
    quickstartSteps, quickstartDone, complaints, suppliers, actions,
    draftTs, setTab, score, actionStats, kpis, recalc, loading,
    approvalMeta, expanded, setExpanded, RiskBreakdown,
    openAddSupModal, setShowCapModal, gradeLabel, scCol, sc, sg,
    csv, setCsv, importCsv, COUNTRIES, INDUSTRIES,
  } = props;

  const openComplaints  = complaints.filter((c:any) => c.status === "open").length;
  const overdueActions  = actions.filter((a:any) => a.due_date && new Date(a.due_date) < new Date() && a.status !== "completed" && a.status !== "closed").length;
  const topRisk = [...(suppliers as Supplier[])].filter(s => s.risk_level === "high" || s.risk_level === "medium").sort((a,b) => (b.risk_score||0)-(a.risk_score||0)).slice(0,5);
  const bafaChecks = [
    { para:"§5", ok: suppliers.length > 0,                                             label: L==="de" ? "Lieferanten erfasst" : "Suppliers recorded" },
    { para:"§5", ok: (suppliers as any[]).some((s:any) => s.risk_score > 0),           label: L==="de" ? "Risikoanalyse abgeschlossen" : "Risk analysis completed" },
    { para:"§7", ok: actionStats.total > 0,                                             label: L==="de" ? "CAPs angelegt" : "CAPs created" },
    { para:"§8", ok: complaints.length >= 0,                                             label: L==="de" ? "Beschwerdekanal aktiv" : "Complaint channel active" },
    { para:"§10",ok: !!draftTs,                                                          label: L==="de" ? "Berichtsentwurf vorhanden" : "Report draft exists" },
  ];
  const bafaScore = bafaChecks.filter(b => b.ok).length;
  const compliancePct = Math.round((bafaScore / bafaChecks.length) * 100);

  return (
    <>
      <WorkspaceDataState L={L} requestState={requestState} domains={["suppliers","actions","complaints"]} reload={reloads.reloadCoreData} />
      <WorkspaceApprovalSummary L={L} meta={approvalMeta} setTab={setTab} />

      {/* QUICKSTART */}
      {showQuickstart && (
        <div className="quickstart-card" style={{ marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <div>
              <div className="sec-title">{L==="de" ? "Geführter Start" : "Guided start"}</div>
              <div className="sec-sub">{L==="de" ? "Diese 5 Schritte, dann ist das System produktiv." : "These 5 steps make the system productive."}</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div className="prog" style={{ width:120, height:4 }}>
                  <div className="prog-fill" style={{ width:`${(quickstartDone/Math.max(quickstartSteps.length,1))*100}%`, background:"var(--g)" }}/>
                </div>
                <span style={{ fontSize:11, fontWeight:700, color:"var(--g-lo)", fontFamily:"'DM Mono',monospace" }}>
                  {quickstartDone}/{quickstartSteps.length}
                </span>
              </div>
              <button className="btn btn-g btn-sm" onClick={dismissQuickstart}>{L==="de" ? "Ausblenden" : "Dismiss"}</button>
            </div>
          </div>
          <div className="quickstart-grid">
            {quickstartSteps.map((step:any, i:number) => (
              <div key={step.id} className={"quickstep" + (step.done ? " done" : "")}>
                <div className="quickstep-top">
                  <div className="quickstep-num">{step.done ? "✓" : i+1}</div>
                  <div className="quickstep-status">{step.done ? (L==="de"?"Fertig":"Done") : (L==="de"?"Offen":"Open")}</div>
                </div>
                <div className="quickstep-title">{step.title}</div>
                <div className="quickstep-copy">{step.copy}</div>
                <button className={"btn btn-sm " + (step.done?"btn-g":"btn-p")} onClick={() => setTab(step.tab)}>
                  {step.done ? (L==="de"?"Prüfen →":"Review →") : (L==="de"?"Öffnen →":"Open →")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI ROW */}
      <div className="kpi-row">
        {[
          { lbl:L==="de"?"Score":"Score", val:`${sc}`, sub:`${L==="de"?"Note":"Grade"} ${sg} · ${gradeLabel(String(sg),L)}`, col:scCol, para:"§9" },
          { lbl:L==="de"?"Lieferanten":"Suppliers", val:`${kpis.total}`, sub:`${kpis.countries} ${L==="de"?"Länder":"countries"} · ${kpis.high} ${L==="de"?"Hochrisiko":"high-risk"}`, col:kpis.high>0?"var(--red)":"var(--g-lo)", para:"§5" },
          { lbl:L==="de"?"Offene CAPs":"Open CAPs", val:`${actionStats.open}`, sub:overdueActions>0?`${overdueActions} ${L==="de"?"überfällig":"overdue"}`:`${actionStats.done} ${L==="de"?"abgeschlossen":"done"}`, col:overdueActions>0?"var(--red)":actionStats.open>0?"var(--amb)":"var(--g-lo)", para:"§7" },
          { lbl:L==="de"?"Beschwerden":"Complaints", val:`${openComplaints}`, sub:`${complaints.length} ${L==="de"?"gesamt":"total"}`, col:openComplaints>0?"var(--amb)":"var(--t3)", para:"§8" },
        ].map((k,i) => (
          <div key={i} className="kpi">
            <div className="kpi-accent" style={{ background:k.col }}/>
            <div className="kpi-lbl">{k.lbl}<span className="ltag">{k.para}</span></div>
            <div className="kpi-val" style={{ color:k.col }}>{k.val}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="g2" style={{ marginBottom:12 }}>

        {/* Situation */}
        <div className="card">
          <div className="sec-hd">
            <div>
              <div className="sec-title">{L==="de" ? "Aktuelle Lage" : "Current situation"}</div>
              <div className="sec-sub">{L==="de" ? "Was jetzt Aufmerksamkeit braucht." : "What needs attention now."}</div>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            {[
              { key:"overdue",  title:L==="de"?"Überfällige CAPs":"Overdue CAPs",  urgent:overdueActions>0, count:overdueActions,  tab:"actions"    as const, bullet:"var(--red)" },
              { key:"complaints",title:L==="de"?"Offene Beschwerden":"Open complaints",urgent:openComplaints>0,count:openComplaints,tab:"complaints" as const, bullet:"var(--amb)" },
              { key:"bafa",     title:"BAFA Readiness",                             urgent:compliancePct<100, count:compliancePct,   tab:"reports"    as const, bullet:"var(--blu)", pct:true },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setTab(item.tab)}
                style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"11px 13px", borderRadius:"var(--r3)",
                  border:`1px solid ${item.urgent ? item.bullet+"25" : "var(--b2)"}`,
                  background:item.urgent ? item.bullet+"07" : "var(--c2)",
                  textAlign:"left", cursor:"pointer", transition:"all 120ms",
                }}
              >
                <div style={{
                  width:7, height:7, borderRadius:"50%", flexShrink:0,
                  background: item.count === 0 ? "var(--t4)" : item.bullet,
                  boxShadow: item.count > 0 && item.urgent ? `0 0 6px ${item.bullet}` : "none",
                }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--t1)", marginBottom:1 }}>{item.title}</div>
                  <div style={{ fontSize:11.5, color:"var(--t3)" }}>
                    {item.pct ? `${item.count}% ${L==="de"?"vollständig":"complete"}` : item.count > 0 ? `${item.count} ${L==="de"?"erfordern Aufmerksamkeit":"require attention"}` : L==="de"?"Alles in Ordnung":"All good"}
                  </div>
                </div>
                <span style={{ fontSize:11, color:"var(--t4)", flexShrink:0 }}>→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Risk portfolio */}
        <div className="card">
          <div className="sec-hd">
            <div>
              <div className="sec-title">{L==="de" ? "Top-Risikolieferanten" : "Top risk suppliers"}</div>
              <div className="sec-sub">{L==="de" ? "Höchste Risikoscores im Portfolio." : "Highest risk scores in portfolio."}</div>
            </div>
            <div className="brow">
              <button className="btn btn-g btn-sm" onClick={recalc} disabled={loading}>
                {loading ? <span className="spin-d"/> : "↺"}
              </button>
              <button className="btn btn-ai btn-sm" onClick={() => setTab("ai")}>✦ AI</button>
            </div>
          </div>
          {topRisk.length > 0 ? (
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              {topRisk.map(s => {
                const pal = PAL[s.risk_level as keyof typeof PAL] || PAL.unknown;
                const isExp = expanded === `d-${s.id}`;
                return (
                  <div key={s.id}>
                    <button
                      onClick={() => setExpanded(isExp ? null : `d-${s.id}`)}
                      style={{
                        width:"100%", display:"flex", alignItems:"center", gap:10,
                        padding:"9px 12px",
                        borderRadius: isExp ? "var(--r2) var(--r2) 0 0" : "var(--r2)",
                        border:`1px solid ${isExp ? pal.c+"30" : "var(--b2)"}`,
                        background: isExp ? pal.bg : "var(--c2)",
                        textAlign:"left", cursor:"pointer", transition:"all 120ms",
                      }}
                    >
                      <span style={{ fontSize:10, fontWeight:700, color:pal.c, background:pal.bg, border:`1px solid ${pal.b}`, borderRadius:20, padding:"1px 7px", flexShrink:0 }}>
                        {s.risk_level === "high" ? (L==="de"?"Hoch":"High") : s.risk_level === "medium" ? (L==="de"?"Mittel":"Med") : (L==="de"?"Niedrig":"Low")}
                      </span>
                      <span style={{ flex:1, fontSize:12.5, fontWeight:600, color:"var(--t1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.name}</span>
                      <span style={{ fontSize:11, color:"var(--t3)", flexShrink:0, fontFamily:"'DM Mono',monospace" }}>{s.country}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:pal.c, fontVariantNumeric:"tabular-nums", flexShrink:0 }}>{s.risk_score}</span>
                    </button>
                    {isExp && (
                      <div style={{ padding:12, background:pal.bg, border:`1px solid ${pal.c}20`, borderTop:"none", borderRadius:"0 0 var(--r2) var(--r2)" }}>
                        <RiskBreakdown sup={s} compact />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty empty-compact">
              <div className="empty-ic">◉</div>
              <div className="empty-t">{L==="de" ? "Noch keine Lieferanten" : "No suppliers yet"}</div>
              <button className="btn btn-p btn-sm" style={{ marginTop:12 }} onClick={openAddSupModal}>
                + {L==="de" ? "Anlegen" : "Add supplier"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM GRID */}
      <div className="g2">
        {/* BAFA Checklist */}
        <div className="card">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div>
              <div className="sec-title">BAFA Readiness</div>
              <div className="sec-sub">{L==="de" ? "Status der Kernpflichten §§4–10" : "Core obligation status §§4–10"}</div>
            </div>
            <div style={{
              fontSize:16, fontWeight:700, fontVariantNumeric:"tabular-nums",
              color: compliancePct === 100 ? "var(--g-lo)" : compliancePct >= 60 ? "var(--amb)" : "var(--red)",
            }}>{compliancePct}%</div>
          </div>

          {/* Progress bar */}
          <div className="prog" style={{ height:5, marginBottom:14 }}>
            <div className="prog-fill" style={{ width:`${compliancePct}%`, background: compliancePct===100?"var(--g)":compliancePct>=60?"var(--amb)":"var(--red)" }}/>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {bafaChecks.map((item, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"8px 11px", borderRadius:"var(--r2)",
                border:`1px solid ${item.ok ? "var(--g-20)" : "var(--b2)"}`,
                background: item.ok ? "var(--g-5)" : "var(--c2)",
                transition:"all 120ms",
              }}>
                <span style={{ fontSize:12, color:item.ok?"var(--g-lo)":"var(--t4)", flexShrink:0 }}>
                  {item.ok ? "✓" : "○"}
                </span>
                <span style={{
                  fontSize:9, fontWeight:700, fontFamily:"'DM Mono',monospace",
                  color:item.ok?"var(--g-lo)":"var(--t3)",
                  background:item.ok?"var(--g-5)":"var(--c3)",
                  border:`1px solid ${item.ok?"var(--g-20)":"var(--b2)"}`,
                  borderRadius:20, padding:"1px 6px", flexShrink:0,
                }}>{item.para}</span>
                <span style={{ fontSize:12.5, color:item.ok?"var(--t1)":"var(--t2)", flex:1 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick import */}
        <div className="card">
          <div className="sec-title" style={{ marginBottom:4 }}>{L==="de" ? "Schnellimport" : "Quick import"}</div>
          <div className="sec-sub" style={{ marginBottom:14 }}>{L==="de" ? "CSV für Demo und Erstaufbau." : "CSV for demo and initial setup."}</div>
          <div style={{
            padding:"9px 12px", borderRadius:"var(--r2)",
            background:"var(--c3)", border:"1px solid var(--b2)",
            fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"var(--t3)",
            lineHeight:1.8, marginBottom:10,
          }}>
            <div style={{ color:"var(--g-lo)", fontSize:9, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:3, fontFamily:"inherit" }}>
              {L==="de" ? "Spalten" : "Columns"}
            </div>
            name, country, industry, spend, workers
          </div>
          <textarea
            className="ta"
            rows={5}
            value={csv as string}
            onChange={e => setCsv(e.target.value)}
            placeholder={"name,country,industry\nExample GmbH,DE,Automotive\n..."}
            style={{ fontFamily:"'DM Mono',monospace", fontSize:11 }}
          />
          <div className="brow" style={{ marginTop:10 }}>
            <button className="btn btn-g btn-sm" onClick={() => (importCsv as any)()} disabled={loading}>
              {loading ? <span className="spin-d"/> : null}
              {L==="de" ? "Importieren" : "Import CSV"}
            </button>
            <button className="btn btn-p btn-sm" onClick={openAddSupModal}>
              + {L==="de" ? "Manuell" : "Manual"}
            </button>
            <button className="btn btn-g btn-sm" onClick={() => setShowCapModal(true)}>
              {L==="de" ? "CAP vorbereiten" : "Prepare CAP"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
