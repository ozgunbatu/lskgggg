import type { Lang, TabId } from "@/lib/workspace-types";

type Props = {
  L: Lang;
  tab: TabId;
  workspaceMeta: { title: string; sub: string };
  setTab: (tab: TabId) => void;
};

const TAB_PARA: Record<string, string> = {
  dashboard: "§3–§10",
  suppliers: "§5–§6",
  actions: "§7",
  complaints: "§8",
  saq: "§6",
  kpi: "§4",
  reports: "§10",
  evidence: "§10",
  monitoring: "§5",
  ai: "KI",
  audit: "§10",
  legal: "§6",
  settings: "",
};

export default function WorkspaceHeader({ L, tab, workspaceMeta, setTab }: Props) {
  const para = TAB_PARA[tab];
  return (
    <div className="workspace-bar" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
      <div className="workspace-meta">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <div className="workspace-kicker">
            {L === "de" ? "Enterprise Compliance" : "Enterprise Compliance"}
          </div>
          {para && (
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--g1)",
              background: "var(--g-bg)",
              border: "1px solid var(--g-border)",
              borderRadius: 20,
              padding: "1px 8px",
              fontFamily: "'DM Mono', monospace",
              letterSpacing: "0.04em",
            }}>
              {para}
            </span>
          )}
        </div>
        <div className="workspace-title">{workspaceMeta.title}</div>
        <div className="workspace-sub">{workspaceMeta.sub}</div>
      </div>
      <div className="workspace-actions" style={{ flexShrink: 0 }}>
        {tab !== "suppliers" && (
          <button className="btn btn-g btn-sm" onClick={() => setTab("suppliers")}>
            {L === "de" ? "Lieferanten" : "Suppliers"}
          </button>
        )}
        {tab !== "reports" && (
          <button className="btn btn-p btn-sm" onClick={() => setTab("reports")}>
            {L === "de" ? "BAFA-Bericht" : "BAFA Report"} →
          </button>
        )}
      </div>
    </div>
  );
}
