"use client";

import { useState } from "react";
import type { Toast } from "@/lib/workspace-types";

export default function WorkspaceToasts({ toasts }: { toasts: Toast[] }) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const visible = toasts.filter(t => !dismissed.has(t.id));

  if (visible.length === 0) return null;

  return (
    <div className="toasts">
      {visible.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type === "ok" ? "ok" : t.type === "err" ? "err" : "info"}`}
          style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>
              {t.type === "ok" ? "✓" : t.type === "err" ? "!" : "i"}
            </span>
            <span>{t.msg}</span>
          </div>
          <button
            onClick={() => setDismissed(prev => new Set([...prev, t.id]))}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "inherit", opacity: 0.6, fontSize: 16, lineHeight: 1,
              padding: "0 2px", flexShrink: 0,
            }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
