import type { Lang, TabId } from "@/lib/workspace-types";

type Props = {
  L: Lang;
  tab: TabId;
  workspaceMeta: { title: string; sub: string };
  setTab: (tab: TabId) => void;
};

export default function WorkspaceHeader({ L, tab, workspaceMeta, setTab }: Props) {
  return (
    <div className="workspace-bar">
      <div className="workspace-meta">
        <div className="workspace-kicker">{L === "de" ? "Enterprise workspace" : "Enterprise workspace"}</div>
        <div className="workspace-title">{workspaceMeta.title}</div>
        <div className="workspace-sub">{workspaceMeta.sub}</div>
        <div className="stat-pill">{L === "de" ? "Geführter Arbeitsablauf" : "Guided operating flow"}</div>
      </div>
      <div className="workspace-actions">
        {tab !== "suppliers" && <button className="btn btn-g btn-sm" onClick={() => setTab("suppliers")}>{L === "de" ? "Lieferanten öffnen" : "Open suppliers"}</button>}
        {tab !== "complaints" && <button className="btn btn-g btn-sm" onClick={() => setTab("complaints")}>{L === "de" ? "Beschwerden öffnen" : "Open complaints"}</button>}
        {tab !== "reports" && <button className="btn btn-p btn-sm" onClick={() => setTab("reports")}>{L === "de" ? "Bericht öffnen" : "Open report"}</button>}
      </div>
    </div>
  );
}
