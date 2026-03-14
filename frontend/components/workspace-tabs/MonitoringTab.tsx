import React from "react";
import WorkspaceDataState from "../workspace/WorkspaceDataState";
import WorkspaceSectionMeta from "../workspace/WorkspaceSectionMeta";
import WorkspaceActionPrompt from "../workspace/WorkspaceActionPrompt";
import WorkspaceEmptyState from "../workspace/WorkspaceEmptyState";
import WorkspaceModuleGuide from "../workspace/WorkspaceModuleGuide";
import type { WorkspaceTabProps } from "@/lib/workspace-types";

export default function MonitoringTab(props: WorkspaceTabProps) {
  const { L, requestState, reloads, events, screenings, sendAi } = props;

  return (
    <>
      <WorkspaceDataState L={L} requestState={requestState} domains={[
        { key: "insights", label: L === "de" ? "Monitoring" : "Monitoring", onRetry: reloads.reloadInsights },
      ]} />
      <WorkspaceSectionMeta
        L={L}
        title={L === "de" ? "Monitoring-Domain" : "Monitoring domain"}
        requestState={requestState}
        domains={["insights"]}
        onRefresh={reloads.reloadInsights}
      />
      <WorkspaceModuleGuide
        L={L}
        storageKey="lksg-guide-monitoring"
        title={L === "de" ? "Modul-Guide: Monitoring" : "Module guide: monitoring"}
        subtitle={L === "de" ? "Monitoring soll Sie nerven, bevor BAFA oder die Presse es tun." : "Monitoring should annoy you before BAFA or the press gets the chance."}
        steps={[
          { id: "insights", label: L === "de" ? "Insights laden" : "Load insights", done: events.length > 0 || screenings.length > 0, copy: L === "de" ? "Sonst bleibt das Modul nur ein sehr höflicher Platzhalter." : "Otherwise the module stays a very polite placeholder.", actionLabel: L === "de" ? "Neu laden" : "Reload", onAction: reloads.reloadInsights },
          { id: "flags", label: L === "de" ? "Treffer prüfen" : "Review flagged items", done: screenings.some((s: any) => s.status === "clear") || events.length > 0, copy: L === "de" ? "Mindestens ein Durchlauf sollte dokumentiert geprüft worden sein." : "At least one pass should be visibly reviewed." },
          { id: "followup", label: L === "de" ? "Folgeaktion anstoßen" : "Trigger follow-up action", done: props.actions.length > 0 || props.complaints.length > 0, copy: L === "de" ? "Erkenntnisse ohne Folgeaktion sind nur dekorative Erkenntnisse." : "Insights without follow-up are just decorative insights." },
        ]}
      />
      {!events.length && !screenings.length && (
        <WorkspaceActionPrompt
          tone="amber"
          title={L === "de" ? "Noch kein laufendes Monitoring sichtbar" : "No visible monitoring activity yet"}
          copy={L === "de" ? "Starten Sie einen Monitoring-Lauf oder laden Sie die Insights neu. Sonst bleibt das hier nur eine hübsche Compliance-Vitrine." : "Run monitoring or reload insights. Otherwise this remains a decorative compliance cabinet."}
          actionLabel={L === "de" ? "Insights aktualisieren" : "Refresh insights"}
          onAction={reloads.reloadInsights}
        />
      )}

      <div className="sec-hd" style={{ marginBottom: 16 }}>
        <div>
          <div className="sec-title">{L === "de" ? "Lieferanten-Monitoring" : "Supplier Monitoring"}<span className="ltag">§6 Abs. 5 LkSG</span></div>
          <div className="sec-sub">{L === "de" ? "Anlassbezogene Risikouberwachung. Sanktionspruefung und ESG-Signale. Quartalsweise empfohlen." : "Event-based risk monitoring. Sanctions screening and ESG signals. Recommended quarterly."}</div>
        </div>
        <div className="brow">
          <button className="btn btn-ai btn-sm" onClick={() => sendAi(L === "de" ? "Erklaere mir die §6 Abs. 5 LkSG anlassbezogene Risikoanalyse. Wann muss ich handeln?" : "Explain §6 para. 5 LkSG event-based risk analysis. When must I act?")}>✎ {L === "de" ? "§6 Erklaerung" : "§6 explanation"}</button>
          <button className="btn btn-p btn-sm" onClick={reloads.reloadInsights}>↻ {L === "de" ? "Monitoring prüfen" : "Check monitoring"}</button>
        </div>
      </div>

      <div className="g2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-.2px", marginBottom: 14 }}>Sanctions & Screenings <span className="ltag">§2 Abs. 2 LkSG</span></div>
          {screenings.length ? (
            <div className="tbl-wrap">
              <table>
                <thead><tr><th>{L === "de" ? "Typ" : "Type"}</th><th>Status</th><th>Score</th><th>{L === "de" ? "Datum" : "Date"}</th></tr></thead>
                <tbody>
                  {screenings.map((s: any) => (
                    <tr key={s.id}>
                      <td className="mono">{s.screening_type}</td>
                      <td><span className={s.status === "clear" ? "chip cl" : s.status === "flagged" ? "chip ch" : "chip cm"}>{s.status}</span></td>
                      <td><strong style={{ color: s.score > 50 ? "#DC2626" : "#16A34A" }}>{s.score}</strong></td>
                      <td style={{ color: "#9CA3AF", fontSize: 11.5 }}>{new Date(s.created_at).toLocaleDateString(L === "de" ? "de-DE" : "en-GB")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <WorkspaceEmptyState
              L={L}
              compact
              icon="🛡️"
              title={L === "de" ? "Noch keine Screenings" : "No screenings yet"}
              copy={L === "de" ? "Sobald Insights geladen sind, erscheinen hier Treffer und Entwarnungen. Im Idealfall mehr Entwarnungen als Treffer." : "Once insights are loaded, hits and clearances appear here. Ideally more clearances than hits."}
              secondary={{ label: L === "de" ? "Neu laden" : "Reload", onClick: reloads.reloadInsights, tone: "secondary" }}
            />
          )}
        </div>

        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-.2px", marginBottom: 14 }}>{L === "de" ? "ESG-Ereignisse" : "ESG events"} <span className="ltag">§6 LkSG</span></div>
          {events.length ? (
            <div className="tbl-wrap">
              <table>
                <thead><tr><th>{L === "de" ? "Schwere" : "Severity"}</th><th>Titel</th><th>{L === "de" ? "Datum" : "Date"}</th></tr></thead>
                <tbody>
                  {events.slice(0, 8).map((e: any) => (
                    <tr key={e.id}>
                      <td><span className={e.severity === "high" || e.severity === "critical" ? "chip ch" : e.severity === "medium" ? "chip cm" : "chip cl"}>{e.severity}</span></td>
                      <td style={{ fontSize: 12.5 }}>
                        {e.url ? <a href={e.url} target="_blank" rel="noreferrer" style={{ color: "#1B3D2B", fontWeight: 600 }}>{e.title || e.event_type} ↗</a> : (e.title || e.event_type)}
                      </td>
                      <td style={{ color: "#9CA3AF", fontSize: 11 }}>{new Date(e.created_at).toLocaleDateString(L === "de" ? "de-DE" : "en-GB")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <WorkspaceEmptyState
              L={L}
              compact
              icon="🌍"
              title={L === "de" ? "Keine ESG-Ereignisse" : "No ESG events"}
              copy={L === "de" ? "Aktuell liegen keine Ereignisse vor. Das ist angenehm, aber trotzdem kein Grund für Selbstzufriedenheit." : "There are no ESG events right now. Nice, but still not a reason for self-congratulation."}
              secondary={{ label: L === "de" ? "Monitoring prüfen" : "Review monitoring", onClick: reloads.reloadInsights, tone: "secondary" }}
            />
          )}
        </div>
      </div>

      <div className="al al-info">
        <span className="al-icon">i</span>
        <div style={{ fontSize: 12.5 }}>
          <strong>§6 Abs. 5 LkSG:</strong> {L === "de" ? "Anlassbezogene Risikoanalyse bei Verschlechterung der Menschenrechtslage im Lieferland, neuen NGO- oder Medienhinweisen, wesentlichen Anderungen bei Lieferanten oder Beschwerden. Empfehlung: quartalsweises Monitoring." : "Event-based risk analysis is required when the human-rights situation in a supplier country deteriorates, when NGOs or media reveal new concerns, when suppliers change materially, or when complaints are received. Recommendation: quarterly monitoring."}
        </div>
      </div>
    </>
  );
}
