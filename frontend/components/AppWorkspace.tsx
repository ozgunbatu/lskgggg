"use client";

/**
 * AppWorkspace — SIFIRDAN YAZILDI v103
 *
 * Mimari kararı:
 * - Tüm state tek bileşende (useState), sıfır hook zinciri
 * - useCallback/useMemo kullanılmıyor (kaynak olmayan karmaşıklık)
 * - Tüm tab bileşenleri orijinal props ile çağrılıyor
 * - API çağrıları doğrudan fonksiyonlarla
 */

import { useEffect, useRef, useState } from "react";
import { clearToken, getToken, getSessionRole, validateSession } from "@/lib/auth";
import { API } from "@/lib/api";
import { COUNTRIES, INDUSTRIES, BAFA_DE, BAFA_EN, calcPortfolioScore, gradeColor, gradeLabel } from "@/lib/workspace-constants";
import { buildPortfolioKpis, buildActionStats } from "@/lib/workspace-metrics";
import { chipRL, sevChip, cStatusChip, aStatusChip, pChip, dueBadge } from "@/lib/workspace-ui";
import { NAV_GROUPS, TABS, TAB_ROUTES } from "@/lib/workspace-config";
import type { TabId } from "@/lib/workspace-types";

// ── Tab components (unchanged originals) ────────────────────────────────────
import DashboardTab    from "./workspace-tabs/DashboardTab";
import SuppliersTab    from "./workspace-tabs/SuppliersTab";
import ActionsTab      from "./workspace-tabs/ActionsTab";
import ComplaintsTab   from "./workspace-tabs/ComplaintsTab";
import ReportsTab      from "./workspace-tabs/ReportsTab";
import SaqTab          from "./workspace-tabs/SaqTab";
import KpiTab          from "./workspace-tabs/KpiTab";
import EvidenceTab     from "./workspace-tabs/EvidenceTab";
import MonitoringTab   from "./workspace-tabs/MonitoringTab";
import AiTab           from "./workspace-tabs/AiTab";
import AuditTab        from "./workspace-tabs/AuditTab";
import SettingsTab     from "./workspace-tabs/SettingsTab";
import LegalTab        from "./workspace-tabs/LegalTab";
import SupplierModal   from "./workspace/SupplierModal";
import CapModal        from "./workspace/CapModal";
import RiskBreakdown   from "./workspace/RiskBreakdown";
import WorkspaceToasts from "./workspace/WorkspaceToasts";
import AuthSplash      from "./workspace/AuthSplash";

// ── Types ────────────────────────────────────────────────────────────────────
type Lang   = "de" | "en";
type Toast  = { id: number; type: "ok" | "err" | "info"; msg: string };

let _tid = 0;

// ── API helper ───────────────────────────────────────────────────────────────
async function apiFetch(path: string, init: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) { clearToken(); window.location.href = "/login"; throw new Error("Session"); }
  if (!res.ok) throw new Error((data as any)?.error || `Error ${res.status}`);
  return data;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function AppWorkspace({ initialTab = "dashboard" }: { initialTab?: TabId }) {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const [mounted, setMounted]         = useState(false);
  const [authOk, setAuthOk]           = useState(false);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const [tab, setTabState]            = useState<TabId>(initialTab);
  const [L, setL]                     = useState<Lang>("de");

  // ── Core data ──────────────────────────────────────────────────────────────
  const [company, setCompany]         = useState<any>(null);
  const [suppliers, setSuppliers]     = useState<any[]>([]);
  const [complaints, setComplaints]   = useState<any[]>([]);
  const [actions, setActions]         = useState<any[]>([]);
  const [saqs, setSaqs]               = useState<any[]>([]);
  const [evidences, setEvidences]     = useState<any[]>([]);
  const [events, setEvents]           = useState<any[]>([]);
  const [screenings, setScreenings]   = useState<any[]>([]);
  const [auditLog, setAuditLog]       = useState<any[]>([]);
  const [kpiLive, setKpiLive]         = useState<any>(null);
  const [kpiTrend, setKpiTrend]       = useState<any[]>([]);

  // ── Loading ────────────────────────────────────────────────────────────────
  const [loading, setLoading]         = useState(false);
  const [auditLd, setAuditLd]         = useState(false);
  const [kpiLd, setKpiLd]             = useState(false);

  // ── Request state (for WorkspaceDataState) ─────────────────────────────────
  const mkDS = () => ({ loading: false, error: null as string | null, lastLoadedAt: null as number | null });
  const [domains, setDomains] = useState({
    company: mkDS(), suppliers: mkDS(), complaints: mkDS(), actions: mkDS(),
    saqs: mkDS(), evidences: mkDS(), insights: mkDS(), kpi: mkDS(), audit: mkDS(),
  });

  // ── Toasts ─────────────────────────────────────────────────────────────────
  const [toasts, setToasts]           = useState<Toast[]>([]);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [showQuickstart, setShowQuickstart] = useState(false);
  const [expanded, setExpanded]       = useState<string | null>(null);
  const [hoverParam, setHoverParam]   = useState<string | null>(null);
  const [supFilter, setSupFilter]     = useState({ risk: "", country: "", search: "" });
  const [auditFilter, setAuditFilter] = useState("");
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});
  const [supAI, setSupAI]             = useState<Record<string, string>>({});
  const [supCAP, setSupCAP]           = useState<Record<string, string>>({});
  const [supLd, setSupLd]             = useState<Record<string, boolean>>({});

  // ── Supplier modal ─────────────────────────────────────────────────────────
  const [showSupModal, setShowSupModal]   = useState(false);
  const [editingSup, setEditingSup]       = useState<any>(null);
  const [sName, setSName]                 = useState("");
  const [sCountry, setSCountry]           = useState("Germany");
  const [sInd, setSInd]                   = useState("services");
  const [sSpend, setSSpend]               = useState("");
  const [sWorkers, setSWorkers]           = useState("");
  const [sAudit, setSAudit]               = useState(false);
  const [sCoc, setSCoc]                   = useState(false);
  const [sCerts, setSCerts]               = useState("0");
  const [sSubSup, setSSubSup]             = useState("0");
  const [sTransp, setSTransp]             = useState("3");
  const [sViolations, setSViolations]     = useState(false);
  const [sNotes, setSNotes]               = useState("");
  const [csv, setCsv]                     = useState("name,country,industry\nTextile Group,Bangladesh,textile\nTechParts,China,electronics");

  // ── CAP modal ──────────────────────────────────────────────────────────────
  const [showCapModal, setShowCapModal]   = useState(false);
  const [capSup, setCapSup]               = useState("");
  const [capTitle, setCapTitle]           = useState("");
  const [capDesc, setCapDesc]             = useState("");
  const [capPara, setCapPara]             = useState("6");
  const [capDue, setCapDue]               = useState("");
  const [capPri, setCapPri]               = useState("high");
  const [capAssign, setCapAssign]         = useState("");

  // ── Complaint form ─────────────────────────────────────────────────────────
  const [cSup, setCSup]                   = useState("");
  const [cCat, setCCat]                   = useState("human_rights");
  const [cSev, setCSev]                   = useState("medium");
  const [cDesc, setCDesc]                 = useState("");
  const [cNotes, setCNotes]               = useState<Record<string, string>>({});
  const [triageRes, setTriageRes]         = useState("");
  const [triageLd, setTriageLd]           = useState(false);

  // ── Reports ────────────────────────────────────────────────────────────────
  const [rYear, setRYear]                 = useState(new Date().getFullYear());
  const [draft, setDraft]                 = useState<Record<string, string> | null>(null);
  const [draftTs, setDraftTs]             = useState("");
  const [genLd, setGenLd]                 = useState("");
  const [aiMsgs, setAiMsgs]              = useState<any[]>([]);
  const [aiInput, setAiInput]             = useState("");
  const [aiLd, setAiLd]                   = useState(false);
  const aiEnd                             = useRef<HTMLDivElement>(null);

  // ── SAQ ────────────────────────────────────────────────────────────────────
  const [saqEmail, setSaqEmail]           = useState("");
  const [saqSup, setSaqSup]               = useState("");
  const [saqDays, setSaqDays]             = useState("30");
  const [saqSending, setSaqSending]       = useState(false);

  // ── Evidence ───────────────────────────────────────────────────────────────
  const [evTitle, setEvTitle]             = useState("");
  const [evType, setEvType]               = useState("audit_report");
  const [evLksg, setEvLksg]               = useState("");
  const [evDesc, setEvDesc]               = useState("");
  const [evSupId, setEvSupId]             = useState("");
  const [evFile, setEvFile]               = useState<File | null>(null);
  const [evUploading, setEvUploading]     = useState(false);
  const fileRef                           = useRef<HTMLInputElement>(null);

  // ── Approvals (simple) ─────────────────────────────────────────────────────
  const [approvalRows, setApprovalRows]   = useState<any[]>([]);
  const [approvalNotes, setApprovalNotes] = useState("");

  // ══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════════════════
  const toast = (type: "ok" | "err" | "info", msg: string) => {
    if (msg === "rate_limited" || msg.includes("429")) return;
    const id = ++_tid;
    setToasts(x => {
      if (x.some(t => t.msg === msg)) return x;
      return [...x.slice(-2), { id, type, msg }];
    });
    setTimeout(() => setToasts(x => x.filter(t => t.id !== id)), 4500);
  };

  const setTab = (next: TabId) => {
    setTabState(next);
    if (typeof window !== "undefined") window.history.replaceState(null, "", TAB_ROUTES[next]);
  };

  const setDomain = (key: string, patch: Partial<typeof domains.company>) =>
    setDomains(d => ({ ...d, [key]: { ...d[key as keyof typeof d], ...patch } }));

  // ══════════════════════════════════════════════════════════════════════════
  // DATA LOADING
  // ══════════════════════════════════════════════════════════════════════════
  const loadCompany = async () => {
    setDomain("company", { loading: true, error: null });
    try {
      const r = await apiFetch("/companies/me");
      setCompany(r || null);
      setDomain("company", { loading: false, lastLoadedAt: Date.now() });
    } catch (e: any) { setDomain("company", { loading: false, error: e.message }); }
  };

  const loadSuppliers = async () => {
    setDomain("suppliers", { loading: true, error: null });
    try {
      const r = await apiFetch("/suppliers");
      setSuppliers(Array.isArray(r) ? r : r?.items ?? []);
      setDomain("suppliers", { loading: false, lastLoadedAt: Date.now() });
    } catch (e: any) { setDomain("suppliers", { loading: false, error: e.message }); }
  };

  const loadComplaints = async () => {
    setDomain("complaints", { loading: true, error: null });
    try {
      const r = await apiFetch("/complaints");
      setComplaints(Array.isArray(r) ? r : []);
      setDomain("complaints", { loading: false, lastLoadedAt: Date.now() });
    } catch (e: any) { setDomain("complaints", { loading: false, error: e.message }); }
  };

  const loadActions = async () => {
    setDomain("actions", { loading: true, error: null });
    try {
      const r = await apiFetch("/actions");
      setActions(Array.isArray(r) ? r : []);
      setDomain("actions", { loading: false, lastLoadedAt: Date.now() });
    } catch (e: any) { setDomain("actions", { loading: false, error: e.message }); }
  };

  const loadSaqData = async () => {
    setDomain("saqs", { loading: true, error: null });
    try {
      const r = await apiFetch("/saq");
      setSaqs(Array.isArray(r) ? r : []);
      setDomain("saqs", { loading: false, lastLoadedAt: Date.now() });
    } catch (e: any) { setDomain("saqs", { loading: false, error: e.message }); }
  };

  const loadEvidenceData = async () => {
    setDomain("evidences", { loading: true, error: null });
    try {
      const r = await apiFetch("/evidence");
      setEvidences(Array.isArray(r) ? r : r?.items ?? []);
      setDomain("evidences", { loading: false, lastLoadedAt: Date.now() });
    } catch (e: any) { setDomain("evidences", { loading: false, error: e.message }); }
  };

  const loadMonitoringData = async () => {
    setDomain("insights", { loading: true, error: null });
    try {
      const [evs, scrs] = await Promise.all([
        apiFetch("/monitoring/events"),
        apiFetch("/monitoring/screenings"),
      ]);
      setEvents(Array.isArray(evs) ? evs : []);
      setScreenings(Array.isArray(scrs) ? scrs : []);
      setDomain("insights", { loading: false, lastLoadedAt: Date.now() });
    } catch (e: any) { setDomain("insights", { loading: false, error: e.message }); }
  };

  const loadKpiData = async () => {
    setKpiLd(true);
    try {
      const [live, trend] = await Promise.all([apiFetch("/kpi/live"), apiFetch("/kpi/trend")]);
      setKpiLive(live);
      setKpiTrend(Array.isArray(trend) ? trend : []);
    } catch {}
    finally { setKpiLd(false); }
  };

  const loadAuditLog = async (entityType?: string) => {
    setAuditLd(true);
    try {
      const url = entityType ? `/audit?entity_type=${entityType}` : "/audit";
      const r = await apiFetch(url);
      setAuditLog(Array.isArray(r) ? r : r?.rows ?? []);
    } catch {}
    finally { setAuditLd(false); }
  };

  const loadApprovals = async () => {
    try {
      const r = await apiFetch("/reports/approvals");
      setApprovalRows(Array.isArray(r) ? r : []);
    } catch {}
  };

  const loadDraft = async () => {
    try {
      const r = await apiFetch(`/reports/bafa/${rYear}`);
      if (r?.draft) { setDraft(r.draft); setDraftTs(r.updated_at || ""); }
    } catch {}
  };

  const loadCoreData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCompany(), loadSuppliers(), loadComplaints(),
        loadActions(), loadSaqData(), loadEvidenceData(),
      ]);
    } catch (e: any) {
      if (!String(e?.message || "").includes("Session")) toast("err", e?.message || "Load failed");
    } finally { setLoading(false); }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // MUTATIONS
  // ══════════════════════════════════════════════════════════════════════════
  const saveSupplier = async () => {
    if (!sName.trim()) return toast("err", L === "de" ? "Bitte Namen eingeben" : "Please enter a name");
    setLoading(true);
    const body = {
      name: sName, country: sCountry, industry: sInd,
      annual_spend_eur: parseFloat(sSpend) || null,
      workers: parseInt(sWorkers) || null,
      has_audit: sAudit, has_code_of_conduct: sCoc,
      certification_count: parseInt(sCerts) || 0,
      sub_supplier_count: parseInt(sSubSup) || 0,
      transparency_score: parseInt(sTransp) || 3,
      previous_violations: sViolations, notes: sNotes,
    };
    try {
      if (editingSup) {
        await apiFetch(`/suppliers/${editingSup.id}`, { method: "PUT", body: JSON.stringify(body) });
        toast("ok", L === "de" ? "Lieferant aktualisiert" : "Supplier updated");
      } else {
        await apiFetch("/suppliers", { method: "POST", body: JSON.stringify(body) });
        toast("ok", L === "de" ? "Lieferant angelegt" : "Supplier created");
      }
      setShowSupModal(false);
      await Promise.all([loadSuppliers(), loadKpiData()]);
    } catch (e: any) { toast("err", e.message); }
    finally { setLoading(false); }
  };

  const delSupplier = async (id: string, name: string) => {
    if (!confirm(L === "de" ? `"${name}" wirklich löschen?` : `Delete "${name}"?`)) return;
    try {
      await apiFetch(`/suppliers/${id}`, { method: "DELETE" });
      toast("ok", L === "de" ? "Lieferant gelöscht" : "Supplier deleted");
      await loadSuppliers();
    } catch (e: any) { toast("err", e.message); }
  };

  const recalc = async () => {
    setLoading(true);
    try {
      await apiFetch("/suppliers/recalc", { method: "POST" });
      toast("ok", L === "de" ? "Risiko neu berechnet" : "Risk recalculated");
      await loadSuppliers();
    } catch (e: any) { toast("err", e.message); }
    finally { setLoading(false); }
  };

  const importCsv = async () => {
    if (!csv.trim()) return;
    setLoading(true);
    try {
      const lines = csv.trim().split("\n");
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const rows = lines.slice(1).map(l => {
        const vals = l.split(",").map(v => v.trim());
        const obj: any = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
        return obj;
      }).filter(r => r.name);
      await apiFetch("/auto/import", { method: "POST", body: JSON.stringify({ rows }) });
      toast("ok", L === "de" ? `${rows.length} Lieferanten importiert` : `${rows.length} suppliers imported`);
      await loadSuppliers();
    } catch (e: any) { toast("err", e.message); }
    finally { setLoading(false); }
  };

  const submitComplaint = async () => {
    if (!cDesc.trim()) return toast("err", L === "de" ? "Beschreibung erforderlich" : "Description required");
    try {
      await apiFetch("/complaints", { method: "POST", body: JSON.stringify({ supplierId: cSup || null, category: cCat, description: cDesc, severity: cSev }) });
      toast("ok", L === "de" ? "Beschwerde eingereicht" : "Complaint submitted");
      setCDesc(""); setCSup(""); setCCat("human_rights"); setCSev("medium");
      await loadComplaints();
    } catch (e: any) { toast("err", e.message); }
  };

  const triageComplaint = async (id: string) => {
    setTriageLd(true);
    try {
      const r = await apiFetch(`/complaints/${id}/triage`, { method: "POST" });
      setTriageRes(r?.recommendation || "");
      toast("ok", L === "de" ? "KI-Triage abgeschlossen" : "AI triage completed");
    } catch (e: any) { toast("err", e.message); }
    finally { setTriageLd(false); }
  };

  const updateComplaintStatus = async (id: string, status: string) => {
    try {
      await apiFetch(`/complaints/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
      setComplaints(cs => cs.map(c => c.id === id ? { ...c, status } : c));
    } catch (e: any) { toast("err", e.message); }
  };

  const saveComplaintNote = async (id: string) => {
    const note = cNotes[id];
    if (!note?.trim()) return;
    try {
      await apiFetch(`/complaints/${id}/notes`, { method: "PUT", body: JSON.stringify({ notes: note }) });
      toast("ok", L === "de" ? "Notiz gespeichert" : "Note saved");
    } catch (e: any) { toast("err", e.message); }
  };

  const createCap = async () => {
    if (!capTitle.trim()) return toast("err", L === "de" ? "Titel erforderlich" : "Title required");
    try {
      await apiFetch("/actions", { method: "POST", body: JSON.stringify({
        title: capTitle, description: capDesc, supplierId: capSup || null,
        lksgParagraph: capPara, dueDate: capDue || null, priority: capPri, assignedTo: capAssign || null,
      }) });
      toast("ok", L === "de" ? "CAP angelegt" : "CAP created");
      setShowCapModal(false); setCapTitle(""); setCapDesc(""); setCapSup(""); setCapAssign("");
      await loadActions();
    } catch (e: any) { toast("err", e.message); }
  };

  const updateActionStatus = async (id: string, status: string) => {
    try {
      await apiFetch(`/actions/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
      setActions(as => as.map(a => a.id === id ? { ...a, status } : a));
    } catch (e: any) { toast("err", e.message); }
  };

  const saveActionNote = async (id: string) => {
    const note = actionNotes[id];
    if (!note?.trim()) return;
    try {
      await apiFetch(`/actions/${id}/notes`, { method: "PUT", body: JSON.stringify({ notes: note }) });
      toast("ok", L === "de" ? "Notiz gespeichert" : "Note saved");
    } catch (e: any) { toast("err", e.message); }
  };

  const deleteAction = async (id: string, title: string) => {
    if (!confirm(L === "de" ? `"${title}" löschen?` : `Delete "${title}"?`)) return;
    try {
      await apiFetch(`/actions/${id}`, { method: "DELETE" });
      toast("ok", L === "de" ? "Gelöscht" : "Deleted");
      setActions(as => as.filter(a => a.id !== id));
    } catch (e: any) { toast("err", e.message); }
  };

  const saveDraft = async () => {
    if (!draft) return;
    try {
      await apiFetch(`/reports/bafa/${rYear}`, { method: "PUT", body: JSON.stringify({ draft }) });
      setDraftTs(new Date().toISOString());
      toast("ok", L === "de" ? "Entwurf gespeichert" : "Draft saved");
    } catch (e: any) { toast("err", e.message); }
  };

  const genSection = async (key: string) => {
    setGenLd(key);
    try {
      const r = await apiFetch(`/reports/bafa/${rYear}/generate/${key}`, { method: "POST" });
      if (r?.text) setDraft(d => ({ ...(d || {}), [key]: r.text }));
    } catch (e: any) { toast("err", e.message); }
    finally { setGenLd(""); }
  };

  const sendAi = async (text?: string) => {
    const msg = text || aiInput;
    if (!msg.trim() || aiLd) return;
    setAiMsgs(m => [...m, { role: "user", content: msg }]);
    setAiInput(""); setAiLd(true);
    try {
      const r = await apiFetch("/ai/chat", { method: "POST", body: JSON.stringify({ message: msg }) });
      setAiMsgs(m => [...m, { role: "assistant", content: r?.response || r?.text || "..." }]);
    } catch (e: any) {
      setAiMsgs(m => [...m, { role: "assistant", content: "Fehler: " + e.message }]);
    } finally { setAiLd(false); }
  };

  const getSupAI = async (sup: any) => {
    setSupLd(l => ({ ...l, [sup.id]: true }));
    try {
      const r = await apiFetch("/ai/supplier-brief", { method: "POST", body: JSON.stringify({ supplierId: sup.id }) });
      setSupAI(a => ({ ...a, [sup.id]: r?.brief || r?.text || "" }));
    } catch (e: any) { toast("err", e.message); }
    finally { setSupLd(l => ({ ...l, [sup.id]: false })); }
  };

  const getSupCAP = async (sup: any) => {
    setSupLd(l => ({ ...l, [sup.id]: true }));
    try {
      const r = await apiFetch("/ai/cap-suggestion", { method: "POST", body: JSON.stringify({ supplierId: sup.id }) });
      setSupCAP(a => ({ ...a, [sup.id]: r?.suggestion || r?.text || "" }));
    } catch (e: any) { toast("err", e.message); }
    finally { setSupLd(l => ({ ...l, [sup.id]: false })); }
  };

  const sendSaq = async () => {
    if (!saqEmail || !saqSup) return toast("err", L === "de" ? "E-Mail und Lieferant erforderlich" : "Email and supplier required");
    setSaqSending(true);
    try {
      await apiFetch("/saq", { method: "POST", body: JSON.stringify({ supplierId: saqSup, email: saqEmail, days: parseInt(saqDays) || 30 }) });
      toast("ok", L === "de" ? "SAQ gesendet" : "SAQ sent");
      setSaqEmail(""); setSaqSup("");
      await loadSaqData();
    } catch (e: any) { toast("err", e.message); }
    finally { setSaqSending(false); }
  };

  const deleteSaq = async (id: string) => {
    try {
      await apiFetch(`/saq/${id}`, { method: "DELETE" });
      setSaqs(s => s.filter(q => q.id !== id));
    } catch (e: any) { toast("err", e.message); }
  };

  const loadKpi = async () => {
    await loadKpiData();
  };

  const saveKpiSnapshot = async () => {
    try {
      await apiFetch("/kpi/snapshot", { method: "POST" });
      toast("ok", L === "de" ? "Snapshot gespeichert" : "Snapshot saved");
    } catch (e: any) { toast("err", e.message); }
  };

  const uploadEvidence = async () => {
    if (!evTitle.trim()) return toast("err", L === "de" ? "Titel erforderlich" : "Title required");
    setEvUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", evTitle);
      formData.append("type", evType);
      if (evLksg) formData.append("lksg_ref", evLksg);
      if (evDesc) formData.append("description", evDesc);
      if (evSupId) formData.append("supplier_id", evSupId);
      if (evFile) formData.append("file", evFile);
      await apiFetch("/evidence", { method: "POST", body: formData });
      toast("ok", L === "de" ? "Nachweis hochgeladen" : "Evidence uploaded");
      setEvTitle(""); setEvDesc(""); setEvLksg(""); setEvFile(null); setEvSupId("");
      if (fileRef.current) fileRef.current.value = "";
      await loadEvidenceData();
    } catch (e: any) { toast("err", e.message); }
    finally { setEvUploading(false); }
  };

  const deleteEvidence = async (id: string) => {
    try {
      await apiFetch(`/evidence/${id}`, { method: "DELETE" });
      setEvidences(e => e.filter(ev => ev.id !== id));
    } catch (e: any) { toast("err", e.message); }
  };

  const exportCSV = (endpoint: string, filename: string) => {
    const token = getToken();
    const a = document.createElement("a");
    a.href = `${API}${endpoint}?token=${encodeURIComponent(token)}`;
    a.download = filename;
    a.click();
  };

  const requestApproval = async (year: number) => {
    try {
      await apiFetch(`/reports/bafa/${year}/request-approval`, { method: "POST", body: JSON.stringify({ notes: approvalNotes }) });
      toast("ok", L === "de" ? "Freigabe angefragt" : "Approval requested");
      await loadApprovals();
    } catch (e: any) { toast("err", e.message); }
  };

  const reviewApproval = async (year: number, decision: "approved" | "rejected") => {
    try {
      await apiFetch(`/reports/bafa/${year}/approve`, { method: "POST", body: JSON.stringify({ decision, notes: approvalNotes }) });
      toast("ok", decision === "approved" ? (L === "de" ? "Freigegeben" : "Approved") : (L === "de" ? "Abgelehnt" : "Rejected"));
      await loadApprovals();
    } catch (e: any) { toast("err", e.message); }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // MODAL HELPERS
  // ══════════════════════════════════════════════════════════════════════════
  const openAddSupModal = () => {
    setEditingSup(null); setSName(""); setSCountry("Germany"); setSInd("services");
    setSSpend(""); setSWorkers(""); setSAudit(false); setSCoc(false);
    setSCerts("0"); setSSubSup("0"); setSTransp("3"); setSViolations(false); setSNotes("");
    setShowSupModal(true);
  };

  const openEditSupModal = (s: any) => {
    setEditingSup(s); setSName(s.name); setSCountry(s.country); setSInd(s.industry);
    setSSpend(String(s.annual_spend_eur || "")); setSWorkers(String(s.workers || ""));
    setSAudit(!!s.has_audit); setSCoc(!!s.has_code_of_conduct);
    setSCerts(String(s.certification_count || 0)); setSSubSup(String(s.sub_supplier_count || 0));
    setSTransp(String(s.transparency_score || 3)); setSViolations(!!s.previous_violations);
    setSNotes(s.notes || ""); setShowSupModal(true);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // DERIVED DATA
  // ══════════════════════════════════════════════════════════════════════════
  const score    = calcPortfolioScore(suppliers, actions, complaints, saqs);
  const kpis     = buildPortfolioKpis(suppliers);
  const actionStats = buildActionStats(actions);
  const sc       = score.score;
  const sg       = score.grade;
  const scCol    = gradeColor(sg);
  const BF       = L === "de" ? BAFA_DE : BAFA_EN;

  const approvalMeta = {
    rows: approvalRows,
    pending: approvalRows.filter(r => r.status === "pending").length,
    approved: approvalRows.filter(r => r.status === "approved").length,
    rejected: approvalRows.filter(r => r.status === "rejected").length,
    lastStatus: approvalRows[0]?.status || "none",
    loading: false,
    currentRole: getSessionRole(),
    canRequest: getSessionRole() !== "viewer",
    canApprove: ["approver", "admin"].includes(getSessionRole()),
    draftLocked: false,
    notes: approvalNotes,
    setNotes: setApprovalNotes,
    loadApprovals,
    requestApproval,
    reviewApproval,
    oldestPendingDays: 0,
    pendingWithinSla: 0,
    slaBreaches: 0,
    pendingAging: { fresh: 0, warning: 0, urgent: 0 },
  };

  const requestState = { domains };
  const reloads = {
    reloadCoreData: loadCoreData,
    reloadSuppliersDomain: async () => { await Promise.all([loadCompany(), loadSuppliers()]); },
    reloadComplaintsDomain: async () => { await Promise.all([loadComplaints(), loadActions()]); },
    reloadReportsDomain: async () => { await Promise.all([loadSaqData(), loadEvidenceData()]); },
    reloadComplianceCore: loadCoreData,
    reloadInsights: loadMonitoringData,
    reloadMonitoringData: loadMonitoringData,
  };

  const quickstartSteps = [
    { id: "company", tab: "settings" as TabId, done: !!company?.name, title: L === "de" ? "Unternehmensprofil vervollständigen" : "Complete company profile", copy: L === "de" ? "Pflichtfelder für BAFA und Beschwerdeverfahren." : "Required fields for BAFA and complaints." },
    { id: "suppliers", tab: "suppliers" as TabId, done: suppliers.length > 0, title: L === "de" ? "Lieferanten importieren" : "Import suppliers", copy: L === "de" ? "CSV hochladen oder manuell anlegen." : "Upload CSV or add manually." },
    { id: "risk", tab: "suppliers" as TabId, done: suppliers.some(s => (s.risk_score || 0) > 0 && s.risk_level !== "unknown"), title: L === "de" ? "Risikoanalyse starten" : "Run risk analysis", copy: L === "de" ? "Land, Branche und Score prüfen." : "Check country, industry and score." },
    { id: "complaints", tab: "complaints" as TabId, done: !!company?.slug, title: L === "de" ? "Beschwerdekanal aktivieren" : "Activate complaint channel", copy: L === "de" ? "Externen Link teilen." : "Share the external link." },
    { id: "report", tab: "reports" as TabId, done: !!draftTs || !!draft, title: L === "de" ? "Ersten Bericht erzeugen" : "Generate first report", copy: L === "de" ? "Automatischen Entwurf laden." : "Load the automated draft." },
  ];
  const quickstartDone = quickstartSteps.filter(x => x.done).length;

  const workspaceMeta = ({
    dashboard:  { title: L === "de" ? "Steuerzentrale" : "Control center", sub: L === "de" ? "Prioritäten, Portfolio-Risiko und BAFA-Bereitschaft." : "Priorities, portfolio risk, and BAFA readiness." },
    suppliers:  { title: L === "de" ? "Lieferanten & Risiko" : "Suppliers & risk", sub: L === "de" ? "Register, Re-Scoring und Detailanalyse." : "Register, re-scoring, and drill-down analysis." },
    actions:    { title: L === "de" ? "Aktionspläne" : "Action plans", sub: L === "de" ? "Offene Maßnahmen, Fälligkeiten und Notizen." : "Open measures, due dates, and notes." },
    complaints: { title: L === "de" ? "Beschwerdeverfahren" : "Complaints", sub: L === "de" ? "Interne Fälle und externer Meldekanal." : "Internal cases and external reporting channel." },
    saq:        { title: "SAQ", sub: L === "de" ? "Fragebögen versenden und verfolgen." : "Send questionnaires and track responses." },
    kpi:        { title: L === "de" ? "Wirksamkeit" : "Effectiveness", sub: L === "de" ? "Live-KPIs für Reifegrad und Abdeckung." : "Live KPIs for maturity and coverage." },
    reports:    { title: L === "de" ? "BAFA-Bericht" : "BAFA Report", sub: L === "de" ? "Entwurf, Export und Einreichungslogik." : "Draft, export, and submission logic." },
    evidence:   { title: L === "de" ? "Nachweise" : "Evidence", sub: L === "de" ? "Dokumente und Compliance-Dokumentation." : "Documents and compliance documentation." },
    monitoring: { title: "Monitoring", sub: L === "de" ? "Events, Screening und externe Risikosignale." : "Events, screening, and external risk signals." },
    ai:         { title: L === "de" ? "KI-Assistent" : "AI Assistant", sub: L === "de" ? "Zusammenfassungen und Formulierungshilfe." : "Summaries and drafting assistance." },
    audit:      { title: L === "de" ? "Audit Trail" : "Audit Trail", sub: L === "de" ? "Unveränderliche Historie für BAFA-Prüfungen." : "Immutable history for BAFA audits." },
    legal:      { title: L === "de" ? "Rechtsassistent" : "Legal Assistant", sub: L === "de" ? "Vorlagen, Rechtsfragen und Vertragscheck." : "Templates, legal questions, and contract review." },
    settings:   { title: L === "de" ? "Einstellungen" : "Settings", sub: L === "de" ? "Pflichtfelder, BAFA-Fristen und Datenschutz." : "Required fields, BAFA deadlines, and privacy." },
  } as any)[tab] || { title: tab, sub: "" };

  const workspaceAssist = { cards: [] as any[] };

  // ── RiskBreakdown component ────────────────────────────────────────────────
  const BoundRiskBreakdown = ({ sup, compact = false }: { sup: any; compact?: boolean }) => (
    <RiskBreakdown sup={sup} compact={compact} L={L} hoverParam={hoverParam} setHoverParam={setHoverParam} />
  );

  // ── Chip helpers (module-level fns called with current L) ─────────────────
  const bSevChip     = (s: string) => sevChip(s);
  const bCStatusChip = (s: string) => cStatusChip(s, L);
  const bAStatusChip = (s: string) => aStatusChip(s, L);
  const bPChip       = (s: string) => pChip(s);
  const bDueBadge    = (d?: string | null) => dueBadge(d, L);

  // ══════════════════════════════════════════════════════════════════════════
  // EFFECTS
  // ══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    setMounted(true);
    const storedLang = typeof window !== "undefined" ? (localStorage.getItem("lang") as Lang || "de") : "de";
    setL(storedLang);
    const hidden = typeof window !== "undefined" && localStorage.getItem("lksg_quickstart_hidden") === "1";
    setShowQuickstart(!hidden);

    (async () => {
      const status = await validateSession();
      if (!status.ok) { clearToken(); window.location.href = "/login"; return; }
      setAuthOk(true);
    })();
  }, []); // runs once

  useEffect(() => {
    if (!authOk) return;
    loadCoreData();
    loadApprovals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authOk]); // runs once when auth confirmed

  useEffect(() => {
    if (!authOk) return;
    if (tab === "monitoring") loadMonitoringData();
    if (tab === "kpi") loadKpiData();
    if (tab === "audit") loadAuditLog();
    if (tab === "reports" && !draft) loadDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, authOk]); // tab change loads data

  useEffect(() => {
    aiEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMsgs]);

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER GUARDS
  // ══════════════════════════════════════════════════════════════════════════
  if (!mounted) return null;
  if (!authOk) return <AuthSplash />;

  // ══════════════════════════════════════════════════════════════════════════
  // PROPS OBJECT (shared across all tabs)
  // ══════════════════════════════════════════════════════════════════════════
  const ctx: any = {
    L, company, suppliers, complaints, actions, saqs, evidences,
    events, screenings, auditLog, kpiLive, kpiTrend,
    loading, auditLd, kpiLd, requestState, reloads,
    score, kpis, actionStats, workspaceAssist, quickstartSteps, quickstartDone,
    approvalMeta, BF,
    tab, setTab,
    expanded, setExpanded,
    hoverParam, setHoverParam,
    supFilter, setSupFilter,
    auditFilter, setAuditFilter,
    actionNotes, setActionNotes,
    supAI, supCAP, supLd, setSupAI, setSupCAP, setSupLd,
    showCapModal, setShowCapModal, capPara, setCapPara,
    showQuickstart,
    // Complaint form
    cSup, setCSup, cCat, setCCat, cSev, setCSev, cDesc, setCDesc,
    cNotes, setCNotes, triageRes, setTriageRes, triageLd, setTriageLd,
    // SAQ
    saqEmail, setSaqEmail, saqSup, setSaqSup, saqDays, setSaqDays, saqSending,
    // Reports
    rYear, setRYear, draft, setDraft, draftTs, genLd,
    aiMsgs, setAiMsgs, aiInput, setAiInput, aiLd,
    // Evidence
    evTitle, setEvTitle, evType, setEvType, evLksg, setEvLksg,
    evDesc, setEvDesc, evSupId, setEvSupId, evFile, setEvFile, evUploading,
    fileRef,
    // Chip helpers
    chipRL, sevChip: bSevChip, cStatusChip: bCStatusChip,
    aStatusChip: bAStatusChip, pChip: bPChip, dueBadge: bDueBadge,
    RiskBreakdown: BoundRiskBreakdown,
    // Mutations
    openAddSupModal, openEditSupModal, delSupplier, recalc, importCsv,
    saveSupplier,
    submitComplaint, triageComplaint, updateComplaintStatus, saveComplaintNote,
    createCap, updateActionStatus, saveActionNote, deleteAction,
    loadDraft, saveDraft, genSection, getSupAI, getSupCAP, sendAi,
    loadAuditLog, exportCSV, sendSaq, deleteSaq, loadKpi, saveKpiSnapshot,
    uploadEvidence, deleteEvidence,
    toast,
    // For Settings/Legal
    apiFn: apiFetch, toastFn: toast,
  };

  const openC = complaints.filter(c => c.status === "open").length;

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="workspace-root">
      <WorkspaceToasts toasts={toasts} />

      <SupplierModal
        open={showSupModal} L={L} editingSup={editingSup} loading={loading}
        sName={sName} setSName={setSName} sCountry={sCountry} setSCountry={setSCountry}
        sInd={sInd} setSInd={setSInd} sSpend={sSpend} setSSpend={setSSpend}
        sWorkers={sWorkers} setSWorkers={setSWorkers} sCerts={sCerts} setSCerts={setSCerts}
        sSubSup={sSubSup} setSSubSup={setSSubSup} sTransp={sTransp} setSTransp={setSTransp}
        sAudit={sAudit} setSAudit={setSAudit} sCoc={sCoc} setSCoc={setSCoc}
        sViolations={sViolations} setSViolations={setSViolations}
        sNotes={sNotes} setSNotes={setSNotes}
        countries={COUNTRIES} industries={INDUSTRIES}
        onClose={() => setShowSupModal(false)} onSave={saveSupplier}
      />

      <CapModal
        open={showCapModal} L={L}
        capSup={capSup} setCapSup={setCapSup} capTitle={capTitle} setCapTitle={setCapTitle}
        capDesc={capDesc} setCapDesc={setCapDesc} capPara={capPara} setCapPara={setCapPara}
        capDue={capDue} setCapDue={setCapDue} capPri={capPri} setCapPri={setCapPri}
        capAssign={capAssign} setCapAssign={setCapAssign}
        suppliers={suppliers} onClose={() => setShowCapModal(false)} onCreate={createCap}
      />

      {/* ── NAVIGATION ──────────────────────────────────────────────────── */}
      <nav className="nav">
        <div className="nav-logo">
          <div className="nav-logo-mark">LC</div>
          <div className="nav-logo-text">LkSG<span>Compass</span></div>
        </div>
        <div className="nav-scroll">
          {NAV_GROUPS.map(group => (
            <div key={group.key} className="nav-group">
              <span className="nav-group-title">{L === "de" ? group.de : group.en}</span>
              {group.tabs.map(id => {
                const item = TABS.find(t => t.id === id)!;
                const badge = id === "actions" ? actionStats.overdue : id === "complaints" ? openC : id === "reports" ? approvalMeta.pending : 0;
                return (
                  <button key={id} className={"nav-tab" + (tab === id ? " on" : "")} onClick={() => setTab(id)}>
                    {L === "de" ? item.de : item.en}
                    {badge > 0 && <span className="nav-badge">{badge}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="nav-right">
          {company && (
            <div className="nav-cmp">
              <span style={{ fontSize: 9, color: "var(--g-lo)" }}>◉</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{company.name}</span>
            </div>
          )}
          <div className="lang-grp">
            <button className={"lb" + (L === "de" ? " on" : "")} onClick={() => { setL("de"); localStorage.setItem("lang", "de"); }}>DE</button>
            <button className={"lb" + (L === "en" ? " on" : "")} onClick={() => { setL("en"); localStorage.setItem("lang", "en"); }}>EN</button>
          </div>
          <button className="nav-out" onClick={() => { clearToken(); window.location.href = "/"; }}>
            {L === "de" ? "Abmelden" : "Sign out"}
          </button>
        </div>
      </nav>

      {/* ── PAGE ────────────────────────────────────────────────────────── */}
      <div className="pg">
        {/* Header bar */}
        <div className="workspace-bar">
          <div className="workspace-meta">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <span className="workspace-kicker">Enterprise Compliance</span>
              {({dashboard:"§3–§10",suppliers:"§5–§6",actions:"§7",complaints:"§8",saq:"§5",kpi:"§9",reports:"§10",evidence:"§10",monitoring:"§5",ai:"✦",audit:"§10",legal:"§6",settings:""}as any)[tab] && (
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, fontWeight:700, color:"var(--g-lo)", background:"var(--g-5)", border:"1px solid var(--g-20)", borderRadius:20, padding:"1px 7px" }}>
                  {({dashboard:"§3–§10",suppliers:"§5–§6",actions:"§7",complaints:"§8",saq:"§5",kpi:"§9",reports:"§10",evidence:"§10",monitoring:"§5",ai:"✦",audit:"§10",legal:"§6",settings:""}as any)[tab]}
                </span>
              )}
            </div>
            <div className="workspace-title">{workspaceMeta.title}</div>
            <div className="workspace-sub">{workspaceMeta.sub}</div>
          </div>
          <div className="workspace-actions">
            {tab !== "suppliers" && <button className="btn btn-g btn-sm" onClick={() => setTab("suppliers")}>{L === "de" ? "Lieferanten" : "Suppliers"}</button>}
            {tab !== "reports" && <button className="btn btn-p btn-sm" onClick={() => setTab("reports")}>{L === "de" ? "BAFA-Bericht" : "Report"} →</button>}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ animation: "up .2s cubic-bezier(.16,1,.3,1)" }}>
          {tab === "dashboard"  && <DashboardTab  {...ctx} dismissQuickstart={() => { setShowQuickstart(false); localStorage.setItem("lksg_quickstart_hidden","1"); }} workspaceFocus={[]} gradeLabel={gradeLabel} scCol={scCol} sc={sc} sg={sg} COUNTRIES={COUNTRIES} INDUSTRIES={INDUSTRIES} />}
          {tab === "suppliers"  && <SuppliersTab  {...ctx} />}
          {tab === "actions"    && <ActionsTab    {...ctx} />}
          {tab === "complaints" && <ComplaintsTab {...ctx} />}
          {tab === "reports"    && <ReportsTab    {...ctx} />}
          {tab === "saq"        && <SaqTab        {...ctx} />}
          {tab === "kpi"        && <KpiTab        {...ctx} />}
          {tab === "evidence"   && <EvidenceTab   {...ctx} />}
          {tab === "monitoring" && <MonitoringTab {...ctx} />}
          {tab === "ai"         && <AiTab         {...ctx} />}
          {tab === "audit"      && <AuditTab      {...ctx} />}
          {tab === "legal"      && <LegalTab      {...ctx} />}
          {tab === "settings"   && <SettingsTab   L={L} company={company} apiFn={apiFetch} toastFn={toast} />}
        </div>
      </div>

      {/* AI scroll anchor */}
      <div ref={aiEnd} />
    </div>
  );
}
