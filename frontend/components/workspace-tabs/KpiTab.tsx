"use client";
export default function KpiTab(props: any) {
  const { L, kpiLive, kpiTrend, kpiLd, score, kpis, actionStats, suppliers, complaints, actions, setTab, loadKpi, saveKpiSnapshot } = props;
  const sc = score?.total ?? 0;
  const scColor = sc >= 80 ? "var(--g)" : sc >= 60 ? "var(--amb)" : "var(--red)";
  const metrics = [
    { label:L==="de"?"Lieferanten erfasst":"Suppliers recorded", para:"§5", value:kpis.total, target:10, color:"var(--blu)" },
    { label:L==="de"?"Risikoanalysen":"Risk analyses", para:"§5", value:suppliers.filter((s:any)=>s.risk_level!=="unknown").length, target:Math.max(kpis.total,1), color:"var(--amb)" },
    { label:L==="de"?"CAPs abgeschlossen":"CAPs completed", para:"§7", value:actionStats.done, target:Math.max(actionStats.total,1), color:"var(--g)" },
    { label:L==="de"?"Meldungen gelöst":"Complaints resolved", para:"§8", value:complaints.filter((c:any)=>c.status==="resolved"||c.status==="closed").length, target:Math.max(complaints.length,1), color:"var(--vio)" },
  ];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Score hero */}
      <div className="card" style={{textAlign:"center",padding:"28px 20px"}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--g)",textTransform:"uppercase",letterSpacing:".12em",fontFamily:"'DM Mono',monospace",marginBottom:6}}>§9 LkSG — {L==="de"?"Compliance Score":"Compliance Score"}</div>
        <div style={{fontSize:56,fontWeight:800,color:scColor,letterSpacing:"-.05em",lineHeight:1}}>{sc}</div>
        <div style={{fontSize:13,color:"var(--t3)",marginTop:6}}>{L==="de"?"von 100 — Note":"of 100 — Grade"} {score?.grade||"—"}</div>
        <div className="brow" style={{justifyContent:"center",marginTop:16}}>
          <button className="btn btn-g btn-sm" onClick={loadKpi} disabled={kpiLd}>{kpiLd?<span className="spin-d"/>:"↺"} {L==="de"?"Aktualisieren":"Refresh"}</button>
          <button className="btn btn-p btn-sm" onClick={saveKpiSnapshot}>{L==="de"?"Snapshot speichern":"Save snapshot"}</button>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="g2">
        {metrics.map(m => {
          const pct = Math.min(100, Math.round((m.value/m.target)*100));
          return (
            <div key={m.label} className="card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{m.label}</div>
                  <span className="ltag">{m.para}</span>
                </div>
                <div style={{fontSize:24,fontWeight:800,color:m.color,fontVariantNumeric:"tabular-nums"}}>{m.value}</div>
              </div>
              <div className="prog" style={{height:5}}><div className="prog-fill" style={{width:`${pct}%`,background:m.color}}/></div>
              <div style={{fontSize:11,color:"var(--t3)",marginTop:5}}>{pct}% {L==="de"?"abgedeckt":"covered"}</div>
            </div>
          );
        })}
      </div>

      {/* Trend */}
      {kpiTrend.length > 0 && (
        <div className="card">
          <div className="sec-title" style={{marginBottom:12}}>{L==="de"?"Compliance-Trend (12 Monate)":"Compliance trend (12 months)"}</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:4,height:80}}>
            {kpiTrend.slice(-12).map((p:any,i:number) => {
              const h = Math.max(8, Math.round((p.compliance_score/100)*80));
              return (
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{width:"100%",height:h,background:"var(--g)",borderRadius:"var(--r1)",opacity:.8}}/>
                  <div style={{fontSize:9,color:"var(--t4)",fontFamily:"'DM Mono',monospace"}}>{p.compliance_score}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
