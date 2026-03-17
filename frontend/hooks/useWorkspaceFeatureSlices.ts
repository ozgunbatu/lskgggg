"use client";

import { useMemo } from "react";
import buildWorkspaceBaseCtx, { type WorkspaceFeatureSliceArgs } from "./feature-slices/buildWorkspaceBaseCtx";

export default function useWorkspaceFeatureSlices(args: WorkspaceFeatureSliceArgs) {
  const { data, derived, runtime, ui } = args;

  // ── BASE CONTEXT ──────────────────────────────────────────────────────────
  // Memoized on data values + UI values that actually change.
  // NO intermediate plain-object hook results in the dep list.
  const baseCtx = useMemo(
    () => buildWorkspaceBaseCtx(args),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // Data arrays — each is a stable array ref that only changes on fetch
      data.suppliers, data.complaints, data.actions, data.saqs,
      data.evidences, data.events, data.screenings, data.auditLog,
      data.company, data.loading, data.kpiLive, data.kpiTrend,
      // Runtime values
      runtime.tab, runtime.draft, runtime.draftTs, runtime.rYear,
      runtime.aiMsgs, runtime.aiInput, runtime.aiLd, runtime.genLd,
      runtime.saqEmail, runtime.saqSup, runtime.saqDays, runtime.saqSending,
      runtime.kpiLd, runtime.auditFilter,
      // UI values (state values, not setters)
      ui.L, ui.showCapModal, ui.capPara, ui.showQuickstart,
      ui.supFilter, ui.triageRes, ui.triageLd, ui.actionNotes,
      ui.supAI, ui.supCAP, ui.supLd, ui.hoverParam,
      ui.evTitle, ui.evType, ui.evLksg, ui.evDesc, ui.evSupId, ui.evFile, ui.evUploading,
      ui.cSup, ui.cCat, ui.cSev, ui.cDesc, ui.cNotes,
      // Derived — useMemo results, stable when inputs unchanged
      derived.score, derived.kpis, derived.actionStats, derived.workspaceAssist,
      derived.quickstartSteps, derived.quickstartDone, derived.workspaceMeta,
      // Passed-in stable values
      args.approvalMeta, args.BF,
      // These are now stable useCallback references from AppWorkspace
      args.toast, args.chipRL,
      args.sevChip, args.cStatusChip, args.aStatusChip, args.pChip,
      args.dueBadge, args.RiskBreakdown,
      // These are stable useMemo results from useWorkspaceStore
      args.modalActions, args.featureMutations, args.featureState,
      // mutations are useCallback — stable
      args.mutations,
    ]
  );

  // ── TAB CONTEXTS ──────────────────────────────────────────────────────────
  // Each tab gets either base or a sorted variant. All wrapped in useMemo
  // so they don't produce new object references on unrelated renders.

  const suppliersCtx = useMemo(() => ({
    ...baseCtx,
    suppliers: [...baseCtx.suppliers].sort((a, b) => {
      if (b.risk_score !== a.risk_score) return b.risk_score - a.risk_score;
      return a.name.localeCompare(b.name);
    }),
  }), [baseCtx]); // eslint-disable-line react-hooks/exhaustive-deps

  const complaintsCtx = useMemo(() => {
    const pri: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    return {
      ...baseCtx,
      complaints: [...baseCtx.complaints].sort((a, b) => {
        const sg = (pri[b.severity] || 0) - (pri[a.severity] || 0);
        if (sg !== 0) return sg;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
    };
  }, [baseCtx]); // eslint-disable-line react-hooks/exhaustive-deps

  const reportsCtx = useMemo(() => baseCtx, [baseCtx]);

  return {
    dashboardCtx:  baseCtx,
    suppliersCtx,
    actionsCtx:    baseCtx,
    complaintsCtx,
    reportsCtx,
    saqCtx:        baseCtx,
    kpiCtx:        baseCtx,
    evidenceCtx:   baseCtx,
    monitoringCtx: baseCtx,
    aiCtx:         baseCtx,
    auditCtx:      baseCtx,
  };
}
