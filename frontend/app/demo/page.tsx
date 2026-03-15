"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const css = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body{font-family:'DM Sans',system-ui,sans-serif;background:#0b1209;color:#fff;overflow:hidden;height:100%}
  .shell{display:grid;grid-template-rows:52px 2px 1fr;height:100vh;overflow:hidden}
  .topbar{display:flex;align-items:center;justify-content:space-between;padding:0 20px;background:rgba(11,18,9,.95);border-bottom:1px solid rgba(255,255,255,.07);z-index:50}
  .logo{font-size:15px;font-weight:800;color:#fff;text-decoration:none}.logo em{font-style:normal;color:rgba(255,255,255,.35)}
  .topbar-r{display:flex;align-items:center;gap:10px}
  .badge{font-size:11px;font-weight:700;color:#4ade80;background:rgba(74,222,128,.12);border:1px solid rgba(74,222,128,.25);padding:3px 10px;border-radius:99px}
  .cta{background:#1B3D2B;color:#fff;border:none;border-radius:7px;padding:7px 16px;font-size:13px;font-weight:700;cursor:pointer;text-decoration:none}
  .cta:hover{background:#2d5c3f}
  .progress{background:rgba(255,255,255,.06)}
  .progress-fill{height:2px;background:linear-gradient(90deg,#1B3D2B,#4ade80);transition:width .12s linear}
  .body{display:grid;grid-template-columns:220px 1fr;overflow:hidden;height:100%}

  /* sidebar */
  .sidebar{background:rgba(255,255,255,.02);border-right:1px solid rgba(255,255,255,.06);overflow-y:auto;padding:14px 0}
  .sidebar-h{font-size:10px;font-weight:800;color:rgba(255,255,255,.28);text-transform:uppercase;letter-spacing:1.2px;padding:0 16px 10px}
  .step-btn{display:flex;align-items:center;gap:10px;width:100%;padding:9px 16px;background:none;border:none;cursor:pointer;text-align:left;position:relative;transition:background .15s}
  .step-btn:hover{background:rgba(255,255,255,.04)}
  .step-btn.active{background:rgba(27,61,43,.35)}
  .step-btn.active::before{content:"";position:absolute;left:0;top:20%;bottom:20%;width:2.5px;background:#4ade80;border-radius:0 2px 2px 0}
  .step-n{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:800;flex-shrink:0;background:rgba(255,255,255,.07);color:rgba(255,255,255,.35);transition:all .2s}
  .active .step-n{background:#1B3D2B;color:#4ade80}
  .done .step-n{background:rgba(74,222,128,.12);color:#4ade80}
  .step-info{min-width:0}
  .step-t{font-size:12.5px;font-weight:700;color:rgba(255,255,255,.55);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color .15s}
  .active .step-t{color:#fff}
  .step-s{font-size:10.5px;color:rgba(255,255,255,.25);margin-top:1px}
  .step-ck{margin-left:auto;color:#4ade80;font-size:12px;opacity:0;transition:opacity .2s;flex-shrink:0}
  .done .step-ck{opacity:1}

  /* main */
  .main{display:flex;flex-direction:column;overflow:hidden}
  .screen-area{flex:1;position:relative;overflow:hidden;background:#101910}
  .screen{position:absolute;inset:0;opacity:0;transform:translateY(8px);transition:opacity .35s,transform .35s;pointer-events:none}
  .screen.vis{opacity:1;transform:translateY(0);pointer-events:auto}

  /* narration bar */
  .narration{display:flex;align-items:center;gap:12px;padding:10px 20px;background:#0d160b;border-top:1px solid rgba(255,255,255,.07);flex-shrink:0;min-height:52px}
  .narr-icon{width:34px;height:34px;border-radius:50%;background:#1B3D2B;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;animation:none}
  .narr-icon.speaking{animation:pulse 1.2s infinite}
  @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.4)}50%{box-shadow:0 0 0 6px rgba(74,222,128,0)}}
  .narr-text{flex:1;font-size:13px;color:rgba(255,255,255,.75);line-height:1.5;font-style:italic}
  .narr-mute{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.5);border-radius:7px;padding:5px 10px;font-size:11.5px;font-weight:700;cursor:pointer;flex-shrink:0;transition:all .15s}
  .narr-mute:hover{background:rgba(255,255,255,.1);color:#fff}

  /* controls */
  .controls{display:flex;align-items:center;justify-content:space-between;padding:10px 20px;background:#0b1209;border-top:1px solid rgba(255,255,255,.06);flex-shrink:0}
  .ctrl-btn{display:flex;align-items:center;gap:5px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.65);font-size:12.5px;font-weight:700;padding:7px 14px;border-radius:7px;cursor:pointer;transition:all .15s}
  .ctrl-btn:hover{background:rgba(255,255,255,.1);color:#fff}
  .ctrl-btn:disabled{opacity:.2;cursor:not-allowed}
  .ctrl-btn.pri{background:#1B3D2B;border-color:#1B3D2B;color:#fff}
  .ctrl-btn.pri:hover{background:#2d5c3f}
  .ctrl-mid{display:flex;flex-direction:column;align-items:center;gap:7px}
  .dots{display:flex;gap:4px}
  .dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.15);cursor:pointer;transition:all .3s}
  .dot.on{background:#4ade80;width:16px;border-radius:3px}
  .play-btn{display:flex;align-items:center;gap:5px;background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.2);color:#4ade80;font-size:11px;font-weight:700;padding:4px 11px;border-radius:99px;cursor:pointer;transition:all .15s;white-space:nowrap}
  .play-btn:hover{background:rgba(74,222,128,.18)}

  /* browser */
  .browser{display:flex;flex-direction:column;height:100%}
  .bbar{display:flex;align-items:center;gap:8px;padding:8px 14px;background:#1a2018;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0}
  .bdots{display:flex;gap:4px}
  .bdot{width:9px;height:9px;border-radius:50%}
  .burl{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07);border-radius:5px;padding:3px 10px;font-size:11px;color:rgba(255,255,255,.35);font-family:monospace;display:flex;align-items:center;gap:5px}
  .burl-lock{color:#4ade80;font-size:10px}
  .bbody{flex:1;overflow:hidden;position:relative}

  /* app chrome */
  .app{display:grid;grid-template-columns:190px 1fr;height:100%;background:#f4f5f4}
  .anav{background:#1B3D2B;display:flex;flex-direction:column}
  .anavlogo{padding:14px 14px 12px;border-bottom:1px solid rgba(255,255,255,.09)}
  .anavlogo-t{font-size:14px;font-weight:800;color:#fff}.anavlogo-t em{font-style:normal;color:rgba(255,255,255,.35)}
  .anavlinks{padding:10px 6px;display:flex;flex-direction:column;gap:1px;flex:1}
  .anavitem{display:flex;align-items:center;gap:7px;padding:7px 9px;border-radius:7px;font-size:12px;font-weight:600;color:rgba(255,255,255,.5);cursor:pointer;transition:all .15s}
  .anavitem.on{background:rgba(255,255,255,.11);color:#fff}
  .anavitem-d{width:5px;height:5px;border-radius:50%;background:currentColor;opacity:.5;flex-shrink:0}
  .amain{overflow:hidden;display:flex;flex-direction:column}
  .ahead{padding:13px 20px;border-bottom:1.5px solid #e8eae8;background:#fff;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
  .ahead-h{font-size:15px;font-weight:800;color:#0b0f0c;letter-spacing:-.3px}
  .acontent{flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:12px}

  /* card primitives */
  .card{background:#fff;border:1.5px solid #e8eae8;border-radius:14px;padding:16px}
  .card-h{font-size:12.5px;font-weight:800;color:#0b0f0c;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between}
  .ctag{font-size:10px;font-weight:700;color:#1B3D2B;background:#f0f5f1;border:1px solid #d1e7d9;padding:2px 7px;border-radius:4px}
  .sgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
  .scard{background:#fff;border:1.5px solid #e8eae8;border-radius:11px;padding:12px}
  .scard-n{font-size:22px;font-weight:800;color:#0b0f0c;letter-spacing:-.5px}
  .scard-l{font-size:10px;color:#9CA3AF;font-weight:700;text-transform:uppercase;letter-spacing:.4px;margin-top:1px}
  .green{color:#16A34A}.red{color:#DC2626}.amber{color:#D97706}
  .brow{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1.5px solid #F3F4F6}
  .brow:last-child{border:none}
  .brow-m{flex:1;min-width:0}
  .brow-n{font-size:12.5px;font-weight:700;color:#0b0f0c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .brow-s{font-size:11px;color:#9CA3AF;margin-top:1px}
  .badge-h{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:5px}
  .badge-m{background:#FFFBEB;color:#D97706;border:1px solid #FDE68A;font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:5px}
  .badge-l{background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0;font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:5px}
  .bar{height:5px;background:#F3F4F6;border-radius:3px;overflow:hidden}
  .bar-fill{height:100%;border-radius:3px;transition:width .7s ease}
  .gf{background:#22c55e}.af{background:#f59e0b}.rf{background:#ef4444}
  .btn-g{background:#1B3D2B;color:#fff;border:none;border-radius:8px;padding:7px 13px;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s}
  .btn-g:hover{background:#2d5c3f;transform:translateY(-1px)}
  .btn-s{background:#F3F4F6;color:#374151;border:none;border-radius:8px;padding:7px 13px;font-size:12px;font-weight:700;cursor:pointer}
  .btn-s:hover{background:#E5E7EB}

  /* highlight animation */
  .hl{animation:highlight 1.2s ease-out}
  @keyframes highlight{0%{box-shadow:0 0 0 0 rgba(74,222,128,.6)}70%{box-shadow:0 0 0 8px rgba(74,222,128,0)}100%{box-shadow:none}}

  /* tooltip */
  .tip{position:absolute;background:#0b1209;border:1px solid rgba(74,222,128,.4);color:#fff;font-size:12px;font-weight:600;padding:6px 12px;border-radius:8px;pointer-events:none;z-index:999;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.5)}
  .tip::before{content:"";position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);border:6px solid transparent;border-top-color:#0b1209;border-bottom:none}

  /* form */
  .fcard{background:#fff;border:1.5px solid #e8eae8;border-radius:14px;padding:24px;max-width:380px;margin:16px auto}
  .fh{font-size:20px;font-weight:800;color:#0b0f0c;margin-bottom:4px;letter-spacing:-.3px}
  .fs{font-size:13px;color:#6b7280;margin-bottom:18px;line-height:1.5}
  .ff{margin-bottom:12px}
  .fl{font-size:10.5px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.7px;display:block;margin-bottom:5px}
  .fi{width:100%;padding:10px 13px;border:1.5px solid #e8eae8;border-radius:9px;font-size:13.5px;color:#0b0f0c;background:#f9fafb}
  .fsbtn{width:100%;padding:12px;background:#1B3D2B;color:#fff;border:none;border-radius:9px;font-size:13.5px;font-weight:800;cursor:pointer;margin-top:4px;display:flex;align-items:center;justify-content:center;gap:7px}
  .otp-row{display:flex;gap:7px;justify-content:center;margin:2px 0 16px}
  .otp-box{width:44px;height:54px;border:1.5px solid #e8eae8;border-radius:9px;font-size:24px;font-weight:800;text-align:center;font-family:monospace;background:#f9fafb;display:flex;align-items:center;justify-content:center;color:#9ca3af}
  .otp-box.on{border-color:#1B3D2B;background:#f0f5f1;color:#1B3D2B}

  /* checklist */
  .chlist{display:flex;flex-direction:column;gap:7px}
  .chitem{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:7px;background:#F9FAFB;font-size:12px;font-weight:600;color:#374151}
  .chitem.ok{background:#F0FDF4;color:#16A34A}
  .chitem.warn{background:#FFFBEB;color:#D97706}
  .chitem.err{background:#FEF2F2;color:#DC2626}
  .chdot{width:15px;height:15px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0}
  .ok .chdot{background:#16A34A;color:#fff}
  .warn .chdot{background:#D97706;color:#fff}
  .err .chdot{background:#DC2626;color:#fff}

  @media(max-width:860px){.body{grid-template-columns:1fr}.sidebar{display:none}}
`;

// ── Step narration scripts ────────────────────────────────────────────────────
const STEPS = [
  {
    id: "register", title: "Registration", sub: "Create account", url: "lksgcompass.de/register",
    narration: "Welcome to LkSGCompass. Start by creating a free account. Enter your company name, business email and a secure password. No credit card required — the 14-day trial starts immediately after verification.",
    actions: [
      { label: "Fill company name", tooltip: "Enter your company name", target: "#field-company" },
      { label: "Enter email", tooltip: "Business email address", target: "#field-email" },
      { label: "Set password", tooltip: "Minimum 8 characters", target: "#field-pw" },
      { label: "Click 'Create account'", tooltip: "Submits the registration form", target: "#btn-register" },
    ],
  },
  {
    id: "otp", title: "Verification", sub: "Confirm email", url: "lksgcompass.de/register",
    narration: "A 6-digit verification code is sent to your email. Enter the code here to activate your account. This step ensures only real business emails can register, protecting your compliance workspace.",
    actions: [
      { label: "Enter OTP code", tooltip: "6-digit code from email", target: "#otp-inputs" },
      { label: "Confirm code", tooltip: "Validates and activates account", target: "#btn-otp" },
    ],
  },
  {
    id: "dashboard", title: "Dashboard", sub: "Compliance overview", url: "lksgcompass.de/app/dashboard",
    narration: "The dashboard gives you an instant compliance health check. Your score of 72 is Grade B — calculated from risk coverage and process quality. You can see 1 high-risk supplier, 2 open corrective actions, and the BAFA readiness checklist showing exactly what still needs to be done.",
    actions: [
      { label: "View compliance score", tooltip: "72/100 — Grade B (§9 LkSG formula)", target: "#score-card" },
      { label: "Check BAFA readiness", tooltip: "Shows mandatory LkSG requirements", target: "#bafa-card" },
      { label: "Add first supplier", tooltip: "Opens supplier creation form", target: "#btn-add-sup" },
    ],
  },
  {
    id: "suppliers", title: "Suppliers", sub: "Risk analysis", url: "lksgcompass.de/app/suppliers",
    narration: "The supplier register is the heart of your LkSG compliance. Each supplier gets an automatic risk score based on country risk, industry, audit status, and certifications. Shenzhen Parts in China is flagged as high risk. You can bulk-import suppliers via Excel — useful when you have dozens or hundreds of suppliers.",
    actions: [
      { label: "Import via Excel", tooltip: "Upload XLSX with supplier data", target: "#btn-excel" },
      { label: "View Shenzhen Parts risk", tooltip: "Risk score: 78 — High", target: "#sup-shenzhen" },
      { label: "Add new supplier", tooltip: "Opens supplier form", target: "#btn-new-sup" },
    ],
  },
  {
    id: "complaints", title: "Complaints", sub: "Whistleblowing portal", url: "lksgcompass.de/app/complaints",
    narration: "The complaint management module handles your legal obligations under §8 LkSG and the German Whistleblower Protection Act. Your public portal link can be shared with suppliers and employees for anonymous reporting. This critical complaint about child labor must be acted on within 7 days under LkSG.",
    actions: [
      { label: "Copy portal link", tooltip: "Public URL for anonymous reports", target: "#btn-portal" },
      { label: "Review critical complaint", tooltip: "Child labor — §2 Nr.1 LkSG — must act", target: "#complaint-crit" },
      { label: "Create CAP from complaint", tooltip: "Links complaint to corrective action", target: "#btn-cap-from" },
    ],
  },
  {
    id: "actions", title: "Action Plans", sub: "CAP tracking", url: "lksgcompass.de/app/actions",
    narration: "Corrective Action Plans track your remediation efforts under §6 and §7 LkSG. The overdue CAP for Shenzhen Parts needs immediate attention. Each CAP has a due date, assignee, and progress percentage. Completing CAPs directly improves your compliance score.",
    actions: [
      { label: "Open overdue CAP", tooltip: "3 days overdue — critical priority", target: "#cap-overdue" },
      { label: "Update progress", tooltip: "Mark steps as completed", target: "#cap-progress" },
      { label: "Create new CAP", tooltip: "Opens action plan form", target: "#btn-new-cap" },
    ],
  },
  {
    id: "kpi", title: "KPIs", sub: "Effectiveness", url: "lksgcompass.de/app/kpi",
    narration: "The KPI dashboard fulfills your §9 LkSG effectiveness monitoring obligation. The score is calculated as 55% risk quality plus 45% process quality. Audit coverage at 60% and code-of-conduct coverage at 80% contribute positively. The SAQ response rate of 33% is a risk — consider sending reminders.",
    actions: [
      { label: "View score breakdown", tooltip: "§9 LkSG formula: risk 55% + process 45%", target: "#score-ring" },
      { label: "Save KPI snapshot", tooltip: "Creates a dated compliance record", target: "#btn-snapshot" },
    ],
  },
  {
    id: "reports", title: "BAFA Report", sub: "PDF export", url: "lksgcompass.de/app/reports",
    narration: "Generate your annual BAFA report with one click. The AI assistant — powered by Claude — drafts the report text from your actual compliance data. The approval workflow ensures the report is reviewed before submission. Export as a structured PDF ready for BAFA.",
    actions: [
      { label: "Generate AI draft", tooltip: "Claude writes the report from your data", target: "#btn-ai-draft" },
      { label: "Review report sections", tooltip: "§5 through §10 LkSG coverage", target: "#report-sections" },
      { label: "Export as PDF", tooltip: "BAFA-ready PDF with timestamp", target: "#btn-pdf" },
    ],
  },
  {
    id: "team", title: "Team & Billing", sub: "Multi-user & plans", url: "lksgcompass.de/app/settings",
    narration: "Invite your compliance team under the Team tab. The email invitation link is valid for 7 days. Roles are Admin, Member, or Viewer. Under Billing, upgrade to Pro at 149 euros per month for unlimited suppliers, the AI assistant, and up to 5 users — all with a 14-day free trial.",
    actions: [
      { label: "Invite team member", tooltip: "Sends email invite with secure link", target: "#btn-invite" },
      { label: "View billing plans", tooltip: "Free → Pro → Enterprise", target: "#billing-plans" },
      { label: "Start free trial", tooltip: "14 days, no credit card", target: "#btn-trial" },
    ],
  },
];

// ── Screen renderers ──────────────────────────────────────────────────────────
function AppNav({ active }: { active: string }) {
  const items = [
    { id: "dashboard", label: "Dashboard" },
    { id: "suppliers", label: "Suppliers" },
    { id: "complaints", label: "Complaints" },
    { id: "actions", label: "Actions" },
    { id: "kpi", label: "KPIs" },
    { id: "reports", label: "BAFA Report" },
    { id: "settings", label: "Settings" },
  ];
  return (
    <div className="anav">
      <div className="anavlogo"><div className="anavlogo-t">LkSG<em>Compass</em></div></div>
      <div className="anavlinks">
        {items.map(i => (
          <div key={i.id} className={`anavitem${i.id === active ? " on" : ""}`}>
            <div className="anavitem-d" />{i.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function HL({ id, children, style }: { id?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return <div id={id} style={style}>{children}</div>;
}

function RegisterScreen({ actionIdx }: { actionIdx: number }) {
  return (
    <div className="browser" style={{ background: "#f4f5f4" }}>
      <div className="bbar"><div className="bdots"><div className="bdot" style={{ background: "#ef4444" }} /><div className="bdot" style={{ background: "#f59e0b" }} /><div className="bdot" style={{ background: "#22c55e" }} /></div><div className="burl"><span className="burl-lock">🔒</span>lksgcompass.de/register</div></div>
      <div className="bbody" style={{ overflow: "auto", background: "#f4f5f4" }}>
        <div className="fcard">
          <div className="fh">Create account</div>
          <div className="fs">Set up your LkSG compliance workspace in 60 seconds.</div>
          <div className="ff" id="field-company">
            <label className="fl">Company Name</label>
            <div className={`fi${actionIdx === 0 ? " hl" : ""}`} style={{ color: "#0b0f0c", transition: "box-shadow .3s" }}>Muster Automotive GmbH</div>
          </div>
          <div className="ff" id="field-email">
            <label className="fl">Business Email</label>
            <div className={`fi${actionIdx === 1 ? " hl" : ""}`} style={{ color: "#0b0f0c" }}>max@muster-auto.de</div>
          </div>
          <div className="ff" id="field-pw">
            <label className="fl">Password</label>
            <div className={`fi${actionIdx === 2 ? " hl" : ""}`} style={{ color: "#9ca3af" }}>••••••••••••</div>
          </div>
          <div id="btn-register" className={`fsbtn${actionIdx === 3 ? " hl" : ""}`} style={{ transition: "box-shadow .3s, background .2s", background: actionIdx === 3 ? "#2d5c3f" : "#1B3D2B" }}>Create account →</div>
          <div style={{ textAlign: "center", fontSize: 11.5, color: "#9ca3af", marginTop: 10 }}>✓ 14-day free trial · No credit card</div>
        </div>
      </div>
    </div>
  );
}

function OtpScreen({ actionIdx }: { actionIdx: number }) {
  return (
    <div className="browser" style={{ background: "#f4f5f4" }}>
      <div className="bbar"><div className="bdots"><div className="bdot" style={{ background: "#ef4444" }} /><div className="bdot" style={{ background: "#f59e0b" }} /><div className="bdot" style={{ background: "#22c55e" }} /></div><div className="burl"><span className="burl-lock">🔒</span>lksgcompass.de/register</div></div>
      <div className="bbody" style={{ overflow: "auto", background: "#f4f5f4" }}>
        <div className="fcard">
          <div className="fh">Confirm your email</div>
          <div className="fs">We sent a 6-digit code to <strong>max@muster-auto.de</strong>.</div>
          <div style={{ background: "#f0f5f1", border: "1px solid #d1e7d9", borderRadius: 9, padding: "10px 14px", fontSize: 12.5, color: "#1B3D2B", marginBottom: 16 }}>✓ Code sent — check your inbox</div>
          <div className="otp-row" id="otp-inputs">
            {["4","7","3","","",""].map((d, i) => (
              <div key={i} className={`otp-box${d ? " on" : ""}${actionIdx === 0 ? " hl" : ""}`} style={{ animationDelay: `${i * 0.1}s` }}>{d}</div>
            ))}
          </div>
          <div id="btn-otp" className={`fsbtn${actionIdx === 1 ? " hl" : ""}`} style={{ opacity: actionIdx === 1 ? 1 : 0.5, background: actionIdx === 1 ? "#2d5c3f" : "#1B3D2B" }}>Confirm code</div>
        </div>
      </div>
    </div>
  );
}

function DashboardScreen({ actionIdx }: { actionIdx: number }) {
  return (
    <div className="browser">
      <div className="bbar"><div className="bdots"><div className="bdot" style={{ background: "#ef4444" }} /><div className="bdot" style={{ background: "#f59e0b" }} /><div className="bdot" style={{ background: "#22c55e" }} /></div><div className="burl"><span className="burl-lock">🔒</span>lksgcompass.de/app/dashboard</div></div>
      <div className="bbody">
        <div className="app">
          <AppNav active="dashboard" />
          <div className="amain">
            <div className="ahead">
              <div className="ahead-h">Dashboard</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-s" style={{ fontSize: 11 }}>↻ Refresh</button>
                <button id="btn-add-sup" className={`btn-g${actionIdx === 2 ? " hl" : ""}`} style={{ fontSize: 11 }}>+ Add Supplier</button>
              </div>
            </div>
            <div className="acontent">
              <div id="score-card" className={`sgrid${actionIdx === 0 ? " hl" : ""}`} style={{ transition: "box-shadow .3s" }}>
                {[["72","Compliance Score","green"],["5","Suppliers",""],["2","Open CAPs","red"],["1","Complaints","amber"]].map(([n,l,c])=>(
                  <div key={l} className="scard"><div className={`scard-n ${c}`}>{n}</div><div className="scard-l">{l}</div></div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="card">
                  <div className="card-h">Risk Portfolio <span className="ctag">§5 LkSG</span></div>
                  {[["High","1 supplier","h",20],["Medium","2 suppliers","m",40],["Low","2 suppliers","l",40]].map(([l,s,t,p])=>(
                    <div key={String(l)} className="brow"><div className="brow-m"><div className="brow-n">{String(l)}</div><div className="brow-s">{String(s)}</div></div><span className={`badge-${t}`}>{String(p)}%</span></div>
                  ))}
                </div>
                <div id="bafa-card" className={`card${actionIdx === 1 ? " hl" : ""}`} style={{ transition: "box-shadow .3s" }}>
                  <div className="card-h">BAFA Readiness</div>
                  <div className="chlist">
                    {[["ok","§4 HR Officer assigned ✓"],["ok","§5 Risk analysis done ✓"],["warn","§6 CAPs: 2 pending"],["err","§8 Complaints officer missing"]].map(([t,l])=>(
                      <div key={String(l)} className={`chitem ${t}`}><div className="chdot">{t==="ok"?"✓":t==="warn"?"!":"✕"}</div>{String(l)}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuppliersScreen({ actionIdx }: { actionIdx: number }) {
  return (
    <div className="browser">
      <div className="bbar"><div className="bdots"><div className="bdot" style={{ background: "#ef4444" }} /><div className="bdot" style={{ background: "#f59e0b" }} /><div className="bdot" style={{ background: "#22c55e" }} /></div><div className="burl"><span className="burl-lock">🔒</span>lksgcompass.de/app/suppliers</div></div>
      <div className="bbody">
        <div className="app">
          <AppNav active="suppliers" />
          <div className="amain">
            <div className="ahead">
              <div className="ahead-h">Suppliers <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>5 total</span></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button id="btn-excel" className={`btn-s${actionIdx === 0 ? " hl" : ""}`} style={{ fontSize: 11 }}>📤 Excel Import</button>
                <button id="btn-new-sup" className={`btn-g${actionIdx === 2 ? " hl" : ""}`} style={{ fontSize: 11 }}>+ New Supplier</button>
              </div>
            </div>
            <div className="acontent">
              <div className="card">
                <div className="card-h">All Suppliers <span className="ctag">§5 Risk Analysis</span></div>
                {[
                  { id: "sup-shenzhen", name: "Shenzhen Parts Co.", c: "🇨🇳 China", i: "Electronics", s: 78, r: "h" },
                  { id: "sup-ankara", name: "Ankara Tekstil A.Ş.", c: "🇹🇷 Turkey", i: "Textile", s: 52, r: "m" },
                  { id: "sup-hanoi", name: "Hanoi Electro Ltd.", c: "🇻🇳 Vietnam", i: "Electronics", s: 61, r: "m" },
                  { id: "sup-schmidt", name: "Schmidt Logistik", c: "🇩🇪 Germany", i: "Logistics", s: 18, r: "l" },
                  { id: "sup-warsaw", name: "Warsaw Auto Parts", c: "🇵🇱 Poland", i: "Automotive", s: 24, r: "l" },
                ].map(s => (
                  <div key={s.name} id={s.id} className={`brow${actionIdx === 1 && s.id === "sup-shenzhen" ? " hl" : ""}`} style={{ transition: "box-shadow .3s" }}>
                    <div className="brow-m"><div className="brow-n">{s.name}</div><div className="brow-s">{s.c} · {s.i}</div></div>
                    <div className="bar" style={{ width: 70, marginRight: 8 }}><div className={`bar-fill ${s.r==="h"?"rf":s.r==="m"?"af":"gf"}`} style={{ width: `${s.s}%` }} /></div>
                    <span className={`badge-${s.r}`}>{s.r==="h"?"High":s.r==="m"?"Medium":"Low"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplaintsScreen({ actionIdx }: { actionIdx: number }) {
  return (
    <div className="browser">
      <div className="bbar"><div className="bdots"><div className="bdot" style={{ background: "#ef4444" }} /><div className="bdot" style={{ background: "#f59e0b" }} /><div className="bdot" style={{ background: "#22c55e" }} /></div><div className="burl"><span className="burl-lock">🔒</span>lksgcompass.de/app/complaints</div></div>
      <div className="bbody">
        <div className="app">
          <AppNav active="complaints" />
          <div className="amain">
            <div className="ahead">
              <div className="ahead-h">Complaints <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>3 total</span></div>
              <button id="btn-portal" className={`btn-s${actionIdx === 0 ? " hl" : ""}`} style={{ fontSize: 11 }}>🔗 Copy portal link</button>
            </div>
            <div className="acontent">
              <div id="complaint-crit" className={`card${actionIdx === 1 ? " hl" : ""}`} style={{ borderColor: "#FECACA", background: "#FFF5F5", transition: "box-shadow .3s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div><div style={{ fontSize: 10.5, fontWeight: 800, color: "#DC2626", marginBottom: 3 }}>⚠ NEW — Critical</div><div style={{ fontSize: 13, fontWeight: 700, color: "#0b0f0c" }}>Child labor at Tier-2 supplier</div><div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Shenzhen Parts · §2 Nr.1 LkSG · REF: BSWD-3A1B</div></div>
                  <span className="badge-h">Critical</span>
                </div>
                <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6, padding: "9px 12px", background: "#fff", borderRadius: 7, border: "1px solid #FECACA", marginBottom: 10 }}>
                  "Minors under 15 observed during facility inspection at production floor..."
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button id="btn-cap-from" className={`btn-g${actionIdx === 2 ? " hl" : ""}`} style={{ fontSize: 11 }}>Create CAP</button>
                  <button className="btn-s" style={{ fontSize: 11 }}>Change status</button>
                </div>
              </div>
              {[{ ref: "BSWD-2C4D", cat: "Environmental violation", sev: "m", st: "Under review" }, { ref: "BSWD-5E6F", cat: "Discrimination", sev: "l", st: "Resolved ✓" }].map(c => (
                <div key={c.ref} className="card" style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><div style={{ fontSize: 10.5, fontFamily: "monospace", color: "#9CA3AF" }}>{c.ref}</div><div style={{ fontSize: 12.5, fontWeight: 700, color: "#0b0f0c" }}>{c.cat}</div></div>
                    <span className={`badge-${c.sev}`}>{c.st}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionsScreen({ actionIdx }: { actionIdx: number }) {
  return (
    <div className="browser">
      <div className="bbar"><div className="bdots"><div className="bdot" style={{ background: "#ef4444" }} /><div className="bdot" style={{ background: "#f59e0b" }} /><div className="bdot" style={{ background: "#22c55e" }} /></div><div className="burl"><span className="burl-lock">🔒</span>lksgcompass.de/app/actions</div></div>
      <div className="bbody">
        <div className="app">
          <AppNav active="actions" />
          <div className="amain">
            <div className="ahead">
              <div className="ahead-h">Action Plans <span style={{ fontSize: 12, color: "#DC2626", fontWeight: 700 }}>2 overdue</span></div>
              <button id="btn-new-cap" className={`btn-g${actionIdx === 2 ? " hl" : ""}`} style={{ fontSize: 11 }}>+ New CAP</button>
            </div>
            <div className="acontent">
              <div id="cap-overdue" className={`card${actionIdx === 0 ? " hl" : ""}`} style={{ borderColor: "#FECACA", background: "#FFF9F9", transition: "box-shadow .3s" }}>
                <div style={{ fontSize: 10.5, color: "#DC2626", fontWeight: 800, marginBottom: 5 }}>⏰ OVERDUE — 3 days</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0b0f0c", marginBottom: 3 }}>Sign Code of Conduct</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>Shenzhen Parts Co. · §6 Abs.2 · Assigned: M. Weber</div>
                    <div id="cap-progress" className={`bar${actionIdx === 1 ? " hl" : ""}`} style={{ width: 130, marginTop: 8, transition: "box-shadow .3s" }}><div className="bar-fill af" style={{ width: "35%" }} /></div>
                    <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 3 }}>35% complete</div>
                  </div>
                  <span className="badge-h">Critical</span>
                </div>
              </div>
              {[{ title: "Request audit report", sup: "Ankara Tekstil", due: "15.04.2025", p: 60, r: "m" }, { title: "Send supplier SAQ", sup: "Hanoi Electro", due: "30.04.2025", p: 0, r: "l" }].map(a => (
                <div key={a.title} className="card" style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0b0f0c" }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{a.sup} · Due: {a.due}</div>
                      <div className="bar" style={{ width: 100, marginTop: 7 }}><div className={`bar-fill ${a.p > 0 ? "af" : "rf"}`} style={{ width: `${Math.max(a.p, 5)}%` }} /></div>
                    </div>
                    <span className={`badge-${a.r}`} style={{ marginLeft: 10 }}>{a.r === "m" ? "High" : "Medium"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiScreen({ actionIdx }: { actionIdx: number }) {
  return (
    <div className="browser">
      <div className="bbar"><div className="bdots"><div className="bdot" style={{ background: "#ef4444" }} /><div className="bdot" style={{ background: "#f59e0b" }} /><div className="bdot" style={{ background: "#22c55e" }} /></div><div className="burl"><span className="burl-lock">🔒</span>lksgcompass.de/app/kpi</div></div>
      <div className="bbody">
        <div className="app">
          <AppNav active="kpi" />
          <div className="amain">
            <div className="ahead">
              <div className="ahead-h">KPIs <span style={{ fontSize: 11.5, color: "#9CA3AF", fontWeight: 600 }}>§9 LkSG</span></div>
              <button id="btn-snapshot" className={`btn-g${actionIdx === 1 ? " hl" : ""}`} style={{ fontSize: 11 }}>Save snapshot</button>
            </div>
            <div className="acontent">
              <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 12 }}>
                <div id="score-ring" className={`card${actionIdx === 0 ? " hl" : ""}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "box-shadow .3s" }}>
                  <div style={{ position: "relative", width: 90, height: 90, marginBottom: 8 }}>
                    <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#F3F4F6" strokeWidth="8" />
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#22c55e" strokeWidth="8" strokeDasharray={`${72 * 2.39} ${100 * 2.39}`} strokeLinecap="round" />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#16A34A", lineHeight: 1 }}>72</div>
                      <div style={{ fontSize: 9.5, color: "#9CA3AF", fontWeight: 700 }}>Grade B</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#6b7280", textAlign: "center", lineHeight: 1.4 }}>Compliance<br />Score<br /><span style={{ color: "#D97706", fontWeight: 700 }}>↑ +5 vs last month</span></div>
                </div>
                <div className="card">
                  <div className="card-h">Effectiveness Indicators</div>
                  {[["Audit coverage","60","af"],["CoC coverage","80","gf"],["CAP completion","50","af"],["SAQ response rate","33","rf"]].map(([l,v,c])=>(
                    <div key={String(l)} className="brow">
                      <div className="brow-m"><div className="brow-n" style={{ fontSize: 12 }}>{String(l)}</div></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="bar" style={{ width: 70 }}><div className={`bar-fill ${c}`} style={{ width: `${v}%` }} /></div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", width: 30, textAlign: "right" }}>{v}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsScreen({ actionIdx }: { actionIdx: number }) {
  return (
    <div className="browser">
      <div className="bbar"><div className="bdots"><div className="bdot" style={{ background: "#ef4444" }} /><div className="bdot" style={{ background: "#f59e0b" }} /><div className="bdot" style={{ background: "#22c55e" }} /></div><div className="burl"><span className="burl-lock">🔒</span>lksgcompass.de/app/reports</div></div>
      <div className="bbody">
        <div className="app">
          <AppNav active="reports" />
          <div className="amain">
            <div className="ahead">
              <div className="ahead-h">BAFA Report 2024</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button id="btn-ai-draft" className={`btn-s${actionIdx === 0 ? " hl" : ""}`} style={{ fontSize: 11 }}>🤖 AI Draft</button>
                <button id="btn-pdf" className={`btn-g${actionIdx === 2 ? " hl" : ""}`} style={{ fontSize: 11 }}>📄 Export PDF</button>
              </div>
            </div>
            <div className="acontent">
              <div className="card" style={{ borderColor: "#BBF7D0", background: "#F0FDF4" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0b0f0c" }}>Report approved ✓</div>
                  <span className="badge-l">Submitted 12.03.2025</span>
                </div>
                <div style={{ fontSize: 11.5, color: "#374151" }}>BAFA 2024 · Muster Automotive GmbH · §9 LkSG</div>
              </div>
              <div id="report-sections" className={`card${actionIdx === 1 ? " hl" : ""}`} style={{ transition: "box-shadow .3s" }}>
                <div className="card-h">Report Content</div>
                {["§5 Risk Analysis","§6 Prevention Measures","§7 Remediation","§8 Complaint Mechanism","§9 Effectiveness Review","§10 Documentation"].map((s,i)=>(
                  <div key={s} className="brow">
                    <div className="brow-m"><div className="brow-n" style={{ fontSize: 12 }}>{s}</div></div>
                    <span className={`${i < 4 ? "badge-l" : i === 4 ? "badge-m" : "badge-h"}`} style={{ fontSize: 10 }}>{i < 4 ? "✓ Complete" : i === 4 ? "In progress" : "Open"}</span>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="card-h">AI Draft <span style={{ fontSize: 10.5, color: "#9CA3AF", fontWeight: 600 }}>Claude</span></div>
                <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.7, padding: "10px 12px", background: "#F9FAFB", borderRadius: 7, border: "1px solid #E5E7EB" }}>
                  "Muster Automotive GmbH conducted a §5 LkSG risk analysis for 5 direct suppliers. One supplier (Shenzhen Parts Co.) was classified as high risk and a Corrective Action Plan was initiated..."
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamScreen({ actionIdx }: { actionIdx: number }) {
  return (
    <div className="browser">
      <div className="bbar"><div className="bdots"><div className="bdot" style={{ background: "#ef4444" }} /><div className="bdot" style={{ background: "#f59e0b" }} /><div className="bdot" style={{ background: "#22c55e" }} /></div><div className="burl"><span className="burl-lock">🔒</span>lksgcompass.de/app/settings</div></div>
      <div className="bbody">
        <div className="app">
          <AppNav active="settings" />
          <div className="amain">
            <div className="ahead"><div className="ahead-h">Settings</div></div>
            <div className="acontent">
              <div style={{ display: "flex", gap: 6, marginBottom: 2 }}>
                {["Company","Team","Billing","Legal"].map((t, i) => (
                  <div key={t} style={{ padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 700, background: i === 1 ? "#1B3D2B" : "transparent", color: i === 1 ? "#fff" : "#6b7280", cursor: "pointer" }}>{t}</div>
                ))}
              </div>
              <div className="card">
                <div className="card-h">Invite member</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div className="fi" style={{ flex: 1, padding: "8px 12px", fontSize: 12.5, color: "#9ca3af" }}>colleague@company.de</div>
                  <select style={{ padding: "8px 10px", borderRadius: 7, border: "1.5px solid #e8eae8", fontSize: 12, color: "#374151", background: "#fff" }}><option>Member</option></select>
                  <button id="btn-invite" className={`btn-g${actionIdx === 0 ? " hl" : ""}`} style={{ fontSize: 11, whiteSpace: "nowrap" }}>Send invite</button>
                </div>
              </div>
              <div className="card">
                <div className="card-h">Team <span style={{ fontSize: 10.5, color: "#9CA3AF", fontWeight: 600 }}>3 members</span></div>
                {[{ e: "max@muster-auto.de", r: "Admin", s: "l", active: true }, { e: "anna@muster-auto.de", r: "Member", s: "l", active: true }, { e: "jo@extern.de", r: "Viewer", s: "m", active: false }].map(m => (
                  <div key={m.e} className="brow"><div className="brow-m"><div className="brow-n" style={{ fontSize: 12.5 }}>{m.e}</div><div className="brow-s">{m.r}</div></div><span className={`badge-${m.s}`}>{m.active ? "Active" : "Invited"}</span></div>
                ))}
              </div>
              <div id="billing-plans" className={`card${actionIdx === 1 ? " hl" : ""}`} style={{ transition: "box-shadow .3s" }}>
                <div className="card-h">Billing Plans</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[{ name: "Free", price: "€0", color: "#6B7280", features: ["5 suppliers", "1 user"] }, { name: "Pro", price: "€149/mo", color: "#1B3D2B", features: ["Unlimited", "5 users", "AI assistant"] }, { name: "Enterprise", price: "€499/mo", color: "#7C3AED", features: ["Unlimited", "Unlimited users", "SSO"] }].map((p, pi) => (
                    <div key={p.name} style={{ border: `1.5px solid ${pi === 1 ? "#1B3D2B" : "#E5E7EB"}`, borderRadius: 10, padding: 12, background: pi === 1 ? "#F8FAF8" : "#fff" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#0b0f0c", marginBottom: 2 }}>{p.name}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: p.color, marginBottom: 8 }}>{p.price}</div>
                      {p.features.map(f => <div key={f} style={{ fontSize: 10.5, color: "#6b7280", marginBottom: 3 }}>✓ {f}</div>)}
                      {pi === 1 && <button id="btn-trial" className={`btn-g${actionIdx === 2 ? " hl" : ""}`} style={{ width: "100%", fontSize: 11, marginTop: 8 }}>Start free trial</button>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SCREENS = [RegisterScreen, OtpScreen, DashboardScreen, SuppliersScreen, ComplaintsScreen, ActionsScreen, KpiScreen, ReportsScreen, TeamScreen];

// ── Main demo component ───────────────────────────────────────────────────────
export default function DemoPage() {
  const [step, setStep] = useState(0);
  const [actionIdx, setActionIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [narrating, setNarrating] = useState(false);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [progressPct, setProgressPct] = useState(0);
  const [currentNarr, setCurrentNarr] = useState(STEPS[0].narration);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const actionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const speak = useCallback((text: string) => {
    if (muted || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.92;
    utter.pitch = 1;
    // Pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang === "en-US" && (v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Daniel") || v.name.includes("Google")));
    if (preferred) utter.voice = preferred;
    utter.onstart = () => setNarrating(true);
    utter.onend = () => setNarrating(false);
    utter.onerror = () => setNarrating(false);
    speechRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [muted]);

  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setNarrating(false);
  }, []);

  const runActions = useCallback((stepIdx: number) => {
    if (actionTimerRef.current) clearInterval(actionTimerRef.current);
    setActionIdx(-1);
    const actions = STEPS[stepIdx].actions;
    if (!actions.length) return;
    let i = 0;
    setActionIdx(0);
    actionTimerRef.current = setInterval(() => {
      i++;
      if (i >= actions.length) {
        setActionIdx(-1);
        clearInterval(actionTimerRef.current!);
      } else {
        setActionIdx(i);
      }
    }, 2200);
  }, []);

  const goTo = useCallback((i: number, autoPlay = false) => {
    setStep(i);
    setVisited(v => new Set([...v, i]));
    setProgressPct(0);
    setCurrentNarr(STEPS[i].narration);
    stopSpeech();
    if (actionTimerRef.current) clearInterval(actionTimerRef.current);
    setActionIdx(-1);
    if (autoPlay || playing) {
      setTimeout(() => {
        speak(STEPS[i].narration);
        runActions(i);
      }, 300);
    }
  }, [playing, speak, runActions, stopSpeech]);

  const totalDuration = 9000;

  const startProgress = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current);
    setProgressPct(0);
    const tick = 80;
    progressRef.current = setInterval(() => {
      setProgressPct(p => Math.min(100, p + (tick / totalDuration) * 100));
    }, tick);
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setStep(s => {
        const next = (s + 1) % STEPS.length;
        setVisited(v => new Set([...v, next]));
        setProgressPct(0);
        setCurrentNarr(STEPS[next].narration);
        stopSpeech();
        if (actionTimerRef.current) clearInterval(actionTimerRef.current);
        setTimeout(() => {
          speak(STEPS[next].narration);
          runActions(next);
        }, 300);
        return next;
      });
    }, totalDuration);
    startProgress();
  }, [speak, runActions, stopSpeech, startProgress]);

  const stopAll = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    if (actionTimerRef.current) clearInterval(actionTimerRef.current);
    stopSpeech();
  }, [stopSpeech]);

  useEffect(() => {
    if (playing) {
      startTimer();
      speak(STEPS[step].narration);
      runActions(step);
    } else {
      stopAll();
    }
    return stopAll;
  }, [playing]);

  useEffect(() => {
    if (muted) stopSpeech();
  }, [muted]);

  const overallProgress = ((step) / STEPS.length) * 100 + (progressPct / STEPS.length);
  const Screen = SCREENS[step];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="shell">
        {/* Top bar */}
        <div className="topbar">
          <a href="/" className="logo">LkSG<em>Compass</em></a>
          <div className="topbar-r">
            <div className="badge">Interactive Product Demo</div>
            <a href="/register" className="cta">Start free trial →</a>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress">
          <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
        </div>

        {/* Body */}
        <div className="body">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-h">Product Tour</div>
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                className={`step-btn${step === i ? " active" : ""}${visited.has(i) && step !== i ? " done" : ""}`}
                onClick={() => { goTo(i); setPlaying(false); }}
              >
                <div className="step-n">{i + 1}</div>
                <div className="step-info">
                  <div className="step-t">{s.title}</div>
                  <div className="step-s">{s.sub}</div>
                </div>
                <div className="step-ck">✓</div>
              </button>
            ))}
          </div>

          {/* Main */}
          <div className="main">
            {/* Screen */}
            <div className="screen-area">
              {SCREENS.map((S, i) => (
                <div key={i} className={`screen${step === i ? " vis" : ""}`}>
                  <S actionIdx={step === i ? actionIdx : -1} />
                </div>
              ))}
            </div>

            {/* Narration bar */}
            <div className="narration">
              <div className={`narr-icon${narrating ? " speaking" : ""}`}>🎙</div>
              <div className="narr-text">"{currentNarr.slice(0, 140)}{currentNarr.length > 140 ? "…" : ""}"</div>
              <button className="narr-mute" onClick={() => setMuted(m => !m)}>
                {muted ? "🔇 Unmute" : "🔊 Mute"}
              </button>
            </div>

            {/* Controls */}
            <div className="controls">
              <button className="ctrl-btn" disabled={step === 0} onClick={() => { goTo(Math.max(0, step - 1)); setPlaying(false); }}>← Back</button>
              <div className="ctrl-mid">
                <div className="dots">
                  {STEPS.map((_, i) => (
                    <div key={i} className={`dot${step === i ? " on" : ""}`} onClick={() => { goTo(i); setPlaying(false); }} />
                  ))}
                </div>
                <button className="play-btn" onClick={() => setPlaying(p => !p)}>
                  {playing ? "⏸ Pause" : "▶ Play all"} — {STEPS[step].title}
                </button>
              </div>
              {step < STEPS.length - 1 ? (
                <button className="ctrl-btn pri" onClick={() => { goTo(step + 1); setPlaying(false); }}>Next →</button>
              ) : (
                <a href="/register" className="ctrl-btn pri" style={{ textDecoration: "none" }}>Get started →</a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
