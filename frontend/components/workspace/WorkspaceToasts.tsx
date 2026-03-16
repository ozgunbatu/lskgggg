"use client";
import type { Toast } from "@/lib/workspace-types";

export default function WorkspaceToasts({ toasts }: { toasts: Toast[] }) {
  if (!toasts.length) return null;
  return (
    <div className="toasts">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>
            {t.type === "ok" ? "✓" : t.type === "err" ? "✕" : "ℹ"}
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
