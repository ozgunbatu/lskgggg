"use client";
export default function MonitoringTab(props: any) {
  const { L, events, screenings, suppliers, reloads } = props;
  const evs = events||[]; const scr = screenings||[];
  const riskCountries = ["BD","MM","PK","CN","IN","VN","KH","ET","NG","CD"];
  const monSups = suppliers.filter((s:any)=>riskCountries.includes(s.country));
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:"var(--g)",textTransform:"uppercase",letterSpacing:".1em",fontFamily:"'DM Mono',monospace"}}>§5 LkSG — Continuous Monitoring</div>
          <div style={{fontSize:18,fontWeight:800,color:"var(--t1)",letterSpacing:"-.04em"}}>{L==="de"?"Monitoring & Frühwarnung":"Monitoring & Early Warning"}</div>
        </div>
        <button className="btn btn-g btn-sm" onClick={()=>reloads?.reloadInsights()}>↺ {L==="de"?"Aktualisieren":"Refresh"}</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {[
          {l:L==="de"?"Überwachte Lieferanten":"Monitored suppliers",v:monSups.length,c:"var(--blu)"},
          {l:L==="de"?"Ereignisse (30 Tage)":"Events (30 days)",v:evs.length,c:evs.length>0?"var(--amb)":"var(--t3)"},
          {l:"Screenings",v:scr.length,c:"var(--vio)"},
        ].map(s=>(
          <div key={s.l} className="kpi"><div className="kpi-accent" style={{background:s.c}}/><div className="kpi-lbl">{s.l}</div><div className="kpi-val" style={{color:s.c,fontSize:24}}>{s.v}</div></div>
        ))}
      </div>
      <div className="g2">
        <div className="card">
          <div className="sec-title" style={{marginBottom:10}}>{L==="de"?"Risikoland-Lieferanten":"Risk country suppliers"}</div>
          {monSups.length > 0 ? monSups.slice(0,8).map((s:any)=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:"var(--r2)",background:"var(--c2)",border:"1px solid var(--b1)",marginBottom:5}}>
              <span className="mono" style={{fontSize:12,color:"var(--red)",fontWeight:700,flexShrink:0}}>{s.country}</span>
              <span style={{flex:1,fontSize:13,color:"var(--t1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</span>
              <span className={s.risk_level==="high"?"chip ch":s.risk_level==="medium"?"chip cm":"chip cu"} style={{fontSize:10}}>{s.risk_level}</span>
            </div>
          )) : <div className="empty empty-compact"><div className="empty-t">{L==="de"?"Keine Risikoland-Lieferanten":"No risk country suppliers"}</div></div>}
        </div>
        <div className="card">
          <div className="sec-title" style={{marginBottom:10}}>{L==="de"?"Letzte Ereignisse":"Recent events"}</div>
          {evs.length > 0 ? evs.slice(0,6).map((ev:any)=>(
            <div key={ev.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 10px",borderRadius:"var(--r2)",background:"var(--c2)",border:"1px solid var(--b1)",marginBottom:5}}>
              <span className={ev.severity==="high"?"chip ch":ev.severity==="medium"?"chip cm":"chip cu"} style={{fontSize:10,flexShrink:0}}>{ev.event_type||"event"}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12.5,color:"var(--t1)",fontWeight:600}}>{ev.title}</div>
                <div style={{fontSize:11,color:"var(--t3)"}}>{new Date(ev.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          )) : <div className="empty empty-compact"><div className="empty-t">{L==="de"?"Keine Ereignisse":"No events"}</div></div>}
        </div>
      </div>
    </div>
  );
}
