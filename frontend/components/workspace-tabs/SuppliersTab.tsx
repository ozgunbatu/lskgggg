import React from "react";
import WorkspaceDataState from "../workspace/WorkspaceDataState";
import WorkspaceSectionMeta from "../workspace/WorkspaceSectionMeta";
import WorkspaceActionPrompt from "../workspace/WorkspaceActionPrompt";
import WorkspaceModuleGuide from "../workspace/WorkspaceModuleGuide";
import WorkspaceModuleReadOnly from "../workspace/WorkspaceModuleReadOnly";
import type { WorkspaceTabProps } from "@/lib/workspace-types";
import { canWrite } from "@/lib/workspace-access";
import { getSessionRole } from "@/lib/auth";
import { RC } from "@/lib/workspace-constants";

const RL_COLORS: Record<string,string> = {
  high: "var(--red)", medium: "var(--amber)", low: "var(--g1)", unknown: "var(--t3)",
};

export default function SuppliersTab(props: WorkspaceTabProps) {
  const {
    L, requestState, reloads, company, suppliers, loading, expanded, setExpanded,
    editingSup, sName, setSName, sCountry, setSCountry, sInd, setSInd,
    csv, setCsv, showCapModal, setShowCapModal, capPara, setCapPara,
    supAI, supCAP, supLd, rYear, setRYear, draft, setDraft, draftTs, genLd,
    aiMsgs, setAiMsgs, aiInput, setAiInput, aiLd, saqs, saqEmail, setSaqEmail,
    saqSup, setSaqSup, saqDays, setSaqDays, saqSending, kpiLive, kpiTrend, kpiLd,
    supFilter, setSupFilter, auditLog, auditFilter, setAuditFilter, auditLd,
    evidences, evTitle, setEvTitle, evType, setEvType, evLksg, setEvLksg,
    evDesc, setEvDesc, evSupId, setEvSupId, evFile, setEvFile, evUploading,
    openAddSupModal, openEditSupModal, delSupplier, recalc, importCsv,
    submitComplaint, triageComplaint, updateComplaintStatus, saveComplaintNote,
    createCap, updateActionStatus, saveActionNote, deleteAction,
    loadDraft, saveDraft, genSection, getSupAI, getSupCAP, sendAi,
    loadAuditLog, exportCSV, sendSaq, deleteSaq, loadKpi, saveKpiSnapshot,
    uploadEvidence, deleteEvidence, chipRL, sevChip, cStatusChip, aStatusChip,
    pChip, dueBadge, RiskBreakdown, setTab, fileRef, score, kpis, actionStats,
    workspaceAssist, BF, approvalMeta, triageRes, setTriageRes, triageLd,
    actionNotes, setActionNotes, complaints, actions, events, screenings,
    showQuickstart,
  } = props;

  const role = approvalMeta?.currentRole || getSessionRole();
  const writable = canWrite(approvalMeta?.currentRole);

  // Filter suppliers
  const visible = suppliers.filter(s => {
    const sr = s as any;
    const q = supFilter.search.toLowerCase();
    const matchQ = !q || sr.name?.toLowerCase().includes(q) || sr.country?.toLowerCase().includes(q) || sr.industry?.toLowerCase().includes(q);
    const matchR = !supFilter.risk || sr.risk_level === supFilter.risk;
    const matchC = !supFilter.country || sr.country === supFilter.country;
    return matchQ && matchR && matchC;
  });

  const riskCount = {
    high: suppliers.filter((s: any) => s.risk_level === "high").length,
    medium: suppliers.filter((s: any) => s.risk_level === "medium").length,
    low: suppliers.filter((s: any) => s.risk_level === "low").length,
  };

  return (
    <>
      <WorkspaceDataState L={L} requestState={requestState} domains={[
        { key: "company", label: L==="de" ? "Unternehmensprofil" : "Company profile", onRetry: reloads.reloadSuppliersDomain },
        { key: "suppliers", label: L==="de" ? "Lieferanten" : "Suppliers", onRetry: reloads.reloadSuppliersDomain },
      ]} />
      <WorkspaceSectionMeta L={L} title={L==="de" ? "Lieferanten §5" : "Suppliers §5"} requestState={requestState} domains={["company","suppliers"]} onRefresh={reloads.reloadSuppliersDomain} />
      {!canWrite(role) && <WorkspaceModuleReadOnly L={L} title={L==="de" ? "Schreibgeschützt" : "Read-only"} copy={L==="de" ? "Ihre Rolle kann Lieferanten nur lesen." : "Your role can only read suppliers."} actionLabel={L==="de" ? "Reports öffnen" : "Open reports"} onAction={() => setTab("reports")} />}

      <WorkspaceModuleGuide
        L={L} storageKey="lksg-guide-suppliers"
        title={L==="de" ? "Modul-Guide: Lieferanten §5" : "Module guide: Suppliers §5"}
        subtitle={L==="de" ? "Saubere Stammdaten sind die Basis. Ohne sie bleibt jede Risikoanalyse Spekulation." : "Clean master data is the foundation. Without it every risk analysis is speculation."}
        steps={[
          { id:"reg", label: L==="de" ? "Ersten Lieferanten anlegen" : "Create first supplier", done: suppliers.length > 0, copy: L==="de" ? "Startpunkt für Risiko, SAQ und BAFA." : "Starting point for risk, SAQ and BAFA.", actionLabel: L==="de" ? "Anlegen" : "Add", onAction: () => writable && openAddSupModal() },
          { id:"geo", label: L==="de" ? "Land & Branche pflegen" : "Complete country & industry", done: suppliers.length > 0 && (suppliers as any[]).every((s:any) => !!s.country && !!s.industry), copy: L==="de" ? "Diese zwei Felder bestimmen den Risikowert." : "These two fields determine the risk score." },
          { id:"risk", label: L==="de" ? "Risiko berechnen" : "Calculate risk", done: suppliers.length > 0 && (suppliers as any[]).every((s:any) => s.risk_level !== "unknown"), copy: L==="de" ? "Danach sind Reports und CAPs sinnvoll." : "After that reports and CAPs make sense.", actionLabel: L==="de" ? "Berechnen" : "Calculate", onAction: recalc },
        ]}
      />

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
        {[
          { label: L==="de" ? "Gesamt" : "Total", value: kpis.total, color: "var(--t1)", accent: "var(--border)" },
          { label: L==="de" ? "Hochrisiko" : "High risk", value: riskCount.high, color: "var(--red)", accent: "var(--red)" },
          { label: L==="de" ? "Mittelrisiko" : "Medium", value: riskCount.medium, color: "var(--amber)", accent: "var(--amber)" },
          { label: L==="de" ? "Länder" : "Countries", value: kpis.countries, color: "var(--blue)", accent: "var(--blue)" },
        ].map(stat => (
          <div key={stat.label} className="kpi" style={{ padding: "14px 16px" }}>
            <div className="kpi-accent" style={{ background: stat.accent }} />
            <div className="kpi-lbl">{stat.label}</div>
            <div className="kpi-val" style={{ color: stat.color, fontSize: 24 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* ── FILTERS + ACTIONS ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <input className="inp" style={{ height: 34, width: 200, fontSize: 12.5 }}
          placeholder={L==="de" ? "Suchen..." : "Search..."}
          value={supFilter.search}
          onChange={e => setSupFilter((f: any) => ({ ...f, search: e.target.value }))}
        />
        <select className="sel" style={{ height: 34, fontSize: 12.5, width: 140 }}
          value={supFilter.risk}
          onChange={e => setSupFilter((f: any) => ({ ...f, risk: e.target.value }))}>
          <option value="">{L==="de" ? "Alle Risiken" : "All risks"}</option>
          <option value="high">{L==="de" ? "Hochrisiko" : "High risk"}</option>
          <option value="medium">{L==="de" ? "Mittelrisiko" : "Medium"}</option>
          <option value="low">{L==="de" ? "Niedrig" : "Low"}</option>
        </select>
        <select className="sel" style={{ height: 34, fontSize: 12.5, width: 140 }}
          value={supFilter.country}
          onChange={e => setSupFilter((f: any) => ({ ...f, country: e.target.value }))}>
          <option value="">{L==="de" ? "Alle Länder" : "All countries"}</option>
          {[...new Set((suppliers as any[]).map((s:any) => s.country))].filter(Boolean).sort().map((co: any) =>
            <option key={co} value={co}>{co}</option>
          )}
        </select>
        <div style={{ flex: 1 }} />
        <button className="btn btn-g btn-sm" onClick={() => exportCSV("/suppliers/export/csv", "lieferanten.csv")}>↓ CSV</button>
        <button className="btn btn-g btn-sm" onClick={recalc} disabled={loading || !writable}>
          {loading ? <span className="spin-d" /> : "↺"} {L==="de" ? "Berechnen" : "Recalculate"}
        </button>
        <button className="btn btn-p btn-sm" onClick={openAddSupModal} disabled={!writable}>
          + {L==="de" ? "Lieferant" : "Supplier"}
        </button>
      </div>

      {/* ── TABLE ─────────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {kpis.total > 0 ? (
          <div className="tbl-wrap" style={{ borderRadius: "var(--r-xl)" }}>
            <table>
              <thead>
                <tr>
                  <th>{L==="de" ? "Lieferant" : "Supplier"}</th>
                  <th>{L==="de" ? "Land" : "Country"}</th>
                  <th>{L==="de" ? "Branche" : "Industry"}</th>
                  <th>{L==="de" ? "Risiko" : "Risk"}</th>
                  <th>Score</th>
                  <th>{L==="de" ? "Dokumente" : "Docs"}</th>
                  <th style={{ width: 100 }}></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((s: any) => {
                  const isExp = expanded === s.id;
                  const rColor = RL_COLORS[s.risk_level] || "var(--t3)";
                  return (
                    <React.Fragment key={s.id}>
                      <tr className="clickable" onClick={() => setExpanded(isExp ? null : s.id)}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--t1)" }}>{s.name}</div>
                          {s.notes && <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>{s.notes.substring(0, 48)}{s.notes.length > 48 ? "…" : ""}</div>}
                        </td>
                        <td><span className="mono" style={{ color: "var(--t2)" }}>{s.country || "—"}</span></td>
                        <td style={{ color: "var(--t2)", fontSize: 12 }}>{s.industry || "—"}</td>
                        <td>
                          <span className={chipRL(s.risk_level)} style={{ fontSize: 10.5 }}>
                            {s.risk_level === "high" ? (L==="de" ? "Hoch" : "High")
                              : s.risk_level === "medium" ? (L==="de" ? "Mittel" : "Medium")
                              : s.risk_level === "low" ? (L==="de" ? "Niedrig" : "Low")
                              : (L==="de" ? "Unbekannt" : "Unknown")}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 48, height: 3, borderRadius: 2, background: "var(--bg-4)", overflow: "hidden" }}>
                              <div style={{ width: `${s.risk_score}%`, height: "100%", background: rColor }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: rColor, fontVariantNumeric: "tabular-nums" }}>{s.risk_score}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 4 }}>
                            {s.has_audit && <span className="chip cl" style={{ fontSize: 10 }}>Audit</span>}
                            {s.has_code_of_conduct && <span className="chip cb" style={{ fontSize: 10 }}>CoC</span>}
                            {!s.has_audit && !s.has_code_of_conduct && <span style={{ color: "var(--t4)", fontSize: 12 }}>—</span>}
                          </div>
                        </td>
                        <td>
                          <div className="brow" style={{ gap: 5 }}>
                            <button className="btn btn-g btn-xs" onClick={e => { e.stopPropagation(); if (!writable) return; openEditSupModal(s); }} disabled={!writable}>
                              {L==="de" ? "Edit" : "Edit"}
                            </button>
                            <button className="btn btn-r btn-xs" onClick={e => { e.stopPropagation(); if (!writable) return; delSupplier(s.id, s.name); }} disabled={!writable}>✕</button>
                          </div>
                        </td>
                      </tr>
                      {isExp && (
                        <tr key={s.id + "_exp"}>
                          <td colSpan={7} className="row-exp">
                            <div style={{ padding: "16px 18px" }}>
                              <div className="g2">
                                <div>
                                  {/* Risk level advice */}
                                  <div className={"al " + (s.risk_level === "high" ? "al-err" : s.risk_level === "medium" ? "al-warn" : s.risk_level === "low" ? "al-ok" : "al-info")} style={{ marginBottom: 12 }}>
                                    <span className="al-icon">{s.risk_level === "high" ? "⚠" : "ℹ"}</span>
                                    <div style={{ fontSize: 12.5 }}>
                                      <strong>§{s.risk_level === "high" ? "6" : s.risk_level === "medium" ? "4" : "8"} LkSG: </strong>
                                      {s.risk_level === "high" ? (L==="de" ? "Sofortiger CAP + Audit erforderlich." : "Immediate CAP + Audit required.")
                                        : s.risk_level === "medium" ? (L==="de" ? "Präventionsmaßnahmen einleiten." : "Implement preventive measures.")
                                        : s.risk_level === "low" ? (L==="de" ? "Periodisches Monitoring ausreichend." : "Periodic monitoring sufficient.")
                                        : (L==="de" ? "Risikoanalyse erforderlich." : "Risk analysis required.")}
                                    </div>
                                  </div>
                                  {/* Stats pills */}
                                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                                    {s.workers && <span className="stat-pill">👥 {s.workers.toLocaleString()}</span>}
                                    {s.annual_spend_eur && <span className="stat-pill">€ {(s.annual_spend_eur/1000).toFixed(0)}k</span>}
                                    {s.certification_count ? <span className="stat-pill">✓ {s.certification_count} Certs</span> : null}
                                    {s.sub_supplier_count ? <span className="stat-pill">▷ {s.sub_supplier_count} Sub</span> : null}
                                  </div>
                                  {/* Actions */}
                                  <div className="brow">
                                    <button className="btn btn-ai btn-xs" onClick={() => writable && getSupAI(s)} disabled={supLd[s.id] || !writable}>
                                      {supLd[s.id] ? <span className="spin" /> : "✦"} {L==="de" ? "KI-Analyse" : "AI Analysis"}
                                    </button>
                                    {s.risk_level === "high" && (
                                      <button className="btn btn-ai btn-xs" onClick={() => writable && getSupCAP(s)} disabled={supLd[s.id+"_c"] || !writable}>
                                        {supLd[s.id+"_c"] ? <span className="spin" /> : "⚡"} {L==="de" ? "KI-CAP" : "AI CAP"}
                                      </button>
                                    )}
                                    <button className="btn btn-p btn-xs" onClick={() => { if (!writable) return; setCapPara(s.risk_level === "high" ? "6" : "4"); setShowCapModal(true); }} disabled={!writable}>
                                      + CAP
                                    </button>
                                  </div>
                                  {supAI[s.id] && (
                                    <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: 14, marginTop: 10, fontSize: 12.5, lineHeight: 1.7, whiteSpace: "pre-wrap", color: "var(--t2)" }}>
                                      {supAI[s.id]}
                                    </div>
                                  )}
                                  {supCAP[s.id] && (
                                    <div style={{ background: "var(--amber-bg)", border: "1px solid var(--amber-border)", borderRadius: "var(--r-md)", padding: 14, marginTop: 8, fontSize: 12.5, lineHeight: 1.7, whiteSpace: "pre-wrap", color: "var(--amber)" }}>
                                      <strong>KI-CAP (§6 LkSG):{"\n"}</strong>{supCAP[s.id]}
                                    </div>
                                  )}
                                </div>
                                <div><RiskBreakdown sup={s} /></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <div className="empty-ic">◎</div>
            <div className="empty-t">{L==="de" ? "Keine Lieferanten" : "No suppliers"}</div>
            <div className="empty-c">{L==="de" ? "CSV importieren oder ersten Lieferanten manuell anlegen." : "Import a CSV or add the first supplier manually."}</div>
            <div className="brow" style={{ justifyContent: "center", marginTop: 16 }}>
              <button className="btn btn-p btn-sm" onClick={openAddSupModal} disabled={!writable}>+ {L==="de" ? "Anlegen" : "Add supplier"}</button>
              <button className="btn btn-g btn-sm" onClick={() => (fileRef as any)?.current?.click()}>↑ CSV</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
