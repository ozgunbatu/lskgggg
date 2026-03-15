import React from "react";
import type { WorkspaceTabProps } from "@/lib/workspace-types";

const QUICK_DE = [
  { label: "Mein Portfolio-Risiko zusammenfassen", cat: "analysis" },
  { label: "BAFA-Bericht §9 Wirksamkeit verfassen", cat: "report" },
  { label: "CAPs priorisieren & Empfehlungen", cat: "action" },
  { label: "Welche Lieferanten brauchen sofort einen Audit?", cat: "action" },
  { label: "§5 Risikoanalysepflicht erklären", cat: "legal" },
  { label: "Score verbessern — konkrete Schritte", cat: "action" },
  { label: "§8 Beschwerdeverfahren: Was muss ich tun?", cat: "legal" },
  { label: "Meine größten Compliance-Risiken heute", cat: "analysis" },
];
const QUICK_EN = [
  { label: "Summarise my portfolio risk", cat: "analysis" },
  { label: "Draft §9 BAFA effectiveness section", cat: "report" },
  { label: "Prioritise CAPs with recommendations", cat: "action" },
  { label: "Which suppliers need an audit immediately?", cat: "action" },
  { label: "Explain §5 risk analysis obligation", cat: "legal" },
  { label: "Improve score — concrete steps", cat: "action" },
  { label: "§8 complaint procedure: what must I do?", cat: "legal" },
  { label: "My biggest compliance risks right now", cat: "analysis" },
];

const CAT_COLOR: Record<string, string> = {
  analysis: "#EFF6FF", report: "#F0FDF4", action: "#FFFBEB", legal: "#F5F3FF",
};
const CAT_TEXT: Record<string, string> = {
  analysis: "#2563EB", report: "#16A34A", action: "#D97706", legal: "#7C3AED",
};

export default function AiTab(props: WorkspaceTabProps) {
  const { L, aiMsgs, aiInput, setAiInput, aiLd, sendAi, kpis, score } = props;
  const quickPrompts = L === "de" ? QUICK_DE : QUICK_EN;

  return (
    <>
      <div className="ai-hd">
        <div className="ai-av">&#129302;</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15.5, fontWeight: 900, letterSpacing: "-.3px" }}>
            {L === "de" ? "LkSG KI-Assistent" : "LkSG AI Assistant"}
          </div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>
            Claude AI &middot; {L === "de" ? "LkSG-Compliance-Experte" : "LkSG compliance expert"} &middot;{" "}
            {kpis.total} {L === "de" ? "Lieferanten" : "suppliers"} &middot; Score {score.score}/100
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <span className={kpis.total > 0 ? "chip cl" : "chip cm"} style={{ fontSize: 10 }}>
            {kpis.total} {L === "de" ? "Lieferanten" : "Suppliers"}
          </span>
          <span className={score.score >= 70 ? "chip cl" : score.score >= 50 ? "chip cm" : "chip ch"} style={{ fontSize: 10 }}>
            {score.score}/100
          </span>
        </div>
      </div>

      {aiMsgs.length === 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 10 }}>
            {L === "de" ? "Schnellzugriff" : "Quick access"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 7 }}>
            {quickPrompts.map((p) => (
              <button
                key={p.label}
                style={{
                  textAlign: "left", padding: "9px 12px", border: `1px solid ${CAT_COLOR[p.cat]}`,
                  borderRadius: 9, background: CAT_COLOR[p.cat], cursor: "pointer", fontSize: 12.5,
                  fontWeight: 600, color: CAT_TEXT[p.cat], lineHeight: 1.4, transition: "transform .15s, box-shadow .15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 3px 12px rgba(0,0,0,.1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                onClick={() => sendAi(p.label)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="ai-chat">
        {aiMsgs.map((msg: any) => (
          <div key={msg.id} className={msg.role === "user" ? "ai-msg user" : "ai-msg bot"}>
            {msg.role === "assistant" && (
              <div className="ai-av-sm">🤖</div>
            )}
            <div className="ai-bubble">
              <pre style={{ whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit", fontSize: 13.5, lineHeight: 1.65 }}>
                {msg.content}
              </pre>
            </div>
          </div>
        ))}
        {aiLd && (
          <div className="ai-msg bot">
            <div className="ai-av-sm">🤖</div>
            <div className="ai-bubble" style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#9CA3AF", animation: "aiDot 1.2s infinite", animationDelay: `${i * 0.2}s` }} />
              ))}
              <style>{`@keyframes aiDot{0%,100%{opacity:.3;transform:translateY(0)}50%{opacity:1;transform:translateY(-3px)}}`}</style>
            </div>
          </div>
        )}
      </div>

      <div className="ai-inp-row">
        <input
          className="ai-inp"
          value={aiInput}
          onChange={e => setAiInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendAi(aiInput)}
          placeholder={L === "de" ? "LkSG-Frage oder Auftrag eingeben..." : "Enter LkSG question or task..."}
          disabled={aiLd}
        />
        <button className="ai-send" onClick={() => sendAi(aiInput)} disabled={aiLd || !aiInput.trim()}>
          {aiLd ? <span className="spin" /> : "↑"}
        </button>
      </div>
      <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6, textAlign: "center" }}>
        {L === "de" ? "KI-Einschätzungen sind kein Rechtsrat. Für verbindliche Entscheidungen Fachanwalt konsultieren." : "AI assessments are not legal advice. Consult a qualified lawyer for binding decisions."}
      </div>
    </>
  );
}
