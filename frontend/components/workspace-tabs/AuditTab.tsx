import React from "react";
import WorkspaceDataState from "../workspace/WorkspaceDataState";
import WorkspaceSectionMeta from "../workspace/WorkspaceSectionMeta";
import WorkspaceActionPrompt from "../workspace/WorkspaceActionPrompt";
import WorkspaceEmptyState from "../workspace/WorkspaceEmptyState";
import WorkspaceModuleGuide from "../workspace/WorkspaceModuleGuide";
import WorkspaceApprovalAging from "../workspace/WorkspaceApprovalAging";
import type { WorkspaceTabProps } from "@/lib/workspace-types";

export default function AuditTab(props: WorkspaceTabProps) {
  const {
    L,
    requestState,
    reloads,
    company,
    suppliers,
    complaints,
    actions,
    events,
    screenings,
    loading,
    expanded,
    editingSup,
    sName,
    setSName,
    sCountry,
    setSCountry,
    sInd,
    setSInd,
    csv,
    setCsv,
    showCapModal,
    setShowCapModal,
    capPara,
    setCapPara,
    triageRes,
    setTriageRes,
    triageLd,
    actionNotes,
    setActionNotes,
    supAI,
    supCAP,
    supLd,
    rYear,
    setRYear,
    draft,
    setDraft,
    draftTs,
    genLd,
    aiMsgs,
    setAiMsgs,
    aiInput,
    setAiInput,
    aiLd,
    saqs,
    saqEmail,
    setSaqEmail,
    saqSup,
    setSaqSup,
    saqDays,
    setSaqDays,
    saqSending,
    kpiLive,
    kpiTrend,
    kpiLd,
    supFilter,
    setSupFilter,
    auditLog,
    auditFilter,
    setAuditFilter,
    auditLd,
    showQuickstart,
    evidences,
    evTitle,
    setEvTitle,
    evType,
    setEvType,
    evLksg,
    setEvLksg,
    evDesc,
    setEvDesc,
    evSupId,
    setEvSupId,
    evFile,
    setEvFile,
    evUploading,
    openAddSupModal,
    openEditSupModal,
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
    chipRL,
    sevChip,
    cStatusChip,
    aStatusChip,
    pChip,
    dueBadge,
    RiskBreakdown,
    setTab,
    fileRef,
    score,
    kpis,
    actionStats,
    workspaceAssist,
    BF,
    approvalMeta
  } = props;

  return (
    <>
      <WorkspaceDataState L={L} requestState={requestState} domains={[
        { key: "audit", label: L === "de" ? "Audit-Protokoll" : "Audit log", onRetry: () => reloads.reloadAudit() },
      ]} />
      <WorkspaceSectionMeta L={L} title={L === "de" ? "Audit-Protokoll" : "Audit log"} requestState={requestState} domains={["audit"]} onRefresh={() => reloads.reloadAudit(auditFilter || undefined)} />
      <WorkspaceModuleGuide
        L={L}
        storageKey="lksg-guide-audit"
        title={L === "de" ? "Modul-Guide: Audit Trail" : "Module guide: audit trail"}
        subtitle={L === "de" ? "Audit ist der Ort, an dem Behauptungen auf Belege treffen." : "Audit is where claims meet evidence."}
        steps={[
          { id: "load", label: L === "de" ? "Audit-Daten laden" : "Load audit data", done: auditLog.length > 0, copy: L === "de" ? "Ohne Verlauf ist Kontrolle mehr Glauben als Governance." : "Without a trail, control is more belief than governance.", actionLabel: L === "de" ? "Neu laden" : "Reload", onAction: () => loadAuditLog() },
          { id: "filter", label: L === "de" ? "Nach Entity filtern" : "Filter by entity", done: !!auditFilter, copy: L === "de" ? "Wenigstens einmal sauber eingrenzen, statt im Log zu schwimmen." : "Filter at least once instead of swimming around in the log." },
          { id: "export", label: L === "de" ? "CSV exportieren" : "Export CSV", done: auditLog.length > 0, copy: L === "de" ? "Wenn jemand Nachweise will, sollte Ihr erster Reflex nicht Panik sein." : "When someone asks for evidence, panic should not be your first workflow.", actionLabel: L === "de" ? "CSV Export" : "Export CSV", onAction: () => exportCSV("/audit/export/csv", "audit-log.csv") },
        ]}
      />
      {auditLog.length === 0 && (
        <WorkspaceActionPrompt
          tone="green"
          title={L === "de" ? "Noch kein Audit-Trail sichtbar" : "No audit trail visible yet"}
          copy={L === "de" ? "Sobald Lieferanten, Beschwerden oder Nachweise geändert werden, tauchen hier Einträge auf. Im Idealfall automatisch. Was für ein Konzept." : "As soon as suppliers, complaints or evidence change, entries will appear here. Ideally automatically. What a concept."}
          actionLabel={L === "de" ? "Neu laden" : "Reload"}
          onAction={() => loadAuditLog(auditFilter || undefined)}
        />
      )}
      <WorkspaceApprovalAging L={L} approval={approvalMeta} onOpenReports={() => setTab("reports")} />
      {(auditLog.some(e => String(e.action || "").toLowerCase().includes("approval")) || approvalMeta.pending > 0) && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="sec-hd" style={{ marginBottom: 10 }}>
            <div>
              <div className="sec-title">{L === "de" ? "Approval-Audit-Fokus" : "Approval audit focus"}<span className="ltag">Workflow</span></div>
              <div className="sec-sub">{L === "de" ? "Freigaben sollten nicht nur existieren, sondern auch alternd sichtbar sein. Erstaunliche Idee, ich weiß." : "Approvals should not only exist, but also age in public view. Shocking, I know."}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
            <span className="stat-pill">{auditLog.filter(e => String(e.action || "").toLowerCase().includes("approval_requested")).length} {L === "de" ? "angefragt" : "requested"}</span>
            <span className="stat-pill">{auditLog.filter(e => String(e.action || "").toLowerCase().includes("approval_approved")).length} {L === "de" ? "freigegeben" : "approved"}</span>
            <span className="stat-pill">{auditLog.filter(e => String(e.action || "").toLowerCase().includes("approval_rejected")).length} {L === "de" ? "abgelehnt" : "rejected"}</span>
            <span className="stat-pill" style={{ color: (approvalMeta.slaBreaches || 0) > 0 ? "#DC2626" : undefined }}>{approvalMeta.slaBreaches || 0} {L === "de" ? "SLA verletzt" : "SLA breached"}</span>
          </div>
        </div>
      )}
      <div className="sec-hd" style={{ marginBottom: 16 }}>
        <div>
          <div className="sec-title">{L === "de" ? "Audit Trail" : "Audit Trail"}<span className="ltag">§10 LkSG</span></div>
          <div className="sec-sub">{L === "de" ? "§10 Abs. 1 LkSG: Unveraenderliche Protokollierung aller Aenderungen. 7 Jahre Aufbewahrungspflicht." : "§10 para. 1 LkSG: Immutable log of all changes. 7-year retention obligation."}</div>
        </div>
        <div className="brow">
          <button className="btn btn-g btn-sm" onClick={() => loadAuditLog(auditFilter || undefined)} disabled={auditLd}>{auditLd ? <span className="spin" /> : "↻"} {L === "de" ? "Aktualisieren" : "Refresh"}</button>
          <select className="sel" style={{ height: 36, fontSize: 13 }} value={auditFilter} onChange={e => { setAuditFilter(e.target.value); loadAuditLog(e.target.value || undefined); }}>
            <option value="">{L === "de" ? "Alle Typen" : "All types"}</option>
            {["supplier","complaint","action_plans","evidence","saq"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="al al-info" style={{ marginBottom: 16 }}>
        <span className="al-icon">&#9724;</span>
        <div style={{ fontSize: 12.5 }}>
          <strong>§10 Abs. 1 LkSG:</strong> {L === "de" ? " Alle Massnahmen zur Einhaltung der Sorgfaltspflichten sind zu dokumentieren und 7 Jahre aufzubewahren." : " All due diligence measures must be documented and retained for 7 years."}
        </div>
      </div>
      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>{L === "de" ? "Zeitpunkt" : "Time"}</th>
                <th>{L === "de" ? "Aktion" : "Action"}</th>
                <th>{L === "de" ? "Entitaet" : "Entity"}</th>
                <th>{L === "de" ? "Name" : "Name"}</th>
                <th>{L === "de" ? "Benutzer" : "User"}</th>
                <th>{L === "de" ? "Aenderung" : "Change"}</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.length > 0 ? auditLog.map(e => {
                const actionColor = e.action === "DELETE" ? "#DC2626" : e.action === "CREATE" ? "#16A34A" : e.action.includes("UPDATE") ? "#2563EB" : "#6B7280";
                return (
                  <tr key={e.id}>
                    <td className="mono" style={{ fontSize: 11, whiteSpace: "nowrap" as React.CSSProperties["whiteSpace"] }}>
                      {new Date(e.created_at).toLocaleString(L === "de" ? "de-DE" : "en-GB", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td><span className="chip" style={{ background: actionColor + "18", color: actionColor, border: "1px solid " + actionColor + "40", fontSize: 10, fontWeight: 800 }}>{e.action}</span></td>
                    <td style={{ fontSize: 11.5, color: "#6B7280" }}>{e.entity_type}</td>
                    <td style={{ fontSize: 12.5, fontWeight: 600, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as React.CSSProperties["whiteSpace"] }}>{e.entity_name || e.entity_id || "-"}</td>
                    <td style={{ fontSize: 11.5, color: "#6B7280", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as React.CSSProperties["whiteSpace"] }}>{e.user_email || "-"}</td>
                    <td style={{ fontSize: 11 }}>
                      {e.old_value && e.new_value && e.new_value.risk_level !== e.old_value.risk_level
                        ? <span style={{ color: "#D97706" }}>{e.old_value.risk_level} &#8594; {e.new_value.risk_level}</span>
                        : e.new_value && e.new_value.risk_score
                        ? <span style={{ color: "#6B7280" }}>Score: {e.new_value.risk_score}</span>
                        : <span style={{ color: "#9CA3AF" }}>-</span>}
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={6} style={{ textAlign: "center" as React.CSSProperties["textAlign"], padding: 32, color: "#9CA3AF", fontSize: 13 }}>
                  {auditLd ? (L === "de" ? "Lade..." : "Loading...") : (L === "de" ? "Noch keine Audit-Eintraege. Erste Aenderungen werden automatisch protokolliert." : "No audit entries yet. First changes will be logged automatically.")}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {auditLog.length > 0 && (
          <div style={{ marginTop: 12, fontSize: 12, color: "#9CA3AF", textAlign: "center" as React.CSSProperties["textAlign"] }}>
            {auditLog.length} {L === "de" ? "Eintraege (max. 200)" : "entries (max. 200)"}
          </div>
        )}
      </div>
    </>
  );
}
