/**
 * LkSGCompass Risk Engine -- 20-Parameter Static Scoring
 * 
 * §5 LkSG: Risk analysis must be objective, documented, repeatable.
 * Each parameter is 0-5, weighted sum normalized to 0-100.
 * 
 * Risk levels:
 *   0-39  = low    (monitoring sufficient)
 *   40-69 = medium (§4 preventive measures)
 *   70-100= high   (§7 CAP mandatory)
 */

export type RiskLevel = "low" | "medium" | "high" | "unknown";

export interface RiskInput {
  country: string;
  industry: string;
  annual_spend_eur?: number;
  workers?: number;
  has_audit?: boolean;
  has_code_of_conduct?: boolean;
  pays_minimum_wage?: boolean;
  certification_count?: number;
  complaint_count?: number;
  previous_violations?: boolean;
  sub_supplier_count?: number;
  transparency_score?: number; // 1-5 if known
}

export interface RiskResult {
  score: number;        // 0-100
  risk_level: RiskLevel;
  parameters: Record<string, number>;  // each param 0-5
  explanation: Record<string, string>; // human-readable
}

// ── A. Country Risk Data (simplified, verifiable) ────────────────────────────
// Sources: Freedom House, Transparency International CPI, ITUC Global Rights Index
// Scale: 0 = very low risk, 5 = very high risk

const COUNTRY_HR: Record<string, number> = {
  // Low risk (0-1)
  "Denmark": 0, "Norway": 0, "Sweden": 0, "Finland": 0, "Netherlands": 0,
  "Germany": 1, "Austria": 1, "Switzerland": 1, "France": 1, "Belgium": 1,
  "Ireland": 0, "New Zealand": 0, "Canada": 1, "Australia": 1,
  // Medium-low (2)
  "USA": 2, "UK": 1, "Spain": 1, "Italy": 2, "Portugal": 1,
  "Poland": 2, "Czech Republic": 2, "Hungary": 3, "Romania": 3,
  "Brazil": 3, "Mexico": 3, "Argentina": 3, "South Africa": 3,
  "Turkey": 3, "Morocco": 3,
  // Medium-high (3-4)
  "China": 4, "Vietnam": 3, "India": 3, "Indonesia": 3, "Thailand": 3,
  "Malaysia": 3, "Philippines": 3, "Sri Lanka": 3, "Cambodia": 4,
  "Russia": 4, "Nigeria": 4, "Kenya": 3, "Ethiopia": 4, "Colombia": 3,
  "Peru": 3, "Bolivia": 3,
  // High (4-5)
  "Bangladesh": 4, "Pakistan": 4, "Myanmar": 5, "North Korea": 5,
  "Eritrea": 5, "Libya": 5, "Sudan": 5, "Yemen": 5, "Afghanistan": 5,
  "DR Congo": 5, "Somalia": 5,
};

const COUNTRY_CHILD_LABOR: Record<string, number> = {
  "Germany": 0, "Austria": 0, "Switzerland": 0, "France": 0, "Netherlands": 0,
  "Sweden": 0, "Denmark": 0, "Norway": 0, "Finland": 0, "Belgium": 0,
  "USA": 1, "UK": 0, "Canada": 0, "Australia": 0,
  "Poland": 1, "Czech Republic": 1, "Hungary": 1, "Romania": 2,
  "China": 2, "India": 4, "Bangladesh": 4, "Pakistan": 4, "Vietnam": 2,
  "Indonesia": 3, "Philippines": 3, "Cambodia": 3, "Myanmar": 4,
  "Nigeria": 4, "Ethiopia": 4, "DR Congo": 5, "Sudan": 5,
  "Brazil": 2, "Mexico": 3, "Colombia": 3, "Peru": 3,
  "Turkey": 2, "Morocco": 3,
};

const COUNTRY_CORRUPTION: Record<string, number> = {
  "Denmark": 0, "Finland": 0, "New Zealand": 0, "Norway": 0, "Sweden": 0,
  "Switzerland": 0, "Netherlands": 0, "Germany": 1, "Austria": 1,
  "Canada": 1, "UK": 1, "Australia": 1, "France": 2, "Belgium": 1,
  "USA": 2, "Ireland": 1, "Japan": 1,
  "Poland": 2, "Czech Republic": 2, "Hungary": 3, "Romania": 3,
  "Italy": 3, "Spain": 2, "Portugal": 2, "Greece": 3,
  "China": 3, "India": 3, "Vietnam": 3, "Indonesia": 3, "Thailand": 3,
  "Malaysia": 3, "Philippines": 3, "Bangladesh": 4, "Pakistan": 4,
  "Russia": 4, "Ukraine": 4, "Turkey": 3, "Brazil": 3, "Mexico": 4,
  "Nigeria": 5, "Somalia": 5, "Sudan": 5, "Yemen": 5,
};

const COUNTRY_FORCED_LABOR: Record<string, number> = {
  "Germany": 0, "Austria": 0, "Switzerland": 0, "Netherlands": 0,
  "Sweden": 0, "Denmark": 0, "Norway": 0, "Finland": 0,
  "USA": 1, "UK": 1, "France": 1, "Canada": 1,
  "China": 4, "North Korea": 5, "Eritrea": 5, "Myanmar": 4,
  "Bangladesh": 3, "Pakistan": 3, "India": 3, "Vietnam": 2,
  "Cambodia": 3, "Thailand": 2, "Indonesia": 2, "Malaysia": 2,
  "Qatar": 4, "UAE": 3, "Saudi Arabia": 3,
  "Russia": 3, "Uzbekistan": 4, "Turkmenistan": 5,
};

const COUNTRY_RULE_OF_LAW: Record<string, number> = {
  "Finland": 0, "Denmark": 0, "Norway": 0, "Sweden": 0, "Netherlands": 0,
  "Germany": 1, "Austria": 1, "Switzerland": 0, "UK": 1, "Canada": 1,
  "France": 1, "Belgium": 1, "Ireland": 0,
  "USA": 2, "Japan": 1, "Australia": 0,
  "Poland": 2, "Czech Republic": 2, "Hungary": 3, "Romania": 3,
  "Italy": 3, "Spain": 2,
  "Brazil": 3, "Mexico": 4, "India": 3, "Indonesia": 3,
  "China": 4, "Russia": 5, "Vietnam": 4, "Bangladesh": 4,
  "Nigeria": 4, "Ethiopia": 4, "DR Congo": 5,
};

const COUNTRY_UNION_RIGHTS: Record<string, number> = {
  "Denmark": 0, "Sweden": 0, "Norway": 0, "Finland": 0, "Belgium": 0,
  "Germany": 0, "Austria": 0, "Netherlands": 0, "France": 1, "UK": 1,
  "Canada": 1, "USA": 2, "Australia": 1,
  "Poland": 2, "Czech Republic": 2, "Hungary": 3,
  "Brazil": 3, "Mexico": 3, "India": 3, "Indonesia": 3, "Vietnam": 4,
  "China": 5, "Bangladesh": 4, "Pakistan": 4, "Myanmar": 4,
  "Russia": 4, "Turkey": 3,
};

// ── B. Industry Risk ─────────────────────────────────────────────────────────
const INDUSTRY_HIGH_RISK: Record<string, boolean> = {
  "textile": true, "clothing": true, "apparel": true,
  "mining": true, "coal": true, "gold": true, "diamonds": true,
  "agriculture": true, "food": true, "palm oil": true, "cocoa": true,
  "electronics": true, "it": true,
  "construction": true,
  "chemicals": true,
  "logistics": true,
  "automotive": true,
  "pharmaceuticals": false,
  "services": false,
  "retail": false,
  "machinery": false,
  "metals": true,
  "energy": true,
};

const INDUSTRY_RAW_MATERIAL: Record<string, number> = {
  "mining": 5, "agriculture": 4, "metals": 4, "energy": 3, "chemicals": 3,
  "food": 4, "textile": 3, "electronics": 3, "automotive": 3,
  "construction": 2, "logistics": 1, "services": 0, "pharmaceuticals": 2,
};

const INDUSTRY_LABOR_INTENSIVE: Record<string, number> = {
  "textile": 5, "clothing": 5, "apparel": 5, "agriculture": 4,
  "construction": 4, "food": 3, "electronics": 3, "mining": 3,
  "automotive": 2, "logistics": 2, "services": 2, "pharmaceuticals": 1,
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function getCountryParam(map: Record<string, number>, country: string, def = 2): number {
  const k = Object.keys(map).find(k => k.toLowerCase() === country.toLowerCase());
  return k !== undefined ? map[k] : def;
}

function getIndustryParam(map: Record<string, number>, industry: string, def = 2): number {
  const k = Object.keys(map).find(k => industry.toLowerCase().includes(k.toLowerCase()));
  return k !== undefined ? map[k] : def;
}

function clamp(v: number): number {
  return Math.min(5, Math.max(0, Math.round(v)));
}

// ── Main scoring function ────────────────────────────────────────────────────
export function calculateRisk(input: RiskInput): RiskResult {
  const c = input.country || "Unknown";
  const ind = input.industry || "services";

  // ── A. Country Risk (6 params, weight 35%) ──────────────────────────────
  const a1 = clamp(getCountryParam(COUNTRY_HR, c));           // Human rights
  const a2 = clamp(getCountryParam(COUNTRY_CHILD_LABOR, c));  // Child labor
  const a3 = clamp(getCountryParam(COUNTRY_FORCED_LABOR, c)); // Forced labor
  const a4 = clamp(getCountryParam(COUNTRY_UNION_RIGHTS, c)); // Union freedom
  const a5 = clamp(getCountryParam(COUNTRY_RULE_OF_LAW, c));  // Rule of law
  const a6 = clamp(getCountryParam(COUNTRY_CORRUPTION, c));   // Corruption

  // ── B. Industry Risk (5 params, weight 25%) ─────────────────────────────
  const b1 = clamp((INDUSTRY_HIGH_RISK[ind.toLowerCase()] ? 4 : 1));
  const b2 = clamp(getIndustryParam(INDUSTRY_RAW_MATERIAL, ind));
  const b3 = clamp(getIndustryParam(INDUSTRY_LABOR_INTENSIVE, ind));
  const b4 = clamp(input.sub_supplier_count ? Math.min(5, Math.floor(input.sub_supplier_count / 10)) : 2);
  const b5 = clamp(INDUSTRY_HIGH_RISK[ind.toLowerCase()] ? 3 : 1); // Past incidents

  // ── C. Company Profile (5 params, weight 25%) ───────────────────────────
  // Larger = more scrutiny needed
  const c1_workers = input.workers || 0;
  const c1 = clamp(c1_workers > 5000 ? 4 : c1_workers > 1000 ? 3 : c1_workers > 200 ? 2 : c1_workers > 50 ? 1 : 1);
  const c2 = clamp(5 - (input.certification_count || 0));  // certs reduce risk
  const c3 = clamp(input.has_audit ? 1 : 4);              // no audit = high risk
  const c4 = clamp(input.transparency_score ? (6 - input.transparency_score) : 3);
  const c5_coc = input.has_code_of_conduct ? 0 : 2;
  const c5_wage = input.pays_minimum_wage === false ? 1 : 0;  // §2 Abs.2 Nr.7: Mindestlohn
  const c5 = clamp(c5_coc + c5_wage + 1);   // CoC + wage compliance

  // ── D. Incidents (4 params, weight 15%) ─────────────────────────────────
  const d1 = clamp(Math.min(5, input.complaint_count || 0));
  const d2 = 0; // Media/NGO reports - default 0, updated via monitoring
  const d3 = clamp(input.previous_violations ? 4 : 0);
  const d4 = 0; // Cooperation level - default good

  // ── Weighted score ───────────────────────────────────────────────────────
  const A = (a1 + a2 + a3 + a4 + a5 + a6) / 6;  // 0-5
  const B = (b1 + b2 + b3 + b4 + b5) / 5;         // 0-5
  const C = (c1 + c2 + c3 + c4 + c5) / 5;         // 0-5
  const D = (d1 + d2 + d3 + d4) / 4;              // 0-5

  // Weighted: Country 35%, Industry 25%, Company 25%, Incidents 15%
  const weighted = (A * 0.35 + B * 0.25 + C * 0.25 + D * 0.15);
  const score = Math.round(weighted * 20); // 0-100

  const risk_level: RiskLevel =
    score >= 70 ? "high" :
    score >= 40 ? "medium" : "low";

  return {
    score,
    risk_level,
    parameters: { a1, a2, a3, a4, a5, a6, b1, b2, b3, b4, b5, c1, c2, c3, c4, c5, d1, d2, d3, d4 },
    explanation: {
      a1: `Human rights index (${c}): ${a1}/5`,
      a2: `Child labour risk (${c}): ${a2}/5`,
      a3: `Forced labour risk (${c}): ${a3}/5`,
      a4: `Union freedom (${c}): ${a4}/5`,
      a5: `Rule of law (${c}): ${a5}/5`,
      a6: `Unlautere Geschäftspraktiken / Korruption CPI (${c}): ${a6}/5`,  // §2 Abs.2 Nr.10 LkSG
      b1: `High-risk sector (${ind}): ${b1}/5`,
      b2: `Raw material intensity: ${b2}/5`,
      b3: `Labour intensity: ${b3}/5`,
      b4: `Sub-supplier complexity: ${b4}/5`,
      b5: `Past sector incidents: ${b5}/5`,
      c1: `Company size: ${c1}/5`,
      c2: `Certifications: ${c2}/5`,
      c3: `Audit status: ${c3}/5`,
      c4: `Transparency: ${c4}/5`,
      c5: `Code of Conduct: ${c5}/5`,
      d1: `Complaint history: ${d1}/5`,
      d2: `Media/NGO reports: ${d2}/5`,
      d3: `Past violations: ${d3}/5`,
      d4: `Cooperation level: ${d4}/5`,
    },
  };
}
