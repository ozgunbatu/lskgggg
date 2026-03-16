import React from "react";
import type { Lang } from "@/lib/workspace-types";

type Item = {
  id: string;
  title: string;
  copy: string;
  status: string;
  actionLabel: string;
  onAction: () => void;
  tone?: "green" | "amber" | "blue" | "red";
};

const TONE = {
  green: { bg: "#F0FDF4", border: "#BBF7D0", color: "#166534" },
  amber: { bg: "#FFFBEB", border: "#FDE68A", color: "#92400E" },
  blue: { bg: "#EFF6FF", border: "#BFDBFE", color: "#1E40AF" },
  red: { bg: "#FEF2F2", border: "#FECACA", color: "#991B1B" },
};

export default function WorkspaceLaunchpad({ L, title, subtitle, items }: { L: Lang; title: string; subtitle: string; items: Item[] }) {
  return (
    <div className="module-launchpad">
      <div className="sec-hd" style={{ marginBottom: 12 }}>
        <div>
          <div className="sec-title">{title}</div>
          <div className="sec-sub">{subtitle}</div>
        </div>
        <span className="stat-pill">{items.length} {L === "de" ? "Empfehlungen" : "recommendations"}</span>
      </div>
      <div className="module-launchpad-grid">
        {items.map(item => {
          const tone = TONE[item.tone || "green"];
          return (
            <div key={item.id} className="module-launchpad-card" style={{ background: tone.bg, borderColor: tone.border }}>
              <div className="module-launchpad-status" style={{ color: tone.color }}>{item.status}</div>
              <div className="module-launchpad-title">{item.title}</div>
              <div className="module-launchpad-copy">{item.copy}</div>
              <button className="btn btn-xs btn-g" onClick={item.onAction}>{item.actionLabel}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
