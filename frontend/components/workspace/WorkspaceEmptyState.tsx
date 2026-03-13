import React from "react";
import type { Lang } from "../../lib/workspace-types";

type Action = { label: string; onClick: () => void; tone?: "primary" | "secondary" };

export default function WorkspaceEmptyState({
  L,
  icon,
  title,
  copy,
  primary,
  secondary,
  compact = false,
}: {
  L: Lang;
  icon: string;
  title: string;
  copy: string;
  primary?: Action;
  secondary?: Action;
  compact?: boolean;
}) {
  return (
    <div className={"empty" + (compact ? " empty-compact" : "")}>
      <div className="empty-ic">{icon}</div>
      <div className="empty-t">{title}</div>
      <div className="empty-c">{copy}</div>
      {(primary || secondary) && (
        <div className="brow" style={{ justifyContent: "center", marginTop: 14, gap: 8 }}>
          {primary && (
            <button className={"btn btn-sm " + (primary.tone === "secondary" ? "btn-g" : "btn-p")} onClick={primary.onClick}>
              {primary.label}
            </button>
          )}
          {secondary && (
            <button className={"btn btn-sm " + (secondary.tone === "primary" ? "btn-p" : "btn-g")} onClick={secondary.onClick}>
              {secondary.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
