import React from "react";
import WorkspaceDataState from "../workspace/WorkspaceDataState";
import WorkspaceApprovalSummary from "../workspace/WorkspaceApprovalSummary";
import WorkspaceApprovalAging from "../workspace/WorkspaceApprovalAging";
import type { WorkspaceTabProps } from "@/lib/workspace-types";
import { canWrite } from "@/lib/workspace-access";
import { getSessionRole } from "@/lib/auth";

const SECTIONS = [
  {id:"overview",   para:"§4",  de:"Grundsatzerklärung",         en:"Policy statement"},
  {id:"risk",       para:"§5",  de:"Risikoanalyse",               en:"Risk analysis"},
  {id:"prevention", para:"§6",  de:"Präventionsmaßnahmen",        en:"Preventive measures"},
  {id:"remediation",para:"§7",  de:"Abhilfemaßnahmen",            en:"Remedial measures"},
  {id:"complaints", para:"§8",  de:"Beschwerdekanal",             en:"Complaint channel"},
  {id:"reporting",  para:"§10", de:"Rechenschaftsbericht",        en:"Accountability report"},
];

export default function ReportsTab(props: WorkspaceTabProps) {
  const {
    L,requestState,reloads,draft,setDraft,draftTs,rYear,setRYear,
    genLd,setTab,loadDraft,saveDraft,genSection,exportCSV,
    suppliers,complaints,actions,score,kpis,actionStats,approvalMeta,
  } = props;

  const role = approvalMeta?.currentRole || getSessionRole();
  const writable = canWrite(role);

  const sections = SECTIONS.map(s=>({
    ...s,
    label:L==="de"?s.de:s.en,
    generated:!!(draft as string)?.includes(s.para),
  }));
  const genCount = sections.filter(s=>s.generated).length;

  return (
    <>
      <WorkspaceDataState L={L} requestState={requestState} domains={[
        {key:"reports",label:"Reports",onRetry:reloads.reloadCoreData},
      ]}/>
      <WorkspaceApprovalSummary L={L} meta={approvalMeta} setTab={setTab}/>

      {/* Header + actions */}
      <div className="workspace-bar" style={{marginBottom:14}}>
        <div>
          <div className="workspace-kicker">§10 LkSG · BAFA</div>
          <div className="workspace-title">{L==="de"?"BAFA-Rechenschaftsbericht":"BAFA Accountability Report"}</div>
          <div className="workspace-sub">{L==="de"?"KI-generierter Jahresbericht nach §10 LkSG — vollständig BAFA-konform.":"AI-generated annual report under §10 LkSG — fully BAFA-compliant."}</div>
        </div>
        <div className="brow">
          <select className="sel" style={{width:100,height:34}} value={rYear as number} onChange={e=>(setRYear as any)(+e.target.value)}>
            {[2024,2025,2026].map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-g btn-sm" onClick={()=>loadDraft()} disabled={genLd as boolean}>
            {genLd?<span className="spin-d"/>:"↓"} {L==="de"?"Laden":"Load"}
          </button>
          <button className="btn btn-g btn-sm" onClick={()=>saveDraft()} disabled={!writable||!draft}>
            ✓ {L==="de"?"Speichern":"Save"}
          </button>
          {draftTs&&<span style={{fontSize:11,color:"var(--t3)"}}>{L==="de"?"Gespeichert":"Saved"}: {draftTs}</span>}
        </div>
      </div>

      <div className="g2">
        {/* Left: sections */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div className="card-sm" style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{L==="de"?"Abschnitte":"Sections"}</div>
              <div style={{fontSize:12,color:"var(--t3)"}}>{genCount}/{sections.length} {L==="de"?"generiert":"generated"}</div>
            </div>
            <div className="prog" style={{width:80,height:5}}>
              <div className="prog-fill" style={{width:`${(genCount/sections.length)*100}%`,background:"var(--g2)"}}/>
            </div>
          </div>
          {sections.map(s=>(
            <div key={s.id} style={{
              display:"flex",alignItems:"center",gap:10,
              padding:"11px 14px",
              borderRadius:"var(--r-md)",
              background:"var(--bg-1)",
              border:`1px solid ${s.generated?"var(--g-border)":"var(--border)"}`,
              transition:"border-color 0.15s",
            }}>
              <span style={{
                fontSize:10,fontWeight:700,
                fontFamily:"'DM Mono',monospace",
                color:s.generated?"var(--g1)":"var(--t3)",
                background:s.generated?"var(--g-bg)":"var(--bg-3)",
                border:`1px solid ${s.generated?"var(--g-border)":"var(--border)"}`,
                borderRadius:20,padding:"2px 8px",flexShrink:0,
              }}>{s.para}</span>
              <span style={{flex:1,fontSize:13,color:s.generated?"var(--t1)":"var(--t2)",fontWeight:s.generated?600:400}}>{s.label}</span>
              {s.generated
                ? <span style={{fontSize:10,color:"var(--g1)"}}>✓</span>
                : <button className="btn btn-g btn-xs" onClick={()=>genSection(s.id)} disabled={genLd as boolean||!writable}>
                    {genLd?<span className="spin-d"/>:"✦"} {L==="de"?"Generieren":"Generate"}
                  </button>
              }
            </div>
          ))}
          <button className="btn btn-ai" onClick={()=>genSection("all")} disabled={genLd as boolean||!writable} style={{width:"100%"}}>
            {genLd?<span className="spin"/>:"✦"} {L==="de"?"Vollständigen Bericht generieren":"Generate full report"}
          </button>
        </div>

        {/* Right: editor */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div className="card-sm" style={{display:"flex",gap:16,flexWrap:"wrap" as React.CSSProperties["flexWrap"]}}>
            {[
              {l:L==="de"?"Lieferanten":"Suppliers",v:kpis.total,c:"var(--blue)"},
              {l:L==="de"?"CAPs":"CAPs",v:actionStats.total,c:"var(--amber)"},
              {l:L==="de"?"Meldungen":"Complaints",v:complaints.length,c:"var(--purple)"},
              {l:"Score",v:score?.total??0,c:"var(--g1)"},
            ].map(s=>(
              <div key={s.l} style={{textAlign:"center",flex:1}}>
                <div style={{fontSize:20,fontWeight:700,color:s.c}}>{s.v}</div>
                <div style={{fontSize:11,color:"var(--t3)"}}>{s.l}</div>
              </div>
            ))}
          </div>
          <textarea
            className="ta"
            style={{flex:1,minHeight:420,fontFamily:"'DM Mono',monospace",fontSize:12,lineHeight:1.7,resize:"none"}}
            value={(draft as string)||""}
            onChange={e=>setDraft(e.target.value)}
            placeholder={L==="de"?"Bericht hier eingeben oder KI-Generierung starten…":"Enter report here or start AI generation…"}
            disabled={!writable}
          />
          <div className="brow">
            <button className="btn btn-g btn-sm" onClick={()=>exportCSV("/reports/export/pdf","bafa-bericht.txt")}>↓ {L==="de"?"Exportieren":"Export"}</button>
            <button className="btn btn-p btn-sm" onClick={()=>saveDraft()} disabled={!writable||!draft}>✓ {L==="de"?"Speichern":"Save"}</button>
          </div>
        </div>
      </div>

      <div style={{marginTop:14}}>
        <WorkspaceApprovalAging L={L} meta={approvalMeta}/>
      </div>
    </>
  );
}
