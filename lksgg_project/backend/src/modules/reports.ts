/**
 * BAFA Report Generator - §10 Abs.2 LkSG
 * Generates BAFA-compliant annual reports with data-driven narrative
 */
import { Router } from "express";
import PDFDocument from "pdfkit";
import { db } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import { requireWriteAccess, requireApprovalAccess, logApprovalEvent } from "../middleware/access";
import jwt from "jsonwebtoken";
import { requireInt } from "../lib/validate";
import { calcComplianceScore, getGrade } from "./kpi";

const router = Router();

type ReportDraft = {
  reporting_scope: string;
  organization_structure: string;
  responsible_persons: string;
  risk_methodology: string;
  prioritized_risks: string;
  prevention_measures: string;
  remediation_measures: string;
  complaints_procedure: string;
  complaints_access_groups: string;
  effectiveness_review: string;
};

// --- SENSITIVE COMBINATIONS ------------------------------------------------
// BAFA specifically scrutinizes these country+industry combinations
const SENSITIVE_COMBOS: { countries: string[]; industries: string[]; reason: string }[] = [
  {
    countries: ["Bangladesh","Myanmar","Pakistan","Cambodia","Sri Lanka","Vietnam","Indonesia","Ethiopia"],
    industries: ["textile","food","agriculture","manufacturing"],
    reason: "Laender mit bekannten Risiken fuer Kinderarbeit, Zwangsarbeit und Arbeitsschutzverletzungen in dieser Branche (§2 Abs.2 Nr.1-5 LkSG). Risikoklassifizierung basiert auf CPI-Score, ITUC-Index und ILO-Daten."
  },
  {
    countries: ["DR Congo","Sudan","Somalia","Nigeria","Ethiopia","Eritrea"],
    industries: ["mining","metals","energy","electronics"],
    reason: "Laender mit Konfliktmineralien-Risiken und bekannten Umweltverstaessen in Rohstoffgewinnung (§2 Abs.3 LkSG)."
  },
  {
    countries: ["China","Russia","UAE","Saudi Arabia"],
    industries: ["electronics","manufacturing","it","logistics"],
    reason: "Laender mit eingeschraenkten Gewerkschaftsrechten und Meinungsfreiheit in systemrelevanten Branchen (§2 Abs.2 Nr.6 LkSG)."
  },
];

function getSensitiveExplanation(country: string, industry: string): string | null {
  for (const combo of SENSITIVE_COMBOS) {
    if (combo.countries.includes(country) && combo.industries.includes(industry)) {
      return combo.reason;
    }
  }
  return null;
}

// --- AUTO-GENERATED NARRATIVE TEXT ----------------------------------------
function autoNarrative(
  cname: string, year: number,
  supRows: any[], capRows: any[], saqRows: any[], compRows: any[],
  publicPortalUrl: string, score: number, grade: string
): ReportDraft {
  const total     = supRows.length;
  const high      = supRows.filter(s => s.risk_level === "high").length;
  const med       = supRows.filter(s => s.risk_level === "medium").length;
  const auditN    = supRows.filter(s => s.has_audit).length;
  const cocN      = supRows.filter(s => s.has_code_of_conduct).length;
  const auditPct  = total > 0 ? Math.round(auditN/total*100) : 0;
  const cocPct    = total > 0 ? Math.round(cocN/total*100)   : 0;
  const capDone   = capRows.filter(c => c.status === "completed").length;
  const capOverdue= capRows.filter(c => c.due_date && new Date(c.due_date)<new Date() && c.status!=="completed").length;
  const saqDone   = saqRows.filter(s => s.status === "completed").length;

  // Sensitive supplier list
  const sensitiveSuppliers = supRows.filter(s =>
    getSensitiveExplanation(s.country, s.industry)
  );

  const gaps: string[] = [];
  if (auditPct < 60) gaps.push(`Audit-Abdeckung auf 60%+ erhoehen (aktuell: ${auditPct}%)`);
  if (cocPct < 70)   gaps.push(`Code-of-Conduct auf 70%+ ausweiten (aktuell: ${cocPct}%)`);
  if (saqRows.length === 0 && (high+med) > 0) gaps.push("SAQ-Prozess fuer Hoch- und Mittelrisiko-Lieferanten starten");
  if (capOverdue > 0) gaps.push(`${capOverdue} ueberfaellige CAPs schliessen`);

  const prioritizedRisksText = sensitiveSuppliers.length > 0
    ? `Folgende Lieferanten erfordern erhoehte Sorgfalt aufgrund laender- und branchenspezifischer Risiken:\n\n${
        sensitiveSuppliers.slice(0,10).map(s => {
          const exp = getSensitiveExplanation(s.country, s.industry);
          return `- ${s.name} (${s.country}, ${s.industry}, Risikostufe: ${s.risk_level.toUpperCase()}): ${exp}`;
        }).join("\n\n")
      }\n\nDie Risikostufeneinstufung basiert auf einem 20-Parameter-Modell (Laenderrisiko 35%, Branche 25%, Unternehmensprofil 25%, Vorfaelle 15%).`
    : `Die Risikoanalyse hat ${high} Hochrisiko- und ${med} Mittelrisiko-Lieferanten in ${new Set(supRows.map(s=>s.country)).size} Laendern identifiziert. ` +
      `Priorisierungskriterien: Laenderrisiko (CPI, Freedom House, ITUC), Branchenexposure, Ausgabenvolumen und verfuegbare Compliance-Informationen.`;

  return {
    reporting_scope:
      `Das Berichtsjahr ${year} entspricht dem Geschaeftsjahr. Dieses Dokument bezieht sich auf ${cname} und umfasst alle direkten Lieferanten (${total} erfasst). ` +
      `Die Berichtspflicht gemaess §10 Abs.2 LkSG gilt fuer Unternehmen mit Sitz in Deutschland und mindestens 1.000 Beschaeftigten ab 2024.`,

    organization_structure:
      `[Pflichtfeld - bitte ausfuellen] Beschreiben Sie die Unternehmensstruktur: Tochtergesellschaften, Standorte, Lieferkettenstufen. ` +
      `Benennen Sie die organisatorische Verankerung des Sorgfaltspflichten-Managements (z.B. Compliance-Abteilung, Einkauf, Nachhaltigkeit). ` +
      `Aktueller Compliance-Score: ${score}/100 (Note ${grade}).`,

    responsible_persons:
      `[Pflichtfeld - bitte ausfuellen] Benennen Sie die gemaess §4 Abs.3 LkSG bestellte verantwortliche Person fuer Menschenrechtsrisiken ` +
      `(Name, Funktion, Kontaktdaten, Berichtslinie zur Geschaeftsfuehrung). Diese Person muss mindestens jaehrlich an die Geschaeftsfuehrung berichten.`,

    risk_methodology:
      `Die Risikoanalyse wird gemaess §5 LkSG mindestens jaehrlich sowie anlassbezogen (z.B. bei neuen Lieferanten, Ereignissen) durchgefuehrt. ` +
      `Methodik: 20-Parameter-Scoring-Modell. Gewichtung: Laenderrisiko 35% (Quellen: Transparency International CPI, Freedom House, ITUC Global Rights Index), ` +
      `Branchenrisiko 25% (ILO-Sektorrisikolisten), Unternehmensprofil 25% (Auditierung, CoC, SAQ-Ergebnisse), ` +
      `Vorfaelle 15% (Beschwerden, Verstosshistorie). Ergebnis: 3-stufige Risikoeinstufung (hoch/mittel/niedrig).`,

    prioritized_risks: prioritizedRisksText,

    prevention_measures:
      `Gemaess §4 LkSG wurden im Berichtsjahr ${year} folgende Praeventionstmassnahmen umgesetzt:\n` +
      `- Code of Conduct: ${cocN} von ${total} Lieferanten (${cocPct}%) haben den Verhaltenskodex unterzeichnet\n` +
      `- Audits: ${auditN} von ${total} Lieferanten (${auditPct}%) wurden auditiert\n` +
      `- SAQ (Selbstauskunft): ${saqRows.length} Fragebogen versandt, ${saqDone} zurueckgekehrt\n` +
      (gaps.length > 0 ? `\nGeplante Massnahmen zur Schliessung von Luecken:\n${gaps.map(g=>`- ${g}`).join("\n")}` : ""),

    remediation_measures:
      `Gemaess §7 LkSG wurden ${capRows.length} Corrective Action Plans (CAPs) initiiert. ` +
      `Davon ${capDone} abgeschlossen (${capRows.length>0?Math.round(capDone/capRows.length*100):0}%), ` +
      `${capRows.length-capDone} offen${capOverdue>0?`, davon ${capOverdue} ueberfaellig`:""}.` +
      (capOverdue > 0 ? `\n\nHINWEIS: ${capOverdue} CAP(s) sind ueberfaellig. Gemaess §7 Abs.4 LkSG muss bei anhaltender Nichtumsetzung ` +
        `geprueft werden, ob die Geschaeftsbeziehung ausgesetzt oder beendet werden muss. Eine Begruendung fuer die Verzoegerung ist dokumentationspflichtig.` : ""),

    complaints_procedure:
      `Das Unternehmen betreibt gemaess §8 LkSG ein Beschwerdeverfahren mit folgenden Komponenten:\n` +
      `1. Einreichungskanal: Oeffentliches Online-Portal unter ${publicPortalUrl} (anonym moeglich)\n` +
      `2. Interner Einreichungskanal: Compliance-Abteilung und direkte Vorgesetzte\n` +
      `3. Anonymitaetsschutz: Beschwerdeeinreichung anonym moeglich; Identitaet wird nicht ohne Zustimmung offenbart\n` +
      `4. Schutz vor Benachteiligung: Melderinnen und Melder sind gesetzlich geschuetzt (§8 Abs.2 LkSG)\n` +
      `5. Bearbeitungsfrist: Eingangsbestaetigung innerhalb 3 Werktagen; Abschlusskommunikation innerhalb 90 Tagen\n` +
      `Im Berichtsjahr: ${compRows.length} Beschwerde(n) eingegangen, ${compRows.filter(c=>c.status==="resolved"||c.status==="closed").length} abgeschlossen.`,

    complaints_access_groups:
      `Zugangsberechtigt sind: (1) eigene Beschaeftigte, (2) Beschaeftigte direkter Zulieferer, ` +
      `(3) von der Geschaeftstaetikeit betroffene Dritte, (4) Gewerkschaften und Betriebsraete, ` +
      `(5) NGOs und Zivilgesellschaft, (6) Anonyme Hinweisgeber. Zugang: Web-Portal (24/7), E-Mail, Post.`,

    effectiveness_review:
      `Die Wirksamkeitskontrolle gemaess §9 LkSG erfolgt mindestens jaehrlich anhand folgender KPIs:\n` +
      `- CAP-Abschlussrate: ${capRows.length>0?Math.round(capDone/capRows.length*100):0}% (Ziel: 80%)\n` +
      `- Audit-Abdeckung: ${auditPct}% (Ziel: 60%)\n` +
      `- CoC-Abdeckung: ${cocPct}% (Ziel: 70%)\n` +
      `- Compliance Score: ${score}/100 (Ziel: 70+, Note: ${grade})\n` +
      `- SAQ-Ruecklauf: ${saqRows.length>0?Math.round(saqDone/saqRows.length*100):0}% (Ziel: 60%)\n` +
      `- Offene Beschwerden: ${compRows.filter(c=>c.status==="open").length} (Ziel: 0)\n\n` +
      `[Bitte ergaenzen: Beschreiben Sie Ihren Review-Prozess, Governance-Struktur, Eskalationsweg bei Verstossen]`,
  };
}

async function getOrCreateReport(companyId: string, year: number, userId: string) {
  await db.query(
    `INSERT INTO reports(company_id,year,created_by,summary) VALUES($1,$2,$3,$4)
     ON CONFLICT(company_id,year) DO UPDATE SET updated_at=now()`,
    [companyId, year, userId, JSON.stringify({})]
  );
  return db.query("SELECT * FROM reports WHERE company_id=$1 AND year=$2", [companyId, year]);
}

// GET /reports/bafa/:year/draft
router.get("/bafa/:year/draft", requireAuth, async (req, res) => {
  const year = requireInt(req.params.year, "year");
  const companyId = req.auth!.companyId;

  const company = await db.query("SELECT id,name,slug FROM companies WHERE id=$1", [companyId]);
  const cname = company.rows[0]?.name ?? "--";
  const slug  = company.rows[0]?.slug ?? "";
  const portalUrl = `${process.env.FRONTEND_URL || "https://www.lksgcompass.de"}/complaints/${slug}`;

  const [supR, capR, saqR, cmpR] = await Promise.all([
    db.query("SELECT name,country,industry,risk_level,risk_score,has_audit,has_code_of_conduct FROM suppliers WHERE company_id=$1 ORDER BY risk_score DESC", [companyId]),
    db.query("SELECT status,priority,due_date FROM action_plans WHERE company_id=$1", [companyId]).catch(() => ({ rows: [] })),
    db.query("SELECT status FROM supplier_saq WHERE company_id=$1", [companyId]).catch(() => ({ rows: [] })),
    db.query("SELECT status,category FROM complaints WHERE company_id=$1", [companyId]).catch(() => ({ rows: [] })),
  ]);

  const total = supR.rows.length, high = supR.rows.filter((s:any)=>s.risk_level==="high").length, med = supR.rows.filter((s:any)=>s.risk_level==="medium").length;
  const capsDone = capR.rows.filter((c:any)=>c.status==="completed").length;
  const capsOverdue = capR.rows.filter((c:any)=>c.due_date && new Date(c.due_date)<new Date() && c.status!=="completed").length;
  const saqDone = saqR.rows.filter((s:any)=>s.status==="completed").length;
  const score = calcComplianceScore({
    total, high, med,
    auditCount: supR.rows.filter((s:any)=>s.has_audit).length,
    cocCount: supR.rows.filter((s:any)=>s.has_code_of_conduct).length,
    capsTotal: capR.rows.length, capsDone, capsOverdue,
    saqsSent: saqR.rows.length, saqsDone: saqDone,
    complaintsOpen: cmpR.rows.filter((c:any)=>c.status==="open").length,
  });
  const grade = getGrade(score);

  const r = await getOrCreateReport(companyId, year, req.auth!.userId);
  const existing = r.rows[0]?.summary?.draft || {};
  const autoDraft = autoNarrative(cname, year, supR.rows, capR.rows, saqR.rows, cmpR.rows, portalUrl, score, grade);
  // User edits override auto text
  const draft = { ...autoDraft, ...existing };

  await db.query(
    "UPDATE reports SET summary = jsonb_set(COALESCE(summary,'{}'), '{draft}', $1::jsonb, true) WHERE company_id=$2 AND year=$3",
    [JSON.stringify(draft), companyId, year]
  );

  res.json({ year, draft, company: { id: companyId, name: cname, slug }, score, grade });
});

// PUT /reports/bafa/:year/draft
router.put("/bafa/:year/draft", requireAuth, requireWriteAccess, async (req, res) => {
  const year = requireInt(req.params.year, "year");
  const companyId = req.auth!.companyId;
  const incoming = req.body as Partial<ReportDraft>;

  const r = await db.query("SELECT summary FROM reports WHERE company_id=$1 AND year=$2", [companyId, year]);
  const currentDraft = r.rows[0]?.summary?.draft || {};
  const merged = { ...currentDraft, ...incoming };

  await db.query(
    "UPDATE reports SET summary = jsonb_set(COALESCE(summary,'{}'), '{draft}', $1::jsonb, true), updated_at=now() WHERE company_id=$2 AND year=$3",
    [JSON.stringify(merged), companyId, year]
  );

  res.json({ ok: true });
});

// GET /reports/bafa/:year  (PDF)
router.get("/bafa/:year", async (req, res) => {
  const header  = String(req.headers.authorization || "").trim();
  const qtoken  = String((req.query as any)?.token || "").trim();
  const token   = header.startsWith("Bearer ") ? header.slice(7) : (header || qtoken);
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).auth = decoded;
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const companyId = req.auth!.companyId;
  const year = requireInt(req.params.year, "year");

  const company = await db.query("SELECT id,name,slug FROM companies WHERE id=$1", [companyId]);
  const cname   = company.rows[0]?.name ?? "--";
  const slug    = company.rows[0]?.slug ?? "";
  const portalUrl = `${process.env.FRONTEND_URL || "https://www.lksgcompass.de"}/complaints/${slug}`;

  const [supR, capR, saqR, cmpR] = await Promise.all([
    db.query("SELECT name,country,industry,risk_level,risk_score,has_audit,has_code_of_conduct FROM suppliers WHERE company_id=$1 ORDER BY risk_score DESC", [companyId]),
    db.query("SELECT title,status,priority,due_date FROM action_plans WHERE company_id=$1", [companyId]).catch(() => ({ rows: [] })),
    db.query("SELECT status FROM supplier_saq WHERE company_id=$1", [companyId]).catch(() => ({ rows: [] })),
    db.query("SELECT source,status,category,created_at FROM complaints WHERE company_id=$1 AND EXTRACT(YEAR FROM created_at)=$2", [companyId, year]).catch(() => ({ rows: [] })),
  ]);

  const sups = supR.rows, caps = capR.rows, saqs = saqR.rows, cmps = cmpR.rows;
  const total = sups.length;
  const high = sups.filter((s:any)=>s.risk_level==="high");
  const med  = sups.filter((s:any)=>s.risk_level==="medium");
  const low  = sups.filter((s:any)=>s.risk_level==="low");
  const auditN = sups.filter((s:any)=>s.has_audit).length;
  const cocN   = sups.filter((s:any)=>s.has_code_of_conduct).length;
  const auditPct = total>0?Math.round(auditN/total*100):0;
  const cocPct   = total>0?Math.round(cocN/total*100):0;
  const capDone    = caps.filter((c:any)=>c.status==="completed").length;
  const capOpen    = caps.filter((c:any)=>c.status!=="completed"&&c.status!=="closed").length;
  const capOverdue = caps.filter((c:any)=>c.due_date&&new Date(c.due_date)<new Date()&&c.status!=="completed").length;
  const saqDone    = saqs.filter((s:any)=>s.status==="completed").length;
  const cTotal     = cmps.length;
  const cPublic    = cmps.filter((c:any)=>c.source==="public").length;
  const cOpen      = cmps.filter((c:any)=>c.status==="open").length;
  const cClosed    = cmps.filter((c:any)=>c.status==="closed"||c.status==="resolved").length;

  const score = calcComplianceScore({
    total, high: high.length, med: med.length, auditCount: auditN, cocCount: cocN,
    capsTotal: caps.length, capsDone: capDone, capsOverdue: capOverdue,
    saqsSent: saqs.length, saqsDone: saqDone, complaintsOpen: cOpen,
  });
  const grade = getGrade(score);

  // Get saved draft (or generate auto narrative)
  const rep = await getOrCreateReport(companyId, year, req.auth!.userId);
  const savedDraft = rep.rows[0]?.summary?.draft || {};
  const autoDraft  = autoNarrative(cname, year, sups, caps, saqs, cmps, portalUrl, score, grade);
  const d: ReportDraft = { ...autoDraft, ...savedDraft };

  // Sensitive combinations
  const sensitives = sups.filter((s:any) => getSensitiveExplanation(s.country, s.industry));

  // PDF layout constants
  const PAGE_W = 595.28, MARGIN = 52, COL = PAGE_W - MARGIN*2;
  const GREEN = "#1B3D2B", RED = "#DC2626", AMBER = "#D97706", BLUE = "#2563EB", GRAY = "#6B7280";
  const scoreColor = score >= 70 ? "#16A34A" : score >= 50 ? "#D97706" : "#DC2626";

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="BAFA_LkSG_${cname.replace(/[^a-zA-Z0-9]/g,"_")}_${year}.pdf"`);

  const doc = new PDFDocument({
    margin: MARGIN, size: "A4",
    info: { Title: `LkSG Jahresbericht ${year} - ${cname}`, Author: "LkSGCompass", Subject: "§10 LkSG" }
  });
  doc.pipe(res);

  // Helper: page break safe
  function safeY(needed = 60) {
    if (doc.y + needed > 750) { doc.addPage(); doc.rect(0,0,PAGE_W,4).fill(GREEN); doc.fillColor("#000"); doc.y = 24; }
  }

  // Helper: section header
  function sectionHeader(title: string, lksg: string) {
    doc.addPage();
    doc.rect(0,0,PAGE_W,6).fill(GREEN);
    doc.fillColor(GREEN).fontSize(16).font("Helvetica-Bold").text(title, MARGIN, 28);
    doc.roundedRect(PAGE_W-130, 24, 118, 16, 4).fill(GREEN);
    doc.fillColor("#fff").fontSize(8).font("Helvetica-Bold").text(lksg, PAGE_W-126, 29, { width: 110, align: "center" });
    doc.fillColor("#000").fontSize(11).font("Helvetica");
    doc.y = 62;
  }

  // Helper: table row
  function tableRow(cols: string[], widths: number[], isHeader = false) {
    safeY(18);
    const y = doc.y;
    if (isHeader) doc.rect(MARGIN, y, COL, 16).fill(GREEN);
    else if ((doc.y / 2) % 2 < 1) doc.rect(MARGIN, y, COL, 16).fill("#F8FAF8");
    let cx = MARGIN;
    cols.forEach((c, i) => {
      doc.fillColor(isHeader ? "#fff" : "#0D1110")
        .fontSize(isHeader ? 8 : 9)
        .font(isHeader ? "Helvetica-Bold" : "Helvetica")
        .text(c, cx+4, y+4, { width: widths[i]-8, ellipsis: true });
      cx += widths[i];
    });
    if (!isHeader) doc.moveTo(MARGIN, y+16).lineTo(MARGIN+COL, y+16).strokeColor("#E5E7E5").lineWidth(0.4).stroke();
    doc.fillColor("#000");
    doc.y = y + 16;
  }

  // Helper: KPI box
  function kpiBox(label: string, value: string, note: string, color: string = GREEN, warning?: string) {
    safeY(44);
    const y = doc.y;
    const h = warning ? 56 : 38;
    doc.roundedRect(MARGIN, y, COL, h, 6).fillAndStroke("#F8FAF8", "#E2E8E2");
    doc.rect(MARGIN, y, 5, h).fill(color);
    doc.fillColor("#374151").fontSize(9).font("Helvetica-Bold").text(label.toUpperCase(), MARGIN+14, y+7, { characterSpacing: 0.3 });
    doc.fillColor(color).fontSize(16).font("Helvetica-Bold").text(value, PAGE_W-165, y+8, { width: 105, align: "right" });
    doc.fillColor(GRAY).fontSize(8.5).font("Helvetica").text(note, MARGIN+14, y+21, { width: COL-125 });
    if (warning) {
      doc.fillColor(RED).fontSize(8).font("Helvetica-Bold").text("! " + warning, MARGIN+14, y+36, { width: COL-20 });
    }
    doc.fillColor("#000");
    doc.y = y + h + 6;
  }

  // ── COVER PAGE ────────────────────────────────────────────────────────────
  doc.rect(0, 0, PAGE_W, 160).fill(GREEN);
  doc.fillColor("#fff")
    .fontSize(8).font("Helvetica").text("LKSGCOMPASS -- COMPLIANCE PLATTFORM", MARGIN, 26, { characterSpacing: 1.5 })
    .fontSize(26).font("Helvetica-Bold").text("LkSG Jahresbericht", MARGIN, 46)
    .fontSize(13).font("Helvetica").text("Berichterstattung nach §10 Abs. 2 LkSG (BAFA)", MARGIN, 84)
    .fontSize(11).text(`Berichtsjahr: ${year}  |  Unternehmen: ${cname}`, MARGIN, 105)
    .fontSize(10).text(`Erstellt: ${new Date().toLocaleDateString("de-DE")} -- LkSGCompass Compliance Platform`, MARGIN, 124);

  // Score badge
  doc.roundedRect(PAGE_W-115, 26, 90, 90, 14).fill(scoreColor);
  doc.fillColor("#fff")
    .fontSize(30).font("Helvetica-Bold").text(String(score), PAGE_W-110, 44, { width: 80, align: "center" })
    .fontSize(9).font("Helvetica").text("Compliance Score", PAGE_W-110, 84, { width: 80, align: "center" })
    .fontSize(16).font("Helvetica-Bold").text(`Note ${grade}`, PAGE_W-110, 98, { width: 80, align: "center" });

  // KPI summary boxes
  const kpiData = [
    { l: "Lieferanten", v: String(total), s: `${high.length} hoch | ${med.length} mittel` },
    { l: "CAPs", v: `${capDone}/${caps.length}`, s: capOverdue > 0 ? `${capOverdue} ueberfaellig!` : `${capOpen} offen` },
    { l: "Beschwerden", v: String(cTotal), s: `${cClosed} geschlossen` },
    { l: "Audit / CoC", v: `${auditPct}% / ${cocPct}%`, s: "Abdeckung" },
  ];
  const bW = (COL - 12) / 4;
  kpiData.forEach((k, i) => {
    const bx = MARGIN + i*(bW+4), by = 178;
    doc.roundedRect(bx, by, bW, 68, 8).fillAndStroke("#F8FAF8", "#E2E8E2");
    doc.fillColor(GREEN).fontSize(18).font("Helvetica-Bold").text(k.v, bx+4, by+12, { width: bW-8, align: "center" });
    doc.fillColor("#374151").fontSize(8).font("Helvetica-Bold").text(k.l.toUpperCase(), bx+4, by+38, { width: bW-8, align: "center", characterSpacing: 0.3 });
    doc.fillColor(k.s.includes("!") ? RED : GRAY).fontSize(8.5).font("Helvetica").text(k.s, bx+4, by+52, { width: bW-8, align: "center" });
  });

  // Score breakdown (NEW - transparency for BAFA)
  const riskScore = Math.max(0, total>0 ? 100 - (high.length/total)*55 - (med.length/total)*20 : 100);
  const bdy = 268;
  doc.roundedRect(MARGIN, bdy, COL, 52, 6).fillAndStroke("#EDF7F0", "#C6E4CE");
  doc.fillColor(GREEN).fontSize(9).font("Helvetica-Bold").text("Score-Zusammensetzung (§9 LkSG Transparenz):", MARGIN+10, bdy+8);
  doc.fillColor("#374151").fontSize(8.5).font("Helvetica")
    .text(`Risikostruktur (55%): ${Math.round(riskScore)}/100  |  Audit-Abdeckung (11%): ${auditPct}%  |  CoC-Abdeckung (9%): ${cocPct}%`, MARGIN+10, bdy+22, { width: COL-20 })
    .text(`CAP-Abschluss (14%): ${caps.length>0?Math.round(capDone/caps.length*100):100}%  |  SAQ-Ruecklauf (4%): ${saqs.length>0?Math.round(saqDone/saqs.length*100):0}%  |  Offene Beschwerden (7%): ${cOpen}`, MARGIN+10, bdy+34, { width: COL-20 });

  // Gaps warning (if any)
  const gaps: string[] = [];
  if (auditPct < 60) gaps.push(`Audit-Abdeckung ${auditPct}% (Ziel: 60%)`);
  if (cocPct   < 70) gaps.push(`CoC-Abdeckung ${cocPct}% (Ziel: 70%)`);
  if (capOverdue > 0) gaps.push(`${capOverdue} ueberfaellige CAP(s)`);
  if (cOpen > 0)     gaps.push(`${cOpen} offene Beschwerde(n)`);
  if (saqs.length === 0 && (high.length+med.length) > 0) gaps.push("Kein SAQ fuer Hoch-/Mittelrisiko");

  if (gaps.length > 0) {
    doc.y = bdy + 60;
    doc.roundedRect(MARGIN, doc.y, COL, 14 + gaps.length*12, 6).fillAndStroke("#FEF2F2", "#FECACA");
    doc.fillColor(RED).fontSize(9).font("Helvetica-Bold").text("Handlungsbedarf vor BAFA-Einreichung:", MARGIN+10, doc.y+6);
    gaps.forEach((g, i) => {
      doc.fillColor("#7F1D1D").fontSize(8.5).font("Helvetica").text(`- ${g}`, MARGIN+10, doc.y + 18 + i*12);
    });
  }

  // Disclaimer
  safeY(50);
  doc.y = Math.max(doc.y, bdy + 60 + (gaps.length > 0 ? 14 + gaps.length*12 + 10 : 0));
  doc.roundedRect(MARGIN, doc.y, COL, 32, 6).fillAndStroke("#FEF9C3", "#FDE68A");
  doc.fillColor("#92400E").fontSize(9).font("Helvetica")
    .text("Hinweis: Generator-Output von LkSGCompass. Pflichtfelder mit [Pflichtfeld] vor BAFA-Einreichung durch Compliance/Legal ausfuellen und pruefen.", MARGIN+8, doc.y+8, { width: COL-16 });

  // ── SECTION 1 ─────────────────────────────────────────────────────────────
  sectionHeader("1. Unternehmensstruktur und Verantwortung", "§10 Abs.1, §4 Abs.3 LkSG");
  doc.fontSize(11).font("Helvetica").text(d.reporting_scope); doc.moveDown(0.5);
  doc.fontSize(12).font("Helvetica-Bold").text("1.1 Organisationsstruktur"); doc.moveDown(0.2);
  doc.fontSize(11).font("Helvetica").text(d.organization_structure); doc.moveDown(0.5);
  doc.fontSize(12).font("Helvetica-Bold").text("1.2 Verantwortliche Personen (§4 Abs.3 LkSG)"); doc.moveDown(0.2);
  doc.fontSize(11).font("Helvetica").text(d.responsible_persons);

  // ── SECTION 2 ─────────────────────────────────────────────────────────────
  sectionHeader("2. Risikoanalyse und Methodik", "§5 LkSG");
  doc.fontSize(11).font("Helvetica").text(d.risk_methodology); doc.moveDown(0.6);
  doc.fontSize(12).font("Helvetica-Bold").text("2.1 Ergebnisse (§5 Abs.2 LkSG)"); doc.moveDown(0.3);
  kpiBox("Gesamtportfolio", `${total} Lieferanten`, `${new Set(sups.map((s:any)=>s.country)).size} Laender, ${new Set(sups.map((s:any)=>s.industry)).size} Branchen`, GREEN);
  kpiBox("Hochrisiko -- Massnahmen §7 LkSG erforderlich", `${high.length}`, `${total>0?Math.round(high.length/total*100):0}% des Portfolios`, high.length > 0 ? RED : "#16A34A", high.length > 0 ? "Fuer jeden Hochrisiko-Lieferanten ist ein CAP zu erstellen (§7 LkSG)" : undefined);
  kpiBox("Mittelrisiko -- Praevention §4 LkSG", `${med.length}`, `${total>0?Math.round(med.length/total*100):0}% des Portfolios`, AMBER);

  // Sensitive combinations warning
  if (sensitives.length > 0) {
    safeY(60);
    doc.moveDown(0.4);
    doc.roundedRect(MARGIN, doc.y, COL, 22 + sensitives.length * 28, 6).fillAndStroke("#FFFBEB", "#FDE68A");
    doc.fillColor(AMBER).fontSize(10).font("Helvetica-Bold")
      .text("Erlaeuterung risikorelevanter Laender-Branchen-Kombinationen (BAFA-Anforderung):", MARGIN+10, doc.y+8);
    sensitives.forEach((s:any, i:number) => {
      const exp = getSensitiveExplanation(s.country, s.industry);
      doc.fillColor("#78350F").fontSize(8.5).font("Helvetica-Bold").text(`${s.name} (${s.country}, ${s.industry}, ${s.risk_level.toUpperCase()}):`, MARGIN+10, doc.y + 22 + i*28);
      doc.fillColor("#92400E").font("Helvetica").text(exp || "", MARGIN+10, doc.y + 22 + i*28 + 11, { width: COL-20 });
    });
    doc.y = doc.y + 22 + sensitives.length * 28 + 8;
  }

  doc.moveDown(0.4);
  doc.fontSize(11).font("Helvetica").text(d.prioritized_risks);

  doc.moveDown(0.6);
  doc.fontSize(12).font("Helvetica-Bold").text("2.2 Praventionsmassnahmen (§4 LkSG)"); doc.moveDown(0.3);
  kpiBox("Audit-Abdeckung", `${auditPct}%`, `${auditN} von ${total} Lieferanten auditiert`,
    auditPct >= 60 ? "#16A34A" : auditPct >= 30 ? AMBER : RED,
    auditPct < 60 ? `Ziel: 60% -- ${Math.ceil(total*0.6)-auditN} weitere Audits erforderlich` : undefined);
  kpiBox("Code-of-Conduct-Abdeckung", `${cocPct}%`, `${cocN} von ${total} Lieferanten mit CoC`,
    cocPct >= 70 ? "#16A34A" : cocPct >= 40 ? AMBER : RED,
    cocPct < 70 ? `Ziel: 70% -- ${Math.ceil(total*0.7)-cocN} weitere CoC-Unterzeichnungen erforderlich` : undefined);
  kpiBox("SAQ (Selbstauskunft)", `${saqs.length>0?Math.round(saqDone/saqs.length*100):0}%`,
    `${saqDone} von ${saqs.length} zurueckgekehrt`,
    saqs.length === 0 ? RED : saqDone/saqs.length >= 0.6 ? "#16A34A" : AMBER,
    saqs.length === 0 && (high.length+med.length) > 0 ? "SAQ-Prozess nicht gestartet -- fuer §5 LkSG erforderlich" : undefined);
  doc.fontSize(11).font("Helvetica").moveDown(0.3).text(d.prevention_measures);

  // ── SECTION 3 ─────────────────────────────────────────────────────────────
  sectionHeader("3. Abhilfemassnahmen -- Corrective Action Plans", "§7 LkSG");
  kpiBox("CAPs gesamt", String(caps.length), `${capDone} abgeschlossen | ${capOpen} offen`, GREEN);
  kpiBox("Abschlussrate", `${caps.length>0?Math.round(capDone/caps.length*100):0}%`,
    "Zielwert: 80% fuer §9 LkSG Wirksamkeitsnachweis",
    caps.length===0||capDone/caps.length>=0.8 ? "#16A34A" : AMBER);

  if (capOverdue > 0) {
    safeY(40);
    doc.roundedRect(MARGIN, doc.y, COL, 38, 6).fillAndStroke("#FEF2F2", "#FECACA");
    doc.fillColor(RED).fontSize(10).font("Helvetica-Bold")
      .text(`! ${capOverdue} ueberfaellige CAP(s) -- §7 Abs.4 LkSG Handlungspflicht`, MARGIN+10, doc.y+8);
    doc.fillColor("#7F1D1D").fontSize(8.5).font("Helvetica")
      .text("Gemaess §7 Abs.4 LkSG muss bei anhaltender Nichtumsetzung geprueft werden, ob die Geschaeftsbeziehung auszusetzen oder zu beenden ist. Begruendung fuer Verzoegerung ist dokumentationspflichtig.", MARGIN+10, doc.y+22, { width: COL-20 });
    doc.y += 46;
  }

  doc.fontSize(11).font("Helvetica").moveDown(0.3).text(d.remediation_measures);

  // CAP table
  if (caps.length > 0) {
    doc.moveDown(0.4);
    tableRow(["Titel","Prioritaet","Status","Faellig"], [230,80,100,81], true);
    caps.forEach((c:any) => tableRow([
      c.title || "CAP",
      c.priority || "-",
      c.status + (c.due_date && new Date(c.due_date)<new Date() && c.status!=="completed" ? " (!)" : ""),
      c.due_date ? new Date(c.due_date).toLocaleDateString("de-DE") : "-"
    ], [230,80,100,81]));
  }

  // ── SECTION 4 ─────────────────────────────────────────────────────────────
  sectionHeader("4. Beschwerdeverfahren", "§8 LkSG");
  kpiBox("Beschwerden gesamt", String(cTotal), `${cPublic} extern (Portal) | ${cTotal-cPublic} intern`, BLUE);
  kpiBox("Bearbeitet/Geschlossen", String(cClosed),
    `${cTotal>0?Math.round(cClosed/cTotal*100):0}% Abschlussrate`,
    cOpen === 0 ? "#16A34A" : AMBER,
    cOpen > 0 ? `${cOpen} offene Beschwerde(n) -- Bearbeitung ausstehend` : undefined);

  // Category breakdown
  if (cmps.length > 0) {
    const byCat: Record<string,number> = {};
    cmps.forEach((c:any) => { byCat[c.category] = (byCat[c.category]||0)+1; });
    doc.moveDown(0.4);
    doc.fontSize(10).font("Helvetica-Bold").text("Beschwerden nach Kategorie:");
    doc.moveDown(0.2);
    tableRow(["Kategorie","Anzahl"], [350,141], true);
    Object.entries(byCat).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => tableRow([k, String(v)], [350,141]));
  }

  doc.moveDown(0.4);
  doc.fontSize(11).font("Helvetica").text(d.complaints_procedure); doc.moveDown(0.3);
  doc.text("Zugangsberechtigt: " + d.complaints_access_groups);
  doc.moveDown(0.2);
  doc.fillColor(BLUE).text("Oeffentliches Portal: " + portalUrl, { link: portalUrl, underline: true });
  doc.fillColor("#000");

  // ── SECTION 5 ─────────────────────────────────────────────────────────────
  sectionHeader("5. Wirksamkeitskontrolle", "§9 LkSG");
  const kpiMets = [
    { k: "CAP-Abschlussrate",  v: `${caps.length>0?Math.round(capDone/caps.length*100):0}%`, target: "80%",   ok: caps.length===0||capDone/caps.length>=0.8 },
    { k: "Audit-Abdeckung",    v: `${auditPct}%`,  target: "60%",   ok: auditPct>=60 },
    { k: "CoC-Abdeckung",      v: `${cocPct}%`,    target: "70%",   ok: cocPct>=70 },
    { k: "Compliance Score",   v: `${score}/100`,   target: "70+",   ok: score>=70 },
    { k: "SAQ-Ruecklauf",      v: `${saqs.length>0?Math.round(saqDone/saqs.length*100):0}%`, target: "60%", ok: saqs.length===0&&high.length+med.length===0||saqs.length>0&&saqDone/saqs.length>=0.6 },
    { k: "Offene Beschwerden", v: String(cOpen),    target: "0",     ok: cOpen===0 },
  ];
  tableRow(["KPI","Ist-Wert","Ziel","Status"], [200,120,120,51], true);
  kpiMets.forEach(m => {
    tableRow([m.k, m.v, m.target, m.ok ? "OK" : "Luecke"], [200,120,120,51]);
  });
  doc.moveDown(0.5);
  doc.fontSize(11).font("Helvetica").text(d.effectiveness_review);

  // ── ANNEX A: Suppliers ────────────────────────────────────────────────────
  doc.addPage();
  doc.rect(0,0,PAGE_W,6).fill(GREEN);
  doc.fillColor(GREEN).fontSize(14).font("Helvetica-Bold").text("Anhang A: Lieferantenverzeichnis", MARGIN, 20);
  doc.fillColor(GRAY).fontSize(9).font("Helvetica").text(`Gesamt: ${total} | Erstellt: ${new Date().toLocaleDateString("de-DE")}`, MARGIN, 38);
  doc.fillColor("#000"); doc.y = 54;
  tableRow(["#","Name","Land","Branche","Risiko","Score","Audit","CoC"], [22,150,75,85,50,40,36,33], true);
  sups.forEach((s:any, i:number) => tableRow([
    String(i+1), s.name, s.country, s.industry, s.risk_level.toUpperCase(), String(s.risk_score),
    s.has_audit ? "Ja" : "Nein", s.has_code_of_conduct ? "Ja" : "Nein"
  ], [22,150,75,85,50,40,36,33]));

  doc.end();
});

export default router;


// GET /reports/approvals
router.get("/approvals", requireAuth, async (req, res) => {
  const companyId = req.auth!.companyId;
  const r = await db.query(
    `SELECT id, entity_type, entity_id, requested_by, status, approval_notes, sla_days, due_at, requested_at, reviewed_at, reviewed_by
     FROM approval_requests WHERE company_id=$1 ORDER BY requested_at DESC LIMIT 100`,
    [companyId]
  );
  res.json(r.rows);
});

// POST /reports/bafa/:year/request-approval
router.post("/bafa/:year/request-approval", requireAuth, requireWriteAccess, async (req, res) => {
  const year = requireInt(req.params.year, "year");
  const companyId = req.auth!.companyId;
  const userId = req.auth!.userId;
  const email = req.auth!.email || null;
  const notes = String(req.body?.notes || "").trim();

  await getOrCreateReport(companyId, year, userId);
  const reportRes = await db.query("SELECT id, status FROM reports WHERE company_id=$1 AND year=$2", [companyId, year]);
  const report = reportRes.rows[0];
  if (!report) return res.status(404).json({ error: "Report not found" });

  await db.query(
    `INSERT INTO approval_requests(company_id, entity_type, entity_id, requested_by, requested_by_user_id, status, approval_notes, sla_days, due_at, requested_at, updated_at)
     VALUES($1,'report',$2,$3,$4,'pending',$5,5,now() + interval '5 days',now(),now())
     ON CONFLICT DO NOTHING`,
    [companyId, report.id, email, userId, notes || null]
  ).catch(async () => {
    await db.query(
      `UPDATE approval_requests SET status='pending', approval_notes=$1, requested_by=$2, requested_by_user_id=$3, sla_days=5, due_at=now() + interval '5 days', requested_at=now(), updated_at=now(), reviewed_at=NULL, reviewed_by=NULL
       WHERE company_id=$4 AND entity_type='report' AND entity_id=$5`,
      [notes || null, email, userId, companyId, report.id]
    );
  });

  await db.query("UPDATE reports SET status='in_review', updated_at=now() WHERE id=$1", [report.id]);
  await logApprovalEvent(companyId, email || undefined, 'approval_requested', 'report', report.id, `BAFA ${year}`, { year, status: 'in_review', notes });
  res.json({ ok: true, reportId: report.id, status: 'in_review' });
});

// POST /reports/bafa/:year/approve
router.post("/bafa/:year/approve", requireAuth, requireApprovalAccess, async (req, res) => {
  const year = requireInt(req.params.year, "year");
  const companyId = req.auth!.companyId;
  const email = req.auth!.email || null;
  const decision = String(req.body?.decision || 'approved').toLowerCase();
  const notes = String(req.body?.notes || '').trim();
  if (!['approved','rejected'].includes(decision)) return res.status(400).json({ error: 'decision must be approved or rejected' });

  const reportRes = await db.query("SELECT id FROM reports WHERE company_id=$1 AND year=$2", [companyId, year]);
  const report = reportRes.rows[0];
  if (!report) return res.status(404).json({ error: 'Report not found' });

  await db.query(
    `UPDATE approval_requests
     SET status=$1, approval_notes=$2, reviewed_at=now(), reviewed_by=$3, updated_at=now()
     WHERE company_id=$4 AND entity_type='report' AND entity_id=$5`,
    [decision, notes || null, email, companyId, report.id]
  );

  const nextStatus = decision === 'approved' ? 'approved' : 'draft';
  await db.query(
    `UPDATE reports
     SET status=$1,
         submitted_at=CASE WHEN $1='approved' THEN COALESCE(submitted_at, now()) ELSE submitted_at END,
         updated_at=now()
     WHERE id=$2`,
    [nextStatus, report.id]
  );

  await logApprovalEvent(companyId, email || undefined, decision === 'approved' ? 'approval_approved' : 'approval_rejected', 'report', report.id, `BAFA ${year}`, { year, status: nextStatus, notes });
  res.json({ ok: true, reportId: report.id, status: nextStatus });
});
