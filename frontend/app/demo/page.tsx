"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type UiState = Record<string, any>;
type Frame = { duration: number; narration: string; ui: UiState };
type Scene = { id: string; title: string; subtitle: string; law: string; frames: Frame[] };

// ─── SCENE DATA ───────────────────────────────────────────────────────────────
const SCENES: Scene[] = [
  { id:"register", title:"Create Account", subtitle:"60-second onboarding", law:"§4 LkSG", frames:[
    { duration:3500, narration:"Welcome to LkSGCompass. Click 'Get started free' to open the registration form.", ui:{step:"empty"} },
    { duration:3000, narration:"Type your company name — LkSGCompass creates an isolated multi-tenant workspace just for you.", ui:{step:"company"} },
    { duration:3000, narration:"Enter your business email and a secure password. 14-day free trial, no credit card.", ui:{step:"full"} },
    { duration:3500, narration:"Click 'Create account' — a 6-digit OTP is sent to your email for secure verification.", ui:{step:"submit"} },
    { duration:4000, narration:"Enter the code. Your compliance workspace is live and ready in under 60 seconds.", ui:{step:"otp"} },
  ]},
  { id:"dashboard", title:"Dashboard", subtitle:"Compliance health at a glance", law:"§9 LkSG", frames:[
    { duration:4000, narration:"The dashboard shows your compliance score — 72 out of 100, Grade B. Calculated as 55% risk quality plus 45% process quality per §9 LkSG.", ui:{hl:"score", modal:null} },
    { duration:4000, narration:"The BAFA readiness checklist shows exactly what's missing. HR Officer assigned, risk analysis done — but the Complaints Officer field is empty, a legal requirement under §4.", ui:{hl:"bafa", modal:null} },
    { duration:4500, narration:"Click 'Add Supplier' to open the form. Fill in name, country and industry — the risk engine scores the supplier automatically using 190 country profiles.", ui:{hl:"addsup", modal:"new-supplier"} },
    { duration:4500, narration:"The risk score is calculated and saved. Country risk, industry weighting, and missing controls each contribute to the final score.", ui:{hl:null, modal:"supplier-saved"} },
  ]},
  { id:"suppliers", title:"Supplier Register", subtitle:"Automated §5 risk scoring", law:"§5 LkSG", frames:[
    { duration:4000, narration:"The supplier register lists all 5 suppliers ranked by risk score. Shenzhen Parts in China is flagged high-risk at 78 out of 100.", ui:{hl:null, modal:null} },
    { duration:4500, narration:"Click on Shenzhen Parts to open the risk breakdown. Country risk adds 35 points, missing Code of Conduct adds 12, missing audit adds 13.", ui:{hl:"shenzhen", modal:"risk-detail"} },
    { duration:4000, narration:"Click 'Excel Import' to bulk-upload. Upload an XLSX file — column detection is automatic, even recognising Turkish headers like BİNA and YÖN TELEFONU.", ui:{hl:"excel", modal:"excel-import"} },
    { duration:4000, narration:"The import preview maps columns automatically. Review 48 rows before confirming. Import dozens of suppliers in seconds, not hours.", ui:{hl:null, modal:"excel-preview"} },
  ]},
  { id:"complaints", title:"Complaint Management", subtitle:"Whistleblowing & §8 LkSG", law:"§8 LkSG", frames:[
    { duration:4000, narration:"The complaints module handles your §8 LkSG and Whistleblower Protection Act obligations. A public anonymous portal URL is created automatically for your company.", ui:{hl:"portal", modal:null} },
    { duration:4500, narration:"A critical complaint has arrived — child labor at a Tier-2 supplier. Under LkSG you must acknowledge within 7 days and investigate within 3 months.", ui:{hl:"critical", modal:null} },
    { duration:4500, narration:"Open the complaint to see the full case: description, legal category, deadlines and audit trail. Every status change is timestamped.", ui:{hl:null, modal:"complaint-detail"} },
    { duration:4000, narration:"Click 'Create CAP' to link this complaint to a Corrective Action Plan. The CAP is pre-filled with supplier, §7 LkSG reference and deadline.", ui:{hl:null, modal:"cap-from-complaint"} },
  ]},
  { id:"actions", title:"Action Plans", subtitle:"CAP tracking & evidence", law:"§6 & §7 LkSG", frames:[
    { duration:4000, narration:"The action plan view lists all CAPs with priority, due date and progress. Red items are overdue — each one directly reduces your compliance score.", ui:{hl:"overdue", modal:null} },
    { duration:4500, narration:"Open an overdue CAP to update progress, add notes, and change the status from open to in-progress. Assignee and LkSG paragraph are tracked.", ui:{hl:null, modal:"cap-detail"} },
    { duration:4500, narration:"Click 'Attach Evidence'. Upload a document — it's stored with 7-year retention as required by §10 Abs.1 LkSG. The retention date is shown automatically.", ui:{hl:null, modal:"cap-evidence"} },
  ]},
  { id:"legal", title:"Legal Assistant", subtitle:"Templates, Q&A & contract review", law:"§6 Abs.2 LkSG", frames:[
    { duration:4500, narration:"The new Legal Assistant module contains 6 ready-to-use LkSG document templates — including Supplier Code of Conduct, contract clause addenda, SAQ questionnaires and whistleblower policy.", ui:{view:"templates"} },
    { duration:4500, narration:"Click 'Generate document' to have Claude write a complete, legally structured Supplier Code of Conduct in German or English — covering all §2 LkSG categories.", ui:{view:"templates", modal:"coc-generating"} },
    { duration:4000, narration:"The Legal Q&A answers specific LkSG questions — for example: which obligations apply to Tier-2 suppliers? Responses include paragraph references and action steps.", ui:{view:"ask"} },
    { duration:4500, narration:"Paste any contract text into Contract Review. The AI checks LkSG coverage, flags missing audit rights or CoC obligations, and suggests specific improvements.", ui:{view:"review"} },
  ]},
  { id:"reports", title:"BAFA Report", subtitle:"AI-generated, audit-ready", law:"§9 LkSG", frames:[
    { duration:4000, narration:"The report module tracks all 6 BAFA sections — §5 through §10. Status shows which are complete, in progress, or still open.", ui:{hl:"sections", modal:null} },
    { duration:4500, narration:"Click 'AI Draft'. Claude reads your actual compliance data — suppliers, risk scores, CAPs, complaints — and writes a structured German BAFA report in seconds.", ui:{hl:"ai-btn", modal:"ai-generating"} },
    { duration:4500, narration:"The draft covers each required section with real numbers. Submit for team approval — the approval workflow creates a full audit trail.", ui:{hl:null, modal:"ai-draft-done"} },
    { duration:4000, narration:"Export as PDF. The structured BAFA-ready document includes timestamp, company data and approval signature. Ready to submit to BAFA.", ui:{hl:"pdf", modal:"pdf-export"} },
  ]},
  { id:"defense", title:"BAFA Defense File", subtitle:"One-click audit documentation", law:"§10 LkSG", frames:[
    { duration:4500, narration:"New: the BAFA Defense File export generates a complete structured JSON document with all §5 through §10 compliance evidence — organized exactly how BAFA expects it.", ui:{view:"defense"} },
    { duration:4500, narration:"It includes risk analysis data, all CAPs with completion status, complaint records, SAQ response rates, KPI evidence and a 200-entry audit trail — all timestamped.", ui:{view:"defense", highlight:"sections"} },
    { duration:4000, narration:"Download in one click. Use this as the starting point for your lawyer when BAFA initiates a control procedure. Previously this took days to compile manually.", ui:{view:"defense", highlight:"download"} },
  ]},
  { id:"team", title:"Team & Billing", subtitle:"Multi-user collaboration", law:"Pro Plan", frames:[
    { duration:4000, narration:"Go to Settings, Team tab. Enter a colleague's email and click 'Send invite'. They receive a secure JWT-signed invitation link valid for 7 days.", ui:{hl:"invite", modal:null} },
    { duration:4000, narration:"The invitation email links to a registration page pre-filled with your workspace. The colleague sets a password and joins instantly.", ui:{hl:null, modal:"invite-sent"} },
    { duration:4500, narration:"Upgrade to Pro for 149 euros per month: unlimited suppliers, AI assistant, up to 5 team members and all premium features. Start with a 14-day free trial — no credit card.", ui:{hl:"billing", modal:"billing-upgrade"} },
  ]},
];

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body{font-family:'DM Sans',system-ui,sans-serif;background:#060d05;color:#fff;height:100%;overflow:hidden}
  .shell{display:grid;grid-template-rows:48px 2px 36px 1fr 56px;height:100vh;overflow:hidden}
  .tb{display:flex;align-items:center;justify-content:space-between;padding:0 20px;background:rgba(6,13,5,.97);border-bottom:1px solid rgba(255,255,255,.07)}
  .logo{font-size:15px;font-weight:800;color:#fff;text-decoration:none}.logo em{font-style:normal;color:rgba(255,255,255,.3)}
  .tb-r{display:flex;align-items:center;gap:10px}
  .tb-badge{font-size:10px;font-weight:700;color:#4ade80;background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.2);padding:3px 9px;border-radius:99px;letter-spacing:.3px}
  .tb-cta{background:#1B3D2B;color:#fff;border:none;border-radius:7px;padding:6px 15px;font-size:12.5px;font-weight:700;cursor:pointer;text-decoration:none;transition:all .2s}
  .tb-cta:hover{background:#2d5c3f}
  .prog{background:rgba(255,255,255,.05)}
  .prog-fill{height:2px;background:linear-gradient(90deg,#1B3D2B,#4ade80);transition:width .1s linear}
  .scene-tabs{display:flex;overflow-x:auto;padding:0 12px;background:rgba(255,255,255,.02);border-bottom:1px solid rgba(255,255,255,.05);scrollbar-width:none;align-items:center}
  .scene-tabs::-webkit-scrollbar{display:none}
  .stab{display:flex;align-items:center;gap:6px;padding:0 13px;height:36px;cursor:pointer;border-bottom:2px solid transparent;color:rgba(255,255,255,.35);font-size:11.5px;font-weight:700;white-space:nowrap;transition:all .2s;flex-shrink:0}
  .stab:hover{color:rgba(255,255,255,.7)}
  .stab.on{color:#4ade80;border-bottom-color:#4ade80}
  .stab-n{width:18px;height:18px;border-radius:5px;background:rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:800;transition:all .2s}
  .stab.on .stab-n{background:#1B3D2B;color:#4ade80}
  .stab.done .stab-n{background:rgba(74,222,128,.15);color:#4ade80}
  .body{display:grid;grid-template-columns:1fr 300px;overflow:hidden;height:100%}
  .vp{position:relative;overflow:hidden;background:#0d170b}
  .vp-frame{position:absolute;inset:0;opacity:0;transform:translateY(5px) scale(.995);transition:opacity .35s,transform .35s;pointer-events:none}
  .vp-frame.vis{opacity:1;transform:none;pointer-events:auto}
  .rp{display:flex;flex-direction:column;border-left:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.015);overflow:hidden}
  .rp-info{padding:16px 18px 14px;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0}
  .rp-law{font-size:9.5px;font-weight:800;color:#4ade80;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:5px}
  .rp-title{font-size:15.5px;font-weight:800;color:#fff;letter-spacing:-.3px;margin-bottom:2px}
  .rp-sub{font-size:11.5px;color:rgba(255,255,255,.4)}
  .rp-narr{flex:1;padding:14px 18px;overflow-y:auto;display:flex;flex-direction:column;gap:10px}
  .nb{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-left:2.5px solid rgba(255,255,255,.1);border-radius:10px;padding:12px;font-size:12.5px;color:rgba(255,255,255,.55);line-height:1.65;transition:all .3s;cursor:pointer}
  .nb:hover{background:rgba(255,255,255,.06)}
  .nb.on{background:rgba(27,61,43,.4);border-left-color:#4ade80;color:#fff}
  .nb-step{font-size:10px;font-weight:800;color:rgba(255,255,255,.25);margin-bottom:5px;letter-spacing:.5px}
  .nb.on .nb-step{color:#4ade80}
  .ctrl{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;background:#080e07;border-top:1px solid rgba(255,255,255,.06);flex-shrink:0}
  .cb{display:flex;align-items:center;gap:5px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.6);font-size:12px;font-weight:700;padding:7px 13px;border-radius:7px;cursor:pointer;transition:all .15s;white-space:nowrap}
  .cb:hover{background:rgba(255,255,255,.1);color:#fff}
  .cb:disabled{opacity:.2;cursor:not-allowed}
  .cb.p{background:#1B3D2B;border-color:#1B3D2B;color:#fff}
  .cb.p:hover{background:#2d5c3f}
  .cc{display:flex;flex-direction:column;align-items:center;gap:8px}
  .fdots{display:flex;gap:3px}
  .fd{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.15);cursor:pointer;transition:all .25s}
  .fd.on{background:#4ade80;width:14px;border-radius:3px}
  .fd.done{background:rgba(74,222,128,.4)}
  .play-btn{display:flex;align-items:center;gap:5px;background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.2);color:#4ade80;font-size:11px;font-weight:700;padding:4px 12px;border-radius:99px;cursor:pointer;transition:all .15s}
  .play-btn:hover{background:rgba(74,222,128,.18)}
  .timer{width:180px;height:2px;background:rgba(255,255,255,.07);border-radius:1px;overflow:hidden}
  .timer-fill{height:100%;background:#4ade80;transition:width .1s linear}
  .bbar{display:flex;align-items:center;gap:7px;padding:7px 12px;background:#192017;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0}
  .bdots{display:flex;gap:4px}
  .bdot{width:8px;height:8px;border-radius:50%}
  .burl{flex:1;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:5px;padding:3px 9px;font-size:10.5px;color:rgba(255,255,255,.3);font-family:monospace;display:flex;align-items:center;gap:4px}
  .lock{color:#4ade80;font-size:9.5px}
  .app{display:grid;grid-template-columns:180px 1fr;height:100%;background:#f0f2f0}
  .nav{background:#1B3D2B;display:flex;flex-direction:column}
  .nlogo{padding:12px 12px 10px;border-bottom:1px solid rgba(255,255,255,.09);font-size:13px;font-weight:800;color:#fff}
  .nlogo em{font-style:normal;color:rgba(255,255,255,.3)}
  .nlinks{padding:8px 5px;display:flex;flex-direction:column;gap:1px}
  .ni{display:flex;align-items:center;gap:6px;padding:7px 8px;border-radius:7px;font-size:11.5px;font-weight:600;color:rgba(255,255,255,.45)}
  .ni.on{background:rgba(255,255,255,.11);color:#fff}
  .ni-d{width:4px;height:4px;border-radius:50%;background:currentColor;opacity:.4;flex-shrink:0}
  .amain{display:flex;flex-direction:column;overflow:hidden}
  .ah{padding:11px 17px;border-bottom:1.5px solid #e4e6e4;background:#fff;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
  .ah-h{font-size:14px;font-weight:800;color:#0b0f0c;letter-spacing:-.3px}
  .ac{flex:1;overflow-y:auto;padding:13px 17px;display:flex;flex-direction:column;gap:10px}
  .c{background:#fff;border:1.5px solid #e4e6e4;border-radius:12px;padding:13px}
  .c-h{font-size:11.5px;font-weight:800;color:#0b0f0c;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between}
  .ctg{font-size:9px;font-weight:700;color:#1B3D2B;background:#f0f5f1;border:1px solid #d1e7d9;padding:1px 6px;border-radius:4px}
  .sg{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
  .sc{background:#fff;border:1.5px solid #e4e6e4;border-radius:10px;padding:10px}
  .sc-n{font-size:20px;font-weight:800;color:#0b0f0c;letter-spacing:-.5px}
  .sc-l{font-size:9px;color:#9CA3AF;font-weight:700;text-transform:uppercase;letter-spacing:.4px}
  .green{color:#16A34A}.red{color:#DC2626}.amber{color:#D97706}
  .br{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1.5px solid #F3F4F6}
  .br:last-child{border:none}
  .bm{flex:1;min-width:0}
  .bn{font-size:12px;font-weight:700;color:#0b0f0c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .bs{font-size:10.5px;color:#9CA3AF;margin-top:1px}
  .bh{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;font-size:10px;font-weight:700;padding:1px 7px;border-radius:4px;white-space:nowrap}
  .bm2{background:#FFFBEB;color:#D97706;border:1px solid #FDE68A;font-size:10px;font-weight:700;padding:1px 7px;border-radius:4px;white-space:nowrap}
  .bl{background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0;font-size:10px;font-weight:700;padding:1px 7px;border-radius:4px;white-space:nowrap}
  .bar{height:5px;background:#F3F4F6;border-radius:3px;overflow:hidden}
  .bar-f{height:100%;border-radius:3px}
  .gf{background:#22c55e}.af{background:#f59e0b}.rf{background:#ef4444}
  .bg{background:#1B3D2B;color:#fff;border:none;border-radius:7px;padding:5px 11px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;transition:all .2s}
  .bg:hover,.bg.hl{background:#2d5c3f;box-shadow:0 0 0 3px rgba(74,222,128,.35)}
  .bs2{background:#F3F4F6;color:#374151;border:none;border-radius:7px;padding:5px 11px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap}
  .bs2:hover,.bs2.hl{background:#E5E7EB;box-shadow:0 0 0 3px rgba(59,130,246,.25)}
  .cl{display:flex;flex-direction:column;gap:5px}
  .ci{display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:6px;background:#F9FAFB;font-size:11px;font-weight:600;color:#374151}
  .ci.ok{background:#F0FDF4;color:#16A34A}.ci.warn{background:#FFFBEB;color:#D97706}.ci.err{background:#FEF2F2;color:#DC2626}
  .ci-d{width:13px;height:13px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;flex-shrink:0}
  .ok .ci-d{background:#16A34A;color:#fff}.warn .ci-d{background:#D97706;color:#fff}.err .ci-d{background:#DC2626;color:#fff}
  .fc{background:#fff;border:1.5px solid #e4e6e4;border-radius:12px;padding:20px;max-width:350px;margin:12px auto}
  .fh{font-size:17px;font-weight:800;color:#0b0f0c;margin-bottom:4px;letter-spacing:-.3px}
  .fs{font-size:12px;color:#6b7280;margin-bottom:14px;line-height:1.5}
  .ff{margin-bottom:10px}
  .fl{font-size:9.5px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.7px;display:block;margin-bottom:4px}
  .fi{width:100%;padding:8px 11px;border:1.5px solid #e4e6e4;border-radius:8px;font-size:12.5px;color:#0b0f0c;background:#f9fafb;transition:border-color .2s}
  .fi.on{border-color:#1B3D2B;background:#fff}
  .fsb{width:100%;padding:10px;background:#1B3D2B;color:#fff;border:none;border-radius:8px;font-size:12.5px;font-weight:800;cursor:pointer;margin-top:3px;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .2s}
  .fsb.pulse{background:#2d5c3f;transform:scale(.97)}
  .otp-r{display:flex;gap:6px;justify-content:center;margin:3px 0 13px}
  .otp-b{width:40px;height:50px;border:1.5px solid #e4e6e4;border-radius:8px;font-size:22px;font-weight:800;text-align:center;font-family:monospace;background:#f9fafb;display:flex;align-items:center;justify-content:center;color:#9ca3af;transition:all .2s}
  .otp-b.on{border-color:#1B3D2B;background:#f0f5f1;color:#1B3D2B}
  .overlay{position:absolute;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(2px);z-index:30;display:flex;align-items:center;justify-content:center;animation:fIn .2s ease}
  @keyframes fIn{from{opacity:0}to{opacity:1}}
  .modal{background:#fff;border-radius:14px;padding:20px;width:320px;box-shadow:0 20px 60px rgba(0,0,0,.3);animation:sUp .25s cubic-bezier(.4,0,.2,1)}
  @keyframes sUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
  .mh{font-size:14px;font-weight:800;color:#0b0f0c;margin-bottom:3px;letter-spacing:-.2px}
  .ms{font-size:11.5px;color:#6b7280;margin-bottom:13px;line-height:1.5}
  .mf{margin-bottom:9px}
  .ml{font-size:9.5px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.6px;display:block;margin-bottom:4px}
  .mi{width:100%;padding:8px 10px;border:1.5px solid #e4e6e4;border-radius:7px;font-size:12.5px;color:#0b0f0c;background:#f9fafb}
  .mi.on{border-color:#1B3D2B;background:#fff}
  .msub{width:100%;padding:10px;background:#1B3D2B;color:#fff;border:none;border-radius:8px;font-size:12.5px;font-weight:800;cursor:pointer;margin-top:3px;display:flex;align-items:center;justify-content:center;gap:6px}
  .mrow{display:flex;gap:7px}
  .rrow{display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #F3F4F6;font-size:11.5px}
  .rrow:last-child{border:none}
  .rscore{font-size:19px;font-weight:800;color:#DC2626}
  .gen-a{display:flex;align-items:center;gap:8px;padding:11px 13px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:9px;margin-bottom:11px}
  .gdot{width:7px;height:7px;border-radius:50%;background:#16A34A;animation:bd 1s infinite}
  .gdot:nth-child(2){animation-delay:.2s}.gdot:nth-child(3){animation-delay:.4s}
  @keyframes bd{0%,100%{opacity:.25}50%{opacity:1}}
  .sbadge{display:inline-flex;align-items:center;gap:5px;background:#F0FDF4;border:1px solid #BBF7D0;color:#16A34A;font-size:12px;font-weight:700;padding:5px 11px;border-radius:7px;margin-bottom:10px}
  .hl-row{background:rgba(74,222,128,.07);border-radius:9px}
  .hl-btn{animation:btnGlow 1.5s ease-out}
  @keyframes btnGlow{0%{box-shadow:0 0 0 0 rgba(74,222,128,.7)}70%{box-shadow:0 0 0 8px rgba(74,222,128,0)}100%{box-shadow:none}}
  .ring{position:relative;width:76px;height:76px;margin:0 auto 7px}
  .ring svg{position:absolute;inset:0;transform:rotate(-90deg)}
  .ring-n{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
  @media(max-width:860px){.body{grid-template-columns:1fr}.rp{display:none}.shell{grid-template-rows:48px 2px 36px 1fr 56px}}
`;

// ─── NAV HELPER ───────────────────────────────────────────────────────────────
function Nav({ active }: { active: string }) {
  return (
    <div className="nav">
      <div className="nlogo">LkSG<em>Compass</em></div>
      <div className="nlinks">
        {[["dashboard","Dashboard"],["suppliers","Suppliers"],["complaints","Complaints"],["actions","Actions"],["legal","Legal Asst."],["kpi","KPIs"],["reports","BAFA Report"],["settings","Settings"]].map(([id,label]) => (
          <div key={id} className={`ni${active===id?" on":""}`}><div className="ni-d"/>{label}</div>
        ))}
      </div>
    </div>
  );
}

function BW({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div className="bbar">
        <div className="bdots"><div className="bdot" style={{background:"#ef4444"}}/><div className="bdot" style={{background:"#f59e0b"}}/><div className="bdot" style={{background:"#22c55e"}}/></div>
        <div className="burl"><span className="lock">🔒</span>{url}</div>
      </div>
      <div style={{ flex:1, overflow:"hidden", position:"relative" }}>{children}</div>
    </div>
  );
}

// ─── FRAME RENDERERS ──────────────────────────────────────────────────────────
function RegisterFrame({ ui }: { ui: UiState }) {
  const s = ui.step;
  if (s === "otp") return (
    <BW url="lksgcompass.de/register">
      <div style={{background:"#f0f2f0",overflow:"auto",height:"100%"}}>
        <div className="fc">
          <div className="fh">Check your email</div>
          <div className="fs">6-digit code sent to <strong>max@muster-auto.de</strong></div>
          <div style={{background:"#f0f5f1",border:"1px solid #d1e7d9",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#1B3D2B",marginBottom:13}}>✓ Code sent — expires in 15 minutes</div>
          <div className="otp-r">{["4","7","3","","",""].map((d,i)=><div key={i} className={`otp-b${d?" on":""}`}>{d}</div>)}</div>
          <div className="fsb" style={{opacity:.5}}>Confirm code</div>
        </div>
      </div>
    </BW>
  );
  return (
    <BW url="lksgcompass.de/register">
      <div style={{background:"#f0f2f0",overflow:"auto",height:"100%"}}>
        <div className="fc">
          <div className="fh">Create your account</div>
          <div className="fs">LkSG compliance workspace in 60 seconds. Free trial, no credit card.</div>
          <div className="ff"><label className="fl">Company Name</label><div className={`fi${s!=="empty"?" on":""}`} style={{color:s!=="empty"?"#0b0f0c":"#9ca3af"}}>{s!=="empty"?"Muster Automotive GmbH":""}</div></div>
          <div className="ff"><label className="fl">Business Email</label><div className={`fi${["full","submit"].includes(s)?" on":""}`} style={{color:["full","submit"].includes(s)?"#0b0f0c":"#9ca3af"}}>{["full","submit"].includes(s)?"max@muster-auto.de":""}</div></div>
          <div className="ff"><label className="fl">Password</label><div className={`fi${["full","submit"].includes(s)?" on":""}`} style={{color:"#9ca3af"}}>{["full","submit"].includes(s)?"••••••••••":""}</div></div>
          <div className={`fsb${s==="submit"?" pulse":""}`} style={{opacity:s==="empty"?.4:1}}>{s==="submit"?"Creating workspace…":"Create account →"}</div>
          <div style={{textAlign:"center",fontSize:11,color:"#9ca3af",marginTop:9}}>✓ 14-day free trial · No credit card</div>
        </div>
      </div>
    </BW>
  );
}

function DashboardFrame({ ui }: { ui: UiState }) {
  const { hl, modal } = ui;
  return (
    <BW url="lksgcompass.de/app/dashboard">
      <div className="app">
        <Nav active="dashboard"/>
        <div className="amain">
          <div className="ah">
            <div className="ah-h">Dashboard</div>
            <div style={{display:"flex",gap:6}}>
              <button className="bs2" style={{fontSize:10}}>↻</button>
              <button className={`bg${hl==="addsup"?" hl-btn":""}`} style={{fontSize:10}}>+ Add Supplier</button>
            </div>
          </div>
          <div className="ac">
            <div className={`sg${hl==="score"?" hl-row":""}`}>
              {[["72","Score","green"],["5","Suppliers",""],["2","Open CAPs","red"],["1","Complaints","amber"]].map(([n,l,c])=>(
                <div key={l} className="sc"><div className={`sc-n ${c}`}>{n}</div><div className="sc-l">{l}</div></div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div className="c"><div className="c-h">Risk Portfolio <span className="ctg">§5</span></div>
                {[["High","1","h"],["Medium","2","m"],["Low","2","l"]].map(([l,n,t])=>(
                  <div key={String(l)} className="br"><div className="bm"><div className="bn">{String(l)}</div><div className="bs">{n} supplier{n==="1"?"":"s"}</div></div><span className={`b${t}`}>{t==="h"?"20%":t==="m"?"40%":"40%"}</span></div>
                ))}
              </div>
              <div className={`c${hl==="bafa"?" hl-row":""}`}><div className="c-h">BAFA Readiness</div>
                <div className="cl">
                  {[["ok","§4 HR Officer ✓"],["ok","§5 Risk analysis ✓"],["warn","§6 CAPs: 2 open"],["err","§8 Officer missing"]].map(([t,l])=>(
                    <div key={String(l)} className={`ci ${t}`}><div className="ci-d">{t==="ok"?"✓":t==="warn"?"!":"✕"}</div>{String(l)}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {modal==="new-supplier" && <div className="overlay"><div className="modal">
        <div className="mh">Add New Supplier</div><div className="ms">Risk engine scores automatically from 190 country profiles.</div>
        <div className="mf"><label className="ml">Supplier Name</label><div className="mi on">Ankara Tekstil A.Ş.</div></div>
        <div className="mrow"><div style={{flex:1}}><label className="ml">Country</label><div className="mi on">Turkey</div></div><div style={{flex:1}}><label className="ml">Industry</label><div className="mi on">Textile</div></div></div>
        <div className="msub">Calculate Risk & Save →</div>
      </div></div>}
      {modal==="supplier-saved" && <div className="overlay"><div className="modal">
        <div className="sbadge">✓ Supplier added — Risk scored</div>
        <div className="mh">Ankara Tekstil A.Ş.</div><div className="ms">Country, industry & profile data analysed.</div>
        {[["Country Risk (Turkey)","+28 pts"],["Industry (Textile)","+15 pts"],["No Audit","+12 pts"],["No CoC","+8 pts"]].map(([l,v])=>(
          <div key={l} className="rrow"><span style={{color:"#374151"}}>{l}</span><span style={{color:"#DC2626",fontWeight:700}}>{v}</span></div>
        ))}
        <div style={{marginTop:9,padding:"8px 11px",background:"#FEF2F2",borderRadius:8,border:"1px solid #FECACA",display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:12.5,fontWeight:700}}>Final Score</span><span className="rscore">52 — Medium</span>
        </div>
      </div></div>}
    </BW>
  );
}

function SuppliersFrame({ ui }: { ui: UiState }) {
  const { hl, modal } = ui;
  return (
    <BW url="lksgcompass.de/app/suppliers">
      <div className="app"><Nav active="suppliers"/>
        <div className="amain">
          <div className="ah"><div className="ah-h">Suppliers <span style={{fontSize:11,color:"#9CA3AF"}}>5 total</span></div>
            <div style={{display:"flex",gap:6}}>
              <button className={`bs2${hl==="excel"?" hl-btn":""}`} style={{fontSize:10}}>📤 Excel Import</button>
              <button className="bg" style={{fontSize:10}}>+ New</button>
            </div>
          </div>
          <div className="ac"><div className="c">
            {[{id:"shenzhen",n:"Shenzhen Parts Co.",c:"🇨🇳 China",i:"Electronics",s:78,r:"h"},{id:"ankara",n:"Ankara Tekstil",c:"🇹🇷 Turkey",i:"Textile",s:52,r:"m"},{id:"hanoi",n:"Hanoi Electro",c:"🇻🇳 Vietnam",i:"Electronics",s:61,r:"m"},{id:"schmidt",n:"Schmidt Logistik",c:"🇩🇪 Germany",i:"Logistics",s:18,r:"l"},{id:"warsaw",n:"Warsaw Auto Parts",c:"🇵🇱 Poland",i:"Automotive",s:24,r:"l"}].map(s=>(
              <div key={s.n} className={`br${hl==="shenzhen"&&s.r==="h"?" hl-row":""}`}>
                <div className="bm"><div className="bn">{s.n}</div><div className="bs">{s.c} · {s.i}</div></div>
                <div className="bar" style={{width:60,marginRight:7}}><div className={`bar-f ${s.r==="h"?"rf":s.r==="m"?"af":"gf"}`} style={{width:`${s.s}%`}}/></div>
                <span className={`b${s.r}`}>{s.r==="h"?"High":s.r==="m"?"Medium":"Low"}</span>
              </div>
            ))}
          </div></div>
        </div>
      </div>
      {modal==="risk-detail"&&<div className="overlay"><div className="modal">
        <div className="mh">🇨🇳 Shenzhen Parts Co.</div><div className="ms">§5 LkSG full risk breakdown</div>
        {[["Country Risk (China)","🔴 +35"],["Industry (Electronics)","🟠 +18"],["No Code of Conduct","🔴 +12"],["No Audit Report","🔴 +13"]].map(([l,v])=>(
          <div key={l} className="rrow"><span style={{color:"#374151",fontSize:12}}>{l}</span><span style={{color:"#DC2626",fontWeight:700}}>{v}</span></div>
        ))}
        <div style={{marginTop:9,padding:"8px 11px",background:"#FEF2F2",borderRadius:8,border:"1px solid #FECACA",display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:12.5,fontWeight:700}}>Score</span><span className="rscore">78/100 — High</span>
        </div>
        <div className="msub" style={{marginTop:10}}>Create Corrective Action Plan →</div>
      </div></div>}
      {modal==="excel-import"&&<div className="overlay"><div className="modal">
        <div className="mh">📤 Excel Import</div><div className="ms">Column detection is automatic — even Turkish headers.</div>
        <div style={{border:"2px dashed #d1e7d9",borderRadius:9,padding:"20px",textAlign:"center",background:"#f0f5f1",marginBottom:11}}>
          <div style={{fontSize:24,marginBottom:5}}>📊</div>
          <div style={{fontSize:12,fontWeight:700,color:"#1B3D2B"}}>suppliers_2024.xlsx</div>
          <div style={{fontSize:10.5,color:"#6b7280",marginTop:2}}>48 rows · 8 columns detected</div>
        </div>
        <div className="msub">Detect columns & preview →</div>
      </div></div>}
      {modal==="excel-preview"&&<div className="overlay"><div className="modal">
        <div className="mh">Column Mapping</div><div className="ms">Auto-detected. Review before importing.</div>
        {[["BİNA / APT İSMİ","→ Company Name","✓"],["ÜLKE","→ Country","✓"],["YÖN TELEFONU","→ Phone","✓"],["KİMLİK NO","→ ID Number","✓"]].map(([a,b,c])=>(
          <div key={a} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #F3F4F6",fontSize:11.5}}>
            <span style={{fontFamily:"monospace",color:"#6b7280"}}>{a}</span>
            <span style={{color:"#1B3D2B",fontWeight:700}}>{b}</span>
            <span style={{color:"#16A34A",fontWeight:800}}>{c}</span>
          </div>
        ))}
        <div className="msub" style={{marginTop:11}}>Import 48 suppliers →</div>
      </div></div>}
    </BW>
  );
}

function ComplaintsFrame({ ui }: { ui: UiState }) {
  const { hl, modal } = ui;
  return (
    <BW url="lksgcompass.de/app/complaints">
      <div className="app"><Nav active="complaints"/>
        <div className="amain">
          <div className="ah"><div className="ah-h">Complaints <span style={{fontSize:11,color:"#9CA3AF"}}>3 total</span></div>
            <button className={`bs2${hl==="portal"?" hl-btn":""}`} style={{fontSize:10}}>🔗 Copy portal link</button>
          </div>
          <div className="ac">
            <div className={`c${hl==="critical"?" hl-row":""}`} style={{borderColor:"#FECACA",background:"#FFF5F5",cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                <div><div style={{fontSize:9.5,fontWeight:800,color:"#DC2626",marginBottom:2}}>⚠ NEW · CRITICAL · Act within 7 days</div>
                  <div style={{fontSize:12.5,fontWeight:700,color:"#0b0f0c"}}>Child labor at Tier-2 supplier</div>
                  <div style={{fontSize:10.5,color:"#6b7280"}}>Shenzhen Parts · §2 Nr.1 LkSG · BSWD-3A1B</div></div>
                <span className="bh">Critical</span>
              </div>
              <div style={{fontSize:11.5,color:"#374151",lineHeight:1.6,padding:"7px 9px",background:"#fff",borderRadius:6,border:"1px solid #FECACA",marginBottom:8}}>
                "Minors under 15 observed on production floor during facility visit..."
              </div>
              <div style={{display:"flex",gap:6}}>
                <button className="bg" style={{fontSize:10}}>Create CAP</button>
                <button className="bs2" style={{fontSize:10}}>Acknowledge</button>
              </div>
            </div>
            {[{ref:"BSWD-2C4D",c:"Environmental",r:"m",st:"Under review"},{ref:"BSWD-5E6F",c:"Discrimination",r:"l",st:"Resolved ✓"}].map(x=>(
              <div key={x.ref} className="c" style={{padding:"10px 13px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:10,fontFamily:"monospace",color:"#9CA3AF"}}>{x.ref}</div><div style={{fontSize:12.5,fontWeight:700,color:"#0b0f0c"}}>{x.c}</div></div>
                  <span className={`b${x.r}`}>{x.st}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {modal==="complaint-detail"&&<div className="overlay"><div className="modal">
        <span className="bh" style={{display:"inline-flex",marginBottom:9}}>§2 Nr.1 — Child labor</span>
        <div className="mh">Case BSWD-3A1B</div><div className="ms">Full details, deadlines and audit trail.</div>
        <div style={{background:"#FFF5F5",border:"1px solid #FECACA",borderRadius:8,padding:"9px 11px",marginBottom:11,fontSize:11.5,color:"#374151",lineHeight:1.65}}>
          "Minors under 15 years working on production floor — approx. 6-8 individuals observed during unannounced visit 03.03.2025"
        </div>
        {[["Received","04.03.2025 09:14"],["Acknowledge by","11.03.2025 (7 days)"],["Investigate by","04.06.2025 (3 months)"]].map(([l,v])=>(
          <div key={l} className="rrow"><span style={{color:"#6b7280",fontSize:11.5}}>{l}</span><span style={{fontWeight:700,fontSize:12}}>{v}</span></div>
        ))}
        <div className="msub" style={{marginTop:11}}>Create Corrective Action Plan →</div>
      </div></div>}
      {modal==="cap-from-complaint"&&<div className="overlay"><div className="modal">
        <div className="mh">New Action Plan</div><div className="ms">Pre-filled from complaint BSWD-3A1B</div>
        <div className="mf"><label className="ml">Title</label><div className="mi on">Investigate & remediate — Shenzhen Parts</div></div>
        <div className="mrow">
          <div style={{flex:1}}><label className="ml">Priority</label><div className="mi on">Critical</div></div>
          <div style={{flex:1}}><label className="ml">Due</label><div className="mi on">04.06.2025</div></div>
        </div>
        <div className="mf"><label className="ml">LkSG Reference</label><div className="mi on">§7 Abs.1 — Abhilfemaßnahme</div></div>
        <div className="msub">Save & notify supplier →</div>
      </div></div>}
    </BW>
  );
}

function ActionsFrame({ ui }: { ui: UiState }) {
  const { hl, modal } = ui;
  return (
    <BW url="lksgcompass.de/app/actions">
      <div className="app"><Nav active="actions"/>
        <div className="amain">
          <div className="ah"><div className="ah-h">Action Plans <span style={{fontSize:11,color:"#DC2626"}}>2 overdue</span></div>
            <button className="bg" style={{fontSize:10}}>+ New CAP</button>
          </div>
          <div className="ac">
            <div className={`c${hl==="overdue"?" hl-row":""}`} style={{borderColor:"#FECACA",background:"#FFF9F9",cursor:"pointer"}}>
              <div style={{fontSize:9.5,color:"#DC2626",fontWeight:800,marginBottom:4}}>⏰ OVERDUE — 3 days · §7 LkSG</div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:12.5,fontWeight:800,color:"#0b0f0c",marginBottom:2}}>Investigate child labor allegations</div>
                  <div style={{fontSize:10.5,color:"#6b7280"}}>Shenzhen Parts · M. Weber</div>
                  <div className="bar" style={{width:110,marginTop:6}}><div className="bar-f af" style={{width:"35%"}}/></div>
                  <div style={{fontSize:10,color:"#9CA3AF",marginTop:2}}>35% complete</div>
                </div>
                <span className="bh" style={{marginLeft:7}}>Critical</span>
              </div>
            </div>
            {[{t:"Sign Code of Conduct",s:"Ankara Tekstil",d:"15.04",p:60,r:"m"},{t:"Request audit report",s:"Hanoi Electro",d:"30.04",p:0,r:"l"}].map(a=>(
              <div key={a.t} className="c" style={{padding:"10px 13px",cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12.5,fontWeight:700,color:"#0b0f0c"}}>{a.t}</div>
                    <div style={{fontSize:10.5,color:"#6b7280",marginTop:1}}>{a.s} · Due: {a.d}</div>
                    <div className="bar" style={{width:80,marginTop:5}}><div className={`bar-f ${a.p>0?"af":"rf"}`} style={{width:`${Math.max(a.p,4)}%`}}/></div>
                  </div>
                  <span className={`b${a.r}`} style={{marginLeft:7}}>{a.r==="m"?"High":"Medium"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {modal==="cap-detail"&&<div className="overlay"><div className="modal">
        <span className="bh" style={{display:"inline-flex",marginBottom:9}}>⏰ Overdue 3 days</span>
        <div className="mh">Investigate child labor</div><div className="ms">Shenzhen Parts · §7 LkSG</div>
        <div className="mf"><label className="ml">Progress</label>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div className="bar" style={{flex:1}}><div className="bar-f af" style={{width:"35%"}}/></div>
            <span style={{fontSize:12,fontWeight:700,color:"#374151"}}>35%</span>
          </div>
        </div>
        <div className="mf"><label className="ml">Status</label><div className="mi on">In Progress</div></div>
        <div className="mf"><label className="ml">Evidence Notes</label><div className="mi on" style={{minHeight:44,fontSize:11.5}}>Factory visit scheduled 15.03.2025. Legal team notified...</div></div>
        <div style={{display:"flex",gap:7}}><div className="msub" style={{flex:1}}>Save changes</div><button className="bs2" style={{padding:"10px 13px",borderRadius:8,fontWeight:700,fontSize:12.5}}>📎 Evidence</button></div>
      </div></div>}
      {modal==="cap-evidence"&&<div className="overlay"><div className="modal">
        <div className="mh">📎 Attach Evidence</div><div className="ms">§10 Abs.1 LkSG — 7-year retention enforced.</div>
        <div style={{border:"2px dashed #d1e7d9",borderRadius:8,padding:"16px",textAlign:"center",background:"#f0f5f1",marginBottom:11}}>
          <div style={{fontSize:22,marginBottom:4}}>📄</div>
          <div style={{fontSize:11.5,fontWeight:700,color:"#1B3D2B"}}>factory_visit_15032025.pdf</div>
          <div style={{fontSize:10.5,color:"#6b7280",marginTop:2}}>2.4 MB · Uploaded now</div>
        </div>
        <div className="gen-a" style={{marginBottom:11}}><div className="gdot"/><div className="gdot"/><div className="gdot"/><span style={{fontSize:11.5,color:"#16A34A",fontWeight:700}}>Stored · Retention until 2032</span></div>
        <div className="msub">Confirm & link to CAP →</div>
      </div></div>}
    </BW>
  );
}

function LegalFrame({ ui }: { ui: UiState }) {
  const { view, modal } = ui;
  return (
    <BW url="lksgcompass.de/app/legal">
      <div className="app"><Nav active="legal"/>
        <div className="amain">
          <div className="ah"><div className="ah-h">Legal Assistant <span style={{fontSize:10,color:"#7C3AED",fontWeight:700,background:"#F5F3FF",border:"1px solid #DDD6FE",borderRadius:5,padding:"1px 7px"}}>NEW</span></div></div>
          <div className="ac">
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:2}}>
              {[["templates","📄 Templates"],["ask","❓ Legal Q&A"],["review","🔍 Contract Review"],["defense","🛡 Defense File"],["updates","📰 Updates"]].map(([v,l])=>(
                <div key={v} style={{padding:"5px 10px",borderRadius:7,background:view===v?"#1B3D2B":"transparent",color:view===v?"#fff":"#6b7280",fontSize:11,fontWeight:700,cursor:"pointer"}}>{l}</div>
              ))}
            </div>
            {view==="templates" && <>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[{t:"Supplier Code of Conduct",r:"§6 Abs.2",tag:"Pflicht"},{t:"Contract Clause LkSG",r:"§6 Abs.3",tag:"Vertrag"},{t:"Supplier SAQ",r:"§5 Abs.2",tag:"Fragebogen"},{t:"Audit Protocol",r:"§6 Nr.2",tag:"Prozess"},{t:"Whistleblower Policy",r:"§8, HinSchG",tag:"Pflicht"},{t:"Risk Methodology §5",r:"§5 Abs.1-4",tag:"Methodik"}].map(({t,r,tag})=>(
                  <div key={t} className="c" style={{padding:"10px 12px"}}>
                    <div style={{fontSize:12,fontWeight:800,color:"#0b0f0c",marginBottom:5}}>{t}</div>
                    <div style={{display:"flex",gap:5,marginBottom:8}}>
                      <span style={{background:"#f0f5f1",border:"1px solid #d1e7d9",color:"#1B3D2B",fontSize:9.5,fontWeight:700,padding:"1px 6px",borderRadius:4}}>{r}</span>
                      <span style={{background:"#F3F4F6",color:"#6b7280",fontSize:9.5,fontWeight:600,padding:"1px 6px",borderRadius:4}}>{tag}</span>
                    </div>
                    <button className="bg" style={{width:"100%",fontSize:10}}>Generate document →</button>
                  </div>
                ))}
              </div>
            </>}
            {view==="ask" && <div className="c">
              <div style={{fontSize:12.5,fontWeight:700,color:"#0b0f0c",marginBottom:8}}>❓ LkSG Legal Q&A</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                {["Tier-2 supplier obligations?","How long must I store complaints?","What if supplier refuses CoC?"].map(q=>(
                  <div key={q} style={{padding:"5px 9px",background:"#F0F5F1",border:"1px solid #D1E7D9",borderRadius:7,fontSize:11,color:"#1B3D2B",fontWeight:600,cursor:"pointer"}}>{q}</div>
                ))}
              </div>
              <div style={{padding:"8px 11px",border:"1.5px solid #1B3D2B",borderRadius:9,fontSize:12,color:"#6b7280",marginBottom:8}}>Which obligations apply to indirect Tier-2 suppliers?</div>
              <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:9,padding:"11px 13px",fontSize:12,color:"#374151",lineHeight:1.65}}>
                <strong style={{color:"#0b0f0c",display:"block",marginBottom:5}}>⚖️ Legal Assessment</strong>
                §2 Abs.3 LkSG obliges you to take appropriate measures for indirect suppliers when you have "substantiated knowledge" of potential violations. This triggers a cause-based risk analysis under §5 Abs.4...
              </div>
            </div>}
            {view==="review" && <div className="c">
              <div style={{fontSize:12.5,fontWeight:700,color:"#0b0f0c",marginBottom:8}}>🔍 Contract Review</div>
              <div style={{padding:"8px 11px",border:"1.5px solid #e4e6e4",borderRadius:9,fontSize:11.5,color:"#6b7280",minHeight:60,marginBottom:8}}>Paste your contract clause here — the AI checks §5-§10 LkSG coverage...</div>
              <div style={{background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:8,padding:"10px 12px",fontSize:11.5,color:"#374151",lineHeight:1.65}}>
                <strong style={{color:"#D97706",display:"block",marginBottom:4}}>⚠ 2 gaps found</strong>
                Missing: (1) Audit right clause — §6 Abs.3 requires explicit right to conduct supplier audits. (2) Sub-supplier obligation — must include pass-down requirement...
              </div>
            </div>}
            {view==="defense" && <div className="c">
              <div style={{fontSize:12.5,fontWeight:700,color:"#0b0f0c",marginBottom:5}}>🛡 BAFA Defense File</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
                {["§5 Risk Analysis","§6 Prevention","§7 Remediation","§8 Complaints","§9 KPI Evidence","§10 Audit Trail"].map(s=>(
                  <div key={s} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 9px",background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:7,fontSize:11,fontWeight:600,color:"#16A34A"}}>✓ {s}</div>
                ))}
              </div>
              <button className="bg" style={{width:"100%"}}>⬇ Download defense file 2024 →</button>
            </div>}
          </div>
        </div>
      </div>
      {modal==="coc-generating"&&<div className="overlay"><div className="modal">
        <div className="mh">🤖 Generating Supplier Code of Conduct...</div><div className="ms">Claude is writing a complete §6 Abs.2 LkSG compliant CoC in German.</div>
        <div className="gen-a" style={{marginBottom:11}}><div className="gdot"/><div className="gdot"/><div className="gdot"/><span style={{fontSize:11.5,color:"#16A34A",fontWeight:700}}>Writing §2 Menschenrechte section...</span></div>
        {["§2 Menschenrechte & Arbeit ✓","§2 Abs.3 Umwelt ✓","Anti-Korruption §2 Nr.10 ✓"].map((s,i)=>(
          <div key={s} style={{display:"flex",gap:7,padding:"5px 0",fontSize:11.5,color:i<2?"#16A34A":"#9CA3AF"}}><span>{i<2?"✓":"○"}</span>{s}</div>
        ))}
      </div></div>}
    </BW>
  );
}

function ReportsFrame({ ui }: { ui: UiState }) {
  const { hl, modal } = ui;
  return (
    <BW url="lksgcompass.de/app/reports">
      <div className="app"><Nav active="reports"/>
        <div className="amain">
          <div className="ah"><div className="ah-h">BAFA Report 2024</div>
            <div style={{display:"flex",gap:6}}>
              <button className={`bs2${hl==="ai-btn"?" hl-btn":""}`} style={{fontSize:10}}>🤖 AI Draft</button>
              <button className={`bg${hl==="pdf"?" hl-btn":""}`} style={{fontSize:10}}>📄 Export PDF</button>
            </div>
          </div>
          <div className="ac">
            <div className="c" style={{borderColor:"#BBF7D0",background:"#F0FDF4"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><div style={{fontSize:13,fontWeight:800,color:"#0b0f0c"}}>Report approved ✓</div><span className="bl">Submitted 12.03</span></div>
            </div>
            <div className={`c${hl==="sections"?" hl-row":""}`}>
              <div className="c-h">Report Sections</div>
              {["§5 Risk Analysis","§6 Prevention","§7 Remediation","§8 Complaints","§9 Effectiveness","§10 Documentation"].map((s,i)=>(
                <div key={s} className="br"><div className="bm"><div className="bn" style={{fontSize:11.5}}>{s}</div></div><span className={i<4?"bl":i===4?"bm2":"bh"} style={{fontSize:9.5}}>{i<4?"✓ Complete":i===4?"In progress":"Open"}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {modal==="ai-generating"&&<div className="overlay"><div className="modal">
        <div className="mh">🤖 Generating BAFA report…</div><div className="ms">Claude reads your actual compliance data and writes a structured report.</div>
        <div className="gen-a" style={{marginBottom:11}}><div className="gdot"/><div className="gdot"/><div className="gdot"/><span style={{fontSize:11.5,color:"#16A34A",fontWeight:700}}>Analysing 5 suppliers, 3 CAPs...</span></div>
        {["§5 Risk data analysed ✓","§6 Prevention measures ✓","Writing §8 complaint summary..."].map((s,i)=>(
          <div key={s} style={{display:"flex",gap:7,padding:"5px 0",fontSize:11.5,color:i<2?"#16A34A":"#9CA3AF"}}><span>{i<2?"✓":"○"}</span>{s}</div>
        ))}
      </div></div>}
      {modal==="ai-draft-done"&&<div className="overlay"><div className="modal">
        <div className="sbadge">✓ AI draft complete — 847 words</div>
        <div className="mh">BAFA Report Draft</div>
        <div style={{background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:8,padding:"10px 12px",fontSize:11.5,color:"#374151",lineHeight:1.7,marginBottom:11}}>
          "Die Muster Automotive GmbH hat gemäß §5 LkSG eine Risikoanalyse für 5 direkte Lieferanten durchgeführt. Ein Lieferant (Shenzhen Parts Co.) wurde als hochriskant eingestuft..."
        </div>
        <div style={{display:"flex",gap:7}}><div className="msub" style={{flex:1}}>Submit for approval →</div><button className="bs2" style={{padding:"10px 13px",borderRadius:8,fontWeight:700,fontSize:12.5}}>Edit</button></div>
      </div></div>}
      {modal==="pdf-export"&&<div className="overlay"><div className="modal">
        <div className="sbadge">✓ PDF generated</div>
        <div className="mh">📄 BAFA_Bericht_2024.pdf</div>
        {[["Pages","14"],["Sections","§5 – §10"],["Timestamp","15.03.2025 14:32"],["Approved by","M. Weber"]].map(([l,v])=>(
          <div key={l} className="rrow"><span style={{color:"#6b7280"}}>{l}</span><span style={{fontWeight:700}}>{v}</span></div>
        ))}
        <div className="msub" style={{marginTop:10}}>⬇ Download PDF</div>
      </div></div>}
    </BW>
  );
}

function DefenseFrame({ ui }: { ui: UiState }) {
  const { view, highlight } = ui;
  return (
    <BW url="lksgcompass.de/app/legal">
      <div className="app"><Nav active="legal"/>
        <div className="amain">
          <div className="ah"><div className="ah-h">BAFA Defense File</div><span style={{fontSize:10,color:"#7C3AED",fontWeight:700,background:"#F5F3FF",border:"1px solid #DDD6FE",borderRadius:5,padding:"2px 8px"}}>§10 LkSG</span></div>
          <div className="ac">
            <div className="c" style={{border:"1.5px solid #1B3D2B"}}>
              <div style={{fontSize:13,fontWeight:800,color:"#0b0f0c",marginBottom:5}}>🛡 Generate BAFA Defense Documentation</div>
              <div style={{fontSize:11.5,color:"#6b7280",lineHeight:1.55,marginBottom:13}}>One-click structured export of all compliance evidence organized by §5–§10 LkSG. Previously took lawyers days to compile manually.</div>
              <div className={`${highlight==="sections"?"hl-row":""}`} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:13,padding:highlight==="sections"?6:0,borderRadius:9}}>
                {["§5 Risk Analysis","§6 Prevention Measures","§7 Remediation Actions","§8 Complaint Records","§9 KPI Evidence","§10 Full Audit Trail"].map(s=>(
                  <div key={s} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 10px",background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:8,fontSize:11.5,fontWeight:600,color:"#16A34A"}}>✓ {s}</div>
                ))}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <select style={{padding:"8px 12px",border:"1.5px solid #e4e6e4",borderRadius:8,fontSize:13,background:"#fff",fontWeight:700}}>
                  <option>2024</option><option>2023</option>
                </select>
                <button className={`bg${highlight==="download"?" hl-btn":""}`} style={{padding:"9px 20px",fontSize:12.5,fontWeight:800}}>⬇ Download defense file</button>
              </div>
            </div>
            <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:10,padding:"11px 14px",fontSize:11.5,color:"#2563EB",lineHeight:1.6}}>
              <strong>What does this contain?</strong> All §5–§10 data with timestamps and 200-entry audit trail. Use as the starting point when BAFA initiates a control procedure — saving hours of manual document compilation.
            </div>
          </div>
        </div>
      </div>
    </BW>
  );
}

function TeamFrame({ ui }: { ui: UiState }) {
  const { hl, modal } = ui;
  return (
    <BW url="lksgcompass.de/app/settings">
      <div className="app"><Nav active="settings"/>
        <div className="amain">
          <div className="ah"><div className="ah-h">Settings</div></div>
          <div className="ac">
            <div style={{display:"flex",gap:5,marginBottom:2}}>
              {["Company","Team","Billing","Legal"].map((t,i)=>(
                <div key={t} style={{padding:"5px 10px",borderRadius:6,fontSize:11.5,fontWeight:700,background:i===1?"#1B3D2B":"transparent",color:i===1?"#fff":"#6b7280",cursor:"pointer"}}>{t}</div>
              ))}
            </div>
            <div className={`c${hl==="invite"?" hl-row":""}`}>
              <div className="c-h">Invite team member</div>
              <div style={{display:"flex",gap:7,alignItems:"center"}}>
                <div style={{flex:1,padding:"7px 10px",border:"1.5px solid #e4e6e4",borderRadius:7,fontSize:12,color:"#9ca3af",background:"#f9fafb"}}>colleague@company.de</div>
                <select style={{padding:"7px 9px",borderRadius:7,border:"1.5px solid #e4e6e4",fontSize:11.5,background:"#fff"}}><option>Member</option></select>
                <button className="bg" style={{fontSize:10.5}}>Send invite</button>
              </div>
            </div>
            <div className="c">
              <div className="c-h">Team <span style={{fontSize:10,color:"#9CA3AF"}}>3 members</span></div>
              {[{e:"max@muster-auto.de",r:"Admin",s:"l"},{e:"anna@muster-auto.de",r:"Member",s:"l"},{e:"jo@extern.de",r:"Viewer",s:"m"}].map(m=>(
                <div key={m.e} className="br"><div className="bm"><div className="bn" style={{fontSize:12}}>{m.e}</div><div className="bs">{m.r}</div></div><span className={`b${m.s}`}>{m.s==="l"?"Active":"Invited"}</span></div>
              ))}
            </div>
            <div className={`c${hl==="billing"?" hl-row":""}`}>
              <div className="c-h">Billing Plans</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7}}>
                {[{n:"Free",p:"€0/mo",c:"#6B7280",f:["5 suppliers","1 user"]},{n:"Pro",p:"€149/mo",c:"#1B3D2B",f:["Unlimited","5 users","AI"],best:true},{n:"Enterprise",p:"€499/mo",c:"#7C3AED",f:["Unlimited","∞ users","SSO"]}].map((pl)=>(
                  <div key={pl.n} style={{border:`1.5px solid ${(pl as any).best?"#1B3D2B":"#E5E7EB"}`,borderRadius:9,padding:9,background:(pl as any).best?"#F8FAF8":"#fff"}}>
                    <div style={{fontSize:12,fontWeight:800,color:"#0b0f0c"}}>{pl.n}</div>
                    <div style={{fontSize:13,fontWeight:800,color:pl.c,margin:"2px 0 6px"}}>{pl.p}</div>
                    {pl.f.map((f:string)=><div key={f} style={{fontSize:10,color:"#6b7280",marginBottom:2}}>✓ {f}</div>)}
                    {(pl as any).best&&<button className="bg" style={{width:"100%",fontSize:10,marginTop:6}}>Start trial</button>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {modal==="invite-sent"&&<div className="overlay"><div className="modal">
        <div className="sbadge">✓ Invitation sent</div>
        <div className="mh">Invite: anna@muster-auto.de</div>
        {[["Role","Member"],["Link expires","7 days"],["Access","Suppliers, Complaints"],["Sent via","Resend · logged"]].map(([l,v])=>(
          <div key={l} className="rrow"><span style={{color:"#6b7280"}}>{l}</span><span style={{fontWeight:700}}>{v}</span></div>
        ))}
      </div></div>}
      {modal==="billing-upgrade"&&<div className="overlay"><div className="modal">
        <div className="mh">🚀 Upgrade to Pro</div><div className="ms">Unlimited suppliers, AI assistant, 5 team members.</div>
        {[["Price","€149/month"],["Trial","14 days free"],["Suppliers","Unlimited"],["AI assistant","✓ Included"]].map(([l,v])=>(
          <div key={l} className="rrow"><span style={{color:"#6b7280"}}>{l}</span><span style={{fontWeight:700}}>{v}</span></div>
        ))}
        <div className="msub" style={{marginTop:11}}>Start 14-day free trial →</div>
      </div></div>}
    </BW>
  );
}

// Map scene ids to renderers
const RENDERERS: Record<string, (ui: UiState) => React.ReactNode> = {
  register: (ui) => <RegisterFrame ui={ui} />,
  dashboard: (ui) => <DashboardFrame ui={ui} />,
  suppliers: (ui) => <SuppliersFrame ui={ui} />,
  complaints: (ui) => <ComplaintsFrame ui={ui} />,
  actions: (ui) => <ActionsFrame ui={ui} />,
  legal: (ui) => <LegalFrame ui={ui} />,
  reports: (ui) => <ReportsFrame ui={ui} />,
  defense: (ui) => <DefenseFrame ui={ui} />,
  team: (ui) => <TeamFrame ui={ui} />,
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function DemoPage() {
  const [sIdx, setSIdx] = useState(0);
  const [fIdx, setFIdx] = useState(0);
  const [playing, setPlaying] = useState(true); // AUTO-START
  const [muted, setMuted] = useState(false);
  const [visited, setVisited] = useState(new Set([0]));
  const [pct, setPct] = useState(0);

  const s = SCENES[sIdx];
  const f = s.frames[fIdx];
  const nf = s.frames.length;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAll = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progRef.current) clearInterval(progRef.current);
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, []);

  const speak = useCallback((text: string) => {
    if (muted || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; u.rate = 0.9; u.pitch = 1.02;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Google US English") || v.name.includes("Daniel")));
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  }, [muted]);

  const startProg = useCallback((dur: number) => {
    if (progRef.current) clearInterval(progRef.current);
    setPct(0);
    const tick = 80, steps = dur / tick;
    let i = 0;
    progRef.current = setInterval(() => { i++; setPct(Math.min(100, (i / steps) * 100)); if (i >= steps) clearInterval(progRef.current!); }, tick);
  }, []);

  const advance = useCallback((si: number, fi: number) => {
    const scene = SCENES[si];
    const frame = scene.frames[fi];
    setSIdx(si); setFIdx(fi); setPct(0);
    setVisited(v => new Set([...v, si]));
    speak(frame.narration);
    startProg(frame.duration);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const nextFi = fi + 1;
      if (nextFi < scene.frames.length) {
        advance(si, nextFi);
      } else {
        const nextSi = (si + 1) % SCENES.length; // LOOP BACK
        advance(nextSi, 0);
      }
    }, frame.duration);
  }, [speak, startProg]);

  // AUTO-START on mount
  useEffect(() => {
    // Small delay so voices load
    const t = setTimeout(() => {
      if (playing) advance(0, 0);
    }, 800);
    return () => { clearTimeout(t); stopAll(); };
  }, []);

  useEffect(() => {
    if (!playing) stopAll();
  }, [playing, stopAll]);

  useEffect(() => {
    if (muted) window.speechSynthesis?.cancel();
  }, [muted]);

  function goTo(si: number, fi = 0) {
    stopAll();
    if (playing) { advance(si, fi); } 
    else { setSIdx(si); setFIdx(fi); setPct(0); setVisited(v => new Set([...v, si])); }
  }

  const overall = ((sIdx + fIdx / nf) / SCENES.length) * 100;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="shell">
        <div className="tb">
          <a href="/" className="logo">LkSG<em>Compass</em></a>
          <div className="tb-r">
            <div className="tb-badge">▶ Interactive Product Demo</div>
            <a href="/register" className="tb-cta">Start free trial →</a>
          </div>
        </div>
        <div className="prog"><div className="prog-fill" style={{ width: `${overall}%` }} /></div>
        <div className="scene-tabs">
          {SCENES.map((sc, i) => (
            <button key={sc.id} className={`stab${sIdx===i?" on":""}${visited.has(i)&&sIdx!==i?" done":""}`} onClick={() => goTo(i)}>
              <span className="stab-n">{i + 1}</span>{sc.title}
            </button>
          ))}
        </div>
        <div className="body">
          <div className="vp">
            {SCENES.map((sc, si) =>
              sc.frames.map((fr, fi) => (
                <div key={`${si}-${fi}`} className={`vp-frame${sIdx===si&&fIdx===fi?" vis":""}`}>
                  {RENDERERS[sc.id]?.(fr.ui)}
                </div>
              ))
            )}
          </div>
          <div className="rp">
            <div className="rp-info">
              <div className="rp-law">{s.law}</div>
              <div className="rp-title">{s.title}</div>
              <div className="rp-sub">{s.subtitle}</div>
            </div>
            <div className="rp-narr">
              {s.frames.map((fr, fi) => (
                <div key={fi} className={`nb${fIdx===fi?" on":""}`} onClick={() => goTo(sIdx, fi)}>
                  <div className="nb-step">Step {fi + 1} of {nf}</div>
                  {fr.narration}
                </div>
              ))}
            </div>
            <div className="ctrl">
              <button className="cb" disabled={sIdx===0&&fIdx===0}
                onClick={() => { if(fIdx>0) goTo(sIdx,fIdx-1); else goTo(sIdx-1, SCENES[sIdx-1].frames.length-1); }}>← Back</button>
              <div className="cc">
                <div className="fdots">
                  {s.frames.map((_,fi)=>(
                    <div key={fi} className={`fd${fIdx===fi?" on":fi<fIdx?" done":""}`} onClick={()=>goTo(sIdx,fi)} />
                  ))}
                </div>
                <button className="play-btn" onClick={() => { if(playing){stopAll();setPlaying(false);} else {setPlaying(true);advance(sIdx,fIdx);} }}>
                  {playing ? "⏸ Pause" : "▶ Play"} · {s.title}
                </button>
                <div className="timer"><div className="timer-fill" style={{ width: playing ? `${pct}%` : "0%" }} /></div>
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                <button className="cb" onClick={() => setMuted(m => !m)} style={{ padding: "7px 10px" }}>{muted ? "🔇" : "🔊"}</button>
                {sIdx===SCENES.length-1&&fIdx===nf-1
                  ? <a href="/register" className="cb p" style={{ textDecoration: "none" }}>Get started →</a>
                  : <button className="cb p" onClick={() => { if(fIdx<nf-1) goTo(sIdx,fIdx+1); else goTo(sIdx+1,0); }}>Next →</button>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
