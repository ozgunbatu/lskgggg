"use client";
import { useEffect, useRef } from "react";

export default function AiTab(props: any) {
  const { L, aiMsgs, aiInput, setAiInput, aiLd, sendAi } = props;
  const msgs = aiMsgs || [];
  const input = aiInput || "";
  const msgsEndRef = useRef<HTMLDivElement>(null);

  const QUICK = {
    de: [
      "Welche Lieferanten haben das höchste Risiko?",
      "Welche CAPs sind am dringlichsten?",
      "Wie gut ist meine BAFA-Readiness?",
      "Was fehlt für den BAFA-Bericht §10?",
    ],
    en: [
      "Which suppliers have the highest risk?",
      "Which CAPs are most urgent?",
      "How is my BAFA readiness?",
      "What's missing for the BAFA §10 report?",
    ],
  };
  const qs = (QUICK as any)[L] || QUICK.de;

  // Detect if last message is an API-key error
  const lastMsg = msgs[msgs.length - 1];
  const isKeyError =
    lastMsg?.role === "assistant" &&
    (lastMsg.content?.includes("ANTHROPIC_API_KEY") ||
      lastMsg.content?.includes("KI nicht verfügbar") ||
      lastMsg.content?.includes("AI unavailable"));

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, aiLd]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--g)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", fontWeight: 800, flexShrink: 0 }}>✦</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--t1)", letterSpacing: "-.04em" }}>LkSG AI Assistant</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--g)", textTransform: "uppercase", letterSpacing: ".1em", fontFamily: "'DM Mono',monospace" }}>
            Claude · §4–§10 LkSG
          </div>
        </div>
      </div>

      {/* API key missing banner */}
      {isKeyError && (
        <div className="al al-warn" style={{ marginBottom: 0 }}>
          <span className="al-icon">⚠</span>
          <div style={{ fontSize: 12.5 }}>
            <strong>{L === "de" ? "ANTHROPIC_API_KEY fehlt in Railway:" : "ANTHROPIC_API_KEY missing in Railway:"}</strong>
            {" "}
            {L === "de"
              ? "Railway → Backend Service → Variables → ANTHROPIC_API_KEY eintragen (sk-ant-…). Danach Service neu deployen."
              : "Railway → Backend Service → Variables → add ANTHROPIC_API_KEY (sk-ant-…). Then redeploy the service."}
            <br />
            <span style={{ fontFamily: "'DM Mono',monospace", color: "var(--t4)", fontSize: 11 }}>
              {L === "de" ? "Diagnose-URL:" : "Diagnostics URL:"}{" "}
              <code>/ai/health</code>
            </span>
          </div>
        </div>
      )}

      <div className="ai-box">
        <div className="ai-msgs">
          {msgs.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--t3)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--t2)", marginBottom: 6 }}>
                {L === "de" ? "Was kann ich analysieren?" : "What would you like me to analyse?"}
              </div>
              <div style={{ fontSize: 12 }}>
                {L === "de"
                  ? "Lieferanten, CAPs, Beschwerden oder den BAFA-Bericht."
                  : "Suppliers, CAPs, complaints or the BAFA report."}
              </div>
            </div>
          )}
          {msgs.map((m: any, i: number) => (
            <div key={i} className={`ai-msg${m.role === "user" ? " u" : ""}`}>
              <div className="ai-ico" style={{ background: m.role === "user" ? "var(--c2)" : "var(--g)", color: m.role === "user" ? "var(--t2)" : "#fff" }}>
                {m.role === "user" ? "U" : "✦"}
              </div>
              <div className={`ai-bub ${m.role === "user" ? "u" : "a"}`} style={{ whiteSpace: "pre-wrap" }}>
                {m.content}
              </div>
            </div>
          ))}
          {aiLd && (
            <div className="ai-msg">
              <div className="ai-ico" style={{ background: "var(--g)", color: "#fff" }}>✦</div>
              <div className="ai-bub a" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="spin-d" />
                <span style={{ color: "var(--t3)", fontSize: 12 }}>{L === "de" ? "Analysiere…" : "Analysing…"}</span>
              </div>
            </div>
          )}
          <div ref={msgsEndRef} />
        </div>

        {msgs.length === 0 && (
          <div className="ai-qs">
            {qs.map((q: string) => (
              <button key={q} className="ai-q" onClick={() => sendAi(q)}>{q}</button>
            ))}
          </div>
        )}

        <div className="ai-ir">
          <textarea
            className="ai-ta"
            rows={2}
            value={input}
            onChange={e => setAiInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendAi(input);
                setAiInput("");
              }
            }}
            placeholder={L === "de" ? "Fragen Sie zur LkSG-Compliance… (Enter senden)" : "Ask about LkSG compliance… (Enter to send)"}
          />
          <button
            className="btn btn-ai"
            style={{ alignSelf: "flex-end" }}
            onClick={() => { sendAi(input); setAiInput(""); }}
            disabled={!input.trim() || !!aiLd}
          >
            {aiLd ? <span className="spin" /> : "→"}
          </button>
        </div>
        <div className="ai-dis">
          Powered by Anthropic Claude · {L === "de" ? "Ihre Daten bleiben sicher" : "Your data stays secure"}
        </div>
      </div>
    </div>
  );
}
