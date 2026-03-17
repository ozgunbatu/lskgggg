"use client";

import { useCallback, useRef } from "react";
import { downloadWithAuth } from "@/lib/api";
import { snapshotValue, withRollback } from "@/lib/optimistic";
import type { Action, Complaint, Evidence, SAQ, Supplier } from "@/lib/workspace-types";

type Args = {
  L: "de" | "en";
  api: (url: string, options?: RequestInit) => Promise<any>;
  toast: (type: "ok" | "err" | "info", msg: string) => void;
  getToken: () => string | null;
  setLoading: (value: boolean) => void;
  loadCoreData: () => Promise<void>;
  loadSaqData: (opts?: { force?: boolean }) => Promise<any>;
  loadKpiData: (opts?: { force?: boolean }) => Promise<any>;
  loadAuditData: (entityType?: string) => Promise<any>;
  reloadSuppliersDomain: () => Promise<void>;
  reloadComplaintsDomain: () => Promise<void>;
  reloadReportsDomain: () => Promise<void>;
  reloadComplianceCore: () => Promise<void>;
  reloadInsights: () => Promise<void>;
  setTab: (tab: any) => void;
  editingSup: Supplier | null;
  supplierForm: {
    sName: string; sCountry: string; sInd: string; sSpend: string; sWorkers: string;
    sAudit: boolean; sCoc: boolean; sCerts: string; sSubSup: string; sTransp: string; sViolations: boolean; sNotes: string;
  };
  setShowSupModal: (open: boolean) => void;
  setSuppliers: (fn: Supplier[] | ((prev: Supplier[]) => Supplier[])) => void;
  csv: string;
  complaintForm: { cSup: string; cCat: string; cSev: string; cDesc: string; };
  setComplaints: (fn: Complaint[] | ((prev: Complaint[]) => Complaint[])) => void;
  setActions: (fn: Action[] | ((prev: Action[]) => Action[])) => void;
  complaintNotes: Record<string, string>;
  actionNotes: Record<string, string>;
  setCDesc: (value: string) => void;
  setTriageLd: (value: boolean) => void;
  setTriageRes: (value: string) => void;
  capForm: { capSup: string; capTitle: string; capDesc: string; capPara: string; capDue: string; capPri: string; capAssign: string; };
  setShowCapModal: (open: boolean) => void;
  setCapTitle: (value: string) => void;
  setCapDesc: (value: string) => void;
  setCapAssign: (value: string) => void;
  reports: { rYear: number; draft: Record<string, string> | null; aiMsgs: { role: "user" | "assistant"; content: string }[]; aiInput: string; aiLd: boolean; };
  setDraft: (fn: any) => void;
  setDraftTs: (value: string) => void;
  setGenLd: (value: string) => void;
  setAiInput: (value: string) => void;
  setAiMsgs: (value: any) => void;
  setAiLd: (value: boolean) => void;
  setSupLd: (fn: any) => void;
  setSupAI: (fn: any) => void;
  setSupCAP: (fn: any) => void;
  setSaqs: (fn: SAQ[] | ((prev: SAQ[]) => SAQ[])) => void;
  saqRows: SAQ[];
  saq: { saqEmail: string; saqSup: string; saqDays: string; };
  setSaqEmail: (value: string) => void;
  setSaqSup: (value: string) => void;
  setSaqSending: (value: boolean) => void;
  setKpiLd: (value: boolean) => void;
  evidence: { evTitle: string; evType: string; evLksg: string; evDesc: string; evSupId: string; evFile: File | null; };
  setEvUploading: (value: boolean) => void;
  setEvTitle: (value: string) => void;
  setEvDesc: (value: string) => void;
  setEvFile: (value: File | null) => void;
  setEvidences: (fn: Evidence[] | ((prev: Evidence[]) => Evidence[])) => void;
  evidenceRows: Evidence[];
  fileRef: React.RefObject<HTMLInputElement | null>;
};

const tempId = (prefix: string) => `temp_${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export default function useWorkspaceMutations(args: Args) {
  const {
    L, api, toast, getToken, setLoading, loadCoreData, loadSaqData, loadKpiData, loadAuditData,
    reloadSuppliersDomain, reloadComplaintsDomain, reloadReportsDomain, reloadComplianceCore, reloadInsights, setTab,
    setShowSupModal, setSuppliers, setComplaints, setActions, setCDesc, setTriageLd, setTriageRes,
    setShowCapModal, setCapTitle, setCapDesc, setCapAssign,
    setDraft, setDraftTs, setGenLd, setAiInput, setAiMsgs, setAiLd, setSupLd, setSupAI, setSupCAP,
    setSaqs, setSaqEmail, setSaqSup, setSaqSending, setKpiLd,
    setEvUploading, setEvTitle, setEvDesc, setEvFile, setEvidences, fileRef,
  } = args;

  // ── STABLE REFS for mutable form/data values ──────────────────────────────
  // These are plain objects/values that change on every render.
  // Reading them via ref inside useCallback means callbacks never go stale
  // but also never need to be recreated when these values change.
  const sfRef  = useRef(args.supplierForm);   sfRef.current  = args.supplierForm;
  const eiRef  = useRef(args.editingSup);     eiRef.current  = args.editingSup;
  const cfRef  = useRef(args.complaintForm);  cfRef.current  = args.complaintForm;
  const cnRef  = useRef(args.complaintNotes); cnRef.current  = args.complaintNotes;
  const anRef  = useRef(args.actionNotes);    anRef.current  = args.actionNotes;
  const capRef = useRef(args.capForm);        capRef.current = args.capForm;
  const rpRef  = useRef(args.reports);        rpRef.current  = args.reports;
  const evRef  = useRef(args.evidence);       evRef.current  = args.evidence;
  const saqRef = useRef(args.saq);            saqRef.current = args.saq;
  const csvRef = useRef(args.csv);            csvRef.current = args.csv;
  const sqRef  = useRef(args.saqRows);        sqRef.current  = args.saqRows;
  const evRowsRef = useRef(args.evidenceRows); evRowsRef.current = args.evidenceRows;

    const body = {
      name: sfRef.current.sName,
      country: sfRef.current.sCountry,
      industry: sfRef.current.sInd,
      annual_spend_eur: parseFloat(sfRef.current.sSpend) || null,
      workers: parseInt(sfRef.current.sWorkers) || null,
      has_audit: sfRef.current.sAudit,
      has_code_of_conduct: sfRef.current.sCoc,
      certification_count: parseInt(sfRef.current.sCerts) || 0,
      sub_supplier_count: parseInt(sfRef.current.sSubSup) || 0,
      transparency_score: parseInt(sfRef.current.sTransp) || 3,
      previous_violations: sfRef.current.sViolations,
      notes: sfRef.current.sNotes,
    };
    let previous: Supplier[] = [];
    setSuppliers((prev) => {
      previous = snapshotValue(prev);
      if (eiRef.current) {
        return prev.map((s) => s.id === eiRef.current.id ? { ...s, ...body } as Supplier : s);
      }
      const optimistic: Supplier = {
        id: tempId("supplier"),
        risk_level: "unknown",
        risk_score: 0,
        ...body,
      } as Supplier;
      return [optimistic, ...prev];
    });
    try {
      await withRollback({
        snapshot: previous,
        apply: () => {},
        rollback: (prev) => setSuppliers(prev),
        commit: async () => {
          if (eiRef.current) {
            await api(`/suppliers/${eiRef.current.id}`, { method: "PUT", body: JSON.stringify(body) });
            toast("ok", L === "de" ? "Lieferant aktualisiert" : "Supplier updated");
          } else {
            await api("/suppliers", { method: "POST", body: JSON.stringify(body) });
            toast("ok", L === "de" ? "Lieferant angelegt" : "Supplier created");
          }
          setShowSupModal(false);
          await reloadSuppliersDomain();
          await reloadInsights().catch(() => {});
          setTab("suppliers");
        },
      });
    } catch (e: any) {
      toast("err", e.message);
    } finally {
      setLoading(false);
    }
  }, [L, api, reloadInsights, reloadSuppliersDomain, setLoading, setShowSupModal, setSuppliers, setTab toast]);

  const delSupplier = useCallback(async (id: string, name: string) => {
    if (!confirm(`"${name}" ${L === "de" ? "loeschen?" : "delete?"}`)) return;
    let previous: Supplier[] = [];
    setSuppliers((prev) => {
      previous = snapshotValue(prev);
      return prev.filter((s) => s.id !== id);
    });
    try {
      await withRollback({
        snapshot: previous,
        apply: () => {},
        rollback: (prev) => setSuppliers(prev),
        commit: async () => {
          await api(`/suppliers/${id}`, { method: "DELETE" });
          await reloadSuppliersDomain();
          await reloadInsights().catch(() => {});
          toast("ok", L === "de" ? "Geloscht" : "Deleted");
        },
      });
    } catch (e: any) {
      toast("err", e.message);
    }
  }, [L, api, reloadInsights, reloadSuppliersDomain, setSuppliers, toast]);

  const recalc = useCallback(async () => {
    setLoading(true);
    try {
      await api("/suppliers/recalculate", { method: "POST", body: "{}" });
      await reloadSuppliersDomain();
      await reloadInsights().catch(() => {});
      toast("ok", L === "de" ? "Risiken aktualisiert" : "Risks updated");
    } catch (e: any) {
      toast("err", e.message);
    } finally {
      setLoading(false);
    }
  }, [L, api, reloadInsights, reloadSuppliersDomain, setLoading, toast]);

  const importCsv = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api("/suppliers/import/csv", { method: "POST", body: JSON.stringify({ csv }) });
      await reloadSuppliersDomain();
      await reloadInsights().catch(() => {});
      setTab("suppliers");
      toast("ok", `${r.imported || "?"} ${L === "de" ? "importiert" : "imported"}`);
    } catch (e: any) {
      toast("err", e.message);
    } finally {
      setLoading(false);
    }
  }, [L, api, reloadInsights, reloadSuppliersDomain, setLoading, setTab, toast]);

  const submitComplaint = useCallback(async () => {
    if (!cfRef.current.cDesc.trim()) return toast("err", L === "de" ? "Bitte Beschreibung eingeben" : "Please enter description");
    const optimistic: Complaint = {
      id: tempId("complaint"),
      supplier_id: cfRef.current.cSup || null,
      supplier_name: null,
      category: cfRef.current.cCat,
      description: cfRef.current.cDesc,
      status: "open",
      severity: cfRef.current.cSev,
      reference_number: "PENDING",
      created_at: new Date().toISOString(),
    };
    let previous: Complaint[] = [];
    setComplaints((prev) => {
      previous = snapshotValue(prev);
      return [optimistic, ...prev];
    });
    try {
      await withRollback({
        snapshot: previous,
        apply: () => {},
        rollback: (prev) => setComplaints(prev),
        commit: async () => {
          await api("/complaints", { method: "POST", body: JSON.stringify({ supplierId: cfRef.current.cSup || null, category: cfRef.current.cCat, description: cfRef.current.cDesc, severity: cfRef.current.cSev }) });
          setCDesc("");
          await reloadComplaintsDomain();
          toast("ok", L === "de" ? "Beschwerde eingereicht -- Admin benachrichtigt" : "Complaint submitted -- admin notified");
        },
      });
    } catch (e: any) {
      toast("err", e.message);
    }
  }, [L, api, reloadComplaintsDomain, setCDesc, setComplaints, toast]);

  const triageComplaint = useCallback(async () => {
    if (!cfRef.current.cDesc.trim()) return;
    setTriageLd(true);
    setTriageRes("");
    try {
      const r = await api("/ai/complaint-triage", { method: "POST", body: JSON.stringify({ description: cfRef.current.cDesc, category: cfRef.current.cCat }) });
      setTriageRes(r.triage || "");
    } catch {
      setTriageRes(L === "de" ? "KI nicht verfugbar -- ANTHROPIC_API_KEY pruefen" : "AI unavailable -- check ANTHROPIC_API_KEY");
    } finally {
      setTriageLd(false);
    }
  }, [L, api, setTriageLd, setTriageRes]);

  const updateComplaintStatus = useCallback(async (id: string, status: string) => {
    let previous: Complaint[] = [];
    setComplaints((prev) => {
      previous = snapshotValue(prev);
      return prev.map((c) => c.id === id ? { ...c, status } : c);
    });
    try {
      await withRollback({
        snapshot: previous,
        apply: () => {},
        rollback: (prev) => setComplaints(prev),
        commit: async () => {
          await api(`/complaints/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
          await reloadComplaintsDomain();
          toast("ok", L === "de" ? "Aktualisiert" : "Updated");
        },
      });
    } catch (e: any) {
      toast("err", e.message);
    }
  }, [L, api, reloadComplaintsDomain, setComplaints, toast]);

  const saveComplaintNote = useCallback(async (id: string) => {
    try {
      await api(`/complaints/${id}/notes`, { method: "PUT", body: JSON.stringify({ notes: cnRef.current[id] || "" }) });
      toast("ok", L === "de" ? "Notiz gespeichert" : "Note saved");
    } catch (e: any) {
      toast("err", e.message);
    }
  }, [L, api, cnRef.current, toast]);

  const createCap = useCallback(async () => {
    if (!capRef.current.capTitle.trim()) return toast("err", L === "de" ? "Titel erforderlich" : "Title required");
    const optimistic: Action = {
      id: tempId("action"),
      supplier_id: capRef.current.capSup || null,
      supplier_name: null,
      title: capRef.current.capTitle,
      description: capRef.current.capDesc,
      risk_level: capRef.current.capPri,
      lksg_paragraph: capRef.current.capPara,
      due_date: capRef.current.capDue || null,
      status: "open",
      priority: capRef.current.capPri,
      assigned_to: capRef.current.capAssign || null,
      completed_at: null,
      evidence_notes: null,
      created_at: new Date().toISOString(),
    };
    let previous: Action[] = [];
    setActions((prev) => {
      previous = snapshotValue(prev);
      return [optimistic, ...prev];
    });
    try {
      await withRollback({
        snapshot: previous,
        apply: () => {},
        rollback: (prev) => setActions(prev),
        commit: async () => {
          await api("/actions", {
            method: "POST",
            body: JSON.stringify({
              supplierId: capRef.current.capSup || null,
              title: capRef.current.capTitle,
              description: capRef.current.capDesc,
              lksgParagraph: capRef.current.capPara,
              dueDate: capRef.current.capDue || null,
              priority: capRef.current.capPri,
              assignedTo: capRef.current.capAssign || null,
            }),
          });
          setShowCapModal(false);
          setCapTitle("");
          setCapDesc("");
          setCapAssign("");
          await reloadComplaintsDomain();
          await reloadInsights().catch(() => {});
          toast("ok", L === "de" ? "CAP erstellt -- E-Mail gesendet" : "CAP created -- email sent");
        },
      });
    } catch (e: any) {
      toast("err", e.message);
    }
  }, [L, api, reloadComplaintsDomain, reloadInsights, setActions, setCapAssign, setCapDesc, setCapTitle, setShowCapModal, toast]);

  const updateActionStatus = useCallback(async (id: string, status: string) => {
    let previous: Action[] = [];
    setActions((prev) => {
      previous = snapshotValue(prev);
      return prev.map((a) => a.id === id ? { ...a, status } : a);
    });
    try {
      await withRollback({
        snapshot: previous,
        apply: () => {},
        rollback: (prev) => setActions(prev),
        commit: async () => {
          await api(`/actions/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
          await reloadComplaintsDomain();
          toast("ok", L === "de" ? "Aktualisiert" : "Updated");
        },
      });
    } catch (e: any) {
      toast("err", e.message);
    }
  }, [L, api, reloadComplaintsDomain, setActions, toast]);

  const saveActionNote = useCallback(async (id: string) => {
    try {
      await api(`/actions/${id}`, { method: "PUT", body: JSON.stringify({ evidence_notes: anRef.current[id] || "" }) });
      toast("ok", L === "de" ? "Nachweis gespeichert" : "Evidence saved");
    } catch (e: any) {
      toast("err", e.message);
    }
  }, [L, api, anRef.current, toast]);

  const deleteAction = useCallback(async (id: string, title: string) => {
    if (!confirm(`"${title}" ${L === "de" ? "loeschen?" : "delete?"}`)) return;
    let previous: Action[] = [];
    setActions((prev) => {
      previous = prev;
      return prev.filter((a) => a.id !== id);
    });
    try {
      await api(`/actions/${id}`, { method: "DELETE" });
      await reloadComplaintsDomain();
      await reloadInsights().catch(() => {});
      toast("ok", L === "de" ? "Geloscht" : "Deleted");
    } catch (e: any) {
      setActions(previous);
      toast("err", e.message);
    }
  }, [L, api, reloadComplaintsDomain, reloadInsights, setActions, toast]);

  const loadDraft = useCallback(async () => {
    try {
      const d = await api(`/reports/bafa/${rpRef.current.rYear}/draft`);
      setDraft(d?.draft || {});
    } catch {
      setDraft({});
    }
  }, [api, rpRef.current.rYear, setDraft]);

  const saveDraft = useCallback(async () => {
    try {
      await api(`/reports/bafa/${rpRef.current.rYear}/draft`, { method: "PUT", body: JSON.stringify(rpRef.current.draft || {}) });
      setDraftTs(new Date().toLocaleString(L === "de" ? "de-DE" : "en-GB"));
      toast("ok", L === "de" ? "Gespeichert" : "Saved");
    } catch (e: any) {
      toast("err", e.message);
    }
  }, [L, api, rpRef.current.draft, rpRef.current.rYear, setDraftTs, toast]);

  const genSection = useCallback(async (key: string) => {
    setGenLd(key);
    try {
      const r = await api("/ai/report-section", { method: "POST", body: JSON.stringify({ section: key, year: rpRef.current.rYear }) });
      setDraft((d: any) => ({ ...(d || {}), [key]: r.text }));
      toast("ok", L === "de" ? "Erstellt" : "Generated");
    } catch (e: any) {
      toast("err", e.message);
    } finally {
      setGenLd("");
    }
  }, [L, api, rpRef.current.rYear, setDraft, setGenLd, toast]);

  const getSupAI = useCallback(async (s: Supplier) => {
    setSupLd((x: any) => ({ ...x, [s.id]: true }));
    try {
      const r = await api(`/ai/supplier-analysis/${s.id}`);
      setSupAI((x: any) => ({ ...x, [s.id]: r.analysis }));
    } catch (e: any) {
      toast("err", e.message);
    } finally {
      setSupLd((x: any) => ({ ...x, [s.id]: false }));
    }
  }, [api, setSupAI, setSupLd, toast]);

  const getSupCAP = useCallback(async (s: Supplier) => {
    setSupLd((x: any) => ({ ...x, [s.id + "_c"]: true }));
    try {
      const r = await api(`/ai/cap/${s.id}`, { method: "POST", body: "{}" });
      setSupCAP((x: any) => ({ ...x, [s.id]: r.cap }));
    } catch (e: any) {
      toast("err", e.message);
    } finally {
      setSupLd((x: any) => ({ ...x, [s.id + "_c"]: false }));
    }
  }, [api, setSupCAP, setSupLd, toast]);

  const sendAi = useCallback(async (text?: string) => {
    const msg = (text || rpRef.current.aiInput).trim();
    if (!msg || rpRef.current.aiLd) return;
    setAiInput("");
    const hist = [...rpRef.current.aiMsgs, { role: "user" as const, content: msg }];
    setAiMsgs(hist);
    setAiLd(true);
    try {
      const r = await api("/ai/chat", { method: "POST", body: JSON.stringify({ messages: hist }) });
      setAiMsgs([...hist, { role: "assistant" as const, content: r.reply }]);
    } catch {
      setAiMsgs([...hist, { role: "assistant" as const, content: L === "de" ? "KI nicht verfugbar. Bitte ANTHROPIC_API_KEY in Railway prufen." : "AI unavailable. Please check ANTHROPIC_API_KEY in Railway." }]);
    } finally {
      setAiLd(false);
    }
  }, [L, api, rpRef.current.aiInput, rpRef.current.aiLd, rpRef.current.aiMsgs, setAiInput, setAiLd, setAiMsgs]);

  const loadAuditLog = useCallback(async (entityType?: string) => {
    await loadAuditData(entityType);
  }, [loadAuditData]);

  const exportCSV = useCallback((endpoint: string, filename: string) => {
    downloadWithAuth(endpoint, getToken(), filename).catch(() => toast("err", "Export fehlgeschlagen"));
  }, [getToken, toast]);

  const sendSaq = useCallback(async () => {
    if (!saqRef.current.saqEmail.trim()) return toast("err", L === "de" ? "E-Mail erforderlich" : "Email required");
    setSaqSending(true);
    try {
      const r = await api("/saq", { method: "POST", body: JSON.stringify({ supplierId: saqRef.current.saqSup || null, email: saqRef.current.saqEmail, daysValid: parseInt(saqRef.current.saqDays) || 30 }) });
      const lastEmail = saqRef.current.saqEmail;
      setSaqEmail("");
      setSaqSup("");
      await reloadReportsDomain();
      toast("ok", L === "de" ? "SAQ gesendet an " + lastEmail : "SAQ sent to " + lastEmail);
      if (r.url) await navigator.clipboard.writeText(r.url).catch(() => {});
    } catch (e: any) {
      toast("err", e.message);
    } finally {
      setSaqSending(false);
    }
  }, [L, api, saq, setSaqEmail, setSaqSending, setSaqSup, toast, reloadReportsDomain]);

  const deleteSaq = useCallback(async (id: string) => {
    if (!confirm(L === "de" ? "SAQ loeschen?" : "Delete SAQ?")) return;
    const previous = sqRef.current;
    setSaqs((prev) => prev.filter((s) => s.id !== id));
    try {
      await api(`/saq/${id}`, { method: "DELETE" });
      await reloadReportsDomain();
      toast("ok", L === "de" ? "Geloescht" : "Deleted");
    } catch (e: any) {
      setSaqs(previous);
      toast("err", e.message);
    }
  }, [L, api, reloadReportsDomain, sqRef.current, setSaqs, toast]);

  const loadKpi = useCallback(async () => {
    setKpiLd(true);
    try {
      await loadKpiData();
    } finally {
      setKpiLd(false);
    }
  }, [loadKpiData, setKpiLd]);

  const saveKpiSnapshot = useCallback(async () => {
    try {
      await api("/kpi/snapshot", { method: "POST", body: "{}" });
      await loadKpi();
      toast("ok", L === "de" ? "Snapshot gespeichert" : "Snapshot saved");
    } catch (e: any) {
      toast("err", e.message);
    }
  }, [L, api, loadKpi, toast]);

  const uploadEvidence = useCallback(async () => {
    if (!evRef.current.evTitle.trim()) return toast("err", L === "de" ? "Titel erforderlich" : "Title required");
    setEvUploading(true);
    try {
      let fileData: string | null = null;
      let fileName: string | null = null;
      let fileSize: number | null = null;
      let mimeType: string | null = null;
      if (evRef.current.evFile) {
        fileName = evRef.current.evFile.name;
        fileSize = evRef.current.evFile.size;
        mimeType = evRef.current.evFile.type;
        fileData = await new Promise<string>((res, rej) => {
          const r = new FileReader();
          r.onload = () => res((r.result as string).split(",")[1]);
          r.onerror = () => rej(new Error("Read failed"));
          r.readAsDataURL(evRef.current.evFile as Blob);
        });
      }
      await api("/evidence", { method: "POST", body: JSON.stringify({ title: evRef.current.evTitle, type: evRef.current.evType, lksg_ref: evRef.current.evLksg || null, description: evRef.current.evDesc || null, supplier_id: evRef.current.evSupId || null, file_data: fileData, file_name: fileName, file_size: fileSize, mime_type: mimeType }) });
      setEvTitle("");
      setEvDesc("");
      setEvFile(null);
      if (fileRef.current) fileRef.current.value = "";
      await reloadReportsDomain();
      toast("ok", L === "de" ? "Nachweis gespeichert" : "Evidence saved");
    } catch (e: any) {
      toast("err", e.message);
    } finally {
      setEvUploading(false);
    }
  }, [L, api, evidence, fileRef, reloadReportsDomain, setEvDesc, setEvFile, setEvTitle, setEvUploading, toast]);

  const deleteEvidence = useCallback(async (id: string) => {
    if (!confirm(L === "de" ? "Nachweis loeschen?" : "Delete evidence?")) return;
    const previous = evRowsRef.current;
    setEvidences((prev) => prev.filter((e) => e.id !== id));
    try {
      await api(`/evidence/${id}`, { method: "DELETE" });
      await reloadReportsDomain();
      toast("ok", L === "de" ? "Geloescht" : "Deleted");
    } catch (e: any) {
      setEvidences(previous);
      toast("err", e.message);
    }
  }, [L, api, evRowsRef.current, reloadReportsDomain, setEvidences, toast]);

  return {
    saveSupplier,
    delSupplier,
    recalc,
    importCsv,
    submitComplaint,
    triageComplaint,
    updateComplaintStatus,
    saveComplaintNote,
    createCap,
    updateActionStatus,
    saveActionNote,
    deleteAction,
    loadDraft,
    saveDraft,
    genSection,
    getSupAI,
    getSupCAP,
    sendAi,
    loadAuditLog,
    exportCSV,
    sendSaq,
    deleteSaq,
    loadKpi,
    saveKpiSnapshot,
    uploadEvidence,
    deleteEvidence,
  };
}
