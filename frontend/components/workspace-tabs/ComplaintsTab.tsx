import React from "react";
import WorkspaceDataState from "../workspace/WorkspaceDataState";
import WorkspaceSectionMeta from "../workspace/WorkspaceSectionMeta";
import WorkspaceActionPrompt from "../workspace/WorkspaceActionPrompt";
import WorkspaceEmptyState from "../workspace/WorkspaceEmptyState";
import WorkspaceModuleGuide from "../workspace/WorkspaceModuleGuide";
import WorkspaceModuleReadOnly from "../workspace/WorkspaceModuleReadOnly";
import type { WorkspaceTabProps } from "../../lib/workspace-types";
import { COMPLAINT_CATS } from "../../lib/workspace-constants";
import { canWrite, canManageCases } from "../../lib/workspace-access";
import { getSessionRole } from "../../lib/auth";

export default function ComplaintsTab(props: WorkspaceTabProps) {
  const {
    L,
    requestState,
    reloads,
    company,
    cSup,
    setCSup,
    cCat,
    setCCat,
    cSev,
    setCSev,
    cDesc,
    setCDesc,
    cNotes,
    setCNotes,
    toast,
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
      <WorkspaceDataState L={L} requestState={requestState} domains={[
        { key: "complaints", label: L === "de" ? "Beschwerden" : "Complaints", onRetry: reloads.reloadComplaintsDomain },
        { key: "actions", label: L === "de" ? "Maßnahmen" : "Actions", onRetry: reloads.reloadComplaintsDomain },
      ]} />
      <WorkspaceSectionMeta L={L} title={L === "de" ? "Beschwerden & Maßnahmen" : "Complaints & actions"} requestState={requestState} domains={["complaints", "actions"]} onRefresh={reloads.reloadComplaintsDomain} />
      {!writable && <WorkspaceModuleReadOnly L={L} title={L === "de" ? "Beschwerden sind schreibgeschützt" : "Complaints are read-only"} copy={L === "de" ? "Ihre Rolle darf Fälle sehen, aber keine neuen anlegen oder verändern. Bürokratie, diesmal mit ehrlicher Beschilderung." : "Your role may view cases, but not create or change them. Bureaucracy, now with clearer signage."} actionLabel={L === "de" ? "Zu Audit" : "Open audit"} onAction={() => setTab("audit")} />}
      <WorkspaceModuleGuide
        L={L}
        storageKey="lksg-guide-complaints"
        title={L === "de" ? "Modul-Guide: Beschwerden & CAP" : "Module guide: complaints & CAP"}
        subtitle={L === "de" ? "Hier entscheidet sich, ob der Kanal nur auf der Website existiert oder im Betrieb auch benutzt wird." : "This is where the channel becomes a real process instead of a decorative website feature."}
        steps={[
          { id: "test", label: L === "de" ? "Kanal mit Testfall prüfen" : "Test the channel with one case", done: complaints.length > 0, copy: L === "de" ? "Mindestens ein dokumentierter Fall zeigt, dass der Prozess lebt." : "At least one documented case proves the process is alive." },
          { id: "triage", label: L === "de" ? "Fall priorisieren und triagieren" : "Prioritise and triage a case", done: complaints.some(c => c.status !== "open"), copy: L === "de" ? "Nur Eingang zu protokollieren reicht niemandem, schon gar nicht dem Audit." : "Logging receipt alone satisfies nobody, especially not audit." },
          { id: "cap", label: L === "de" ? "CAP ableiten oder Status schließen" : "Create a CAP or close status cleanly", done: actions.length > 0 || complaints.some(c => c.status === "closed" || c.status === "resolved"), copy: L === "de" ? "Beschwerden ohne Folgeaktion sehen schnell nach Alibi aus." : "Complaints without follow-up quickly start looking cosmetic.", actionLabel: L === "de" ? "CAP öffnen" : "Open CAP", onAction: () => setShowCapModal(true) },
        ]}
      />
      {complaints.length === 0 && (
        <WorkspaceActionPrompt
          tone="blue"
          title={L === "de" ? "Kanal funktioniert nur, wenn ihn jemand testet" : "The channel only works if someone actually tests it"}
          copy={L === "de" ? "Legen Sie einen Testfall an oder reichen Sie eine interne Probe-Beschwerde ein. Sonst merkt der erste echte Fall als Erster, was fehlt." : "Create a test case or submit an internal trial complaint. Otherwise the first real case will discover what is missing."}
          actionLabel={L === "de" ? "Kategorie setzen" : "Set category"}
          onAction={() => setCCat(COMPLAINT_CATS[0]?.v || "human_rights")}
        />
      )}
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10 }}>
        <button className="btn btn-g btn-sm" onClick={() => exportCSV("/complaints/export/csv", "beschwerden.csv")}>&#8595; CSV Export</button>
      </div>
      <div className="sec-hd" style={{ marginBottom: 16 }}>
        <div><div className="sec-title">{L === "de" ? "Beschwerde-Management" : "Complaint Management"}<span className="ltag">§8 LkSG</span></div><div className="sec-sub">{L === "de" ? "§8 Abs. 5: Benachrichtigungsschutz. Automatische E-Mail-Alarmierung bei neuer Beschwerde." : "§8 para. 5: Protection against retaliation. Automatic email alert on new complaint."}</div></div>
      </div>
      <div className="g2">
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-.3px", marginBottom: 4 }}>{L === "de" ? "Neue Beschwerde" : "New Complaint"}</div>
          <div style={{ fontSize: 12.5, color: "#6B7280", marginBottom: 14 }}>{L === "de" ? "Intern einreichen. Zustandiger Admin wird per E-Mail benachrichtigt." : "Submit internally. Responsible admin notified by email."}</div>
          {company && (
            <div style={{ background: "#EDF7F0", border: "1px solid #C6E4CE", borderRadius: 10, padding: "12px 14px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#1B3D2B", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 3 }}>{L === "de" ? "Externes Beschwerdeportal" : "External Complaints Portal"}</div>
                <div style={{ fontSize: 12, color: "#374151" }}>{L === "de" ? "Fur Lieferanten, Mitarbeiter und NGOs -- anonim moeglich" : "For suppliers, employees and NGOs -- anonymous possible"}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-g btn-sm" onClick={() => { const u = (typeof window !== "undefined" ? window.location.origin : "") + "/complaints/" + company.slug; navigator.clipboard.writeText(u).then(() => toast("ok", L === "de" ? "Link kopiert" : "Link copied")); }}>&#128203; {L === "de" ? "Link kopieren" : "Copy link"}</button>
                <a className="btn btn-g btn-sm" href={"/complaints/" + company.slug} target="_blank">&#8599; {L === "de" ? "Offnen" : "Open"}</a>
              </div>
            </div>
          )}
          <div className="fl"><label>{L === "de" ? "Lieferant (optional)" : "Supplier (optional)"}</label><select className="sel" value={cSup} onChange={e => setCSup(e.target.value)} disabled={!writable}><option value="">{L === "de" ? "-- kein spezifischer Lieferant --" : "-- no specific supplier --"}</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div className="inp-row">
            <div className="fl"><label>{L === "de" ? "Kategorie (§2 LkSG)" : "Category (§2 LkSG)"}</label><select className="sel" value={cCat} onChange={e => setCCat(e.target.value)} disabled={!writable}>{COMPLAINT_CATS.map(c => <option key={c.v} value={c.v}>{L === "de" ? c.de : c.en}</option>)}</select></div>
            <div className="fl"><label>{L === "de" ? "Schweregrad" : "Severity"}</label><select className="sel" value={cSev} onChange={e => setCSev(e.target.value)} disabled={!writable}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
          </div>
          <div className="fl"><label>{L === "de" ? "Sachverhalt *" : "Description *"}</label><textarea className="ta" rows={5} value={cDesc} onChange={e => setCDesc(e.target.value)} disabled={!writable} placeholder={L === "de" ? "Was, wo, wann, wer? Konkrete Schilderung des Vorfalls." : "What, where, when, who? Concrete description of the incident."} /></div>
          <div className="brow">
            <button className="btn btn-p" style={{ flex: 1 }} onClick={submitComplaint} disabled={!cDesc.trim() || !writable}>&#10148; {L === "de" ? "Einreichen" : "Submit"}</button>
            <button className="btn btn-ai btn-sm" onClick={triageComplaint} disabled={triageLd || !cDesc.trim() || !canManage}>{triageLd ? <span className="spin" /> : "&#9998;"} Triage</button>
          </div>
          {triageRes && <div style={{ background: "#fff", border: "1px solid #C6E4CE", borderRadius: 10, padding: 14, marginTop: 12, fontSize: 12.5, lineHeight: 1.7, whiteSpace: "pre-wrap" }}><strong style={{ color: "#1B3D2B", fontSize: 10, textTransform: "uppercase", letterSpacing: ".6px" }}>{L === "de" ? "KI-Triage (§8 LkSG):" : "AI Triage (§8 LkSG):"}{"\n"}</strong>{triageRes}</div>}
        </div>

        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-.3px", marginBottom: 14 }}>{L === "de" ? "Eingegangene Beschwerden" : "Received Complaints"} <span style={{ color: "#9CA3AF", fontWeight: 600 }}>({complaints.length})</span></div>
          {complaints.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {(["open","in_review","resolved","closed"] as const).map(s => {
                const n = complaints.filter(c => c.status === s).length;
                return n > 0 ? <span key={s} className="stat-pill">{s}: {n}</span> : null;
              })}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {complaints.map(c => {
              const cat = COMPLAINT_CATS.find(x => x.v === c.category);
              const isExp = expanded === c.id;
              return (
                <div key={c.id} className="card-sm" style={{ borderLeft: `3px solid ${c.severity === "critical" || c.severity === "high" ? "#DC2626" : c.severity === "medium" ? "#D97706" : "#16A34A"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, cursor: "pointer" }} onClick={() => setExpanded(isExp ? null : c.id)}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{cat ? (L === "de" ? cat.de : cat.en) : c.category}</div>
                      <div style={{ fontSize: 11.5, color: "#6B7280", display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {c.reference_number && <span className="mono">{c.reference_number}</span>}
                        {c.supplier_name && <span>&#127970; {c.supplier_name}</span>}
                        <span>{new Date(c.created_at).toLocaleDateString(L === "de" ? "de-DE" : "en-GB")}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap", flexShrink: 0 }}>
                      {sevChip(c.severity || "medium")}
                      {cStatusChip(c.status)}
                    </div>
                  </div>
                  {isExp && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #E2E8E2" }}>
                      <div style={{ fontSize: 13, lineHeight: 1.7, color: "#374151", marginBottom: 10 }}>{c.description}</div>
                      <div className="brow" style={{ marginBottom: 10 }}>
                        {c.status === "open"          && <button className="btn btn-g btn-xs" onClick={() => canManage && updateComplaintStatus(c.id, "in_review")} disabled={!canManage}>{L === "de" ? "In Prufung" : "Review"}</button>}
                        {c.status === "in_review"     && <button className="btn btn-g btn-xs" onClick={() => canManage && updateComplaintStatus(c.id, "investigating")} disabled={!canManage}>{L === "de" ? "Ermittlung" : "Investigate"}</button>}
                        {c.status === "investigating" && <button className="btn btn-p btn-xs" onClick={() => canManage && updateComplaintStatus(c.id, "resolved")} disabled={!canManage}>&#10003; {L === "de" ? "Geloest" : "Resolve"}</button>}
                        {c.status === "resolved"      && <button className="btn btn-g btn-xs" onClick={() => canManage && updateComplaintStatus(c.id, "closed")} disabled={!canManage}>{L === "de" ? "Schliessen" : "Close"}</button>}
                        <button className="btn btn-ai btn-xs" onClick={() => { if (!canManage) return; setCDesc(c.description); setCCat(c.category); setCSev(c.severity); triageComplaint(); }} disabled={!canManage}>&#9998; {L === "de" ? "KI-Analyse" : "AI Analyse"}</button>
                      </div>
                      <div className="fl" style={{ marginBottom: 0 }}>
                        <label>{L === "de" ? "Interne Notiz (nicht sichtbar fur Einreicher)" : "Internal note (not visible to submitter)"}</label>
                        <textarea className="ta" rows={2} value={cNotes[c.id] ?? (c.internal_notes || "")} onChange={e => setCNotes(n => ({ ...n, [c.id]: e.target.value }))} disabled={!canManage} placeholder={L === "de" ? "Interne Bearbeitung, Entscheidungen..." : "Internal handling, decisions..."} />
                        <button className="btn btn-g btn-xs" style={{ marginTop: 5 }} onClick={() => canManage && saveComplaintNote(c.id)} disabled={!canManage}>&#10003; {L === "de" ? "Speichern" : "Save"}</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {!complaints.length && <WorkspaceEmptyState L={L} compact icon="✉️" title={L === "de" ? "Keine Beschwerden" : "No complaints"} copy={L === "de" ? "Der Kanal ist aktiv, aber aktuell liegt noch kein Fall vor. Das ist gut. Oder niemand hat ihn getestet." : "The channel is active, but there is no case yet. That is good. Or nobody tested it."} />}
          </div>
        </div>
      </div>
    </>
  );
}
