import React from "react";
import { API } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { WorkspaceTabProps } from "@/lib/workspace-types";

type Evidence = { id:string;title:string;type:string;lksg_ref?:string;supplier_name?:string;file_name?:string;file_size?:number;description?:string;created_at:string; };

export default function EvidenceTab(props: WorkspaceTabProps) {
  const {
    L,suppliers,evidences,evTitle,setEvTitle,evType,setEvType,evLksg,setEvLksg,
    evDesc,setEvDesc,evSupId,setEvSupId,evFile,setEvFile,evUploading,
    uploadEvidence,deleteEvidence,setTab,sendAi,fileRef,toast,
  } = props;

  const evs = (evidences as Evidence[])||[];

  const EV_TYPES = [
    ["audit_report",L==="de"?"Auditbericht":"Audit report"],
    ["coc_signed",L==="de"?"CoC unterschrieben":"Signed CoC"],
    ["training_record",L==="de"?"Trainingsnachweis":"Training record"],
    ["cap_document",L==="de"?"CAP-Dokument":"CAP document"],
    ["certificate",L==="de"?"Zertifikat":"Certificate"],
    ["saq_response","SAQ Response"],
    ["screenshot","Screenshot"],
    ["email","Email"],
    ["other",L==="de"?"Sonstiges":"Other"],
  ];

  const TYPE_COLOR: Record<string,string> = {
    audit_report:"var(--blue)",coc_signed:"var(--g1)",training_record:"var(--purple)",
    certificate:"var(--amber)",cap_document:"var(--red)",other:"var(--t3)",
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div className="workspace-bar">
        <div>
          <div className="workspace-kicker">§10 LkSG — 7 Jahre Aufbewahrung</div>
          <div className="workspace-title">{L==="de"?"Nachweis-Tresor":"Evidence Vault"}</div>
          <div className="workspace-sub">{L==="de"?"Auditberichte, CoC, Zertifikate und alle §10-Nachweise an einem Ort.":"Audit reports, CoC, certificates and all §10 evidence in one place."}</div>
        </div>
        <button className="btn btn-ai btn-sm" onClick={()=>{ (setTab as any)("ai"); setTimeout(()=>(sendAi as any)(L==="de"?"Welche Nachweise fehlen mir für ein BAFA-Audit?":"What evidence am I missing for a BAFA audit?"),100); }}>
          ✦ {L==="de"?"Lückenanalyse":"Gap analysis"}
        </button>
      </div>

      <div className="g2">
        {/* Upload */}
        <div className="card">
          <div className="sec-title" style={{marginBottom:4}}>{L==="de"?"Dokument hochladen":"Upload document"}</div>
          <div className="sec-sub" style={{marginBottom:14}}>{L==="de"?"PDF, JPG, PNG bis 4 MB — 7 Jahre Aufbewahrungspflicht.":"PDF, JPG, PNG up to 4 MB — 7 year retention requirement."}</div>

          <div className="fl">
            <label>{L==="de"?"Titel *":"Title *"}</label>
            <input className="inp" value={(evTitle as string)||""} onChange={e=>(setEvTitle as any)(e.target.value)} placeholder={L==="de"?"z.B. SMETA-Audit 2025":"e.g. SMETA Audit 2025"}/>
          </div>
          <div className="inp-row">
            <div className="fl">
              <label>{L==="de"?"Typ":"Type"}</label>
              <select className="sel" value={(evType as string)||"other"} onChange={e=>(setEvType as any)(e.target.value)}>
                {EV_TYPES.map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="fl">
              <label>LkSG §</label>
              <select className="sel" value={(evLksg as string)||""} onChange={e=>(setEvLksg as any)(e.target.value)}>
                {[["","—"],["4","§4"],["5","§5"],["6","§6"],["7","§7"],["8","§8"],["9","§9"],["10","§10"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="fl">
            <label>{L==="de"?"Lieferant":"Supplier"}</label>
            <select className="sel" value={(evSupId as string)||""} onChange={e=>(setEvSupId as any)(e.target.value)}>
              <option value="">—</option>
              {(suppliers as any[]).map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="fl">
            <label>{L==="de"?"Notiz":"Note"}</label>
            <textarea className="ta" rows={2} value={(evDesc as string)||""} onChange={e=>(setEvDesc as any)(e.target.value)} placeholder={L==="de"?"Audit-Befunde, Ergebnis…":"Audit findings, outcome…"}/>
          </div>
          <div className="fl">
            <label>{L==="de"?"Datei":"File"}</label>
            <div
              onClick={()=>(fileRef as any)?.current?.click()}
              onDragOver={e=>e.preventDefault()}
              onDrop={e=>{ e.preventDefault(); const f=e.dataTransfer.files[0]; if(f&&f.size<4.5*1024*1024)(setEvFile as any)(f); else (toast as any)("err","max 4MB"); }}
              style={{
                border:`1px dashed ${evFile?"var(--g-border)":"var(--border-2)"}`,
                borderRadius:"var(--r-md)",padding:"16px",textAlign:"center" as React.CSSProperties["textAlign"],
                cursor:"pointer",background:evFile?"rgba(110,231,160,0.04)":"var(--bg-2)",
                transition:"all 0.15s",
              }}
            >
              <input ref={fileRef as any} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{display:"none"}}
                onChange={e=>{ const f=e.target.files?.[0]; if(f&&f.size<4.5*1024*1024)(setEvFile as any)(f); else if(f)(toast as any)("err","max 4MB"); }}
              />
              {evFile
                ? <div style={{color:"var(--g1)",fontWeight:600,fontSize:13}}>📎 {(evFile as File).name} ({((evFile as File).size/1024).toFixed(0)}KB)</div>
                : <div style={{color:"var(--t3)",fontSize:13}}>{L==="de"?"Datei ablegen oder klicken":"Drop file or click"}</div>
              }
            </div>
          </div>
          <button className="btn btn-p" style={{width:"100%",marginTop:4}} onClick={()=>(uploadEvidence as any)()} disabled={(evUploading as boolean)||!(evTitle as string)?.trim()}>
            {evUploading?<span className="spin"/>:null}
            {L==="de"?"Dokument speichern":"Save document"}
          </button>
        </div>

        {/* Evidence list */}
        <div className="card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div className="sec-title">{L==="de"?"Gespeicherte Nachweise":"Saved evidence"}</div>
            <span style={{fontSize:12,color:"var(--t3)"}}>{evs.length} {L==="de"?"gesamt":"total"}</span>
          </div>

          {evs.length>0&&(
            <div style={{display:"flex",gap:6,flexWrap:"wrap" as React.CSSProperties["flexWrap"],marginBottom:12}}>
              {Array.from(new Set(evs.map(e=>e.type))).map(t=>{
                const n=evs.filter(e=>e.type===t).length;
                const c=TYPE_COLOR[t]||"var(--t3)";
                return <span key={t} style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:`${c}12`,color:c,border:`1px solid ${c}25`}}>{t.replace(/_/g," ")}: {n}</span>;
              })}
            </div>
          )}

          <div style={{display:"flex",flexDirection:"column",gap:7,maxHeight:480,overflowY:"auto"}}>
            {evs.map(ev=>{
              const c=TYPE_COLOR[ev.type]||"var(--t3)";
              return (
                <div key={ev.id} style={{
                  padding:"11px 14px",
                  borderRadius:"var(--r-md)",
                  background:"var(--bg-2)",
                  border:`1px solid ${c}20`,
                  borderLeft:`3px solid ${c}`,
                }}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--t1)",marginBottom:3}}>{ev.title}</div>
                      <div style={{fontSize:11,color:"var(--t3)",display:"flex",gap:8,flexWrap:"wrap" as React.CSSProperties["flexWrap"]}}>
                        <span style={{color:c,fontWeight:600}}>{ev.type.replace(/_/g," ")}</span>
                        {ev.lksg_ref&&<span className="ltag">§{ev.lksg_ref}</span>}
                        {ev.supplier_name&&<span>◎ {ev.supplier_name}</span>}
                        {ev.file_name&&<span>📎 {ev.file_name}{ev.file_size?` (${(ev.file_size/1024).toFixed(0)}KB)`:""}</span>}
                        <span>{new Date(ev.created_at).toLocaleDateString(L==="de"?"de-DE":"en-GB")}</span>
                      </div>
                      {ev.description&&<div style={{fontSize:11.5,color:"var(--t3)",marginTop:4}}>{ev.description}</div>}
                    </div>
                    <div style={{display:"flex",gap:5,flexShrink:0}}>
                      {ev.file_name&&(
                        <a className="btn btn-g btn-xs"
                          href={`${API}/evidence/${ev.id}/download?token=${encodeURIComponent(getToken())}`}
                          target="_blank" rel="noreferrer">↓</a>
                      )}
                      <button className="btn btn-r btn-xs" onClick={()=>(deleteEvidence as any)(ev.id)}>✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
            {!evs.length&&(
              <div className="empty empty-compact">
                <div className="empty-ic">📁</div>
                <div className="empty-t">{L==="de"?"Noch keine Nachweise":"No evidence yet"}</div>
                <div className="empty-c">{L==="de"?"Laden Sie Auditberichte, CoC und Zertifikate hoch.":"Upload audit reports, CoC and certificates."}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
