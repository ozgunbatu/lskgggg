"use client";

function MiniChart({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const w = 200, h = 48, pad = 4;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow:"visible" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={points.split(" ").at(-1)?.split(",")[0]} cy={points.split(" ").at(-1)?.split(",")[1]} r="3" fill={color}/>
    </svg>
  );
}

export default function KpiTab(props: any) {
  const { L, kpiLive, kpiTrend, kpiLd, score, kpis, actionStats, suppliers, complaints, actions, setTab, loadKpi, saveKpiSnapshot } = props;
  const sc = score?.total ?? 0;
  const scColor = sc >= 80 ? "var(--g)" : sc >= 60 ? "var(--amb)" : "var(--red)";
  const grade = score?.grade || "—";

  const auditCov   = kpis.total > 0 ? Math.round(suppliers.filter((s:any)=>s.has_audit).length / kpis.total * 100) : 0;
  const cocCov     = kpis.total > 0 ? Math.round(suppliers.filter((s:any)=>s.has_code_of_conduct).length / kpis.total * 100) : 0;
  const riskCov    = kpis.total > 0 ? Math.round(suppliers.filter((s:any)=>s.risk_level!=="unknown").length / kpis.total * 100) : 0;
  const capRate    = actionStats.total > 0 ? Math.round(actionStats.done / actionStats.total * 100) : 0;
  const cmpResRate = complaints.length > 0 ? Math.round(complaints.filter((c:any)=>c.status==="resolved"||c.status==="closed").length / complaints.length * 100) : 0;

  const trend = (kpiTrend || []).slice(-12).map((p:any) => p.compliance_score || 0);

  const kpiItems = [
    { label:L==="de"?"Lieferanten":"Suppliers",           para:"§5",  v:kpis.total,     of:null,  pct:Math.min(100,kpis.total*5),           color:"var(--blu)", tab:"suppliers", sub:L==="de"?`${kpis.countries} Länder`:`${kpis.countries} countries` },
    { label:L==="de"?"Risikoabdeckung":"Risk coverage",   para:"§5",  v:riskCov,        of:"%",   pct:riskCov,                              color:"var(--amb)", tab:"suppliers", sub:L==="de"?`${kpis.high} Hochrisiko`:`${kpis.high} high risk` },
    { label:L==="de"?"Audit-Abdeckung":"Audit coverage",  para:"§5",  v:auditCov,       of:"%",   pct:auditCov,                             color:"var(--blu)", tab:"suppliers", sub:`Ziel: 60%` },
    { label:"CoC-Abdeckung",                              para:"§6",  v:cocCov,         of:"%",   pct:cocCov,                               color:"var(--g)",   tab:"suppliers", sub:`Ziel: 70%` },
    { label:L==="de"?"CAP-Abschluss":"CAP completion",   para:"§7",  v:capRate,        of:"%",   pct:capRate,                              color:"var(--g)",   tab:"actions",   sub:`${actionStats.done}/${actionStats.total}` },
    { label:L==="de"?"Beschwerde-Resolution":"Complaint resolution", para:"§8", v:cmpResRate, of:"%", pct:cmpResRate, color:"var(--vio)", tab:"complaints", sub:`${complaints.filter((c:any)=>c.status==="open").length} ${L==="de"?"offen":"open"}` },
  ];

  const getStatus = (pct: number, target = 70) =>
    pct >= target ? "✓" : pct >= target * 0.7 ? "~" : "!";
  const getStatusColor = (pct: number, target = 70) =>
    pct >= target ? "var(--g)" : pct >= target * 0.7 ? "var(--amb)" : "var(--red)";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Score hero */}
      <div className="card" style={{ padding:"22px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:20, flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:"var(--g)", textTransform:"uppercase", letterSpacing:".12em", fontFamily:"'DM Mono',monospace", marginBottom:4 }}>
              §9 LkSG — {L==="de"?"Compliance Score":"Compliance Score"}
            </div>
            <div style={{ display:"flex", alignItems:"baseline", gap:12 }}>
              <div style={{ fontSize:56, fontWeight:800, color:scColor, letterSpacing:"-.05em", lineHeight:1, fontVariantNumeric:"tabular-nums" }}>{sc}</div>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:scColor }}>/ 100</div>
                <div style={{ fontSize:13, color:"var(--t3)" }}>{L==="de"?"Note":"Grade"} {grade}</div>
              </div>
            </div>
            {/* Score bar */}
            <div style={{ marginTop:10, width:220 }}>
              <div className="prog" style={{ height:6 }}>
                <div className="prog-fill" style={{ width:`${sc}%`, background:scColor }}/>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:3, fontSize:9, color:"var(--t4)", fontFamily:"'DM Mono',monospace" }}>
                <span>0</span><span style={{ color:"var(--red)" }}>60</span><span style={{ color:"var(--amb)" }}>80</span><span>100</span>
              </div>
            </div>
          </div>
          {trend.length > 1 && (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:9, color:"var(--t4)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4, fontFamily:"'DM Mono',monospace" }}>{L==="de"?"12-Monats-Trend":"12-month trend"}</div>
              <MiniChart data={trend} color={scColor}/>
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <button className="btn btn-g btn-sm" onClick={loadKpi} disabled={kpiLd}>
              {kpiLd ? <span className="spin-d"/> : "↺"} {L==="de"?"Aktualisieren":"Refresh"}
            </button>
            <button className="btn btn-p btn-sm" onClick={saveKpiSnapshot}>
              {L==="de"?"Snapshot":"Snapshot"}
            </button>
            <button className="btn btn-ai btn-sm" onClick={() => setTab("reports")}>
              {L==="de"?"→ Bericht":"→ Report"}
            </button>
          </div>
        </div>
      </div>

      {/* KPI grid — all clickable */}
      <div className="g2" style={{ gap:8 }}>
        {kpiItems.map((k, i) => (
          <div key={i} className="stat-card" style={{ "--accent-color": k.color } as any} onClick={() => setTab(k.tab as any)}>
            <div className="stat-card-accent"/>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
              <div className="stat-lbl">{k.label}<span className="ltag">{k.para}</span></div>
              <span style={{ fontSize:13, fontWeight:800, color:getStatusColor(k.pct), fontFamily:"'DM Mono',monospace" }}>{getStatus(k.pct)}</span>
            </div>
            <div style={{ fontSize:26, fontWeight:800, color:k.color, letterSpacing:"-.05em", marginBottom:4, fontVariantNumeric:"tabular-nums" }}>
              {k.v}{k.of}
            </div>
            <div style={{ marginBottom:5 }}>
              <div className="prog" style={{ height:3 }}>
                <div className="prog-fill" style={{ width:`${k.pct}%`, background:k.color }}/>
              </div>
            </div>
            <div style={{ fontSize:11, color:"var(--t3)" }}>{k.sub}</div>
            <span className="stat-arrow">→</span>
          </div>
        ))}
      </div>

      {/* BAFA Readiness checklist */}
      <div className="card">
        <div className="sec-hd">
          <div>
            <div className="sec-title">BAFA Readiness Checklist <span className="ltag">§9</span></div>
            <div className="sec-sub">{L==="de"?"Kernpflichten §§4–10 LkSG im Überblick":"Core obligations §§4–10 LkSG at a glance"}</div>
          </div>
          <button className="btn btn-g btn-sm" onClick={() => setTab("reports")}>{L==="de"?"Zum Bericht":"To report"} →</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
          {[
            { label:L==="de"?"Lieferanten erfasst (§5)":"Suppliers recorded (§5)", ok:kpis.total>0 },
            { label:L==="de"?"Risikoanalyse durchgeführt (§5)":"Risk analysis done (§5)", ok:riskCov>80 },
            { label:L==="de"?"Code of Conduct 70%+ (§6)":"Code of Conduct 70%+ (§6)", ok:cocCov>=70 },
            { label:L==="de"?"Audits 60%+ Abdeckung (§5)":"Audits 60%+ coverage (§5)", ok:auditCov>=60 },
            { label:L==="de"?"CAPs angelegt (§7)":"CAPs created (§7)", ok:actionStats.total>0 },
            { label:L==="de"?"CAP-Rate 80%+ (§7)":"CAP rate 80%+ (§7)", ok:capRate>=80 },
            { label:L==="de"?"Beschwerdekanal aktiv (§8)":"Complaint channel active (§8)", ok:true },
            { label:L==="de"?"Meldungen bearbeitet (§8)":"Complaints processed (§8)", ok:cmpResRate>0||complaints.length===0 },
          ].map((item, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:9, padding:"8px 11px",
              borderRadius:"var(--r2)", border:`1px solid ${item.ok?"var(--g4)":"var(--line)"}`,
              background:item.ok?"var(--g3)":"var(--card)",
            }}>
              <span style={{ fontSize:12, color:item.ok?"var(--g)":"var(--t4)", flexShrink:0 }}>{item.ok?"✓":"○"}</span>
              <span style={{ fontSize:12, color:item.ok?"var(--t1)":"var(--t3)" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
