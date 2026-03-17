"use client";
export default function AuditTab(props: any) {
  const { L, auditLog, auditFilter, setAuditFilter, auditLd, loadAuditLog, exportCSV } = props;
  const log = auditLog||[];
  const filtered = auditFilter ? log.filter((e:any) => e.action?.toLowerCase().includes(auditFilter.toLowerCase()) || e.entity_type?.toLowerCase().includes(auditFilter.toLowerCase())) : log;
  const AC: Record<string,string> = { create:"var(--g)",update:"var(--blu)",delete:"var(--red)",login:"var(--vio)",export:"var(--amb)" };
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:"var(--g)",textTransform:"uppercase",letterSpacing:".1em",fontFamily:"'DM Mono',monospace"}}>§10 LkSG — Audit Trail</div>
          <div style={{fontSize:18,fontWeight:800,color:"var(--t1)",letterSpacing:"-.04em"}}>{L==="de"?"Audit Trail":"Audit Trail"}</div>
        </div>
        <div className="brow">
          <button className="btn btn-g btn-sm" onClick={()=>loadAuditLog()} disabled={auditLd}>{auditLd?<span className="spin-d"/>:"↺"} {L==="de"?"Laden":"Load"}</button>
          <button className="btn btn-g btn-sm" onClick={()=>exportCSV("/audit/export/csv","audit-trail.csv")}>↓ CSV</button>
        </div>
      </div>
      <input className="inp" style={{height:34}} placeholder={L==="de"?"Filter…":"Filter…"} value={auditFilter||""} onChange={e=>setAuditFilter(e.target.value)}/>
      {filtered.length > 0 ? (
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>{L==="de"?"Zeit":"Time"}</th><th>{L==="de"?"Aktion":"Action"}</th><th>{L==="de"?"Objekt":"Object"}</th><th>{L==="de"?"Benutzer":"User"}</th></tr></thead>
            <tbody>
              {filtered.slice(0,100).map((e:any)=>(
                <tr key={e.id}>
                  <td className="mono" style={{fontSize:11,color:"var(--t3)",whiteSpace:"nowrap"}}>{new Date(e.created_at).toLocaleString()}</td>
                  <td><span style={{fontSize:10,fontWeight:700,color:AC[e.action]||"var(--t2)",background:(AC[e.action]||"var(--t2)")+"18",borderRadius:20,padding:"2px 8px"}}>{e.action}</span></td>
                  <td style={{fontSize:12.5}}>{e.entity_type}{e.entity_name&&` · ${e.entity_name}`}</td>
                  <td style={{fontSize:12,color:"var(--t3)"}}>{e.user_email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty card"><div className="empty-ic">≡</div><div className="empty-t">{L==="de"?"Kein Audit Trail":"No audit trail"}</div><div className="empty-c">{L==="de"?"Klicken Sie auf Laden.":"Click Load."}</div></div>
      )}
    </div>
  );
}
