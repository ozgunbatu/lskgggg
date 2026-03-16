import React from "react";
import WorkspaceDataState from "../workspace/WorkspaceDataState";
import WorkspaceModuleReadOnly from "../workspace/WorkspaceModuleReadOnly";
import type { WorkspaceTabProps } from "@/lib/workspace-types";
import { canWrite, canManageCases } from "@/lib/workspace-access";
import { getSessionRole } from "@/lib/auth";

const PC: Record<string,string> = {
  critical:"var(--red)",high:"var(--red)",medium:"var(--amber)",low:"var(--blue)",normal:"var(--blue)",
};

export default function ActionsTab(props: WorkspaceTabProps) {
  const {
    L,requestState,reloads,actions,expanded,setExpanded,showCapModal,setShowCapModal,
    actionNotes,setActionNotes,pChip,aStatusChip,dueBadge,setTab,
    updateActionStatus,saveActionNote,deleteAction,sendAi,exportCSV,actionStats,approvalMeta,
  } = props;
  const role = approvalMeta?.currentRole || getSessionRole();
  const writable = canWrite(role);
  const canManage = canManageCases(role);
  const pct = actionStats.total > 0 ? Math.round((actionStats.done/actionStats.total)*100) : 0;

  return (
    <>
      <WorkspaceDataState L={L} requestState={requestState} domains={[
        {key:"actions",label:L==="de"?"Maßnahmen":"Actions",onRetry:reloads.reloadCoreData},
      ]} />
      {!writable && <WorkspaceModuleReadOnly L={L} title={L==="de"?"Schreibgeschützt":"Read-only"} copy={L==="de"?"Ihre Rolle kann Maßnahmen nur lesen.":"Your role can only view actions."} actionLabel={L==="de"?"KPI öffnen":"Open KPI"} onAction={()=>setTab("kpi")} />}

      {/* ── KPI ROW ─────────────────────────────────────────────────────── */}
      <div className="kpi-row" style={{marginBottom:16}}>
        {[
          {lbl:L==="de"?"Offen":"Open",      val:actionStats.open,    col:actionStats.open>0?"var(--amber)":"var(--g1)"},
          {lbl:L==="de"?"Überfällig":"Overdue",val:actionStats.overdue,col:actionStats.overdue>0?"var(--red)":"var(--t3)"},
          {lbl:L==="de"?"Abgeschlossen":"Done",val:actionStats.done,   col:"var(--g1)"},
          {lbl:L==="de"?"Gesamt":"Total",     val:actionStats.total,   col:"var(--t2)"},
        ].map(k=>(
          <div key={k.lbl} className="kpi">
            <div className="kpi-accent" style={{background:k.col}}/>
            <div className="kpi-lbl">{k.lbl}</div>
            <div className="kpi-val" style={{color:k.col}}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* ── PROGRESS ────────────────────────────────────────────────────── */}
      {actionStats.total > 0 && (
        <div className="card-sm" style={{marginBottom:14,display:"flex",alignItems:"center",gap:14}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:600,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>
              {L==="de"?"Gesamtfortschritt":"Overall progress"}
            </div>
            <div className="prog" style={{height:6}}>
              <div className="prog-fill" style={{width:`${pct}%`,background:"var(--g2)"}}/>
            </div>
          </div>
          <div style={{fontSize:20,fontWeight:700,color:"var(--g1)",fontVariantNumeric:"tabular-nums",flexShrink:0}}>
            {pct}%
          </div>
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="sec-hd" style={{marginBottom:14}}>
        <div>
          <div className="sec-title">
            {L==="de"?"Aktionsplan (CAP)":"Action Center (CAP)"}
            <span className="ltag">§6–7 LkSG</span>
          </div>
          <div className="sec-sub">{L==="de"?"Corrective Action Plans nach §6 LkSG. Abgeschlossene Maßnahmen bleiben im Audit Trail.":"Corrective Action Plans under §6 LkSG. Completed measures stay in the audit trail."}</div>
        </div>
        <div className="brow">
          <button className="btn btn-g btn-sm" onClick={()=>exportCSV("/actions/export/csv","massnahmen.csv")}>↓ CSV</button>
          <button className="btn btn-ai btn-sm" onClick={()=>canManage&&sendAi(L==="de"?"Welche meiner CAPs sind am dringlichsten?":"Which of my CAPs are most urgent?")}>
            ✦ {L==="de"?"KI-Analyse":"AI Analyse"}
          </button>
          <button className="btn btn-p btn-sm" onClick={()=>canManage&&setShowCapModal(true)} disabled={!canManage}>
            + {L==="de"?"Neuer CAP":"New CAP"}
          </button>
        </div>
      </div>

      {/* ── LIST ────────────────────────────────────────────────────────── */}
      {actions.length > 0 ? (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {actions.map((a:any)=>{
            const isExp = expanded === a.id;
            const d = a.due_date ? Math.ceil((new Date(a.due_date).getTime()-Date.now())/86400000) : null;
            const isOD = d!==null && d<0 && a.status!=="completed" && a.status!=="closed";
            const pc = PC[a.priority] || "var(--blue)";
            return (
              <div key={a.id} style={{
                background:"var(--bg-1)",
                border:`1px solid ${isOD?"var(--red-border)":isExp?"var(--border-2)":"var(--border)"}`,
                borderRadius:"var(--r-lg)",
                overflow:"hidden",
                transition:"border-color 0.15s",
              }}>
                {/* Left accent */}
                <div style={{display:"flex"}}>
                  <div style={{width:3,background:isOD?"var(--red)":pc,flexShrink:0,borderRadius:"var(--r-lg) 0 0 var(--r-lg)"}}/>
                  <div style={{flex:1,padding:"12px 14px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,cursor:"pointer"}} onClick={()=>setExpanded(isExp?null:a.id)}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5,flexWrap:"wrap" as React.CSSProperties["flexWrap"]}}>
                          <strong style={{fontSize:13.5,color:"var(--t1)",letterSpacing:"-0.02em"}}>{a.title}</strong>
                          {pChip(a.priority)}
                          {aStatusChip(a.status)}
                          {dueBadge(a.due_date)}
                        </div>
                        <div style={{fontSize:12,color:"var(--t3)",display:"flex",gap:12,flexWrap:"wrap" as React.CSSProperties["flexWrap"]}}>
                          {a.supplier_name&&<span>◎ {a.supplier_name}</span>}
                          <span style={{fontFamily:"'DM Mono',monospace",fontSize:11}}>§{a.lksg_paragraph} LkSG</span>
                          {a.assigned_to&&<span>👤 {a.assigned_to}</span>}
                          {a.due_date&&<span>📅 {new Date(a.due_date).toLocaleDateString(L==="de"?"de-DE":"en-GB")}</span>}
                        </div>
                      </div>
                      <span style={{fontSize:10,color:"var(--t4)",flexShrink:0,marginTop:2}}>{isExp?"▲":"▼"}</span>
                    </div>

                    {isExp&&(
                      <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)"}}>
                        {a.description&&<div style={{fontSize:13,color:"var(--t2)",marginBottom:12,lineHeight:1.7}}>{a.description}</div>}
                        <div className="brow" style={{marginBottom:12}}>
                          {a.status!=="completed"&&a.status!=="closed"&&<>
                            {a.status==="open"&&<button className="btn btn-g btn-sm" onClick={()=>canManage&&updateActionStatus(a.id,"in_progress")} disabled={!canManage}>{L==="de"?"Starten":"Start"}</button>}
                            {a.status==="in_progress"&&<button className="btn btn-p btn-sm" onClick={()=>canManage&&updateActionStatus(a.id,"completed")} disabled={!canManage}>✓ {L==="de"?"Abschließen":"Complete"}</button>}
                            <button className="btn btn-r btn-xs" onClick={()=>canManage&&deleteAction(a.id,a.title)} disabled={!canManage}>✕ {L==="de"?"Löschen":"Delete"}</button>
                          </>}
                          {(a.status==="completed"||a.status==="closed")&&(
                            <div className="al al-ok" style={{padding:"6px 12px",marginBottom:0,fontSize:12.5,flex:1}}>
                              ✓ {L==="de"?"Abgeschlossen":"Completed"} {a.completed_at?new Date(a.completed_at).toLocaleDateString(L==="de"?"de-DE":"en-GB"):""}
                            </div>
                          )}
                        </div>
                        <div className="fl" style={{marginBottom:0}}>
                          <label>{L==="de"?"Nachweis / Notiz":"Evidence / Note"}</label>
                          <textarea className="ta" rows={3}
                            value={actionNotes[a.id]??(a.evidence_notes||"")}
                            onChange={e=>setActionNotes((n:any)=>({...n,[a.id]:e.target.value}))}
                            disabled={!canManage}
                            placeholder={L==="de"?"z.B. Audit-Befund, Maßnahmen-Nachweis…":"e.g. audit finding, measure evidence…"}
                          />
                          <button className="btn btn-g btn-xs" style={{marginTop:6}} onClick={()=>canManage&&saveActionNote(a.id)} disabled={!canManage}>
                            ✓ {L==="de"?"Speichern":"Save"}
                          </button>
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
          <div className="empty-ic">✓</div>
          <div className="empty-t">{L==="de"?"Keine Aktionspläne":"No action plans"}</div>
          <div className="empty-c">{L==="de"?"Legen Sie den ersten CAP an, um §6 LkSG Maßnahmen zu dokumentieren.":"Create the first CAP to document §6 LkSG measures."}</div>
          <button className="btn btn-p btn-sm" style={{marginTop:14}} onClick={()=>canManage&&setShowCapModal(true)} disabled={!canManage}>
            + {L==="de"?"Ersten CAP anlegen":"Create first CAP"}
          </button>
        </div>
      )}
    </>
  );
}
