/**
 * Legal module — Contract templates, BAFA defense file, regulatory intelligence
 * Extends AI capabilities with legal document generation
 */
import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import { calcLiveKPIs } from "./kpi";

const router = Router();
const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

async function callClaude(system: string, userMsg: string, maxTokens = 1500): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured. Please set it in your environment variables.");
  const resp = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-opus-4-5", max_tokens: maxTokens, system, messages: [{ role: "user", content: userMsg }] }),
  });
  if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(`Claude API: ${(e as any)?.error?.message || resp.status}`); }
  const data = await resp.json() as any;
  return data.content?.[0]?.text || "";
}

const LEGAL_SYSTEM = `Du bist ein spezialisierter Rechtsanwalt fuer Lieferkettenrecht und LkSG-Compliance.
Du erstellst rechtssichere Vertragstexte, Klauseln und Compliance-Dokumente auf Basis des:
- Lieferkettensorgfaltspflichtengesetz (LkSG) 2023
- HinSchG (Hinweisgeberschutzgesetz)
- DSGVO
- Internationaler Menschenrechtsstandards (UN-Leitprinzipien, ILO-Kernarbeitsstandards)

Deine Texte sind:
- Juristisch praezise und vollstaendig
- Sofort verwendbar (keine Luecken)
- Mit konkreten Paragraphenverweisen
- Auf Deutsch (ausser wenn explizit anders gewuenscht)

Wichtiger Hinweis: Diese Texte sind als Ausgangspunkt gedacht. Fuer die endgueltige Verwendung empfehlen wir die Pruefung durch einen zugelassenen Rechtsanwalt.`;

// ── TEMPLATE DEFINITIONS ─────────────────────────────────────────────────────
export const TEMPLATES = [
  {
    id: "supplier-coc",
    category: "contract",
    titleDe: "Verhaltenskodex für Lieferanten",
    titleEn: "Supplier Code of Conduct",
    descDe: "Vollständiger CoC nach §6 Abs.2 LkSG mit Menschenrechts-, Umwelt- und Anti-Korruptionsstandards",
    descEn: "Complete CoC per §6 para.2 LkSG covering human rights, environmental and anti-corruption standards",
    lksgRef: "§6 Abs.2, §2 Abs.2",
    tags: ["CoC", "Prävention", "Pflicht"],
  },
  {
    id: "contract-clause",
    category: "contract",
    titleDe: "Vertragsklausel LkSG-Verpflichtungen",
    titleEn: "Contract Clause LkSG Obligations",
    descDe: "Zusatzklausel für Lieferantenverträge: LkSG-Sorgfaltspflichten, Auditrecht, Kündigungsrecht",
    descEn: "Addendum for supplier contracts: LkSG obligations, audit rights, termination rights",
    lksgRef: "§6 Abs.3, §7 Abs.3",
    tags: ["Vertrag", "Auditrecht", "Wichtig"],
  },
  {
    id: "saq-standard",
    category: "questionnaire",
    titleDe: "Lieferanten-Selbstauskunft (SAQ)",
    titleEn: "Supplier Self-Assessment Questionnaire",
    descDe: "Strukturierter Fragebogen zur Bewertung von Menschenrechts- und Umweltrisiken bei Lieferanten",
    descEn: "Structured questionnaire to assess human rights and environmental risks at suppliers",
    lksgRef: "§6 Abs.3, §5 Abs.2",
    tags: ["SAQ", "Risikoanalyse", "Fragebogen"],
  },
  {
    id: "audit-protocol",
    category: "process",
    titleDe: "Lieferanten-Auditprotokoll",
    titleEn: "Supplier Audit Protocol",
    descDe: "Prüfprotokoll für Vor-Ort-Audits: Checklisten für Arbeitnehmerrechte, Umweltstandards, Management",
    descEn: "On-site audit protocol with checklists for labor rights, environmental standards, management",
    lksgRef: "§6 Abs.3 Nr.2, §5",
    tags: ["Audit", "Vor-Ort", "Protokoll"],
  },
  {
    id: "whistleblower-policy",
    category: "policy",
    titleDe: "Hinweisgeberschutz-Richtlinie",
    titleEn: "Whistleblower Protection Policy",
    descDe: "Interne Richtlinie zum Schutz von Hinweisgebern nach HinSchG §16 und §8 LkSG",
    descEn: "Internal policy protecting whistleblowers per HinSchG §16 and §8 LkSG",
    lksgRef: "§8 LkSG, HinSchG §16",
    tags: ["HinSchG", "Schutz", "Pflicht"],
  },
  {
    id: "risk-methodology",
    category: "policy",
    titleDe: "Risikoanalysemethodik §5 LkSG",
    titleEn: "Risk Analysis Methodology §5 LkSG",
    descDe: "Dokumentierte Methodik zur jährlichen und anlassbezogenen Risikoanalyse nach §5 LkSG",
    descEn: "Documented methodology for annual and event-based risk analysis per §5 LkSG",
    lksgRef: "§5 Abs.1-4",
    tags: ["Methodik", "Dokumentation", "§5"],
  },
];

// GET /legal/templates — list all templates
router.get("/templates", requireAuth, async (_req, res) => {
  res.json(TEMPLATES);
});

// POST /legal/templates/:id/generate — generate document from template
router.post("/templates/:id/generate", requireAuth, async (req, res) => {
  try {
    const template = TEMPLATES.find(t => t.id === req.params.id);
    if (!template) return res.status(404).json({ error: "Template not found" });

    const { companyId } = req.auth!;
    const co = await db.query("SELECT name, industry FROM companies WHERE id=$1", [companyId]);
    const companyName = co.rows[0]?.name || "[Unternehmensname]";
    const industry = co.rows[0]?.industry || "[Branche]";
    const lang = req.body.lang || "de";

    let prompt = "";

    switch (template.id) {
      case "supplier-coc":
        prompt = `Erstelle einen vollstaendigen Verhaltenskodex fuer Lieferanten (Supplier Code of Conduct) fuer:
Unternehmen: ${companyName} | Branche: ${industry}

Der CoC muss enthalten:
1. Praeambel und Geltungsbereich (§6 Abs.2 LkSG)
2. Menschenrechte (Kinderarbeit §2 Nr.1-3, Zwangsarbeit §2 Nr.4-5, Diskriminierung §2 Nr.6, Vereinigungsfreiheit §2 Nr.7-8)
3. Arbeitnehmerrechte (Mindestlohn §2 Nr.8, Arbeitsschutz §2 Nr.5)
4. Umweltstandards (§2 Abs.3 LkSG, Minamata, Stockholm, Basel Konventionen)
5. Anti-Korruption und Compliance (§2 Nr.10)
6. Lieferkette und Sub-Lieferanten (Weitergabepflicht)
7. Pruef- und Auditrechte des Unternehmens
8. Sanktionen bei Verstoss
9. Kontakt fuer Hinweise (§8 LkSG Portal)
10. Unterzeichnungsfelder

Format: Professionelles Rechtsdokument, nummerierte Abschnitte, sofort verwendbar.
Sprache: ${lang === "en" ? "Englisch" : "Deutsch"}`;
        break;

      case "contract-clause":
        prompt = `Erstelle eine rechtssichere Vertragsklausel fuer Lieferantenvertraege (LkSG-Zusatz) fuer ${companyName}.

Die Klausel muss enthalten:
1. LkSG-Sorgfaltspflichten des Lieferanten (§6 Abs.3)
2. Verpflichtung zur Einhaltung des Verhaltenskodex
3. Pflicht zur Weitergabe an Sub-Lieferanten
4. Auditrechte: Ankuendigung, Zugang, Dokumentenpflicht
5. Informationspflicht bei Verstaessen oder Risiken
6. Abhilfemassnahmen und Fristen (§7)
7. Ausserordentliches Kuendigungsrecht bei LkSG-Verstoss (§7 Abs.3)
8. Dokumentations- und Aufbewahrungspflicht (§10)
9. Vertragsstrafe bei schuldhaftem Verstoss

Stil: Rechtlich praezise, als §-Abschnitte fuer direkten Einbau in Einkaufsvertraege.`;
        break;

      case "saq-standard":
        prompt = `Erstelle einen vollstaendigen Lieferanten-Selbstauskunftsfragebogen (SAQ) fuer ${companyName} (Branche: ${industry}).

Der SAQ soll ${lang === "en" ? "auf Englisch" : "auf Deutsch"} sein und enthalten:

TEIL A — Unternehmensprofil (6 Fragen)
TEIL B — Menschenrechte & Arbeitsbedingungen (12 Fragen, §2 Abs.2)
- Kinderarbeit, Zwangsarbeit, Diskriminierung, Vereinigungsfreiheit
- Mindestlohn, Arbeitszeiten, Arbeitsschutz
TEIL C — Umwelt (8 Fragen, §2 Abs.3)
- Schadstoffe, Wasser, Landnutzung, Emissionen
TEIL D — Governance & Anti-Korruption (6 Fragen)
TEIL E — Supply Chain Management (5 Fragen)
TEIL F — Zertifizierungen & Audits (4 Fragen)

Format: Klare Ja/Nein-Fragen mit Kommentarfeld, Bewertungsmatrix, Unterzeichnungsfeld.`;
        break;

      case "audit-protocol":
        prompt = `Erstelle ein professionelles Lieferanten-Auditprotokoll fuer ${companyName}.

Das Protokoll soll enthalten:
1. Deckblatt (Lieferant, Datum, Pruefer, Standort)
2. Pruefungsmethodik (Dokumentenpruefung, Mitarbeiterinterviews, Rundgang)
3. CHECKLISTE A: Menschenrechte & Arbeit (20 Pruefpunkte mit Bewertung 1-4)
4. CHECKLISTE B: Umweltstandards (15 Pruefpunkte)
5. CHECKLISTE C: Management & Governance (10 Pruefpunkte)
6. Interviewleitfaden fuer Mitarbeitergespraeche (anonym, 10 Fragen)
7. Fotodokumentationsfelder
8. Massnahmenkatalog bei Befunden
9. Gesamtbewertung und Empfehlung
10. Unterschriften und Nachverfolgung

Bewertungsschema: 1=erfuellt, 2=teilweise, 3=nicht erfuellt, 4=nicht anwendbar`;
        break;

      case "whistleblower-policy":
        prompt = `Erstelle eine vollstaendige Hinweisgeberschutz-Richtlinie fuer ${companyName} nach HinSchG und §8 LkSG.

Inhalte:
1. Zweck und Geltungsbereich
2. Gesetzliche Grundlage (HinSchG §§1-3, §16 | §8 LkSG)
3. Schutzbereich: wer ist Hinweisgeber?
4. Meldekanal-Beschreibung (intern: Portal, Ombudsperson; extern: BAFA)
5. Verfahrensablauf nach Eingang (7-Tage-Eingangsbestaetigung, 3-Monate-Frist)
6. Vertraulichkeits- und Anonymitaetsgarantien
7. Verbotene Massnahmen (Kuendigung, Diskriminierung, Repressalien)
8. Bearbeitungsprozess und Eskalation
9. Dokumentation und Aufbewahrung
10. Schulungspflichten
11. Ansprechpartner und Kontakt`;
        break;

      case "risk-methodology":
        prompt = `Erstelle eine dokumentierte Risikoanalysemethodik nach §5 LkSG fuer ${companyName} (Branche: ${industry}).

Inhalt:
1. Geltungsbereich und Haeufigkeit (§5 Abs.1: jaehrlich + anlassbezogen)
2. Risikofelder nach §2 LkSG (Katalog aller Tatbestaende)
3. Bewertungsmatrix: Eintrittswahrscheinlichkeit × Schwere = Risikoscore
4. Laenderrisiko-Methodik (Quellen: CPI, ITUC-Index, U.S. State Dept.)
5. Branchenrisiko-Methodik
6. Lieferantenspezifische Faktoren (Groesse, Transparenz, Audits)
7. Anlassbezogene Analyse: Trigger-Events (Medienberichte, Beschwerden, Laenderveraenderungen)
8. Priorisierung und Massnahmenableitung
9. Dokumentation und Aufbewahrung (§10: 7 Jahre)
10. Verantwortlichkeiten und Governance
11. Review und Aktualisierungsprozess`;
        break;
    }

    const content = await callClaude(LEGAL_SYSTEM, prompt, 2500);
    res.json({ content, template: template.id, language: lang, generatedAt: new Date().toISOString() });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /legal/contract-review — AI reviews a clause or document
router.post("/contract-review", requireAuth, async (req, res) => {
  try {
    const { text, question } = req.body;
    if (!text) return res.status(400).json({ error: "text required" });
    const review = await callClaude(LEGAL_SYSTEM,
      `Analysiere den folgenden Vertragstext / die folgende Klausel auf LkSG-Konformitaet:

TEXT:
${text.slice(0, 3000)}

${question ? `SPEZIFISCHE FRAGE: ${question}` : ""}

Pruefe:
1. LkSG-Abdeckung: Welche §§ sind abgedeckt, welche fehlen?
2. Luecken und Risiken: Was koennte BAFA bemaengeln?
3. Konkrete Verbesserungsvorschlaege (mit Alternativformulierungen)
4. Gesamtbewertung: ausreichend / verbesserungswuerdig / unzureichend`,
      1200
    );
    res.json({ review });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /legal/legal-question — specific LkSG legal guidance
router.post("/legal-question", requireAuth, async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "question required" });
    const { companyId } = req.auth!;
    const co = await db.query("SELECT name FROM companies WHERE id=$1", [companyId]);
    const companyName = co.rows[0]?.name || "Ihr Unternehmen";
    const answer = await callClaude(LEGAL_SYSTEM,
      `Rechtsfrage fuer ${companyName}:\n\n${question}\n\nBitte antworte mit:\n1. Direkte Antwort (2-3 Saetze)\n2. Rechtliche Grundlage (LkSG-Paragraphen, ggf. weitere Gesetze)\n3. Praktische Umsetzung (konkrete Schritte)\n4. Risiken bei Nicht-Einhaltung\n5. Empfehlung`,
      1000
    );
    res.json({ answer });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /legal/bafa-defense-file — generate structured defense documentation
router.get("/bafa-defense-file/:year", requireAuth, async (req, res) => {
  try {
    const { companyId } = req.auth!;
    const year = parseInt(req.params.year) || new Date().getFullYear();

    const [co, sups, caps, cmps, evidence, saqs, audit] = await Promise.all([
      db.query("SELECT * FROM companies WHERE id=$1", [companyId]),
      db.query("SELECT * FROM suppliers WHERE company_id=$1 ORDER BY risk_score DESC", [companyId]),
      db.query("SELECT * FROM action_plans WHERE company_id=$1 ORDER BY created_at", [companyId]).catch(() => ({ rows: [] })),
      db.query("SELECT * FROM complaints WHERE company_id=$1", [companyId]).catch(() => ({ rows: [] })),
      db.query("SELECT type, title, lksg_ref, created_at FROM evidence WHERE company_id=$1 ORDER BY created_at DESC LIMIT 100", [companyId]).catch(() => ({ rows: [] })),
      db.query("SELECT supplier_name, status, sent_at, completed_at FROM supplier_saq WHERE company_id=$1", [companyId]).catch(() => ({ rows: [] })),
      db.query("SELECT action, entity_type, entity_name, created_at, user_email FROM audit_log WHERE company_id=$1 ORDER BY created_at DESC LIMIT 200", [companyId]).catch(() => ({ rows: [] })),
    ]);

    const kpis = await calcLiveKPIs(companyId).catch(() => null);
    const company = co.rows[0];

    const defenseFile = {
      meta: {
        company: company?.name,
        year,
        generatedAt: new Date().toISOString(),
        complianceScore: kpis?.portfolioScore,
        grade: kpis?.grade,
        purpose: "BAFA Verteidigungsakte — §10 LkSG Dokumentationspflicht",
      },
      section5_risikoanalyse: {
        title: "§5 Risikoanalyse",
        supplierCount: sups.rows.length,
        riskDistribution: {
          high: sups.rows.filter((s: any) => s.risk_level === "high").length,
          medium: sups.rows.filter((s: any) => s.risk_level === "medium").length,
          low: sups.rows.filter((s: any) => s.risk_level === "low").length,
        },
        highRiskSuppliers: sups.rows
          .filter((s: any) => s.risk_level === "high")
          .map((s: any) => ({
            name: s.name, country: s.country, industry: s.industry,
            score: s.risk_score, hasAudit: s.has_audit, hasCoC: s.has_code_of_conduct,
          })),
        auditCoverage: `${kpis?.auditCoverage || 0}%`,
        cocCoverage: `${kpis?.cocCoverage || 0}%`,
      },
      section6_praevention: {
        title: "§6 Präventionsmaßnahmen",
        totalCAPs: (caps.rows as any[]).length,
        completedCAPs: (caps.rows as any[]).filter((c: any) => c.status === "completed").length,
        overdueCAPs: (caps.rows as any[]).filter((c: any) => c.due_date && new Date(c.due_date) < new Date() && c.status !== "completed").length,
        saqsSent: (saqs.rows as any[]).length,
        saqsCompleted: (saqs.rows as any[]).filter((s: any) => s.status === "completed").length,
        evidenceDocuments: (evidence.rows as any[]).length,
      },
      section7_abhilfe: {
        title: "§7 Abhilfemaßnahmen",
        actionPlans: (caps.rows as any[]).map((c: any) => ({
          title: c.title, status: c.status, priority: c.priority,
          lksgParagraph: c.lksg_paragraph, dueDate: c.due_date, completedAt: c.completed_at,
        })),
      },
      section8_beschwerde: {
        title: "§8 Beschwerdeverfahren",
        totalComplaints: (cmps.rows as any[]).length,
        openComplaints: (cmps.rows as any[]).filter((c: any) => c.status === "open").length,
        resolvedComplaints: (cmps.rows as any[]).filter((c: any) => c.status === "resolved" || c.status === "closed").length,
        complaintsByCategory: (cmps.rows as any[]).reduce((acc: any, c: any) => {
          acc[c.category] = (acc[c.category] || 0) + 1; return acc;
        }, {}),
      },
      section9_wirksamkeit: {
        title: "§9 Wirksamkeitskontrolle",
        complianceScore: kpis?.portfolioScore,
        grade: kpis?.grade,
        capCompletionRate: `${kpis?.capCompletionRate || 0}%`,
        auditCoverage: `${kpis?.auditCoverage || 0}%`,
        cocCoverage: `${kpis?.cocCoverage || 0}%`,
        avgResolutionDays: kpis?.avgResolutionDays,
      },
      section10_dokumentation: {
        title: "§10 Dokumentation & Aufbewahrung",
        evidenceCount: (evidence.rows as any[]).length,
        evidenceByType: (evidence.rows as any[]).reduce((acc: any, e: any) => {
          acc[e.type] = (acc[e.type] || 0) + 1; return acc;
        }, {}),
        auditTrailEntries: (audit.rows as any[]).length,
        retentionUntil: `${year + 7} (§10 Abs.1 LkSG — 7 Jahre)`,
      },
      auditTrailSample: (audit.rows as any[]).slice(0, 30).map((a: any) => ({
        action: a.action, entityType: a.entity_type, entityName: a.entity_name,
        user: a.user_email, timestamp: a.created_at,
      })),
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="BAFA_Verteidigungsakte_${year}_${company?.name?.replace(/[^a-zA-Z0-9]/g, "_") || "company"}.json"`);
    res.json(defenseFile);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /legal/regulatory-updates — BAFA + LkSG regulatory intelligence
router.get("/regulatory-updates", requireAuth, async (_req, res) => {
  try {
    // Static + semi-dynamic regulatory intelligence
    // In production this would be updated from BAFA RSS feed
    const updates = [
      {
        id: "bafa-2024-guidelines",
        date: "2024-10-15",
        source: "BAFA",
        type: "guidance",
        title: "BAFA aktualisiert Handreichung zur Risikoanalyse §5 LkSG",
        summary: "Die BAFA hat ihre Handreichung zur Durchführung der Risikoanalyse aktualisiert. Neue Hinweise zur anlassbezogenen Analyse und zur Dokumentationspflicht.",
        impact: "high",
        action: "Risikoanalysemethodik auf neue BAFA-Vorgaben prüfen",
        link: "https://www.bafa.de/DE/Lieferketten/Informationen_fuer_Unternehmen/informationen_fuer_unternehmen_node.html",
        lksgRef: "§5",
      },
      {
        id: "csddd-2024",
        date: "2024-07-25",
        source: "EU",
        type: "legislation",
        title: "EU CSDDD verabschiedet — Umsetzungsfrist bis 2027",
        summary: "Die Corporate Sustainability Due Diligence Directive wurde verabschiedet. Ab 2027 gelten strengere EU-weite Sorgfaltspflichten, die über den LkSG-Rahmen hinausgehen.",
        impact: "high",
        action: "Gap-Analyse LkSG vs. CSDDD durchführen — Umsetzungsplan bis 2026 erstellen",
        link: "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32024L1760",
        lksgRef: "LkSG → CSDDD",
      },
      {
        id: "bafa-reporting-2025",
        date: "2025-01-08",
        source: "BAFA",
        type: "reporting",
        title: "BAFA öffnet Berichtsportal für Berichtsjahr 2024",
        summary: "Das BAFA-Berichtsportal ist ab 08.01.2025 für die Einreichung der Berichte für das Berichtsjahr 2024 geöffnet. Frist: 30. April 2025.",
        impact: "critical",
        action: "BAFA-Jahresbericht für 2024 erstellen und bis 30.04.2025 einreichen",
        link: "https://www.bafa.de/DE/Lieferketten/Berichterstattung/berichterstattung_node.html",
        lksgRef: "§10",
      },
      {
        id: "hinschg-2023",
        date: "2023-07-02",
        source: "Bundesregierung",
        type: "legislation",
        title: "HinSchG in Kraft — Interne Meldekanäle bis Ende 2023 Pflicht",
        summary: "Das Hinweisgeberschutzgesetz ist in Kraft. Unternehmen ab 50 Mitarbeitern müssen interne Meldekanäle einrichten. Verbindung zu §8 LkSG Beschwerdemechanismus.",
        impact: "high",
        action: "Whistleblowing-Portal auf HinSchG-Konformität prüfen, §16 Schutzmaßnahmen dokumentieren",
        link: "https://www.gesetze-im-internet.de/hinschg/",
        lksgRef: "§8 LkSG, HinSchG §16",
      },
      {
        id: "bafa-enforcement-2024",
        date: "2024-03-20",
        source: "BAFA",
        type: "enforcement",
        title: "BAFA: Erste Bußgeldverfahren nach LkSG eingeleitet",
        summary: "Die BAFA hat angekündigt, ab 2024 verstärkt Kontrollverfahren durchzuführen. Bußgelder bis zu 2% des Jahresumsatzes möglich. Fokus: §5 Risikoanalyse und §10 Dokumentation.",
        impact: "critical",
        action: "Risikoanalyse und Dokumentation auf BAFA-Anforderungen prüfen — Compliance-Score verbessern",
        link: "https://www.bafa.de/DE/Lieferketten/Kontrollverfahren/kontrollverfahren_node.html",
        lksgRef: "§24, §5, §10",
      },
      {
        id: "ilo-2024-update",
        date: "2024-05-12",
        source: "ILO",
        type: "standard",
        title: "ILO aktualisiert Kernarbeitsnormen — Relevanz für §2 LkSG",
        summary: "Die ILO hat ihre Kernarbeitsnormen um das Übereinkommen über Gewalt und Belästigung in der Arbeitswelt (ILO C190) erweitert. Relevant für §2 Abs.2 LkSG.",
        impact: "medium",
        action: "Verhaltenskodex auf ILO C190 prüfen und ggf. aktualisieren",
        link: "https://www.ilo.org/core-labour-standards",
        lksgRef: "§2 Abs.2 Nr.6",
      },
    ];

    res.json(updates);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
