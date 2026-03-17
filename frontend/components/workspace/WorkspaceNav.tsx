import { useState } from "react";
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

const PRIMARY_TABS: TabId[] = ["dashboard", "suppliers", "actions", "reports", "complaints", "monitoring"];

export default function WorkspaceNav({ L, tab, company, complaints, actionOverdue, approvalPending, setTab, changeLang, logout }: Props) {
  const [showMore, setShowMore] = useState(false);
  const openComplaints = complaints.filter(c => c.status === "open").length;

  const badgeForTab = (id: TabId) => id === "actions" ? actionOverdue : id === "complaints" ? openComplaints : id === "reports" ? approvalPending : 0;
  const activeItem = TABS.find(t => t.id === tab);


  return (
    <nav className="nav">
      <div className="nav-topline">
        <div className="nav-brand-block">
          <div className="nav-logo">
            <div className="nav-logo-mark">LC</div>
            <div className="nav-logo-text">LkSG<span>Compass</span></div>
          </div>
          <div className="nav-context">
            <span className="nav-context-label">{L === "de" ? "Aktiv" : "Active"}</span>
            <span className="nav-context-value">{L === "de" ? activeItem?.de : activeItem?.en}</span>
          </div>
        </div>

        <div className="nav-right">
          {actionOverdue > 0 && (
            <div className="nav-cmp nav-alert-chip" style={{ color: "var(--amber)", borderColor: "var(--amber-border)", background: "var(--amber-bg)" }}>
              <span style={{ fontSize: 10 }}>⚠</span>
              {actionOverdue} {L === "de" ? "überfällig" : "overdue"}
            </div>
          )}
          {company && (
            <div className="nav-cmp nav-company-pill">
              <span style={{ fontSize: 10, color: "var(--g1)" }}>◉</span>
              <span style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{company.name}</span>
            </div>
          )}
          <div className="lang-grp">
            <button type="button" className={"lb" + (L === "de" ? " on" : "")} onClick={() => changeLang("de")}>DE</button>
            <button type="button" className={"lb" + (L === "en" ? " on" : "")} onClick={() => changeLang("en")}>EN</button>
          </div>
          <button type="button" className="nav-out" onClick={logout}>
            <span style={{ fontSize: 12 }}>→</span>
            {L === "de" ? "Abmelden" : "Sign out"}
          </button>
        </div>
      </div>

      <div className="nav-mainrow">
        <div className="nav-primary-tabs">
          {PRIMARY_TABS.map(id => {
            const item = TABS.find(t => t.id === id)!;
            const badge = badgeForTab(id);
            return (
              <button
                type="button"
                key={id}
                className={"nav-main-tab" + (tab === id ? " on" : "")}
                onClick={() => { setShowMore(false); setTab(id); }}
              >
                <span className="nav-main-icon">{TAB_ICONS[id] || "·"}</span>
                <span>{L === "de" ? item.de : item.en}</span>
                {badge > 0 && <span className="nav-badge">{badge}</span>}
              </button>
            );
          })}
        </div>

        <div className="nav-secondary-actions">
          <button type="button" className={"nav-more-btn" + (showMore ? " on" : "")} onClick={() => setShowMore(v => !v)}>
            <span>{L === "de" ? "Mehr Bereiche" : "More areas"}</span>
            <span className="nav-more-chevron">▾</span>
          </button>
        </div>
      </div>

      {showMore && (
        <div className="nav-more-panel">
          {NAV_GROUPS.map(group => {
            const groupTabs = group.tabs.filter(id => !PRIMARY_TABS.includes(id));
            if (!groupTabs.length) return null;
            return (
              <div key={group.key} className="nav-more-group">
                <div className="nav-more-title">{L === "de" ? group.de : group.en}</div>
                <div className="nav-more-grid">
                  {groupTabs.map(id => {
                    const item = TABS.find(t => t.id === id)!;
                    const badge = badgeForTab(id);
                    return (
                      <button
                        type="button"
                        key={id}
                        className={"nav-more-card" + (tab === id ? " on" : "")}
                        onClick={() => { setTab(id); setShowMore(false); }}
                      >
                        <div className="nav-more-card-top">
                          <span className="nav-main-icon">{TAB_ICONS[id] || "·"}</span>
                          {badge > 0 && <span className="nav-badge">{badge}</span>}
                        </div>
                        <div className="nav-more-card-label">{L === "de" ? item.de : item.en}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </nav>
  );
}
