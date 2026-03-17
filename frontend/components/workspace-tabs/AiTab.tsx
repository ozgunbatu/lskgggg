import React from "react";
import type { WorkspaceTabProps } from "@/lib/workspace-types";

const QUICK: Record<string,string[]> = {
  de: [
    "Welche Lieferanten haben das höchste Risiko?",
    "Welche CAPs sind am dringlichsten?",
    "Wie gut ist meine BAFA-Readiness?",
    "Erstelle eine §5-Risikoanalyse-Zusammenfassung",
    "Was fehlt für den BAFA-Bericht §10?",
  ],
  en: [
    "Which suppliers have the highest risk?",
    "Which CAPs are most urgent?",
    "How is my BAFA readiness?",
    "Create a §5 risk analysis summary",
    "What's missing for the BAFA §10 report?",
  ],
};

export default function AiTab(props: WorkspaceTabProps) {
  const {L,aiMsgs,setAiMsgs,aiInput,setAiInput,aiLd,aiEnd,sendAi} = props;
  const msgs = aiMsgs as any[];
  const input = aiInput as string;
  const qs = QUICK[L]||QUICK.de;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Header */}
      <div className="workspace-bar" style={{marginBottom:0}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <div style={{
              width:36,height:36,borderRadius:10,
              background:"linear-gradient(135deg,#0f2a1a,#1a4a2e)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:18,border:"1px solid var(--g-border)",
              boxShadow:"0 0 12px rgba(110,231,160,0.1)",
            }}>✦</div>
            <div>
              <div className="workspace-title" style={{fontSize:18}}>LkSG AI Assistant</div>
              <div className="workspace-kicker">Claude · §4–§10 LkSG</div>
            </div>
          </div>
          <div className="workspace-sub">{L==="de"?"KI-Assistent für LkSG-Compliance. Fragt Ihre Daten, analysiert Risiken, generiert Texte.":"AI assistant for LkSG compliance. Queries your data, analyses risks, generates texts."}</div>
        </div>
      </div>

      {/* Chat */}
      <div className="ai-box">
        {/* Messages */}
        <div className="ai-msgs">
          {msgs.length === 0 && (
            <div style={{textAlign:"center",padding:"40px 20px",color:"var(--t3)"}}>
              <div style={{fontSize:32,marginBottom:12}}>✦</div>
              <div style={{fontSize:14,fontWeight:600,color:"var(--t2)",marginBottom:6}}>
                {L==="de"?"Was kann ich für Sie analysieren?":"What would you like me to analyse?"}
              </div>
              <div style={{fontSize:12,color:"var(--t3)"}}>
                {L==="de"?"Stellen Sie Fragen zu Ihren Lieferanten, CAPs, Beschwerden oder dem BAFA-Bericht.":"Ask questions about your suppliers, CAPs, complaints or the BAFA report."}
              </div>
            </div>
          )}
          {msgs.map((m:any,i:number)=>(
            <div key={i} className={"ai-msg"+(m.role==="user"?" u":"")}>
              <div className="ai-ico" style={{
                background:m.role==="user"?"var(--bg-3)":"linear-gradient(135deg,#0f2a1a,#1a4a2e)",
                color:m.role==="user"?"var(--t2)":"var(--g1)",
                border:m.role==="user"?"1px solid var(--border-2)":"1px solid var(--g-border)",
              }}>
                {m.role==="user"?"U":"✦"}
              </div>
              <div className={"ai-bub "+(m.role==="user"?"u":"a")}>{m.content}</div>
            </div>
          ))}
          {aiLd&&(
            <div className="ai-msg">
              <div className="ai-ico" style={{background:"linear-gradient(135deg,#0f2a1a,#1a4a2e)",color:"var(--g1)",border:"1px solid var(--g-border)"}}>✦</div>
              <div className="ai-bub a" style={{display:"flex",alignItems:"center",gap:8}}>
                <span className="spin-d"/><span style={{color:"var(--t3)",fontSize:12}}>{L==="de"?"Analysiere…":"Analysing…"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick questions */}
        {!aiEnd&&(
          <div className="ai-qs">
            {qs.map(q=>(
              <button key={q} className="ai-q" onClick={()=>sendAi(q)}>{q}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="ai-ir">
          <textarea
            className="ai-ta"
            rows={2}
            value={input}
            onChange={e=>(setAiInput as any)(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendAi(input);(setAiInput as any)("");}}}
            placeholder={L==="de"?"Fragen Sie zur LkSG-Compliance… (Enter zum Senden)":"Ask about LkSG compliance… (Enter to send)"}
          />
          <button className="btn btn-ai" style={{alignSelf:"flex-end"}} onClick={()=>{sendAi(input);(setAiInput as any)("");}} disabled={!input.trim()||aiLd as boolean}>
            {aiLd?<span className="spin"/>:"→"}
          </button>
        </div>
        <div className="ai-dis">Powered by Anthropic Claude · {L==="de"?"Ihre Daten verlassen nie Ihre Infrastruktur":"Your data never leaves your infrastructure"}</div>
      </div>
    </div>
  );
}
