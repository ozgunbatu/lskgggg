import React from "react";
import WorkspaceDataState from "../workspace/WorkspaceDataState";
import WorkspaceSectionMeta from "../workspace/WorkspaceSectionMeta";
import WorkspaceActionPrompt from "../workspace/WorkspaceActionPrompt";
import WorkspaceEmptyState from "../workspace/WorkspaceEmptyState";
import WorkspaceModuleGuide from "../workspace/WorkspaceModuleGuide";
import WorkspaceApprovalInbox from "../workspace/WorkspaceApprovalInbox";
import WorkspaceApprovalSummary from "../workspace/WorkspaceApprovalSummary";
import WorkspaceApprovalTimeline from "../workspace/WorkspaceApprovalTimeline";
import WorkspaceModuleReadOnly from "../workspace/WorkspaceModuleReadOnly";
import { API } from "../../lib/api";
import { getSessionRole, getToken } from "../../lib/auth";
import { gradeColor } from "../../lib/workspace-constants";
import type { WorkspaceTabProps } from "../../lib/workspace-types";

export default function ReportsTab(props: WorkspaceTabProps) {
  const { L, requestState, reloads, company, complaints, rYear, setRYear, draft, setDraft, draftTs, genLd, kpiLive, loadDraft, saveDraft, genSection, sendAi, kpis, actionStats, BF, score, approvalMeta } = props;
  const sc = score.score;
  const sg = kpiLive?.grade || (sc >= 85 ? "A" : sc >= 70 ? "B" : sc >= 50 ? "C" : sc >= 30 ? "D" : "F");
  const scCol = gradeColor(sg);
  const openPdf = () => {
    const token = getToken();
    window.open(`${API}/reports/bafa/${rYear}?token=${encodeURIComponent(token)}`, "_blank");
  };
  const currentRole = approvalMeta.currentRole || getSessionRole();
  const canEditDraft = currentRole !== "viewer" && !approvalMeta.draftLocked;

  return (
    <>
      <WorkspaceDataState L={L} requestState={requestState} domains={[
        { key: "saqs", label: "SAQ", onRetry: reloads.reloadReportsDomain },
        { key: "evidences", label: L === "de" ? "Nachweise" : "Evidence", onRetry: reloads.reloadReportsDomain },
      ]} />
      <WorkspaceSectionMeta L={L} title={L === "de" ? "Berichts-Domain" : "Reports domain"} requestState={requestState} domains={["saqs", "evidences"]} onRefresh={reloads.reloadReportsDomain} />
      <WorkspaceApprovalSummary L={L} approval={approvalMeta} />
      {currentRole === "viewer" && <WorkspaceModuleReadOnly L={L} title={L === "de" ? "Reports sind schreibgeschützt" : "Reports are read-only"} copy={L === "de" ? "Ihre Rolle darf Berichte lesen, aber nicht bearbeiten oder zur Freigabe senden. Sehr deutsch, sehr ordentlich." : "Your role can read reports, but not edit or submit them for approval. Very orderly, very corporate."} actionLabel={L === "de" ? "Audit öffnen" : "Open audit"} onAction={() => props.setTab("audit")} />}
      <WorkspaceModuleGuide
        L={L}
        storageKey="lksg-guide-reports"
        title={L === "de" ? "Modul-Guide: Reports" : "Module guide: reports"}
        subtitle={L === "de" ? "Berichte werden stabil, wenn Evidenz, SAQ und Maßnahmen nicht hinterherhinken." : "Reports get stable when evidence, SAQ and actions stop lagging behind."}
        steps={[
          { id: "saq", label: L === "de" ? "Mindestens einen SAQ versenden" : "Send at least one SAQ", done: props.saqs.length > 0, copy: L === "de" ? "Ein Fragebogen ist kein Allheilmittel, aber ein sehr nützliches Minimum." : "A questionnaire is not magic, but it is a useful minimum.", actionLabel: L === "de" ? "Zum SAQ" : "Open SAQ", onAction: () => props.setTab("saq") },
          { id: "evidence", label: L === "de" ? "Nachweise sammeln" : "Collect evidence", done: props.evidences.length > 0, copy: L === "de" ? "Ohne Nachweise wird jeder schöne Satz im Bericht erstaunlich verletzlich." : "Without evidence, every nice sentence in the report becomes fragile.", actionLabel: L === "de" ? "Zu Nachweisen" : "Open evidence", onAction: () => props.setTab("evidence") },
          { id: "draft", label: L === "de" ? "Berichtsentwurf pflegen" : "Maintain the report draft", done: !!draftTs || !!draft, copy: L === "de" ? "Ein gepflegter Entwurf spart den üblichen BAFA-Endspurt-Schmerz." : "A maintained draft saves you the usual BAFA endgame pain.", actionLabel: L === "de" ? "Entwurf laden" : "Load draft", onAction: loadDraft },
        ]}
      />
      {approvalMeta.draftLocked && (
        <WorkspaceActionPrompt
          tone="amber"
          title={L === "de" ? "Entwurf ist im Freigabelauf gesperrt" : "Draft is locked during approval"}
          copy={L === "de" ? "Mindestens eine Freigabe ist offen. Bearbeitung bleibt bis zur Entscheidung gesperrt, damit niemand parallel am Bericht zerrt." : "At least one approval is pending. Editing stays locked until a decision is made, so the report is not being pulled apart from both sides."}
          actionLabel={L === "de" ? "Freigaben ansehen" : "Open approvals"}
          onAction={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        />
      )}
      {(!draft && (!kpis.total || !actionStats.total)) && (
        <WorkspaceActionPrompt
          tone="amber"
          title={L === "de" ? "Bericht zuerst mit Daten füttern" : "Feed the report with real inputs first"}
          copy={L === "de" ? "Ohne Lieferanten, Maßnahmen oder Nachweise bleibt auch der schönste BAFA-Entwurf sehr theoretisch." : "Without suppliers, actions or evidence, even the prettiest BAFA draft stays mostly theoretical."}
          actionLabel={L === "de" ? "Nachweise öffnen" : "Open evidence"}
          onAction={() => props.setTab("evidence")}
        />
      )}
      <div className="sec-hd">
        <div>
          <div className="sec-title">{L === "de" ? "BAFA Jahresbericht" : "BAFA Annual Report"}<span className="ltag">§10 LkSG</span></div>
          <div className="sec-sub">{L === "de" ? "Strukturierter Bericht nach BAFA-Fragebogen. Pflicht bis 15. Juni. KI unterstützt alle Abschnitte." : "Structured report aligned with BAFA questionnaire. Due by 15 June. AI supports all sections."}</div>
        </div>
        <div className="brow">
          <input className="inp" type="number" value={rYear} onChange={e => { setRYear(Number(e.target.value)); setDraft(null); }} style={{ width: 88 }} />
          <button className="btn btn-g" onClick={loadDraft}>{L === "de" ? "Laden" : "Load"}</button>
          <button className="btn btn-ai" disabled={!canEditDraft} onClick={() => sendAi(L === "de" ? `Erstelle einen professionellen, vollständigen BAFA-Jahresbericht für ${company?.name || "unser Unternehmen"} für das Jahr ${rYear}. Eckdaten: ${kpis.total} Lieferanten, davon ${kpis.high} hochrisiko und ${kpis.med} mittelrisiko. Portfolio-Compliance-Score: ${sc}/100 (Note ${sg}). ${actionStats.total} CAPs, davon ${actionStats.done} abgeschlossen. ${complaints.length} Beschwerden eingegangen. Bericht soll alle 6 Pflichtabschnitte gemäß §10 LkSG enthalten.` : `Create a professional, complete BAFA annual report for ${company?.name || "our company"} for ${rYear}. Data: ${kpis.total} suppliers, ${kpis.high} high-risk, ${kpis.med} medium-risk. Portfolio compliance score: ${sc}/100 (grade ${sg}). ${actionStats.total} CAPs, ${actionStats.done} completed. ${complaints.length} complaints received. Report must cover all 6 mandatory sections under §10 LkSG.`)}>&#9998; {L === "de" ? "KI-Vollbericht" : "AI Full Report"}</button>
          <button className="btn btn-p" onClick={openPdf}>&#8595; PDF</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <span className="stat-pill">&#127970; {kpis.total} {L === "de" ? "Lieferanten" : "Suppliers"}</span>
        <span className="stat-pill" style={{ color: scCol }}>Score {sc}/100 ({sg})</span>
        <span className="stat-pill" style={{ color: actionStats.overdue > 0 ? "#DC2626" : "#16A34A" }}>{actionStats.done}/{actionStats.total} CAPs</span>
        <span className="stat-pill">{complaints.length} {L === "de" ? "Beschwerden" : "Complaints"}</span>
        <span className="stat-pill" style={{ color: approvalMeta.pending > 0 ? "#D97706" : approvalMeta.rejected > 0 ? "#DC2626" : "#374151" }}>{approvalMeta.pending} {L === "de" ? "Approval offen" : "approval pending"}</span>
      </div>
      <div className="al al-blue" style={{ marginBottom: 18 }}>
        <span className="al-icon">i</span>
        <div style={{ fontSize: 12.5 }}>{L === "de" ? "Berichtspflicht §10 Abs. 2 LkSG. Einreichung beim BAFA bis 15. Juni. Dieser Entwurf muss vor Einreichung juristisch geprüft werden." : "Reporting obligation under §10 para. 2 LkSG. Submit to BAFA by 15 June. This draft must be reviewed by a lawyer before submission."}</div>
      </div>
      <WorkspaceApprovalInbox
        L={L}
        rows={approvalMeta.rows || []}
        loading={approvalMeta.loading}
        currentRole={approvalMeta.currentRole}
        notes={approvalMeta.notes || ""}
        setNotes={approvalMeta.setNotes || (() => {})}
        onRefresh={() => { void approvalMeta.loadApprovals?.(); }}
        onRequest={() => { void approvalMeta.requestApproval?.(rYear, props.toast, L); }}
        onApprove={() => { void approvalMeta.reviewApproval?.(rYear, "approved", props.toast, L); }}
        onReject={() => { void approvalMeta.reviewApproval?.(rYear, "rejected", props.toast, L); }}
      />
      <WorkspaceApprovalTimeline L={L} approval={approvalMeta} />
      {draft !== null ? (
        <>
          <div className="brow" style={{ marginBottom: 16, justifyContent: "flex-end" }}>
            {draftTs && <span style={{ fontSize: 11.5, color: "#9CA3AF" }}>{L === "de" ? "Gespeichert:" : "Saved:"} {draftTs}</span>}
            <button className="btn btn-p btn-sm" onClick={saveDraft} disabled={!canEditDraft}>&#10003; {L === "de" ? "Entwurf speichern" : "Save draft"}</button>
          </div>
          {BF.map(f => (
            <div key={f.key} className="fl">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <label style={{ marginBottom: 0, textTransform: "none", fontSize: 12.5, fontWeight: 800, letterSpacing: 0, color: "#374151" }}>{f.lbl}</label>
                <button className="btn btn-ai btn-xs" onClick={() => genSection(f.key)} disabled={genLd === f.key || !canEditDraft}>{genLd === f.key ? <span className="spin" /> : "✎"} {L === "de" ? "KI-Text" : "AI Text"}</button>
              </div>
              <textarea className="ta" rows={f.rows} disabled={!canEditDraft} placeholder={f.ph} value={(draft || {})[f.key] || ""} onChange={e => setDraft(d => ({ ...(d || {}), [f.key]: e.target.value }))} />
            </div>
          ))}
        </>
      ) : (
        <WorkspaceEmptyState L={L} icon="📄" title={L === "de" ? "Kein Entwurf geladen" : "No draft loaded"} copy={L === "de" ? "Laden Sie einen bestehenden Entwurf oder starten Sie mit KI-Unterstützung. Berichte schreiben sich leider noch nicht aus moralischer Pflicht." : "Load an existing draft or start with AI support. Reports still refuse to write themselves out of civic duty."} primary={{ label: L === "de" ? "Entwurf laden" : "Load draft", onClick: loadDraft }} secondary={{ label: L === "de" ? "KI-Vollbericht" : "AI full report", onClick: () => sendAi(L === "de" ? `Erstelle einen professionellen BAFA-Jahresbericht für ${company?.name || "unser Unternehmen"} für ${rYear}.` : `Create a professional BAFA annual report for ${company?.name || "our company"} for ${rYear}.`), tone: "secondary" }} />
      )}
    </>
  );
}
