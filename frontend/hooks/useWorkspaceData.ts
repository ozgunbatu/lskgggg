"use client";

import { useCallback, useRef, useState } from "react";
import useWorkspaceCache from "./useWorkspaceCache";
import useWorkspaceRequestState from "./useWorkspaceRequestState";
import type { KPILive } from "@/lib/workspace-types";
import { queryKeys } from "@/lib/workspace-query-keys";
import useSuppliersData from "./feature-data/useSuppliersData";
import useComplaintsData from "./feature-data/useComplaintsData";
import useReportsData from "./feature-data/useReportsData";
import useWorkspaceReloads from "./useWorkspaceReloads";

type ApiFn = (url: string, options?: RequestInit) => Promise<any>;
type ToastFn = (type: "ok" | "err" | "info", msg: string) => void;

export default function useWorkspaceData({ api, toast }: { api: ApiFn; toast: ToastFn }) {
  const cache = useWorkspaceCache();
  const requestState = useWorkspaceRequestState();

  // requestState.begin/succeed/fail are now stable refs (never change identity)
  const suppliersData  = useSuppliersData({ api, toast, cache, requestState });
  const complaintsData = useComplaintsData({ api, toast, cache, requestState });
  const reportsData    = useReportsData({ api, toast, cache, requestState });

  const [events, setEventsState] = useState<any[]>([]);
  const [screenings, setScreeningsState] = useState<any[]>([]);
  const [kpiLive, setKpiLiveState] = useState<KPILive | null>(null);
  const [kpiTrend, setKpiTrendState] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Refs for async closures — prevent stale captures
  const eventsRef     = useRef<any[]>([]);
  const screeningsRef = useRef<any[]>([]);
  const kpiLiveRef    = useRef<KPILive | null>(null);
  const kpiTrendRef   = useRef<any[]>([]);

  const setEventsStable     = useCallback((v: any[]) => { eventsRef.current = v; setEventsState(v); }, []);
  const setScreeningsStable = useCallback((v: any[]) => { screeningsRef.current = v; setScreeningsState(v); }, []);
  const setKpiLiveStable    = useCallback((v: KPILive | null) => { kpiLiveRef.current = v; setKpiLiveState(v); }, []);
  const setKpiTrendStable   = useCallback((v: any[]) => { kpiTrendRef.current = v; setKpiTrendState(v); }, []);

  // ── STABLE REFS for sub-data loaders ─────────────────────────────────────
  // suppliersData, complaintsData, reportsData return new objects each render
  // (they're custom hooks with useState). We capture their loaders in refs
  // so our useCallbacks don't need them in their dep arrays.
  const loadCompanyRef   = useRef(suppliersData.loadCompany);
  const loadSuppRef      = useRef(suppliersData.loadSuppliers);
  const loadCmpRef       = useRef(complaintsData.loadComplaints);
  const loadActRef       = useRef(complaintsData.loadActions);
  const loadSaqRef       = useRef(reportsData.loadSaqData);
  const loadEvidRef      = useRef(reportsData.loadEvidenceData);
  const loadAuditRef     = useRef(reportsData.loadAuditData);

  // Keep refs current every render (the actual functions may update if their
  // own deps changed — but the ref always points to the latest version)
  loadCompanyRef.current  = suppliersData.loadCompany;
  loadSuppRef.current     = suppliersData.loadSuppliers;
  loadCmpRef.current      = complaintsData.loadComplaints;
  loadActRef.current      = complaintsData.loadActions;
  loadSaqRef.current      = reportsData.loadSaqData;
  loadEvidRef.current     = reportsData.loadEvidenceData;
  loadAuditRef.current    = reportsData.loadAuditData;

  // loadCoreData is now truly stable — no sub-hook objects in deps
  const loadCoreData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCompanyRef.current(),
        loadSuppRef.current(),
        loadCmpRef.current(),
        loadActRef.current(),
        loadSaqRef.current(),
        loadEvidRef.current(),
      ]);
    } catch (e: any) {
      if (!String(e?.message || "").includes("Session")) {
        toast("err", e?.message || "Load failed");
      }
    } finally {
      setLoading(false);
    }
  }, [toast]); // stable: toast is useCallback, refs never change identity

  const loadMonitoringData = useCallback(async ({ force = false }: { force?: boolean } = {}) => {
    if (!force && eventsRef.current.length && screeningsRef.current.length && cache.isFresh(queryKeys.insights)) {
      return { events: eventsRef.current, screenings: screeningsRef.current };
    }
    requestState.begin("insights");
    try {
      const [rawEvents, rawScreenings] = await Promise.all([
        api("/monitoring/events"),
        api("/monitoring/screenings"),
      ]);
      setEventsStable(Array.isArray(rawEvents) ? rawEvents : []);
      setScreeningsStable(Array.isArray(rawScreenings) ? rawScreenings : []);
      cache.markFresh(queryKeys.insights);
      requestState.succeed("insights");
    } catch (e: any) {
      requestState.fail("insights", e?.message || "Monitoring load failed");
      toast("err", e?.message || "Monitoring load failed");
    }
  }, [api, cache, requestState, setEventsStable, setScreeningsStable, toast]);

  const loadKpiData = useCallback(async ({ force = false }: { force?: boolean } = {}) => {
    if (!force && kpiLiveRef.current && kpiTrendRef.current.length && cache.isFresh(queryKeys.kpi)) {
      return { live: kpiLiveRef.current, trend: kpiTrendRef.current };
    }
    requestState.begin("kpi");
    try {
      const [live, trend] = await Promise.all([api("/kpi/live"), api("/kpi/trend")]);
      setKpiLiveStable(live);
      setKpiTrendStable(Array.isArray(trend) ? trend : []);
      cache.markFresh(queryKeys.kpi);
      requestState.succeed("kpi");
    } catch (e: any) {
      requestState.fail("kpi", e?.message || "KPI load failed");
      toast("err", e?.message || "KPI load failed");
    }
  }, [api, cache, requestState, setKpiLiveStable, setKpiTrendStable, toast]);

  const reloads = useWorkspaceReloads({
    cache,
    loadCompany:      suppliersData.loadCompany,
    loadSuppliers:    suppliersData.loadSuppliers,
    loadComplaints:   complaintsData.loadComplaints,
    loadActions:      complaintsData.loadActions,
    loadSaqData:      reportsData.loadSaqData,
    loadEvidenceData: reportsData.loadEvidenceData,
    loadMonitoringData,
    loadKpiData,
    loadAuditData:    reportsData.loadAuditData,
  });

  return {
    company:      suppliersData.company,
    setCompany:   suppliersData.setCompany,
    suppliers:    suppliersData.suppliers,
    setSuppliers: suppliersData.setSuppliers,
    complaints:   complaintsData.complaints,
    setComplaints: complaintsData.setComplaints,
    actions:      complaintsData.actions,
    setActions:   complaintsData.setActions,
    events,
    setEvents:    setEventsStable,
    screenings,
    setScreenings: setScreeningsStable,
    saqs:         reportsData.saqs,
    setSaqs:      reportsData.setSaqs,
    kpiLive,
    setKpiLive:   setKpiLiveStable,
    kpiTrend,
    setKpiTrend:  setKpiTrendStable,
    auditLog:     reportsData.auditLog,
    setAuditLog:  reportsData.setAuditLog,
    auditLd:      reportsData.auditLd,
    setAuditLd:   reportsData.setAuditLd,
    evidences:    reportsData.evidences,
    setEvidences: reportsData.setEvidences,
    loading,
    setLoading,
    loadCoreData,
    loadMonitoringData,
    loadSaqData:     reportsData.loadSaqData,
    loadEvidenceData: reportsData.loadEvidenceData,
    loadKpiData,
    loadAuditData:   reportsData.loadAuditData,
    featureData: {
      suppliers:  suppliersData,
      complaints: complaintsData,
      reports:    reportsData,
    },
    reloads,
    cache,
    requestState,
  };
}
