import type { WorkspaceApprovalMeta } from "@/lib/workspace-types";

export default function WorkspaceApprovalAging({
  L,
  approval,
  onOpenReports,
}: {
  L: "de" | "en";
  approval: WorkspaceApprovalMeta;
  onOpenReports?: () => void;
}) {
  const pending = approval.pending || 0;
  const oldest = approval.oldestPendingDays || 0;
  const breaches = approval.slaBreaches || 0;
  const within = approval.pendingWithinSla || 0;
  const urgent = approval.pendingAging?.urgent || 0;
  const fresh = approval.pendingAging?.fresh || 0;
  const tone = breaches > 0 ? "#DC2626" : pending > 0 ? "#D97706" : "#16A34A";
  const title = pending > 0
    ? (L === "de" ? "Approval-Alterung & SLA" : "Approval aging & SLA")
    : (L === "de" ? "Keine offenen Freigaben" : "No open approvals");
  const copy = pending > 0
    ? (breaches > 0
      ? (L === "de" ? `${breaches} Freigabe(n) liegen über dem SLA. Bürokratie hat wieder Ambitionen.` : `${breaches} approval(s) are beyond SLA. Bureaucracy is feeling ambitious again.`)
      : (L === "de" ? `${pending} Freigabe(n) sind offen, aber noch innerhalb des SLA.` : `${pending} approval(s) are open, but still within SLA.`))
    : (L === "de" ? "Der Approval-Stau ist aktuell leer. Ein selten angenehmer Zustand." : "The approval backlog is currently empty. A suspiciously pleasant state.");

  return (
    <div className="card approval-aging" style={{ marginBottom: 16, borderLeft: `3px solid ${tone}` }}>
      <div className="sec-hd" style={{ marginBottom: 10 }}>
        <div>
          <div className="sec-title">{title}<span className="ltag">SLA</span></div>
          <div className="sec-sub">{copy}</div>
        </div>
        {onOpenReports && <button className="btn btn-sm btn-p" onClick={onOpenReports}>{L === "de" ? "Zu Reports" : "Open reports"}</button>}
      </div>
      <div className="approval-aging-grid">
        <div className="approval-aging-card">
          <div className="approval-aging-label">{L === "de" ? "Offen" : "Pending"}</div>
          <div className="approval-aging-value">{pending}</div>
        </div>
        <div className="approval-aging-card">
          <div className="approval-aging-label">{L === "de" ? "Älteste offene Anfrage" : "Oldest open request"}</div>
          <div className="approval-aging-value">{pending > 0 ? `${oldest} ${L === "de" ? "Tage" : "days"}` : "-"}</div>
        </div>
        <div className="approval-aging-card">
          <div className="approval-aging-label">{L === "de" ? "Im SLA" : "Within SLA"}</div>
          <div className="approval-aging-value">{within}</div>
        </div>
        <div className="approval-aging-card">
          <div className="approval-aging-label">{L === "de" ? "SLA verletzt" : "SLA breached"}</div>
          <div className="approval-aging-value" style={{ color: breaches > 0 ? "#DC2626" : "#16A34A" }}>{breaches}</div>
        </div>
      </div>
      {pending > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          <span className="stat-pill">0-2d: {fresh}</span>
          <span className="stat-pill">3-5d: {within - fresh > 0 ? within - fresh : 0}</span>
          <span className="stat-pill" style={{ color: urgent > 0 ? "#DC2626" : undefined }}>{L === "de" ? "6+d" : "6+d"}: {urgent}</span>
        </div>
      )}
    </div>
  );
}
