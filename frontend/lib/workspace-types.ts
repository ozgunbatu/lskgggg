export type Lang = "de" | "en";
export type RL = "low" | "medium" | "high" | "unknown";

export type Supplier = {
  id: string; name: string; country: string; industry: string;
  risk_level: RL; risk_score: number;
  annual_spend_eur?: number | null; workers?: number | null;
  has_audit?: boolean; has_code_of_conduct?: boolean; has_contract_clause?: boolean;
  has_env_management?: boolean; pays_minimum_wage?: boolean;
  certification_count?: number; sub_supplier_count?: number;
  transparency_score?: number | null; complaint_count?: number;
  previous_violations?: boolean; notes?: string | null;
  risk_parameters?: Record<string, number>;
  risk_explanation?: Record<string, string>;
  updated_at?: string;
};

export type Company = { id: string; name: string; slug: string };

export type Complaint = {
  id: string; supplier_id: string | null; supplier_name: string | null;
  category: string; description: string; status: string; severity: string;
  reference_number: string; internal_notes?: string; created_at: string;
  source?: string; is_anonymous?: boolean; resolved_at?: string | null;
  feedback_due_at?: string | null; feedback_sent_at?: string | null; hinschg_relevant?: boolean;
};

export type Action = {
  id: string; supplier_id: string | null; supplier_name: string | null;
  title: string; description: string; risk_level: string; lksg_paragraph: string;
  due_date: string | null; status: string; priority: string; assigned_to: string | null;
  completed_at: string | null; evidence_notes: string | null; created_at: string;
  relationship_status?: "active" | "suspended" | "terminated"; relationship_status_reason?: string;
};

export type SAQ = {
  id: string; supplier_id: string | null; supplier_name: string | null;
  sent_to: string | null; status: string; token: string;
  sent_at: string; completed_at: string | null; expires_at: string;
  responses: Record<string,string> | null; url?: string;
};

export type KPILive = {
  portfolioScore: number; grade: string;
  highRisk: number; medRisk: number; lowRisk: number; supplierCount: number;
  capOpen: number; capDone: number; capOverdue: number; capCompletionRate: number;
  complaintOpen: number; complaintTotal: number; avgResolutionDays: number | null;
  auditCoverage: number; cocCoverage: number;
  saqSent: number; saqDone: number; saqRate: number;
};

export type Evidence = {
  id: string; type: string; title: string; description: string | null;
  file_name: string | null; file_size: number | null; mime_type: string | null;
  lksg_ref: string | null; supplier_name: string | null; created_at: string;
};

export type AuditEntry = {
  id: string; action: string; entity_type: string; entity_id: string | null;
  entity_name: string | null; user_email: string | null;
  old_value: Record<string,any> | null; new_value: Record<string,any> | null;
  created_at: string;
};

export type Toast = { id: number; type: "ok" | "err" | "info"; msg: string };

export type WorkspaceCard = {
  kicker: string;
  value: string;
  chip?: string;
  copy: string;
  cta: string;
  action: () => void;
};

export type TabId =
  | "dashboard"
  | "suppliers"
  | "actions"
  | "complaints"
  | "saq"
  | "kpi"
  | "reports"
  | "evidence"
  | "monitoring"
  | "ai"
  | "audit"
  | "legal"
  | "settings";


export type Msg = { role: "user" | "assistant"; content: string };
export type WorkspaceApprovalMeta = {
  pending: number;
  approved: number;
  rejected: number;
  lastStatus: string;
  oldestPendingDays?: number;
  pendingWithinSla?: number;
  slaBreaches?: number;
  pendingAging?: { fresh: number; warning: number; urgent: number };
  loading: boolean;
  currentRole: string;
  canRequest: boolean;
  canApprove: boolean;
  draftLocked: boolean;
  rows?: any[];
  notes?: string;
  setNotes?: (value: string) => void;
  loadApprovals?: () => Promise<void>;
  requestApproval?: (year: number, toast?: ToastFn, L?: Lang) => Promise<void>;
  reviewApproval?: (year: number, decision: "approved" | "rejected", toast?: ToastFn, L?: Lang) => Promise<void>;
};

export type WorkspaceSetter<T = any> = (value: T | ((prev: T) => T)) => void;
export type ToastFn = (type: "ok" | "err" | "info", msg: string) => void;

export type WorkspaceTabProps = {
  L: Lang;
  company: Company | null;
  suppliers: Supplier[];
  complaints: Complaint[];
  actions: Action[];
  events: any[];
  screenings: any[];
  loading: boolean;
  expanded: string | null;
  editingSup: Supplier | null;
  sName: string;
  setSName: WorkspaceSetter<string>;
  sCountry: string;
  setSCountry: WorkspaceSetter<string>;
  sInd: string;
  setSInd: WorkspaceSetter<string>;
  csv: string;
  setCsv: WorkspaceSetter<string>;
  showCapModal: boolean;
  setShowCapModal: WorkspaceSetter<boolean>;
  capPara: string;
  setCapPara: WorkspaceSetter<string>;
  triageRes: string;
  setTriageRes: WorkspaceSetter<string>;
  triageLd: boolean;
  actionNotes: Record<string, string>;
  setActionNotes: WorkspaceSetter<Record<string, string>>;
  supAI: string;
  supCAP: string;
  supLd: boolean;
  rYear: number;
  setRYear: WorkspaceSetter<number>;
  draft: Record<string, string> | null;
  setDraft: WorkspaceSetter<Record<string, string> | null>;
  draftTs: string;
  genLd: string;
  aiMsgs: Msg[];
  setAiMsgs: WorkspaceSetter<Msg[]>;
  aiInput: string;
  setAiInput: WorkspaceSetter<string>;
  aiLd: boolean;
  saqs: SAQ[];
  saqEmail: string;
  setSaqEmail: WorkspaceSetter<string>;
  saqSup: string;
  setSaqSup: WorkspaceSetter<string>;
  saqDays: string;
  setSaqDays: WorkspaceSetter<string>;
  saqSending: boolean;
  kpiLive: KPILive | null;
  kpiTrend: any[];
  kpiLd: boolean;
  supFilter: { risk: string; country: string; search: string };
  setSupFilter: WorkspaceSetter<{ risk: string; country: string; search: string }>;
  auditLog: AuditEntry[];
  auditFilter: string;
  setAuditFilter: WorkspaceSetter<string>;
  auditLd: boolean;
  showQuickstart: boolean;
  evidences: Evidence[];
  evTitle: string;
  setEvTitle: WorkspaceSetter<string>;
  evType: string;
  setEvType: WorkspaceSetter<string>;
  evLksg: string;
  setEvLksg: WorkspaceSetter<string>;
  evDesc: string;
  setEvDesc: WorkspaceSetter<string>;
  evSupId: string;
  setEvSupId: WorkspaceSetter<string>;
  evFile: File | null;
  setEvFile: WorkspaceSetter<File | null>;
  evUploading: boolean;
  openAddSupModal: () => void;
  openEditSupModal: (supplier: Supplier) => void;
  delSupplier: (id: string, name?: string) => Promise<void> | void;
  recalc: () => Promise<void> | void;
  importCsv: () => Promise<void> | void;
  submitComplaint: () => Promise<void> | void;
  triageComplaint: (complaint?: Complaint) => Promise<void> | void;
  updateComplaintStatus: (id: string, status: string) => Promise<void> | void;
  saveComplaintNote: (id: string) => Promise<void> | void;
  createCap: () => Promise<void> | void;
  updateActionStatus: (id: string, status: string) => Promise<void> | void;
  saveActionNote: (id: string) => Promise<void> | void;
  deleteAction: (id: string, title?: string) => Promise<void> | void;
  loadDraft: () => Promise<void> | void;
  saveDraft: () => Promise<void> | void;
  genSection: (key: string) => Promise<void> | void;
  getSupAI: (supplier: Supplier) => Promise<void> | void;
  getSupCAP: (supplier: Supplier) => Promise<void> | void;
  sendAi: () => Promise<void> | void;
  loadAuditLog: () => Promise<void> | void;
  exportCSV: (endpoint: string, filename: string) => Promise<void> | void;
  sendSaq: () => Promise<void> | void;
  deleteSaq: (id: string) => Promise<void> | void;
  loadKpi: () => Promise<void> | void;
  saveKpiSnapshot: () => Promise<void> | void;
  uploadEvidence: () => Promise<void> | void;
  deleteEvidence: (id: string) => Promise<void> | void;
  chipRL: (riskLevel: string) => any;
  sevChip: (severity: string) => any;
  cStatusChip: (status: string) => any;
  aStatusChip: (status: string) => any;
  pChip: (priority: string) => any;
  dueBadge: (dueDate?: string | null) => any | null;
  RiskBreakdown: (props: { sup: Supplier; compact?: boolean }) => any;
  setTab: (tab: TabId) => void;
  fileRef: { current: HTMLInputElement | null };
  score: { score: number; weighted: number; risk: number; process: number };
  kpis: any;
  actionStats: any;
  workspaceAssist: { cards: WorkspaceCard[] };
  BF: Record<string, string>;
  cSup: string;
  setCSup: WorkspaceSetter<string>;
  cCat: string;
  setCCat: WorkspaceSetter<string>;
  cSev: string;
  setCSev: WorkspaceSetter<string>;
  cDesc: string;
  setCDesc: WorkspaceSetter<string>;
  cNotes: Record<string, string>;
  setCNotes: WorkspaceSetter<Record<string, string>>;
  toast: ToastFn;
  requestState: WorkspaceRequestStateView;
  reloads: WorkspaceReloadsView;
  approvalMeta: WorkspaceApprovalMeta;
};

export type DashboardTabProps = WorkspaceTabProps & {
  dismissQuickstart: () => void;
  workspaceFocus: any;
  quickstartSteps: { id: string; tab: TabId; done: boolean; title: string; copy: string }[];
  quickstartDone: number;
  gradeLabel: (grade: string, L: Lang) => string;
  scCol: string;
  sc: number;
  sg: number;
  setExpanded: WorkspaceSetter<string | null>;
  setEditingSup: WorkspaceSetter<Supplier | null>;
  setShowSupModal: WorkspaceSetter<boolean>;
  COUNTRIES: string[];
  INDUSTRIES: string[];
};


export type DomainRequestView = { loading: boolean; error: string | null; lastLoadedAt: number | null };
export type WorkspaceRequestStateView = Record<"company" | "suppliers" | "complaints" | "actions" | "saqs" | "evidences" | "insights" | "kpi" | "audit", DomainRequestView>;

export type WorkspaceReloadsView = {
  reloadSuppliersDomain: () => Promise<void>;
  reloadComplaintsDomain: () => Promise<void>;
  reloadReportsDomain: () => Promise<void>;
  reloadComplianceCore: () => Promise<void>;
  reloadInsights: () => Promise<void>;
  reloadAudit: (entityType?: string) => Promise<void>;
};
