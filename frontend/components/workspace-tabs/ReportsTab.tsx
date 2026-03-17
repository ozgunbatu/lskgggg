"use client";
import { canWrite } from "@/lib/workspace-access";

export default function ReportsTab(props: any) {
  const { L, draft, setDraft, draftTs, rYear, setRYear, genLd, loadDraft, saveDraft, genSection, exportCSV,
    suppliers, complaints, actions, score, kpis, actionStats, approvalMeta } = props;

  const writable = canWrite(approvalMeta?.currentRole||"admin");
  const SECTIONS = [
    {id:"overview",para:"§4",de:"Grundsatzerklärung",en:"Policy statement"},
    {id:"risk",para:"§5",de:"Risikoanalyse",en:"Risk analysis"},
    {id:"prevention",para:"§6",de:"Präventionsmaßnahmen",en:"Preventive measures"},
    {id:"remediation",para:"§7",de:"Abhilfemaßnahmen",en:"Remedial measures"},
    {id:"complaints",para:"§8",de:"Beschwerdekanal",en:"Complaint channel"},
    {id:"reporting",para:"§10",de:"Rechenschaftsbericht",en:"Accountability report"},
  ];
  const draftStr = typeof draft === "string" ? draft : draft ? JSON.stringify(draft, null, 2) : "";
  const genCount = SECTIONS.filter(s => draftStr.includes(s.para)).length;

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8 }}>
        <div>
          <div style={{ fontSize:11,fontWeight:700,color:"var(--g)",textTransform:"uppercase",letterSpacing:".1em",fontFamily:"'DM Mono',monospace" }}>§10 LkSG · BAFA</div>
          <div style={{ fontSize:18,fontWeight:800,color:"var(--t1)",letterSpacing:"-.04em" }}>{L==="de"?"BAFA-Rechenschaftsbericht":"BAFA Accountability Report"}</div>
        </div>
        <div className="brow">
          <select className="sel" style={{width:90,height:32}} value={rYear} onChange={e=>setRYear(+e.target.value)}>
            {[2024,2025,2026].map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-g btn-sm" onClick={loadDraft} disabled={!!genLd}>
            {genLd?<span className="spin-d"/>:"↓"} {L==="de"?"Laden":"Load"}
          </button>
          <button className="btn btn-g btn-sm" onClick={saveDraft} disabled={!writable||!draft}>✓ {L==="de"?"Speichern":"Save"}</button>
          {draftTs&&<span style={{fontSize:11,color:"var(--t3)"}}>{L==="de"?"Gespeichert":"Saved"}: {new Date(draftTs).toLocaleTimeString()}</span>}
        </div>
      </div>

      <div className="g2">
        {/* Sections */}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"var(--c2)",borderRadius:"var(--r3)",border:"1px solid var(--b1)"}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{L==="de"?"Abschnitte":"Sections"}</div>
              <div style={{fontSize:11.5,color:"var(--t3)"}}>{genCount}/{SECTIONS.length} {L==="de"?"generiert":"generated"}</div>
            </div>
            <div className="prog" style={{width:80,height:4}}>
              <div className="prog-fill" style={{width:`${(genCount/SECTIONS.length)*100}%`,background:"var(--g)"}}/>
            </div>
          </div>
          {SECTIONS.map(s=>{
            const gen = draftStr.includes(s.para);
            return (
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:"var(--r2)",background:"var(--c1)",border:`1px solid ${gen?"var(--g-20)":"var(--b2)"}`}}>
                <span style={{fontSize:10,fontWeight:700,fontFamily:"'DM Mono',monospace",color:gen?"var(--g)":"var(--t3)",background:gen?"var(--g-5)":"var(--c2)",border:`1px solid ${gen?"var(--g-20)":"var(--b2)"}`,borderRadius:20,padding:"2px 8px",flexShrink:0}}>{s.para}</span>
                <span style={{flex:1,fontSize:13,color:gen?"var(--t1)":"var(--t2)",fontWeight:gen?600:400}}>{L==="de"?s.de:s.en}</span>
                {gen ? <span style={{fontSize:11,color:"var(--g)"}}>✓</span>
                  : <button className="btn btn-g btn-xs" onClick={()=>genSection(s.id)} disabled={!!genLd||!writable}>
                      {genLd?<span className="spin-d"/>:"✦"} {L==="de"?"Generieren":"Generate"}
                    </button>}
              </div>
            );
          })}
          <button className="btn btn-ai" onClick={()=>genSection("all")} disabled={!!genLd||!writable} style={{width:"100%"}}>
            {genLd?<span className="spin"/>:"✦"} {L==="de"?"Vollständigen Bericht generieren":"Generate full report"}
          </button>
          {/* Stats */}
          <div style={{display:"flex",gap:0,background:"var(--c2)",borderRadius:"var(--r3)",border:"1px solid var(--b1)",overflow:"hidden"}}>
            {[{l:L==="de"?"Lieferanten":"Suppliers",v:kpis.total,c:"var(--blu)"},{l:"CAPs",v:actionStats.total,c:"var(--amb)"},{l:L==="de"?"Meldungen":"Complaints",v:complaints.length,c:"var(--vio)"},{l:"Score",v:score?.total??0,c:"var(--g)"}].map((s,i)=>(
              <div key={s.l} style={{flex:1,textAlign:"center",padding:"10px 8px",borderLeft:i>0?"1px solid var(--b1)":"none"}}>
                <div style={{fontSize:20,fontWeight:700,color:s.c}}>{s.v}</div>
                <div style={{fontSize:11,color:"var(--t3)"}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <textarea className="ta" style={{flex:1,minHeight:420,fontFamily:"'DM Mono',monospace",fontSize:12,lineHeight:1.7,resize:"none"}}
            value={draftStr} onChange={e=>setDraft(e.target.value)}
            placeholder={L==="de"?"Bericht hier eingeben oder KI-Generierung starten…":"Enter report here or start AI generation…"}
            disabled={!writable}/>
          <div className="brow">
            <button className="btn btn-g btn-sm" onClick={()=>exportCSV("/reports/export/pdf","bafa-bericht.txt")}>↓ {L==="de"?"Exportieren":"Export"}</button>
            <button className="btn btn-p btn-sm" onClick={saveDraft} disabled={!writable||!draft}>✓ {L==="de"?"Speichern":"Save"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
