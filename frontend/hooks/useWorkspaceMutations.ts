"use client";

import { useCallback } from "react";
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
    L, api, toast, getToken, setLoading, loadCoreData, loadSaqData, loadKpiData, loadAuditData, reloadSuppliersDomain, reloadComplaintsDomain, reloadReportsDomain, reloadComplianceCore, reloadInsights, setTab,
    editingSup, supplierForm, setShowSupModal, setSuppliers,
    csv,
    complaintForm, setComplaints, setActions, complaintNotes, actionNotes, setCDesc, setTriageLd, setTriageRes,
    capForm, setShowCapModal, setCapTitle, setCapDesc, setCapAssign,
    reports, setDraft, setDraftTs, setGenLd, setAiInput, setAiMsgs, setAiLd, setSupLd, setSupAI, setSupCAP,
    setSaqs, saqRows, saq, setSaqEmail, setSaqSup, setSaqSending,
    setKpiLd,
    evidence, setEvUploading, setEvTitle, setEvDesc, setEvFile, setEvidences, evidenceRows, fileRef,
  } = args;

  const saveSupplier = useCallback(async () => {
    if (!supplierForm.sName.trim()) return toast("err", L === "de" ? "Bitte Namen eingeben" : "Please enter a name");
    setLoading(true);
    const body = {
      name: supplierForm.sName,
      country: supplierForm.sCountry,
      industry: supplierForm.sInd,
      annual_spend_eur: parseFloat(supplierForm.sSpend) || null,
      workers: parseInt(supplierForm.sWorkers) || null,
      has_audit: supplierForm.sAudit,
      has_code_of_conduct: supplierForm.sCoc,
      certification_count: parseInt(supplierForm.sCerts) || 0,
      sub_supplier_count: parseInt(supplierForm.sSubSup) || 0,
      transparency_score: parseInt(supplierForm.sTransp) || 3,
      previous_violations: supplierForm.sViolations,
      notes: supplierForm.sNotes,
    };
    let previous: Supplier[] = [];
    setSuppliers((prev) => {
      previous = snapshotValue(prev);
      if (editingSup) {
        return prev.map((s) => s.id === editingSup.id ? { ...s, ...body } as Supplier : s);
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
          if (editingSup) {
            await api(`/suppliers/${editingSup.id}`, { method: "PUT", body: JSON.stringify(body) });
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
  }, [L, api, editingSup, reloadInsights, reloadSuppliersDomain, setLoading, setShowSupModal, setSuppliers, setTab, supplierForm, toast]);

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
  }, [L, api, csv, reloadInsights, reloadSuppliersDomain, setLoading, setTab, toast]);

  const submitComplaint = useCallback(async () => {
    if (!complaintForm.cDesc.trim()) return toast("err", L === "de" ? "Bitte Beschreibung eingeben" : "Please enter description");
    const optimistic: Complaint = {
      id: tempId("complaint"),
      supplier_id: complaintForm.cSup || null,
      supplier_name: null,
      category: complaintForm.cCat,
      description: complaintForm.cDesc,
      status: "open",
      severity: complaintForm.cSev,
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
          await api("/complaints", { method: "POST", body: JSON.stringify({ supplierId: complaintForm.cSup || null, category: complaintForm.cCat, description: complaintForm.cDesc, severity: complaintForm.cSev }) });
          setCDesc("");
          await reloadComplaintsDomain();
          toast("ok", L === "de" ? "Beschwerde eingereicht -- Admin benachrichtigt" : "Complaint submitted -- admin notified");
        },
      });
    } catch (e: any) {
      toast("err", e.message);
    }
  }, [L, api, complaintForm, reloadComplaintsDomain, setCDesc, setComplaints, toast]);

  const triageComplaint = useCallback(async () => {
    if (!complaintForm.cDesc.trim()) return;
    setTriageLd(true);
    setTriageRes("");
    try {
      const r = await api("/ai/complaint-triage", { method: "POST", body: JSON.stringify({ description: complaintForm.cDesc, category: complaintForm.cCat }) });
      setTriageRes(r.triage || "");
    } catch {
      setTriageRes(L === "de" ? "KI nicht verfugbar -- ANTHROPIC_API_KEY pruefen" : "AI unavailable -- check ANTHROPIC_API_KEY");
    } finally {
      setTriageLd(false);
    }
  }, [L, api, complaintForm, setTriageLd, setTriageRes]);

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
      await api(`/complaints/${id}/notes`, { method: "PUT", body: JSON.stringify({ notes: complaintNotes[id] || "" }) });
      toast("ok", L === "de" ? "Notiz gespeichert" : "Note saved");
    } catch (e: any) {
      toast("err", e.message);
    }
  }, [L, api, complaintNotes, toast]);

  const createCap = useCallback(async () => {
    if (!capForm.capTitle.trim()) return toast("err", L === "de" ? "Titel erforderlich" : "Title required");
    const optimistic: Action = {
      id: tempId("action"),
      supplier_id: capForm.capSup || null,
      supplier_name: null,
      title: capForm.capTitle,
      description: capForm.capDesc,
      risk_level: capForm.capPri,
      lksg_paragraph: capForm.capPara,
      due_date: capForm.capDue || null,
      status: "open",
      priority: capForm.capPri,
      assigned_to: capForm.capAssign || null,
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
              supplierId: capForm.capSup || null,
              title: capForm.capTitle,
              description: capForm.capDesc,
              lksgParagraph: capForm.capPara,
              dueDate: capForm.capDue || null,
              priority: capForm.capPri,
              assignedTo: capForm.capAssign || null,
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
  }, [L, api, capForm, reloadComplaintsDomain, reloadInsights, setActions, setCapAssign, setCapDesc, setCapTitle, setShowCapModal, toast]);

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
      await api(`/actions/${id}`, { method: "PUT", body: JSON.stringify({ evidence_notes: actionNotes[id] || "" }) });
      toast("ok", L === "de" ? "Nachweis gespeichert" : "Evidence saved");
    } catch (e: any) {
      toast("err", e.message);
    }
  }, [L, api, actionNotes, toast]);

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
      const d = await api(`/reports/bafa/${reports.rYear}/draft`);
      setDraft(d?.draft || {});
    } catch {
      setDraft({});
    }
  }, [api, reports.rYear, setDraft]);

  const saveDraft = useCallback(async () => {
    try {
      await api(`/reports/bafa/${reports.rYear}/draft`, { method: "PUT", body: JSON.stringify(reports.draft || {}) });
      setDraftTs(new Date().toLocaleString(L === "de" ? "de-DE" : "en-GB"));
      toast("ok", L === "de" ? "Gespeichert" : "Saved");
    } catch (e: any) {
      toast("err", e.message);
    }
  }, [L, api, reports.draft, reports.rYear, setDraftTs, toast]);

  const genSection = useCallback(async (key: string) => {
    setGenLd(key);
    try {
      const r = await api("/ai/report-section", { method: "POST", body: JSON.stringify({ section: key, year: reports.rYear }) });
      setDraft((d: any) => ({ ...(d || {}), [key]: r.text }));
      toast("ok", L === "de" ? "Erstellt" : "Generated");
    } catch (e: any) {
      toast("err", e.message);
    } finally {
      setGenLd("");
    }
  }, [L, api, reports.rYear, setDraft, setGenLd, toast]);

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
    const msg = (text || reports.aiInput).trim();
    if (!msg || reports.aiLd) return;
    setAiInput("");
    const hist = [...reports.aiMsgs, { role: "user" as const, content: msg }];
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
  }, [L, api, reports.aiInput, reports.aiLd, reports.aiMsgs, setAiInput, setAiLd, setAiMsgs]);

  const loadAuditLog = useCallback(async (entityType?: string) => {
    await loadAuditData(entityType);
  }, [loadAuditData]);

  const exportCSV = useCallback((endpoint: string, filename: string) => {
    downloadWithAuth(endpoint, getToken(), filename).catch(() => toast("err", "Export fehlgeschlagen"));
  }, [getToken, toast]);

  const sendSaq = useCallback(async () => {
    if (!saq.saqEmail.trim()) return toast("err", L === "de" ? "E-Mail erforderlich" : "Email required");
    setSaqSending(true);
    try {
      const r = await api("/saq", { method: "POST", body: JSON.stringify({ supplierId: saq.saqSup || null, email: saq.saqEmail, daysValid: parseInt(saq.saqDays) || 30 }) });
      const lastEmail = saq.saqEmail;
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
    const previous = saqRows;
    setSaqs((prev) => prev.filter((s) => s.id !== id));
    try {
      await api(`/saq/${id}`, { method: "DELETE" });
      await reloadReportsDomain();
      toast("ok", L === "de" ? "Geloescht" : "Deleted");
    } catch (e: any) {
      setSaqs(previous);
      toast("err", e.message);
    }
  }, [L, api, reloadReportsDomain, saqRows, setSaqs, toast]);

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
    if (!evidence.evTitle.trim()) return toast("err", L === "de" ? "Titel erforderlich" : "Title required");
    setEvUploading(true);
    try {
      let fileData: string | null = null;
      let fileName: string | null = null;
      let fileSize: number | null = null;
      let mimeType: string | null = null;
      if (evidence.evFile) {
        fileName = evidence.evFile.name;
        fileSize = evidence.evFile.size;
        mimeType = evidence.evFile.type;
        fileData = await new Promise<string>((res, rej) => {
          const r = new FileReader();
          r.onload = () => res((r.result as string).split(",")[1]);
          r.onerror = () => rej(new Error("Read failed"));
          r.readAsDataURL(evidence.evFile as Blob);
        });
      }
      await api("/evidence", { method: "POST", body: JSON.stringify({ title: evidence.evTitle, type: evidence.evType, lksg_ref: evidence.evLksg || null, description: evidence.evDesc || null, supplier_id: evidence.evSupId || null, file_data: fileData, file_name: fileName, file_size: fileSize, mime_type: mimeType }) });
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
    const previous = evidenceRows;
    setEvidences((prev) => prev.filter((e) => e.id !== id));
    try {
      await api(`/evidence/${id}`, { method: "DELETE" });
      await reloadReportsDomain();
      toast("ok", L === "de" ? "Geloescht" : "Deleted");
    } catch (e: any) {
      setEvidences(previous);
      toast("err", e.message);
    }
  }, [L, api, evidenceRows, reloadReportsDomain, setEvidences, toast]);

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
