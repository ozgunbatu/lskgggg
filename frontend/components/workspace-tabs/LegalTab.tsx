"use client";
import { useState, useEffect } from "react";
import type { WorkspaceTabProps } from "@/lib/workspace-types";

const CATEGORIES = [
  { id: "all", label: "Alle", labelEn: "All" },
  { id: "contract", label: "Verträge", labelEn: "Contracts" },
  { id: "questionnaire", label: "Fragebögen", labelEn: "Questionnaires" },
  { id: "policy", label: "Richtlinien", labelEn: "Policies" },
  { id: "process", label: "Prozesse", labelEn: "Processes" },
];

const IMPACT_COLOR: Record<string, string> = {
  critical: "#DC2626", high: "#D97706", medium: "#2563EB",
};

export default function LegalTab({ L, apiFn, toastFn }: WorkspaceTabProps & { apiFn: any; toastFn: any }) {
  const [view, setView] = useState<"templates" | "ask" | "review" | "defense" | "updates">("templates");
  const [templates, setTemplates] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [catFilter, setCatFilter] = useState("all");
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatedDoc, setGeneratedDoc] = useState<{ id: string; content: string } | null>(null);
  const [docLang, setDocLang] = useState("de");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewQ, setReviewQ] = useState("");
  const [reviewResult, setReviewResult] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [defYear, setDefYear] = useState(new Date().getFullYear());
  const [defLoading, setDefLoading] = useState(false);

  useEffect(() => {
    apiFn("/legal/templates").then(setTemplates).catch(() => {});
    apiFn("/legal/regulatory-updates").then(setUpdates).catch(() => {});
  }, [apiFn]);

  const filtered = catFilter === "all" ? templates : templates.filter(t => t.category === catFilter);

  async function generateTemplate(id: string) {
    setGenerating(id);
    setGeneratedDoc(null);
    try {
      const d = await apiFn(`/legal/templates/${id}/generate`, { method: "POST", body: JSON.stringify({ lang: docLang }) });
      setGeneratedDoc({ id, content: d.content });
    } catch (e: any) { toastFn("err", e.message); }
    setGenerating(null);
  }

  async function askLegal() {
    if (!question.trim()) return;
    setAskLoading(true); setAnswer("");
    try {
      const d = await apiFn("/legal/legal-question", { method: "POST", body: JSON.stringify({ question }) });
      setAnswer(d.answer);
    } catch (e: any) { toastFn("err", e.message); }
    setAskLoading(false);
  }

  async function reviewContract() {
    if (!reviewText.trim()) return;
    setReviewLoading(true); setReviewResult("");
    try {
      const d = await apiFn("/legal/contract-review", { method: "POST", body: JSON.stringify({ text: reviewText, question: reviewQ }) });
      setReviewResult(d.review);
    } catch (e: any) { toastFn("err", e.message); }
    setReviewLoading(false);
  }

  async function downloadDefenseFile() {
    setDefLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
      const res = await fetch(`/api/legal/bafa-defense-file/${defYear}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `BAFA_Verteidigungsakte_${defYear}.json`;
      a.click(); URL.revokeObjectURL(a.href);
      toastFn("ok", L === "de" ? `Verteidigungsakte ${defYear} heruntergeladen` : `Defense file ${defYear} downloaded`);
    } catch (e: any) { toastFn("err", e.message); }
    setDefLoading(false);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toastFn("ok", L === "de" ? "In Zwischenablage kopiert" : "Copied to clipboard");
  }

  const navBtn = (v: typeof view, label: string) => (
    <button className={`btn${view === v ? " btn-p" : ""}`}
      style={{ fontSize: 12, padding: "6px 14px", borderRadius: 8, border: view === v ? "none" : "1px solid #e5e7e5", background: view === v ? "#1B3D2B" : "#fff", color: view === v ? "#fff" : "#374151", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
      onClick={() => setView(v)}>{label}</button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: "16px 20px", background: "linear-gradient(135deg, #1B3D2B, #2d6348)", border: "none", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.3px", marginBottom: 4 }}>
              ⚖️ {L === "de" ? "Rechtsassistent & Dokumentenbibliothek" : "Legal Assistant & Document Library"}
            </div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.7)", lineHeight: 1.5 }}>
              {L === "de"
                ? "Rechtssichere LkSG-Vorlagen, KI-Rechtsberatung, Vertragsprüfung und BAFA-Verteidigungsakte. Kein Ersatz für einen Fachanwalt."
                : "Legally sound LkSG templates, AI legal guidance, contract review and BAFA defense file. Not a substitute for a qualified lawyer."}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", fontWeight: 700, textAlign: "right" }}>KI-Modell</div>
            <div style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 7, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>Claude AI</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {navBtn("templates", L === "de" ? "📄 Vorlagen" : "📄 Templates")}
        {navBtn("ask", L === "de" ? "❓ Rechtsfrage" : "❓ Legal Q&A")}
        {navBtn("review", L === "de" ? "🔍 Vertragscheck" : "🔍 Contract Review")}
        {navBtn("defense", L === "de" ? "🛡 Verteidigungsakte" : "🛡 Defense File")}
        {navBtn("updates", L === "de" ? "📰 Rechts-Updates" : "📰 Regulatory Updates")}
        {updates.some(u => u.impact === "critical") && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 700, color: "#DC2626" }}>
            🔴 {updates.filter(u => u.impact === "critical").length} {L === "de" ? "kritische Updates" : "critical updates"}
          </div>
        )}
      </div>

      {/* ── TEMPLATES ── */}
      {view === "templates" && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CATEGORIES.map(cat => (
                <button key={cat.id}
                  style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${catFilter === cat.id ? "#1B3D2B" : "#e5e7e5"}`, background: catFilter === cat.id ? "#1B3D2B" : "#fff", color: catFilter === cat.id ? "#fff" : "#6b7280", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  onClick={() => setCatFilter(cat.id)}>{L === "de" ? cat.label : cat.labelEn}</button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>{L === "de" ? "Sprache:" : "Language:"}</span>
              {["de", "en"].map(l => (
                <button key={l} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${docLang === l ? "#1B3D2B" : "#e5e7e5"}`, background: docLang === l ? "#1B3D2B" : "#fff", color: docLang === l ? "#fff" : "#374151", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                  onClick={() => setDocLang(l)}>{l.toUpperCase()}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
            {filtered.map((t: any) => (
              <div key={t.id} className="card" style={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0b0f0c", marginBottom: 4 }}>
                      {L === "de" ? t.titleDe : t.titleEn}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, marginBottom: 8 }}>
                      {L === "de" ? t.descDe : t.descEn}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
                  <span style={{ background: "#f0f5f1", border: "1px solid #d1e7d9", color: "#1B3D2B", fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>{t.lksgRef}</span>
                  {t.tags?.map((tag: string) => (
                    <span key={tag} style={{ background: "#F3F4F6", color: "#6b7280", fontSize: 10.5, fontWeight: 600, padding: "2px 7px", borderRadius: 4 }}>{tag}</span>
                  ))}
                </div>
                <button
                  className="btn btn-p"
                  style={{ width: "100%", padding: "9px", borderRadius: 9, fontSize: 12.5, fontWeight: 800, border: "none", background: "#1B3D2B", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, opacity: generating === t.id ? .7 : 1 }}
                  disabled={!!generating}
                  onClick={() => generateTemplate(t.id)}
                >
                  {generating === t.id ? <><span className="spin" /> {L === "de" ? "Generiere..." : "Generating..."}</> : `${L === "de" ? "Vorlage generieren" : "Generate document"} →`}
                </button>
              </div>
            ))}
          </div>

          {generatedDoc && (
            <div className="card" style={{ border: "2px solid #1B3D2B" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0b0f0c" }}>
                  ✓ {L === "de" ? "Generiertes Dokument" : "Generated Document"}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn" style={{ fontSize: 12, padding: "6px 12px", border: "1px solid #e5e7e5", borderRadius: 7, background: "#fff", cursor: "pointer", fontWeight: 700 }}
                    onClick={() => copyToClipboard(generatedDoc.content)}>📋 {L === "de" ? "Kopieren" : "Copy"}</button>
                  <button className="btn" style={{ fontSize: 12, padding: "6px 12px", border: "none", borderRadius: 7, background: "#1B3D2B", color: "#fff", cursor: "pointer", fontWeight: 700 }}
                    onClick={() => { const b = new Blob([generatedDoc.content], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `${generatedDoc.id}_${new Date().toISOString().slice(0,10)}.txt`; a.click(); }}>
                    ⬇ {L === "de" ? "Download" : "Download"}
                  </button>
                </div>
              </div>
              <div className="al al-info" style={{ marginBottom: 12 }}>
                <span className="al-icon">ℹ</span>
                <span style={{ fontSize: 12 }}>{L === "de" ? "Dieses Dokument wurde von KI generiert und ist als Ausgangspunkt gedacht. Vor rechtlicher Verwendung bitte von einem Fachanwalt prüfen lassen." : "This document was AI-generated and is intended as a starting point. Please have it reviewed by a qualified lawyer before legal use."}</span>
              </div>
              <pre style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "16px 18px", fontSize: 12.5, lineHeight: 1.7, whiteSpace: "pre-wrap", overflowY: "auto", maxHeight: 500, color: "#0b0f0c", fontFamily: "inherit" }}>
                {generatedDoc.content}
              </pre>
            </div>
          )}
        </>
      )}

      {/* ── ASK LEGAL ── */}
      {view === "ask" && (
        <div style={{ display: "grid", gap: 14 }}>
          <div className="card">
            <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0b0f0c", marginBottom: 6 }}>
              {L === "de" ? "LkSG-Rechtsfrage stellen" : "Ask a LkSG Legal Question"}
            </div>
            <div style={{ fontSize: 12.5, color: "#6b7280", marginBottom: 14, lineHeight: 1.6 }}>
              {L === "de" ? "Stellen Sie eine konkrete Frage zu Ihren LkSG-Pflichten. Der Assistent antwortet mit Paragraphenverweisen und konkreten Handlungsempfehlungen." : "Ask a specific question about your LkSG obligations. The assistant responds with legal references and concrete action steps."}
            </div>
            <div style={{ marginBottom: 10 }}>
              {["Welche Pflichten habe ich gegenüber Tier-2 Lieferanten?", "Wie lange muss ich Beschwerden aufbewahren?", "Was passiert wenn ein Lieferant den CoC nicht unterzeichnet?", "Wann liegt eine anlassbezogene Risikoanalyse vor?"].map(q => (
                <button key={q} style={{ display: "inline-block", margin: "3px 4px 3px 0", padding: "5px 11px", background: "#F0F5F1", border: "1px solid #D1E7D9", borderRadius: 7, fontSize: 12, color: "#1B3D2B", fontWeight: 600, cursor: "pointer" }}
                  onClick={() => setQuestion(q)}>{q}</button>
              ))}
            </div>
            <textarea value={question} onChange={e => setQuestion(e.target.value)}
              placeholder={L === "de" ? "Ihre LkSG-Rechtsfrage eingeben..." : "Enter your LkSG legal question..."}
              style={{ width: "100%", height: 90, padding: "10px 13px", border: "1.5px solid #E5E7E5", borderRadius: 10, fontSize: 13.5, resize: "vertical", fontFamily: "inherit", outline: "none", marginBottom: 10 }} />
            <button disabled={askLoading || !question.trim()}
              style={{ padding: "11px 24px", background: "#1B3D2B", color: "#fff", border: "none", borderRadius: 9, fontSize: 13.5, fontWeight: 800, cursor: "pointer", opacity: (!question.trim() || askLoading) ? .5 : 1, display: "flex", alignItems: "center", gap: 8 }}
              onClick={askLegal}>
              {askLoading ? <><span className="spin" /> {L === "de" ? "Analysiere..." : "Analysing..."}</> : `${L === "de" ? "Rechtsfrage analysieren" : "Analyse legal question"} →`}
            </button>
          </div>

          {answer && (
            <div className="card" style={{ border: "1.5px solid #D1E7D9" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0b0f0c" }}>⚖️ {L === "de" ? "Rechtliche Einschätzung" : "Legal Assessment"}</div>
                <button style={{ background: "none", border: "1px solid #e5e7e5", borderRadius: 7, padding: "4px 10px", fontSize: 11.5, cursor: "pointer", color: "#6b7280", fontWeight: 700 }} onClick={() => copyToClipboard(answer)}>📋</button>
              </div>
              <div className="al al-warn" style={{ marginBottom: 12 }}>
                <span className="al-icon">!</span>
                <span style={{ fontSize: 11.5 }}>{L === "de" ? "KI-generierte Einschätzung — kein Rechtsrat. Für verbindliche Entscheidungen Fachanwalt konsultieren." : "AI-generated assessment — not legal advice. Consult a qualified lawyer for binding decisions."}</span>
              </div>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.75, color: "#0b0f0c", fontFamily: "inherit" }}>{answer}</pre>
            </div>
          )}
        </div>
      )}

      {/* ── CONTRACT REVIEW ── */}
      {view === "review" && (
        <div style={{ display: "grid", gap: 14 }}>
          <div className="card">
            <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0b0f0c", marginBottom: 6 }}>
              {L === "de" ? "Vertragstext auf LkSG prüfen" : "Review Contract for LkSG Compliance"}
            </div>
            <div style={{ fontSize: 12.5, color: "#6b7280", marginBottom: 14, lineHeight: 1.5 }}>
              {L === "de" ? "Fügen Sie einen Vertragstext oder eine Klausel ein. Die KI prüft LkSG-Abdeckung, Lücken und gibt Verbesserungsvorschläge." : "Paste a contract text or clause. The AI checks LkSG coverage, gaps and suggests improvements."}
            </div>
            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
              placeholder={L === "de" ? "Vertragstext, Klausel oder Richtlinie hier einfügen..." : "Paste contract text, clause or policy here..."}
              style={{ width: "100%", height: 160, padding: "10px 13px", border: "1.5px solid #E5E7E5", borderRadius: 10, fontSize: 13, resize: "vertical", fontFamily: "inherit", outline: "none", marginBottom: 10 }} />
            <input value={reviewQ} onChange={e => setReviewQ(e.target.value)}
              placeholder={L === "de" ? "Spezifische Frage (optional): z.B. 'Fehlt ein Auditrecht?'" : "Specific question (optional): e.g. 'Is an audit right missing?'"}
              style={{ width: "100%", padding: "9px 13px", border: "1.5px solid #E5E7E5", borderRadius: 9, fontSize: 13, fontFamily: "inherit", outline: "none", marginBottom: 10 }} />
            <button disabled={reviewLoading || !reviewText.trim()}
              style={{ padding: "11px 24px", background: "#1B3D2B", color: "#fff", border: "none", borderRadius: 9, fontSize: 13.5, fontWeight: 800, cursor: "pointer", opacity: (!reviewText.trim() || reviewLoading) ? .5 : 1, display: "flex", alignItems: "center", gap: 8 }}
              onClick={reviewContract}>
              {reviewLoading ? <><span className="spin" /> {L === "de" ? "Prüfe..." : "Reviewing..."}</> : `${L === "de" ? "LkSG-Compliance prüfen" : "Check LkSG compliance"} →`}
            </button>
          </div>

          {reviewResult && (
            <div className="card" style={{ border: "1.5px solid #D1E7D9" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0b0f0c" }}>🔍 {L === "de" ? "Prüfungsergebnis" : "Review Result"}</div>
                <button style={{ background: "none", border: "1px solid #e5e7e5", borderRadius: 7, padding: "4px 10px", fontSize: 11.5, cursor: "pointer", color: "#6b7280", fontWeight: 700 }} onClick={() => copyToClipboard(reviewResult)}>📋</button>
              </div>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.75, color: "#0b0f0c", fontFamily: "inherit" }}>{reviewResult}</pre>
            </div>
          )}
        </div>
      )}

      {/* ── DEFENSE FILE ── */}
      {view === "defense" && (
        <div style={{ display: "grid", gap: 14 }}>
          <div className="card" style={{ border: "1.5px solid #1B3D2B" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0b0f0c", marginBottom: 6 }}>
              🛡 {L === "de" ? "BAFA-Verteidigungsakte generieren" : "Generate BAFA Defense File"}
            </div>
            <div style={{ fontSize: 12.5, color: "#6b7280", marginBottom: 16, lineHeight: 1.6 }}>
              {L === "de"
                ? "Erstellt eine strukturierte JSON-Datei mit allen Compliance-Nachweisen, gegliedert nach §5–§10 LkSG. Ideal als Ausgangspunkt für BAFA-Kontrollverfahren oder anwaltliche Verteidigung."
                : "Generates a structured JSON file with all compliance evidence, organized per §5–§10 LkSG. Ideal as a starting point for BAFA control procedures or legal defense."}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10, marginBottom: 16 }}>
              {["§5 Risk Analysis", "§6 Prevention Measures", "§7 Remediation Actions", "§8 Complaint Records", "§9 KPI Evidence", "§10 Full Audit Trail"].map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: "#16A34A" }}>
                  <span>✓</span>{s}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".6px", display: "block", marginBottom: 5 }}>{L === "de" ? "Berichtsjahr" : "Report year"}</label>
                <select value={defYear} onChange={e => setDefYear(Number(e.target.value))}
                  style={{ padding: "9px 13px", border: "1.5px solid #e5e7e5", borderRadius: 9, fontSize: 13.5, background: "#fff", fontWeight: 700 }}>
                  {[2025, 2024, 2023].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <button disabled={defLoading}
                style={{ padding: "11px 28px", background: "#1B3D2B", color: "#fff", border: "none", borderRadius: 9, fontSize: 13.5, fontWeight: 800, cursor: "pointer", marginTop: 20, display: "flex", alignItems: "center", gap: 8, opacity: defLoading ? .6 : 1 }}
                onClick={downloadDefenseFile}>
                {defLoading ? <><span className="spin" /> {L === "de" ? "Generiere..." : "Generating..."}</> : `⬇ ${L === "de" ? "Verteidigungsakte herunterladen" : "Download defense file"}`}
              </button>
            </div>
          </div>

          <div className="al al-info">
            <span className="al-icon">ℹ</span>
            <div style={{ fontSize: 12.5 }}>
              <strong>{L === "de" ? "Was ist die BAFA-Verteidigungsakte?" : "What is the BAFA defense file?"}</strong><br />
              {L === "de"
                ? "Eine strukturierte Zusammenfassung aller Compliance-Aktivitäten, die im Falle eines BAFA-Kontrollverfahrens als Nachweis dient. Enthält alle §5–§10 relevanten Daten aus Ihrem Workspace, mit Zeitstempeln und Audit Trail."
                : "A structured summary of all compliance activities that serves as evidence in case of a BAFA control procedure. Contains all §5–§10 relevant data from your workspace, with timestamps and audit trail."}
            </div>
          </div>
        </div>
      )}

      {/* ── REGULATORY UPDATES ── */}
      {view === "updates" && (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ fontSize: 13, color: "#6b7280", padding: "0 2px" }}>
            {L === "de" ? "Aktuelle LkSG-Entwicklungen, BAFA-Aktualisierungen und relevante Gesetzesänderungen." : "Latest LkSG developments, BAFA updates and relevant legislative changes."}
          </div>
          {updates.map((u: any) => (
            <div key={u.id} className="card" style={{ borderLeft: `4px solid ${IMPACT_COLOR[u.impact] || "#6B7280"}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: IMPACT_COLOR[u.impact] || "#6B7280", textTransform: "uppercase", letterSpacing: ".5px" }}>
                      {u.impact === "critical" ? "🔴" : u.impact === "high" ? "🟡" : "🔵"} {u.impact?.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 10.5, color: "#9CA3AF", fontWeight: 600 }}>{u.source} · {new Date(u.date).toLocaleDateString("de-DE")}</span>
                    <span style={{ background: "#F0F5F1", border: "1px solid #D1E7D9", color: "#1B3D2B", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 4 }}>{u.lksgRef}</span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0b0f0c", marginBottom: 5 }}>{u.title}</div>
                  <div style={{ fontSize: 12.5, color: "#374151", lineHeight: 1.6, marginBottom: 8 }}>{u.summary}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 11px", background: u.impact === "critical" ? "#FEF2F2" : "#FFFBEB", border: `1px solid ${u.impact === "critical" ? "#FECACA" : "#FDE68A"}`, borderRadius: 7, fontSize: 12, fontWeight: 600, color: u.impact === "critical" ? "#DC2626" : "#D97706" }}>
                    <span>→</span> {u.action}
                  </div>
                </div>
              </div>
              {u.link && (
                <div style={{ marginTop: 8 }}>
                  <a href={u.link} target="_blank" rel="noreferrer" style={{ fontSize: 11.5, color: "#1B3D2B", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                    {L === "de" ? "Offizielle Quelle" : "Official source"} ↗
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
