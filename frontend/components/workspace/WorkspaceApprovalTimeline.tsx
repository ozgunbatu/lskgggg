import React from "react";
import type { WorkspaceApprovalMeta } from "../../lib/workspace-types";

function fmt(ts?: string | null) {
  if (!ts) return "-";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

export default function WorkspaceApprovalTimeline({ L, approval }: { L: "de" | "en"; approval: WorkspaceApprovalMeta }) {
  const rows = (approval.rows || []).slice(0, 6);
  if (!rows.length) return null;

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="sec-title" style={{ marginBottom: 6 }}>
        {L === "de" ? "Approval Timeline" : "Approval timeline"}
      </div>
      <div className="sec-sub" style={{ marginBottom: 12 }}>
        {L === "de"
          ? "Die letzten Freigabeereignisse für den Bericht. Ja, selbst Genehmigungen brauchen inzwischen eine Zeitachse."
          : "Recent approval events for the report. Apparently even approvals need a timeline now."}
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {rows.map((row: any) => {
          const tone = row.status === "approved" ? "#16A34A" : row.status === "rejected" ? "#DC2626" : "#D97706";
          const due = row.due_at ? fmt(row.due_at) : null;
          return (
            <div key={row.id} style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: 12, background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                <div style={{ fontWeight: 700, color: "#111827" }}>
                  {row.status === "pending" ? (L === "de" ? "Freigabe angefragt" : "Approval requested") : row.status === "approved" ? (L === "de" ? "Freigegeben" : "Approved") : (L === "de" ? "Abgelehnt" : "Rejected")}
                </div>
                <span className="stat-pill" style={{ color: tone, borderColor: `${tone}33`, background: `${tone}0F` }}>{row.status}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "#4B5563", display: "grid", gap: 4 }}>
                <div>{L === "de" ? "Angefragt" : "Requested"}: <strong>{fmt(row.requested_at)}</strong>{row.requested_by ? ` · ${row.requested_by}` : ""}</div>
                <div>{L === "de" ? "Überfälligkeitsgrenze" : "SLA due"}: <strong>{due || "-"}</strong>{row.sla_days ? ` · ${row.sla_days} ${L === "de" ? "Tage" : "days"}` : ""}</div>
                <div>{L === "de" ? "Entscheidung" : "Decision"}: <strong>{fmt(row.reviewed_at)}</strong>{row.reviewed_by ? ` · ${row.reviewed_by}` : ""}</div>
                {row.approval_notes ? <div>{L === "de" ? "Notiz" : "Note"}: {row.approval_notes}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
