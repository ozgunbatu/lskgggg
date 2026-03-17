import { NAV_GROUPS, TABS } from "@/lib/workspace-config";
import type { Lang, TabId, Company, Complaint } from "@/lib/workspace-types";

type Props = {
  L: Lang;
  tab: TabId;
  company: Company | null;
  complaints: Complaint[];
  actionOverdue: number;
  approvalPending: number;
  setTab: (tab: TabId) => void;
  changeLang: (lang: Lang) => void;
  logout: () => void;
};

const TAB_ICONS: Record<string, string> = {
  dashboard: "◈", suppliers: "◎", actions: "⊕", complaints: "△",
  saq: "◻", kpi: "◈", reports: "⊞", evidence: "◉", monitoring: "◌",
  ai: "◆", audit: "≡", legal: "⊛", settings: "⊙",
};

export default function WorkspaceNav({ L, tab, company, complaints, actionOverdue, approvalPending, setTab, changeLang, logout }: Props) {
  const openComplaints = complaints.filter(c => c.status === "open").length;

  return (
    <nav className="nav">
      {/* LOGO */}
      <div className="nav-logo">
        <div className="nav-logo-mark">LC</div>
        <div className="nav-logo-text">LkSG<span>Compass</span></div>
      </div>

      {/* NAV GROUPS */}
      <div className="nav-scroll grouped">
        {secondaryGroups.map(group => (
          <div key={group.key} className="nav-group">
            <span className="nav-group-title">{L === "de" ? group.de : group.en}</span>
            {group.tabs.map(id => {
              const item = TABS.find(t => t.id === id)!;
              const badge = id === "actions" ? actionOverdue : id === "complaints" ? openComplaints : id === "reports" ? approvalPending : 0;
              return (
                <button
                  key={id}
                  className={"nav-tab" + (tab === id ? " on" : "")}
                  onClick={() => setTab(id)}
                >
                  <span style={{ fontSize: 11, opacity: 0.7 }}>{TAB_ICONS[id] || "·"}</span>
                  <span>{L === "de" ? item.de : item.en}</span>
                  {badge > 0 && <span className="nav-badge">{badge}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* RIGHT SIDE */}
      <div className="nav-right">
        {actionOverdue > 0 && (
          <div className="nav-cmp" style={{ color: "var(--amber)", borderColor: "var(--amber-border)", background: "var(--amber-bg)" }}>
            <span style={{ fontSize: 10 }}>⚠</span>
            {actionOverdue} {L === "de" ? "überfällig" : "overdue"}
          </div>
        )}
        {company && (
          <div className="nav-cmp">
            <span style={{ fontSize: 10, color: "var(--g1)" }}>◉</span>
            <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{company.name}</span>
          </div>
        )}
        <div className="lang-grp">
          <button className={"lb" + (L === "de" ? " on" : "")} onClick={() => changeLang("de")}>DE</button>
          <button className={"lb" + (L === "en" ? " on" : "")} onClick={() => changeLang("en")}>EN</button>
        </div>
        <button className="nav-out" onClick={logout}>
          <span style={{ fontSize: 12 }}>→</span>
          {L === "de" ? "Abmelden" : "Sign out"}
        </button>
      </div>
    </nav>
  );
}
