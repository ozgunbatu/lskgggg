"use client";
export default function EvidenceTab(props: any) {
  const { L, suppliers, evidences, evTitle, setEvTitle, evType, setEvType, evLksg, setEvLksg,
    evDesc, setEvDesc, evSupId, setEvSupId, evFile, setEvFile, evUploading, uploadEvidence, deleteEvidence, fileRef } = props;
  const EV = [["audit_report",L==="de"?"Auditbericht":"Audit report"],["coc_signed",L==="de"?"CoC unterschrieben":"Signed CoC"],["training_record",L==="de"?"Trainingsnachweis":"Training record"],["cap_document","CAP Document"],["certificate",L==="de"?"Zertifikat":"Certificate"],["saq_response","SAQ Response"],["other",L==="de"?"Sonstiges":"Other"]];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div className="g2">
        <div className="card">
          <div className="sec-title" style={{marginBottom:4}}>{L==="de"?"Dokument hochladen":"Upload document"}<span className="ltag">§10 LkSG</span></div>
          <div className="sec-sub" style={{marginBottom:12}}>{L==="de"?"7 Jahre Aufbewahrungspflicht.":"7 year retention requirement."}</div>
          <div className="fl"><label>{L==="de"?"Titel *":"Title *"}</label><input className="inp" value={evTitle||""} onChange={e=>setEvTitle(e.target.value)} placeholder={L==="de"?"z.B. SMETA-Audit 2025":"e.g. SMETA Audit 2025"}/></div>
          <div className="inp-row">
            <div className="fl"><label>{L==="de"?"Typ":"Type"}</label>
              <select className="sel" value={evType||"other"} onChange={e=>setEvType(e.target.value)}>
                {EV.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
            <div className="fl"><label>LkSG §</label>
              <select className="sel" value={evLksg||""} onChange={e=>setEvLksg(e.target.value)}>
                {[["","—"],["4","§4"],["5","§5"],["6","§6"],["7","§7"],["8","§8"],["9","§9"],["10","§10"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
          </div>
          <div className="fl"><label>{L==="de"?"Lieferant":"Supplier"}</label>
            <select className="sel" value={evSupId||""} onChange={e=>setEvSupId(e.target.value)}>
              <option value="">—</option>
              {suppliers.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div className="fl"><label>{L==="de"?"Notiz":"Note"}</label>
            <textarea className="ta" rows={2} value={evDesc||""} onChange={e=>setEvDesc(e.target.value)} placeholder={L==="de"?"Audit-Befunde…":"Audit findings…"}/></div>
          <div className="fl"><label>{L==="de"?"Datei":"File"}</label>
            <input type="file" ref={fileRef} accept=".pdf,.jpg,.jpeg,.png" onChange={e=>setEvFile(e.target.files?.[0]||null)} style={{fontSize:12.5}}/></div>
          <button className="btn btn-p" style={{width:"100%",marginTop:4}} onClick={uploadEvidence} disabled={evUploading||!evTitle?.trim()}>
            {evUploading?<span className="spin"/>:"↑"} {L==="de"?"Hochladen":"Upload"}
          </button>
        </div>
        <div className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div className="sec-title">{L==="de"?"Nachweise":"Evidence"}</div>
            <span style={{fontSize:12,color:"var(--t3)"}}>{evidences.length} {L==="de"?"Dokumente":"documents"}</span>
          </div>
          {evidences.length > 0 ? (
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {evidences.map((ev:any)=>(
                <div key={ev.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:"var(--r2)",background:"var(--c2)",border:"1px solid var(--b1)"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{ev.title}</div>
                    <div style={{fontSize:11,color:"var(--t3)"}}>{ev.type?.replace(/_/g," ")} {ev.lksg_ref&&`· §${ev.lksg_ref}`} · {new Date(ev.created_at).toLocaleDateString()}</div>
                  </div>
                  <button className="btn btn-r btn-xs" onClick={()=>deleteEvidence(ev.id)}>✕</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty empty-compact"><div className="empty-ic">◆</div><div className="empty-t">{L==="de"?"Keine Nachweise":"No evidence"}</div></div>
          )}
        </div>
      </div>
    </div>
  );
}
