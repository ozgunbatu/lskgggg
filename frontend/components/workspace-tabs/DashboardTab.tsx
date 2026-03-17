import React from "react";
import WorkspaceDataState from "../workspace/WorkspaceDataState";
import WorkspaceSectionMeta from "../workspace/WorkspaceSectionMeta";
import WorkspaceActionPrompt from "../workspace/WorkspaceActionPrompt";
import WorkspaceLaunchpad from "../workspace/WorkspaceLaunchpad";
import WorkspaceApprovalSummary from "../workspace/WorkspaceApprovalSummary";
import WorkspaceApprovalAging from "../workspace/WorkspaceApprovalAging";
import SkeletonCard from "@/components/workspace/SkeletonCard";
import type { DashboardTabProps, Supplier } from "@/lib/workspace-types";

export default function DashboardTab(props: DashboardTabProps) {
  const {
    L, requestState, reloads, showQuickstart, dismissQuickstart,
    quickstartSteps, quickstartDone, company, complaints, suppliers,
    actions, saqs, draftTs, setTab, score, actionStats, kpis,
    recalc, loading, approvalMeta, sendAi, expanded, setExpanded,
    RiskBreakdown, openAddSupModal, setShowCapModal, gradeLabel,
    scCol, sc, sg, COUNTRIES, INDUSTRIES, csv, setCsv, importCsv,
  } = props;

  const openComplaints   = complaints.filter(c => c.status === "open").length;
  const overdueActions   = actions.filter(a => a.due_date && new Date(a.due_date) < new Date() && a.status !== "completed" && a.status !== "closed").length;
  const riskSuppliers    = suppliers.filter(s => s.risk_level === "high" || s.risk_level === "medium");
  const topSuppliers     = [...riskSuppliers].sort((a,b) => (b.risk_score??0)-(a.risk_score??0)).slice(0,5);
  const bafahecks = [
    { ok: suppliers.length > 0,              para: "§5", label: L==="de" ? "Lieferanten erfasst" : "Suppliers recorded" },
    { ok: suppliers.some(s => s.risk_score > 0), para: "§5", label: L==="de" ? "Risikoanalyse ausgeführt" : "Risk analysis completed" },
    { ok: actionStats.total > 0,             para: "§7", label: L==="de" ? "CAPs angelegt" : "CAPs created" },
    { ok: complaints.length >= 0,            para: "§8", label: L==="de" ? "Beschwerdekanal aktiv" : "Complaint channel active" },
    { ok: !!draftTs,                         para: "§10", label: L==="de" ? "Berichtsentwurf vorhanden" : "Report draft exists" },
  ];

  return (
    <>
      <WorkspaceDataState L={L} requestState={requestState} domains={["suppliers","actions","complaints"]} reload={reloads.reloadCoreData} />

      {/* ── QUICKSTART ─────────────────────────────────────────────────────── */}
      {showQuickstart && (
        <div className="quickstart-card">
          <div className="sec-hd" style={{ marginBottom: 0 }}>
            <div>
              <div className="sec-title">{L==="de" ? "Geführter Start" : "Guided start"}</div>
              <div className="sec-sub">{L==="de" ? "Alle Funktionen. Die richtige Reihenfolge." : "All features. The right order."}</div>
            </div>
            <div className="brow">
              <span className={quickstartDone === quickstartSteps.length ? "badge-ok" : "badge-warn"}>
                {quickstartDone}/{quickstartSteps.length} {L==="de" ? "erledigt" : "done"}
              </span>
              <button className="btn btn-g btn-sm" onClick={dismissQuickstart}>{L==="de" ? "Ausblenden" : "Dismiss"}</button>
            </div>
          </div>
          <div className="quickstart-progress" style={{ marginTop: 12 }}>
            <div className="prog" style={{ height: 5 }}>
              <div className="prog-fill" style={{ width: `${Math.round((quickstartDone/Math.max(quickstartSteps.length,1))*100)}%`, background: "var(--g2)" }} />
            </div>
            <div className="quickstart-progress-note">
              {quickstartDone === quickstartSteps.length ? (L==="de" ? "System bereit." : "System ready.") : `${Math.round((quickstartDone/Math.max(quickstartSteps.length,1))*100)}% ${L==="de" ? "abgeschlossen" : "complete"}`}
            </div>
          </div>
          <div className="quickstart-grid">
            {quickstartSteps.map((step, idx) => (
              <div key={step.id} className={"quickstep" + (step.done ? " done" : "")}>
                <div className="quickstep-top">
                  <div className="quickstep-num">{step.done ? "✓" : idx + 1}</div>
                  <div className="quickstep-status">{step.done ? (L==="de" ? "Fertig" : "Done") : (L==="de" ? "Offen" : "Open")}</div>
                </div>
                <div className="quickstep-title">{step.title}</div>
                <div className="quickstep-copy">{step.copy}</div>
                <button className={"btn btn-sm " + (step.done ? "btn-g" : "btn-p")} onClick={() => setTab(step.tab)}>
                  {step.done ? (L==="de" ? "Prüfen →" : "Review →") : (L==="de" ? "Öffnen →" : "Open →")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── KPI ROW ───────────────────────────────────────────────────────── */}
      <div className="kpi-row">
        {/* Compliance Score */}
        <div className="kpi">
          <div className="kpi-accent" style={{ background: scCol }} />
          <div className="kpi-lbl" style={{ color: "var(--t3)" }}>
            {L==="de" ? "Compliance Score" : "Compliance Score"}
            <span className="ltag">§9</span>
          </div>
          <div className="kpi-val" style={{ color: scCol }}>
            {sc}<span style={{ fontSize: 14, fontWeight: 400, color: "var(--t3)" }}>/100</span>
          </div>
          <div className="kpi-sub">
            {L==="de" ? "Note" : "Grade"} <strong style={{ color: scCol }}>{String(sg)}</strong> · {gradeLabel(String(sg), L)}
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span className="stat-pill">{L==="de" ? "Risiko" : "Risk"}: {score.risk}</span>
            <span className="stat-pill">{L==="de" ? "Prozess" : "Process"}: {score.process}</span>
          </div>
        </div>

        {/* Suppliers */}
        <div className="kpi">
          <div className="kpi-accent" style={{ background: kpis.high > 0 ? "var(--red)" : "var(--g2)" }} />
          <div className="kpi-lbl">{L==="de" ? "Lieferanten" : "Suppliers"}</div>
          <div className="kpi-val">{kpis.total}</div>
          <div className="kpi-sub">
            {kpis.countries} {L==="de" ? "Länder" : "countries"}
            {kpis.high > 0 && <> · <span style={{ color: "var(--red)" }}>{kpis.high} {L==="de" ? "Hochrisiko" : "high-risk"}</span></>}
          </div>
        </div>

        {/* Actions */}
        <div className="kpi">
          <div className="kpi-accent" style={{ background: overdueActions > 0 ? "var(--red)" : actionStats.open > 0 ? "var(--amber)" : "var(--g2)" }} />
          <div className="kpi-lbl">{L==="de" ? "Offene CAPs" : "Open CAPs"}<span className="ltag">§6</span></div>
          <div className="kpi-val" style={{ color: overdueActions > 0 ? "var(--red)" : actionStats.open > 0 ? "var(--amber)" : "var(--g1)" }}>
            {actionStats.open}
          </div>
          <div className="kpi-sub">
            {overdueActions > 0
              ? <span style={{ color: "var(--red)" }}>{overdueActions} {L==="de" ? "überfällig" : "overdue"}</span>
              : <>{actionStats.done} {L==="de" ? "abgeschlossen" : "completed"}</>}
          </div>
        </div>

        {/* Complaints */}
        <div className="kpi">
          <div className="kpi-accent" style={{ background: openComplaints > 0 ? "var(--amber)" : "var(--border)" }} />
          <div className="kpi-lbl">{L==="de" ? "Beschwerden offen" : "Open complaints"}<span className="ltag">§8</span></div>
          <div className="kpi-val" style={{ color: openComplaints > 0 ? "var(--amber)" : "var(--t2)" }}>{openComplaints}</div>
          <div className="kpi-sub">{L==="de" ? "Gesamt" : "Total"}: {complaints.length}</div>
        </div>
      </div>

      {/* ── MAIN GRID ─────────────────────────────────────────────────────── */}
      <div className="g2" style={{ marginBottom: 14 }}>

        {/* Priorities */}
        <div className="card">
          <div className="sec-hd">
            <div>
              <div className="sec-title">{L==="de" ? "Heutige Prioritäten" : "Today's priorities"}</div>
              <div className="sec-sub">{L==="de" ? "Was zuerst Aufmerksamkeit braucht." : "What needs attention first."}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              {
                tab: "actions" as const,
                label: L==="de" ? "Überfällige CAPs" : "Overdue CAPs",
                copy: overdueActions > 0 ? `${overdueActions} ${L==="de" ? "Maßnahmen brauchen sofort Aufmerksamkeit" : "actions need immediate attention"}` : (L==="de" ? "Keine überfälligen CAPs" : "No overdue CAPs"),
                urgent: overdueActions > 0,
                color: "var(--red)",
              },
              {
                tab: "complaints" as const,
                label: L==="de" ? "Offene Beschwerden" : "Open complaints",
                copy: openComplaints > 0 ? `${openComplaints} ${L==="de" ? "Hinweise müssen priorisiert werden" : "cases need prioritisation"}` : (L==="de" ? "Kanal ist ruhig" : "Channel is quiet"),
                urgent: openComplaints > 0,
                color: "var(--amber)",
              },
              {
                tab: "reports" as const,
                label: "BAFA Readiness",
                copy: draftTs ? `${L==="de" ? "Letzter Entwurf" : "Last draft"}: ${draftTs}` : (L==="de" ? "Noch kein Entwurf" : "No draft yet"),
                urgent: !draftTs,
                color: "var(--blue)",
              },
            ].map(item => (
              <button
                key={item.tab}
                onClick={() => setTab(item.tab)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: "var(--r-md)",
                  border: `1px solid ${item.urgent ? item.color + "30" : "var(--border)"}`,
                  background: item.urgent ? item.color + "08" : "var(--bg-2)",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.12s",
                }}
              >
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: item.urgent ? item.color : "var(--t4)",
                  flexShrink: 0,
                  boxShadow: item.urgent ? `0 0 6px ${item.color}` : "none",
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "var(--t3)" }}>{item.copy}</div>
                </div>
                <span style={{ fontSize: 12, color: "var(--t4)" }}>→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Risk Portfolio */}
        <div className="card">
          <div className="sec-hd">
            <div>
              <div className="sec-title">{L==="de" ? "Risikoanalyse" : "Risk analysis"}</div>
              <div className="sec-sub">{L==="de" ? "Top Lieferanten nach Risikolevel" : "Top suppliers by risk level"}</div>
            </div>
            <div className="brow">
              <button className="btn btn-g btn-sm" onClick={recalc} disabled={loading}>
                {loading ? <span className="spin-d" /> : null}
                {L==="de" ? "Berechnen" : "Calculate"}
              </button>
              <button className="btn btn-ai btn-sm" onClick={() => setTab("ai")}>✦ AI</button>
            </div>
          </div>
          {topSuppliers.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {topSuppliers.map((s: Supplier) => {
                const isExp = expanded === `dash-${s.id}`;
                const rc = s.risk_level === "high" ? "var(--red)" : "var(--amber)";
                return (
                  <div key={s.id}>
                    <button
                      onClick={() => setExpanded(isExp ? null : `dash-${s.id}`)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px",
                        borderRadius: isExp ? "var(--r-md) var(--r-md) 0 0" : "var(--r-md)",
                        border: `1px solid ${isExp ? rc + "30" : "var(--border)"}`,
                        background: isExp ? rc + "06" : "var(--bg-2)",
                        textAlign: "left", cursor: "pointer", transition: "all 0.12s",
                      }}
                    >
                      <span className={s.risk_level === "high" ? "chip ch" : "chip cm"} style={{ flexShrink: 0 }}>{s.risk_level}</span>
                      <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: "var(--t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                      <span style={{ fontSize: 11, color: "var(--t3)", flexShrink: 0 }}>{s.country} · {s.industry}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: rc, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{s.risk_score}</span>
                    </button>
                    {isExp && (
                      <div style={{ padding: 12, background: "var(--bg-2)", border: `1px solid ${rc}20`, borderTop: "none", borderRadius: "0 0 var(--r-md) var(--r-md)" }}>
                        <RiskBreakdown sup={s} compact />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty empty-compact">
              <div className="empty-ic">◎</div>
              <div className="empty-t">{L==="de" ? "Keine Risikodaten" : "No risk data"}</div>
              <div className="empty-c">{L==="de" ? "Lieferanten anlegen oder CSV importieren." : "Add suppliers or import a CSV."}</div>
              <button className="btn btn-p btn-sm" style={{ marginTop: 12 }} onClick={openAddSupModal}>
                + {L==="de" ? "Lieferant anlegen" : "Add supplier"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM ROW ────────────────────────────────────────────────────── */}
      <div className="g2">
        {/* BAFA Checklist */}
        <div className="card">
          <div className="sec-hd">
            <div>
              <div className="sec-title">BAFA Readiness</div>
              <div className="sec-sub">{L==="de" ? "Status der Kernpflichten §§4–10" : "Core obligation status §§4–10"}</div>
            </div>
            <span className={bafahecks.every(b => b.ok) ? "badge-ok" : "badge-warn"}>
              {bafahecks.filter(b => b.ok).length}/{bafahecks.length}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {bafahecks.map((item, idx) => (
              <div key={idx} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px",
                borderRadius: "var(--r-md)",
                border: `1px solid ${item.ok ? "var(--g-border)" : "var(--border)"}`,
                background: item.ok ? "var(--g-bg)" : "var(--bg-2)",
              }}>
                <span style={{ fontSize: 12, color: item.ok ? "var(--g1)" : "var(--t4)", flexShrink: 0 }}>
                  {item.ok ? "✓" : "○"}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: item.ok ? "var(--g1)" : "var(--t3)",
                  fontFamily: "'DM Mono', monospace", flexShrink: 0,
                  background: item.ok ? "rgba(110,231,160,0.12)" : "var(--bg-3)",
                  border: `1px solid ${item.ok ? "var(--g-border)" : "var(--border)"}`,
                  borderRadius: 20, padding: "1px 7px",
                }}>
                  {item.para}
                </span>
                <span style={{ fontSize: 13, fontWeight: 500, color: item.ok ? "var(--t1)" : "var(--t2)", flex: 1 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Import */}
        <div className="card">
          <div className="sec-hd">
            <div>
              <div className="sec-title">{L==="de" ? "Schnellimport" : "Quick import"}</div>
              <div className="sec-sub">{L==="de" ? "CSV für Demo und Erstaufbau." : "CSV for demo and initial setup."}</div>
            </div>
          </div>
          <div style={{
            padding: "10px 12px",
            borderRadius: "var(--r-md)",
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            marginBottom: 10,
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: "var(--t3)",
            lineHeight: 1.8,
          }}>
            <div style={{ color: "var(--g1)", marginBottom: 4, fontFamily: "inherit", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {L==="de" ? "Empfohlene Spalten" : "Recommended columns"}
            </div>
            name, country, industry, spend, workers
          </div>
          <textarea
            className="ta"
            rows={5}
            value={csv}
            onChange={e => setCsv(e.target.value)}
            placeholder="name,country,industry&#10;Example GmbH,DE,Automotive&#10;..."
            style={{ fontFamily: "'DM Mono', monospace", fontSize: 11.5 }}
          />
          <div className="brow" style={{ marginTop: 10 }}>
            <button className="btn btn-g btn-sm" onClick={importCsv} disabled={loading}>
              {loading ? <span className="spin-d" /> : null}
              {L==="de" ? "CSV importieren" : "Import CSV"}
            </button>
            <button className="btn btn-p btn-sm" onClick={openAddSupModal}>
              + {L==="de" ? "Manuell" : "Manual"}
            </button>
            <button className="btn btn-g btn-sm" onClick={() => setShowCapModal(true)}>
              {L==="de" ? "CAP vorbereiten" : "Prepare CAP"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
