import React from "react";
import WorkspaceDataState from "../workspace/WorkspaceDataState";
import WorkspaceSectionMeta from "../workspace/WorkspaceSectionMeta";
import WorkspaceActionPrompt from "../workspace/WorkspaceActionPrompt";
import WorkspaceLaunchpad from "../workspace/WorkspaceLaunchpad";
import WorkspaceApprovalSummary from "../workspace/WorkspaceApprovalSummary";
import WorkspaceApprovalAging from "../workspace/WorkspaceApprovalAging";
import type { DashboardTabProps, Supplier } from "@/lib/workspace-types";

export default function DashboardTab(props: DashboardTabProps) {
  const {
    L,
    requestState,
    reloads,
    showQuickstart,
    dismissQuickstart,
    quickstartSteps,
    quickstartDone,
    company,
    complaints,
    suppliers,
    actions,
    saqs,
    draftTs,
    setTab,
    score,
    actionStats,
    kpis,
    recalc,
    loading,
    approvalMeta,
    sendAi,
    expanded,
    setExpanded,
    RiskBreakdown,
    openAddSupModal,
    setShowCapModal,
    gradeLabel,
    scCol,
    sc,
    sg,
    COUNTRIES,
    INDUSTRIES,
    csv,
    setCsv,
    importCsv,
  } = props;

  const openComplaints = complaints.filter((c) => c.status === "open").length;
  const overdueActions = actions.filter((a) => a.due_date && new Date(a.due_date) < new Date() && a.status !== "completed" && a.status !== "closed").length;
  const riskSuppliers = suppliers.filter((s) => s.risk_level === "high" || s.risk_level === "medium");
  const topSuppliers = [...riskSuppliers].sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0)).slice(0, 5);

  return (
    <>
      <WorkspaceDataState
        L={L}
        requestState={requestState}
        domains={[
          { key: "company", label: L === "de" ? "Unternehmen" : "Company", onRetry: reloads.reloadSuppliersDomain },
          { key: "suppliers", label: L === "de" ? "Lieferanten" : "Suppliers", onRetry: reloads.reloadSuppliersDomain },
          { key: "complaints", label: L === "de" ? "Beschwerden" : "Complaints", onRetry: reloads.reloadComplaintsDomain },
          { key: "actions", label: L === "de" ? "Massnahmen" : "Actions", onRetry: reloads.reloadComplaintsDomain },
          { key: "saqs", label: "SAQ", onRetry: reloads.reloadReportsDomain },
          { key: "evidences", label: L === "de" ? "Nachweise" : "Evidence", onRetry: reloads.reloadReportsDomain },
          { key: "insights", label: L === "de" ? "Monitoring" : "Monitoring", onRetry: reloads.reloadInsights },
          { key: "kpi", label: "KPI", onRetry: reloads.reloadInsights },
          { key: "audit", label: "Audit", onRetry: () => reloads.reloadAudit() },
        ]}
      />

      <WorkspaceSectionMeta
        L={L}
        title={L === "de" ? "Systemzustand" : "System status"}
        requestState={requestState}
        domains={["company", "suppliers", "complaints", "actions", "saqs", "evidences", "insights", "kpi", "audit"]}
        onRefresh={reloads.reloadComplianceCore}
      />

      {loading && !suppliers.length && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
          <SkeletonCard rows={4} height={14} />
          <SkeletonCard rows={4} height={14} />
          <SkeletonCard rows={4} height={14} />
        </div>
      )}
      {!loading && !suppliers.length && (
        <WorkspaceActionPrompt
          tone="amber"
          title={L === "de" ? "Ohne Lieferanten bleibt der Rest nur Dekoration" : "Without suppliers, the rest is decoration"}
          copy={L === "de" ? "Starten Sie mit dem Lieferantenregister. Sonst tun Risiko, Reports und Monitoring nur so, als haetten sie Kontext." : "Start with the supplier register. Otherwise risk, reports and monitoring are just pretending to have context."}
          actionLabel={L === "de" ? "Lieferanten oeffnen" : "Open suppliers"}
          onAction={() => setTab("suppliers")}
        />
      )}

      <WorkspaceApprovalSummary L={L} approval={approvalMeta} onOpenReports={() => setTab("reports")} />
      <WorkspaceApprovalAging L={L} approval={approvalMeta} onOpenReports={() => setTab("reports")} />

      <WorkspaceLaunchpad
        L={L}
        title={L === "de" ? "Go-live Launchpad" : "Go-live launchpad"}
        subtitle={L === "de" ? "Die naechsten sinnvollen Schritte, damit das Ding wie ein Produkt aussieht und nicht wie ein Werkzeuglager." : "The next sensible steps so this looks like a product, not a tool shed."}
        items={[
          {
            id: "suppliers",
            title: L === "de" ? "Lieferantenregister vervollstaendigen" : "Complete supplier register",
            copy: suppliers.length
              ? (L === "de" ? `${suppliers.length} Lieferanten vorhanden. Jetzt fehlende Stammdaten und Risikoabdeckung schliessen.` : `${suppliers.length} suppliers loaded. Now close missing master data and risk coverage.`)
              : (L === "de" ? "Noch kein Register vorhanden. Das ist der Anfang, nicht die Krise." : "No register yet. That is the beginning, not the apocalypse."),
            status: suppliers.length ? (L === "de" ? "Basis steht" : "Base in place") : (L === "de" ? "Nicht gestartet" : "Not started"),
            actionLabel: L === "de" ? "Zu Lieferanten" : "Open suppliers",
            onAction: () => setTab("suppliers"),
            tone: suppliers.length ? "green" : "amber",
          },
          {
            id: "reports",
            title: L === "de" ? "Berichtsfähigkeit haerten" : "Harden report readiness",
            copy: draftTs
              ? (L === "de" ? `Letzter Entwurf: ${draftTs}. Jetzt Evidence und CAP-Status sauber halten.` : `Last draft: ${draftTs}. Keep evidence and CAP status clean now.`)
              : (L === "de" ? "Es gibt noch keinen belastbaren Berichtsstand. Das wird kurz vor BAFA sonst unerquicklich." : "There is no reliable reporting baseline yet. That gets unpleasant right before BAFA."),
            status: draftTs ? (L === "de" ? "Entwurf vorhanden" : "Draft exists") : (L === "de" ? "Entwurf fehlt" : "No draft"),
            actionLabel: L === "de" ? "Zu Reports" : "Open reports",
            onAction: () => setTab("reports"),
            tone: draftTs ? "blue" : "amber",
          },
          {
            id: "monitoring",
            title: L === "de" ? "Monitoring zyklisch fahren" : "Run monitoring routinely",
            copy: L === "de" ? "Ein stilles Dashboard ist nicht automatisch gesund. Refreshen, pruefen, dokumentieren." : "A quiet dashboard is not automatically healthy. Refresh, review, document.",
            status: L === "de" ? "Kontinuierlich" : "Continuous",
            actionLabel: L === "de" ? "Monitoring oeffnen" : "Open monitoring",
            onAction: () => setTab("monitoring"),
            tone: "green",
          },
        ]}
      />

      {showQuickstart && (
        <div className="quickstart-card">
          <div className="sec-hd" style={{ marginBottom: 0 }}>
            <div>
              <div className="sec-title">{L === "de" ? "Gefuehrter Start" : "Guided start"}</div>
              <div className="sec-sub">{L === "de" ? "Alle Funktionen bleiben drin. Nur die Reihenfolge ist endlich vernuenftig." : "All features stay. The order is finally sensible."}</div>
            </div>
            <div className="brow">
              <span className={quickstartDone === quickstartSteps.length ? "badge-ok" : "badge-warn"}>
                {quickstartDone}/{quickstartSteps.length} {L === "de" ? "abgeschlossen" : "completed"}
              </span>
              <button className="btn btn-g btn-sm" onClick={dismissQuickstart}>
                {L === "de" ? "Ausblenden" : "Hide"}
              </button>
            </div>
          </div>
          <div className="quickstart-progress" style={{ marginTop: 14 }}>
            <div className="prog">
              <div className="prog-fill" style={{ width: `${Math.round((quickstartDone / Math.max(quickstartSteps.length, 1)) * 100)}%`, background: "#1B3D2B" }} />
            </div>
            <div className="quickstart-progress-note">
              {quickstartDone === quickstartSteps.length
                ? (L === "de" ? "System ist startklar." : "System is ready.")
                : (L === "de" ? "Diese Schritte sauber abhaken, dann wird der Rest deutlich angenehmer." : "Tick these off cleanly and the rest gets much less annoying.")}
            </div>
          </div>
          <div className="quickstart-grid">
            {quickstartSteps.map((step, idx) => (
              <div key={step.id} className={"quickstep" + (step.done ? " done" : "")}>
                <div className="quickstep-top">
                  <div className="quickstep-num">{step.done ? "✓" : idx + 1}</div>
                  <div className="quickstep-status">{step.done ? (L === "de" ? "Fertig" : "Done") : (L === "de" ? "Offen" : "Open")}</div>
                </div>
                <div className="quickstep-title">{step.title}</div>
                <div className="quickstep-copy">{step.copy}</div>
                <button className={"btn btn-sm " + (step.done ? "btn-g" : "btn-p")} onClick={() => setTab(step.tab)}>
                  {step.done ? (L === "de" ? "Pruefen" : "Review") : (L === "de" ? "Jetzt oeffnen" : "Open now")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-accent" style={{ background: scCol }} />
          <div className="kpi-lbl">Compliance Score <span className="ltag">§9</span></div>
          <div className="kpi-val" style={{ color: scCol }}>
            {sc}<span style={{ fontSize: 14, fontWeight: 500, color: "#9CA3AF" }}>/100</span>
          </div>
          <div className="kpi-sub">
            {L === "de" ? "Note" : "Grade"} <strong style={{ color: scCol }}>{String(sg)}</strong> &middot; {gradeLabel(String(sg), L)}
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span className="stat-pill">{L === "de" ? "Risiko" : "Risk"}: {score.risk}</span>
            <span className="stat-pill">{L === "de" ? "Prozess" : "Process"}: {score.process}</span>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-accent" style={{ background: kpis.high > 0 ? "#DC2626" : "#1B3D2B" }} />
          <div className="kpi-lbl">{L === "de" ? "Lieferanten" : "Suppliers"}</div>
          <div className="kpi-val">{kpis.total}</div>
          <div className="kpi-sub">
            {kpis.countries} {L === "de" ? "Laender" : "countries"} &middot; {kpis.high > 0 ? `${kpis.high} ${L === "de" ? "hoch" : "high"}` : (L === "de" ? "kein Hochrisiko" : "no high-risk")}
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-accent" style={{ background: overdueActions > 0 ? "#DC2626" : actionStats.open > 0 ? "#D97706" : "#16A34A" }} />
          <div className="kpi-lbl">{L === "de" ? "Offene CAPs" : "Open CAPs"}<span className="ltag">§6</span></div>
          <div className="kpi-val" style={{ color: overdueActions > 0 ? "#DC2626" : actionStats.open > 0 ? "#D97706" : "#16A34A" }}>{actionStats.open}</div>
          <div className="kpi-sub">{overdueActions > 0 ? `${overdueActions} ${L === "de" ? "ueberfaellig" : "overdue"}` : `${actionStats.done} ${L === "de" ? "abgeschlossen" : "completed"}`}</div>
        </div>

        <div className="kpi">
          <div className="kpi-accent" style={{ background: openComplaints > 0 ? "#D97706" : "#E2E8E2" }} />
          <div className="kpi-lbl">{L === "de" ? "Beschwerden offen" : "Complaints open"}<span className="ltag">§8</span></div>
          <div className="kpi-val">{openComplaints}</div>
          <div className="kpi-sub">{L === "de" ? "Gesamt" : "Total"}: {complaints.length}</div>
        </div>
      </div>

      <div className="g2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="sec-hd">
            <div>
              <div className="sec-title">{L === "de" ? "Heutige Prioritaeten" : "Today's priorities"}</div>
              <div className="sec-sub">{L === "de" ? "Was zuerst dran ist, damit die Plattform nicht nur beschaeftigt wirkt." : "What matters first so the platform does not merely look busy."}</div>
            </div>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <button className="card-sm" onClick={() => setTab("actions")} style={{ textAlign: "left", borderLeft: `3px solid ${overdueActions > 0 ? "#DC2626" : "#E2E8E2"}` }}>
              <div style={{ fontWeight: 800 }}>{L === "de" ? "Ueberfaellige CAPs" : "Overdue CAPs"}</div>
              <div style={{ fontSize: 12.5, color: "#6B7280" }}>{overdueActions > 0 ? `${overdueActions} ${L === "de" ? "Massnahmen brauchen sofort Aufmerksamkeit." : "actions need immediate attention."}` : (L === "de" ? "Aktuell keine ueberfaelligen CAPs." : "No overdue CAPs right now.")}</div>
            </button>
            <button className="card-sm" onClick={() => setTab("complaints")} style={{ textAlign: "left", borderLeft: `3px solid ${openComplaints > 0 ? "#D97706" : "#E2E8E2"}` }}>
              <div style={{ fontWeight: 800 }}>{L === "de" ? "Offene Beschwerden" : "Open complaints"}</div>
              <div style={{ fontSize: 12.5, color: "#6B7280" }}>{openComplaints > 0 ? `${openComplaints} ${L === "de" ? "Hinweise muessen priorisiert werden." : "cases need prioritisation."}` : (L === "de" ? "Der Kanal ist ruhig. Hoffentlich aus den richtigen Gruenden." : "The channel is quiet. Hopefully for the right reasons.")}</div>
            </button>
            <button className="card-sm" onClick={() => setTab("reports")} style={{ textAlign: "left", borderLeft: `3px solid ${draftTs ? "#2563EB" : "#D97706"}` }}>
              <div style={{ fontWeight: 800 }}>{L === "de" ? "BAFA-Readiness" : "BAFA readiness"}</div>
              <div style={{ fontSize: 12.5, color: "#6B7280" }}>{draftTs ? `${L === "de" ? "Letzter Entwurf" : "Last draft"}: ${draftTs}` : (L === "de" ? "Noch kein Draft vorhanden." : "No draft yet.")}</div>
            </button>
          </div>
        </div>

        <div className="card">
          <div className="sec-hd">
            <div>
              <div className="sec-title">{L === "de" ? "Portfolio-Risikoanalyse" : "Portfolio risk analysis"}</div>
              <div className="sec-sub">{L === "de" ? "Kompakter Einstieg statt Wand aus Karten. Auch mal eine Verbesserung." : "A compact entry point instead of a wall of cards. Progress, somehow."}</div>
            </div>
            <div className="brow">
              <button className="btn btn-g btn-sm" onClick={recalc} disabled={loading}>{L === "de" ? "Neu berechnen" : "Recalculate"}</button>
              <button className="btn btn-ai btn-sm" onClick={() => setTab("ai")}>AI</button>
            </div>
          </div>

          {topSuppliers.length ? (
            <div style={{ display: "grid", gap: 10 }}>
              {topSuppliers.map((s: Supplier) => {
                const isExp = expanded === `dash-${s.id}`;
                return (
                  <div key={s.id}>
                    <button
                      onClick={() => setExpanded(isExp ? null : `dash-${s.id}`)}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: isExp ? "8px 8px 0 0" : 8, border: `1.5px solid ${isExp ? "#1B3D2B" : "#E2E8E2"}`, background: isExp ? "#fff" : "#F8FAF8", textAlign: "left" }}
                    >
                      <span className={s.risk_level === "high" ? "chip ch" : "chip cm"}>{s.risk_level}</span>
                      <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700 }}>{s.name}</span>
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>{s.country} · {s.industry}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: s.risk_level === "high" ? "#DC2626" : "#D97706" }}>{s.risk_score}</span>
                    </button>
                    {isExp && (
                      <div style={{ padding: "12px", background: "#F8FAF8", border: "1.5px solid #1B3D2B", borderTop: "none", borderRadius: "0 0 8px 8px" }}>
                        <RiskBreakdown sup={s} compact />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty empty-compact">
              <div className="empty-ic">&#127970;</div>
              <div className="empty-t">{L === "de" ? "Noch keine Risikodaten" : "No risk data yet"}</div>
              <div className="empty-c">{L === "de" ? "Legen Sie Lieferanten an oder importieren Sie ein CSV. Sonst schaut das Dashboard nur beschaeftigt aus." : "Add suppliers or import a CSV. Otherwise the dashboard is just pretending to be useful."}</div>
              <button className="btn btn-p btn-sm" style={{ marginTop: 12 }} onClick={openAddSupModal}>+ {L === "de" ? "Lieferant anlegen" : "Add supplier"}</button>
            </div>
          )}
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="sec-hd">
            <div>
              <div className="sec-title">BAFA Readiness</div>
              <div className="sec-sub">{L === "de" ? "Einfacher Pflichtstatus ueber die Kernbereiche §§4-10." : "Simple obligation status across the core §§4-10 areas."}</div>
            </div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {[
              { ok: suppliers.length > 0, label: L === "de" ? "§5 Lieferanten erfasst" : "§5 suppliers recorded" },
              { ok: suppliers.some((s) => s.risk_score > 0), label: L === "de" ? "§5 Risikoanalyse ausgefuehrt" : "§5 risk analysis completed" },
              { ok: actionStats.total > 0, label: L === "de" ? "§7 CAPs angelegt" : "§7 CAPs created" },
              { ok: complaints.length >= 0, label: L === "de" ? "§8 Beschwerdekanal aktiv" : "§8 complaint channel active" },
              { ok: !!draftTs, label: L === "de" ? "§10 Berichtsentwurf vorhanden" : "§10 report draft exists" },
            ].map((item, idx) => (
              <div key={idx} className="card-xs" style={{ display: "flex", alignItems: "center", gap: 10, background: item.ok ? "#F0FDF4" : "#FFF7ED" }}>
                <span className={item.ok ? "badge-ok" : "badge-warn"}>{item.ok ? "✓" : "!"}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="sec-hd">
            <div>
              <div className="sec-title">{L === "de" ? "Quick import" : "Quick import"}</div>
              <div className="sec-sub">{L === "de" ? "Schneller Einstieg fuer Demo und Erstaufbau." : "Fast entry point for demos and initial setup."}</div>
            </div>
          </div>
          <div className="card-xs" style={{ marginBottom: 10, background: "#F8FAF8" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>{L === "de" ? "Empfohlene Felder" : "Recommended fields"}</div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>name,country,industry,spend,workers</div>
            <div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 6 }}>{COUNTRIES.length} {L === "de" ? "Laender" : "countries"} &middot; {INDUSTRIES.length} {L === "de" ? "Branchen" : "industries"}</div>
          </div>
          <textarea className="ta" rows={5} value={csv} onChange={(e) => setCsv(e.target.value)} style={{ fontFamily: "'DM Mono', monospace", fontSize: 11.5, background: "#F8FAF8" }} />
          <div className="brow" style={{ marginTop: 10 }}>
            <button className="btn btn-g btn-sm" onClick={importCsv} disabled={loading}>{L === "de" ? "CSV importieren" : "Import CSV"}</button>
            <button className="btn btn-p btn-sm" onClick={openAddSupModal}>+ {L === "de" ? "Manuell anlegen" : "Add manually"}</button>
            <button className="btn btn-g btn-sm" onClick={() => setShowCapModal(true)}>{L === "de" ? "CAP vorbereiten" : "Prepare CAP"}</button>
          </div>
        </div>
      </div>
    </>
  );
}
