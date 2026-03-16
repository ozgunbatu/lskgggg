import { calculateRisk } from "../risk/engine";

const BASE = {
  country: "Germany",
  industry: "manufacturing",
  annual_spend_eur: 500000,
  workers: 100,
  has_audit: false,
  has_code_of_conduct: false,
  certification_count: 0,
  sub_supplier_count: 0,
  transparency_score: 3,
  complaint_count: 0,
  previous_violations: false,
};

describe("calculateRisk", () => {
  it("returns score between 0-100", () => {
    const r = calculateRisk(BASE);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it("low-risk supplier (Germany, audited, CoC)", () => {
    const r = calculateRisk({ ...BASE, country: "Germany", has_audit: true, has_code_of_conduct: true });
    expect(r.risk_level).toBe("low");
  });

  it("high-risk country increases score", () => {
    const low = calculateRisk({ ...BASE, country: "Germany" });
    const high = calculateRisk({ ...BASE, country: "Myanmar" });
    expect(high.score).toBeGreaterThan(low.score);
  });

  it("previous violations increase score", () => {
    const normal = calculateRisk(BASE);
    const withViolations = calculateRisk({ ...BASE, previous_violations: true });
    expect(withViolations.score).toBeGreaterThan(normal.score);
  });

  it("audit reduces score", () => {
    const noAudit = calculateRisk(BASE);
    const withAudit = calculateRisk({ ...BASE, has_audit: true });
    expect(withAudit.score).toBeLessThanOrEqual(noAudit.score);
  });

  it("returns risk_level as low/medium/high", () => {
    const r = calculateRisk(BASE);
    expect(["low", "medium", "high"]).toContain(r.risk_level);
  });

  it("returns explanation object", () => {
    const r = calculateRisk(BASE);
    expect(r.explanation).toBeDefined();
  });
});
