import React from "react";

export default function WorkspaceActionPrompt({
  tone = "blue",
  title,
  copy,
  actionLabel,
  onAction,
}: {
  tone?: "blue" | "amber" | "green";
  title: string;
  copy: string;
  actionLabel: string;
  onAction: () => void;
}) {
  const styles: Record<string, React.CSSProperties> = {
    blue: { background: "#F5F9FF", border: "1px solid #D8E7FF" },
    amber: { background: "#FFF8EB", border: "1px solid #F5D58A" },
    green: { background: "#F3FBF5", border: "1px solid #C6E4CE" },
  };
  return (
    <div className="action-prompt" style={styles[tone]}>
      <div>
        <div className="action-prompt-title">{title}</div>
        <div className="action-prompt-copy">{copy}</div>
      </div>
      <button className="btn btn-p btn-xs" onClick={onAction}>{actionLabel}</button>
    </div>
  );
}
