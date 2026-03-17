import React from "react";
import type { WorkspaceTabProps } from "@/lib/workspace-types";

export default function AuditTab(props: WorkspaceTabProps) {
  const {L,auditLog,auditFilter,setAuditFilter,auditLd,loadAuditLog,exportCSV} = props;
  const log = (auditLog as any[])||[];

  const ACTION_COLOR: Record<string,string> = {
    create:"var(--g1)",update:"var(--blue)",delete:"var(--red)",view:"var(--t3)",
    login:"var(--purple)",export:"var(--amber)",generate:"var(--g1)",
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div className="workspace-bar">
        <div>
          <div className="workspace-kicker">§10 LkSG — Audit Trail</div>
          <div className="workspace-title">{L==="de"?"Audit Trail":"Audit Trail"}</div>
          <div className="workspace-sub">{L==="de"?"Lückenlose Aktivitätsprotokollierung für BAFA-Prüfungen.":"Complete activity logging for BAFA audits."}</div>
        </div>
        <div className="brow">
          <button type="button" className="btn btn-g btn-sm" onClick={()=>loadAuditLog()} disabled={auditLd as boolean}>
            {auditLd?<span className="spin-d"/>:"↺"} {L==="de"?"Laden":"Load"}
          </button>
          <button type="button" className="btn btn-g btn-sm" onClick={()=>exportCSV("/audit/export/csv","audit-trail.csv")}>↓ CSV</button>
        </div>
      </div>

      {/* Filter */}
      <div style={{display:"flex",gap:8}}>
        <input className="inp" style={{height:34,width:200,fontSize:12.5}}
          placeholder={L==="de"?"Filtern…":"Filter…"}
          value={(auditFilter as string)||""}
          onChange={e=>(setAuditFilter as any)(e.target.value)}
        />
      </div>

      {/* Table */}
      {log.length>0 ? (
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>{L==="de"?"Zeitpunkt":"Timestamp"}</th>
                <th>{L==="de"?"Aktion":"Action"}</th>
                <th>{L==="de"?"Ressource":"Resource"}</th>
                <th>{L==="de"?"Benutzer":"User"}</th>
                <th>{L==="de"?"Details":"Details"}</th>
              </tr>
            </thead>
            <tbody>
              {log.filter((e:any)=>{
                const f = ((auditFilter as string)||"").toLowerCase();
                return !f || JSON.stringify(e).toLowerCase().includes(f);
              }).slice(0,100).map((e:any,i:number)=>{
                const ac = ACTION_COLOR[e.action]||"var(--t3)";
                return (
                  <tr key={i}>
                    <td><span className="mono" style={{fontSize:11,color:"var(--t3)"}}>{new Date(e.created_at||e.timestamp).toLocaleString(L==="de"?"de-DE":"en-GB")}</span></td>
                    <td><span style={{fontSize:11,fontWeight:700,color:ac,textTransform:"uppercase",letterSpacing:"0.05em"}}>{e.action}</span></td>
                    <td><span style={{fontSize:12,color:"var(--t2)"}}>{e.resource_type}</span></td>
                    <td><span style={{fontSize:12,color:"var(--t2)"}}>{e.user_email||e.user_id||"—"}</span></td>
                    <td><span style={{fontSize:11,color:"var(--t3)",fontFamily:"'DM Mono',monospace"}}>{e.details?JSON.stringify(e.details).substring(0,60):"—"}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty card">
          <div className="empty-ic">≡</div>
          <div className="empty-t">{L==="de"?"Keine Protokolleinträge":"No log entries"}</div>
          <div className="empty-c">{L==="de"?"Klicken Sie auf Laden, um den Audit Trail abzurufen.":"Click Load to fetch the audit trail."}</div>
          <button type="button" className="btn btn-g btn-sm" style={{marginTop:14}} onClick={()=>loadAuditLog()}>{L==="de"?"Laden":"Load"}</button>
        </div>
      )}
    </div>
  );
}
