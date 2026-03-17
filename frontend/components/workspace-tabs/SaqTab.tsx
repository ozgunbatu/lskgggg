"use client";
export default function SaqTab(props: any) {
  const { L, suppliers, saqs, saqEmail, setSaqEmail, saqSup, setSaqSup, saqDays, setSaqDays, saqSending, sendSaq, deleteSaq } = props;
  const ST: Record<string,{l:string,c:string}> = {
    sent:{l:L==="de"?"Gesendet":"Sent",c:"var(--amb)"},
    opened:{l:L==="de"?"Geöffnet":"Opened",c:"var(--blu)"},
    completed:{l:L==="de"?"Fertig":"Done",c:"var(--g)"},
    expired:{l:L==="de"?"Abgelaufen":"Expired",c:"var(--t3)"},
  };
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div className="g2">
        <div className="card">
          <div className="sec-title" style={{marginBottom:4}}>{L==="de"?"SAQ versenden":"Send SAQ"}<span className="ltag">§5 Abs.2</span></div>
          <div className="sec-sub" style={{marginBottom:12}}>{L==="de"?"12 Fragen, automatischer Score-Update.":"12 questions, automatic score update."}</div>
          <div className="fl">
            <label>{L==="de"?"Lieferant":"Supplier"}</label>
            <select className="sel" value={saqSup||""} onChange={e=>setSaqSup(e.target.value)}>
              <option value="">—</option>
              {suppliers.map((s:any)=><option key={s.id} value={s.id}>{s.name} — {s.risk_level?.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="fl">
            <label>{L==="de"?"E-Mail des Lieferanten *":"Supplier email *"}</label>
            <input className="inp" type="email" value={saqEmail||""} onChange={e=>setSaqEmail(e.target.value)} placeholder="compliance@supplier.com"/>
          </div>
          <div className="fl">
            <label>{L==="de"?"Gültig für (Tage)":"Valid for (days)"}</label>
            <select className="sel" value={saqDays||"30"} onChange={e=>setSaqDays(e.target.value)}>
              {["14","21","30","45","60"].map(d=><option key={d} value={d}>{d} {L==="de"?"Tage":"days"}</option>)}
            </select>
          </div>
          <button className="btn btn-p" style={{width:"100%"}} onClick={sendSaq} disabled={saqSending||!saqEmail?.trim()}>
            {saqSending?<span className="spin"/>:null} {L==="de"?"SAQ senden":"Send SAQ"}
          </button>
        </div>
        <div className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div className="sec-title">{L==="de"?"Versendete SAQs":"Sent SAQs"}</div>
            <span style={{fontSize:12,color:"var(--t3)"}}>{saqs.length} {L==="de"?"gesamt":"total"}</span>
          </div>
          {saqs.length > 0 ? (
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {saqs.map((q:any) => {
                const st = ST[q.status]||{l:q.status,c:"var(--t3)"};
                return (
                  <div key={q.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:"var(--r2)",background:"var(--c2)",border:"1px solid var(--b1)"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{q.supplier_name||q.email}</div>
                      <div style={{fontSize:11.5,color:"var(--t3)"}}>{q.email} · {new Date(q.created_at).toLocaleDateString()}</div>
                    </div>
                    <span style={{fontSize:10,fontWeight:700,color:st.c,background:st.c+"18",border:`1px solid ${st.c}25`,borderRadius:20,padding:"2px 8px"}}>{st.l}</span>
                    <button className="btn btn-r btn-xs" onClick={()=>deleteSaq(q.id)}>✕</button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty empty-compact"><div className="empty-ic">◻</div><div className="empty-t">{L==="de"?"Noch keine SAQs":"No SAQs yet"}</div></div>
          )}
        </div>
      </div>
    </div>
  );
}
