export function buildPortfolioKpis(suppliers: Array<{ risk_level: string; country: string }>) {
  const high = suppliers.filter(s => s.risk_level === "high").length;
  const med = suppliers.filter(s => s.risk_level === "medium").length;
  const low = suppliers.filter(s => s.risk_level === "low").length;
  const unk = suppliers.filter(s => s.risk_level === "unknown").length;
  return {
    total: suppliers.length,
    high,
    med,
    low,
    unk,
    countries: new Set(suppliers.map(s => s.country)).size,
  };
}

export function buildActionStats(actions: Array<{ due_date: string | null; status: string }>) {
  const open = actions.filter(a => a.status !== "completed" && a.status !== "closed").length;
  const overdue = actions.filter(a => a.due_date && new Date(a.due_date) < new Date() && a.status !== "completed" && a.status !== "closed").length;
  const done = actions.filter(a => a.status === "completed" || a.status === "closed").length;
  return { open, overdue, done, total: actions.length };
}
