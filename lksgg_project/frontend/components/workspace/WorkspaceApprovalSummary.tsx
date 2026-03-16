import type { WorkspaceApprovalMeta } from "@/lib/workspace-types";

export default function WorkspaceApprovalSummary({ L, approval, onOpenReports }: { L: "de" | "en"; approval: WorkspaceApprovalMeta; onOpenReports?: () => void }) {
  const tone = approval.pending > 0 ? "#D97706" : approval.rejected > 0 ? "#DC2626" : approval.approved > 0 ? "#16A34A" : "#2563EB";
  const title = approval.pending > 0
    ? (L === "de" ? "Freigaben warten" : "Approvals waiting")
    : approval.rejected > 0
      ? (L === "de" ? "Freigaben abgelehnt" : "Approvals rejected")
      : approval.approved > 0
        ? (L === "de" ? "Freigaben bestätigt" : "Approvals approved")
        : (L === "de" ? "Noch kein Approval-Lauf" : "No approval cycle yet");
  const copy = approval.pending > 0
    ? (L === "de" ? `${approval.pending} Bericht(e) warten auf Entscheidung. Der Prozess lebt also noch.` : `${approval.pending} report(s) are waiting for review. Bureaucracy remains alive.`)
    : approval.rejected > 0
      ? (L === "de" ? `${approval.rejected} Ablehnung(en) brauchen Nacharbeit, bevor BAFA wieder freundlich wirkt.` : `${approval.rejected} rejection(s) need rework before BAFA looks friendly again.`)
      : approval.approved > 0
        ? (L === "de" ? `${approval.approved} Freigabe(n) wurden bereits bestätigt.` : `${approval.approved} approval(s) were already confirmed.`)
        : (L === "de" ? `Noch keine Approval-Historie. Schön ruhig, aber nicht unbedingt fertig.` : `No approval history yet. Quiet, but not necessarily done.`);

  return (
    <div className="card" style={{ marginBottom: 16, borderLeft: `3px solid ${tone}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 8, flexWrap: "wrap" as const }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{title}</div>
          <div style={{ fontSize: 12.5, color: "#6B7280" }}>{copy}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
          <span className="stat-pill">{approval.pending} {L === "de" ? "offen" : "pending"}</span>
          <span className="stat-pill">{approval.approved} {L === "de" ? "freigegeben" : "approved"}</span>
          <span className="stat-pill">{approval.rejected} {L === "de" ? "abgelehnt" : "rejected"}</span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" as const }}>
        <div style={{ fontSize: 11.5, color: "#9CA3AF" }}>
          {L === "de" ? "Letzter Status" : "Last status"}: <strong style={{ color: "#374151" }}>{approval.lastStatus || "none"}</strong>
        </div>
        {onOpenReports && <button className="btn btn-sm btn-p" onClick={onOpenReports}>{L === "de" ? "Zu Reports" : "Open reports"}</button>}
      </div>
    </div>
  );
}
