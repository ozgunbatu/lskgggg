import React from "react";
import WorkspaceModuleReadOnly from "../workspace/WorkspaceModuleReadOnly";
import type { WorkspaceTabProps } from "../../lib/workspace-types";
import { canWrite, canManageCases } from "../../lib/workspace-access";
import { getSessionRole } from "../../lib/auth";

export default function ActionsTab(props: WorkspaceTabProps) {
  const {
    L,
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
  const role = props.approvalMeta?.currentRole || getSessionRole();

  const writable = canWrite(approvalMeta.currentRole);
  const canManage = canManageCases(approvalMeta.currentRole);

  return (
    <>
      {!canWrite(role) && <WorkspaceModuleReadOnly L={L} title={L === "de" ? "Maßnahmen sind schreibgeschützt" : "Actions are read-only"} copy={L === "de" ? "Sie dürfen offene Maßnahmen sehen, aber nicht ändern. Tragisch effizient." : "You can view open actions, but not change them. Tragic, but efficient."} actionLabel={L === "de" ? "KPI öffnen" : "Open KPI"} onAction={() => props.setTab("kpi")} />}
      {!writable && <div className="al al-warn" style={{ marginBottom: 12 }}><span className="al-icon">!</span><div style={{ fontSize: 12.5 }}>{L === "de" ? "Diese Rolle darf Maßnahmen sehen, aber nicht anlegen oder ändern." : "This role may view actions, but not create or change them."}</div></div>}
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10 }}>
        <button className="btn btn-g btn-sm" onClick={() => exportCSV("/actions/export/csv", "massnahmen.csv")}>&#8595; CSV Export</button>
      </div>
      <div className="sec-hd" style={{ marginBottom: 16 }}>
        <div><div className="sec-title">{L === "de" ? "Aktionsplan (CAP)" : "Action Center (CAP)"}<span className="ltag">§6-7 LkSG</span></div><div className="sec-sub">{L === "de" ? "Corrective Action Plans nach §6 LkSG. Abgeschlossene Massnahmen koennen nicht geloescht werden (§10 Audit Trail)." : "Corrective Action Plans under §6 LkSG. Completed measures cannot be deleted (§10 audit trail)."}</div></div>
        <div className="brow">
          <button className="btn btn-ai btn-sm" onClick={() => canManage && sendAi(L === "de" ? "Welche meiner CAPs sind am dringlichsten? Analysiere nach Risiko, Frist und LkSG-Paragraf." : "Which of my CAPs are most urgent? Analyse by risk, deadline and LkSG paragraph.")}>&#9998; {L === "de" ? "KI-Priorisierung" : "AI Prioritise"}</button>
          <button className="btn btn-p" onClick={() => canManage && setShowCapModal(true)} disabled={!canManage}>+ {L === "de" ? "Neuer CAP" : "New CAP"}</button>
        </div>
      </div>
      <div className="kpi-row" style={{ marginBottom: 18 }}>
        {[
          { lbl: L === "de" ? "Offen" : "Open",         val: actionStats.open,    col: actionStats.open > 0 ? "#D97706" : "#16A34A" },
          { lbl: L === "de" ? "Uberfaellig" : "Overdue", val: actionStats.overdue, col: actionStats.overdue > 0 ? "#DC2626" : "#6B7280" },
          { lbl: L === "de" ? "Abgeschlossen" : "Done",  val: actionStats.done,    col: "#16A34A" },
          { lbl: L === "de" ? "Gesamt" : "Total",        val: actionStats.total,   col: "#1B3D2B" },
        ].map(k => (
          <div key={k.lbl} className="kpi"><div className="kpi-accent" style={{ background: k.col }} /><div className="kpi-lbl">{k.lbl}</div><div className="kpi-val" style={{ color: k.col }}>{k.val}</div></div>
        ))}
      </div>
      {actionStats.total > 0 && (
        <div className="card-xs" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 8 }}>{L === "de" ? "Gesamtfortschritt" : "Overall progress"}</div>
          <div className="prog" style={{ height: 8 }}>
            <div className="prog-fill" style={{ width: `${actionStats.total > 0 ? Math.round(actionStats.done / actionStats.total * 100) : 0}%`, background: "#16A34A" }} />
          </div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 5 }}>{actionStats.done}/{actionStats.total} -- {actionStats.total > 0 ? Math.round(actionStats.done / actionStats.total * 100) : 0}%</div>
        </div>
      )}
      {actions.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {actions.map(a => {
            const isExp = expanded === a.id;
            const days = (d: string | null) => { if (!d) return null; return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); };
            const d = days(a.due_date);
            const isOD = d !== null && d < 0 && a.status !== "completed" && a.status !== "closed";
            return (
              <div key={a.id} className="card-sm" style={{ borderLeft: `3px solid ${isOD ? "#DC2626" : priorityColor(a.priority)}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, cursor: "pointer" }} onClick={() => setExpanded(isExp ? null : a.id)}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, flexWrap: "wrap" }}>
                      <strong style={{ fontSize: 14, letterSpacing: "-.2px" }}>{a.title}</strong>
                      {pChip(a.priority)}
                      {aStatusChip(a.status)}
                      {dueBadge(a.due_date)}
                    </div>
                    <div style={{ fontSize: 12, color: "#6B7280", display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {a.supplier_name && <span>&#127970; {a.supplier_name}</span>}
                      <span>§{a.lksg_paragraph} LkSG</span>
                      {a.assigned_to && <span>&#128100; {a.assigned_to}</span>}
                      {a.due_date && <span>&#128197; {new Date(a.due_date).toLocaleDateString(L === "de" ? "de-DE" : "en-GB")}</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: "#9CA3AF", flexShrink: 0 }}>{isExp ? "&#9650;" : "&#9660;"}</span>
                </div>
                {isExp && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #E2E8E2" }}>
                    {a.description && <div style={{ fontSize: 13, color: "#4B5563", marginBottom: 12, lineHeight: 1.7 }}>{a.description}</div>}
                    <div className="brow" style={{ marginBottom: 12 }}>
                      {a.status !== "completed" && a.status !== "closed" && <>
                        {a.status === "open" && <button className="btn btn-g btn-sm" onClick={() => canManage && updateActionStatus(a.id, "in_progress")} disabled={!canManage}>{L === "de" ? "Starten" : "Start"}</button>}
                        {a.status === "in_progress" && <button className="btn btn-p btn-sm" onClick={() => canManage && updateActionStatus(a.id, "completed")} disabled={!canManage}>&#10003; {L === "de" ? "Abschliessen" : "Complete"}</button>}
                        <button className="btn btn-r btn-xs" onClick={() => canManage && deleteAction(a.id, a.title)} disabled={!canManage}>x {L === "de" ? "Loeschen" : "Delete"}</button>
                      </>}
                      {(a.status === "completed" || a.status === "closed") && <div className="al-ok al" style={{ padding: "5px 12px", marginBottom: 0, fontSize: 12.5, flex: 1 }}>&#10003; {L === "de" ? "Abgeschlossen" : "Completed"} {a.completed_at ? new Date(a.completed_at).toLocaleDateString(L === "de" ? "de-DE" : "en-GB") : ""}</div>}
                    </div>
                    <div className="fl" style={{ marginBottom: 0 }}>
                      <label>{L === "de" ? "Nachweis / KPI-Notiz (§9 LkSG Wirksamkeit)" : "Evidence / KPI note (§9 LkSG effectiveness)"}</label>
                      <textarea className="ta" rows={3} value={actionNotes[a.id] ?? (a.evidence_notes || "")} onChange={e => setActionNotes(n => ({ ...n, [a.id]: e.target.value }))} disabled={!canManage} placeholder={L === "de" ? "z.B. Audit am 01.06. Befund: Lieferant hat 3 von 5 Massnahmen umgesetzt..." : "e.g. Audit on 01.06. Finding: supplier implemented 3 of 5 measures..."} />
                      <button className="btn btn-g btn-xs" style={{ marginTop: 6 }} onClick={() => canManage && saveActionNote(a.id)} disabled={!canManage}>&#10003; {L === "de" ? "Speichern" : "Save"}</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty card"><div className="empty-ic">&#9989;</div><div className="empty-t">{L === "de" ? "Keine Aktionsplaene" : "No action plans"}</div><button className="btn btn-p btn-sm" style={{ marginTop: 12 }} onClick={() => canManage && setShowCapModal(true)} disabled={!canManage}>+ {L === "de" ? "Ersten CAP anlegen" : "Create first CAP"}</button></div>
      )}
    </>
  );
}
