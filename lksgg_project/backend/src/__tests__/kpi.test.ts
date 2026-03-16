import { calcComplianceScore, getGrade } from "../modules/kpi";

const BASE_PARAMS = {
  total: 10, high: 0, med: 3,
  auditCount: 8, cocCount: 9,
  capsTotal: 5, capsDone: 5, capsOverdue: 0,
  saqsSent: 3, saqsDone: 3,
  complaintsOpen: 0,
};

describe("calcComplianceScore", () => {
  it("returns 100 for empty supplier list", () => {
    expect(calcComplianceScore({ ...BASE_PARAMS, total: 0, high: 0, med: 0 })).toBe(100);
  });

  it("perfect compliance → high score", () => {
    const score = calcComplianceScore(BASE_PARAMS);
    expect(score).toBeGreaterThan(80);
  });

  it("all high-risk, no audits, open complaints → low score", () => {
    const score = calcComplianceScore({
      total: 10, high: 10, med: 0,
      auditCount: 0, cocCount: 0,
      capsTotal: 0, capsDone: 0, capsOverdue: 0,
      saqsSent: 0, saqsDone: 0,
      complaintsOpen: 5,
    });
    expect(score).toBeLessThanOrEqual(40);
  });

  it("overdue CAPs penalize score", () => {
    const clean = calcComplianceScore(BASE_PARAMS);
    const withOverdue = calcComplianceScore({ ...BASE_PARAMS, capsOverdue: 5 });
    expect(withOverdue).toBeLessThan(clean);
  });

  it("score is always 0-100", () => {
    const extremeLow = calcComplianceScore({
      total: 10, high: 10, med: 0,
      auditCount: 0, cocCount: 0,
      capsTotal: 20, capsDone: 0, capsOverdue: 20,
      saqsSent: 10, saqsDone: 0,
      complaintsOpen: 20,
    });
    expect(extremeLow).toBeGreaterThanOrEqual(0);
    expect(extremeLow).toBeLessThanOrEqual(100);
  });
});

describe("getGrade", () => {
  it("A for 85+", () => expect(getGrade(90)).toBe("A"));
  it("B for 70-84", () => expect(getGrade(75)).toBe("B"));
  it("C for 50-69", () => expect(getGrade(55)).toBe("C"));
  it("D for 30-49", () => expect(getGrade(35)).toBe("D"));
  it("F for <30", () => expect(getGrade(20)).toBe("F"));
});
