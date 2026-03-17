"use client";
import { useState } from "react";
import { NAV_GROUPS, TABS } from "@/lib/workspace-config";
import type { Lang, TabId, Company, Complaint } from "@/lib/workspace-types";

const ICONS: Record<string, string> = {
  dashboard:"⬡", suppliers:"◉", actions:"△", complaints:"◈",
  saq:"◻", kpi:"◎", reports:"⊞", evidence:"◆", monitoring:"◌",
  ai:"✦", audit:"≡", legal:"⊛", settings:"⊙",
};

type Props = {
  L: Lang; tab: TabId; company: Company | null;
  complaints: Complaint[]; actionOverdue: number; approvalPending: number;
  setTab: (t: TabId) => void; changeLang: (l: Lang) => void; logout: () => void;
};

export default function WorkspaceNav({ L, tab, company, complaints, actionOverdue, approvalPending, setTab, changeLang, logout }: Props) {
  const openC = complaints.filter(c => c.status === "open").length;
  const urgentTotal = actionOverdue + openC + approvalPending;

  return (
    <nav className="nav">
      {/* Logo */}
      <div className="nav-logo">
        <div className="nav-logo-mark">LC</div>
        <div className="nav-logo-text">LkSG<span>Compass</span></div>
      </div>

      {/* Groups */}
      <div className="nav-scroll">
        {NAV_GROUPS.map(group => (
          <div key={group.key} className="nav-group">
            <span className="nav-group-title">{L === "de" ? group.de : group.en}</span>
            {group.tabs.map(id => {
              const item = TABS.find(t => t.id === id)!;
              const badge = id === "actions" ? actionOverdue : id === "complaints" ? openC : id === "reports" ? approvalPending : 0;
              return (
                <button
                  key={id}
                  className={"nav-tab" + (tab === id ? " on" : "")}
                  onClick={() => setTab(id)}
                >
                  <span style={{ fontSize: 10, opacity: tab === id ? 0.8 : 0.4 }}>{ICONS[id]}</span>
                  {L === "de" ? item.de : item.en}
                  {badge > 0 && <span className="nav-badge">{badge}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Right */}
      <div className="nav-right">
        {urgentTotal > 0 && (
          <div style={{
            display:"flex", alignItems:"center", gap:5,
            fontSize:11, fontWeight:700, color:"var(--amb)",
            background:"var(--amb-5)", border:"1px solid var(--amb-15)",
            borderRadius:"var(--r1)", padding:"3px 9px",
          }}>
            <span style={{fontSize:10}}>⚠</span>
            {urgentTotal}
          </div>
        )}
        {company && (
          <div className="nav-cmp" style={{ maxWidth: 130 }}>
            <span style={{ fontSize: 9, color: "var(--g-lo)" }}>◉</span>
            <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:11.5 }}>
              {company.name}
            </span>
          </div>
        )}
        <div className="lang-grp">
          <button className={"lb" + (L === "de" ? " on" : "")} onClick={() => changeLang("de")}>DE</button>
          <button className={"lb" + (L === "en" ? " on" : "")} onClick={() => changeLang("en")}>EN</button>
        </div>
        <button className="nav-out" onClick={logout}>
          {L === "de" ? "Abmelden" : "Sign out"}
        </button>
      </div>
    </nav>
  );
}
