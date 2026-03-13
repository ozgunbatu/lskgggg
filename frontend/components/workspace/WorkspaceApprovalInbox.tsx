"use client";

import React from "react";

type ApprovalRow = {
  id: string;
  entity_type: string;
  entity_id: string | null;
  requested_by: string | null;
  status: string;
  approval_notes: string | null;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

function fmt(ts?: string | null) {
  if (!ts) return "-";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleString();
}

export default function WorkspaceApprovalInbox({
  L,
  rows,
  loading,
  currentRole,
  notes,
  setNotes,
  onRefresh,
  onRequest,
  onApprove,
  onReject,
}: {
  L: "de" | "en";
  rows: ApprovalRow[];
  loading: boolean;
  currentRole: string;
  notes: string;
  setNotes: (v: string) => void;
  onRefresh: () => void;
  onRequest: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const canApprove = ["approver", "admin"].includes(currentRole);
  const latest = rows[0] || null;

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="sec-hd" style={{ marginBottom: 12 }}>
        <div>
          <div className="sec-title">{L === "de" ? "Approval Inbox" : "Approval inbox"}<span className="ltag">BAFA</span></div>
          <div className="sec-sub">
            {L === "de"
              ? "Freigabeanfragen fuer den Jahresbericht. Endlich ein geordneter Weg fuer den obligatorischen Genehmigungszirkus."
              : "Approval requests for the annual report. A slightly less chaotic route through the approval ritual."}
          </div>
        </div>
        <div className="brow">
          <button className="btn btn-g btn-sm" onClick={onRefresh} disabled={loading}>{L === "de" ? "Aktualisieren" : "Refresh"}</button>
          <button className="btn btn-p btn-sm" onClick={onRequest} disabled={loading}>{L === "de" ? "Freigabe anfragen" : "Request approval"}</button>
        </div>
      </div>

      <div className="fl">
        <label>{L === "de" ? "Notiz fuer Freigabe" : "Approval note"}</label>
        <textarea className="ta" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={L === "de" ? "Optional: Was sollen Approver wissen?" : "Optional: What should approvers know?"} />
      </div>

      {latest && (
        <div className="al al-blue" style={{ marginBottom: 14 }}>
          <span className="al-icon">i</span>
          <div style={{ fontSize: 12.5 }}>
            {L === "de" ? "Letzter Status:" : "Latest status:"} <b>{latest.status}</b>
            {" · "}{L === "de" ? "angefragt" : "requested"}: {fmt(latest.requested_at)}
            {latest.reviewed_at ? ` · ${L === "de" ? "geprueft" : "reviewed"}: ${fmt(latest.reviewed_at)}` : ""}
          </div>
        </div>
      )}

      {canApprove && latest?.status === "pending" && (
        <div className="brow" style={{ marginBottom: 14 }}>
          <button className="btn btn-g" onClick={onApprove} disabled={loading}>{L === "de" ? "Freigeben" : "Approve"}</button>
          <button className="btn" style={{ borderColor: "#DC2626", color: "#DC2626" }} onClick={onReject} disabled={loading}>{L === "de" ? "Ablehnen" : "Reject"}</button>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 8 }}>
          <div className="empty-icon">✅</div>
          <div className="empty-title">{L === "de" ? "Noch keine Freigaben" : "No approvals yet"}</div>
          <div className="empty-copy">{L === "de" ? "Sobald der Bericht ernst genommen werden soll, erscheint hier die Anfragehistorie." : "Once the report enters grown-up territory, the request history will appear here."}</div>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>{L === "de" ? "Status" : "Status"}</th>
                <th>{L === "de" ? "Angefragt von" : "Requested by"}</th>
                <th>{L === "de" ? "Angefragt am" : "Requested at"}</th>
                <th>{L === "de" ? "Geprueft von" : "Reviewed by"}</th>
                <th>{L === "de" ? "Notiz" : "Note"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><span className="chip">{r.status}</span></td>
                  <td>{r.requested_by || "-"}</td>
                  <td>{fmt(r.requested_at)}</td>
                  <td>{r.reviewed_by || "-"}</td>
                  <td style={{ maxWidth: 320 }}>{r.approval_notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
