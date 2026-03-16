import React from "react";
import type { WorkspaceTabProps } from "@/lib/workspace-types";

export default function MonitoringTab(props: WorkspaceTabProps) {
  const {L,events,screenings,suppliers,reloads,requestState} = props;
  const evs = (events as any[])||[];
  const scr = (screenings as any[])||[];

  const riskCountries = ["BD","MM","PK","CN","IN","VN","KH","ET","NG","CD"];
  const monSups = (suppliers as any[]).filter((s:any)=>riskCountries.includes(s.country));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div className="workspace-bar">
        <div>
          <div className="workspace-kicker">§5 LkSG — Continuous Monitoring</div>
          <div className="workspace-title">{L==="de"?"Monitoring & Frühwarnung":"Monitoring & Early Warning"}</div>
          <div className="workspace-sub">{L==="de"?"Kontinuierliche Überwachung von Lieferanten und Risikoländern.":"Continuous monitoring of suppliers and risk countries."}</div>
        </div>
        <button className="btn btn-g btn-sm" onClick={()=>reloads.reloadMonitoringData()}>↺ {L==="de"?"Aktualisieren":"Refresh"}</button>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {[
          {l:L==="de"?"Überwachte Lieferanten":"Monitored suppliers",v:monSups.length,c:"var(--blue)"},
          {l:L==="de"?"Ereignisse (30 Tage)":"Events (30 days)",v:evs.length,c:evs.length>0?"var(--amber)":"var(--t3)"},
          {l:L==="de"?"Screenings":"Screenings",v:scr.length,c:"var(--purple)"},
        ].map(s=>(
          <div key={s.l} className="kpi" style={{padding:"14px 16px"}}>
            <div className="kpi-accent" style={{background:s.c}}/>
            <div className="kpi-lbl">{s.l}</div>
            <div className="kpi-val" style={{color:s.c,fontSize:24}}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="g2">
        {/* Risk country suppliers */}
        <div className="card">
          <div className="sec-hd" style={{marginBottom:12}}>
            <div className="sec-title">{L==="de"?"Risikoland-Lieferanten":"Risk country suppliers"}</div>
          </div>
          {monSups.length>0 ? (
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {monSups.slice(0,8).map((s:any)=>(
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:"var(--r-md)",background:"var(--bg-2)",border:"1px solid var(--border)"}}>
                  <span className="mono" style={{fontSize:12,color:"var(--red)",fontWeight:700,flexShrink:0}}>{s.country}</span>
                  <span style={{flex:1,fontSize:13,color:"var(--t1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</span>
                  <span className={s.risk_level==="high"?"chip ch":s.risk_level==="medium"?"chip cm":"chip cu"} style={{fontSize:10}}>{s.risk_level}</span>
                </div>
              ))}
              {monSups.length>8&&<div style={{fontSize:12,color:"var(--t3)",textAlign:"center",paddingTop:4}}>+{monSups.length-8} {L==="de"?"weitere":"more"}</div>}
            </div>
          ) : (
            <div className="empty empty-compact">
              <div className="empty-ic">◌</div>
              <div className="empty-t">{L==="de"?"Keine Risikoland-Lieferanten":"No risk country suppliers"}</div>
            </div>
          )}
        </div>

        {/* Events feed */}
        <div className="card">
          <div className="sec-hd" style={{marginBottom:12}}>
            <div className="sec-title">{L==="de"?"Ereignis-Feed":"Event feed"}</div>
          </div>
          {evs.length>0 ? (
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {evs.slice(0,6).map((e:any,i:number)=>(
                <div key={i} style={{padding:"10px 12px",borderRadius:"var(--r-md)",background:"var(--bg-2)",border:"1px solid var(--border)"}}>
                  <div style={{fontSize:12,fontWeight:600,color:"var(--t1)",marginBottom:2}}>{e.title||e.type}</div>
                  <div style={{fontSize:11,color:"var(--t3)"}}>{e.date||e.created_at}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty empty-compact">
              <div className="empty-ic">◌</div>
              <div className="empty-t">{L==="de"?"Keine Ereignisse":"No events"}</div>
              <div className="empty-c">{L==="de"?"Das Monitoring-System ist aktiv und überwacht automatisch.":"The monitoring system is active and monitoring automatically."}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
