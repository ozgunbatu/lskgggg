/**
 * KPI / Wirksamkeitskontrolle -- §9 LkSG
 */
import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../middleware/auth";

const router = Router();

/**
 * REVISED compliance score formula - §9 LkSG-compliant
 *
 * Problem with old formula: only looked at risk level distribution.
 * A company with 0% audit/CoC/SAQ could still get 90/100 if suppliers are low-risk.
 * BAFA sees this as a methodology contradiction.
 *
 * New formula:
 *   complianceScore = riskScore(55%) + processScore(45%)
 *
 * riskScore (0-100): portfolio risk distribution
 *   = 100 - (high/total)*55 - (medium/total)*20
 *
 * processScore (0-100): actual implementation quality
 *   = auditCoverage(25%) + cocCoverage(20%) + capCompletion(30%) + saqRate(10%) + complaintResolution(15%)
 *
 * Penalties:
 *   - Each overdue CAP: -5 points from processScore
 *   - Each open complaint: -3 points from processScore
 */
export function calcComplianceScore(params: {
  total: number;
  high: number;
  med: number;
  auditCount: number;
  cocCount: number;
  capsTotal: number;
  capsDone: number;
  capsOverdue: number;
  saqsSent: number;
  saqsDone: number;
  complaintsOpen: number;
}): number {
  const {
    total, high, med, auditCount, cocCount,
    capsTotal, capsDone, capsOverdue, saqsSent, saqsDone, complaintsOpen
  } = params;

  if (total === 0) return 100;

  // Risk score component
  const riskScore = Math.max(0, 100 - (high / total) * 55 - (med / total) * 20);

  // Process components (each 0-100)
  const auditCov  = (auditCount / total) * 100;
  const cocCov    = (cocCount   / total) * 100;

  // CAP completion: no CAPs = 100 (nothing to complete), but overdue = penalty
  const capRate   = capsTotal > 0 ? (capsDone / capsTotal) * 100 : 100;

  // SAQ: no SAQs sent = partial credit (50), not full
  // Company should be proactively sending SAQs for medium/high risk suppliers
  const saqRate   = saqsSent > 0 ? (saqsDone / saqsSent) * 100 : (high + med > 0 ? 0 : 50);

  // Complaint resolution: no complaints = full credit
  const cmpScore  = complaintsOpen === 0 ? 100 : Math.max(0, 100 - complaintsOpen * 15);

  // Overdue CAP penalty (applied to overall process score)
  const overduePenalty = Math.min(50, capsOverdue * 8);

  const processScore = Math.max(0,
    auditCov  * 0.25 +
    cocCov    * 0.20 +
    capRate   * 0.30 +
    saqRate   * 0.10 +
    cmpScore  * 0.15 -
    overduePenalty
  );

  return Math.max(0, Math.min(100, Math.round(riskScore * 0.55 + processScore * 0.45)));
}

export function getGrade(score: number): string {
  return score >= 85 ? "A" : score >= 70 ? "B" : score >= 50 ? "C" : score >= 30 ? "D" : "F";
}

// Calculate current KPIs from live data
export async function calcLiveKPIs(companyId: string) {
  const [supR, capR, cmpR, saqR] = await Promise.all([
    db.query("SELECT risk_level, risk_score, has_audit, has_code_of_conduct FROM suppliers WHERE company_id=$1", [companyId]),
    db.query("SELECT status, due_date FROM action_plans WHERE company_id=$1", [companyId]).catch(() => ({ rows: [] })),
    db.query("SELECT status, created_at, resolved_at FROM complaints WHERE company_id=$1", [companyId]).catch(() => ({ rows: [] })),
    db.query("SELECT status FROM supplier_saq WHERE company_id=$1", [companyId]).catch(() => ({ rows: [] })),
  ]);

  const sups  = supR.rows;
  const caps  = capR.rows;
  const cmps  = cmpR.rows;
  const saqs  = saqR.rows;

  const total = sups.length;
  const high  = sups.filter((s: any) => s.risk_level === "high").length;
  const med   = sups.filter((s: any) => s.risk_level === "medium").length;
  const low   = sups.filter((s: any) => s.risk_level === "low").length;

  const auditCount = sups.filter((s: any) => s.has_audit).length;
  const cocCount   = sups.filter((s: any) => s.has_code_of_conduct).length;

  const capsDone    = caps.filter((c: any) => c.status === "completed" || c.status === "closed").length;
  const capsOpen    = caps.filter((c: any) => c.status !== "completed" && c.status !== "closed").length;
  const capsOverdue = caps.filter((c: any) => {
    if (!c.due_date || c.status === "completed" || c.status === "closed") return false;
    return new Date(c.due_date) < new Date();
  }).length;
  const capCompletionRate = caps.length > 0 ? Math.round(capsDone / caps.length * 100) : 0;

  const cmpOpen  = cmps.filter((c: any) => c.status === "open").length;
  const cmpTotal = cmps.length;

  const resolved = cmps.filter((c: any) => c.resolved_at && c.created_at);
  const avgResolutionDays = resolved.length
    ? Math.round(resolved.reduce((s: number, c: any) =>
        s + (new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime()) / 86400000, 0) / resolved.length)
    : null;

  const auditCoverage = total > 0 ? Math.round(auditCount / total * 100) : 0;
  const cocCoverage   = total > 0 ? Math.round(cocCount   / total * 100) : 0;

  const saqSent = saqs.length;
  const saqDone = saqs.filter((s: any) => s.status === "completed").length;
  const saqRate = saqSent > 0 ? Math.round(saqDone / saqSent * 100) : 0;

  const portfolioScore = calcComplianceScore({
    total, high, med, auditCount, cocCount,
    capsTotal: caps.length, capsDone, capsOverdue,
    saqsSent: saqSent, saqsDone: saqDone,
    complaintsOpen: cmpOpen,
  });

  return {
    portfolioScore,
    grade: getGrade(portfolioScore),
    highRisk: high, medRisk: med, lowRisk: low, supplierCount: total,
    capOpen: capsOpen, capDone: capsDone, capOverdue: capsOverdue, capCompletionRate,
    complaintOpen: cmpOpen, complaintTotal: cmpTotal, avgResolutionDays,
    auditCoverage, cocCoverage,
    saqSent, saqDone, saqRate,
  };
}

// GET /kpi/live
router.get("/live", requireAuth, async (req, res) => {
  try {
    const kpis = await calcLiveKPIs(req.auth!.companyId);
    res.json(kpis);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /kpi/snapshot
router.post("/snapshot", requireAuth, async (req, res) => {
  try {
    const companyId = req.auth!.companyId;
    const k = await calcLiveKPIs(companyId);
    await db.query(
      `INSERT INTO kpi_snapshots(company_id,snapshot_at,compliance_score,high_risk_count,med_risk_count,low_risk_count,
         supplier_count,cap_open,cap_done,cap_overdue,complaint_open,complaint_total,audit_coverage,coc_coverage,saq_sent,saq_done)
       VALUES($1,CURRENT_DATE,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT(company_id,snapshot_at) DO UPDATE SET
         compliance_score=EXCLUDED.compliance_score, high_risk_count=EXCLUDED.high_risk_count,
         med_risk_count=EXCLUDED.med_risk_count, cap_open=EXCLUDED.cap_open,
         cap_done=EXCLUDED.cap_done, cap_overdue=EXCLUDED.cap_overdue,
         complaint_open=EXCLUDED.complaint_open, audit_coverage=EXCLUDED.audit_coverage,
         coc_coverage=EXCLUDED.coc_coverage`,
      [companyId, k.portfolioScore, k.highRisk, k.medRisk, k.lowRisk,
       k.supplierCount, k.capOpen, k.capDone, k.capOverdue,
       k.complaintOpen, k.complaintTotal, k.auditCoverage, k.cocCoverage,
       k.saqSent, k.saqDone]
    );
    res.json({ ok: true, snapshot: k });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /kpi/trend
router.get("/trend", requireAuth, async (req, res) => {
  try {
    const r = await db.query(
      `SELECT snapshot_at, compliance_score, high_risk_count, med_risk_count, low_risk_count,
              cap_done, cap_open, cap_overdue, audit_coverage, coc_coverage, saq_done, saq_sent
       FROM kpi_snapshots
       WHERE company_id=$1 AND snapshot_at >= CURRENT_DATE - INTERVAL '12 months'
       ORDER BY snapshot_at ASC`,
      [req.auth!.companyId]
    );
    res.json(r.rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /kpi/effectiveness
router.get("/effectiveness", requireAuth, async (req, res) => {
  try {
    const companyId = req.auth!.companyId;
    const [live, trend] = await Promise.all([
      calcLiveKPIs(companyId),
      db.query("SELECT * FROM kpi_snapshots WHERE company_id=$1 ORDER BY snapshot_at ASC LIMIT 12", [companyId]),
    ]);
    const snapshots = trend.rows;
    const first = snapshots[0];
    const last  = snapshots[snapshots.length - 1];
    res.json({
      current: live, trend: snapshots,
      delta: {
        scoreImprovement: first && last ? (last.compliance_score||0) - (first.compliance_score||0) : 0,
        riskReduction:    first && last ? (first.high_risk_count||0) - (last.high_risk_count||0) : 0,
        periods: snapshots.length,
      },
      effectiveness_status:
        live.capCompletionRate >= 80 && live.auditCoverage >= 60 ? "effective" :
        live.capCompletionRate >= 50 ? "partial" : "insufficient",
      // Score breakdown for transparency
      scoreBreakdown: {
        formula: "riskScore(55%) + processScore(45%)",
        components: {
          riskScore:    `100 - (${live.highRisk}/${live.supplierCount})*55 - (${live.medRisk}/${live.supplierCount})*20`,
          auditCov:     `${live.auditCoverage}% (weight: 25% of process)`,
          cocCov:       `${live.cocCoverage}% (weight: 20% of process)`,
          capCompletion:`${live.capCompletionRate}% (weight: 30% of process)`,
          saqRate:      `${live.saqRate}% (weight: 10% of process)`,
          complaints:   `${live.complaintOpen} open (weight: 15% of process)`,
        }
      }
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
