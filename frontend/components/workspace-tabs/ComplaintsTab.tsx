"use client";

export default function ComplaintsTab(props: any) {
  const { L, suppliers, complaints, expanded, setExpanded, cSup, setCSup, cCat, setCCat, cSev, setCSev, cDesc, setCDesc,
    submitComplaint, triageComplaint, updateComplaintStatus, exportCSV, triageLd, triageRes, sevChip, cStatusChip, approvalMeta, toast } = props;

  const canManage = ["manager","approver","admin"].includes(approvalMeta?.currentRole||"");
  const open   = complaints.filter((c:any)=>c.status==="open").length;
  const active = complaints.filter((c:any)=>c.status==="investigating"||c.status==="in_review").length;
  const solved = complaints.filter((c:any)=>c.status==="resolved"||c.status==="closed").length;

  const CATS = [["human_rights",L==="de"?"Menschenrechte":"Human rights"],["child_labour",L==="de"?"Kinderarbeit":"Child labour"],["forced_labour",L==="de"?"Zwangsarbeit":"Forced labour"],["discrimination",L==="de"?"Diskriminierung":"Discrimination"],["environment",L==="de"?"Umwelt":"Environment"],["safety",L==="de"?"Sicherheit":"Safety"],["corruption","Corruption"],["other",L==="de"?"Sonstiges":"Other"]];
  const SC: Record<string,string> = { open:"var(--red)",in_review:"var(--blu)",investigating:"var(--vio)",resolved:"var(--g-lo)",closed:"var(--t3)" };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:12 }}>

      {/* KPIs */}
      <div className="kpi-row">
        {[
          {lbl:L==="de"?"Offen":"Open",val:open,col:open>0?"var(--red)":"var(--g-lo)"},
          {lbl:L==="de"?"In Bearbeitung":"Active",val:active,col:active>0?"var(--amb)":"var(--t3)"},
          {lbl:L==="de"?"Gelöst":"Resolved",val:solved,col:"var(--g-lo)"},
          {lbl:L==="de"?"Gesamt":"Total",val:complaints.length,col:"var(--t2)"},
        ].map(k=>(
          <div key={k.lbl} className="kpi">
            <div className="kpi-accent" style={{background:k.col}}/>
            <div className="kpi-lbl">{k.lbl}</div>
            <div className="kpi-val" style={{color:k.col,fontSize:24}}>{k.val}</div>
          </div>
        ))}
      </div>

      <div className="g2">
        {/* Submit form */}
        <div className="card">
          <div className="sec-title" style={{marginBottom:4}}>{L==="de"?"Neue Meldung":"New complaint"}<span className="ltag">§8 LkSG</span></div>
          <div className="sec-sub" style={{marginBottom:12}}>{L==="de"?"Anonyme Meldungen werden sicher und BAFA-konform verarbeitet.":"Anonymous reports are securely processed."}</div>
          <div className="fl">
            <label>{L==="de"?"Lieferant (optional)":"Supplier (optional)"}</label>
            <select className="sel" value={cSup} onChange={e=>setCSup(e.target.value)}>
              <option value="">—</option>
              {suppliers.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="inp-row">
            <div className="fl">
              <label>{L==="de"?"Kategorie":"Category"}</label>
              <select className="sel" value={cCat} onChange={e=>setCCat(e.target.value)}>
                {CATS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="fl">
              <label>{L==="de"?"Schwere":"Severity"}</label>
              <select className="sel" value={cSev} onChange={e=>setCSev(e.target.value)}>
                <option value="low">{L==="de"?"Niedrig":"Low"}</option>
                <option value="medium">{L==="de"?"Mittel":"Medium"}</option>
                <option value="high">{L==="de"?"Hoch":"High"}</option>
                <option value="critical">{L==="de"?"Kritisch":"Critical"}</option>
              </select>
            </div>
          </div>
          <div className="fl">
            <label>{L==="de"?"Beschreibung *":"Description *"}</label>
            <textarea className="ta" rows={4} value={cDesc} onChange={e=>setCDesc(e.target.value)} placeholder={L==="de"?"Sachverhalt beschreiben…":"Describe the incident…"}/>
          </div>
          <div className="brow">
            <button className="btn btn-p" onClick={submitComplaint} disabled={!cDesc?.trim()}>{L==="de"?"Meldung einreichen":"Submit"}</button>
            <button className="btn btn-g btn-sm" onClick={()=>exportCSV("/complaints/export/csv","beschwerden.csv")}>↓ CSV</button>
          </div>
        </div>

        {/* Info */}
        <div className="card">
          <div className="sec-title" style={{marginBottom:12}}>§8 LkSG — {L==="de"?"Hinweisgebersystem":"Whistleblower System"}</div>
          {[
            {t:L==="de"?"Anonymität":"Anonymity",c:L==="de"?"Meldende Personen bleiben anonym.":"Reporting persons stay anonymous."},
            {t:L==="de"?"Eskalation":"Escalation",c:L==="de"?"Kritische Fälle werden priorisiert.":"Critical cases are prioritised."},
            {t:L==="de"?"Dokumentation":"Documentation",c:L==="de"?"Vollständiger Audit Trail für BAFA.":"Complete audit trail for BAFA."},
            {t:L==="de"?"Frist":"Deadline",c:L==="de"?"§8 Abs. 3: Antwort innerhalb angemessener Frist.":"§8 para. 3: Response within reasonable timeframe."},
          ].map(item=>(
            <div key={item.t} style={{display:"flex",flexDirection:"column",padding:"10px 12px",borderRadius:"var(--r2)",background:"var(--c2)",border:"1px solid var(--b1)",marginBottom:6}}>
              <div style={{fontSize:13,fontWeight:600,color:"var(--t1)",marginBottom:2}}>{item.t}</div>
              <div style={{fontSize:12,color:"var(--t3)"}}>{item.c}</div>
            </div>
          ))}
        </div>
      </div>

      {/* List */}
      <div>
        <div className="sec-hd" style={{marginBottom:10}}>
          <div className="sec-title">{L==="de"?"Alle Meldungen":"All complaints"} ({complaints.length})</div>
        </div>
        {complaints.length > 0 ? (
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {complaints.map((c:any)=>{
              const isExp = expanded===c.id;
              const sc = SC[c.status]||"var(--t3)";
              return (
                <div key={c.id} style={{background:"var(--c1)",border:`1px solid ${isExp?"var(--b3)":"var(--b2)"}`,borderRadius:"var(--r4)",overflow:"hidden"}}>
                  <div style={{display:"flex"}}>
                    <div style={{width:3,background:sc,flexShrink:0}}/>
                    <div style={{flex:1,padding:"12px 14px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,cursor:"pointer"}} onClick={()=>setExpanded(isExp?null:c.id)}>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,flexWrap:"wrap"}}>
                            <strong style={{fontSize:13,color:"var(--t1)"}}>{c.description?.substring(0,60)||"Meldung"}</strong>
                            {sevChip(c.severity)}
                            {cStatusChip(c.status)}
                          </div>
                          <div style={{fontSize:11.5,color:"var(--t3)"}}>
                            {new Date(c.created_at).toLocaleDateString(L==="de"?"de-DE":"en-GB")}
                            {c.category&&` · ${c.category.replace(/_/g," ")}`}
                          </div>
                        </div>
                        <span style={{fontSize:10,color:"var(--t4)"}}>{isExp?"▲":"▼"}</span>
                      </div>
                      {isExp&&(
                        <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--b1)"}}>
                          {c.description&&<div style={{fontSize:13,color:"var(--t2)",marginBottom:12,lineHeight:1.7}}>{c.description}</div>}
                          <div className="brow">
                            {c.status==="open"&&<button className="btn btn-g btn-sm" onClick={()=>canManage&&updateComplaintStatus(c.id,"in_review")} disabled={!canManage}>{L==="de"?"In Prüfung":"In review"}</button>}
                            {c.status==="in_review"&&<button className="btn btn-warn btn-sm" onClick={()=>canManage&&updateComplaintStatus(c.id,"investigating")} disabled={!canManage}>{L==="de"?"Ermitteln":"Investigate"}</button>}
                            {(c.status==="in_review"||c.status==="investigating")&&<button className="btn btn-p btn-sm" onClick={()=>canManage&&updateComplaintStatus(c.id,"resolved")} disabled={!canManage}>✓ {L==="de"?"Lösen":"Resolve"}</button>}
                            {c.status!=="closed"&&<button className="btn btn-r btn-xs" onClick={()=>canManage&&updateComplaintStatus(c.id,"closed")} disabled={!canManage}>✕ {L==="de"?"Schließen":"Close"}</button>}
                            {c.status==="open"&&<button className="btn btn-ai btn-sm" onClick={()=>canManage&&triageComplaint(c.id)} disabled={!canManage}>✦ {L==="de"?"KI-Triage":"AI Triage"}</button>}
                          </div>
                          {triageRes&&<div style={{background:"var(--c2)",border:"1px solid var(--b2)",borderRadius:"var(--r2)",padding:12,marginTop:10,fontSize:12.5,lineHeight:1.7,color:"var(--t2)",whiteSpace:"pre-wrap"}}>{triageRes}</div>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty card"><div className="empty-ic">△</div><div className="empty-t">{L==="de"?"Keine Meldungen":"No complaints"}</div></div>
        )}
      </div>
    </div>
  );
}
