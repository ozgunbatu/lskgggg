"use client";

import { useCallback, useMemo, useRef } from "react";
import useWorkspaceUi from "./useWorkspaceUi";
import useWorkspaceData from "./useWorkspaceData";
import useWorkspaceRuntime from "./useWorkspaceRuntime";
import useWorkspaceMutations from "./useWorkspaceMutations";
import useWorkspaceDerived from "./useWorkspaceDerived";
import { getToken } from "@/lib/auth";
import type { Supplier, TabId } from "@/lib/workspace-types";

type ApiFn = (url: string, options?: RequestInit) => Promise<any>;

let _tid = 0;

function buildSupplierModalActions(ui: ReturnType<typeof useWorkspaceUi>) {
  const openAddSupModal = () => {
    ui.setEditingSup(null);
    ui.setSName("");
    ui.setSCountry("Germany");
    ui.setSInd("services");
    ui.setSSpend("");
    ui.setSWorkers("");
    ui.setSAudit(false);
    ui.setSCoc(false);
    ui.setSCerts("0");
    ui.setSSubSup("0");
    ui.setSTransp("3");
    ui.setSViolations(false);
    ui.setSNotes("");
    ui.setShowSupModal(true);
  };

  const openEditSupModal = (s: Supplier) => {
    ui.setEditingSup(s);
    ui.setSName(s.name);
    ui.setSCountry(s.country);
    ui.setSInd(s.industry);
    ui.setSSpend(String(s.annual_spend_eur || ""));
    ui.setSWorkers(String(s.workers || ""));
    ui.setSAudit(!!s.has_audit);
    ui.setSCoc(!!s.has_code_of_conduct);
    ui.setSCerts(String(s.certification_count || 0));
    ui.setSSubSup(String(s.sub_supplier_count || 0));
    ui.setSTransp(String(s.transparency_score || 3));
    ui.setSViolations(!!s.previous_violations);
    ui.setSNotes(s.notes || "");
    ui.setShowSupModal(true);
  };

  return { openAddSupModal, openEditSupModal };
}

export default function useWorkspaceStore({ api, initialTab }: { api: ApiFn; initialTab: TabId }) {
  const ui = useWorkspaceUi();
  const runtime = useWorkspaceRuntime(initialTab);

  const toast = useCallback((type: "ok" | "err" | "info", msg: string) => {
    if (msg === "rate_limited" || msg.includes("Too many requests") || msg.includes("429")) return;
    const id = ++_tid;
    ui.setToasts((x) => {
      if (x.some((t) => t.msg === msg)) return x;
      const trimmed = x.length >= 3 ? x.slice(-2) : x;
      return [...trimmed, { id, type, msg }];
    });
    setTimeout(() => ui.setToasts((x) => x.filter((t) => t.id !== id)), 4500);
  }, [ui.setToasts]); // eslint-disable-line react-hooks/exhaustive-deps

  const data = useWorkspaceData({ api, toast });
  const featureData = data.featureData;
  const reloads = data.reloads;

  // STABLE: depend only on atomic useState setters (always same reference)
  const modalActions = useMemo(
    () => buildSupplierModalActions(ui),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      ui.setEditingSup, ui.setSName, ui.setSCountry, ui.setSInd, ui.setSSpend,
      ui.setSWorkers, ui.setSAudit, ui.setSCoc, ui.setSCerts, ui.setSSubSup,
      ui.setSTransp, ui.setSViolations, ui.setSNotes, ui.setShowSupModal,
    ]
  );

  const mutations = useWorkspaceMutations({
    L: ui.L,
    api,
    toast,
    getToken,
    setLoading: data.setLoading,
    loadCoreData: data.loadCoreData,
    loadSaqData: data.loadSaqData,
    loadKpiData: data.loadKpiData,
    loadAuditData: data.loadAuditData,
    reloadSuppliersDomain: reloads.reloadSuppliersDomain,
    reloadComplaintsDomain: reloads.reloadComplaintsDomain,
    reloadReportsDomain: reloads.reloadReportsDomain,
    reloadComplianceCore: reloads.reloadComplianceCore,
    reloadInsights: reloads.reloadInsights,
    setTab: runtime.setTab,
    editingSup: ui.editingSup,
    supplierForm: {
      sName: ui.sName, sCountry: ui.sCountry, sInd: ui.sInd,
      sSpend: ui.sSpend, sWorkers: ui.sWorkers, sAudit: ui.sAudit,
      sCoc: ui.sCoc, sCerts: ui.sCerts, sSubSup: ui.sSubSup,
      sTransp: ui.sTransp, sViolations: ui.sViolations, sNotes: ui.sNotes,
    },
    setShowSupModal: ui.setShowSupModal,
    setSuppliers: data.setSuppliers,
    csv: ui.csv,
    complaintForm: { cSup: ui.cSup, cCat: ui.cCat, cSev: ui.cSev, cDesc: ui.cDesc },
    setComplaints: data.setComplaints,
    setActions: data.setActions,
    complaintNotes: ui.cNotes,
    actionNotes: ui.actionNotes,
    setCDesc: ui.setCDesc,
    setTriageLd: ui.setTriageLd,
    setTriageRes: ui.setTriageRes,
    capForm: {
      capSup: ui.capSup, capTitle: ui.capTitle, capDesc: ui.capDesc,
      capPara: ui.capPara, capDue: ui.capDue, capPri: ui.capPri, capAssign: ui.capAssign,
    },
    setShowCapModal: ui.setShowCapModal,
    setCapTitle: ui.setCapTitle,
    setCapDesc: ui.setCapDesc,
    setCapAssign: ui.setCapAssign,
    reports: { rYear: runtime.rYear, draft: runtime.draft, aiMsgs: runtime.aiMsgs, aiInput: runtime.aiInput, aiLd: runtime.aiLd },
    setDraft: runtime.setDraft,
    setDraftTs: runtime.setDraftTs,
    setGenLd: runtime.setGenLd,
    setAiInput: runtime.setAiInput,
    setAiMsgs: runtime.setAiMsgs,
    setAiLd: runtime.setAiLd,
    setSupLd: ui.setSupLd,
    setSupAI: ui.setSupAI,
    setSupCAP: ui.setSupCAP,
    setSaqs: data.setSaqs,
    saqRows: data.saqs,
    saq: { saqEmail: runtime.saqEmail, saqSup: runtime.saqSup, saqDays: runtime.saqDays },
    setSaqEmail: runtime.setSaqEmail,
    setSaqSup: runtime.setSaqSup,
    setSaqSending: runtime.setSaqSending,
    setKpiLd: runtime.setKpiLd,
    evidence: { evTitle: ui.evTitle, evType: ui.evType, evLksg: ui.evLksg, evDesc: ui.evDesc, evSupId: ui.evSupId, evFile: ui.evFile },
    setEvUploading: ui.setEvUploading,
    setEvTitle: ui.setEvTitle,
    setEvDesc: ui.setEvDesc,
    setEvFile: ui.setEvFile,
    setEvidences: data.setEvidences,
    evidenceRows: data.evidences,
    fileRef: runtime.fileRef,
  });

  // ── FEATURE STATE ─────────────────────────────────────────────────────────
  // Build inline with useMemo keyed on atomic values only — no intermediate
  // hook calls that return plain objects (those break memoization).
  const featureState = useMemo(() => ({
    suppliers: {
      expanded: ui.expanded,
      setExpanded: ui.setExpanded,
      supFilter: ui.supFilter,
      setSupFilter: ui.setSupFilter,
      hoverParam: ui.hoverParam,
      setHoverParam: ui.setHoverParam,
      supplierForm: {
        editingSup: ui.editingSup,
        sName: ui.sName, setSName: ui.setSName,
        sCountry: ui.sCountry, setSCountry: ui.setSCountry,
        sInd: ui.sInd, setSInd: ui.setSInd,
        sSpend: ui.sSpend, setSSpend: ui.setSSpend,
        sWorkers: ui.sWorkers, setSWorkers: ui.setSWorkers,
        sAudit: ui.sAudit, setSAudit: ui.setSAudit,
        sCoc: ui.sCoc, setSCoc: ui.setSCoc,
        sCerts: ui.sCerts, setSCerts: ui.setSCerts,
        sSubSup: ui.sSubSup, setSSubSup: ui.setSSubSup,
        sTransp: ui.sTransp, setSTransp: ui.setSTransp,
        sViolations: ui.sViolations, setSViolations: ui.setSViolations,
        sNotes: ui.sNotes, setSNotes: ui.setSNotes,
        csv: ui.csv, setCsv: ui.setCsv,
      },
    },
    complaints: {
      complaintForm: {
        cSup: ui.cSup, setCSup: ui.setCSup,
        cCat: ui.cCat, setCCat: ui.setCCat,
        cSev: ui.cSev, setCSev: ui.setCSev,
        cDesc: ui.cDesc, setCDesc: ui.setCDesc,
      },
      complaintNotes: { cNotes: ui.cNotes, setCNotes: ui.setCNotes },
      triage: {
        triageRes: ui.triageRes, setTriageRes: ui.setTriageRes,
        triageLd: ui.triageLd, setTriageLd: ui.setTriageLd,
      },
    },
    reports: {
      reports: {
        rYear: runtime.rYear, setRYear: runtime.setRYear,
        draft: runtime.draft, setDraft: runtime.setDraft,
        draftTs: runtime.draftTs, setDraftTs: runtime.setDraftTs,
        genLd: runtime.genLd, setGenLd: runtime.setGenLd,
      },
      ai: {
        aiMsgs: runtime.aiMsgs, setAiMsgs: runtime.setAiMsgs,
        aiInput: runtime.aiInput, setAiInput: runtime.setAiInput,
        aiLd: runtime.aiLd, setAiLd: runtime.setAiLd,
        aiEnd: runtime.aiEnd,
      },
    },
  }), [ // eslint-disable-line react-hooks/exhaustive-deps
    // SUPPLIERS — only values, not setters (setters are stable)
    ui.expanded, ui.supFilter, ui.hoverParam, ui.editingSup,
    ui.sName, ui.sCountry, ui.sInd, ui.sSpend, ui.sWorkers,
    ui.sAudit, ui.sCoc, ui.sCerts, ui.sSubSup, ui.sTransp,
    ui.sViolations, ui.sNotes, ui.csv,
    // COMPLAINTS
    ui.cSup, ui.cCat, ui.cSev, ui.cDesc, ui.cNotes,
    ui.triageRes, ui.triageLd,
    // REPORTS
    runtime.rYear, runtime.draft, runtime.draftTs, runtime.genLd,
    runtime.aiMsgs, runtime.aiInput, runtime.aiLd,
  ]);

  // ── FEATURE MUTATIONS ─────────────────────────────────────────────────────
  // mutations are useCallback — stable. Just alias them.
  const featureMutations = useMemo(() => ({
    suppliers: {
      saveSupplier: mutations.saveSupplier,
      delSupplier: mutations.delSupplier,
      recalc: mutations.recalc,
      importCsv: mutations.importCsv,
      getSupAI: mutations.getSupAI,
      getSupCAP: mutations.getSupCAP,
    },
    complaints: {
      submitComplaint: mutations.submitComplaint,
      triageComplaint: mutations.triageComplaint,
      updateComplaintStatus: mutations.updateComplaintStatus,
      saveComplaintNote: mutations.saveComplaintNote,
    },
    reports: {
      loadDraft: mutations.loadDraft,
      saveDraft: mutations.saveDraft,
      genSection: mutations.genSection,
      sendAi: mutations.sendAi,
    },
  }), [ // eslint-disable-line react-hooks/exhaustive-deps
    mutations.saveSupplier, mutations.delSupplier, mutations.recalc, mutations.importCsv,
    mutations.getSupAI, mutations.getSupCAP,
    mutations.submitComplaint, mutations.triageComplaint,
    mutations.updateComplaintStatus, mutations.saveComplaintNote,
    mutations.loadDraft, mutations.saveDraft, mutations.genSection, mutations.sendAi,
  ]);

  const derived = useWorkspaceDerived({
    L: ui.L,
    tab: runtime.tab,
    company: data.company,
    suppliers: data.suppliers,
    complaints: data.complaints,
    actions: data.actions,
    saqs: data.saqs,
    evidences: data.evidences,
    events: data.events,
    screenings: data.screenings,
    auditLog: data.auditLog,
    draft: runtime.draft,
    draftTs: runtime.draftTs,
    kpiLive: data.kpiLive,
    setTab: runtime.setTab,
    recalc: mutations.recalc,
    openAddSupModal: modalActions.openAddSupModal,
    setShowCapModal: ui.setShowCapModal,
    loadKpi: mutations.loadKpi,
    loadAuditLog: mutations.loadAuditLog,
  });

  return {
    ui,
    runtime,
    data,
    mutations,
    derived,
    modalActions,
    featureState,
    featureMutations,
    featureData,
    reloads,
    requestState: data.requestState,
    toast,
  };
}
