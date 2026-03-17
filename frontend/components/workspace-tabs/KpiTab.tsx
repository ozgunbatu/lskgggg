import React from "react";
import WorkspaceDataState from "../workspace/WorkspaceDataState";
import type { WorkspaceTabProps } from "@/lib/workspace-types";

export default function KpiTab(props: WorkspaceTabProps) {
  const {L,requestState,reloads,kpiLive,kpiTrend,kpiLd,score,kpis,actionStats,suppliers,complaints,actions,setTab,loadKpi,saveKpiSnapshot,approvalMeta} = props;

  const sc = score?.total ?? 0;
  const scColor = sc >= 80 ? "var(--g1)" : sc >= 60 ? "var(--amber)" : "var(--red)";

  const metrics = [
    {
      id:"suppliers",
      label:L==="de"?"Lieferanten erfasst":"Suppliers recorded",
      para:"§5",
      value:kpis.total,
      target:10,
      unit:"",
      color:"var(--blue)",
      desc:L==="de"?"Registrierte Lieferanten im System":"Registered suppliers in the system",
    },
    {
      id:"risk_complete",
      label:L==="de"?"Risikoanalysen":"Risk analyses",
      para:"§5",
      value:suppliers.filter((s:any)=>s.risk_level!=="unknown").length,
      target:Math.max(kpis.total,1),
      unit:L==="de"?" abgeschl.":" done",
      color:"var(--amber)",
      desc:L==="de"?"Lieferanten mit abgeschlossener Risikoanalyse":"Suppliers with completed risk analysis",
    },
    {
      id:"actions",
      label:L==="de"?"CAPs abgeschlossen":"CAPs completed",
      para:"§7",
      value:actionStats.done,
      target:Math.max(actionStats.total,1),
      unit:"",
      color:"var(--g1)",
      desc:L==="de"?"Abgeschlossene Corrective Action Plans":"Completed Corrective Action Plans",
    },
    {
      id:"complaints",
      label:L==="de"?"Meldungen gelöst":"Complaints resolved",
      para:"§8",
      value:complaints.filter((c:any)=>c.status==="resolved"||c.status==="closed").length,
      target:Math.max(complaints.length,1),
      unit:"",
      color:"var(--purple)",
      desc:L==="de"?"Geklärte Hinweisgeber-Meldungen":"Resolved whistleblower reports",
    },
  ];

  // Trend sparkline (simplified)
  const points = (kpiTrend as any[]) || [];

  return (
    <>
      <WorkspaceDataState L={L} requestState={requestState} domains={[
        {key:"kpi",label:"KPI",onRetry:()=>loadKpi()},
      ]}/>

      {/* Score hero */}
      <div className="card" style={{marginBottom:14,display:"flex",alignItems:"center",gap:28,flexWrap:"wrap" as React.CSSProperties["flexWrap"]}}>
        {/* Ring */}
        <div style={{position:"relative",width:100,height:100,flexShrink:0}}>
          <svg width="100" height="100" style={{transform:"rotate(-90deg)"}}>
            <circle cx="50" cy="50" r="38" fill="none" stroke="var(--bg-3)" strokeWidth="7"/>
            <circle cx="50" cy="50" r="38" fill="none" stroke={scColor} strokeWidth="7"
              strokeDasharray={`${(sc/100)*2*Math.PI*38} ${2*Math.PI*38}`}
              strokeLinecap="round"
              style={{transition:"stroke-dasharray 0.8s ease"}}
            />
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontSize:24,fontWeight:700,color:scColor,lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{sc}</div>
            <div style={{fontSize:10,color:"var(--t3)"}}>/ 100</div>
          </div>
        </div>
        {/* Details */}
        <div style={{flex:1,minWidth:200}}>
          <div style={{fontSize:11,fontWeight:600,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>
            {L==="de"?"Compliance Score §9":"Compliance Score §9"}
          </div>
          <div style={{fontSize:28,fontWeight:700,color:scColor,letterSpacing:"-0.04em",marginBottom:8}}>
            {sc >= 80 ? (L==="de"?"Gut":"Good") : sc >= 60 ? (L==="de"?"Akzeptabel":"Acceptable") : (L==="de"?"Kritisch":"Critical")}
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap" as React.CSSProperties["flexWrap"]}}>
            {[
              {l:L==="de"?"Risiko":"Risk",v:score?.risk??0,c:"var(--amber)"},
              {l:L==="de"?"Prozess":"Process",v:score?.process??0,c:"var(--blue)"},
              {l:L==="de"?"Daten":"Data",v:score?.data??0,c:"var(--purple)"},
            ].map(s=>(
              <div key={s.l} style={{background:"var(--bg-2)",border:"1px solid var(--border)",borderRadius:"var(--r-sm)",padding:"5px 10px"}}>
                <div style={{fontSize:10,color:"var(--t3)"}}>{s.l}</div>
                <div style={{fontSize:16,fontWeight:700,color:s.c}}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="brow" style={{flexShrink:0}}>
          <button className="btn btn-g btn-sm" onClick={()=>loadKpi()} disabled={kpiLd}>{kpiLd?<span className="spin-d"/>:"↺"} {L==="de"?"Aktualisieren":"Refresh"}</button>
          <button className="btn btn-p btn-sm" onClick={()=>saveKpiSnapshot()}>{L==="de"?"Snapshot":"Snapshot"}</button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="g2" style={{marginBottom:14}}>
        {metrics.map(m=>{
          const pct = m.target > 0 ? Math.min(100, Math.round((m.value/m.target)*100)) : 0;
          return (
            <div key={m.id} className="card" style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>
                    {m.label}
                    <span className="ltag" style={{marginLeft:6}}>{m.para}</span>
                  </div>
                  <div style={{fontSize:28,fontWeight:700,color:m.color,letterSpacing:"-0.04em",fontVariantNumeric:"tabular-nums"}}>
                    {m.value}{m.unit}
                  </div>
                </div>
                <div style={{fontSize:20,fontWeight:700,color:m.color,opacity:0.6}}>{pct}%</div>
              </div>
              <div style={{fontSize:12,color:"var(--t3)"}}>{m.desc}</div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--t3)",marginBottom:5}}>
                  <span>{L==="de"?"Fortschritt":"Progress"}</span>
                  <span>{m.value} / {m.target}</span>
                </div>
                <div className="prog" style={{height:5}}>
                  <div className="prog-fill" style={{width:`${pct}%`,background:m.color}}/>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trend */}
      {points.length > 0 && (
        <div className="card">
          <div className="sec-title" style={{marginBottom:12}}>{L==="de"?"Score-Verlauf":"Score trend"}</div>
          <div style={{display:"flex",gap:6,alignItems:"flex-end",height:60}}>
            {points.slice(-12).map((p:any,i:number)=>{
              const h = Math.max(4, (p.score/100)*56);
              const col = p.score >= 80 ? "var(--g1)" : p.score >= 60 ? "var(--amber)" : "var(--red)";
              return (
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{width:"100%",background:col,borderRadius:"2px 2px 0 0",height:h,opacity:0.8,transition:"height 0.4s"}}/>
                  <div style={{fontSize:9,color:"var(--t4)",whiteSpace:"nowrap"}}>{p.month||""}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
