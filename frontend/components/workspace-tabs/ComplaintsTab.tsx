import React from "react";
import WorkspaceDataState from "../workspace/WorkspaceDataState";
import type { WorkspaceTabProps } from "@/lib/workspace-types";
import { canManageCases } from "@/lib/workspace-access";
import { getSessionRole } from "@/lib/auth";

const STATUS_COLOR: Record<string,string> = {
  open:"var(--red)",in_review:"var(--blue)",investigating:"var(--purple)",
  resolved:"var(--g1)",closed:"var(--t3)",
};

export default function ComplaintsTab(props: WorkspaceTabProps) {
  const {
    L,requestState,reloads,complaints,expanded,setExpanded,
    cSup,setCSup,cCat,setCCat,cSev,setCSev,cDesc,setCDesc,
    cStatusChip,sevChip,exportCSV,setTab,suppliers,
    submitComplaint,triageComplaint,updateComplaintStatus,
    triageRes,triageLd,approvalMeta,toast,
  } = props;

  const role = approvalMeta?.currentRole || getSessionRole();
  const canManage = canManageCases(role);

  const open   = complaints.filter((c:any)=>c.status==="open").length;
  const inv    = complaints.filter((c:any)=>c.status==="investigating"||c.status==="in_review").length;
  const solved = complaints.filter((c:any)=>c.status==="resolved"||c.status==="closed").length;

  const CATEGORIES = [
    ["human_rights",L==="de"?"Menschenrechte":"Human rights"],
    ["child_labour",L==="de"?"Kinderarbeit":"Child labour"],
    ["forced_labour",L==="de"?"Zwangsarbeit":"Forced labour"],
    ["discrimination",L==="de"?"Diskriminierung":"Discrimination"],
    ["environment",L==="de"?"Umwelt":"Environment"],
    ["safety",L==="de"?"Arbeitssicherheit":"Safety"],
    ["corruption",L==="de"?"Korruption":"Corruption"],
    ["other",L==="de"?"Sonstiges":"Other"],
  ];

  return (
    <>
      <WorkspaceDataState L={L} requestState={requestState} domains={[
        {key:"complaints",label:L==="de"?"Beschwerden":"Complaints",onRetry:reloads.reloadCoreData},
      ]}/>

      {/* KPI */}
      <div className="kpi-row" style={{marginBottom:16}}>
        {[
          {lbl:L==="de"?"Offen":"Open",       val:open,   col:open>0?"var(--red)":"var(--g1)"},
          {lbl:L==="de"?"In Bearbeitung":"Active",val:inv,col:inv>0?"var(--amber)":"var(--t3)"},
          {lbl:L==="de"?"Gelöst":"Resolved",  val:solved, col:"var(--g1)"},
          {lbl:L==="de"?"Gesamt":"Total",      val:complaints.length,col:"var(--t2)"},
        ].map(k=>(
          <div key={k.lbl} className="kpi">
            <div className="kpi-accent" style={{background:k.col}}/>
            <div className="kpi-lbl">{k.lbl}</div>
            <div className="kpi-val" style={{color:k.col}}>{k.val}</div>
          </div>
        ))}
      </div>

      <div className="g2" style={{marginBottom:14}}>
        {/* Submit form */}
        <div className="card">
          <div className="sec-title" style={{marginBottom:4}}>
            {L==="de"?"Neue Meldung":"New complaint"}
            <span className="ltag">§8 LkSG</span>
          </div>
          <div className="sec-sub" style={{marginBottom:14}}>{L==="de"?"Anonyme Meldungen werden sicher und BAFA-konform verarbeitet.":"Anonymous reports are securely and BAFA-compliantly processed."}</div>

          <div className="fl">
            <label>{L==="de"?"Lieferant (optional)":"Supplier (optional)"}</label>
            <select className="sel" value={cSup as string} onChange={e=>(setCSup as any)(e.target.value)}>
              <option value="">—</option>
              {(suppliers as any[]).map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="inp-row">
            <div className="fl">
              <label>{L==="de"?"Kategorie":"Category"}</label>
              <select className="sel" value={cCat as string} onChange={e=>(setCCat as any)(e.target.value)}>
                {CATEGORIES.map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="fl">
              <label>{L==="de"?"Schwere":"Severity"}</label>
              <select className="sel" value={cSev as string} onChange={e=>(setCSev as any)(e.target.value)}>
                <option value="low">{L==="de"?"Niedrig":"Low"}</option>
                <option value="medium">{L==="de"?"Mittel":"Medium"}</option>
                <option value="high">{L==="de"?"Hoch":"High"}</option>
                <option value="critical">{L==="de"?"Kritisch":"Critical"}</option>
              </select>
            </div>
          </div>
          <div className="fl">
            <label>{L==="de"?"Beschreibung *":"Description *"}</label>
            <textarea className="ta" rows={4} value={cDesc as string} onChange={e=>(setCDesc as any)(e.target.value)} placeholder={L==="de"?"Beschreiben Sie den Vorfall genau…":"Describe the incident in detail…"}/>
          </div>
          <div className="brow">
            <button type="button" className="btn btn-p" onClick={()=>(submitComplaint as any)()} disabled={!(cDesc as string)?.trim()}>
              {L==="de"?"Meldung einreichen":"Submit complaint"}
            </button>
            <button type="button" className="btn btn-g btn-sm" onClick={()=>exportCSV("/complaints/export/csv","beschwerden.csv")}>↓ CSV</button>
          </div>
        </div>

        {/* Info */}
        <div className="card">
          <div className="sec-title" style={{marginBottom:12}}>§8 LkSG — {L==="de"?"Hinweisgebersystem":"Whistleblower System"}</div>
          {[
            {icon:"🔒",t:L==="de"?"Anonymität":"Anonymity",c:L==="de"?"Meldende Personen bleiben anonym.":"Reporting persons stay anonymous."},
            {icon:"⚡",t:L==="de"?"Eskalation":"Escalation",c:L==="de"?"Kritische Fälle werden priorisiert.":"Critical cases are prioritised."},
            {icon:"📋",t:L==="de"?"Dokumentation":"Documentation",c:L==="de"?"Vollständiger Audit Trail für BAFA.":"Complete audit trail for BAFA."},
            {icon:"⏱",t:L==="de"?"Fristen":"Deadlines",c:L==="de"?"§8 Abs. 3: Antwort innerhalb angemessener Frist.":"§8 para. 3: Response within reasonable timeframe."},
          ].map(item=>(
            <div key={item.icon} style={{display:"flex",gap:10,padding:"10px 12px",borderRadius:"var(--r-md)",background:"var(--bg-2)",border:"1px solid var(--border)",marginBottom:8}}>
              <span style={{fontSize:18,flexShrink:0}}>{item.icon}</span>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:"var(--t1)",marginBottom:2}}>{item.t}</div>
                <div style={{fontSize:12,color:"var(--t3)"}}>{item.c}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="sec-hd" style={{marginBottom:10}}>
        <div className="sec-title">{L==="de"?"Alle Meldungen":"All complaints"} ({complaints.length})</div>
        <button type="button" className="btn btn-g btn-sm" onClick={()=>exportCSV("/complaints/export/csv","beschwerden.csv")}>↓ CSV</button>
      </div>

      {complaints.length > 0 ? (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {complaints.map((c:any)=>{
            const isExp = expanded === c.id;
            const sc = STATUS_COLOR[c.status]||"var(--t3)";
            return (
              <div key={c.id} style={{background:"var(--bg-1)",border:`1px solid ${isExp?"var(--border-2)":"var(--border)"}`,borderRadius:"var(--r-lg)",overflow:"hidden",transition:"border-color 0.15s"}}>
                <div style={{display:"flex"}}>
                  <div style={{width:3,background:sc,flexShrink:0}}/>
                  <div style={{flex:1,padding:"12px 14px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,cursor:"pointer"}} onClick={()=>setExpanded(isExp?null:c.id)}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,flexWrap:"wrap" as React.CSSProperties["flexWrap"]}}>
                          <strong style={{fontSize:13,color:"var(--t1)"}}>{c.title||(c.description?.substring(0,60)||"Meldung")}</strong>
                          {sevChip(c.severity)}
                          {cStatusChip(c.status)}
                        </div>
                        <div style={{fontSize:11.5,color:"var(--t3)",display:"flex",gap:10}}>
                          <span>{new Date(c.created_at).toLocaleDateString(L==="de"?"de-DE":"en-GB")}</span>
                          {c.channel&&<span>📨 {c.channel}</span>}
                          {c.category&&<span>{c.category.replace(/_/g," ")}</span>}
                        </div>
                      </div>
                      <span style={{fontSize:10,color:"var(--t4)"}}>{isExp?"▲":"▼"}</span>
                    </div>
                    {isExp&&(
                      <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--border)"}}>
                        {c.description&&<div style={{fontSize:13,color:"var(--t2)",marginBottom:12,lineHeight:1.7}}>{c.description}</div>}
                        <div className="brow" style={{marginBottom:c.notes?10:0}}>
                          {c.status==="open"&&<button type="button" className="btn btn-g btn-sm" onClick={()=>canManage&&(updateComplaintStatus as any)(c.id,"in_review")} disabled={!canManage}>{L==="de"?"In Prüfung":"In review"}</button>}
                          {c.status==="in_review"&&<button type="button" className="btn btn-warn btn-sm" onClick={()=>canManage&&(updateComplaintStatus as any)(c.id,"investigating")} disabled={!canManage}>{L==="de"?"Ermitteln":"Investigate"}</button>}
                          {(c.status==="in_review"||c.status==="investigating")&&<button type="button" className="btn btn-p btn-sm" onClick={()=>canManage&&(updateComplaintStatus as any)(c.id,"resolved")} disabled={!canManage}>✓ {L==="de"?"Lösen":"Resolve"}</button>}
                          {c.status!=="closed"&&<button type="button" className="btn btn-r btn-xs" onClick={()=>canManage&&(updateComplaintStatus as any)(c.id,"closed")} disabled={!canManage}>✕ {L==="de"?"Schließen":"Close"}</button>}
                          {c.status==="open"&&<button type="button" className="btn btn-ai btn-sm" onClick={()=>canManage&&(triageComplaint as any)(c.id)} disabled={(triageLd as any)?.[c.id]||!canManage}>
                            {(triageLd as any)?.[c.id]?<span className="spin"/>:"✦"} {L==="de"?"KI-Triage":"AI Triage"}
                          </button>}
                        </div>
                        {(triageRes as any)?.[c.id]&&(
                          <div style={{background:"var(--bg-2)",border:"1px solid var(--border)",borderRadius:"var(--r-md)",padding:12,marginTop:10,fontSize:12.5,lineHeight:1.7,color:"var(--t2)",whiteSpace:"pre-wrap"}}>
                            {(triageRes as any)[c.id]}
                          </div>
                        )}
                        {c.notes&&<div style={{fontSize:12,color:"var(--t3)",fontStyle:"italic",marginTop:8}}>{c.notes}</div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty card">
          <div className="empty-ic">△</div>
          <div className="empty-t">{L==="de"?"Keine Meldungen":"No complaints"}</div>
          <div className="empty-c">{L==="de"?"Der §8-Beschwerdekanal ist aktiv. Erste Meldung oben einreichen.":"The §8 complaint channel is active. Submit the first report above."}</div>
        </div>
      )}
    </>
  );
}
