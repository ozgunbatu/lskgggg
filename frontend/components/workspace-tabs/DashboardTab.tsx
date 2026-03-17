"use client";
import { gradeLabel } from "@/lib/workspace-constants";

export default function DashboardTab(props: any) {
  const { L, suppliers, actions, complaints, saqs, score, kpis, actionStats,
    showQuickstart, dismissQuickstart, quickstartSteps, quickstartDone,
    openAddSupModal, setShowCapModal, setTab, sc, sg, scCol, gradeLabel: gl,
    COUNTRIES, INDUSTRIES, loading, recalc, csv, setCsv, importCsv,
    approvalMeta, RiskBreakdown, expanded, setExpanded } = props;

  const overdueActions = actions.filter((a:any) => a.due_date && new Date(a.due_date) < new Date() && a.status !== "completed" && a.status !== "closed").length;
  const openComplaints = complaints.filter((c:any) => c.status === "open").length;
  const topRisk = [...suppliers].filter((s:any) => s.risk_level === "high" || s.risk_level === "medium")
    .sort((a:any,b:any) => (b.risk_score||0) - (a.risk_score||0)).slice(0, 6);

  const bafaChecks = [
    { para: "§5", ok: suppliers.length > 0, label: L==="de" ? "Lieferanten erfasst" : "Suppliers recorded" },
    { para: "§5", ok: suppliers.some((s:any) => s.risk_score > 0), label: L==="de" ? "Risikoanalyse abgeschlossen" : "Risk analysis done" },
    { para: "§7", ok: actionStats.total > 0, label: L==="de" ? "CAPs angelegt" : "CAPs created" },
    { para: "§8", ok: complaints.length >= 0, label: L==="de" ? "Beschwerdekanal aktiv" : "Complaint channel active" },
    { para: "§10", ok: false, label: L==="de" ? "Berichtsentwurf vorhanden" : "Report draft exists" },
  ];
  const bafaPct = Math.round(bafaChecks.filter(b=>b.ok).length / bafaChecks.length * 100);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* ── QUICKSTART ──────────────────────────────────────────────────── */}
      {showQuickstart && (
        <div className="card">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div>
              <div className="sec-title">{L==="de" ? "Schnellstart" : "Quick start"}</div>
              <div className="sec-sub">{L==="de" ? "5 Schritte bis zur vollständigen LkSG-Compliance." : "5 steps to full LkSG compliance."}</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:12, fontWeight:700, color:"var(--g)" }}>{quickstartDone}/5</span>
              <button className="btn btn-g btn-sm" onClick={dismissQuickstart}>{L==="de" ? "Ausblenden" : "Dismiss"}</button>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
            {quickstartSteps.map((step:any, i:number) => (
              <button key={step.id} onClick={() => setTab(step.tab)} style={{
                background: step.done ? "var(--g-5)" : "#fff",
                border: `1px solid ${step.done ? "var(--g-20)" : "var(--b2)"}`,
                borderRadius: "var(--r4)", padding:"12px 10px",
                textAlign:"left", cursor:"pointer", transition:"all .15s",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ width:20,height:20,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,background:step.done?"var(--g)":"var(--c2)",color:step.done?"#fff":"var(--t3)" }}>{step.done?"✓":i+1}</span>
                  <span style={{ fontSize:9,fontWeight:700,color:step.done?"var(--g)":"var(--t4)",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:".08em" }}>{step.done?(L==="de"?"Fertig":"Done"):(L==="de"?"Offen":"Open")}</span>
                </div>
                <div style={{ fontSize:12,fontWeight:600,color:"var(--t1)",lineHeight:1.3,marginBottom:4 }}>{step.title}</div>
                <div style={{ fontSize:11,color:"var(--t3)",lineHeight:1.45 }}>{step.copy}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── KPI ROW ─────────────────────────────────────────────────────── */}
      <div className="kpi-row">
        {[
          { lbl: L==="de"?"Compliance Score":"Compliance Score", val: sc, sub: `${L==="de"?"Note":"Grade"} ${sg} · ${(gl||gradeLabel)(String(sg),L)}`, col: scCol, para:"§9" },
          { lbl: L==="de"?"Lieferanten":"Suppliers", val: kpis.total, sub: `${kpis.countries} ${L==="de"?"Länder":"countries"} · ${kpis.high} ${L==="de"?"Hochrisiko":"high risk"}`, col: kpis.high>0?"var(--red)":"var(--g-lo)", para:"§5" },
          { lbl: L==="de"?"Offene CAPs":"Open CAPs", val: actionStats.open, sub: overdueActions>0?`${overdueActions} ${L==="de"?"überfällig":"overdue"}`:`${actionStats.done} ${L==="de"?"abgeschlossen":"done"}`, col: overdueActions>0?"var(--red)":actionStats.open>0?"var(--amb)":"var(--g-lo)", para:"§7" },
          { lbl: L==="de"?"Offene Meldungen":"Open complaints", val: openComplaints, sub: `${complaints.length} ${L==="de"?"gesamt":"total"}`, col: openComplaints>0?"var(--amb)":"var(--t3)", para:"§8" },
        ].map((k,i) => (
          <div key={i} className="kpi">
            <div className="kpi-accent" style={{ background:k.col }}/>
            <div className="kpi-lbl">{k.lbl}<span className="ltag">{k.para}</span></div>
            <div className="kpi-val" style={{ color:k.col }}>{k.val}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ───────────────────────────────────────────────────── */}
      <div className="g2">

        {/* Situation */}
        <div className="card">
          <div className="sec-hd">
            <div>
              <div className="sec-title">{L==="de" ? "Aktuelle Lage" : "Current situation"}</div>
              <div className="sec-sub">{L==="de" ? "Was jetzt Aufmerksamkeit braucht." : "What needs attention now."}</div>
            </div>
          </div>
          {[
            { key:"overdue", title:L==="de"?"Überfällige CAPs":"Overdue CAPs", count:overdueActions, tab:"actions", bullet:"var(--red)" },
            { key:"complaints", title:L==="de"?"Offene Meldungen":"Open complaints", count:openComplaints, tab:"complaints", bullet:"var(--amb)" },
            { key:"bafa", title:"BAFA Readiness", count:bafaPct, tab:"reports", bullet:"var(--blu)", pct:true },
          ].map(item => (
            <button key={item.key} onClick={() => setTab(item.tab as any)} style={{
              display:"flex", alignItems:"center", gap:12, padding:"11px 13px",
              borderRadius:"var(--r3)", border:`1px solid ${item.count>0||(item.pct&&item.count<100)?item.bullet+"25":"var(--b2)"}`,
              background:item.count>0||(item.pct&&item.count<100)?item.bullet+"08":"var(--c2)",
              textAlign:"left", cursor:"pointer", width:"100%", marginBottom:6, transition:"all .12s",
            }}>
              <div style={{ width:7,height:7,borderRadius:"50%",flexShrink:0,background:item.count===0&&!item.pct?"var(--t4)":item.count===100&&item.pct?"var(--g-lo)":item.bullet }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13,fontWeight:600,color:"var(--t1)",marginBottom:1 }}>{item.title}</div>
                <div style={{ fontSize:11.5,color:"var(--t3)" }}>
                  {item.pct ? `${item.count}% ${L==="de"?"vollständig":"complete"}` : item.count>0 ? `${item.count} ${L==="de"?"erfordern Aufmerksamkeit":"require attention"}` : L==="de"?"Alles in Ordnung":"All good"}
                </div>
              </div>
              <span style={{ fontSize:11,color:"var(--t4)",flexShrink:0 }}>→</span>
            </button>
          ))}
          <div style={{ borderTop:"1px solid var(--b1)",paddingTop:12,marginTop:4,display:"flex",gap:6 }}>
            <button className="btn btn-p btn-sm" onClick={openAddSupModal}>+ {L==="de"?"Lieferant":"Supplier"}</button>
            <button className="btn btn-g btn-sm" onClick={() => setShowCapModal(true)}>+ CAP</button>
            <button className="btn btn-g btn-sm" onClick={() => setTab("reports")}>{L==="de"?"Bericht":"Report"} →</button>
          </div>
        </div>

        {/* Top risk */}
        <div className="card">
          <div className="sec-hd">
            <div>
              <div className="sec-title">{L==="de" ? "Top-Risikolieferanten" : "Top risk suppliers"}</div>
              <div className="sec-sub">{L==="de" ? "Höchste Risikoscores im Portfolio." : "Highest risk scores in portfolio."}</div>
            </div>
            <button className="btn btn-g btn-sm" onClick={() => setTab("suppliers")}>{L==="de"?"Alle":"All"} →</button>
          </div>
          {topRisk.length > 0 ? (
            <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
              {topRisk.map((s:any) => (
                <div key={s.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:"var(--r2)",background:"var(--c2)",border:"1px solid var(--b1)" }}>
                  <span style={{ width:6,height:6,borderRadius:"50%",flexShrink:0,background:s.risk_level==="high"?"var(--red)":s.risk_level==="medium"?"var(--amb)":"var(--g-lo)" }}/>
                  <span style={{ flex:1,fontSize:13,fontWeight:600,color:"var(--t1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{s.name}</span>
                  <span style={{ fontSize:11,color:"var(--t3)",flexShrink:0 }}>{s.country}</span>
                  <span style={{ fontSize:11,fontWeight:700,color:s.risk_level==="high"?"var(--red)":s.risk_level==="medium"?"var(--amb)":"var(--g-lo)",fontVariantNumeric:"tabular-nums",flexShrink:0 }}>{s.risk_score}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty empty-compact"><div className="empty-ic">◎</div><div className="empty-t">{L==="de"?"Keine Lieferanten":"No suppliers"}</div></div>
          )}
        </div>
      </div>

      {/* ── BAFA CHECKLIST ──────────────────────────────────────────────── */}
      <div className="card">
        <div className="sec-hd">
          <div>
            <div className="sec-title">BAFA Readiness <span className="ltag">§9 LkSG</span></div>
            <div className="sec-sub">{L==="de" ? "Status der Kernpflichten §§4–10" : "Core obligation status §§4–10"}</div>
          </div>
          <div style={{ fontSize:18,fontWeight:800,color:bafaPct===100?"var(--g)":bafaPct>=60?"var(--amb)":"var(--red)" }}>{bafaPct}%</div>
        </div>
        <div className="prog" style={{ height:4,marginBottom:14 }}>
          <div className="prog-fill" style={{ width:`${bafaPct}%`,background:bafaPct===100?"var(--g)":bafaPct>=60?"var(--amb)":"var(--red)" }}/>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
          {bafaChecks.map((item,i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:"var(--r2)",border:`1px solid ${item.ok?"var(--g-20)":"var(--b2)"}`,background:item.ok?"var(--g-5)":"var(--c2)" }}>
              <span style={{ fontSize:13,color:item.ok?"var(--g)":"var(--t4)",flexShrink:0 }}>{item.ok?"✓":"○"}</span>
              <span style={{ fontSize:9,fontWeight:700,fontFamily:"'DM Mono',monospace",color:item.ok?"var(--g)":"var(--t3)",background:item.ok?"var(--g-5)":"var(--c3)",border:`1px solid ${item.ok?"var(--g-20)":"var(--b2)"}`,borderRadius:20,padding:"1px 6px",flexShrink:0 }}>{item.para}</span>
              <span style={{ fontSize:12.5,color:item.ok?"var(--t1)":"var(--t2)",flex:1 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
