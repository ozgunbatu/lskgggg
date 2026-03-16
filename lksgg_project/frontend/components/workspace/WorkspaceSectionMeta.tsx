import React from "react";
import type { Lang, WorkspaceRequestStateView } from "@/lib/workspace-types";
import type { WorkspaceDomainKey } from "@/hooks/useWorkspaceRequestState";

function relTime(ts: number | null, L: Lang) {
  if (!ts) return L === "de" ? "Noch nicht geladen" : "Not loaded yet";
  const diffMin = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (diffMin < 1) return L === "de" ? "Gerade aktualisiert" : "Updated just now";
  if (diffMin < 60) return L === "de" ? `Vor ${diffMin} Min. aktualisiert` : `Updated ${diffMin} min ago`;
  const diffH = Math.round(diffMin / 60);
  return L === "de" ? `Vor ${diffH} Std. aktualisiert` : `Updated ${diffH}h ago`;
}

export default function WorkspaceSectionMeta({
  L,
  title,
  requestState,
  domains,
  onRefresh,
}: {
  L: Lang;
  title: string;
  requestState: WorkspaceRequestStateView;
  domains: WorkspaceDomainKey[];
  onRefresh?: () => void | Promise<void>;
}) {
  const states = domains.map((k) => requestState[k]).filter(Boolean);
  const loading = states.some((x) => x.loading);
  const error = states.find((x) => x.error)?.error || null;
  const lastLoadedAt = states.map((x) => x.lastLoadedAt || 0).sort((a, b) => b - a)[0] || null;
  const stale = lastLoadedAt ? (Date.now() - lastLoadedAt > 5 * 60 * 1000) : true;

  return (
    <div className="section-meta">
      <div className="section-meta-left">
        <span className="section-meta-title">{title}</span>
        <span className={"section-meta-pill " + (loading ? "is-loading" : error ? "is-error" : stale ? "is-stale" : "is-ok")}>
          {loading
            ? (L === "de" ? "Wird aktualisiert" : "Refreshing")
            : error
            ? (L === "de" ? "Fehler erkannt" : "Error detected")
            : stale
            ? (L === "de" ? "Daten älter als 5 Min." : "Data older than 5 min")
            : (L === "de" ? "Aktuell" : "Fresh")}
        </span>
        <span className="section-meta-copy">{error || relTime(lastLoadedAt, L)}</span>
      </div>
      {onRefresh && (
        <button className="btn btn-g btn-xs" onClick={() => onRefresh()}>
          ↻ {L === "de" ? "Aktualisieren" : "Refresh"}
        </button>
      )}
    </div>
  );
}
