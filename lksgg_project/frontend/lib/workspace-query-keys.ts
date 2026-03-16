export const QUERY_KEYS = {
  company: "company",
  suppliers: "suppliers",
  complaints: "complaints",
  actions: "actions",
  saqs: "saqs",
  evidences: "evidences",
  insights: "insights",
  kpi: "kpi",
} as const;

export const queryKeys = QUERY_KEYS;

export const queryGroups = {
  suppliers: [QUERY_KEYS.company, QUERY_KEYS.suppliers],
  complaints: [QUERY_KEYS.complaints, QUERY_KEYS.actions],
  reports: [QUERY_KEYS.saqs, QUERY_KEYS.evidences],
  insights: [QUERY_KEYS.insights, QUERY_KEYS.kpi],
} as const;

export const auditKey = (entityType?: string) => entityType ? `audit:${entityType}` : "audit:all";
