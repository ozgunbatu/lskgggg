import React from "react";
import WorkspaceDataState from "../workspace/WorkspaceDataState";
import WorkspaceSectionMeta from "../workspace/WorkspaceSectionMeta";
import WorkspaceActionPrompt from "../workspace/WorkspaceActionPrompt";
import WorkspaceEmptyState from "../workspace/WorkspaceEmptyState";
import WorkspaceModuleGuide from "../workspace/WorkspaceModuleGuide";
import WorkspaceModuleReadOnly from "../workspace/WorkspaceModuleReadOnly";
import type { WorkspaceTabProps } from "../../lib/workspace-types";
import { canWrite } from "../../lib/workspace-access";
import { getSessionRole } from "../../lib/auth";

export default function SuppliersTab(props: WorkspaceTabProps) {
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
  const role = props.approvalMeta?.currentRole || getSessionRole();

  const writable = canWrite(approvalMeta.currentRole);

  return (
    <>
      <WorkspaceDataState L={L} requestState={requestState} domains={[
        { key: "company", label: L === "de" ? "Unternehmensprofil" : "Company profile", onRetry: reloads.reloadSuppliersDomain },
        { key: "suppliers", label: L === "de" ? "Lieferanten" : "Suppliers", onRetry: reloads.reloadSuppliersDomain },
      ]} />
      <WorkspaceSectionMeta L={L} title={L === "de" ? "Lieferanten-Domain" : "Suppliers domain"} requestState={requestState} domains={["company", "suppliers"]} onRefresh={reloads.reloadSuppliersDomain} />
      {!canWrite(role) && <WorkspaceModuleReadOnly L={L} title={L === "de" ? "Lieferanten sind schreibgeschützt" : "Suppliers are read-only"} copy={L === "de" ? "Mit Ihrer aktuellen Rolle dürfen Sie Lieferanten sehen, aber nicht ändern. Wenigstens bleibt der Datenfriedhof ordentlich." : "Your current role can view suppliers, but not change them. At least the supplier graveyard remains tidy."} actionLabel={L === "de" ? "Reports öffnen" : "Open reports"} onAction={() => props.setTab("reports")} />}
      {!writable && <WorkspaceActionPrompt tone="amber" title={L === "de" ? "Schreibzugriff ist hier gesperrt" : "Write access is locked here"} copy={L === "de" ? "Ihre Rolle darf Lieferanten lesen, aber nicht verändern. Endlich sagt es das UI einmal laut." : "Your role may read suppliers, but not change them. Nice of the UI to admit it out loud for once."} actionLabel={L === "de" ? "Zu Reports" : "Open reports"} onAction={() => setTab("reports")} />}
      <WorkspaceModuleGuide
        L={L}
        storageKey="lksg-guide-suppliers"
        title={L === "de" ? "Modul-Guide: Lieferanten" : "Module guide: suppliers"}
        subtitle={L === "de" ? "Saubere Stammdaten zuerst. Sonst bewertet das System nur Ihre Hoffnung." : "Clean master data first. Otherwise the system mostly scores your optimism."}
        steps={[
          { id: "reg", label: L === "de" ? "Mindestens einen Lieferanten anlegen" : "Create at least one supplier", done: suppliers.length > 0, copy: L === "de" ? "Der erste Datensatz ist der Startschuss für Risiko, SAQ und BAFA." : "The first record unlocks risk, SAQ and BAFA.", actionLabel: L === "de" ? "Anlegen" : "Add supplier", onAction: () => writable && openAddSupModal() },
          { id: "geo", label: L === "de" ? "Land und Branche pflegen" : "Complete country and industry", done: suppliers.length > 0 && suppliers.every(s => !!s.country && !!s.industry), copy: L === "de" ? "Ohne diese beiden Felder bleibt jede Analyse halbblind." : "Without these two fields every analysis stays half-blind." },
          { id: "risk", label: L === "de" ? "Risiko neu berechnen" : "Recalculate risk", done: suppliers.length > 0 && suppliers.every(s => s.risk_level !== "unknown"), copy: L === "de" ? "Danach sehen Reports und CAPs endlich nach Arbeit statt Spekulation aus." : "After that, reports and CAPs start looking like work instead of guesswork.", actionLabel: L === "de" ? "Neu berechnen" : "Recalculate", onAction: recalc },
        ]}
      />
      {suppliers.length === 0 && (
        <WorkspaceActionPrompt
          tone="amber"
          title={L === "de" ? "Erst Register aufbauen, dann Risiko sauber rechnen" : "Build the register first, then score risk properly"}
          copy={L === "de" ? "Importieren Sie zuerst Lieferanten oder legen Sie den ersten Datensatz manuell an. Ohne Register bleibt der Rest nur teure Dekoration." : "Import suppliers or create the first record manually. Without a register, the rest is just expensive decoration."}
          actionLabel={L === "de" ? "Lieferant anlegen" : "Add supplier"}
          onAction={() => writable && openAddSupModal()}
        />
      )}
      <div className="sec-hd" style={{ marginBottom: 12 }}>
        <div className="brow" style={{ flexWrap: "wrap" as React.CSSProperties["flexWrap"], gap: 8 }}>
          <input className="inp" style={{ height: 36, width: 180, fontSize: 13 }} placeholder={L === "de" ? "Suchen..." : "Search..."}
            value={supFilter.search} onChange={e => setSupFilter(f => ({ ...f, search: e.target.value }))} />
          <select className="sel" style={{ height: 36, fontSize: 13 }} value={supFilter.risk}
            onChange={e => setSupFilter(f => ({ ...f, risk: e.target.value }))}>
            <option value="">{L === "de" ? "Alle Risiken" : "All risks"}</option>
            <option value="high">{L === "de" ? "Hochrisiko" : "High risk"}</option>
            <option value="medium">{L === "de" ? "Mittelrisiko" : "Medium risk"}</option>
            <option value="low">{L === "de" ? "Niedrigrisiko" : "Low risk"}</option>
          </select>
          <select className="sel" style={{ height: 36, fontSize: 13 }} value={supFilter.country}
            onChange={e => setSupFilter(f => ({ ...f, country: e.target.value }))}>
            <option value="">{L === "de" ? "Alle Laender" : "All countries"}</option>
            {[...new Set(suppliers.map((s: any) => s.country))].sort().map((co: any) =>
              <option key={co} value={co}>{co}</option>
            )}
          </select>
          <button className="btn btn-g btn-sm" onClick={() => exportCSV("/suppliers/export/csv", "lieferanten.csv")}>
            &#8595; CSV
          </button>
        </div>
      </div>
      <div className="card">
      <div className="sec-hd">
        <div><div className="sec-title">{L === "de" ? "Lieferanten-Register" : "Supplier Register"}<span className="ltag">§5 LkSG</span></div><div className="sec-sub">{kpis.total} {L === "de" ? "Lieferanten / 20-Faktor Risikobewertung / Parameterdetails verfugbar" : "suppliers / 20-factor risk scoring / parameter details available"}</div></div>
        <div className="brow">
          <button className="btn btn-g btn-sm" onClick={recalc} disabled={loading || !writable}>&#8635; {L === "de" ? "Neu berechnen" : "Recalculate"}</button>
          <button className="btn btn-p btn-sm" onClick={openAddSupModal} disabled={!writable}>+ {L === "de" ? "Lieferant" : "Supplier"}</button>
        </div>
      </div>
      {kpis.total > 0 ? (
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>{L === "de" ? "Name" : "Name"}</th><th>{L === "de" ? "Land" : "Country"}</th><th>{L === "de" ? "Branche" : "Industry"}</th><th>{L === "de" ? "Risiko" : "Risk"}</th><th>Score</th><th>{L === "de" ? "Audit / CoC" : "Audit / CoC"}</th><th></th></tr></thead>
            <tbody>
              {suppliers.map(s => {
                const isExp = expanded === s.id;
                return (
                  <>
                    <tr key={s.id} className="clickable" onClick={() => setExpanded(isExp ? null : s.id)}>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: "-.2px" }}>{s.name}</div>
                        {s.notes && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{s.notes.substring(0, 50)}{s.notes.length > 50 ? "..." : ""}</div>}
                      </td>
                      <td style={{ color: "#4B5563", fontSize: 13 }}>{s.country}</td>
                      <td style={{ color: "#4B5563", fontSize: 13 }}>{s.industry}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span className={chipRL(s.risk_level)}>{rl(s.risk_level, L)}</span>
                          <div style={{ width: 36, height: 3, background: "#E2E8E2", borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ width: `${s.risk_score}%`, height: "100%", background: RC[s.risk_level] }} />
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: RC[s.risk_level] }}>{s.risk_score}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="prog" style={{ width: 60 }}><div className="prog-fill" style={{ width: `${s.risk_score}%`, background: RC[s.risk_level] }} /></div>
                          <strong style={{ color: RC[s.risk_level], fontSize: 13.5 }}>{s.risk_score}</strong>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 5 }}>
                          {s.has_audit && <span className="chip cl" style={{ fontSize: 10 }}>Audit</span>}
                          {s.has_code_of_conduct && <span className="chip cb" style={{ fontSize: 10 }}>CoC</span>}
                          {!s.has_audit && !s.has_code_of_conduct && <span style={{ fontSize: 11, color: "#9CA3AF" }}>--</span>}
                        </div>
                      </td>
                      <td>
                        <div className="brow">
                          <button className="btn btn-g btn-xs" onClick={e => { e.stopPropagation(); if (!writable) return; openEditSupModal(s); }} disabled={!writable}>{L === "de" ? "Bearbeiten" : "Edit"}</button>
                          <button className="btn btn-r btn-xs" onClick={e => { e.stopPropagation(); if (!writable) return; delSupplier(s.id, s.name); }} disabled={!writable}>x</button>
                        </div>
                      </td>
                    </tr>
                    {isExp && (
                      <tr key={s.id + "_exp"}><td colSpan={7} className="row-exp">
                        <div style={{ padding: "18px 16px" }}>
                          <div className="g2">
                            <div>
                              <div className={"al " + (s.risk_level === "high" ? "al-err" : s.risk_level === "medium" ? "al-warn" : s.risk_level === "low" ? "al-ok" : "al-info")} style={{ marginBottom: 10 }}>
                                <span className="al-icon">{s.risk_level === "high" ? "!" : "i"}</span>
                                <div style={{ fontSize: 12.5 }}>
                                  <strong>§{s.risk_level === "high" ? "6" : s.risk_level === "medium" ? "4" : "8"} LkSG:</strong> {" "}
                                  {s.risk_level === "high" ? (L === "de" ? "Sofortiger CAP + Audit erforderlich. BAFA-Dokumentation sicherstellen." : "Immediate CAP + Audit required. Ensure BAFA documentation.") :
                                   s.risk_level === "medium" ? (L === "de" ? "Praventionsmassnahmen einleiten. Code of Conduct und SAQ prufen." : "Implement preventive measures. Review Code of Conduct and SAQ.") :
                                   s.risk_level === "low" ? (L === "de" ? "Periodisches Monitoring ausreichend. Jahrliche Uberpruefung." : "Periodic monitoring sufficient. Annual review recommended.") :
                                   (L === "de" ? "Risikoanalyse erforderlich. Land und Branche vervollstandigen." : "Risk analysis required. Complete country and industry data.")}
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                                {s.workers && <span className="stat-pill">&#128100; {s.workers.toLocaleString()}</span>}
                                {s.annual_spend_eur && <span className="stat-pill">EUR {(s.annual_spend_eur / 1000).toFixed(0)}k</span>}
                                {s.certification_count ? <span className="stat-pill cl">&#10003; {s.certification_count} Certs</span> : null}
                                {s.sub_supplier_count ? <span className="stat-pill">&#9654; {s.sub_supplier_count} Sub</span> : null}
                              </div>
                              <div className="brow">
                                <button className="btn btn-ai btn-xs" onClick={() => writable && getSupAI(s)} disabled={supLd[s.id] || !writable}>{supLd[s.id] ? <span className="spin" /> : "&#9998;"} {L === "de" ? "KI-Analyse" : "AI Analysis"}</button>
                                {s.risk_level === "high" && <button className="btn btn-ai btn-xs" onClick={() => writable && getSupCAP(s)} disabled={supLd[s.id + "_c"] || !writable}>{supLd[s.id + "_c"] ? <span className="spin" /> : "&#9889;"} {L === "de" ? "KI-CAP" : "AI CAP"}</button>}
                                <button className="btn btn-p btn-xs" onClick={() => { if (!writable) return; setCapSup(s.id); setCapTitle(L === "de" ? `Audit: ${s.name}` : `Audit: ${s.name}`); setCapPara(s.risk_level === "high" ? "6" : "4"); setShowCapModal(true); }} disabled={!writable}>+ CAP</button>
                              </div>
                              {supAI[s.id] && <div style={{ background: "#fff", border: "1px solid #E2E8E2", borderRadius: 10, padding: 14, marginTop: 10, fontSize: 12.5, lineHeight: 1.7, whiteSpace: "pre-wrap", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>{supAI[s.id]}</div>}
                              {supCAP[s.id] && <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: 14, marginTop: 8, fontSize: 12.5, lineHeight: 1.7, whiteSpace: "pre-wrap" }}><strong style={{ color: "#92400E" }}>KI-CAP (§6 LkSG):{"\n"}</strong>{supCAP[s.id]}</div>}
                            </div>
                            <div>
                              <RiskBreakdown sup={s} />
                            </div>
                          </div>
                        </div>
                      </td></tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <WorkspaceEmptyState
          L={L}
          icon="🏭"
          title={L === "de" ? "Keine Lieferanten" : "No suppliers"}
          copy={L === "de" ? "CSV importieren oder den ersten Lieferanten manuell erfassen. Danach wirkt die ganze Risiko-Logik plötzlich deutlich sinnvoller." : "Import a CSV or add the first supplier manually. After that, the entire risk logic becomes a lot more useful."}
          primary={{ label: L === "de" ? "+ Lieferant anlegen" : "+ Add supplier", onClick: openAddSupModal }}
          secondary={{ label: L === "de" ? "CSV importieren" : "Import CSV", onClick: () => fileRef.current?.click(), tone: "secondary" }}
        />
      )}
    </div>
    </>
  );
}
