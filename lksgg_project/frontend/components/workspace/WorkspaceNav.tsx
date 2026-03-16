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

export default function WorkspaceNav({ L, tab, company, complaints, actionOverdue, approvalPending, setTab, changeLang, logout }: Props) {
  const openComplaints = complaints.filter(c => c.status === "open").length;

  return (
    <nav className="nav">
      <div className="nav-logo">
        <div className="nav-logo-mark">LC</div>
        <div className="nav-logo-text">LkSG<span>Compass</span></div>
        <div className="workspace-kicker" style={{marginLeft:8}}>{L === "de" ? "Control hub" : "Control hub"}</div>
      </div>
      <div className="nav-scroll grouped">
        {NAV_GROUPS.map(group => (
          <div key={group.key} className="nav-group">
            <span className="nav-group-title">{L === "de" ? group.de : group.en}</span>
            {group.tabs.map(id => {
              const item = TABS.find(t => t.id === id)!;
              const badge = id === "actions" ? actionOverdue : id === "complaints" ? openComplaints : id === "reports" ? approvalPending : 0;
              return (
                <button key={id} className={"nav-tab" + (tab === id ? " on" : "")} onClick={() => setTab(id)}>
                  <span>{L === "de" ? item.de : item.en}</span>
                  {badge > 0 && <span className="nav-badge">{badge}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="nav-right">
        {company && <div className="nav-cmp"><span style={{ fontSize: 11 }}>&#127970;</span>{company.name}</div>}
        <div className="nav-cmp"><span style={{ fontSize: 11 }}>⚙️</span>{L === "de" ? `${actionOverdue} überfällig` : `${actionOverdue} overdue`}</div>
        <div className="lang-grp">
          <button className={"lb" + (L === "de" ? " on" : "")} onClick={() => changeLang("de")}>DE</button>
          <button className={"lb" + (L === "en" ? " on" : "")} onClick={() => changeLang("en")}>EN</button>
        </div>
        <button className="nav-out" onClick={logout}>{L === "de" ? "Abmelden" : "Sign out"}</button>
      </div>
    </nav>
  );
}
