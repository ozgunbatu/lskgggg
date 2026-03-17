"use client";

export default function ActionsTab(props: any) {
  const { L, actions, expanded, setExpanded, showCapModal, setShowCapModal, pChip, aStatusChip, dueBadge,
    updateActionStatus, saveActionNote, deleteAction, sendAi, exportCSV, actionStats, actionNotes, setActionNotes, approvalMeta } = props;

  const canManage = ["manager","approver","admin"].includes(approvalMeta?.currentRole||"");
  const pct = actionStats.total > 0 ? Math.round((actionStats.done/actionStats.total)*100) : 0;

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:12 }}>

      <div className="kpi-row">
        {[
          {lbl:L==="de"?"Offen":"Open",val:actionStats.open,col:actionStats.open>0?"var(--amb)":"var(--g-lo)"},
          {lbl:L==="de"?"Überfällig":"Overdue",val:actionStats.overdue,col:actionStats.overdue>0?"var(--red)":"var(--t3)"},
          {lbl:L==="de"?"Abgeschlossen":"Done",val:actionStats.done,col:"var(--g-lo)"},
          {lbl:L==="de"?"Gesamt":"Total",val:actionStats.total,col:"var(--t2)"},
        ].map(k=>(
          <div key={k.lbl} className="kpi">
            <div className="kpi-accent" style={{background:k.col}}/>
            <div className="kpi-lbl">{k.lbl}</div>
            <div className="kpi-val" style={{color:k.col,fontSize:24}}>{k.val}</div>
          </div>
        ))}
      </div>

      {actionStats.total > 0 && (
        <div className="card-sm" style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:600,color:"var(--t3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:5}}>{L==="de"?"Gesamtfortschritt":"Overall progress"}</div>
            <div className="prog" style={{height:5}}><div className="prog-fill" style={{width:`${pct}%`,background:"var(--g)"}}/></div>
          </div>
          <div style={{fontSize:20,fontWeight:700,color:"var(--g)",flexShrink:0}}>{pct}%</div>
        </div>
      )}

      <div className="sec-hd">
        <div>
          <div className="sec-title">{L==="de"?"Aktionsplan (CAP)":"Action Center (CAP)"}<span className="ltag">§6–7 LkSG</span></div>
          <div className="sec-sub">{L==="de"?"Corrective Action Plans nach §6 LkSG.":"Corrective Action Plans under §6 LkSG."}</div>
        </div>
        <div className="brow">
          <button className="btn btn-g btn-sm" onClick={()=>exportCSV("/actions/export/csv","massnahmen.csv")}>↓ CSV</button>
          <button className="btn btn-ai btn-sm" onClick={()=>sendAi(L==="de"?"Welche meiner CAPs sind am dringlichsten?":"Which of my CAPs are most urgent?")}>✦ {L==="de"?"KI-Analyse":"AI"}</button>
          <button className="btn btn-p btn-sm" onClick={()=>canManage&&setShowCapModal(true)} disabled={!canManage}>+ {L==="de"?"Neuer CAP":"New CAP"}</button>
        </div>
      </div>

      {actions.length > 0 ? (
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {actions.map((a:any)=>{
            const isExp = expanded===a.id;
            const isOverdue = a.due_date && new Date(a.due_date)<new Date() && a.status!=="completed" && a.status!=="closed";
            return (
              <div key={a.id} style={{background:"var(--c1)",border:`1px solid ${isOverdue?"var(--red-15)":isExp?"var(--b3)":"var(--b2)"}`,borderRadius:"var(--r4)",overflow:"hidden"}}>
                <div style={{display:"flex"}}>
                  <div style={{width:3,background:isOverdue?"var(--red)":a.status==="completed"?"var(--g-lo)":"var(--amb)",flexShrink:0}}/>
                  <div style={{flex:1,padding:"12px 14px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,cursor:"pointer"}} onClick={()=>setExpanded(isExp?null:a.id)}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,flexWrap:"wrap"}}>
                          <strong style={{fontSize:13,color:"var(--t1)"}}>{a.title}</strong>
                          {pChip(a.priority)}
                          {aStatusChip(a.status)}
                          {dueBadge(a.due_date)}
                        </div>
                        <div style={{fontSize:11.5,color:"var(--t3)"}}>
                          {a.lksg_paragraph&&`§${a.lksg_paragraph} LkSG`}{a.supplier_name&&` · ${a.supplier_name}`}{a.assigned_to&&` · ${a.assigned_to}`}
                        </div>
                      </div>
                      <span style={{fontSize:10,color:"var(--t4)"}}>{isExp?"▲":"▼"}</span>
                    </div>
                    {isExp&&(
                      <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--b1)"}}>
                        {a.description&&<div style={{fontSize:13,color:"var(--t2)",marginBottom:10,lineHeight:1.7}}>{a.description}</div>}
                        <div className="brow" style={{marginBottom:10}}>
                          {a.status!=="completed"&&a.status!=="closed"&&<button className="btn btn-p btn-sm" onClick={()=>canManage&&updateActionStatus(a.id,"completed")} disabled={!canManage}>✓ {L==="de"?"Abschließen":"Complete"}</button>}
                          {a.status==="completed"&&<button className="btn btn-g btn-sm" onClick={()=>canManage&&updateActionStatus(a.id,"open")} disabled={!canManage}>{L==="de"?"Neu öffnen":"Reopen"}</button>}
                          <button className="btn btn-r btn-xs" onClick={()=>canManage&&deleteAction(a.id,a.title)} disabled={!canManage}>✕</button>
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          <input className="inp" style={{fontSize:12,height:32}} placeholder={L==="de"?"Notiz hinzufügen…":"Add note…"}
                            value={actionNotes[a.id]||""} onChange={e=>setActionNotes((n:any)=>({...n,[a.id]:e.target.value}))}/>
                          <button className="btn btn-g btn-sm" onClick={()=>saveActionNote(a.id)}>{L==="de"?"Speichern":"Save"}</button>
                        </div>
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
          <div className="empty-t">{L==="de"?"Keine Aktionspläne":"No action plans"}</div>
          <div className="empty-c">{L==="de"?"CAPs dokumentieren Ihre §6 LkSG-Maßnahmen.":"CAPs document your §6 LkSG measures."}</div>
          <div className="brow" style={{justifyContent:"center",marginTop:14}}>
            <button className="btn btn-p btn-sm" onClick={()=>canManage&&setShowCapModal(true)} disabled={!canManage}>+ {L==="de"?"Neuer CAP":"New CAP"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
