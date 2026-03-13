"use client";

import { useCallback } from "react";
import type useWorkspaceCache from "./useWorkspaceCache";
import { auditKey, queryGroups, queryKeys } from "../lib/workspace-query-keys";

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
  const reloadSuppliersDomain = useCallback(async () => {
    cache.invalidateMany([...queryGroups.suppliers]);
    await Promise.all([loadCompany({ force: true }), loadSuppliers({ force: true })]);
  }, [cache, loadCompany, loadSuppliers]);

  const reloadComplaintsDomain = useCallback(async () => {
    cache.invalidateMany([...queryGroups.complaints]);
    await Promise.all([loadComplaints({ force: true }), loadActions({ force: true })]);
  }, [cache, loadComplaints, loadActions]);

  const reloadReportsDomain = useCallback(async () => {
    cache.invalidateMany([...queryGroups.reports]);
    await Promise.all([loadSaqData({ force: true }), loadEvidenceData({ force: true })]);
  }, [cache, loadSaqData, loadEvidenceData]);

  const reloadComplianceCore = useCallback(async () => {
    await Promise.all([
      reloadSuppliersDomain(),
      reloadComplaintsDomain(),
      reloadReportsDomain(),
    ]);
  }, [reloadComplaintsDomain, reloadReportsDomain, reloadSuppliersDomain]);

  const reloadInsights = useCallback(async () => {
    cache.invalidateMany([queryKeys.insights, queryKeys.kpi]);
    await Promise.all([loadMonitoringData({ force: true }), loadKpiData({ force: true })]);
  }, [cache, loadMonitoringData, loadKpiData]);

  const reloadAudit = useCallback(async (entityType?: string) => {
    cache.invalidate(auditKey(entityType));
    await loadAuditData(entityType, { force: true });
  }, [cache, loadAuditData]);

  return {
    reloadSuppliersDomain,
    reloadComplaintsDomain,
    reloadReportsDomain,
    reloadComplianceCore,
    reloadInsights,
    reloadAudit,
  };
}
