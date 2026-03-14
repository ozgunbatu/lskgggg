import React from "react";
import type { Lang } from "@/lib/workspace-types";

type Step = {
  id: string;
  label: string;
  done: boolean;
  copy?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function WorkspaceModuleGuide({
  L,
  storageKey,
  title,
  subtitle,
  steps,
}: {
  L: Lang;
  storageKey: string;
  title: string;
  subtitle: string;
  steps: Step[];
}) {
  const [hidden, setHidden] = React.useState(false);
  React.useEffect(() => {
    try {
      setHidden(window.localStorage.getItem(storageKey) === "hidden");
    } catch {}
  }, [storageKey]);

  const done = steps.filter(s => s.done).length;
  const pct = Math.round((done / Math.max(steps.length, 1)) * 100);
  const toneClass = done === steps.length ? "ok" : done >= Math.ceil(steps.length / 2) ? "warn" : "info";

  if (hidden) {
    return (
      <div className="module-guide-collapsed">
        <span className={done === steps.length ? "badge-ok" : "badge-warn"}>{done}/{steps.length} {L === "de" ? "erledigt" : "done"}</span>
        <button className="btn btn-g btn-xs" onClick={() => {
          try { window.localStorage.removeItem(storageKey); } catch {}
          setHidden(false);
        }}>{L === "de" ? "Guide zeigen" : "Show guide"}</button>
      </div>
    );
  }

  return (
    <div className="module-guide">
      <div className="module-guide-head">
        <div>
          <div className="module-guide-title">{title}</div>
          <div className="module-guide-sub">{subtitle}</div>
        </div>
        <div className="brow">
          <span className={toneClass === "ok" ? "badge-ok" : toneClass === "warn" ? "badge-warn" : "badge-err"}>{done}/{steps.length} {L === "de" ? "erledigt" : "done"}</span>
          <button className="btn btn-g btn-xs" onClick={() => {
            try { window.localStorage.setItem(storageKey, "hidden"); } catch {}
            setHidden(true);
          }}>{L === "de" ? "Ausblenden" : "Hide"}</button>
        </div>
      </div>
      <div className="prog" style={{ marginBottom: 12 }}><div className="prog-fill" style={{ width: `${pct}%`, background: done === steps.length ? "#16A34A" : "#1B3D2B" }} /></div>
      <div className="module-guide-grid">
        {steps.map((step, idx) => (
          <div key={step.id} className={"module-guide-step" + (step.done ? " done" : "")}>
            <div className="module-guide-step-top">
              <div className="module-guide-step-num">{step.done ? "✓" : idx + 1}</div>
              <div className="module-guide-step-status">{step.done ? (L === "de" ? "Fertig" : "Done") : (L === "de" ? "Offen" : "Open")}</div>
            </div>
            <div className="module-guide-step-title">{step.label}</div>
            {step.copy ? <div className="module-guide-step-copy">{step.copy}</div> : null}
            {step.onAction && step.actionLabel ? (
              <button className={"btn btn-xs " + (step.done ? "btn-g" : "btn-p")} onClick={step.onAction}>{step.actionLabel}</button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
