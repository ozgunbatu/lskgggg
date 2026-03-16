import { useMemo } from "react";
import { buildActionStats, buildPortfolioKpis } from "@/lib/workspace-metrics";
import { calcPortfolioScore } from "@/lib/workspace-constants";
import type { Action, Company, Complaint, Evidence, KPILive, Lang, SAQ, Supplier, TabId, WorkspaceCard } from "@/lib/workspace-types";

type Args = {
  L: Lang;
  tab: TabId;
  company: Company | null;
  suppliers: Supplier[];
  complaints: Complaint[];
  actions: Action[];
  saqs: SAQ[];
  evidences: Evidence[];
  events: any[];
  screenings: any[];
  auditLog: any[];
  draft: Record<string, string> | null;
  draftTs: string;
  kpiLive: KPILive | null;
  setTab: (tab: TabId) => void;
  recalc: () => void | Promise<void>;
  openAddSupModal: () => void;
  setShowCapModal: (open: boolean) => void;
  loadKpi: () => void | Promise<void>;
  loadAuditLog: () => void | Promise<void>;
};

export default function useWorkspaceDerived(args: Args) {
  const {
    L, tab, company, suppliers, complaints, actions, saqs, evidences, events, screenings, auditLog,
    draft, draftTs, kpiLive, setTab, recalc, openAddSupModal, setShowCapModal, loadKpi, loadAuditLog,
  } = args;

  const score = useMemo(() => calcPortfolioScore(suppliers, actions, complaints, saqs), [suppliers, actions, complaints, saqs]);
  const kpis = useMemo(() => buildPortfolioKpis(suppliers), [suppliers]);
  const actionStats = useMemo(() => buildActionStats(actions), [actions]);

  const quickstartSteps = useMemo(() => {
    const hasCompany = !!company?.name;
    const hasSuppliers = suppliers.length > 0;
    const hasScored = suppliers.some(s => (s.risk_score || 0) > 0 && s.risk_level !== "unknown");
    const complaintsActive = !!company?.slug;
    const hasReport = !!draftTs || !!draft;
    return [
      { id: "company", tab: "settings" as TabId, done: hasCompany, title: L === "de" ? "Unternehmensprofil vervollständigen" : "Complete company profile", copy: L === "de" ? "Pflichtfelder für BAFA und Beschwerdeverfahren pflegen." : "Fill the required BAFA and complaints procedure fields." },
      { id: "suppliers", tab: "suppliers" as TabId, done: hasSuppliers, title: L === "de" ? "Lieferanten importieren" : "Import suppliers", copy: L === "de" ? "CSV hochladen oder erste Lieferanten manuell anlegen." : "Upload a CSV or create your first suppliers manually." },
      { id: "risk", tab: "suppliers" as TabId, done: hasScored, title: L === "de" ? "Risikoanalyse starten" : "Run risk analysis", copy: L === "de" ? "Prüfen, ob Land, Branche und Score für das Portfolio vorliegen." : "Confirm country, industry, and score are available across the portfolio." },
      { id: "complaints", tab: "complaints" as TabId, done: complaintsActive, title: L === "de" ? "Beschwerdekanal aktivieren" : "Activate complaint channel", copy: L === "de" ? "Externen Link teilen und die zuständige Stelle prüfen." : "Share the external link and confirm the responsible contact." },
      { id: "report", tab: "reports" as TabId, done: hasReport, title: L === "de" ? "Ersten Bericht erzeugen" : "Generate first report", copy: L === "de" ? "Automatischen Entwurf laden und für BAFA finalisieren." : "Load the automated draft and prepare it for BAFA." },
    ];
  }, [company, suppliers, draftTs, draft, L]);
  const quickstartDone = quickstartSteps.filter(x => x.done).length;

  const workspaceMeta = useMemo(() => ({
    dashboard: { title: L === "de" ? "Steuerzentrale" : "Control center", sub: L === "de" ? "Prioritäten, Portfolio-Risiko und BAFA-Bereitschaft auf einen Blick." : "Priorities, portfolio risk, and BAFA readiness in one place." },
    suppliers: { title: L === "de" ? "Lieferanten & Risiko" : "Suppliers & risk", sub: L === "de" ? "Register, Re-Scoring und Detailanalyse ohne unnötiges Chaos." : "Register, re-scoring, and drill-down analysis without unnecessary clutter." },
    actions: { title: L === "de" ? "Aktionspläne" : "Action plans", sub: L === "de" ? "Offene Maßnahmen, Fälligkeiten und Wirksamkeitsnotizen." : "Open measures, due dates, and effectiveness notes." },
    complaints: { title: L === "de" ? "Beschwerdeverfahren" : "Complaints procedure", sub: L === "de" ? "Interne Fälle und externer Meldekanal mit sauberem Zugriff." : "Internal cases and the external reporting channel with clean access." },
    saq: { title: "SAQ", sub: L === "de" ? "Fragebögen versenden, Rückläufe verfolgen, Nachweise sammeln." : "Send questionnaires, track responses, collect evidence." },
    kpi: { title: L === "de" ? "Wirksamkeit" : "Effectiveness", sub: L === "de" ? "Live-KPIs für Reifegrad, Abdeckung und Bearbeitungsqualität." : "Live KPIs for maturity, coverage, and handling quality." },
    reports: { title: L === "de" ? "Berichtswesen" : "Reporting", sub: L === "de" ? "BAFA-Entwurf, Export und Einreichungslogik." : "BAFA draft, export, and submission logic." },
    evidence: { title: L === "de" ? "Nachweise" : "Evidence", sub: L === "de" ? "Dokumente, Referenzen und belastbare Dokumentation." : "Documents, references, and defensible documentation." },
    monitoring: { title: L === "de" ? "Monitoring" : "Monitoring", sub: L === "de" ? "Events, Screening und externe Risikosignale." : "Events, screening, and external risk signals." },
    ai: { title: L === "de" ? "KI-Arbeitsplatz" : "AI workspace", sub: L === "de" ? "Zusammenfassungen und Formulierungshilfe für echte Arbeit statt Show." : "Summaries and drafting help for actual work instead of theater." },
    audit: { title: L === "de" ? "Audit Trail" : "Audit trail", sub: L === "de" ? "Unveränderliche Historie für Nachvollziehbarkeit und Prüfung." : "Immutable history for traceability and audits." },
    settings: { title: L === "de" ? "Pflichtfelder & Governance" : "Required fields & governance", sub: L === "de" ? "Verantwortlichkeiten, BAFA-Fristen und Datenschutz an einem Ort." : "Responsibilities, BAFA deadlines, and privacy in one place." },
  }[tab]), [tab, L]);

  const workspaceAssist = useMemo(() => {
    const openComplaints = complaints.filter(c => c.status === "open").length;
    const completedActions = actions.filter(a => a.status === "completed" || a.status === "closed").length;
    const reportReady = draft ? Object.values(draft).filter(Boolean).length : 0;
    const highRiskCount = suppliers.filter(s => s.risk_level === "high").length;
    const monitoringHits = events.length + screenings.length;
    const evidenceCoverage = evidences.length;

    const map: Record<TabId, { cards: WorkspaceCard[] }> = {
      dashboard: {
        cards: [
          { kicker: L === "de" ? "Portfolio" : "Portfolio", value: `${suppliers.length}`, copy: L === "de" ? "Erfasste Lieferanten im aktiven Scope." : "Suppliers currently in scope.", cta: L === "de" ? "Lieferanten prüfen" : "Review suppliers", action: () => setTab("suppliers"), chip: highRiskCount > 0 ? `${highRiskCount} ${L === "de" ? "kritisch" : "high risk"}` : (L === "de" ? "Stabil" : "Stable") },
          { kicker: L === "de" ? "CAP Status" : "CAP status", value: `${actionStats.open}`, copy: L === "de" ? "Offene Maßnahmen inklusive Fälligkeiten." : "Open actions including due dates.", cta: L === "de" ? "Maßnahmen öffnen" : "Open actions", action: () => setTab("actions"), chip: actionStats.overdue > 0 ? `${actionStats.overdue} ${L === "de" ? "überfällig" : "overdue"}` : `${completedActions} ${L === "de" ? "abgeschlossen" : "completed"}` },
          { kicker: L === "de" ? "Beschwerden" : "Complaints", value: `${openComplaints}`, copy: L === "de" ? "Offene Fälle mit Bearbeitungsbedarf." : "Open cases requiring handling.", cta: L === "de" ? "Beschwerden prüfen" : "Review complaints", action: () => setTab("complaints"), chip: company?.slug ? (L === "de" ? "Kanal aktiv" : "Channel live") : (L === "de" ? "Kanal fehlt" : "Channel missing") },
          { kicker: L === "de" ? "BAFA" : "BAFA", value: `${reportReady}`, copy: L === "de" ? "Gefüllte Berichtsfelder im aktuellen Entwurf." : "Completed report fields in the current draft.", cta: L === "de" ? "Bericht öffnen" : "Open report", action: () => setTab("reports"), chip: reportReady > 0 ? (L === "de" ? "Entwurf aktiv" : "Draft active") : (L === "de" ? "Startklar" : "Ready") },
        ]
      },
      suppliers: {
        cards: [
          { kicker: L === "de" ? "High Risk" : "High risk", value: `${highRiskCount}`, copy: L === "de" ? "Lieferanten mit sofortigem Prüfbedarf." : "Suppliers needing immediate attention.", cta: L === "de" ? "Neu bewerten" : "Re-score now", action: recalc },
          { kicker: L === "de" ? "Abdeckung" : "Coverage", value: `${new Set(suppliers.map(s => s.country)).size}`, copy: L === "de" ? "Länder im aktiven Lieferantenportfolio." : "Countries represented in your portfolio.", cta: L === "de" ? "Lieferant anlegen" : "Add supplier", action: openAddSupModal },
          { kicker: L === "de" ? "SAQ Bezug" : "SAQ linkage", value: `${saqs.length}`, copy: L === "de" ? "Versendete SAQs für aktuelle Lieferanten." : "SAQs sent to current suppliers.", cta: L === "de" ? "SAQ öffnen" : "Open SAQ", action: () => setTab("saq") },
          { kicker: L === "de" ? "Nächster Schritt" : "Next step", value: highRiskCount > 0 ? (L === "de" ? "CAP" : "CAP") : (L === "de" ? "Import" : "Import"), copy: highRiskCount > 0 ? (L === "de" ? "Für High-Risk-Lieferanten direkt Maßnahmen anlegen." : "Create actions immediately for high-risk suppliers.") : (L === "de" ? "Mehr Lieferanten importieren, um das Portfolio zu vervollständigen." : "Import more suppliers to complete the portfolio."), cta: highRiskCount > 0 ? (L === "de" ? "Zu Maßnahmen" : "Go to actions") : (L === "de" ? "CSV importieren" : "Import CSV"), action: () => highRiskCount > 0 ? setTab("actions") : setTab("suppliers") },
        ]
      },
      actions: {
        cards: [
          { kicker: L === "de" ? "Offen" : "Open", value: `${actionStats.open}`, copy: L === "de" ? "Maßnahmen in Bearbeitung." : "Actions currently in progress.", cta: L === "de" ? "Neue Maßnahme" : "New action", action: () => setShowCapModal(true) },
          { kicker: L === "de" ? "Überfällig" : "Overdue", value: `${actionStats.overdue}`, copy: L === "de" ? "Überfällige Maßnahmen mit Eskalationsbedarf." : "Overdue actions requiring escalation.", cta: L === "de" ? "High Risk prüfen" : "Check high risk", action: () => setTab("suppliers") },
          { kicker: L === "de" ? "Erledigt" : "Completed", value: `${completedActions}`, copy: L === "de" ? "Dokumentierte und abgeschlossene Maßnahmen." : "Documented and completed actions.", cta: L === "de" ? "Nachweise öffnen" : "Open evidence", action: () => setTab("evidence") },
          { kicker: L === "de" ? "Nächster Schritt" : "Next step", value: actionStats.overdue > 0 ? (L === "de" ? "Sofort" : "Now") : (L === "de" ? "Planen" : "Plan"), copy: actionStats.overdue > 0 ? (L === "de" ? "Zuerst überfällige CAPs schließen oder neu terminieren." : "Close or reschedule overdue CAPs first.") : (L === "de" ? "Neue Maßnahmen aus Risikoanalyse oder Beschwerden ableiten." : "Create new actions from risk findings or complaints."), cta: L === "de" ? "Dashboard öffnen" : "Open dashboard", action: () => setTab("dashboard") },
        ]
      },
      complaints: {
        cards: [
          { kicker: L === "de" ? "Offen" : "Open", value: `${openComplaints}`, copy: L === "de" ? "Fälle mit unmittelbarem Bearbeitungsbedarf." : "Cases requiring immediate handling.", cta: L === "de" ? "Kanal teilen" : "Share channel", action: () => setTab("settings") },
          { kicker: L === "de" ? "Gesamt" : "Total", value: `${complaints.length}`, copy: L === "de" ? "Eingegangene Fälle im System." : "Cases received in the system.", cta: L === "de" ? "Audit öffnen" : "Open audit", action: () => setTab("audit") },
          { kicker: L === "de" ? "Verknüpfte Maßnahmen" : "Linked actions", value: `${actions.filter(a => a.supplier_id && complaints.some(c => c.supplier_id === a.supplier_id)).length}`, copy: L === "de" ? "CAPs mit Beschwerdebezug." : "Actions tied to complaint-related suppliers.", cta: L === "de" ? "Maßnahmen öffnen" : "Open actions", action: () => setTab("actions") },
          { kicker: L === "de" ? "Nächster Schritt" : "Next step", value: openComplaints > 0 ? (L === "de" ? "Prüfen" : "Review") : (L === "de" ? "Bereit" : "Ready"), copy: openComplaints > 0 ? (L === "de" ? "Status, Triage und interne Notizen konsequent pflegen." : "Keep status, triage, and internal notes up to date.") : (L === "de" ? "Meldekanal testen und Verantwortliche informieren." : "Test the reporting channel and inform responsible owners."), cta: L === "de" ? "Settings öffnen" : "Open settings", action: () => setTab("settings") },
        ]
      },
      saq: {
        cards: [
          { kicker: "SAQ", value: `${saqs.length}`, copy: L === "de" ? "Versendete oder laufende Fragebögen." : "Questionnaires sent or in progress.", cta: L === "de" ? "Lieferanten öffnen" : "Open suppliers", action: () => setTab("suppliers") },
          { kicker: L === "de" ? "Rücklauf" : "Responses", value: `${saqs.filter(q => q.status === "completed").length}`, copy: L === "de" ? "Abgeschlossene Fragebögen mit Antworten." : "Completed questionnaires with responses.", cta: L === "de" ? "Nachweise öffnen" : "Open evidence", action: () => setTab("evidence") },
          { kicker: L === "de" ? "Auffällig" : "Attention", value: `${suppliers.filter(s => s.risk_level === "high").length}`, copy: L === "de" ? "High-Risk-Lieferanten sollten bevorzugt SAQs erhalten." : "High-risk suppliers should receive SAQs first.", cta: L === "de" ? "High Risk öffnen" : "Open high risk", action: () => setTab("suppliers") },
          { kicker: L === "de" ? "Nächster Schritt" : "Next step", value: L === "de" ? "Versenden" : "Send", copy: L === "de" ? "Offene High-Risk-Lieferanten priorisieren und SAQ-Frist setzen." : "Prioritise open high-risk suppliers and set a due date." , cta: L === "de" ? "Dashboard öffnen" : "Open dashboard", action: () => setTab("dashboard") },
        ]
      },
      kpi: {
        cards: [
          { kicker: L === "de" ? "Portfolio" : "Portfolio", value: `${score.score}`, copy: L === "de" ? "Aktueller Frontend-Score für Risiko und Prozesse." : "Current frontend score for risk and process maturity.", cta: L === "de" ? "KPI neu laden" : "Reload KPIs", action: loadKpi, chip: score.grade },
          { kicker: L === "de" ? "Audit" : "Audit", value: `${kpiLive?.auditCoverage ?? 0}%`, copy: L === "de" ? "Audit-Abdeckung über das aktive Portfolio." : "Audit coverage across the active portfolio.", cta: L === "de" ? "Lieferanten öffnen" : "Open suppliers", action: () => setTab("suppliers") },
          { kicker: "SAQ", value: `${kpiLive?.saqRate ?? 0}%`, copy: L === "de" ? "Antwortquote auf verschickte Fragebögen." : "Response rate of sent questionnaires.", cta: L === "de" ? "SAQ öffnen" : "Open SAQ", action: () => setTab("saq") },
          { kicker: L === "de" ? "Nächster Schritt" : "Next step", value: (kpiLive?.capOverdue || 0) > 0 ? (L === "de" ? "CAPs" : "CAPs") : (L === "de" ? "Review" : "Review"), copy: (kpiLive?.capOverdue || 0) > 0 ? (L === "de" ? "Überfällige Maßnahmen zuerst schließen, bevor weitere KPIs beschönigt werden." : "Close overdue actions before pretending the KPI story looks better.") : (L === "de" ? "Snapshot speichern und Trend historisieren." : "Save a snapshot and build trend history."), cta: L === "de" ? "Actions öffnen" : "Open actions", action: () => setTab("actions") },
        ]
      },
      reports: {
        cards: [
          { kicker: "BAFA", value: `${draft ? Object.values(draft).filter(Boolean).length : 0}`, copy: L === "de" ? "Gefüllte Felder im aktuellen Berichtsentwurf." : "Completed fields in the current report draft.", cta: L === "de" ? "Settings prüfen" : "Check settings", action: () => setTab("settings") },
          { kicker: L === "de" ? "Nachweise" : "Evidence", value: `${evidenceCoverage}`, copy: L === "de" ? "Dokumente und Referenzen, die Berichtsaussagen stützen." : "Documents and references supporting report statements.", cta: L === "de" ? "Nachweise öffnen" : "Open evidence", action: () => setTab("evidence") },
          { kicker: L === "de" ? "Beschwerden" : "Complaints", value: `${complaints.length}`, copy: L === "de" ? "Beschwerdedaten als Berichtseingang." : "Complaint data as reporting input.", cta: L === "de" ? "Beschwerden öffnen" : "Open complaints", action: () => setTab("complaints") },
          { kicker: L === "de" ? "Nächster Schritt" : "Next step", value: draftTs ? (L === "de" ? "Finalisieren" : "Finalize") : (L === "de" ? "Starten" : "Start"), copy: draftTs ? (L === "de" ? "Entwurf validieren, exportieren und Freigabe organisieren." : "Validate, export, and organise sign-off for the draft.") : (L === "de" ? "Entwurf laden und Pflichtkapitel zuerst vervollständigen." : "Load the draft and complete mandatory sections first."), cta: L === "de" ? "Dashboard öffnen" : "Open dashboard", action: () => setTab("dashboard") },
        ]
      },
      evidence: {
        cards: [
          { kicker: L === "de" ? "Dokumente" : "Documents", value: `${evidenceCoverage}`, copy: L === "de" ? "Hochgeladene Nachweise im System." : "Evidence records uploaded in the system.", cta: L === "de" ? "Bericht öffnen" : "Open report", action: () => setTab("reports") },
          { kicker: L === "de" ? "Lieferantenbezug" : "Supplier linkage", value: `${evidences.filter(e => e.supplier_name).length}`, copy: L === "de" ? "Nachweise mit Lieferantenbezug." : "Evidence linked to a supplier.", cta: L === "de" ? "Lieferanten öffnen" : "Open suppliers", action: () => setTab("suppliers") },
          { kicker: L === "de" ? "Audit-ready" : "Audit-ready", value: `${auditLog.length}`, copy: L === "de" ? "Historie und Nachweise greifen ineinander." : "History and evidence reinforce each other.", cta: L === "de" ? "Audit öffnen" : "Open audit", action: () => setTab("audit") },
          { kicker: L === "de" ? "Nächster Schritt" : "Next step", value: L === "de" ? "Ordnen" : "Organise", copy: L === "de" ? "Relevante Nachweise zu CAPs, Beschwerden und Berichtskapiteln zuordnen." : "Link relevant evidence to CAPs, complaints, and report sections." , cta: L === "de" ? "Actions öffnen" : "Open actions", action: () => setTab("actions") },
        ]
      },
      monitoring: {
        cards: [
          { kicker: L === "de" ? "Treffer" : "Hits", value: `${monitoringHits}`, copy: L === "de" ? "Events und Screening-Ergebnisse mit Prüfbedarf." : "Events and screening results requiring review.", cta: L === "de" ? "Lieferanten öffnen" : "Open suppliers", action: () => setTab("suppliers") },
          { kicker: L === "de" ? "High Risk" : "High risk", value: `${suppliers.filter(s => s.risk_level === "high").length}`, copy: L === "de" ? "Anzahl aktuell kritisch eingestufter Lieferanten." : "Suppliers currently classified as high risk.", cta: L === "de" ? "Risiko prüfen" : "Check risk", action: recalc },
          { kicker: L === "de" ? "Beschwerden" : "Complaints", value: `${openComplaints}`, copy: L === "de" ? "Monitoring und Beschwerdekanal zusammendenken." : "Treat monitoring and the complaint channel as one signal system.", cta: L === "de" ? "Beschwerden öffnen" : "Open complaints", action: () => setTab("complaints") },
          { kicker: L === "de" ? "Nächster Schritt" : "Next step", value: monitoringHits > 0 ? (L === "de" ? "Sichten" : "Review") : (L === "de" ? "Beobachten" : "Watch"), copy: monitoringHits > 0 ? (L === "de" ? "Treffer bewerten und betroffene Lieferanten neu priorisieren." : "Assess hits and reprioritise impacted suppliers.") : (L === "de" ? "Monitoring regelmäßig neu laden und Trigger dokumentieren." : "Refresh monitoring regularly and document triggers."), cta: L === "de" ? "Audit öffnen" : "Open audit", action: () => setTab("audit") },
        ]
      },
      ai: {
        cards: [
          { kicker: "AI", value: `${suppliers.length}`, copy: L === "de" ? "Lieferanten, Fälle und Berichtstexte mit KI-Hilfe aufbereiten." : "Use AI support for suppliers, complaints, and report text.", cta: L === "de" ? "Reports öffnen" : "Open reports", action: () => setTab("reports") },
          { kicker: L === "de" ? "High Risk" : "High risk", value: `${suppliers.filter(s => s.risk_level === "high").length}`, copy: L === "de" ? "KI-Hilfe zuerst für kritische Lieferanten nutzen." : "Use AI help on critical suppliers first.", cta: L === "de" ? "Lieferanten öffnen" : "Open suppliers", action: () => setTab("suppliers") },
          { kicker: L === "de" ? "Beschwerden" : "Complaints", value: `${openComplaints}`, copy: L === "de" ? "Triage und Zusammenfassung für offene Fälle." : "Triage and summary support for open cases.", cta: L === "de" ? "Beschwerden öffnen" : "Open complaints", action: () => setTab("complaints") },
          { kicker: L === "de" ? "Nächster Schritt" : "Next step", value: L === "de" ? "Fragen" : "Ask", copy: L === "de" ? "Mit einer konkreten Aufgabe starten statt mit allgemeinem Prompt-Nebel." : "Start with a concrete task instead of a vague prompt cloud.", cta: L === "de" ? "Dashboard" : "Dashboard", action: () => setTab("dashboard") },
        ]
      },
      audit: {
        cards: [
          { kicker: L === "de" ? "Einträge" : "Entries", value: `${auditLog.length}`, copy: L === "de" ? "Historie protokollierter Änderungen." : "History of logged changes.", cta: L === "de" ? "Neu laden" : "Reload", action: loadAuditLog },
          { kicker: L === "de" ? "Beschwerden" : "Complaints", value: `${complaints.length}`, copy: L === "de" ? "Fälle mit Prüfpfad und Statuswechseln." : "Cases with status changes and audit relevance.", cta: L === "de" ? "Beschwerden öffnen" : "Open complaints", action: () => setTab("complaints") },
          { kicker: L === "de" ? "CAPs" : "CAPs", value: `${actions.length}`, copy: L === "de" ? "Maßnahmen, deren Änderungen nachvollziehbar sein müssen." : "Actions whose changes must remain traceable.", cta: L === "de" ? "Maßnahmen öffnen" : "Open actions", action: () => setTab("actions") },
          { kicker: L === "de" ? "Nächster Schritt" : "Next step", value: L === "de" ? "Prüfen" : "Review", copy: L === "de" ? "Filter nutzen und auffällige Änderungen mit Nachweisen verbinden." : "Use filters and connect notable changes with evidence.", cta: L === "de" ? "Nachweise öffnen" : "Open evidence", action: () => setTab("evidence") },
        ]
      },
      settings: {
        cards: [
          { kicker: L === "de" ? "Firma" : "Company", value: company?.name || (L === "de" ? "Profil" : "Profile"), copy: L === "de" ? "Unternehmens- und Governance-Angaben für Go-live." : "Company and governance fields required for go-live.", cta: L === "de" ? "Bericht öffnen" : "Open report", action: () => setTab("reports") },
          { kicker: L === "de" ? "Beschwerdekanal" : "Complaint channel", value: company?.slug ? (L === "de" ? "Aktiv" : "Live") : (L === "de" ? "Fehlt" : "Missing"), copy: L === "de" ? "Öffentlicher Meldekanal und verantwortliche Stelle." : "Public reporting channel and responsible contact.", cta: L === "de" ? "Beschwerden öffnen" : "Open complaints", action: () => setTab("complaints") },
          { kicker: "BAFA", value: draftTs ? (L === "de" ? "Entwurf" : "Draft") : (L === "de" ? "Offen" : "Open"), copy: L === "de" ? "Berichtszustand und öffentliche URL sauber hinterlegen." : "Maintain report status and public URL cleanly.", cta: L === "de" ? "Bericht öffnen" : "Open report", action: () => setTab("reports") },
          { kicker: L === "de" ? "Nächster Schritt" : "Next step", value: L === "de" ? "Validieren" : "Validate", copy: L === "de" ? "Pflichtfelder vervollständigen und die BAFA-Bereitschaft final prüfen." : "Complete mandatory fields and verify BAFA readiness.", cta: L === "de" ? "Dashboard" : "Dashboard", action: () => setTab("dashboard") },
        ]
      },
    };
    return map[tab];
  }, [tab, L, suppliers, complaints, actions, saqs, evidences, company, draft, draftTs, events, screenings, auditLog, actionStats, score.score, kpiLive, loadKpi, loadAuditLog, recalc, openAddSupModal, setShowCapModal, setTab]);

  return { score, kpis, actionStats, quickstartSteps, quickstartDone, workspaceMeta, workspaceAssist };
}
