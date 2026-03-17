"use client";
import { useEffect, useRef, useState } from "react";
import { clearToken, getToken, getSessionRole, validateSession } from "@/lib/auth";
import { API } from "@/lib/api";
import { COUNTRIES, INDUSTRIES, BAFA_DE, BAFA_EN, calcPortfolioScore, gradeColor, gradeLabel } from "@/lib/workspace-constants";
import { buildPortfolioKpis, buildActionStats } from "@/lib/workspace-metrics";
import { chipRL, sevChip, cStatusChip, aStatusChip, pChip, dueBadge } from "@/lib/workspace-ui";
import { TABS, TAB_ROUTES } from "@/lib/workspace-config";
import type { TabId } from "@/lib/workspace-types";
import DashboardTab  from "./workspace-tabs/DashboardTab";
import SuppliersTab  from "./workspace-tabs/SuppliersTab";
import ActionsTab    from "./workspace-tabs/ActionsTab";
import ComplaintsTab from "./workspace-tabs/ComplaintsTab";
import ReportsTab    from "./workspace-tabs/ReportsTab";
import SaqTab        from "./workspace-tabs/SaqTab";
import KpiTab        from "./workspace-tabs/KpiTab";
import EvidenceTab   from "./workspace-tabs/EvidenceTab";
import MonitoringTab from "./workspace-tabs/MonitoringTab";
import AiTab         from "./workspace-tabs/AiTab";
import AuditTab      from "./workspace-tabs/AuditTab";
import SettingsTab   from "./workspace-tabs/SettingsTab";
import LegalTab      from "./workspace-tabs/LegalTab";
import SupplierModal from "./workspace/SupplierModal";
import CapModal      from "./workspace/CapModal";
import RiskBreakdown from "./workspace/RiskBreakdown";
import WorkspaceToasts from "./workspace/WorkspaceToasts";
import AuthSplash    from "./workspace/AuthSplash";

type Lang  = "de"|"en";
type Toast = {id:number;type:"ok"|"err"|"info";msg:string};
let _tid=0;

async function api(path:string,init:RequestInit={}):Promise<any>{
  const t=getToken();
  const h=new Headers(init.headers||{});
  if(!h.has("Content-Type")&&!(init.body instanceof FormData))h.set("Content-Type","application/json");
  if(t)h.set("Authorization",`Bearer ${t}`);
  const r=await fetch(`${API}${path}`,{...init,headers:h});
  const d=await r.json().catch(()=>({}));
  if(r.status===401){clearToken();window.location.href="/login";throw new Error("Session");}
  if(!r.ok)throw new Error((d as any)?.error||`Error ${r.status}`);
  return d;
}

// ── Nav icons ─────────────────────────────────────────────────────────────────
const I:Record<string,string>={
  dashboard:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5" opacity=".5"/><rect x="1" y="9" width="6" height="6" rx="1.5" opacity=".5"/><rect x="9" y="9" width="6" height="6" rx="1.5" opacity=".5"/></svg>`,
  kpi:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><polyline points="1,12 5,7 8,10 12,4 15,6" opacity=".7"/><circle cx="5" cy="7" r="1" fill="currentColor"/><circle cx="12" cy="4" r="1" fill="currentColor"/></svg>`,
  reports:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="1" width="12" height="14" rx="2"/><line x1="5" y1="5" x2="11" y2="5"/><line x1="5" y1="8" x2="11" y2="8"/><line x1="5" y1="11" x2="8" y2="11"/></svg>`,
  suppliers:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="5" cy="6" r="3" opacity=".6"/><circle cx="11" cy="6" r="3" opacity=".6"/><path d="M1 14c0-2.5 2-4 4-4h6c2 0 4 1.5 4 4" opacity=".5"/></svg>`,
  actions:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="2" width="12" height="12" rx="2"/><polyline points="5,8 7,10 11,6"/></svg>`,
  complaints:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6.5"/><line x1="8" y1="5" x2="8" y2="8.5"/><circle cx="8" cy="11" r=".8" fill="currentColor"/></svg>`,
  evidence:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 1h6l4 4v9a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1z"/><polyline points="9,1 9,5 13,5" opacity=".6"/><line x1="5" y1="9" x2="11" y2="9" opacity=".7"/><line x1="5" y1="12" x2="9" y2="12" opacity=".7"/></svg>`,
  saq:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="2" width="12" height="12" rx="2"/><line x1="5" y1="6" x2="11" y2="6" opacity=".6"/><line x1="5" y1="9" x2="11" y2="9" opacity=".6"/><line x1="5" y1="12" x2="8" y2="12" opacity=".6"/></svg>`,
  monitoring:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6.5" opacity=".4"/><circle cx="8" cy="8" r="3.5" opacity=".6"/><circle cx="8" cy="8" r="1" fill="currentColor"/></svg>`,
  audit:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 4h12v9a1 1 0 01-1 1H3a1 1 0 01-1-1V4z"/><line x1="2" y1="4" x2="14" y2="4"/><line x1="6" y1="1" x2="6" y2="4" opacity=".6"/><line x1="10" y1="1" x2="10" y2="4" opacity=".6"/></svg>`,
  ai:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><polygon points="8,1 10,6 15,6 11,9.5 12.5,15 8,11.5 3.5,15 5,9.5 1,6 6,6"/></svg>`,
  legal:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 1v14M2 5l6-4 6 4" opacity=".6"/><line x1="2" y1="12" x2="14" y2="12" opacity=".5"/><line x1="3" y1="7" x2="7" y2="11" opacity=".6"/><line x1="9" y1="7" x2="13" y2="11" opacity=".6"/></svg>`,
  settings:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4" opacity=".5"/></svg>`,
};

const NAV=[
  {label:"Überblick",en:"Overview",items:[
    {id:"dashboard" as TabId,de:"Dashboard",en:"Dashboard"},
    {id:"kpi" as TabId,de:"Wirksamkeit",en:"Effectiveness"},
    {id:"reports" as TabId,de:"BAFA-Bericht",en:"BAFA Report"},
  ]},
  {label:"Betrieb",en:"Operations",items:[
    {id:"suppliers" as TabId,de:"Lieferanten",en:"Suppliers"},
    {id:"actions" as TabId,de:"Aktionspläne",en:"Action Plans"},
    {id:"complaints" as TabId,de:"Beschwerden",en:"Complaints"},
    {id:"evidence" as TabId,de:"Nachweise",en:"Evidence"},
  ]},
  {label:"Prüfung",en:"Assurance",items:[
    {id:"saq" as TabId,de:"SAQ",en:"SAQ"},
    {id:"monitoring" as TabId,de:"Monitoring",en:"Monitoring"},
    {id:"audit" as TabId,de:"Audit Trail",en:"Audit Trail"},
  ]},
  {label:"Plattform",en:"Platform",items:[
    {id:"ai" as TabId,de:"KI-Assistent",en:"AI Assistant"},
    {id:"legal" as TabId,de:"Rechtsassistent",en:"Legal"},
    {id:"settings" as TabId,de:"Einstellungen",en:"Settings"},
  ]},
];

const PAGE_META:Record<TabId,{de:string;en:string;sub_de:string;sub_en:string;primary_de:string;primary_en:string;primaryTab?:TabId}> = {
  dashboard: {de:"Dashboard",en:"Dashboard",sub_de:"Prioritäten, Risiken und BAFA-Bereitschaft.",sub_en:"Priorities, risks and BAFA readiness.",primary_de:"Lieferant anlegen",primary_en:"Add supplier"},
  suppliers: {de:"Lieferanten",en:"Suppliers",sub_de:"§5 Risikoregister und Stammdaten.",sub_en:"§5 risk register and master data.",primary_de:"Neuer Lieferant",primary_en:"New supplier"},
  actions:   {de:"Aktionspläne",en:"Action Plans",sub_de:"§6–7 Corrective Action Plans.",sub_en:"§6–7 Corrective Action Plans.",primary_de:"Neuer CAP",primary_en:"New CAP"},
  complaints:{de:"Beschwerden",en:"Complaints",sub_de:"§8 Hinweisgebersystem.",sub_en:"§8 Whistleblower system.",primary_de:"Meldung einreichen",primary_en:"Submit complaint"},
  saq:       {de:"SAQ",en:"SAQ",sub_de:"§5 Selbstauskunft-Fragebögen.",sub_en:"§5 Self-assessment questionnaires.",primary_de:"SAQ senden",primary_en:"Send SAQ"},
  kpi:       {de:"Wirksamkeit",en:"Effectiveness",sub_de:"§9 KPIs und Compliance-Trend.",sub_en:"§9 KPIs and compliance trend.",primary_de:"Snapshot speichern",primary_en:"Save snapshot"},
  reports:   {de:"BAFA-Bericht",en:"BAFA Report",sub_de:"§10 Jahresbericht generieren.",sub_en:"§10 Annual report generation.",primary_de:"Bericht generieren",primary_en:"Generate report"},
  evidence:  {de:"Nachweise",en:"Evidence",sub_de:"§10 Dokumenten-Tresor (7 Jahre).",sub_en:"§10 Document vault (7 years).",primary_de:"Dokument hochladen",primary_en:"Upload document"},
  monitoring:{de:"Monitoring",en:"Monitoring",sub_de:"Kontinuierliche Risikoüberwachung.",sub_en:"Continuous risk monitoring.",primary_de:"Aktualisieren",primary_en:"Refresh"},
  ai:        {de:"KI-Assistent",en:"AI Assistant",sub_de:"Claude analysiert Ihre Compliance-Daten.",sub_en:"Claude analyses your compliance data.",primary_de:"",primary_en:""},
  audit:     {de:"Audit Trail",en:"Audit Trail",sub_de:"§10 Unveränderliche Aktivitätshistorie.",sub_en:"§10 Immutable activity history.",primary_de:"Laden",primary_en:"Load"},
  legal:     {de:"Rechtsassistent",en:"Legal",sub_de:"Vorlagen, Rechtsfragen, Vertragscheck.",sub_en:"Templates, legal Q&A, contract review.",primary_de:"",primary_en:""},
  settings:  {de:"Einstellungen",en:"Settings",sub_de:"Unternehmen, Team, Abrechnung.",sub_en:"Company, team, billing.",primary_de:"",primary_en:""},
};

export default function AppWorkspace({initialTab="dashboard"}:{initialTab?:TabId}){
  const [mounted,setMounted]=useState(false);
  const [authOk,setAuthOk]=useState(false);
  const [tab,setTabState]=useState<TabId>(initialTab);
  const [L,setL]=useState<Lang>("de");
  const [company,setCompany]=useState<any>(null);
  const [suppliers,setSuppliers]=useState<any[]>([]);
  const [complaints,setComplaints]=useState<any[]>([]);
  const [actions,setActions]=useState<any[]>([]);
  const [saqs,setSaqs]=useState<any[]>([]);
  const [evidences,setEvidences]=useState<any[]>([]);
  const [events,setEvents]=useState<any[]>([]);
  const [screenings,setScreenings]=useState<any[]>([]);
  const [auditLog,setAuditLog]=useState<any[]>([]);
  const [kpiLive,setKpiLive]=useState<any>(null);
  const [kpiTrend,setKpiTrend]=useState<any[]>([]);
  const [loading,setLoading]=useState(false);
  const [auditLd,setAuditLd]=useState(false);
  const [kpiLd,setKpiLd]=useState(false);
  const [toasts,setToasts]=useState<Toast[]>([]);
  const [showQuickstart,setShowQuickstart]=useState(false);
  const [expanded,setExpanded]=useState<string|null>(null);
  const [hoverParam,setHoverParam]=useState<string|null>(null);
  const [supFilter,setSupFilter]=useState({risk:"",country:"",search:""});
  const [auditFilter,setAuditFilter]=useState("");
  const [actionNotes,setActionNotes]=useState<Record<string,string>>({});
  const [supAI,setSupAI]=useState<Record<string,string>>({});
  const [supCAP,setSupCAP]=useState<Record<string,string>>({});
  const [supLd,setSupLd]=useState<Record<string,boolean>>({});
  const [showSupModal,setShowSupModal]=useState(false);
  const [editingSup,setEditingSup]=useState<any>(null);
  const [sName,setSName]=useState(""); const [sCountry,setSCountry]=useState("Germany");
  const [sInd,setSInd]=useState("services"); const [sSpend,setSSpend]=useState("");
  const [sWorkers,setSWorkers]=useState(""); const [sAudit,setSAudit]=useState(false);
  const [sCoc,setSCoc]=useState(false); const [sCerts,setSCerts]=useState("0");
  const [sSubSup,setSSubSup]=useState("0"); const [sTransp,setSTransp]=useState("3");
  const [sViolations,setSViolations]=useState(false); const [sNotes,setSNotes]=useState("");
  const [csv,setCsv]=useState("name,country,industry\nTextile Group,Bangladesh,textile\nTechParts,China,electronics");
  const [showCapModal,setShowCapModal]=useState(false);
  const [capSup,setCapSup]=useState(""); const [capTitle,setCapTitle]=useState("");
  const [capDesc,setCapDesc]=useState(""); const [capPara,setCapPara]=useState("6");
  const [capDue,setCapDue]=useState(""); const [capPri,setCapPri]=useState("high");
  const [capAssign,setCapAssign]=useState("");
  const [cSup,setCSup]=useState(""); const [cCat,setCCat]=useState("human_rights");
  const [cSev,setCSev]=useState("medium"); const [cDesc,setCDesc]=useState("");
  const [cNotes,setCNotes]=useState<Record<string,string>>({});
  const [triageRes,setTriageRes]=useState(""); const [triageLd,setTriageLd]=useState(false);
  const [rYear,setRYear]=useState(new Date().getFullYear());
  const [draft,setDraft]=useState<any>(null); const [draftTs,setDraftTs]=useState("");
  const [genLd,setGenLd]=useState(""); const [aiMsgs,setAiMsgs]=useState<any[]>([]);
  const [aiInput,setAiInput]=useState(""); const [aiLd,setAiLd]=useState(false);
  const [saqEmail,setSaqEmail]=useState(""); const [saqSup,setSaqSup]=useState("");
  const [saqDays,setSaqDays]=useState("30"); const [saqSending,setSaqSending]=useState(false);
  const [evTitle,setEvTitle]=useState(""); const [evType,setEvType]=useState("audit_report");
  const [evLksg,setEvLksg]=useState(""); const [evDesc,setEvDesc]=useState("");
  const [evSupId,setEvSupId]=useState(""); const [evFile,setEvFile]=useState<File|null>(null);
  const [evUploading,setEvUploading]=useState(false);
  const [approvalRows,setApprovalRows]=useState<any[]>([]);
  const [approvalNotes,setApprovalNotes]=useState("");
  const fileRef=useRef<HTMLInputElement>(null);
  const aiEnd=useRef<HTMLDivElement>(null);

  const toast=(type:"ok"|"err"|"info",msg:string)=>{
    if(msg==="rate_limited"||msg.includes("429"))return;
    const id=++_tid;
    setToasts(x=>{if(x.some(t=>t.msg===msg))return x;return[...x.slice(-2),{id,type,msg}];});
    setTimeout(()=>setToasts(x=>x.filter(t=>t.id!==id)),4500);
  };

  const setTab=(next:TabId)=>{
    setTabState(next);
    if(typeof window!=="undefined")window.history.replaceState(null,"",TAB_ROUTES[next]);
  };

  // Data loaders
  const loadCompany=async()=>{try{const r=await api("/companies/me");setCompany(r||null);}catch{}};
  const loadSuppliers=async()=>{try{const r=await api("/suppliers");setSuppliers(Array.isArray(r)?r:r?.items??[]);}catch(e:any){if(!String(e?.message||"").includes("Session"))toast("err",e?.message||"Suppliers failed");}};
  const loadComplaints=async()=>{try{const r=await api("/complaints");setComplaints(Array.isArray(r)?r:[]);}catch{}};
  const loadActions=async()=>{try{const r=await api("/actions");setActions(Array.isArray(r)?r:[]);}catch{}};
  const loadSaqData=async()=>{try{const r=await api("/saq");setSaqs(Array.isArray(r)?r:[]);}catch{}};
  const loadEvidenceData=async()=>{try{const r=await api("/evidence");setEvidences(Array.isArray(r)?r:r?.items??[]);}catch{}};
  const loadMonitoringData=async()=>{try{const[e,s]=await Promise.all([api("/monitoring/events"),api("/monitoring/screenings")]);setEvents(Array.isArray(e)?e:[]);setScreenings(Array.isArray(s)?s:[]);}catch{}};
  const loadKpiData=async()=>{setKpiLd(true);try{const[l,t]=await Promise.all([api("/kpi/live"),api("/kpi/trend")]);setKpiLive(l);setKpiTrend(Array.isArray(t)?t:[]);}catch{}finally{setKpiLd(false);}};
  const loadAuditLog=async(et?:string)=>{setAuditLd(true);try{const r=await api(et?`/audit?entity_type=${et}`:"/audit");setAuditLog(Array.isArray(r)?r:r?.rows??[]);}catch{}finally{setAuditLd(false);}};
  const loadApprovals=async()=>{try{const r=await api("/reports/approvals");setApprovalRows(Array.isArray(r)?r:[]);}catch{}};
  const loadDraft=async()=>{try{const r=await api(`/reports/bafa/${rYear}/draft`);if(r?.draft){setDraft(r.draft);setDraftTs(r.updated_at||"");}}catch{}};
  const loadCoreData=async()=>{setLoading(true);try{await Promise.all([loadCompany(),loadSuppliers(),loadComplaints(),loadActions(),loadSaqData(),loadEvidenceData()]);}catch(e:any){if(!String(e?.message||"").includes("Session"))toast("err",e?.message||"Load failed");}finally{setLoading(false);}};

  // Mutations
  const saveSupplier=async()=>{
    if(!sName.trim())return toast("err",L==="de"?"Namen eingeben":"Enter name");
    setLoading(true);
    const body={name:sName,country:sCountry,industry:sInd,annual_spend_eur:parseFloat(sSpend)||null,workers:parseInt(sWorkers)||null,has_audit:sAudit,has_code_of_conduct:sCoc,certification_count:parseInt(sCerts)||0,sub_supplier_count:parseInt(sSubSup)||0,transparency_score:parseInt(sTransp)||3,previous_violations:sViolations,notes:sNotes};
    try{if(editingSup){await api(`/suppliers/${editingSup.id}`,{method:"PUT",body:JSON.stringify(body)});toast("ok",L==="de"?"Aktualisiert":"Updated");}else{await api("/suppliers",{method:"POST",body:JSON.stringify(body)});toast("ok",L==="de"?"Angelegt":"Created");}setShowSupModal(false);await Promise.all([loadSuppliers(),loadKpiData()]);}catch(e:any){toast("err",e.message);}finally{setLoading(false);}
  };
  const delSupplier=async(id:string,name:string)=>{if(!confirm(L==="de"?`"${name}" löschen?`:`Delete "${name}"?`))return;try{await api(`/suppliers/${id}`,{method:"DELETE"});toast("ok",L==="de"?"Gelöscht":"Deleted");await loadSuppliers();}catch(e:any){toast("err",e.message);}};
  const recalc=async()=>{setLoading(true);try{await api("/suppliers/recalc",{method:"POST"});toast("ok",L==="de"?"Risiko neu berechnet":"Risk recalculated");await loadSuppliers();}catch(e:any){toast("err",e.message);}finally{setLoading(false);}};
  const importCsv=async()=>{if(!csv.trim())return;setLoading(true);try{const lines=csv.trim().split("\n");const headers=lines[0].split(",").map(h=>h.trim().toLowerCase());const rows=lines.slice(1).map(l=>{const vals=l.split(",").map(v=>v.trim());const obj:any={};headers.forEach((h,i)=>{obj[h]=vals[i]||"";});return obj;}).filter(r=>r.name);await api("/auto/import",{method:"POST",body:JSON.stringify({rows})});toast("ok",`${rows.length} ${L==="de"?"importiert":"imported"}`);await loadSuppliers();}catch(e:any){toast("err",e.message);}finally{setLoading(false);}};
  const submitComplaint=async()=>{if(!cDesc.trim())return toast("err",L==="de"?"Beschreibung erforderlich":"Description required");try{await api("/complaints",{method:"POST",body:JSON.stringify({supplierId:cSup||null,category:cCat,description:cDesc,severity:cSev})});toast("ok",L==="de"?"Meldung eingereicht":"Submitted");setCDesc("");setCSup("");await loadComplaints();}catch(e:any){toast("err",e.message);}};
  const triageComplaint=async(id:string)=>{setTriageLd(true);try{const r=await api(`/complaints/${id}/triage`,{method:"POST"});setTriageRes(r?.recommendation||"");toast("ok","KI-Triage abgeschlossen");}catch(e:any){toast("err",e.message);}finally{setTriageLd(false);}};
  const updateComplaintStatus=async(id:string,status:string)=>{try{await api(`/complaints/${id}/status`,{method:"PUT",body:JSON.stringify({status})});setComplaints(cs=>cs.map(c=>c.id===id?{...c,status}:c));}catch(e:any){toast("err",e.message);}};
  const saveComplaintNote=async(id:string)=>{const note=cNotes[id];if(!note?.trim())return;try{await api(`/complaints/${id}/notes`,{method:"PUT",body:JSON.stringify({notes:note})});toast("ok",L==="de"?"Gespeichert":"Saved");}catch(e:any){toast("err",e.message);}};
  const createCap=async()=>{if(!capTitle.trim())return toast("err","Titel erforderlich");try{await api("/actions",{method:"POST",body:JSON.stringify({title:capTitle,description:capDesc,supplierId:capSup||null,lksgParagraph:capPara,dueDate:capDue||null,priority:capPri,assignedTo:capAssign||null})});toast("ok","CAP angelegt");setShowCapModal(false);setCapTitle("");setCapDesc("");setCapSup("");setCapAssign("");await loadActions();}catch(e:any){toast("err",e.message);}};
  const updateActionStatus=async(id:string,status:string)=>{try{await api(`/actions/${id}/status`,{method:"PUT",body:JSON.stringify({status})});setActions(as=>as.map(a=>a.id===id?{...a,status}:a));}catch(e:any){toast("err",e.message);}};
  const saveActionNote=async(id:string)=>{const note=actionNotes[id];if(!note?.trim())return;try{await api(`/actions/${id}/notes`,{method:"PUT",body:JSON.stringify({notes:note})});toast("ok","Gespeichert");}catch(e:any){toast("err",e.message);}};
  const deleteAction=async(id:string,title:string)=>{if(!confirm(L==="de"?`"${title}" löschen?`:`Delete "${title}"?`))return;try{await api(`/actions/${id}`,{method:"DELETE"});toast("ok","Gelöscht");setActions(as=>as.filter(a=>a.id!==id));}catch(e:any){toast("err",e.message);}};
  const saveDraft=async()=>{if(!draft)return;try{await api(`/reports/bafa/${rYear}/draft`,{method:"PUT",body:JSON.stringify({draft})});setDraftTs(new Date().toISOString());toast("ok","Entwurf gespeichert");}catch(e:any){toast("err",e.message);}};
  const genSection=async(key:string)=>{setGenLd(key);try{const r=await api(`/reports/bafa/${rYear}/generate/${key}`,{method:"POST"});if(r?.text)setDraft((d:any)=>({...(d||{}),[key]:r.text}));}catch(e:any){toast("err",e.message);}finally{setGenLd("");}};
  const sendAi=async(text?:string)=>{const msg=text||aiInput;if(!msg.trim()||aiLd)return;setAiMsgs(m=>[...m,{role:"user",content:msg}]);setAiInput("");setAiLd(true);try{const r=await api("/ai/chat",{method:"POST",body:JSON.stringify({message:msg})});setAiMsgs(m=>[...m,{role:"assistant",content:r?.response||r?.text||"..."}]);}catch(e:any){setAiMsgs(m=>[...m,{role:"assistant",content:"Fehler: "+e.message}]);}finally{setAiLd(false);}};
  const getSupAI=async(sup:any)=>{setSupLd(l=>({...l,[sup.id]:true}));try{const r=await api("/ai/supplier-brief",{method:"POST",body:JSON.stringify({supplierId:sup.id})});setSupAI(a=>({...a,[sup.id]:r?.brief||r?.text||""}));}catch(e:any){toast("err",e.message);}finally{setSupLd(l=>({...l,[sup.id]:false}));}};
  const getSupCAP=async(sup:any)=>{setSupLd(l=>({...l,[sup.id]:true}));try{const r=await api("/ai/cap-suggestion",{method:"POST",body:JSON.stringify({supplierId:sup.id})});setSupCAP(a=>({...a,[sup.id]:r?.suggestion||r?.text||""}));}catch(e:any){toast("err",e.message);}finally{setSupLd(l=>({...l,[sup.id]:false}));}};
  const sendSaq=async()=>{if(!saqEmail||!saqSup)return toast("err","E-Mail und Lieferant erforderlich");setSaqSending(true);try{await api("/saq",{method:"POST",body:JSON.stringify({supplierId:saqSup,email:saqEmail,days:parseInt(saqDays)||30})});toast("ok","SAQ gesendet");setSaqEmail("");setSaqSup("");await loadSaqData();}catch(e:any){toast("err",e.message);}finally{setSaqSending(false);}};
  const deleteSaq=async(id:string)=>{try{await api(`/saq/${id}`,{method:"DELETE"});setSaqs(s=>s.filter(q=>q.id!==id));}catch(e:any){toast("err",e.message);}};
  const saveKpiSnapshot=async()=>{try{await api("/kpi/snapshot",{method:"POST"});toast("ok","Snapshot gespeichert");}catch(e:any){toast("err",e.message);}};
  const uploadEvidence=async()=>{if(!evTitle.trim())return toast("err","Titel erforderlich");setEvUploading(true);try{const fd=new FormData();fd.append("title",evTitle);fd.append("type",evType);if(evLksg)fd.append("lksg_ref",evLksg);if(evDesc)fd.append("description",evDesc);if(evSupId)fd.append("supplier_id",evSupId);if(evFile)fd.append("file",evFile);await api("/evidence",{method:"POST",body:fd});toast("ok","Hochgeladen");setEvTitle("");setEvDesc("");setEvLksg("");setEvFile(null);setEvSupId("");if(fileRef.current)fileRef.current.value="";await loadEvidenceData();}catch(e:any){toast("err",e.message);}finally{setEvUploading(false);}};
  const deleteEvidence=async(id:string)=>{try{await api(`/evidence/${id}`,{method:"DELETE"});setEvidences(e=>e.filter(ev=>ev.id!==id));}catch(e:any){toast("err",e.message);}};
  const exportCSV=(endpoint:string,filename:string)=>{const a=document.createElement("a");a.href=`${API}${endpoint}?token=${encodeURIComponent(getToken())}`;a.download=filename;a.click();};
  const requestApproval=async(year:number)=>{try{await api(`/reports/bafa/${year}/request-approval`,{method:"POST",body:JSON.stringify({notes:approvalNotes})});toast("ok","Freigabe angefragt");await loadApprovals();}catch(e:any){toast("err",e.message);}};
  const reviewApproval=async(year:number,decision:"approved"|"rejected")=>{try{await api(`/reports/bafa/${year}/approve`,{method:"POST",body:JSON.stringify({decision,notes:approvalNotes})});toast("ok",decision==="approved"?"Freigegeben":"Abgelehnt");await loadApprovals();}catch(e:any){toast("err",e.message);}};

  const openAddSupModal=()=>{setEditingSup(null);setSName("");setSCountry("Germany");setSInd("services");setSSpend("");setSWorkers("");setSAudit(false);setSCoc(false);setSCerts("0");setSSubSup("0");setSTransp("3");setSViolations(false);setSNotes("");setShowSupModal(true);};
  const openEditSupModal=(s:any)=>{setEditingSup(s);setSName(s.name);setSCountry(s.country);setSInd(s.industry);setSSpend(String(s.annual_spend_eur||""));setSWorkers(String(s.workers||""));setSAudit(!!s.has_audit);setSCoc(!!s.has_code_of_conduct);setSCerts(String(s.certification_count||0));setSSubSup(String(s.sub_supplier_count||0));setSTransp(String(s.transparency_score||3));setSViolations(!!s.previous_violations);setSNotes(s.notes||"");setShowSupModal(true);};

  // Derived
  const score=calcPortfolioScore(suppliers,actions,complaints,saqs);
  const kpis=buildPortfolioKpis(suppliers);
  const actionStats=buildActionStats(actions);
  const sc=score.score; const sg=score.grade; const scCol=gradeColor(sg);
  const BF=L==="de"?BAFA_DE:BAFA_EN;
  const overdueActions=actions.filter((a:any)=>a.due_date&&new Date(a.due_date)<new Date()&&a.status!=="completed"&&a.status!=="closed").length;
  const openComplaints=complaints.filter((c:any)=>c.status==="open").length;

  const approvalMeta={rows:approvalRows,pending:approvalRows.filter(r=>r.status==="pending").length,approved:approvalRows.filter(r=>r.status==="approved").length,rejected:approvalRows.filter(r=>r.status==="rejected").length,lastStatus:approvalRows[0]?.status||"none",loading:false,currentRole:getSessionRole(),canRequest:getSessionRole()!=="viewer",canApprove:["approver","admin"].includes(getSessionRole()),draftLocked:false,notes:approvalNotes,setNotes:setApprovalNotes,loadApprovals,requestApproval,reviewApproval,oldestPendingDays:0,pendingWithinSla:0,slaBreaches:0,pendingAging:{fresh:0,warning:0,urgent:0}};
  const requestState={domains:{company:{loading:false,error:null,lastLoadedAt:null},suppliers:{loading,error:null,lastLoadedAt:null},complaints:{loading:false,error:null,lastLoadedAt:null},actions:{loading:false,error:null,lastLoadedAt:null},saqs:{loading:false,error:null,lastLoadedAt:null},evidences:{loading:false,error:null,lastLoadedAt:null},insights:{loading:false,error:null,lastLoadedAt:null},kpi:{loading:kpiLd,error:null,lastLoadedAt:null},audit:{loading:auditLd,error:null,lastLoadedAt:null}}};
  const reloads={reloadCoreData:loadCoreData,reloadSuppliersDomain:async()=>{await Promise.all([loadCompany(),loadSuppliers()]);},reloadComplaintsDomain:async()=>{await Promise.all([loadComplaints(),loadActions()]);},reloadReportsDomain:async()=>{await Promise.all([loadSaqData(),loadEvidenceData()]);},reloadComplianceCore:loadCoreData,reloadInsights:loadMonitoringData,reloadMonitoringData:loadMonitoringData};
  const quickstartSteps=[{id:"company",tab:"settings" as TabId,done:!!company?.name,title:L==="de"?"Unternehmensprofil":"Company profile",copy:L==="de"?"Pflichtfelder für BAFA.":"Required fields for BAFA."},{id:"suppliers",tab:"suppliers" as TabId,done:suppliers.length>0,title:L==="de"?"Lieferanten importieren":"Import suppliers",copy:L==="de"?"CSV oder manuell anlegen.":"CSV or add manually."},{id:"risk",tab:"suppliers" as TabId,done:suppliers.some((s:any)=>(s.risk_score||0)>0&&s.risk_level!=="unknown"),title:L==="de"?"Risikoanalyse":"Risk analysis",copy:L==="de"?"Land, Branche und Score.":"Country, industry and score."},{id:"complaints",tab:"complaints" as TabId,done:!!company?.slug,title:L==="de"?"Beschwerdekanal":"Complaint channel",copy:L==="de"?"Externen Link teilen.":"Share external link."},{id:"report",tab:"reports" as TabId,done:!!draftTs||!!draft,title:L==="de"?"Ersten Bericht":"First report",copy:L==="de"?"Entwurf laden.":"Load the draft."}];
  const quickstartDone=quickstartSteps.filter(x=>x.done).length;
  const workspaceAssist={cards:[]};

  const BoundRiskBreakdown=({sup,compact=false}:{sup:any;compact?:boolean})=>(
    <RiskBreakdown sup={sup} compact={compact} L={L} hoverParam={hoverParam} setHoverParam={setHoverParam}/>
  );
  const bSevChip=(s:string)=>sevChip(s);
  const bCStatusChip=(s:string)=>cStatusChip(s,L);
  const bAStatusChip=(s:string)=>aStatusChip(s,L);
  const bPChip=(s:string)=>pChip(s);
  const bDueBadge=(d?:string|null)=>dueBadge(d,L);

  const pm=PAGE_META[tab];

  // Primary action per tab
  const handlePrimary=()=>{
    if(tab==="suppliers")openAddSupModal();
    else if(tab==="actions"){setShowCapModal(true);}
    else if(tab==="reports")genSection("all");
    else if(tab==="evidence")fileRef.current?.click();
    else if(tab==="monitoring")loadMonitoringData();
    else if(tab==="kpi")saveKpiSnapshot();
    else if(tab==="audit")loadAuditLog();
    else if(tab==="dashboard")openAddSupModal();
  };

  useEffect(()=>{
    setMounted(true);
    const sl=typeof window!=="undefined"?(localStorage.getItem("lang") as Lang||"de"):"de";
    setL(sl);
    const hidden=typeof window!=="undefined"&&localStorage.getItem("lksg_quickstart_hidden")==="1";
    setShowQuickstart(!hidden);
    (async()=>{const s=await validateSession();if(!s.ok){clearToken();window.location.href="/login";return;}setAuthOk(true);})();
  },[]);

  useEffect(()=>{if(!authOk)return;loadCoreData();loadApprovals();},[authOk]); // eslint-disable-line
  useEffect(()=>{if(!authOk)return;if(tab==="monitoring")loadMonitoringData();if(tab==="kpi")loadKpiData();if(tab==="audit")loadAuditLog();if(tab==="reports"&&!draft)loadDraft();},[tab,authOk]); // eslint-disable-line
  useEffect(()=>{aiEnd.current?.scrollIntoView({behavior:"smooth"});},[aiMsgs]);

  if(!mounted)return null;
  if(!authOk)return <AuthSplash/>;

  const ctx:any={
    L,company,suppliers,complaints,actions,saqs,evidences,
    events,screenings,auditLog,kpiLive,kpiTrend,
    loading,auditLd,kpiLd,requestState,reloads,
    score,kpis,actionStats,workspaceAssist,
    quickstartSteps,quickstartDone,showQuickstart,
    approvalMeta,BF,tab,setTab,
    expanded,setExpanded,hoverParam,setHoverParam,
    supFilter,setSupFilter,auditFilter,setAuditFilter,
    actionNotes,setActionNotes,supAI,supCAP,supLd,
    setSupAI,setSupCAP,setSupLd,
    showCapModal,setShowCapModal,capPara,setCapPara,
    cSup,setCSup,cCat,setCCat,cSev,setCSev,cDesc,setCDesc,
    cNotes,setCNotes,triageRes,setTriageRes,triageLd,setTriageLd,
    saqEmail,setSaqEmail,saqSup,setSaqSup,saqDays,setSaqDays,saqSending,
    rYear,setRYear,draft,setDraft,draftTs,genLd,
    aiMsgs,setAiMsgs,aiInput,setAiInput,aiLd,aiEnd,
    evTitle,setEvTitle,evType,setEvType,evLksg,setEvLksg,
    evDesc,setEvDesc,evSupId,setEvSupId,evFile,setEvFile,evUploading,
    fileRef,
    chipRL,sevChip:bSevChip,cStatusChip:bCStatusChip,
    aStatusChip:bAStatusChip,pChip:bPChip,dueBadge:bDueBadge,
    RiskBreakdown:BoundRiskBreakdown,
    openAddSupModal,openEditSupModal,delSupplier,recalc,importCsv,
    saveSupplier,submitComplaint,triageComplaint,
    updateComplaintStatus,saveComplaintNote,
    createCap,updateActionStatus,saveActionNote,deleteAction,
    loadDraft,saveDraft,genSection,getSupAI,getSupCAP,sendAi,
    loadAuditLog,exportCSV,sendSaq,deleteSaq,
    loadKpi:()=>loadKpiData(),saveKpiSnapshot,uploadEvidence,deleteEvidence,
    toast,apiFn:api,toastFn:toast,
    // Dashboard extras
    dismissQuickstart:()=>{setShowQuickstart(false);localStorage.setItem("lksg_quickstart_hidden","1");},
    workspaceFocus:[],gradeLabel,scCol,sc,sg,
    COUNTRIES,INDUSTRIES,
  };

  return(
    <div className="ws-root">
      <WorkspaceToasts toasts={toasts}/>
      <SupplierModal open={showSupModal} L={L} editingSup={editingSup} loading={loading} sName={sName} setSName={setSName} sCountry={sCountry} setSCountry={setSCountry} sInd={sInd} setSInd={setSInd} sSpend={sSpend} setSSpend={setSSpend} sWorkers={sWorkers} setSWorkers={setSWorkers} sCerts={sCerts} setSCerts={setSCerts} sSubSup={sSubSup} setSSubSup={setSSubSup} sTransp={sTransp} setSTransp={setSTransp} sAudit={sAudit} setSAudit={setSAudit} sCoc={sCoc} setSCoc={setSCoc} sViolations={sViolations} setSViolations={setSViolations} sNotes={sNotes} setSNotes={setSNotes} countries={COUNTRIES} industries={INDUSTRIES} onClose={()=>setShowSupModal(false)} onSave={saveSupplier}/>
      <CapModal open={showCapModal} L={L} capSup={capSup} setCapSup={setCapSup} capTitle={capTitle} setCapTitle={setCapTitle} capDesc={capDesc} setCapDesc={setCapDesc} capPara={capPara} setCapPara={setCapPara} capDue={capDue} setCapDue={setCapDue} capPri={capPri} setCapPri={setCapPri} capAssign={capAssign} setCapAssign={setCapAssign} suppliers={suppliers} onClose={()=>setShowCapModal(false)} onCreate={createCap}/>

      <div className="ws-shell">
        {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
        <div className="ws-sidebar">
          <div className="ws-logo">
            <div className="ws-logo-mark">LC</div>
            <div className="ws-logo-name">LkSG<span>Compass</span></div>
          </div>

          {/* Compliance score — always visible */}
          <div className="ws-score" style={{cursor:"pointer"}} onClick={()=>setTab("kpi")}>
            <div className="ws-score-lbl">Compliance Score · §9</div>
            <div className="ws-score-val" style={{color:scCol}}>{sc}</div>
            <div className="ws-score-sub">{L==="de"?"Note":"Grade"} {sg} · {gradeLabel(sg,L)}</div>
          </div>

          {/* Navigation */}
          {NAV.map(group=>(
            <div key={group.label} className="ws-nav-section">
              <span className="ws-nav-lbl">{L==="de"?group.label:group.en}</span>
              {group.items.map(item=>{
                const badge=item.id==="actions"?overdueActions:item.id==="complaints"?openComplaints:item.id==="reports"?approvalMeta.pending:0;
                const count=item.id==="suppliers"?kpis.total:0;
                return(
                  <button key={item.id} className={`ws-nav-item${tab===item.id?" on":""}`} onClick={()=>setTab(item.id)}>
                    <span dangerouslySetInnerHTML={{__html:I[item.id]||""}}/>
                    {L==="de"?item.de:item.en}
                    {badge>0&&<span className="ws-nav-badge">{badge}</span>}
                    {count>0&&!badge&&<span className="ws-nav-count">{count}</span>}
                  </button>
                );
              })}
            </div>
          ))}

          <div className="ws-sidebar-foot">
            <div className="ws-lang">
              <button className={`ws-lb${L==="de"?" on":""}`} onClick={()=>{setL("de");localStorage.setItem("lang","de");}}>DE</button>
              <button className={`ws-lb${L==="en"?" on":""}`} onClick={()=>{setL("en");localStorage.setItem("lang","en");}}>EN</button>
            </div>
            <button className="ws-signout" onClick={()=>{clearToken();window.location.href="/";}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5 7h7M9 4l3 3-3 3"/><path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3" opacity=".5"/></svg>
              {L==="de"?"Abmelden":"Sign out"}
            </button>
          </div>
        </div>

        {/* ── MAIN ─────────────────────────────────────────────────────── */}
        <div className="ws-main">
          <div className="ws-topbar">
            <div>
              <div className="ws-page-title">{L==="de"?pm.de:pm.en}</div>
              <div className="ws-page-sub">{L==="de"?pm.sub_de:pm.sub_en}</div>
            </div>
            <div className="ws-topbar-right">
              {company&&(
                <div className="ws-company-pill">
                  <div className="ws-company-dot"/>
                  <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:12}}>{company.name}</span>
                </div>
              )}
              {(L==="de"?pm.primary_de:pm.primary_en)&&(
                <button className="btn btn-p btn-sm" onClick={handlePrimary}>
                  {tab==="suppliers"||tab==="dashboard"?<>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5.5" y1="1" x2="5.5" y2="10"/><line x1="1" y1="5.5" x2="10" y2="5.5"/></svg>
                  </>:null}
                  {L==="de"?pm.primary_de:pm.primary_en}
                </button>
              )}
            </div>
          </div>

          <div className="ws-page">
            {tab==="dashboard"  &&<DashboardTab  {...ctx}/>}
            {tab==="suppliers"  &&<SuppliersTab  {...ctx}/>}
            {tab==="actions"    &&<ActionsTab    {...ctx}/>}
            {tab==="complaints" &&<ComplaintsTab {...ctx}/>}
            {tab==="reports"    &&<ReportsTab    {...ctx}/>}
            {tab==="saq"        &&<SaqTab        {...ctx}/>}
            {tab==="kpi"        &&<KpiTab        {...ctx}/>}
            {tab==="evidence"   &&<EvidenceTab   {...ctx}/>}
            {tab==="monitoring" &&<MonitoringTab {...ctx}/>}
            {tab==="ai"         &&<AiTab         {...ctx}/>}
            {tab==="audit"      &&<AuditTab      {...ctx}/>}
            {tab==="legal"      &&<LegalTab      {...ctx}/>}
            {tab==="settings"   &&<SettingsTab   L={L} company={company} apiFn={api} toastFn={toast}/>}
          </div>
        </div>
      </div>
      <div ref={aiEnd}/>
    </div>
  );
}
