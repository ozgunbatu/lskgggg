"use client";
import { gradeLabel as _gl } from "@/lib/workspace-constants";

export default function DashboardTab(props: any) {
  const { L, suppliers, actions, complaints, saqs, score, kpis, actionStats,
    showQuickstart, dismissQuickstart, quickstartSteps, quickstartDone,
    openAddSupModal, setShowCapModal, setTab, sc, sg, scCol,
    gradeLabel, loading, recalc, csv, setCsv, importCsv } = props;

  const gl = gradeLabel || _gl;
  const overdueActions = actions.filter((a:any) => a.due_date && new Date(a.due_date) < new Date() && a.status !== "completed" && a.status !== "closed").length;
  const openComplaints = complaints.filter((c:any) => c.status === "open").length;
  const topRisk = [...suppliers]
    .filter((s:any) => s.risk_level === "high" || s.risk_level === "medium")
    .sort((a:any,b:any) => (b.risk_score||0) - (a.risk_score||0))
    .slice(0, 6);

  const bafaChecks = [
    { para:"§5", ok:suppliers.length>0, label:L==="de"?"Lieferanten erfasst":"Suppliers recorded" },
    { para:"§5", ok:suppliers.some((s:any)=>s.risk_score>0), label:L==="de"?"Risikoanalyse abgeschlossen":"Risk analysis done" },
    { para:"§7", ok:actionStats.total>0, label:L==="de"?"CAPs angelegt":"CAPs created" },
    { para:"§8", ok:complaints.length>=0, label:L==="de"?"Beschwerdekanal aktiv":"Complaint channel active" },
    { para:"§10",ok:false, label:L==="de"?"Berichtsentwurf vorhanden":"Report draft exists" },
  ];
  const bafaPct = Math.round(bafaChecks.filter(b=>b.ok).length / bafaChecks.length * 100);

  const statCardStyle = (accentColor: string) => ({
    "--accent-color": accentColor,
  } as React.CSSProperties);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* ── QUICKSTART ─────────────────────────────────────────────── */}
      {showQuickstart && (
        <div className="card">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div>
              <div className="sec-title">{L==="de"?"Schnellstart":"Quick start"}</div>
              <div className="sec-sub">{L==="de"?"5 Schritte bis zur vollen LkSG-Compliance.":"5 steps to full LkSG compliance."}</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:11, fontWeight:700, color:"var(--g)", fontFamily:"'DM Mono',monospace" }}>{quickstartDone}/5</span>
              <button className="btn btn-g btn-sm" onClick={dismissQuickstart}>{L==="de"?"Ausblenden":"Dismiss"}</button>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:7 }}>
            {quickstartSteps.map((step:any, i:number) => (
              <button key={step.id} onClick={() => setTab(step.tab)} style={{
                background: step.done ? "var(--g-bg)" : "var(--c2)",
                border: `1px solid ${step.done?"var(--g-bd)":"var(--b2)"}`,
                borderRadius:"var(--r3)", padding:"11px 10px",
                textAlign:"left", cursor:"pointer", transition:"all .12s",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ width:19,height:19,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,background:step.done?"var(--g)":"var(--c4)",color:step.done?"#051008":"var(--t4)" }}>{step.done?"✓":i+1}</span>
                  <span style={{ fontSize:8.5,fontWeight:700,color:step.done?"var(--g1)":"var(--t4)",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:".08em" }}>{step.done?(L==="de"?"Fertig":"Done"):(L==="de"?"Offen":"Open")}</span>
                </div>
                <div style={{ fontSize:11.5,fontWeight:600,color:"var(--t1)",lineHeight:1.3,marginBottom:3 }}>{step.title}</div>
                <div style={{ fontSize:11,color:"var(--t3)",lineHeight:1.45 }}>{step.copy}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── CLICKABLE STAT CARDS ─────────────────────────────────────── */}
      <div className="stat-grid stat-grid-4">
        {[
          { lbl:L==="de"?"Compliance Score":"Score", val:sc, sub:`${L==="de"?"Note":"Grade"} ${sg} · ${gl(String(sg),L)}`, col:scCol, tab:"kpi", para:"§9", accent:scCol },
          { lbl:L==="de"?"Lieferanten":"Suppliers", val:kpis.total, sub:`${kpis.countries} ${L==="de"?"Länder":"countries"} · ${kpis.high} ${L==="de"?"Hochrisiko":"high risk"}`, col:kpis.high>0?"var(--red)":"var(--g1)", tab:"suppliers", para:"§5", accent:kpis.high>0?"var(--red)":"var(--g)" },
          { lbl:L==="de"?"Offene CAPs":"Open CAPs", val:actionStats.open, sub:overdueActions>0?`⚠ ${overdueActions} ${L==="de"?"überfällig":"overdue"}`:`${actionStats.done} ${L==="de"?"abgeschlossen":"done"}`, col:overdueActions>0?"var(--red)":actionStats.open>0?"var(--amb)":"var(--g1)", tab:"actions", para:"§7", accent:overdueActions>0?"var(--red)":actionStats.open>0?"var(--amb)":"var(--g)" },
          { lbl:L==="de"?"Offene Meldungen":"Complaints", val:openComplaints, sub:`${complaints.length} ${L==="de"?"gesamt · §8":"total · §8"}`, col:openComplaints>0?"var(--amb)":"var(--t3)", tab:"complaints", para:"§8", accent:openComplaints>0?"var(--amb)":"var(--t3)" },
        ].map((k,i) => (
          <div key={i} className="stat-card" style={statCardStyle(k.accent)} onClick={()=>setTab(k.tab as any)}>
            <div className="stat-card-accent"/>
            <div className="stat-lbl">{k.lbl}<span className="ltag">{k.para}</span></div>
            <div className="stat-val" style={{ color:k.col }}>{k.val}</div>
            <div className="stat-sub">{k.sub}</div>
            <span className="stat-arrow">→</span>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ───────────────────────────────────────────────── */}
      <div className="g2">

        {/* Attention / actions needed */}
        <div>
          <div className="ws-attn">
            <div className="ws-attn-title">{L==="de"?"Handlungsbedarf heute":"Action needed today"}</div>
            {[
              { key:"overdue", label:L==="de"?"Überfällige CAPs":"Overdue CAPs", desc:overdueActions>0?`${overdueActions} ${L==="de"?"Maßnahmen überschreiten die Frist":"measures past deadline"}`:L==="de"?"Alle CAPs im Zeitplan":"All CAPs on schedule", tab:"actions" as const, cls:overdueActions>0?"urgent":"ok" },
              { key:"complaints", label:L==="de"?"Offene Meldungen":"Open complaints", desc:openComplaints>0?`${openComplaints} ${L==="de"?"Meldungen erfordern Bearbeitung":"complaints require attention"}`:L==="de"?"Keine offenen Fälle":"No open cases", tab:"complaints" as const, cls:openComplaints>0?"warn":"ok" },
              { key:"bafa", label:"BAFA Readiness", desc:`${bafaPct}% ${L==="de"?"der Kernpflichten erfüllt":"of core obligations met"}`, tab:"reports" as const, cls:bafaPct<60?"urgent":bafaPct<100?"warn":"ok" },
              { key:"monitoring", label:"Monitoring", desc:L==="de"?"Lieferanten-Screenings prüfen":"Review supplier screenings", tab:"monitoring" as const, cls:"info" },
            ].map(item => (
              <button key={item.key} className={`ws-attn-item ${item.cls}`} onClick={()=>setTab(item.tab)}>
                <div className="ws-attn-dot" style={{ background:item.cls==="urgent"?"var(--red)":item.cls==="warn"?"var(--amb)":item.cls==="ok"?"var(--g)":"var(--blu)" }}/>
                <div className="ws-attn-body">
                  <div className="ws-attn-label">{item.label}</div>
                  <div className="ws-attn-desc">{item.desc}</div>
                </div>
                <div className="ws-attn-arrow">→</div>
              </button>
            ))}
          </div>

          {/* Quick actions */}
          <div className="card" style={{ marginTop:0 }}>
            <div className="sec-title" style={{ marginBottom:9 }}>{L==="de"?"Schnellaktionen":"Quick actions"}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {[
                { label:L==="de"?"Lieferant anlegen":"Add supplier", action:openAddSupModal, style:"btn-p" },
                { label:"Neuer CAP", action:()=>setShowCapModal(true), style:"btn-g" },
                { label:L==="de"?"Bericht generieren":"Generate report", action:()=>setTab("reports"), style:"btn-g" },
                { label:L==="de"?"KI-Analyse":"AI Analysis", action:()=>setTab("ai"), style:"btn-ai" },
              ].map(a => (
                <button key={a.label} className={`btn ${a.style} btn-sm`} style={{ width:"100%", justifyContent:"flex-start" }} onClick={a.action}>{a.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Top risk + BAFA */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div className="card">
            <div className="sec-hd">
              <div>
                <div className="sec-title">{L==="de"?"Top-Risikolieferanten":"Top risk suppliers"}</div>
                <div className="sec-sub">{L==="de"?"Höchste Scores im Portfolio.":"Highest scores in portfolio."}</div>
              </div>
              <button className="btn btn-g btn-sm" onClick={()=>setTab("suppliers")}>{L==="de"?"Alle":"All"} →</button>
            </div>
            {topRisk.length > 0 ? (
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {topRisk.map((s:any) => (
                  <button key={s.id} onClick={()=>setTab("suppliers")} style={{
                    display:"flex", alignItems:"center", gap:10,
                    padding:"8px 11px", borderRadius:"var(--r2)",
                    background:"var(--c2)", border:"1px solid var(--b1)",
                    textAlign:"left", cursor:"pointer", transition:"all .1s",
                    width:"100%",
                  }}>
                    <span style={{ width:6,height:6,borderRadius:"50%",flexShrink:0,background:s.risk_level==="high"?"var(--red)":s.risk_level==="medium"?"var(--amb)":"var(--g1)" }}/>
                    <span style={{ flex:1,fontSize:12.5,fontWeight:600,color:"var(--t1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{s.name}</span>
                    <span className="mono" style={{ fontSize:10.5,color:"var(--t3)",flexShrink:0 }}>{s.country}</span>
                    <span style={{ fontSize:11,fontWeight:700,color:s.risk_level==="high"?"var(--red)":s.risk_level==="medium"?"var(--amb)":"var(--g1)",fontVariantNumeric:"tabular-nums",flexShrink:0 }}>{s.risk_score}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty empty-compact">
                <div className="empty-ic">◎</div>
                <div className="empty-t">{L==="de"?"Keine Lieferanten":"No suppliers"}</div>
                <div style={{ marginTop:8 }}><button className="btn btn-p btn-sm" onClick={openAddSupModal}>+ {L==="de"?"Anlegen":"Add"}</button></div>
              </div>
            )}
          </div>

          {/* BAFA checklist */}
          <div className="card">
            <div className="sec-hd">
              <div>
                <div className="sec-title">BAFA Readiness<span className="ltag">§9</span></div>
              </div>
              <div style={{ fontSize:20,fontWeight:800,color:bafaPct===100?"var(--g)":bafaPct>=60?"var(--amb)":"var(--red)",fontVariantNumeric:"tabular-nums" }}>{bafaPct}%</div>
            </div>
            <div className="prog" style={{ marginBottom:12 }}>
              <div className="prog-fill" style={{ width:`${bafaPct}%`,background:bafaPct===100?"var(--g)":bafaPct>=60?"var(--amb)":"var(--red)" }}/>
            </div>
            {bafaChecks.map((item,i) => (
              <div key={i} style={{ display:"flex",alignItems:"center",gap:9,padding:"7px 10px",borderRadius:"var(--r1)",border:`1px solid ${item.ok?"var(--g-bd)":"var(--b1)"}`,background:item.ok?"var(--g-bg)":"transparent",marginBottom:4 }}>
                <span style={{ fontSize:12,color:item.ok?"var(--g)":"var(--t4)",flexShrink:0,lineHeight:1 }}>{item.ok?"✓":"○"}</span>
                <span style={{ fontSize:9,fontWeight:700,fontFamily:"'DM Mono',monospace",color:item.ok?"var(--g1)":"var(--t4)",background:item.ok?"transparent":"var(--c3)",border:`1px solid ${item.ok?"var(--g-bd)":"var(--b2)"}`,borderRadius:20,padding:"1px 6px",flexShrink:0 }}>{item.para}</span>
                <span style={{ fontSize:12.5,color:item.ok?"var(--t1)":"var(--t3)",flex:1 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
