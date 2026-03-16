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
  const suppliersData = useSuppliersData({ api, toast, cache, requestState });
  const complaintsData = useComplaintsData({ api, toast, cache, requestState });
  const reportsData = useReportsData({ api, toast, cache, requestState });

  const [events, setEvents] = useState<any[]>([]);
  const [screenings, setScreenings] = useState<any[]>([]);
  const [kpiLive, setKpiLive] = useState<KPILive | null>(null);
  const [kpiTrend, setKpiTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Refs to break circular deps in useCallback
  const eventsRef = useRef<any[]>([]);
  const screeningsRef = useRef<any[]>([]);
  const kpiLiveRef = useRef<KPILive | null>(null);
  const kpiTrendRef = useRef<any[]>([]);

  const setEventsStable = useCallback((v: any[]) => { eventsRef.current = v; setEvents(v); }, []);
  const setScreeningsStable = useCallback((v: any[]) => { screeningsRef.current = v; setScreenings(v); }, []);
  const setKpiLiveStable = useCallback((v: KPILive | null) => { kpiLiveRef.current = v; setKpiLive(v); }, []);
  const setKpiTrendStable = useCallback((v: any[]) => { kpiTrendRef.current = v; setKpiTrend(v); }, []);

  const loadCoreData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        suppliersData.loadCompany(),
        suppliersData.loadSuppliers(),
        complaintsData.loadComplaints(),
        complaintsData.loadActions(),
        reportsData.loadSaqData(),
        reportsData.loadEvidenceData(),
      ]);
    } catch (e: any) {
      if (!String(e?.message || "").includes("Session")) {
        toast("err", e?.message || "Load failed");
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suppliersData.loadCompany, suppliersData.loadSuppliers, complaintsData.loadComplaints, complaintsData.loadActions, reportsData.loadSaqData, reportsData.loadEvidenceData, toast]);

  const loadMonitoringData = useCallback(async ({ force = false }: { force?: boolean } = {}) => {
    if (!force && eventsRef.current.length && screeningsRef.current.length && cache.isFresh(queryKeys.insights)) return { events: eventsRef.current, screenings: screeningsRef.current };
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
    if (!force && kpiLiveRef.current && kpiTrendRef.current.length && cache.isFresh(queryKeys.kpi)) return { live: kpiLiveRef.current, trend: kpiTrendRef.current };
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
    loadCompany: suppliersData.loadCompany,
    loadSuppliers: suppliersData.loadSuppliers,
    loadComplaints: complaintsData.loadComplaints,
    loadActions: complaintsData.loadActions,
    loadSaqData: reportsData.loadSaqData,
    loadEvidenceData: reportsData.loadEvidenceData,
    loadMonitoringData,
    loadKpiData,
    loadAuditData: reportsData.loadAuditData,
  });

  return {
    company: suppliersData.company,
    setCompany: suppliersData.setCompany,
    suppliers: suppliersData.suppliers,
    setSuppliers: suppliersData.setSuppliers,
    complaints: complaintsData.complaints,
    setComplaints: complaintsData.setComplaints,
    actions: complaintsData.actions,
    setActions: complaintsData.setActions,
    events,
    setEvents: setEventsStable,
    screenings,
    setScreenings: setScreeningsStable,
    saqs: reportsData.saqs,
    setSaqs: reportsData.setSaqs,
    kpiLive,
    setKpiLive: setKpiLiveStable,
    kpiTrend,
    setKpiTrend: setKpiTrendStable,
    auditLog: reportsData.auditLog,
    setAuditLog: reportsData.setAuditLog,
    auditLd: reportsData.auditLd,
    setAuditLd: reportsData.setAuditLd,
    evidences: reportsData.evidences,
    setEvidences: reportsData.setEvidences,
    loading,
    setLoading,
    loadCoreData,
    loadMonitoringData,
    loadSaqData: reportsData.loadSaqData,
    loadEvidenceData: reportsData.loadEvidenceData,
    loadKpiData,
    loadAuditData: reportsData.loadAuditData,
    featureData: {
      suppliers: suppliersData,
      complaints: complaintsData,
      reports: reportsData,
    },
    reloads,
    cache,
    requestState,
  };
}
