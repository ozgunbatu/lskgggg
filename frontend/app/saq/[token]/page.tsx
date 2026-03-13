"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.lksgcompass.de";

type Question = {
  id: string; paragraph: string; de: string; en: string;
  type: "yesno" | "yesno_inverse" | "scale_1_5" | "range";
};
type SAQData = {
  id: string; token: string; company_name: string;
  supplier_name: string | null; expires_at: string;
  questions: Question[];
};

export default function SaqPublicPage({ params }: { params: { token: string } }) {
  const [lang, setLang]       = useState<"de"|"en">("de");
  const [data, setData]       = useState<SAQData | null>(null);
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [step, setStep]       = useState<"loading"|"form"|"done"|"error"|"expired">("loading");
  const [msg, setMsg]         = useState("");
  const [submitting, setSub]  = useState(false);

  useEffect(() => {
    fetch(API + "/saq/public/" + params.token)
      .then(r => r.json())
      .then(d => {
        if (d.completed) { setStep("done"); return; }
        if (d.error) { setMsg(d.error); setStep("error"); return; }
        setData(d); setStep("form");
      })
      .catch(() => { setMsg("Connection error"); setStep("error"); });
  }, [params.token]);

  async function submit() {
    if (!data) return;
    const unanswered = data.questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) { setMsg(`${lang === "de" ? "Bitte alle Fragen beantworten" : "Please answer all questions"} (${unanswered.length})`); return; }
    setSub(true);
    try {
      const r = await fetch(API + "/saq/public/" + params.token, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ responses: answers }) });
      const d = await r.json();
      if (d.ok) setStep("done"); else setMsg(d.error || "Error");
    } catch { setMsg("Connection error"); }
    finally { setSub(false); }
  }

  const progress = data ? Math.round(Object.keys(answers).length / data.questions.length * 100) : 0;

  const styles: Record<string,React.CSSProperties> = {
    page: { minHeight:"100vh", background:"#F0F2F0", fontFamily:"system-ui,sans-serif", padding:"20px 16px" },
    wrap: { maxWidth:620, margin:"0 auto" },
    card: { background:"#fff", borderRadius:14, padding:"20px 24px", marginBottom:16, border:"1px solid #E2E8E2" },
    hdr: { background:"#1B3D2B", borderRadius:14, padding:"20px 24px", marginBottom:20 },
    btn: { padding:"8px 16px", borderRadius:8, border:"1.5px solid #E2E8E2", background:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" },
    btnSel: { padding:"8px 16px", borderRadius:8, border:"1.5px solid #1B3D2B", background:"#1B3D2B", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" },
    scaleBtn: { width:40, height:40, borderRadius:8, border:"1.5px solid #E2E8E2", background:"#fff", fontWeight:800, fontSize:14, cursor:"pointer" },
    scaleBtnSel: { width:40, height:40, borderRadius:8, border:"1.5px solid #1B3D2B", background:"#1B3D2B", color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer" },
  };

  if (step === "loading") return <div style={{ ...styles.page, display:"flex", alignItems:"center", justifyContent:"center" }}><div style={{ color:"#6B7280" }}>Loading...</div></div>;

  if (step === "done") return (
    <div style={{ ...styles.page, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ ...styles.card, textAlign:"center", maxWidth:420 }}>
        <div style={{ fontSize:52, marginBottom:12 }}>&#10003;</div>
        <div style={{ fontSize:22, fontWeight:900, color:"#1B3D2B", marginBottom:8 }}>{lang === "de" ? "Vielen Dank!" : "Thank you!"}</div>
        <div style={{ color:"#6B7280", fontSize:14, lineHeight:1.6 }}>{lang === "de" ? "Ihre Angaben wurden gespeichert." : "Your responses have been saved."}</div>
      </div>
    </div>
  );

  if (step === "error" || step === "expired") return (
    <div style={{ ...styles.page, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ ...styles.card, textAlign:"center", maxWidth:420 }}>
        <div style={{ fontSize:22, fontWeight:900, color:"#DC2626", marginBottom:8 }}>Fehler</div>
        <div style={{ color:"#6B7280", fontSize:14 }}>{msg}</div>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.hdr}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ color:"rgba(255,255,255,.6)", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".6px", marginBottom:4 }}>LkSGCompass SAQ</div>
              <div style={{ color:"#fff", fontSize:19, fontWeight:900, marginBottom:4 }}>{lang === "de" ? "Lieferanten-Selbstauskunft" : "Supplier Self-Assessment"}</div>
              <div style={{ color:"rgba(255,255,255,.7)", fontSize:13 }}>{data.company_name}{data.supplier_name ? " / " + data.supplier_name : ""}</div>
            </div>
            <div style={{ display:"flex", gap:4 }}>
              {(["de","en"] as const).map(l => (
                <button key={l} onClick={() => setLang(l)} style={{ padding:"4px 10px", borderRadius:7, border:"1.5px solid rgba(255,255,255,.3)", background:lang===l?"#fff":"transparent", color:lang===l?"#1B3D2B":"#fff", fontWeight:700, fontSize:12, cursor:"pointer" }}>{l.toUpperCase()}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background:"#fff", borderRadius:12, padding:"12px 16px", marginBottom:14, border:"1px solid #E2E8E2" }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontWeight:700, color:"#6B7280", marginBottom:6 }}>
            <span>{lang === "de" ? "Fortschritt" : "Progress"}: {Object.keys(answers).length}/{data.questions.length}</span>
            <span>{progress}%</span>
          </div>
          <div style={{ height:6, background:"#E2E8E2", borderRadius:4, overflow:"hidden" }}>
            <div style={{ height:"100%", width:progress+"%", background:"#1B3D2B", borderRadius:4, transition:"width .3s" }} />
          </div>
        </div>

        <div style={{ background:"#EDF7F0", border:"1px solid #C6E4CE", borderRadius:12, padding:"14px 16px", marginBottom:18, fontSize:13, color:"#1B3D2B", lineHeight:1.6 }}>
          {lang === "de" ? "Risikoanalyse nach §5 LkSG. Ihre Angaben sind vertraulich. Dauer: ca. 5-10 Minuten." : "Risk analysis under §5 LkSG. Your responses are confidential. Duration: approx. 5-10 minutes."}
        </div>

        {data.questions.map((q, idx) => {
          const answered = !!answers[q.id];
          return (
            <div key={q.id} style={{ background:"#fff", borderRadius:12, padding:"18px 20px", marginBottom:10, border:"1.5px solid " + (answered ? "#C6E4CE" : "#E2E8E2"), transition:"border-color .2s" }}>
              <div style={{ display:"flex", gap:8, marginBottom:12, alignItems:"flex-start" }}>
                <div style={{ width:24, height:24, borderRadius:8, background:answered?"#1B3D2B":"#F3F4F3", color:answered?"#fff":"#9CA3AF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0 }}>{idx+1}</div>
                <div>
                  <div style={{ fontSize:8.5, fontWeight:800, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:".5px", marginBottom:3 }}>{q.paragraph}</div>
                  <div style={{ fontSize:14, fontWeight:600, lineHeight:1.55 }}>{lang === "de" ? q.de : q.en}</div>
                </div>
              </div>
              {(q.type === "yesno" || q.type === "yesno_inverse") && (
                <div style={{ display:"flex", gap:8, paddingLeft:32 }}>
                  {([["yes", lang==="de"?"Ja":"Yes"], ["no", lang==="de"?"Nein":"No"], ["partial", lang==="de"?"Teilweise":"Partial"]] as [string,string][]).map(([v,l]) => (
                    <button key={v} onClick={() => setAnswers(a => ({ ...a, [q.id]:v }))} style={answers[q.id]===v ? styles.btnSel : styles.btn}>{l}</button>
                  ))}
                </div>
              )}
              {q.type === "scale_1_5" && (
                <div style={{ display:"flex", gap:8, paddingLeft:32, alignItems:"center", flexWrap:"wrap" }}>
                  <span style={{ fontSize:12, color:"#9CA3AF" }}>{lang==="de"?"1=Gering":"1=Low"}</span>
                  {["1","2","3","4","5"].map(v => (
                    <button key={v} onClick={() => setAnswers(a => ({ ...a, [q.id]:v }))} style={answers[q.id]===v ? styles.scaleBtnSel : styles.scaleBtn}>{v}</button>
                  ))}
                  <span style={{ fontSize:12, color:"#9CA3AF" }}>{lang==="de"?"5=Hoch":"5=High"}</span>
                </div>
              )}
              {q.type === "range" && (
                <div style={{ paddingLeft:32 }}>
                  <select value={answers[q.id]||""} onChange={e => setAnswers(a => ({ ...a, [q.id]:e.target.value }))}
                    style={{ padding:"9px 13px", border:"1.5px solid #E2E8E2", borderRadius:9, fontSize:13, width:"100%", outline:"none" }}>
                    <option value="">{lang==="de"?"Bitte waehlen...":"Please select..."}</option>
                    <option value="0">{lang==="de"?"Keine (0)":"None (0)"}</option>
                    <option value="1">1-10</option>
                    <option value="2">11-50</option>
                    <option value="3">51-100</option>
                    <option value="4">100+</option>
                  </select>
                </div>
              )}
            </div>
          );
        })}

        {msg && <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"12px 16px", marginBottom:12, fontSize:13, color:"#991B1B" }}>{msg}</div>}
        <button onClick={submit} disabled={submitting} style={{ width:"100%", padding:16, background:progress===100?"#1B3D2B":"#9CA3AF", color:"#fff", border:"none", borderRadius:12, fontSize:16, fontWeight:900, cursor:progress===100?"pointer":"not-allowed", marginBottom:20 }}>
          {submitting ? "..." : (lang==="de"?"Fragebogen absenden":"Submit questionnaire")}
        </button>
        <div style={{ textAlign:"center", fontSize:11.5, color:"#9CA3AF", marginBottom:24 }}>
          {lang==="de"?"Gueltig bis:":"Valid until:"} {new Date(data.expires_at).toLocaleDateString(lang==="de"?"de-DE":"en-GB")}
        </div>
      </div>
    </div>
  );
}
