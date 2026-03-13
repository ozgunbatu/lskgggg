/**
 * AI Module v4 -- LkSGCompass
 * Real data injection into all AI prompts
 */
import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import { calcLiveKPIs } from "./kpi";

const router = Router();
const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-opus-4-5";

async function callClaude(system: string, userMsg: string, maxTokens = 1000): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const resp = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: "user", content: userMsg }] }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(`Claude API error: ${(err as any)?.error?.message || resp.status}`);
  }

  const data = await resp.json() as any;
  return data.content?.[0]?.text || "";
}

const SYSTEM_LKSG = `Du bist ein spezialisierter LkSG-Compliance-Experte und Wirtschaftsanwalt mit Expertise in:
- Lieferkettensorgfaltspflichtengesetz (LkSG) §1-10
- BAFA-Anforderungen und Berichterstattung (§10 LkSG)
- ESG-Risikoanalyse und Menschenrechtsdue-Diligence
- Corrective Action Plans (CAPs) und Praeventionsmassnahmen

Deine Antworten sind:
- Praezise, praxisorientiert, rechtssicher
- Immer mit konkreten Paragraphenverweisen
- Mit klaren, umsetzbaren Handlungsempfehlungen
- Auf Deutsch (ausser wenn explizit auf Englisch gefragt)

Hinweis am Ende: "Diese Analyse ist kein Rechtsrat. Fuer rechtlich bindende Entscheidungen bitte Fachanwalt konsultieren."`;

// ── Context builder ───────────────────────────────────────────────────────────
async function buildContext(companyId: string) {
  const [company, sups, caps, cmps, saqs, kpis] = await Promise.all([
    db.query("SELECT name, slug FROM companies WHERE id=$1", [companyId]),
    db.query(`SELECT name, country, industry, risk_level, risk_score, has_audit, has_code_of_conduct,
                     certification_count, workers
              FROM suppliers WHERE company_id=$1 ORDER BY risk_score DESC`, [companyId]),
    db.query(`SELECT title, status, priority, lksg_paragraph, due_date, completed_at
              FROM action_plans WHERE company_id=$1`, [companyId]).catch(() => ({ rows: [] })),
    db.query("SELECT category, status, severity, created_at FROM complaints WHERE company_id=$1", [companyId]).catch(() => ({ rows: [] })),
    db.query("SELECT status FROM supplier_saq WHERE company_id=$1", [companyId]).catch(() => ({ rows: [] })),
    calcLiveKPIs(companyId).catch(() => null),
  ]);

  const cname   = company.rows[0]?.name || "Unbekannt";
  const supList = sups.rows;
  const capList = (caps as any).rows;
  const cmpList = (cmps as any).rows;
  const saqList = (saqs as any).rows;

  const high   = supList.filter((s: any) => s.risk_level === "high");
  const med    = supList.filter((s: any) => s.risk_level === "medium");
  const low    = supList.filter((s: any) => s.risk_level === "low");

  const n = supList.length;
  // Use accurate formula from kpi module (risk 55% + process 45%)
  const portfolioScore = (kpis as any)?.portfolioScore ?? (n > 0
    ? Math.max(0, Math.round(100 - ((high.length / n) * 55) - ((med.length / n) * 20)))
    : 100);
  const auditCoverage  = (kpis as any)?.auditCoverage  ?? (n > 0 ? Math.round(supList.filter((s: any) => s.has_audit).length / n * 100) : 0);
  const cocCoverage    = (kpis as any)?.cocCoverage    ?? (n > 0 ? Math.round(supList.filter((s: any) => s.has_code_of_conduct).length / n * 100) : 0);

  // Top 5 high risk for context
  const topRisk = high.slice(0, 5)
    .map((s: any) => `${s.name} (${s.country}, ${s.industry}, Score ${s.risk_score}, Audit: ${s.has_audit ? "Ja" : "Nein"}, CoC: ${s.has_code_of_conduct ? "Ja" : "Nein"})`)
    .join("\n  - ");

  // Countries with most high-risk suppliers
  const countryCounts: Record<string, number> = {};
  high.forEach((s: any) => { countryCounts[s.country] = (countryCounts[s.country] || 0) + 1; });
  const topCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([c, n]) => `${c} (${n})`).join(", ");

  // Industry distribution of high-risk
  const indCounts: Record<string, number> = {};
  high.forEach((s: any) => { indCounts[s.industry] = (indCounts[s.industry] || 0) + 1; });
  const topIndustries = Object.entries(indCounts).sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([i, n]) => `${i} (${n})`).join(", ");

  const capOpen    = capList.filter((c: any) => c.status !== "completed" && c.status !== "closed").length;
  const capDone    = capList.filter((c: any) => c.status === "completed").length;
  const capOverdue = capList.filter((c: any) => {
    if (!c.due_date || c.status === "completed") return false;
    return new Date(c.due_date) < new Date();
  }).length;

  // auditCoverage and cocCoverage set above from kpis

  const saqDone = saqList.filter((s: any) => s.status === "completed").length;

  return {
    cname,
    context: `
Unternehmen: ${cname}
Compliance Score: ${portfolioScore}/100 (${portfolioScore >= 85 ? "A" : portfolioScore >= 70 ? "B" : portfolioScore >= 50 ? "C" : "D/F"})

LIEFERANTEN-PORTFOLIO:
- Gesamt: ${n} Lieferanten
- Hochrisiko (§6 LkSG Handlungsbedarf): ${high.length}
- Mittelrisiko (§4 LkSG Praevention): ${med.length}
- Niedrigrisiko: ${low.length}
- Audit-Abdeckung: ${auditCoverage}%
- CoC-Abdeckung: ${cocCoverage}%
${topRisk ? `\nTop-Hochrisiko-Lieferanten:\n  - ${topRisk}` : ""}
${topCountries ? `\nRisikolaender: ${topCountries}` : ""}
${topIndustries ? `Risikobranchen: ${topIndustries}` : ""}

AKTIONSPLAENE (CAPs):
- Offen: ${capOpen} | Abgeschlossen: ${capDone} | Ueberfaellig: ${capOverdue}
- Abschlussrate: ${capList.length > 0 ? Math.round(capDone / capList.length * 100) : 0}%

BESCHWERDEN: ${cmpList.length} gesamt, ${cmpList.filter((c: any) => c.status === "open").length} offen
SAQ-Fragebogen: ${saqList.length} gesendet, ${saqDone} ausgefuellt
`,
    raw: { cname, n, high: high.length, med: med.length, portfolioScore, capOpen, capDone, capOverdue, auditCoverage, cocCoverage, saqDone, saqTotal: saqList.length, cmpTotal: cmpList.length, topCountries, topIndustries, topRisk, allSuppliers: supList },
  };
}

// -- 1. Chat ------------------------------------------------------------------
router.post("/chat", requireAuth, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: "messages required" });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.json({ reply: "KI nicht konfiguriert (ANTHROPIC_API_KEY in Railway eintragen)." });

    const ctx = await buildContext(req.auth!.companyId);
    const systemWithCtx = `${SYSTEM_LKSG}\n\n--- AKTUELLER UNTERNEHMENSKONTEXT ---\n${ctx.context}`;

    const history = messages.slice(-14).map((m: any) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: String(m.content).slice(0, 2000),
    }));

    const resp = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 1400, system: systemWithCtx, messages: history }),
    });

    const data = await resp.json() as any;
    res.json({ reply: data.content?.[0]?.text || "Keine Antwort." });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// -- 2. Supplier analysis -----------------------------------------------------
router.get("/supplier-analysis/:id", requireAuth, async (req, res) => {
  try {
    const s = await db.query("SELECT * FROM suppliers WHERE id=$1 AND company_id=$2", [req.params.id, req.auth!.companyId]);
    if (!s.rows[0]) return res.status(404).json({ error: "Not found" });
    const sup = s.rows[0];

    // Get related complaints and CAPs
    const [cmpR, capR] = await Promise.all([
      db.query("SELECT category, status FROM complaints WHERE supplier_id=$1 LIMIT 5", [sup.id]).catch(() => ({ rows: [] })),
      db.query("SELECT title, status, priority FROM action_plans WHERE supplier_id=$1 LIMIT 5", [sup.id]).catch(() => ({ rows: [] })),
    ]);

    const analysis = await callClaude(SYSTEM_LKSG,
      `Erstelle eine praezise Risikoanalyse gemaess §5 LkSG:

LIEFERANT: ${sup.name}
Land: ${sup.country} | Branche: ${sup.industry} | Risikostufe: ${sup.risk_level} (Score: ${sup.risk_score}/100)
Mitarbeiter: ${sup.workers || "unbekannt"} | Jahresvolumen: ${sup.annual_spend_eur ? `EUR ${Number(sup.annual_spend_eur).toLocaleString("de-DE")}` : "unbekannt"}
Audit: ${sup.has_audit ? "vorhanden" : "FEHLT"} | Code of Conduct: ${sup.has_code_of_conduct ? "vorhanden" : "FEHLT"}
Zertifikate: ${sup.certification_count || 0} | Transparenz: ${sup.transparency_score || "unbekannt"}/5
Fruehere Verstoesse: ${sup.previous_violations ? "JA" : "Nein"}
${(cmpR as any).rows.length ? `\nBeschwerden: ${(cmpR as any).rows.map((c: any) => c.category).join(", ")}` : ""}
${(capR as any).rows.length ? `\nOffene CAPs: ${(capR as any).rows.map((c: any) => c.title).join(", ")}` : ""}

Risikoprofil nach §5 LkSG -- gib aus:
1. **Risikobewertung** (2-3 Saetze, konkrete Faktoren fuer Land und Branche)
2. **§2 LkSG Tatbestaende** (welche Absaetze relevant)
3. **Sofortmassnahmen** (3 Punkte mit Zeitrahmen)
4. **BAFA-Dokumentation** (was muss nachgewiesen werden)
Max. 350 Woerter, strukturiert.`,
      600
    );

    res.json({ analysis, supplier: { id: sup.id, name: sup.name, risk_level: sup.risk_level } });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// -- 3. CAP generation --------------------------------------------------------
router.post("/cap/:id", requireAuth, async (req, res) => {
  try {
    const s = await db.query("SELECT * FROM suppliers WHERE id=$1 AND company_id=$2", [req.params.id, req.auth!.companyId]);
    if (!s.rows[0]) return res.status(404).json({ error: "Not found" });
    const sup = s.rows[0];

    const cap = await callClaude(SYSTEM_LKSG,
      `Erstelle einen strukturierten Corrective Action Plan (CAP) gemaess §6 LkSG:

${sup.name} | ${sup.country} | ${sup.industry} | Score: ${sup.risk_score}/100
Audit: ${sup.has_audit ? "vorhanden" : "FEHLT"} | CoC: ${sup.has_code_of_conduct ? "vorhanden" : "FEHLT"}

CAP-Struktur:
1. **Festgestellte Risiken** (konkrekt, §2 LkSG-Tatbestaende)
2. **Sofortmassnahmen** (0-30 Tage, mit Verantwortlichem)
3. **Kurzfristig** (31-90 Tage)
4. **Langfristig** (91-365 Tage)
5. **KPIs/Erfolgskriterien** (§9 LkSG Wirksamkeit)
6. **Eskalation** bei Nichtumsetung

Format: strukturiert, umsetzbar, BAFA-tauglich.`,
      900
    );

    res.json({ cap, supplier: { id: sup.id, name: sup.name } });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// -- 4. Report section with REAL data injection --------------------------------
router.post("/report-section", requireAuth, async (req, res) => {
  try {
    const { section, year } = req.body;
    const companyId = req.auth!.companyId;
    const y = year || new Date().getFullYear();
    const ctx = await buildContext(companyId);
    const r = ctx.raw;

    const sectionPrompts: Record<string, string> = {
      organization_structure:
        `Schreibe den BAFA-Pflichtabschnitt "1. Unternehmensstruktur und Verantwortung" (§10 Abs. 1 LkSG) fuer ${r.cname}, Berichtsjahr ${y}.
Fakten: [Mitarbeiterzahl und Umsatz als Platzhalter]. Compliance Score: ${r.portfolioScore}/100.
Stil: professionell, BAFA-konform, 150-200 Woerter.`,

      responsible_persons:
        `Schreibe den BAFA-Abschnitt "1b. Verantwortliche Personen" (§4 Abs. 3 LkSG) fuer ${r.cname}.
Platzhalter: [Name Menschenrechtsbeauftragte/r], [Abteilung]. Verwende konkrete Formulierungen.
150-180 Woerter.`,

      risk_methodology:
        `Schreibe den BAFA-Pflichtabschnitt "2. Risikoanalyse -- Methodik" (§5 LkSG) fuer ${r.cname}, Jahr ${y}.
Fakten: ${r.n} Lieferanten analysiert in ${r.topCountries || "mehreren Laendern"}, Branchen: ${r.topIndustries || "mehrere"}.
Methodik: 20-Faktor Scoring (Laenderrisiko 35%, Branche 25%, Unternehmensprofil 25%, Vorfaelle 15%).
Jaehrliche + anlassbezogene Analyse. 180-220 Woerter, praezise, BAFA-tauglich.`,

      prioritized_risks:
        `Schreibe den BAFA-Pflichtabschnitt "2b. Priorisierte Risiken" (§5 Abs. 2 LkSG) fuer ${r.cname}, Jahr ${y}.
ECHTE DATEN: ${r.high} Hochrisiko (${r.topCountries || "diverse Laender"}), ${r.med} Mittelrisiko, Audit-Abdeckung ${r.auditCoverage}%.
${r.topRisk ? `Top-Risikolieferanten: ${r.topRisk}` : ""}
Gehe auf konkrete §2 LkSG-Tatbestaende ein. 200-250 Woerter.`,

      prevention_measures:
        `Schreibe den BAFA-Pflichtabschnitt "3. Praventionsmassnahmen" (§4 LkSG) fuer ${r.cname}, Jahr ${y}.
DATEN: CoC-Abdeckung ${r.cocCoverage}%, SAQ-Fragebogen: ${r.saqDone}/${r.saqTotal} beantwortet, Audit-Abdeckung ${r.auditCoverage}%.
Massnahmen: Code of Conduct, SAQ-Prozess, Audits, Schulungen, Vertragsklauseln. 200-250 Woerter.`,

      remediation_measures:
        `Schreibe den BAFA-Pflichtabschnitt "4. Abhilfemassnahmen" (§7 LkSG) fuer ${r.cname}, Jahr ${y}.
ECHTE DATEN: ${r.capDone + r.capOpen} CAPs gesamt, davon ${r.capDone} abgeschlossen (${r.capOpen + r.capDone > 0 ? Math.round(r.capDone / (r.capOpen + r.capDone) * 100) : 0}% Abschlussrate), ${r.capOverdue} ueberfaellig.
CAP-Prozess: erstellen, zuweisen, nachverfolgen, abschliessen, Wirksamkeit pruefen. 180-220 Woerter.`,

      complaints_procedure:
        `Schreibe den BAFA-Pflichtabschnitt "5. Beschwerdeverfahren" (§8 LkSG) fuer ${r.cname}, Jahr ${y}.
DATEN: ${r.cmpTotal} Beschwerden eingegangen, ${r.cmpTotal - r.capOpen} bearbeitet.
Digitale Plattform, Anonymitaetsschutz, §8 Abs. 5-konform, Zugangsgruppen (MA, Lieferanten, NGOs).
200-240 Woerter.`,

      effectiveness_review:
        `Schreibe den BAFA-Pflichtabschnitt "6. Wirksamkeitskontrolle" (§9 LkSG) fuer ${r.cname}, Jahr ${y}.
KPIs: Compliance Score ${r.portfolioScore}/100, CAP-Abschlussrate ${r.capOpen + r.capDone > 0 ? Math.round(r.capDone / (r.capOpen + r.capDone) * 100) : 0}%, Audit-Abdeckung ${r.auditCoverage}%, SAQ-Ruecklauf ${r.saqTotal > 0 ? Math.round(r.saqDone / r.saqTotal * 100) : 0}%.
Jaehrliche Review, Verbesserungsmassnahmen. 180-220 Woerter.`,
    };

    const prompt = sectionPrompts[section];
    if (!prompt) return res.status(400).json({ error: "Unknown section" });

    const text = await callClaude(SYSTEM_LKSG, prompt, 800);
    res.json({ text, section });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// -- 5. Full BAFA report -------------------------------------------------------
router.post("/bafa-full-report", requireAuth, async (req, res) => {
  try {
    const { year } = req.body;
    const y = year || new Date().getFullYear();
    const ctx = await buildContext(req.auth!.companyId);
    const r = ctx.raw;

    const report = await callClaude(SYSTEM_LKSG,
      `Erstelle einen vollstaendigen, professionellen BAFA-Jahresbericht gemaess §10 LkSG fuer:

UNTERNEHMEN: ${r.cname} | Berichtsjahr: ${y}

ECHTE DATEN:
- ${r.n} Lieferanten | Score: ${r.portfolioScore}/100 | ${r.high} Hochrisiko, ${r.med} Mittelrisiko
- Hauptrisikolaender: ${r.topCountries || "k.A."}
- Risikobranchen: ${r.topIndustries || "k.A."}
- Audit-Abdeckung: ${r.auditCoverage}% | CoC-Abdeckung: ${r.cocCoverage}%
- CAPs: ${r.capDone + r.capOpen} gesamt, ${r.capDone} abgeschlossen, ${r.capOverdue} ueberfaellig
- Beschwerden: ${r.cmpTotal} gesamt
- SAQ: ${r.saqDone}/${r.saqTotal} ausgefuellt

Schreibe alle 6 BAFA-Pflichtabschnitte:
1. Unternehmensstruktur (§10 Abs. 1)
2. Risikoanalyse & Methodik (§5)
3. Praventionsmassnahmen (§4)
4. Abhilfemassnahmen (§7)
5. Beschwerdeverfahren (§8)
6. Wirksamkeitskontrolle (§9)

Fuer jeden Abschnitt: 150-200 Woerter, BAFA-tauglich, mit konkreten Zahlen aus den Echtdaten.
Platzhalter [Mitarbeiterzahl], [Umsatz] verwenden wo noetig.`,
      3000
    );

    res.json({ report, year: y, company: r.cname });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// -- 6. Complaint triage -------------------------------------------------------
router.post("/complaint-triage", requireAuth, async (req, res) => {
  try {
    const { description, category } = req.body;
    if (!description) return res.status(400).json({ error: "description required" });

    const triage = await callClaude(SYSTEM_LKSG,
      `Analysiere diese Beschwerde (§8 LkSG Hinweisgebersystem):

Kategorie: ${category || "unbekannt"}
Beschreibung: ${description}

Triage-Analyse:
1. **Schweregrad** (kritisch/hoch/mittel/niedrig) + Begruendung
2. **§2 LkSG Tatbestaende** (konkrete Absaetze)
3. **Erstmassnahmen** (innerhalb 24h)
4. **Eskalation** (intern/extern/Behoerde)
5. **Frist** fuer Rueckmeldung an Melder (§8 Abs. 5: Eingangsbestaetigung 7 Tage)`,
      600
    );

    res.json({ triage });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// -- 7. Risk summary -----------------------------------------------------------
router.get("/risk-summary", requireAuth, async (req, res) => {
  try {
    const ctx = await buildContext(req.auth!.companyId);
    const r = ctx.raw;

    const summary = await callClaude(SYSTEM_LKSG,
      `Executive Risk Summary fuer ${r.cname}:

${ctx.context}

Erstelle:
1. Management-Summary (3-4 Saetze, Vorstand/GF-tauglich)
2. Dringlichste 3 Handlungsempfehlungen
3. BAFA-Risikobewertung
4. Prognose bis Jahresende`,
      800
    );

    res.json({ summary, stats: { total: r.n, high: r.high, medium: r.med, score: r.portfolioScore } });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
