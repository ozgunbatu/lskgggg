import type { Lang, TabId } from "@/lib/workspace-types";

const PARA: Record<string, string> = {
  dashboard:"§3–§10", suppliers:"§5–§6", actions:"§7",
  complaints:"§8", saq:"§5", kpi:"§9", reports:"§10",
  evidence:"§10", monitoring:"§5", ai:"✦", audit:"§10",
  legal:"§6", settings:"",
};

type Props = {
  L: Lang; tab: TabId;
  workspaceMeta: { title: string; sub: string };
  setTab: (t: TabId) => void;
};

export default function WorkspaceHeader({ L, tab, workspaceMeta, setTab }: Props) {
  const para = PARA[tab];
  return (
    <div className="workspace-bar">
      <div className="workspace-meta">
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
          <span className="workspace-kicker">
            {L === "de" ? "Enterprise Compliance" : "Enterprise Compliance"}
          </span>
          {para && (
            <span style={{
              fontFamily:"'DM Mono',monospace", fontSize:9.5, fontWeight:700,
              color:"var(--g-lo)", background:"var(--g-5)",
              border:"1px solid var(--g-20)", borderRadius:20, padding:"1px 7px",
            }}>{para}</span>
          )}
        </div>
        <div className="workspace-title">{workspaceMeta.title}</div>
        <div className="workspace-sub" style={{ marginTop:2 }}>{workspaceMeta.sub}</div>
      </div>
      <div className="workspace-actions">
        {tab !== "suppliers" && (
          <button className="btn btn-g btn-sm" onClick={() => setTab("suppliers")}>
            {L === "de" ? "Lieferanten" : "Suppliers"}
          </button>
        )}
        {tab !== "reports" && (
          <button className="btn btn-p btn-sm" onClick={() => setTab("reports")}>
            {L === "de" ? "BAFA-Bericht" : "Report"} →
          </button>
        )}
      </div>
    </div>
  );
}
