import React from "react";
import type { WorkspaceTabProps } from "@/lib/workspace-types";

export default function SaqTab(props: WorkspaceTabProps) {
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
    BF
  } = props;

  return (
    <>
      <div className="sec-hd" style={{ marginBottom: 16 }}>
        <div>
          <div className="sec-title">{L === "de" ? "Lieferanten-Selbstauskunft (SAQ)" : "Supplier Self-Assessment (SAQ)"}<span className="ltag">§5 LkSG</span></div>
          <div className="sec-sub">{L === "de" ? "Befragungsmethode nach §5 Abs. 2 LkSG. Lieferanten erhalten einen Link, fuellen 12 Fragen aus -- Risk Score wird automatisch aktualisiert." : "Survey method under §5 para. 2 LkSG. Suppliers receive a link, answer 12 questions -- risk score updated automatically."}</div>
        </div>
      </div>
      <div className="g2">
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{L === "de" ? "SAQ versenden" : "Send SAQ"}</div>
          <div style={{ fontSize: 12.5, color: "#6B7280", marginBottom: 16 }}>{L === "de" ? "Lieferant erhaelt E-Mail mit Link. Antworten aktualisieren den Risikoscore automatisch." : "Supplier receives email with link. Responses automatically update the risk score."}</div>
          <div className="al al-info" style={{ marginBottom: 14, fontSize: 12.5 }}>
            <span className="al-icon">i</span>
            <div><strong>§5 Abs. 2 LkSG:</strong> {L === "de" ? " Befragungsmethode = BAFA-anerkannte Risikoanalyse." : " Survey method = BAFA-recognised risk analysis."}</div>
          </div>
          <div className="fl"><label>{L === "de" ? "Lieferant (optional)" : "Supplier (optional)"}</label>
            <select className="sel" value={saqSup} onChange={e => setSaqSup(e.target.value)}>
              <option value="">{L === "de" ? "-- Kein spezifischer Lieferant --" : "-- No specific supplier --"}</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.country}) -- {s.risk_level.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="fl"><label>{L === "de" ? "E-Mail des Lieferanten *" : "Supplier email *"}</label>
            <input className="inp" type="email" value={saqEmail} onChange={e => setSaqEmail(e.target.value)} placeholder="compliance@supplier.com" />
          </div>
          <div className="fl"><label>{L === "de" ? "Gueltig fuer (Tage)" : "Valid for (days)"}</label>
            <select className="sel" value={saqDays} onChange={e => setSaqDays(e.target.value)}>
              {["14","21","30","45","60"].map(d => <option key={d} value={d}>{d} {L === "de" ? "Tage" : "days"}</option>)}
            </select>
          </div>
          <div className="card-xs" style={{ background: "#F8FAF8", marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#6B7280", textTransform: "uppercase" as React.CSSProperties["textTransform"], letterSpacing: ".6px", marginBottom: 8 }}>{L === "de" ? "12 Fragen zu:" : "12 questions covering:"}</div>
            <div style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.8 }}>
              {L === "de"
                ? "Kinderarbeit (§2 Nr.1-3) · Zwangsarbeit (§2 Nr.4-5) · Diskriminierung (§2 Nr.6) · Gewerkschaftsrechte · Mindestlohn · Arbeitsschutz · Umwelt (§2 Abs.3) · Code of Conduct · Audit-Status · Unterlieferanten · Transparenz · Frueheren Verstoesse"
                : "Child labour (§2 no.1-3) · Forced labour · Discrimination · Union rights · Minimum wage · Safety · Environment (§2 para.3) · Code of Conduct · Audit status · Sub-suppliers · Transparency · Past violations"}
            </div>
          </div>
          <button className="btn btn-p" style={{ width: "100%" }} onClick={sendSaq} disabled={saqSending || !saqEmail.trim()}>
            {saqSending ? <span className="spin" /> : null}{L === "de" ? "SAQ senden & Link kopieren" : "Send SAQ & copy link"}
          </button>
        </div>
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>{L === "de" ? "Versendete SAQs" : "Sent SAQs"} <span style={{ color: "#9CA3AF", fontWeight: 600 }}>({saqs.length})</span></div>
          {saqs.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {(["sent","opened","completed","expired"] as const).map(st => {
                const n = saqs.filter(x => x.status === st).length;
                return n > 0 ? <span key={st} className="stat-pill">{st}: {n}</span> : null;
              })}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {saqs.map(s => {
              const expired = new Date(s.expires_at) < new Date() && s.status !== "completed";
              return (
                <div key={s.id} className="card-xs" style={{ borderLeft: `3px solid ${s.status === "completed" ? "#16A34A" : expired ? "#9CA3AF" : s.status === "opened" ? "#2563EB" : "#D97706"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{s.supplier_name || s.sent_to || (L === "de" ? "Unbekannt" : "Unknown")}</div>
                      <div style={{ fontSize: 11.5, color: "#6B7280", display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {s.sent_to && <span>{s.sent_to}</span>}
                        <span>{new Date(s.sent_at).toLocaleDateString(L === "de" ? "de-DE" : "en-GB")}</span>
                        {s.completed_at && <span style={{ color: "#16A34A", fontWeight: 600 }}>{new Date(s.completed_at).toLocaleDateString(L === "de" ? "de-DE" : "en-GB")}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 5, alignItems: "center", flexShrink: 0 }}>
                      <span className={s.status === "completed" ? "chip cl" : expired ? "chip cu" : s.status === "opened" ? "chip cb" : "chip cm"} style={{ fontSize: 10 }}>
                        {s.status === "completed" ? (L === "de" ? "Fertig" : "Done") : expired ? (L === "de" ? "Abgelaufen" : "Expired") : s.status === "opened" ? (L === "de" ? "Geoeffnet" : "Opened") : (L === "de" ? "Gesendet" : "Sent")}
                      </span>
                      {s.url && <button className="btn btn-g btn-xs" onClick={() => navigator.clipboard.writeText(s.url!).then(() => toast("ok", L === "de" ? "Link kopiert" : "Link copied"))}>Link</button>}
                      <button className="btn btn-r btn-xs" onClick={() => deleteSaq(s.id)}>x</button>
                    </div>
                  </div>
                  {s.status === "completed" && s.responses && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #E2E8E2", fontSize: 11.5, color: "#6B7280" }}>
                      {Object.keys(s.responses).length} {L === "de" ? "Fragen beantwortet -- Score aktualisiert" : "questions answered -- score updated"}
                    </div>
                  )}
                </div>
              );
            })}
            {!saqs.length && (
              <div className="empty" style={{ padding: "32px 0" }}>
                <div className="empty-ic">&#128203;</div>
                <div className="empty-t">{L === "de" ? "Noch keine SAQs versendet" : "No SAQs sent yet"}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
