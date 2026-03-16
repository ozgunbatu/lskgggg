"use client";
import { useMemo } from "react";
import { clearToken, getToken } from "@/lib/auth";
import { createApiClient } from "@/lib/api";
import WorkspaceNav from "./workspace/WorkspaceNav";
import WorkspaceHeader from "./workspace/WorkspaceHeader";
import WorkspaceFocus from "./workspace/WorkspaceFocus";
import WorkspaceToasts from "./workspace/WorkspaceToasts";
import SupplierModal from "./workspace/SupplierModal";
import CapModal from "./workspace/CapModal";
import AuthSplash from "./workspace/AuthSplash";
import DashboardTab from "./workspace-tabs/DashboardTab";
import SuppliersTab from "./workspace-tabs/SuppliersTab";
import ActionsTab from "./workspace-tabs/ActionsTab";
import ComplaintsTab from "./workspace-tabs/ComplaintsTab";
import ReportsTab from "./workspace-tabs/ReportsTab";
import SaqTab from "./workspace-tabs/SaqTab";
import KpiTab from "./workspace-tabs/KpiTab";
import EvidenceTab from "./workspace-tabs/EvidenceTab";
import MonitoringTab from "./workspace-tabs/MonitoringTab";
import AiTab from "./workspace-tabs/AiTab";
import AuditTab from "./workspace-tabs/AuditTab";
import SettingsTab from "./workspace-tabs/SettingsTab";
import LegalTab from "./workspace-tabs/LegalTab";
import useWorkspaceStore from "@/hooks/useWorkspaceStore";
import useWorkspaceSession from "@/hooks/useWorkspaceSession";
import { COUNTRIES, INDUSTRIES, BAFA_DE, BAFA_EN, gradeColor, gradeLabel } from "@/lib/workspace-constants";
import { WORKSPACE_CSS, WORKSPACE_STAGE_V52_CSS, WORKSPACE_STAGE_V57_CSS } from "@/lib/workspace-styles";
import { chipRL, sevChip, cStatusChip, aStatusChip, pChip, dueBadge } from "@/lib/workspace-ui";
import RiskBreakdownComponent from "./workspace/RiskBreakdown";
import type { Supplier, TabId } from "@/lib/workspace-types";
import useWorkspaceFeatureSlices from "@/hooks/useWorkspaceFeatureSlices";
import useReportApprovals from "@/hooks/useReportApprovals";

const CSS = WORKSPACE_CSS + WORKSPACE_STAGE_V52_CSS + WORKSPACE_STAGE_V57_CSS;

export default function AppWorkspace({ initialTab = "dashboard" }: { initialTab?: TabId }) {
  const api = useMemo(() => createApiClient(getToken, () => {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/login";
  }), []);

  const { ui, runtime, data, mutations, derived, modalActions, featureState, featureMutations, featureData, toast } = useWorkspaceStore({ api, initialTab });
  const approvals = useReportApprovals();

  const { dismissQuickstart, changeLang, logout } = useWorkspaceSession({
    mounted: runtime.mounted,
    setMounted: runtime.setMounted,
    authChecking: runtime.authChecking,
    setAuthChecking: runtime.setAuthChecking,
    tab: runtime.tab,
    draft: runtime.draft,
    aiMsgs: runtime.aiMsgs,
    aiEnd: runtime.aiEnd,
    setL: ui.setL,
    setShowQuickstart: ui.setShowQuickstart,
    loadCoreData: data.loadCoreData,
    loadMonitoringData: data.loadMonitoringData,
    loadSaqData: data.loadSaqData,
    loadEvidenceData: data.loadEvidenceData,
    loadDraft: mutations.loadDraft,
    loadKpi: mutations.loadKpi,
    loadAuditLog: mutations.loadAuditLog,
  });

  if (!runtime.mounted) return null;

  const sc = derived.score.score;
  const sg = derived.score.grade;
  const scCol = gradeColor(sg);
  const BF = ui.L === "de" ? BAFA_DE : BAFA_EN;
  const workspaceFocus = derived.workspaceAssist.cards;

  const boundSevChip = (severity: string) => sevChip(severity);
  const boundComplaintStatusChip = (status: string) => cStatusChip(status, ui.L);
  const boundActionStatusChip = (status: string) => aStatusChip(status, ui.L);
  const boundPriorityChip = (priority: string) => pChip(priority);
  const boundDueBadge = (dueDate?: string | null) => dueBadge(dueDate, ui.L);
  const BoundRiskBreakdown = ({ sup, compact = false }: { sup: Supplier; compact?: boolean }) => (
    <RiskBreakdownComponent sup={sup} compact={compact} L={ui.L} hoverParam={ui.hoverParam} setHoverParam={ui.setHoverParam} />
  );

  const {
    dashboardCtx,
    suppliersCtx,
    actionsCtx,
    complaintsCtx,
    reportsCtx,
    saqCtx,
    kpiCtx,
    evidenceCtx,
    monitoringCtx,
    aiCtx,
    auditCtx,
  } = useWorkspaceFeatureSlices({
    ui,
    runtime,
    data,
    mutations,
    derived,
    modalActions,
    featureState,
    featureMutations,
    featureData,
    toast,
    approvalMeta: approvals,
    BF,
    chipRL,
    sevChip: boundSevChip,
    cStatusChip: boundComplaintStatusChip,
    aStatusChip: boundActionStatusChip,
    pChip: boundPriorityChip,
    dueBadge: boundDueBadge,
    RiskBreakdown: BoundRiskBreakdown,
  });


  if (!runtime.mounted || runtime.authChecking || !getToken()) {
    return <AuthSplash />;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <WorkspaceToasts toasts={ui.toasts} />

      <SupplierModal
        open={ui.showSupModal}
        L={ui.L}
        editingSup={ui.editingSup}
        loading={data.loading}
        sName={ui.sName}
        setSName={ui.setSName}
        sCountry={ui.sCountry}
        setSCountry={ui.setSCountry}
        sInd={ui.sInd}
        setSInd={ui.setSInd}
        sSpend={ui.sSpend}
        setSSpend={ui.setSSpend}
        sWorkers={ui.sWorkers}
        setSWorkers={ui.setSWorkers}
        sCerts={ui.sCerts}
        setSCerts={ui.setSCerts}
        sSubSup={ui.sSubSup}
        setSSubSup={ui.setSSubSup}
        sTransp={ui.sTransp}
        setSTransp={ui.setSTransp}
        sAudit={ui.sAudit}
        setSAudit={ui.setSAudit}
        sCoc={ui.sCoc}
        setSCoc={ui.setSCoc}
        sViolations={ui.sViolations}
        setSViolations={ui.setSViolations}
        sNotes={ui.sNotes}
        setSNotes={ui.setSNotes}
        countries={COUNTRIES}
        industries={INDUSTRIES}
        onClose={() => ui.setShowSupModal(false)}
        onSave={mutations.saveSupplier}
      />

      <CapModal
        open={ui.showCapModal}
        L={ui.L}
        capSup={ui.capSup}
        setCapSup={ui.setCapSup}
        capTitle={ui.capTitle}
        setCapTitle={ui.setCapTitle}
        capDesc={ui.capDesc}
        setCapDesc={ui.setCapDesc}
        capPara={ui.capPara}
        setCapPara={ui.setCapPara}
        capDue={ui.capDue}
        setCapDue={ui.setCapDue}
        capPri={ui.capPri}
        setCapPri={ui.setCapPri}
        capAssign={ui.capAssign}
        setCapAssign={ui.setCapAssign}
        suppliers={data.suppliers}
        onClose={() => ui.setShowCapModal(false)}
        onCreate={mutations.createCap}
      />

      <WorkspaceNav
        L={ui.L}
        tab={runtime.tab}
        company={data.company}
        complaints={data.complaints}
        actionOverdue={derived.actionStats.overdue}
        approvalPending={approvals.pending}
        setTab={runtime.setTab}
        changeLang={changeLang}
        logout={logout}
      />

      <div className="pg"><div className="workspace-shell">
        <WorkspaceHeader L={ui.L} tab={runtime.tab} workspaceMeta={derived.workspaceMeta} setTab={runtime.setTab} />
        <WorkspaceFocus cards={workspaceFocus} />
        {runtime.tab === "dashboard" && <DashboardTab {...dashboardCtx} dismissQuickstart={dismissQuickstart} workspaceFocus={workspaceFocus} gradeLabel={gradeLabel} scCol={scCol} sc={sc} sg={sg} setExpanded={ui.setExpanded} setEditingSup={ui.setEditingSup} setShowSupModal={ui.setShowSupModal} COUNTRIES={COUNTRIES} INDUSTRIES={INDUSTRIES} />}
        {runtime.tab === "suppliers" && <SuppliersTab {...suppliersCtx} />}
        {runtime.tab === "actions" && <ActionsTab {...actionsCtx} />}
        {runtime.tab === "complaints" && <ComplaintsTab {...complaintsCtx} />}
        {runtime.tab === "reports" && <ReportsTab {...reportsCtx} />}
        {runtime.tab === "saq" && <SaqTab {...saqCtx} />}
        {runtime.tab === "kpi" && <KpiTab {...kpiCtx} />}
        {runtime.tab === "evidence" && <EvidenceTab {...evidenceCtx} />}
        {runtime.tab === "monitoring" && <MonitoringTab {...monitoringCtx} />}
        {runtime.tab === "ai" && <AiTab {...aiCtx} />}
        {runtime.tab === "audit" && <AuditTab {...auditCtx} />}
        {runtime.tab === "legal" && <LegalTab {...{L:ui.L,apiFn:api,toastFn:toast} as any} />}
        {runtime.tab === "settings" && <SettingsTab L={ui.L} company={data.company} apiFn={api} toastFn={toast} />}
      </div></div>
    </>
  );
}
