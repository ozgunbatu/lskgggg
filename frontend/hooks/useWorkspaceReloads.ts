"use client";

import { useCallback, useRef } from "react";
import type useWorkspaceCache from "./useWorkspaceCache";
import { auditKey, queryGroups, queryKeys } from "@/lib/workspace-query-keys";

type AsyncFn<T = any> = (opts?: { force?: boolean }) => Promise<T>;

export default function useWorkspaceReloads({
  cache,
  loadCompany,
  loadSuppliers,
  loadComplaints,
  loadActions,
  loadSaqData,
  loadEvidenceData,
  loadMonitoringData,
  loadKpiData,
  loadAuditData,
}: {
  cache: ReturnType<typeof useWorkspaceCache>;
  loadCompany: AsyncFn;
  loadSuppliers: AsyncFn;
  loadComplaints: AsyncFn;
  loadActions: AsyncFn;
  loadSaqData: AsyncFn;
  loadEvidenceData: AsyncFn;
  loadMonitoringData: AsyncFn;
  loadKpiData: AsyncFn;
  loadAuditData: (entityType?: string, opts?: { force?: boolean }) => Promise<any>;
}) {
  // Stable refs — always point to the latest version without re-creating callbacks
  const r = useRef({
    loadCompany, loadSuppliers, loadComplaints, loadActions,
    loadSaqData, loadEvidenceData, loadMonitoringData, loadKpiData, loadAuditData,
  });
  r.current = { loadCompany, loadSuppliers, loadComplaints, loadActions,
    loadSaqData, loadEvidenceData, loadMonitoringData, loadKpiData, loadAuditData };

  const reloadSuppliersDomain = useCallback(async () => {
    cache.invalidateMany([...queryGroups.suppliers]);
    await Promise.all([r.current.loadCompany({ force: true }), r.current.loadSuppliers({ force: true })]);
  }, [cache]); // eslint-disable-line react-hooks/exhaustive-deps

  const reloadComplaintsDomain = useCallback(async () => {
    cache.invalidateMany([...queryGroups.complaints]);
    await Promise.all([r.current.loadComplaints({ force: true }), r.current.loadActions({ force: true })]);
  }, [cache]); // eslint-disable-line react-hooks/exhaustive-deps

  const reloadReportsDomain = useCallback(async () => {
    cache.invalidateMany([...queryGroups.reports]);
    await Promise.all([r.current.loadSaqData({ force: true }), r.current.loadEvidenceData({ force: true })]);
  }, [cache]); // eslint-disable-line react-hooks/exhaustive-deps

  const reloadComplianceCore = useCallback(async () => {
    await Promise.all([reloadSuppliersDomain(), reloadComplaintsDomain(), reloadReportsDomain()]);
  }, [reloadSuppliersDomain, reloadComplaintsDomain, reloadReportsDomain]);

  const reloadInsights = useCallback(async () => {
    cache.invalidateMany([queryKeys.insights, queryKeys.kpi]);
    await Promise.all([r.current.loadMonitoringData({ force: true }), r.current.loadKpiData({ force: true })]);
  }, [cache]); // eslint-disable-line react-hooks/exhaustive-deps

  const reloadAudit = useCallback(async (entityType?: string) => {
    cache.invalidate(auditKey(entityType));
    await r.current.loadAuditData(entityType, { force: true });
  }, [cache]); // eslint-disable-line react-hooks/exhaustive-deps

  return { reloadSuppliersDomain, reloadComplaintsDomain, reloadReportsDomain, reloadComplianceCore, reloadInsights, reloadAudit };
}
