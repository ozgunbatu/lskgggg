import React from "react";
import type { Lang, WorkspaceRequestStateView } from "@/lib/workspace-types";
import type { WorkspaceDomainKey } from "@/hooks/useWorkspaceRequestState";

type DomainItem = {
  key: WorkspaceDomainKey;
  label?: string;
  onRetry?: () => void | Promise<void>;
};

export default function WorkspaceDataState({
  L,
  requestState,
  domains,
}: {
  L: Lang;
  requestState: WorkspaceRequestStateView;
  domains: DomainItem[];
}) {
  const active = domains.filter((d) => requestState[d.key]?.loading || requestState[d.key]?.error);
  if (!active.length) return null;

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <div>
          <div className="eyebrow">{L === "de" ? "Datenstatus" : "Data status"}</div>
          <div style={{ fontWeight: 800 }}>{L === "de" ? "Aktive Module" : "Active modules"}</div>
        </div>
        <div className="mini">{active.length} {L === "de" ? "Bereiche" : "areas"}</div>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {active.map((item) => {
          const state = requestState[item.key];
          return (
            <div key={item.key} className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 12, border: "1px solid var(--line)", borderRadius: 12, padding: "10px 12px" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>{item.label || item.key}</div>
                {state.loading ? (
                  <div className="mini">{L === "de" ? "Wird geladen..." : "Loading..."}</div>
                ) : state.error ? (
                  <div className="mini" style={{ color: "#b42318" }}>{state.error}</div>
                ) : null}
              </div>
              {state.error && item.onRetry ? (
                <button className="btn secondary" onClick={() => item.onRetry?.()}>
                  {L === "de" ? "Erneut versuchen" : "Retry"}
                </button>
              ) : state.loading ? (
                <span className="mini">…</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
