import React from "react";
import WorkspaceDataState from "../workspace/WorkspaceDataState";
import WorkspaceSectionMeta from "../workspace/WorkspaceSectionMeta";
import WorkspaceApprovalSummary from "../workspace/WorkspaceApprovalSummary";
import WorkspaceApprovalAging from "../workspace/WorkspaceApprovalAging";
import WorkspaceActionPrompt from "../workspace/WorkspaceActionPrompt";
import WorkspaceEmptyState from "../workspace/WorkspaceEmptyState";
import WorkspaceModuleGuide from "../workspace/WorkspaceModuleGuide";
import type { WorkspaceTabProps } from "@/lib/workspace-types";

export default function KpiTab(props: WorkspaceTabProps) {
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
        { key: "kpi", label: "KPI", onRetry: reloads.reloadInsights },
      ]} />
      <WorkspaceSectionMeta L={L} title="KPI" requestState={requestState} domains={["kpi"]} onRefresh={reloads.reloadInsights} />
      <WorkspaceApprovalSummary L={L} approval={approvalMeta} onOpenReports={() => setTab("reports")} />
      <WorkspaceApprovalAging L={L} approval={approvalMeta} onOpenReports={() => setTab("reports")} />
      <WorkspaceModuleGuide
        L={L}
        storageKey="lksg-guide-kpi"
        title={L === "de" ? "Modul-Guide: KPI" : "Module guide: KPI"}
        subtitle={L === "de" ? "Kennzahlen sollen Entscheidungen beschleunigen, nicht nur hübsch flackern." : "Metrics should accelerate decisions, not just glow nicely."}
        steps={[
          { id: "load", label: L === "de" ? "KPI laden" : "Load KPI", done: !!kpiLive, copy: L === "de" ? "Erst dann sieht das Team mehr als Gefühl und Hoffnung." : "Only then does the team see more than feeling and hope.", actionLabel: L === "de" ? "Aktualisieren" : "Refresh", onAction: loadKpi },
          { id: "snapshot", label: L === "de" ? "Snapshot sichern" : "Save snapshot", done: Array.isArray(kpiTrend) && kpiTrend.length > 0, copy: L === "de" ? "Trend ohne Verlauf ist nur eine Momentaufnahme mit PR-Anspruch." : "A trend without history is just a snapshot pretending to be strategy.", actionLabel: L === "de" ? "Snapshot" : "Snapshot", onAction: saveKpiSnapshot },
          { id: "act", label: L === "de" ? "Kennzahlen in Maßnahmen übersetzen" : "Translate metrics into actions", done: actions.length > 0 || complaints.length > 0, copy: L === "de" ? "Sonst sammeln Sie Zahlen wie andere Leute Kühlschrankmagnete." : "Otherwise you collect numbers the way other people collect fridge magnets." },
        ]}
      />
      {!kpiLive && !kpiLd && (
        <WorkspaceActionPrompt
          tone="blue"
          title={L === "de" ? "Erst Metriken laden, dann Qualität bewerten" : "Load metrics first, then judge quality"}
          copy={L === "de" ? "Ohne aktuelle KPI-Daten bleibt die Wirksamkeitskontrolle nur eine gut gemeinte Vermutung." : "Without current KPI data, the effectiveness review is mostly a well-intentioned guess."}
          actionLabel={L === "de" ? "KPIs laden" : "Load KPIs"}
          onAction={loadKpi}
        />
      )}
      <div className="sec-hd" style={{ marginBottom: 16 }}>
        <div>
          <div className="sec-title">{L === "de" ? "Wirksamkeitskontrolle" : "Effectiveness Review"}<span className="ltag">§9 LkSG</span></div>
          <div className="sec-sub">{L === "de" ? "§9 LkSG: Jaehrliche KPI-Messung. Snapshots dokumentieren den Fortschritt fuer BAFA." : "§9 LkSG: Annual KPI measurement. Snapshots document progress for BAFA."}</div>
        </div>
        <div className="brow">
          <button className="btn btn-g btn-sm" onClick={saveKpiSnapshot} disabled={kpiLd}>&#128248; {L === "de" ? "Snapshot speichern" : "Save snapshot"}</button>
          <button className="btn btn-p btn-sm" onClick={loadKpi} disabled={kpiLd}>{kpiLd ? <span className="spin" /> : "&#8635;"} {L === "de" ? "Aktualisieren" : "Refresh"}</button>
          <button className="btn btn-ai btn-sm" onClick={() => { setTab("ai"); setTimeout(() => sendAi(L === "de" ? "Erstelle eine vollstaendige §9 LkSG Wirksamkeitsbewertung basierend auf meinen aktuellen KPIs." : "Create a complete §9 LkSG effectiveness assessment based on my current KPIs."), 100); }}>&#9998; AI</button>
        </div>
      </div>
      {kpiLd && !kpiLive && <div className="empty card" style={{ padding: 32 }}><span className="spin spin-d" />&nbsp;{L === "de" ? "Lade..." : "Loading..."}</div>}
      {!kpiLive && !kpiLd && (
        <WorkspaceEmptyState L={L} icon="📈" title={L === "de" ? "KPIs laden" : "Load KPIs"} copy={L === "de" ? "Laden Sie aktuelle Kennzahlen, damit Score, Trends und Wirksamkeitskontrolle nicht nur geraten werden." : "Load current metrics so score, trends and effectiveness review stop being guesswork."} primary={{ label: L === "de" ? "Jetzt laden" : "Load now", onClick: loadKpi }} />
      )}
      {kpiLive && <>
        <div className="al al-info" style={{ marginBottom: 18 }}>
          <span className="al-icon">&#9724;</span>
          <div style={{ fontSize: 12.5 }}><strong>§9 LkSG:</strong> {L === "de" ? " Wirksamkeitskontrolle mindestens jaehrlich. Snapshots bilden den BAFA-Nachweis." : " Effectiveness review at least annually. Snapshots form BAFA evidence."}</div>
        </div>

        {/* Score Breakdown - transparency for BAFA */}
        <div className="card" style={{ marginBottom: 16, background: "linear-gradient(135deg,#EDF7F0 0%,#fff 60%)", border: "1px solid #C6E4CE" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" as const }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 3, color: "#1B3D2B" }}>
                {L === "de" ? "Score-Berechnung (§9 LkSG Transparenz)" : "Score Calculation (§9 LkSG Transparency)"}
              </div>
              <div style={{ fontSize: 11.5, color: "#4B5563", marginBottom: 10 }}>
                {L === "de" ? "Formel: Risikostruktur (55%) + Prozessqualitaet (45%)" : "Formula: Risk structure (55%) + Process quality (45%)"}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                {[
                  { lbl: L === "de" ? "Risikostruktur" : "Risk structure", pct: 55, val: `${kpiLive.portfolioScore}*`, note: L === "de" ? "Land/Branche/Profil" : "Country/Industry/Profile" },
                  { lbl: L === "de" ? "Audit-Abdeckung" : "Audit coverage", pct: 25, val: `${kpiLive.auditCoverage}%`, note: "§4 LkSG", ok: kpiLive.auditCoverage >= 60 },
                  { lbl: "Code of Conduct", pct: 20, val: `${kpiLive.cocCoverage}%`, note: "§4 LkSG", ok: kpiLive.cocCoverage >= 70 },
                  { lbl: L === "de" ? "CAP-Abschluss" : "CAP completion", pct: 30, val: `${kpiLive.capCompletionRate}%`, note: "§7 LkSG", ok: kpiLive.capCompletionRate >= 80 },
                  { lbl: "SAQ", pct: 10, val: `${kpiLive.saqRate}%`, note: "§5 LkSG", ok: kpiLive.saqRate >= 60 },
                  { lbl: L === "de" ? "Beschwerden" : "Complaints", pct: 15, val: `${kpiLive.complaintOpen} offen`, note: "§8 LkSG", ok: kpiLive.complaintOpen === 0 },
                ].map((c, i) => (
                  <div key={i} style={{ background: "#fff", border: `1px solid ${"ok" in c && c.ok === false ? "#FECACA" : "#E2E8E2"}`, borderRadius: 8, padding: "6px 10px", minWidth: 110 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#9CA3AF", letterSpacing: "0.5px", textTransform: "uppercase" as const }}>{c.lbl}</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "ok" in c && c.ok === false ? "#DC2626" : "ok" in c && c.ok === true ? "#16A34A" : "#1B3D2B", margin: "2px 0" }}>{c.val}</div>
                    <div style={{ fontSize: 10, color: "#9CA3AF" }}>{c.note} &bull; {c.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "center" as const, minWidth: 90 }}>
              <div style={{ fontSize: 42, fontWeight: 900, color: kpiLive.portfolioScore >= 70 ? "#16A34A" : kpiLive.portfolioScore >= 50 ? "#D97706" : "#DC2626", lineHeight: 1 }}>{kpiLive.portfolioScore}</div>
              <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>{L === "de" ? "Note" : "Grade"} <strong style={{ color: kpiLive.portfolioScore >= 70 ? "#16A34A" : "#DC2626" }}>{kpiLive.grade}</strong></div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>/100</div>
            </div>
          </div>
        </div>

        <div className="kpi-row">
          {([
            { lbl: "Compliance Score", val: `${kpiLive.portfolioScore}/100`, sub: `${L === "de" ? "Note" : "Grade"} ${kpiLive.grade}`, col: kpiLive.portfolioScore >= 70 ? "#16A34A" : kpiLive.portfolioScore >= 50 ? "#D97706" : "#DC2626", lksg: "§9" },
            { lbl: L === "de" ? "CAP-Abschlussrate" : "CAP completion", val: `${kpiLive.capCompletionRate}%`, sub: `${kpiLive.capDone}/${kpiLive.capDone + kpiLive.capOpen}`, col: kpiLive.capCompletionRate >= 80 ? "#16A34A" : kpiLive.capCompletionRate >= 50 ? "#D97706" : "#DC2626", lksg: "§9" },
            { lbl: L === "de" ? "Audit-Abdeckung" : "Audit coverage", val: `${kpiLive.auditCoverage}%`, sub: L === "de" ? "mit Audit" : "with audit", col: kpiLive.auditCoverage >= 60 ? "#16A34A" : kpiLive.auditCoverage >= 30 ? "#D97706" : "#DC2626", lksg: "§5" },
            { lbl: L === "de" ? "SAQ-Ruecklauf" : "SAQ response", val: `${kpiLive.saqRate}%`, sub: `${kpiLive.saqDone}/${kpiLive.saqSent}`, col: kpiLive.saqRate >= 70 ? "#16A34A" : kpiLive.saqRate > 0 ? "#D97706" : "#6B7280", lksg: "§5" },
          ] as const).map(k => (
            <div key={k.lbl} className="kpi">
              <div className="kpi-accent" style={{ background: k.col }} />
              <div className="kpi-lbl">{k.lbl}<span className="ltag">{k.lksg}</span></div>
              <div className="kpi-val" style={{ color: k.col }}>{k.val}</div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>
        <div className="g2" style={{ marginTop: 16 }}>
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>{L === "de" ? "Detaillierte KPIs" : "Detailed KPIs"}</div>
            {([
              { lbl: L === "de" ? "Hochrisiko-Lieferanten" : "High-risk suppliers", val: kpiLive.highRisk, tot: kpiLive.supplierCount, inv: true },
              { lbl: L === "de" ? "CoC-Abdeckung" : "CoC coverage", val: kpiLive.cocCoverage, tot: 100, inv: false },
              { lbl: L === "de" ? "Offene Beschwerden" : "Open complaints", val: kpiLive.complaintOpen, tot: Math.max(kpiLive.complaintTotal, 1), inv: true },
              { lbl: L === "de" ? "Ueberfaellige CAPs" : "Overdue CAPs", val: kpiLive.capOverdue, tot: Math.max(kpiLive.capOpen + kpiLive.capDone, 1), inv: true },
            ] as const).map(row => {
              const pct = row.tot > 0 ? Math.round(row.val / row.tot * 100) : 0;
              const barCol = row.inv ? (pct === 0 ? "#16A34A" : pct < 20 ? "#D97706" : "#DC2626") : (pct >= 60 ? "#16A34A" : pct >= 30 ? "#D97706" : "#DC2626");
              return (
                <div key={row.lbl} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>
                    <span>{row.lbl}</span><strong style={{ color: barCol }}>{row.val}</strong>
                  </div>
                  <div className="prog" style={{ height: 8 }}><div className="prog-fill" style={{ width: `${Math.min(100, pct)}%`, background: barCol }} /></div>
                </div>
              );
            })}
            {kpiLive.avgResolutionDays !== null && (
              <div style={{ marginTop: 8, padding: "10px 12px", background: "#F8FAF8", borderRadius: 8, fontSize: 12.5 }}>
                <strong>{L === "de" ? "Durchschn. Bearbeitungszeit:" : "Avg. resolution time:"}</strong> {kpiLive.avgResolutionDays} {L === "de" ? "Tage" : "days"}
              </div>
            )}
          </div>
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>{L === "de" ? "Monatlicher Verlauf" : "Monthly trend"}<span className="ltag">§9</span></div>
            {kpiTrend.length > 1 ? (
              <>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 10 }}>{L === "de" ? "Compliance Score" : "Compliance Score"}</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80, marginBottom: 6 }}>
                  {kpiTrend.map((snap: any, i: number) => {
                    const h = Math.max(4, Math.round((snap.compliance_score || 0) / 100 * 80));
                    const col = (snap.compliance_score || 0) >= 70 ? "#16A34A" : (snap.compliance_score || 0) >= 50 ? "#D97706" : "#DC2626";
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <div style={{ width: "100%", height: h, background: col, borderRadius: "3px 3px 0 0", minWidth: 6 }} title={`Score: ${snap.compliance_score || 0}`} />
                        <div style={{ fontSize: 9, color: "#9CA3AF" }}>{new Date(snap.snapshot_at).toLocaleDateString(L === "de" ? "de-DE" : "en-GB", { month: "short" })}</div>
                      </div>
                    );
                  })}
                </div>
                {kpiTrend.length >= 2 && (() => {
                  const delta = (kpiTrend[kpiTrend.length-1].compliance_score||0) - (kpiTrend[0].compliance_score||0);
                  return delta !== 0 ? <div style={{ padding: "8px 12px", background: delta > 0 ? "#F0FDF4" : "#FEF2F2", borderRadius: 8, fontSize: 12.5, color: delta > 0 ? "#166534" : "#991B1B", fontWeight: 700 }}>{delta > 0 ? "+" : ""}{delta} {L === "de" ? "Punkte" : "points"}</div> : null;
                })()}
              </>
            ) : (
              <div className="empty" style={{ padding: "24px 0" }}>
                <div className="empty-ic">&#128200;</div>
                <div className="empty-t">{L === "de" ? "Noch keine Trend-Daten" : "No trend data yet"}</div>
                <button className="btn btn-p btn-sm" style={{ marginTop: 10 }} onClick={saveKpiSnapshot}>&#128248; {L === "de" ? "Ersten Snapshot speichern" : "Save first snapshot"}</button>
              </div>
            )}
          </div>
        </div>
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>{L === "de" ? "§9 Wirksamkeitsstatus -- 6 Kriterien" : "§9 Effectiveness status -- 6 criteria"}</div>
          <div className="g3">
            {([
              { lbl: L === "de" ? "CAP-Prozess" : "CAP Process", ok: kpiLive.capCompletionRate >= 80, why: `${kpiLive.capCompletionRate}% (${L === "de" ? "Ziel" : "target"}: 80%)`, lksg: "§7" },
              { lbl: L === "de" ? "Audit-Programm" : "Audit Programme", ok: kpiLive.auditCoverage >= 60, why: `${kpiLive.auditCoverage}% (${L === "de" ? "Ziel" : "target"}: 60%)`, lksg: "§5" },
              { lbl: L === "de" ? "Lieferanten-SAQ" : "Supplier SAQ", ok: kpiLive.saqRate >= 60, why: `${kpiLive.saqRate}% (${L === "de" ? "Ziel" : "target"}: 60%)`, lksg: "§5" },
              { lbl: L === "de" ? "Beschwerde-Bearbeitung" : "Complaint handling", ok: kpiLive.complaintOpen === 0, why: `${kpiLive.complaintOpen} ${L === "de" ? "offen" : "open"}`, lksg: "§8" },
              { lbl: L === "de" ? "CoC-Abdeckung" : "CoC Coverage", ok: kpiLive.cocCoverage >= 70, why: `${kpiLive.cocCoverage}% (${L === "de" ? "Ziel" : "target"}: 70%)`, lksg: "§4" },
              { lbl: L === "de" ? "Portfolio-Score" : "Portfolio Score", ok: kpiLive.portfolioScore >= 70, why: `${kpiLive.portfolioScore}/100 (${L === "de" ? "Ziel" : "target"}: 70)`, lksg: "§5" },
            ] as const).map(item => (
              <div key={item.lbl} className="card-xs" style={{ borderTop: `3px solid ${item.ok ? "#16A34A" : "#D97706"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{item.lbl}</span>
                  <span className={item.ok ? "chip cl" : "chip cm"} style={{ fontSize: 10 }}>{item.ok ? (L === "de" ? "OK" : "Met") : (L === "de" ? "Luecke" : "Gap")}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "#6B7280", marginBottom: 3 }}>{item.why}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF" }}>{item.lksg} LkSG</div>
              </div>
            ))}
          </div>
        </div>
      </>}
    </>
  );
}
