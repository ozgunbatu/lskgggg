import type { Lang, RL, Supplier, Action, Complaint, SAQ } from "./workspace-types";

export const COUNTRIES = ["Afghanistan","Argentina","Australia","Austria","Bangladesh","Belgium","Bolivia","Brazil","Cambodia","Canada","Chile","China","Colombia","Czech Republic","DR Congo","Denmark","Ethiopia","Finland","France","Germany","Greece","Hungary","India","Indonesia","Ireland","Italy","Japan","Kenya","Malaysia","Mexico","Morocco","Myanmar","Netherlands","Nigeria","Norway","Pakistan","Peru","Philippines","Poland","Portugal","Romania","Russia","Saudi Arabia","South Africa","Spain","Sri Lanka","Sudan","Sweden","Switzerland","Thailand","Turkey","UAE","UK","USA","Uzbekistan","Vietnam","Yemen"];
export const INDUSTRIES = ["agriculture","automotive","chemicals","construction","electronics","energy","food","it","logistics","machinery","metals","mining","pharmaceuticals","retail","services","textile"];
export const RC: Record<string, string> = { high: "#DC2626", medium: "#D97706", low: "#16A34A", unknown: "#6B7280" };

export const COMPLAINT_CATS = [
  { v: "human_rights",   de: "Menschenrechtsverletzung (§2 Abs. 1 LkSG)", en: "Human rights violation (§2 para. 1)" },
  { v: "child_labor",    de: "Kinderarbeit (§2 Abs. 2 Nr. 1-3 LkSG)",     en: "Child labour (§2 para. 2 no. 1-3)"  },
  { v: "forced_labor",   de: "Zwangsarbeit (§2 Abs. 2 Nr. 4-5 LkSG)",     en: "Forced labour (§2 para. 2 no. 4-5)" },
  { v: "discrimination", de: "Diskriminierung (§2 Abs. 2 Nr. 6 LkSG)",     en: "Discrimination (§2 para. 2 no. 6)"  },
  { v: "environment",    de: "Umweltverstoss (§2 Abs. 3 LkSG)",            en: "Environmental violation (§2 para. 3)"},
  { v: "safety",         de: "Arbeitsschutz (§2 Abs. 2 Nr. 5 LkSG)",       en: "Occupational safety (§2 para. 2 no. 5)"},
  { v: "corruption",     de: "Unlaute Geschäftspraktiken / Korruption (§2 Abs.2 Nr.10 + §2 Abs.1)",         en: "Corruption (§2 para. 2 no. 10)"    },
  { v: "other",          de: "Sonstiger Verstoss",                           en: "Other violation"                   },
];

export const BAFA_DE = [
  { key: "organization_structure", lbl: "1. Unternehmensstruktur (§10 Abs. 1 LkSG)", ph: "Unternehmensstruktur und organisatorische Verankerung des Risikomanagements, Benennung der verantwortlichen Person.", rows: 4 },
  { key: "responsible_persons",    lbl: "1b. Verantwortliche Personen (§4 Abs. 3 LkSG)", ph: "Menschenrechtsbeauftragte/r, Compliance-Officer, Kontaktdaten.", rows: 3 },
  { key: "risk_methodology",       lbl: "2. Risikoanalyse -- Methodik (§5 LkSG)", ph: "Verfahren, Datenquellen, Kriterien. Mindestens jahrlich und anlassbezogen.", rows: 4 },
  { key: "prioritized_risks",      lbl: "2b. Priorisierte Risiken (§5 Abs. 2 LkSG)", ph: "Eigener Bereich, unmittelbare und mittelbare Zulieferer. Gewichtungskriterien.", rows: 4 },
  { key: "prevention_measures",    lbl: "3. Praventionsmassnahmen (§4 LkSG)", ph: "Code of Conduct, SAQs, Lieferanten-Audits, Mitarbeiter-Trainings, Vertragsklauseln.", rows: 5 },
  { key: "remediation_measures",   lbl: "4. Abhilfemassnahmen (§7 LkSG)", ph: "Corrective Action Plans, Zeitplane, Zustandigkeiten, Wirksamkeitsprufung.", rows: 4 },
  { key: "complaints_procedure",   lbl: "5. Beschwerdeverfahren (§8 LkSG)", ph: "Einreichungsform, Zugang, Anonymitatsschutz, Benachteiligungsschutz, Bearbeitungsfristen.", rows: 4 },
  { key: "effectiveness_review",   lbl: "6. Wirksamkeitskontrolle (§9 LkSG)", ph: "KPIs, jahrliche Reviews, Audit-Befunde, Verbesserungsmassnahmen, Berichterstattung.", rows: 4 },
];
export const BAFA_EN = [
  { key: "organization_structure", lbl: "1. Corporate structure (§10 para. 1 LkSG)", ph: "Corporate structure and embedding of risk management, designation of responsible person.", rows: 4 },
  { key: "responsible_persons",    lbl: "1b. Responsible persons (§4 para. 3 LkSG)", ph: "Human rights officer, compliance officer, contact details.", rows: 3 },
  { key: "risk_methodology",       lbl: "2. Risk analysis -- Methodology (§5 LkSG)", ph: "Procedures, data sources, criteria. At least annual and event-based.", rows: 4 },
  { key: "prioritized_risks",      lbl: "2b. Prioritised risks (§5 para. 2 LkSG)", ph: "Own operations, direct and indirect suppliers. Weighting criteria.", rows: 4 },
  { key: "prevention_measures",    lbl: "3. Prevention measures (§4 LkSG)", ph: "Code of Conduct, SAQs, supplier audits, employee training, contract clauses.", rows: 5 },
  { key: "remediation_measures",   lbl: "4. Remediation measures (§7 LkSG)", ph: "Corrective action plans, timelines, responsibilities, effectiveness review.", rows: 4 },
  { key: "complaints_procedure",   lbl: "5. Complaints procedure (§8 LkSG)", ph: "Submission form, access, anonymity, protection against retaliation, processing deadlines.", rows: 4 },
  { key: "effectiveness_review",   lbl: "6. Effectiveness review (§9 LkSG)", ph: "KPIs, annual reviews, audit findings, improvement measures, reporting.", rows: 4 },
];

// ── Risk Scoring ───────────────────────────────────────────────────────────────
/**
 * Frontend compliance score - matches backend kpi.ts formula exactly.
 * riskScore(55%) + processScore(45%)
 * processScore = audit(25%) + coc(20%) + capCompletion(30%) + saq(10%) + complaints(15%)
 */
export function calcPortfolioScore(
  s: Supplier[],
  actions: Action[] = [],
  complaints: Complaint[] = [],
  saqs: SAQ[] = []
) {
  const n = s.length;
  if (!n) return { score: 100, grade: "A", riskScore: 100, processScore: 100 };

  const h = s.filter(x => x.risk_level === "high").length;
  const m = s.filter(x => x.risk_level === "medium").length;

  // Risk component (same as backend)
  const riskScore = Math.max(0, 100 - (h / n) * 55 - (m / n) * 20);

  // Process components
  const auditCount = s.filter(x => x.has_audit).length;
  const cocCount   = s.filter(x => x.has_code_of_conduct).length;
  const auditCov   = (auditCount / n) * 100;
  const cocCov     = (cocCount   / n) * 100;

  const capsDone    = actions.filter(a => a.status === "completed").length;
  const capsOverdue = actions.filter(a => a.due_date && new Date(a.due_date) < new Date() && a.status !== "completed").length;
  const capRate     = actions.length > 0 ? (capsDone / actions.length) * 100 : 100;

  const saqsDone = saqs.filter(q => q.status === "completed").length;
  const saqRate  = saqs.length > 0 ? (saqsDone / saqs.length) * 100 : ((h + m) > 0 ? 0 : 50);

  const cmpOpen  = complaints.filter(c => c.status === "open").length;
  const cmpScore = cmpOpen === 0 ? 100 : Math.max(0, 100 - cmpOpen * 15);

  const overduePenalty = Math.min(50, capsOverdue * 8);
  const processScore = Math.max(0,
    auditCov * 0.25 + cocCov * 0.20 + capRate * 0.30 + saqRate * 0.10 + cmpScore * 0.15 - overduePenalty
  );

  const score = Math.max(0, Math.min(100, Math.round(riskScore * 0.55 + processScore * 0.45)));
  const grade = score >= 85 ? "A" : score >= 70 ? "B" : score >= 50 ? "C" : score >= 30 ? "D" : "F";
  return { score, grade, riskScore: Math.round(riskScore), processScore: Math.round(processScore) };
}
export function gradeColor(g: string) { return g === "A" || g === "B" ? "#16A34A" : g === "C" ? "#D97706" : "#DC2626"; }
export function gradeLabel(g: string, L: Lang) {
  return ({ A: { de: "Sehr gut", en: "Excellent" }, B: { de: "Gut", en: "Good" }, C: { de: "Ausreichend", en: "Adequate" }, D: { de: "Mangelhaft", en: "Poor" }, F: { de: "Kritisch", en: "Critical" } } as any)[g]?.[L] || g;
}
export function rl(l: RL, L: Lang) {
  return ({ high: { de: "Hoch", en: "High" }, medium: { de: "Mittel", en: "Medium" }, low: { de: "Niedrig", en: "Low" }, unknown: { de: "Unbewertet", en: "Unknown" } } as any)[l][L];
}
export function daysDiff(date: string | null): number | null {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}
export function priorityColor(p: string) { return p === "critical" || p === "high" ? "#DC2626" : p === "medium" ? "#2563EB" : "#6B7280"; }

// ── Param Group Metadata ───────────────────────────────────────────────────────
// Parameter groups with verified LkSG paragraph mappings
// Verified against LkSG §§1-10 (BGBl. I 2021 Nr. 46)
export const PARAM_META: Record<string, { de: string; en: string; lksg: string; guidance_de: string; guidance_en: string }> = {
  // A. Länderrisiko (Gewicht: 35%) — §5 Abs.2 LkSG: Länderspezifische Risikofaktoren
  a1: { de: "Allg. Menschenrechtslage",  en: "General human rights",    lksg: "§2 Abs.1 + §5 Abs.2", guidance_de: "Freedom House / UN-Menschenrechtsindex des Landes. Hohe Werte = staatliche Repression oder mangelnder Rechtsschutz.", guidance_en: "Freedom House / UN Human Rights Index for the country. High = state repression or lack of legal protection." },
  a2: { de: "Kinderarbeitsrisiko",        en: "Child labour risk",       lksg: "§2 Abs.2 Nr.1–3",     guidance_de: "ILO-Daten zu Kinderarbeit < 15 J. und gefährl. Arbeit < 18 J. im Lieferland.", guidance_en: "ILO data on child labour <15y and hazardous work <18y in supplier country." },
  a3: { de: "Zwangsarbeitsrisiko",        en: "Forced labour risk",      lksg: "§2 Abs.2 Nr.4–5",     guidance_de: "Staatlich tolerierte Zwangsarbeit, Schuldknechtschaft, Menschenhandel im Land (ILO, US DoL).", guidance_en: "State-tolerated forced labour, debt bondage, human trafficking (ILO, US DoL)." },
  a4: { de: "Gewerkschaftsfreiheit",      en: "Union freedom",           lksg: "§2 Abs.2 Nr.8–9",     guidance_de: "ITUC Global Rights Index: Recht auf Vereinigungsfreiheit und Kollektivverhandlungen.", guidance_en: "ITUC Global Rights Index: right to freedom of association and collective bargaining." },
  a5: { de: "Rechtsstaatlichkeit",        en: "Rule of law",             lksg: "§5 Abs.2 Satz 2",     guidance_de: "World Bank Rule of Law Index. Schwache Rechtsstaatlichkeit = höheres LkSG-Risiko durch fehlende Kontrolle.", guidance_en: "World Bank Rule of Law Index. Weak rule of law = higher LkSG risk due to lack of enforcement." },
  a6: { de: "Unlauter. Geschäftspraktiken", en: "Unfair business practices", lksg: "§2 Abs.2 Nr.10 + CPI", guidance_de: "§2 Nr.10 LkSG verbietet unfaire Lohnpraktiken (ILO Declaration Art.2c). TI CPI wird MITTELBAR genutzt: hohe Korruption erhöht Risiko für Lohnverstöße und mangelnde Rechtsdurchsetzung.", guidance_en: "§2 no.10 LkSG prohibits unfair wage practices (ILO Declaration Art.2c). TI CPI is used INDIRECTLY: high corruption increases risk of wage violations and weak enforcement." },
  // B. Branchenrisiko (Gewicht: 25%) — §5 Abs.2 LkSG: Branchenspezifische Risiken
  b1: { de: "Hochrisikobranche",          en: "High-risk sector",        lksg: "§5 Abs.2 Nr.1",       guidance_de: "BAFA-definierte Hochrisikobranchen: Textil, Bergbau, Landwirtschaft, Elektronik-Rohstoffe.", guidance_en: "BAFA-defined high-risk sectors: textile, mining, agriculture, electronics raw materials." },
  b2: { de: "Rohstoff-Exposition",        en: "Raw material intensity",  lksg: "§2 Abs.2 Nr.11 + §2 Abs.3", guidance_de: "Rohstoffgewinnung = Risiko für Verstöße gegen Minamata, POPs, Basel-Konvention (§2 Nr.11) und Umweltzerstörung (§2 Abs.3).", guidance_en: "Raw material extraction = risk of Minamata, POPs, Basel Convention violations (§2 no.11) and environmental destruction (§2 para.3)." },
  b3: { de: "Arbeitsintensität",          en: "Labour intensity",        lksg: "§2 Abs.2 Nr.1–7",     guidance_de: "Arbeitsintensive Sektoren haben höheres Risiko für Lohn-, Kinderarbeits- und Zwangsarbeitsverstöße.", guidance_en: "Labour-intensive sectors have higher risk of wage, child labour and forced labour violations." },
  b4: { de: "Lieferkettentiefe",          en: "Supply chain depth",      lksg: "§5 Abs.2",             guidance_de: "Anzahl Unterlieferanten. Hohe Tiefe = schwierigere Kontrolle = höheres Risiko (§5 Abs.2 indirekte Zulieferer).", guidance_en: "Number of sub-suppliers. High depth = harder to monitor = higher risk (§5 para.2 indirect suppliers)." },
  b5: { de: "Branchenhistorie",           en: "Sector incidents",        lksg: "§6 Abs.5",             guidance_de: "Bekannte Verstöße in dieser Branche laut ILO, NGO-Berichten. Basis für anlassbezogene Analyse (§6 Abs.5).", guidance_en: "Known violations in this sector per ILO, NGO reports. Basis for event-based analysis (§6 para.5)." },
  // C. Unternehmensprofil (Gewicht: 25%) — §4 LkSG: Präventionsmaßnahmen
  c1: { de: "Unternehmensgröße",          en: "Company size",            lksg: "§1 Abs.1 + §4",       guidance_de: "Größere Unternehmen = mehr Arbeitnehmer exponiert = höherer Sorgfaltspflicht-Maßstab nach §4.", guidance_en: "Larger companies = more workers exposed = higher due diligence standard under §4." },
  c2: { de: "Zertifizierungen",           en: "Certifications",          lksg: "§4 Abs.1",             guidance_de: "ISO 26000, SA8000, SMETA, BSCI etc. reduzieren Restrisiko als Präventionsmaßnahme (§4 Abs.1).", guidance_en: "ISO 26000, SA8000, SMETA, BSCI etc. reduce residual risk as prevention measures (§4 para.1)." },
  c3: { de: "Auditierung",                en: "Audit status",            lksg: "§4 Abs.1 + §6",       guidance_de: "Regelmäßige Audits = BAFA-anerkannte Präventionsmaßnahme. Ohne Audit = erhöhtes Restrisiko.", guidance_en: "Regular audits = BAFA-recognised prevention measure. No audit = elevated residual risk." },
  c4: { de: "Transparenz",                en: "Transparency",            lksg: "§5 Abs.2",             guidance_de: "Bereitschaft zur Offenlegung von Daten, Audits und Unterlieferanten. Basis für Risikoanalyse (§5).", guidance_en: "Willingness to disclose data, audits and sub-suppliers. Basis for risk analysis (§5)." },
  c5: { de: "Verhaltenskodex (CoC)",      en: "Code of Conduct",         lksg: "§4 Abs.1 Satz 2",     guidance_de: "Unterzeichneter CoC = vertragliche Sorgfaltspflicht-Verpflichtung. BAFA-Pflichtnachweis.", guidance_en: "Signed CoC = contractual due diligence commitment. Mandatory BAFA evidence." },
  // D. Vorfälle & Verhalten (Gewicht: 15%) — §§7–8 LkSG: Abhilfe & Beschwerden
  d1: { de: "Beschwerde-Historie",        en: "Complaint history",       lksg: "§8 LkSG",             guidance_de: "Frühere Beschwerden über diesen Lieferanten im System. Jede Beschwerde erhöht den Risikoscore.", guidance_en: "Previous complaints about this supplier in the system. Each complaint increases risk score." },
  d2: { de: "Medien-/NGO-Berichte",       en: "Media/NGO reports",       lksg: "§6 Abs.5",             guidance_de: "Monitoring-Ergebnisse aus Nachrichtenquellen und NGO-Berichten. Anlassbezogene Analyse.", guidance_en: "Monitoring results from news sources and NGO reports. Event-based analysis trigger." },
  d3: { de: "Frühere Verstöße",           en: "Previous violations",     lksg: "§7 LkSG",             guidance_de: "Dokumentierte Verstöße in der Vergangenheit. BAFA erwartet CAPs für alle bekannten Verstöße.", guidance_en: "Documented past violations. BAFA expects CAPs for all known violations." },
  d4: { de: "Kooperation",                en: "Cooperation level",       lksg: "§7 Abs.1",             guidance_de: "Bereitschaft zur Zusammenarbeit bei Abhilfemaßnahmen. Mangelnde Kooperation → Geschäftsbeziehung prüfen (§7 Abs.4).", guidance_en: "Willingness to cooperate on remediation. Lack of cooperation → review business relationship (§7 para.4)." },
};

export const PARAM_GROUPS_DE = [
  { label: "A. Länderrisiko", weight: "35%", keys: ["a1","a2","a3","a4","a5","a6"], color: "#1B3D2B", lksg: "§5 Abs.2" },
  { label: "B. Branchenrisiko", weight: "25%", keys: ["b1","b2","b3","b4","b5"],   color: "#2563EB", lksg: "§5 Abs.2" },
  { label: "C. Unternehmens-Profil", weight: "25%", keys: ["c1","c2","c3","c4","c5"], color: "#7C3AED", lksg: "§4 LkSG" },
  { label: "D. Vorfälle & Verhalten", weight: "15%", keys: ["d1","d2","d3","d4"],    color: "#DC2626", lksg: "§§7–8 LkSG" },
];
export const PARAM_GROUPS_EN = [
  { label: "A. Country Risk",    weight: "35%", keys: ["a1","a2","a3","a4","a5","a6"], color: "#1B3D2B", lksg: "§5 para.2" },
  { label: "B. Industry Risk",   weight: "25%", keys: ["b1","b2","b3","b4","b5"],      color: "#2563EB", lksg: "§5 para.2" },
  { label: "C. Company Profile", weight: "25%", keys: ["c1","c2","c3","c4","c5"],      color: "#7C3AED", lksg: "§4 LkSG" },
  { label: "D. Incidents",       weight: "15%", keys: ["d1","d2","d3","d4"],           color: "#DC2626", lksg: "§§7–8 LkSG" },
];


export function getBafaSections(L: Lang) {
  return L === "de" ? BAFA_DE : BAFA_EN;
}

export function getParamGroups(L: Lang) {
  return L === "de" ? PARAM_GROUPS_DE : PARAM_GROUPS_EN;
}
