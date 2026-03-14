import React from "react";
import type { WorkspaceTabProps } from "@/lib/workspace-types";

export default function AiTab(props: WorkspaceTabProps) {
  const { L, aiMsgs, aiInput, setAiInput, aiLd, sendAi, kpis, score } = props;

  const quickPrompts =
    L === "de"
      ? [
          "Portfolio-Risiko zusammenfassen",
          "BAFA-Bericht §10 erstellen",
          "CAPs priorisieren",
          "Was verlangt §5 LkSG?",
          "Score verbessern - Empfehlungen",
          "§8 Beschwerdeverfahren erklaeren",
        ]
      : [
          "Summarise portfolio risk",
          "Draft §10 BAFA report",
          "Prioritise CAPs",
          "What does §5 LkSG require?",
          "Improve score - recommendations",
          "Explain §8 complaints procedure",
        ];

  return (
    <>
      <div className="ai-hd">
        <div className="ai-av">&#129302;</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15.5, fontWeight: 900, letterSpacing: "-.3px" }}>
            {L === "de" ? "LkSG KI-Assistent" : "LkSG AI Assistant"}
          </div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>
            Claude &middot; {L === "de" ? "LkSG-Compliance-Experte" : "LkSG compliance expert"} &middot;{" "}
            {kpis.total} {L === "de" ? "Lieferanten" : "suppliers"} &middot; Score {score.score}/100
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <span className={kpis.total > 0 ? "chip cl" : "chip cm"} style={{ fontSize: 10 }}>
            {kpis.total > 0 ? (L === "de" ? "Daten geladen" : "Data loaded") : (L === "de" ? "Keine Daten" : "No data")}
          </span>
        </div>
      </div>

      {!process.env.NEXT_PUBLIC_AI_ENABLED && (
        <div className="al al-warn" style={{ margin: "12px 16px 0", borderRadius: 10 }}>
          <span className="al-icon">!</span>
          <div style={{ fontSize: 12.5 }}>
            <strong>{L === "de" ? "KI benoetigt ANTHROPIC_API_KEY" : "AI requires ANTHROPIC_API_KEY"}</strong>
            {L === "de"
              ? " -- Bitte in Railway unter Variables eintragen: ANTHROPIC_API_KEY=sk-ant-..."
              : " -- Please add in Railway under Variables: ANTHROPIC_API_KEY=sk-ant-..."}
          </div>
        </div>
      )}

      <div className="ai-msgs">
        {aiMsgs.length === 0 && (
          <div className="empty" style={{ padding: "40px 0" }}>
            <div className="ai-av" style={{ margin: "0 auto 16px", width: 48, height: 48, fontSize: 22 }}>
              &#129302;
            </div>
            <div className="empty-t">{L === "de" ? "LkSG-Experte bereit" : "LkSG Expert Ready"}</div>
            <div style={{ fontSize: 12.5, color: "#9CA3AF", maxWidth: 420, margin: "0 auto" }}>
              {L === "de"
                ? "Fragen zu Risikobewertung, §5-§10 LkSG, BAFA-Berichten, CAPs und Massnahmen beantworten. Endlich spricht hier etwas in ganzen Saetzen."
                : "Ask about risk scoring, §5-§10 LkSG, BAFA reporting, CAPs and remediation. At least something here speaks in complete sentences."}
            </div>
          </div>
        )}

        {aiMsgs.map((m, i) => (
          <div key={i} className={"ai-msg" + (m.role === "user" ? " u" : "")}>
            <div className="ai-ico">{m.role === "user" ? "U" : "AI"}</div>
            <div className={"ai-bub" + (m.role === "user" ? " u" : " a")}>{m.content}</div>
          </div>
        ))}

        {aiLd && (
          <div className="ai-msg">
            <div className="ai-ico">AI</div>
            <div className="ai-bub a" style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span className="spin spin-d" />
              <span style={{ color: "#9CA3AF", fontSize: 12 }}>{L === "de" ? "Analysiere..." : "Analysing..."}</span>
            </div>
          </div>
        )}
      </div>

      <div className="ai-qs">
        {quickPrompts.map((q) => (
          <button key={q} className="ai-q" onClick={() => setAiInput(q)}>
            {q}
          </button>
        ))}
      </div>

      <div className="ai-dis">
        {L === "de"
          ? "KI-Antworten koennen Fehler enthalten. Fuer rechtsverbindliche Entscheidungen bitte Fachanwalt oder internes Compliance-Team einbeziehen."
          : "AI responses may contain errors. For legally binding decisions, involve counsel or your internal compliance team."}
      </div>

      <div className="ai-ir">
        <textarea
          className="ai-ta"
          rows={2}
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
          placeholder={
            L === "de"
              ? "z.B. Welche Massnahmen brauche ich fuer Hochrisiko-Lieferanten in Bangladesch?"
              : "e.g. What measures do I need for high-risk suppliers in Bangladesh?"
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendAi();
            }
          }}
        />
        <button className="btn btn-p" style={{ alignSelf: "flex-end", height: 44 }} onClick={() => sendAi()} disabled={aiLd || !aiInput.trim()}>
          {aiLd ? <span className="spin" /> : "▶"}
        </button>
      </div>
    </>
  );
}
