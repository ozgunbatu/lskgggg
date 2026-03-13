"use client";
import { useEffect, useState } from "react";
import { getLang, setLang, type Lang } from "../../../lib/i18n";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.lksgcompass.de";

type Supplier = { id:string; name:string; country:string; industry:string };

const CATS = [
  {v:"human_rights",de:"Menschenrechtsverletzung (§2 Abs. 1 LkSG)",en:"Human rights violation (§2 para. 1 LkSG)"},
  {v:"child_labor",de:"Kinderarbeit (§2 Abs. 2 Nr. 1-3)",en:"Child labour (§2 para. 2 no. 1-3)"},
  {v:"forced_labor",de:"Zwangsarbeit (§2 Abs. 2 Nr. 4-5)",en:"Forced labour (§2 para. 2 no. 4-5)"},
  {v:"discrimination",de:"Diskriminierung (§2 Abs. 2 Nr. 6)",en:"Discrimination (§2 para. 2 no. 6)"},
  {v:"environment",de:"Umweltverstoss (§2 Abs. 3)",en:"Environmental violation (§2 para. 3)"},
  {v:"safety",de:"Arbeitsschutz (§2 Abs. 2 Nr. 5)",en:"Occupational safety (§2 para. 2 no. 5)"},
  {v:"corruption",de:"Korruption (§2 Abs. 2 Nr. 10)",en:"Corruption (§2 para. 2 no. 10)"},
  {v:"other",de:"Sonstiger Verstoss",en:"Other violation"},
];

const css = `
:root{--g:#1B3D2B;--g2:#2d5c3f;--g3:#f0f5f1;--g4:#d1e7d9;--bg:#f2f3f2;--card:#fff;--line:#e8eae8;--text:#0b0f0c;--mu:#6b7280;--mu2:#9ca3af;--red:#C0392B;--rdb:#fff0ef;--rdl:#fecaca;--grb:#f0fdf4;--grl:#bbf7d0;--body:'DM Sans',system-ui,sans-serif;--serif:'Bricolage Grotesque',system-ui,sans-serif}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--body);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;min-height:100vh}
.page{min-height:100vh;display:flex;flex-direction:column}
.header{background:var(--g);padding:0 24px;height:56px;display:flex;align-items:center;justify-content:space-between}
.header-logo{font-family:var(--serif);font-weight:800;font-size:16px;color:#fff;letter-spacing:-0.2px}
.header-logo em{font-style:normal;color:rgba(255,255,255,0.45)}
.header-right{display:flex;align-items:center;gap:6px}
.lang-btn{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.7);font-family:var(--body);font-size:11.5px;font-weight:700;padding:3px 9px;border-radius:6px;cursor:pointer;transition:all 0.15s}
.lang-btn.on{background:rgba(255,255,255,0.2);color:#fff;border-color:rgba(255,255,255,0.4)}
.main{flex:1;display:flex;align-items:flex-start;justify-content:center;padding:32px 16px 60px}
.wrap{width:100%;max-width:680px}
.anon-badge{display:inline-flex;align-items:center;gap:8px;background:var(--g3);border:1px solid var(--g4);border-radius:100px;padding:5px 14px;font-size:12px;font-weight:600;color:var(--g);margin-bottom:20px}
.anon-dot{width:6px;height:6px;border-radius:50%;background:var(--g)}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:28px;box-shadow:0 2px 16px rgba(0,0,0,0.06)}
.card-title{font-family:var(--serif);font-size:22px;font-weight:800;color:var(--text);letter-spacing:-0.3px;margin-bottom:4px}
.card-sub{font-size:14px;color:var(--mu);line-height:1.5;margin-bottom:22px}
.company-name{font-weight:700;color:var(--text)}
.al{padding:11px 14px;border-radius:10px;font-size:13px;display:flex;align-items:flex-start;gap:8px;line-height:1.5;margin-bottom:16px}
.ainf{background:var(--g3);border:1px solid var(--g4);color:var(--g)}
.aerr{background:var(--rdb);border:1px solid var(--rdl);color:#991b1b}
.aok{background:var(--grb);border:1px solid var(--grl);color:#166534}
.fl{margin-bottom:14px}
.lbl{font-size:10.5px;font-weight:700;color:var(--mu);text-transform:uppercase;letter-spacing:0.7px;margin-bottom:5px;display:block}
.inp,.sel,.ta{width:100%;padding:11px 13px;border:1.5px solid var(--line);border-radius:10px;font-size:14px;font-family:var(--body);color:var(--text);background:var(--card);transition:border-color 0.2s,box-shadow 0.2s;outline:none}
.inp:focus,.sel:focus,.ta:focus{border-color:var(--g);box-shadow:0 0 0 3px rgba(27,61,43,0.1)}
.inp::placeholder,.ta::placeholder{color:var(--mu2)}
.ta{resize:vertical;line-height:1.5;min-height:120px}
select.sel{-webkit-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%239ca3af' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:30px}
.btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px;border-radius:11px;font-size:15px;font-weight:700;font-family:var(--body);border:none;background:var(--g);color:#fff;cursor:pointer;box-shadow:0 2px 12px rgba(27,61,43,0.25);transition:all 0.2s;margin-top:8px}
.btn:hover:not(:disabled){background:var(--g2);transform:translateY(-1.5px);box-shadow:0 6px 24px rgba(27,61,43,0.3)}
.btn:disabled{opacity:0.45;cursor:not-allowed;transform:none;box-shadow:none}
.success-icon{font-size:48px;text-align:center;margin-bottom:16px}
.success-title{font-family:var(--serif);font-size:22px;font-weight:800;text-align:center;color:var(--text);margin-bottom:8px}
.success-sub{font-size:14px;color:var(--mu);text-align:center;line-height:1.6;margin-bottom:20px}
.ref-box{background:var(--g3);border:1px solid var(--g4);border-radius:10px;padding:12px 16px;text-align:center;font-family:monospace;font-size:14px;color:var(--g);letter-spacing:1px;font-weight:600}
.footer{padding:16px 24px;border-top:1px solid var(--line);background:var(--card);text-align:center;font-size:12px;color:var(--mu2)}
.footer a{color:var(--mu);transition:color 0.15s}
.footer a:hover{color:var(--text)}
.sp{width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:rot 0.7s linear infinite}
@keyframes rot{to{transform:rotate(360deg)}}
@media(max-width:500px){.card{padding:20px 16px}}
`;

export default function PublicComplaintPage({ params }:{params:{slug:string}}) {
  const slug=params.slug;
  const [lang,setLangState]=useState<Lang>("de");
  const [loading,setLoading]=useState(true);
  const [companyName,setCompanyName]=useState("");
  const [suppliers,setSuppliers]=useState<Supplier[]>([]);
  const [supplierId,setSupplierId]=useState("");
  const [supplierName,setSupplierName]=useState("");
  const [category,setCategory]=useState("human_rights");
  const [description,setDescription]=useState("");
  const [reporterContact,setReporterContact]=useState("");
  const [done,setDone]=useState(false);
  const [refId,setRefId]=useState("");
  const [error,setError]=useState("");
  const [submitting,setSubmitting]=useState(false);

  useEffect(()=>{setLangState(getLang());},[]);

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try{
        const r=await fetch(`${API}/public/company/${slug}`);
        const data=await r.json();
        if(!r.ok) throw new Error(data?.error||"Company not found");
        setCompanyName(data.company.name);
        setSuppliers(data.suppliers||[]);
      }catch(e:any){setError(e.message);}
      finally{setLoading(false);}
    })();
  },[slug]);

  async function submit(){
    if(!description.trim()){setError(lang==="de"?"Bitte Beschreibung eingeben":"Please enter a description");return;}
    setSubmitting(true);setError("");
    const payload:any={category,description};
    if(supplierId) payload.supplierId=supplierId;
    else if(supplierName.trim()) payload.supplierName=supplierName.trim();
    if(reporterContact.trim()) payload.reporterContact=reporterContact.trim();
    try{
      const r=await fetch(`${API}/public/complaints/${slug}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const data=await r.json().catch(()=>({}));
      if(!r.ok){setError(data?.error||"Submission failed");return;}
      setRefId(data.id?.slice(0,8)?.toUpperCase()||"OK");
      setDone(true);
    }catch(e:any){setError(e.message);}
    finally{setSubmitting(false);}
  }

  function changeLang(l:Lang){setLang(l);setLangState(l);}

  if(loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui",color:"#6b7280",fontSize:14}}>
      {lang==="de"?"Laden...":"Loading..."}
    </div>
  );

  return (
    <>
    <style dangerouslySetInnerHTML={{__html:css}}/>
    <div className="page">
      <header className="header">
        <div className="header-logo">LkSG<em>Compass</em></div>
        <div className="header-right">
          <button className={`lang-btn${lang==="de"?" on":""}`} onClick={()=>changeLang("de")}>DE</button>
          <button className={`lang-btn${lang==="en"?" on":""}`} onClick={()=>changeLang("en")}>EN</button>
        </div>
      </header>

      <main className="main">
        <div className="wrap">
          <div className="anon-badge">
            <div className="anon-dot"/>
            {lang==="de"?"Anonyme Meldung moglich  -  §8 LkSG":"Anonymous reporting possible  -  §8 LkSG"}
          </div>

          {done?(
            <div className="card">
              <div className="success-icon">?</div>
              <div className="success-title">{lang==="de"?"Meldung eingegangen":"Report submitted"}</div>
              <div className="success-sub">
                {lang==="de"?<>Ihre Meldung wurde gemass <b>§8 LkSG</b> bei <b>{companyName}</b> eingereicht. Sie wird vertraulich behandelt und innerhalb von 7 Werktagen bestatigt. Sie sind geschutzt vor Benachteiligung gemass §8 Abs. 5 LkSG.</>:<>Your report has been submitted under <b>§8 LkSG</b> to <b>{companyName}</b>. It will be treated confidentially and acknowledged within 7 working days. You are protected against retaliation under §8 para. 5 LkSG.</>}
              </div>
              {refId&&<>
                <div style={{fontSize:12,color:"var(--mu)",textAlign:"center",marginBottom:8}}>{lang==="de"?"Ihre Referenznummer:":"Your reference number:"}</div>
                <div className="ref-box">{refId}</div>
                <div style={{fontSize:11.5,color:"var(--mu2)",textAlign:"center",marginTop:8}}>{lang==="de"?"Bitte notieren Sie diese Nummer fur Ruckfragen.":"Please note this number for any follow-up queries."}</div>
              </>}
            </div>
          ):(
            <div className="card">
              <div className="card-title">
                {lang==="de"?"Hinweisgebersystem":"Whistleblowing portal"}
              </div>
              <div className="card-sub">
                {lang==="de"?<>{lang==="de"?"Beschwerdeverfahren gemass §8 LkSG bei":"Complaints procedure under §8 LkSG at"} <span className="company-name">{companyName||"--"}</span>. {lang==="de"?"Ihre Identitat wird nicht ohne Ihre Zustimmung weitergegeben.":"Your identity will not be shared without your consent."}</>:<>Complaints procedure under §8 LkSG at <span className="company-name">{companyName||"--"}</span>. Your identity will not be shared without your consent.</>}
              </div>

              <div className="al ainf">
                <span style={{fontSize:15,flexShrink:0}}>?</span>
                <div style={{fontSize:13}}>
                  {lang==="de"?"Diese Meldeplattform ist gemass §8 LkSG eingerichtet. Ihre Meldung wird vertraulich behandelt. Anonyme Meldungen sind moglich -- hinterlassen Sie dafur keine Kontaktdaten. Sie sind vor Benachteiligung geschutzt (§8 Abs. 5 LkSG).":"This reporting platform is set up under §8 LkSG. Your report is treated confidentially. Anonymous reports are possible -- leave no contact details for this. You are protected against retaliation (§8 para. 5 LkSG)."}
                </div>
              </div>

              {error&&<div className="al aerr"><span style={{fontSize:14}}>?</span><span>{error}</span></div>}

              <div className="fl">
                <label className="lbl">{lang==="de"?"Betroffener Lieferant (optional)":"Affected supplier (optional)"}</label>
                <select className="sel inp" value={supplierId} onChange={e=>setSupplierId(e.target.value)}>
                  <option value="">{lang==="de"?"-- Lieferant auswahlen oder Namen unten eingeben --":"-- Select supplier or enter name below --"}</option>
                  {suppliers.map(s=><option key={s.id} value={s.id}>{s.name} ({s.country})</option>)}
                </select>
              </div>

              {!supplierId&&(
                <div className="fl">
                  <label className="lbl">{lang==="de"?"Lieferantenname (falls nicht in Liste)":"Supplier name (if not in list)"}</label>
                  <input className="inp" value={supplierName} onChange={e=>setSupplierName(e.target.value)} placeholder={lang==="de"?"Name des Lieferanten...":"Supplier name..."}/>
                </div>
              )}

              <div className="fl">
                <label className="lbl">{lang==="de"?"Kategorie (§2 LkSG)":"Category (§2 LkSG)"}</label>
                <select className="sel inp" value={category} onChange={e=>setCategory(e.target.value)}>
                  {CATS.map(c=><option key={c.v} value={c.v}>{lang==="de"?c.de:c.en}</option>)}
                </select>
              </div>

              <div className="fl">
                <label className="lbl">{lang==="de"?"Sachverhaltsbeschreibung *":"Description *"}</label>
                <textarea className="ta" rows={6} value={description} onChange={e=>setDescription(e.target.value)} placeholder={lang==="de"?"Beschreiben Sie den Sachverhalt so konkret wie moglich (was, wo, wann, wer). Diese Angaben helfen bei der Untersuchung.":"Describe the situation as concretely as possible (what, where, when, who). These details help with the investigation."}/>
              </div>

              <div className="fl">
                <label className="lbl">{lang==="de"?"Kontaktdaten (optional -- fur Ruckmeldung)":"Contact details (optional -- for follow-up)"}</label>
                <input className="inp" value={reporterContact} onChange={e=>setReporterContact(e.target.value)} placeholder={lang==="de"?"E-Mail oder andere Kontaktmoglichkeit (freiwillig)":"Email or other contact (optional)"}/>
                <div style={{fontSize:11.5,color:"var(--mu2)",marginTop:5}}>{lang==="de"?"Leer lassen fur vollstandige Anonymitat. Kontaktdaten werden nur fur Ruckfragen verwendet.":"Leave blank for complete anonymity. Contact details are only used for follow-up questions."}</div>
                {reporterContact.trim() && <div style={{fontSize:10.5,color:"var(--mu2)",marginTop:4,padding:"6px 8px",background:"var(--g3)",borderRadius:4,lineHeight:1.4}}>
                  {lang==="de"
                    ? <><strong>DSGVO Art.13:</strong> Ihre Kontaktdaten werden vertraulich gespeichert und ausschliesslich fuer die Bearbeitung dieser Meldung verwendet. Verantwortlicher: {companyName}. Rechtsgrundlage: §8 LkSG / Art.6 Abs.1 lit.c DSGVO. Sie haben das Recht auf Auskunft, Loeschung und Widerspruch.</>
                    : <><strong>GDPR Art.13:</strong> Your contact details are stored confidentially and used solely for processing this report. Controller: {companyName}. Legal basis: §8 LkSG / Art.6 para.1 lit.c GDPR. You have the right to access, deletion and objection.</>}
                </div>}
              </div>

              <button className="btn" onClick={submit} disabled={submitting||!description.trim()}>
                {submitting?<><span className="sp"/>{lang==="de"?"Wird gesendet...":"Submitting..."}</>:lang==="de"?"Meldung sicher ubermitteln ->":"Submit report securely ->"}
              </button>

              <div style={{fontSize:12,color:"var(--mu2)",textAlign:"center",marginTop:12,lineHeight:1.5}}>
                {lang==="de"?"Mit der Einreichung bestatigen Sie, dass Ihre Angaben nach bestem Wissen gemacht wurden. Falsche Meldungen konnen rechtliche Konsequenzen haben.":"By submitting, you confirm that your information has been provided to the best of your knowledge. False reports may have legal consequences."}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <a href="/">LkSGCompass</a>  -  {lang==="de"?"Hinweisgebersystem gemass §8 LkSG":"Whistleblowing system under §8 LkSG"}  -  <a href="/datenschutz">{lang==="de"?"Datenschutz":"Privacy"}</a>
      </footer>
    </div>
    </>
  );
}
