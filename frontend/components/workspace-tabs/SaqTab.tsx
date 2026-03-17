import React from "react";
import type { WorkspaceTabProps } from "@/lib/workspace-types";

export default function SaqTab(props: WorkspaceTabProps) {
  const {
    L,suppliers,saqs,saqEmail,setSaqEmail,saqSup,setSaqSup,saqDays,setSaqDays,
    saqSending,sendSaq,deleteSaq,toast,
  } = props;

  const statusMeta: Record<string,{label:string,color:string}> = {
    sent:      {label:L==="de"?"Gesendet":"Sent",      color:"var(--amber)"},
    opened:    {label:L==="de"?"Geöffnet":"Opened",    color:"var(--blue)"},
    completed: {label:L==="de"?"Fertig":"Done",        color:"var(--g1)"},
    expired:   {label:L==="de"?"Abgelaufen":"Expired", color:"var(--t3)"},
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div className="workspace-bar">
        <div>
          <div className="workspace-kicker">§5 Abs. 2 LkSG</div>
          <div className="workspace-title">{L==="de"?"Lieferanten-Selbstauskunft (SAQ)":"Supplier Self-Assessment (SAQ)"}</div>
          <div className="workspace-sub">{L==="de"?"Befragungsmethode nach §5 Abs. 2 LkSG. Risk Score wird automatisch aktualisiert.":"Survey method under §5 para. 2 LkSG. Risk score updated automatically."}</div>
        </div>
      </div>

      <div className="g2">
        {/* Send form */}
        <div className="card">
          <div className="sec-title" style={{marginBottom:4}}>{L==="de"?"SAQ versenden":"Send SAQ"}</div>
          <div className="sec-sub" style={{marginBottom:14}}>{L==="de"?"Lieferant erhält E-Mail mit Link — 12 Fragen, automatischer Score-Update.":"Supplier receives email link — 12 questions, automatic score update."}</div>

          <div className="al al-info" style={{marginBottom:14,fontSize:12.5}}>
            <span className="al-icon">ℹ</span>
            <div><strong>§5 Abs. 2 LkSG:</strong> {L==="de"?" Befragungsmethode = BAFA-anerkannte Risikoanalyse.":" Survey method = BAFA-recognised risk analysis."}</div>
          </div>

          <div className="fl">
            <label>{L==="de"?"Lieferant (optional)":"Supplier (optional)"}</label>
            <select className="sel" value={(saqSup as string)||""} onChange={e=>(setSaqSup as any)(e.target.value)}>
              <option value="">{L==="de"?"— Kein spezifischer Lieferant —":"— No specific supplier —"}</option>
              {(suppliers as any[]).map((s:any)=>(
                <option key={s.id} value={s.id}>{s.name} ({s.country}) — {s.risk_level.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="fl">
            <label>{L==="de"?"E-Mail des Lieferanten *":"Supplier email *"}</label>
            <input className="inp" type="email" value={(saqEmail as string)||""} onChange={e=>(setSaqEmail as any)(e.target.value)} placeholder="compliance@supplier.com"/>
          </div>
          <div className="fl">
            <label>{L==="de"?"Gültig für (Tage)":"Valid for (days)"}</label>
            <select className="sel" value={(saqDays as string)||"30"} onChange={e=>(setSaqDays as any)(e.target.value)}>
              {["14","21","30","45","60"].map(d=><option key={d} value={d}>{d} {L==="de"?"Tage":"days"}</option>)}
            </select>
          </div>

          {/* 12 questions preview */}
          <div style={{padding:"10px 12px",borderRadius:"var(--r-md)",background:"var(--bg-2)",border:"1px solid var(--border)",marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:600,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>
              {L==="de"?"12 Fragen zu:":"12 questions covering:"}
            </div>
            <div style={{fontSize:11.5,color:"var(--t2)",lineHeight:1.9}}>
              {L==="de"
                ?"Kinderarbeit · Zwangsarbeit · Diskriminierung · Gewerkschaftsrechte · Mindestlohn · Arbeitsschutz · Umwelt · Code of Conduct · Audit-Status · Unterlieferanten · Transparenz · Frühere Verstöße"
                :"Child labour · Forced labour · Discrimination · Union rights · Minimum wage · Safety · Environment · Code of Conduct · Audit status · Sub-suppliers · Transparency · Past violations"}
            </div>
          </div>

          <button className="btn btn-p" style={{width:"100%"}} onClick={()=>(sendSaq as any)()} disabled={(saqSending as boolean)||!(saqEmail as string)?.trim()}>
            {saqSending?<span className="spin"/>:null}
            {L==="de"?"SAQ senden & Link kopieren":"Send SAQ & copy link"}
          </button>
        </div>

        {/* Sent SAQs */}
        <div className="card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div className="sec-title">{L==="de"?"Versendete SAQs":"Sent SAQs"}</div>
            <span style={{fontSize:12,color:"var(--t3)"}}>{(saqs as any[]).length} {L==="de"?"gesamt":"total"}</span>
          </div>

          {/* Status summary */}
          {(saqs as any[]).length > 0 && (
            <div style={{display:"flex",gap:6,flexWrap:"wrap" as React.CSSProperties["flexWrap"],marginBottom:12}}>
              {Object.entries(statusMeta).map(([st,meta])=>{
                const n = (saqs as any[]).filter((x:any)=>x.status===st).length;
                return n>0 ? (
                  <div key={st} style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:`${meta.color}12`,color:meta.color,border:`1px solid ${meta.color}25`}}>
                    {meta.label}: {n}
                  </div>
                ) : null;
              })}
            </div>
          )}

          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {(saqs as any[]).map((s:any)=>{
              const expired = new Date(s.expires_at) < new Date() && s.status!=="completed";
              const st = expired ? "expired" : s.status;
              const meta = statusMeta[st]||statusMeta.sent;
              return (
                <div key={s.id} style={{
                  padding:"11px 14px",
                  borderRadius:"var(--r-md)",
                  background:"var(--bg-2)",
                  border:`1px solid ${s.status==="completed"?"var(--g-border)":"var(--border)"}`,
                  transition:"border-color 0.15s",
                }}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--t1)",marginBottom:3}}>
                        {s.supplier_name||s.sent_to||(L==="de"?"Unbekannt":"Unknown")}
                      </div>
                      <div style={{fontSize:11,color:"var(--t3)",display:"flex",gap:8,flexWrap:"wrap" as React.CSSProperties["flexWrap"]}}>
                        {s.sent_to&&<span>📧 {s.sent_to}</span>}
                        <span>📅 {new Date(s.sent_at).toLocaleDateString(L==="de"?"de-DE":"en-GB")}</span>
                        {s.completed_at&&<span style={{color:"var(--g1)"}}>✓ {new Date(s.completed_at).toLocaleDateString(L==="de"?"de-DE":"en-GB")}</span>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:5,alignItems:"center",flexShrink:0}}>
                      <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:`${meta.color}12`,color:meta.color,border:`1px solid ${meta.color}25`}}>{meta.label}</span>
                      {s.url&&<button className="btn btn-g btn-xs" onClick={()=>navigator.clipboard.writeText(s.url).then(()=>(toast as any)("ok",L==="de"?"Link kopiert":"Link copied"))}>Link</button>}
                      <button className="btn btn-r btn-xs" onClick={()=>(deleteSaq as any)(s.id)}>✕</button>
                    </div>
                  </div>
                  {s.status==="completed"&&s.responses&&(
                    <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid var(--border)",fontSize:11,color:"var(--t3)"}}>
                      {Object.keys(s.responses).length} {L==="de"?"Fragen beantwortet — Score aktualisiert":"questions answered — score updated"}
                    </div>
                  )}
                </div>
              );
            })}
            {!(saqs as any[]).length&&(
              <div className="empty empty-compact">
                <div className="empty-ic">📋</div>
                <div className="empty-t">{L==="de"?"Noch keine SAQs":"No SAQs yet"}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
