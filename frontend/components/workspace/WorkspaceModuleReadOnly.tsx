import React from "react";

type Props = {
  L: "de" | "en";
  title?: string;
  copy?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function WorkspaceModuleReadOnly({ L, title, copy, actionLabel, onAction }: Props) {
  return (
    <div className="card" style={{ marginBottom: 16, borderLeft: "3px solid #6B7280", background: "#F9FAFB" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#111827", marginBottom: 4 }}>
            {title || (L === "de" ? "Dieses Modul ist aktuell schreibgeschützt" : "This module is currently read-only")}
          </div>
          <div style={{ fontSize: 12.5, color: "#6B7280", maxWidth: 760 }}>
            {copy || (L === "de"
              ? "Ihre aktuelle Rolle darf hier lesen, aber nicht schreiben. Die Software bleibt also höflich, auch wenn Bürokratie manchmal andere Pläne hat."
              : "Your current role can read here, but not write. The software is staying polite, even when bureaucracy has other ideas.")}
          </div>
        </div>
        {actionLabel && onAction && (
          <button className="btn btn-g btn-sm" onClick={onAction}>{actionLabel}</button>
        )}
      </div>
    </div>
  );
}
