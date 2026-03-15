"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── SCENE DEFINITIONS ───────────────────────────────────────────────────────
// Each scene has: a "film" of frames that animate automatically
// Frames show panels opening, modals appearing, data being entered, workflows completing

type Frame = {
  duration: number;          // ms to show this frame
  narration: string;         // spoken + shown as subtitle
  uiState: Record<string, any>; // drives the UI rendering
};

const SCENES: Array<{
  id: string;
  title: string;
  subtitle: string;
  law: string;
  frames: Frame[];
}> = [
  {
    id: "register",
    title: "Create Your Account",
    subtitle: "60-second onboarding",
    law: "§4 LkSG",
    frames: [
      {
        duration: 3500,
        narration: "Start by visiting lksgcompass.de and clicking 'Get started free'. The registration form appears.",
        uiState: { screen: "register-empty", modal: null },
      },
      {
        duration: 3000,
        narration: "Type your company name. LkSGCompass creates an isolated compliance workspace for your organization.",
        uiState: { screen: "register-company", modal: null },
      },
      {
        duration: 3000,
        narration: "Enter your business email and a secure password. No credit card required for the 14-day trial.",
        uiState: { screen: "register-full", modal: null },
      },
      {
        duration: 3500,
        narration: "Click 'Create account'. A 6-digit verification code is sent to your email immediately.",
        uiState: { screen: "register-submit", modal: null },
      },
      {
        duration: 4000,
        narration: "Enter the OTP code. Once confirmed, your compliance workspace is live and ready.",
        uiState: { screen: "otp", modal: null },
      },
    ],
  },
  {
    id: "dashboard",
    title: "Compliance Dashboard",
    subtitle: "Your compliance health at a glance",
    law: "§9 LkSG",
    frames: [
      {
        duration: 3500,
        narration: "The dashboard shows your live compliance score — 72 out of 100, Grade B. This is calculated from risk coverage and process quality per §9 LkSG.",
        uiState: { screen: "dashboard", highlight: "score", modal: null },
      },
      {
        duration: 3500,
        narration: "The BAFA readiness checklist shows exactly what's missing. Your HR Officer is assigned, risk analysis is done, but the Complaints Officer field is empty — a legal requirement.",
        uiState: { screen: "dashboard", highlight: "bafa", modal: null },
      },
      {
        duration: 3500,
        narration: "Click 'Add Supplier' to open the supplier creation panel. Fill in name, country and industry — the risk engine scores them automatically.",
        uiState: { screen: "dashboard", highlight: "add-sup", modal: "new-supplier" },
      },
      {
        duration: 4000,
        narration: "The new supplier appears in your register with a risk score calculated from 190 country risk profiles, industry weighting, and your supplier's compliance controls.",
        uiState: { screen: "dashboard", highlight: null, modal: "supplier-saved" },
      },
    ],
  },
  {
    id: "suppliers",
    title: "Supplier Risk Register",
    subtitle: "Automated risk scoring",
    law: "§5 LkSG",
    frames: [
      {
        duration: 3500,
        narration: "The supplier register shows all 5 suppliers ranked by risk score. Shenzhen Parts in China is flagged high-risk at 78 out of 100.",
        uiState: { screen: "suppliers-list", highlight: null, modal: null },
      },
      {
        duration: 3500,
        narration: "Click on Shenzhen Parts to open the risk breakdown panel. Country risk, industry weighting, and missing controls are shown with their exact contribution to the score.",
        uiState: { screen: "suppliers-list", highlight: "shenzhen", modal: "risk-detail" },
      },
      {
        duration: 3500,
        narration: "Click 'Excel Import' to bulk-upload suppliers. Upload an XLSX file with supplier data — column detection works automatically, even with Turkish column headers.",
        uiState: { screen: "suppliers-list", highlight: "excel", modal: "excel-import" },
      },
      {
        duration: 3500,
        narration: "The import maps columns automatically. Preview shows all rows before confirming. Import 50 suppliers in seconds instead of hours.",
        uiState: { screen: "suppliers-list", highlight: null, modal: "excel-preview" },
      },
    ],
  },
  {
    id: "complaints",
    title: "Complaint Management",
    subtitle: "Whistleblowing portal & case management",
    law: "§8 LkSG",
    frames: [
      {
        duration: 3500,
        narration: "The complaints module manages your §8 LkSG obligations. A public whistleblowing portal URL is automatically created for your company slug.",
        uiState: { screen: "complaints-list", highlight: "portal", modal: null },
      },
      {
        duration: 3500,
        narration: "A critical new complaint has arrived — child labor observed at a Tier-2 supplier. Click to open the full case details.",
        uiState: { screen: "complaints-list", highlight: "critical", modal: null },
      },
      {
        duration: 4000,
        narration: "The case detail panel shows the full description, category, severity and audit trail. Under LkSG you must acknowledge within 7 days and investigate within 3 months.",
        uiState: { screen: "complaints-list", highlight: null, modal: "complaint-detail" },
      },
      {
        duration: 3500,
        narration: "Click 'Create Corrective Action Plan' to link this complaint to a CAP. The CAP is pre-filled with the supplier and §6 LkSG reference.",
        uiState: { screen: "complaints-list", highlight: null, modal: "cap-from-complaint" },
      },
    ],
  },
  {
    id: "actions",
    title: "Corrective Action Plans",
    subtitle: "Track remediation & evidence",
    law: "§6 & §7 LkSG",
    frames: [
      {
        duration: 3500,
        narration: "The action plan view lists all CAPs with priority, due date, assignee and progress. Red items are overdue — these directly hurt your compliance score.",
        uiState: { screen: "actions-list", highlight: "overdue", modal: null },
      },
      {
        duration: 3500,
        narration: "Open an overdue CAP. You can update the progress percentage, add evidence notes, and change the status from open to in-progress or completed.",
        uiState: { screen: "actions-list", highlight: null, modal: "cap-detail" },
      },
      {
        duration: 4000,
        narration: "Click 'Attach Evidence' to link a document to this CAP. All uploaded evidence is stored with 7-year retention as required by §10 Abs.1 LkSG.",
        uiState: { screen: "actions-list", highlight: null, modal: "cap-evidence" },
      },
    ],
  },
  {
    id: "reports",
    title: "BAFA Annual Report",
    subtitle: "AI-generated, audit-ready",
    law: "§9 LkSG",
    frames: [
      {
        duration: 3500,
        narration: "The report module generates your BAFA annual report. All 6 sections — §5 through §10 — are tracked with completion status.",
        uiState: { screen: "reports-main", highlight: "sections", modal: null },
      },
      {
        duration: 4000,
        narration: "Click 'Generate AI Draft'. Claude reads your actual compliance data — suppliers, risk scores, CAPs, complaints — and writes a structured German-language report draft in seconds.",
        uiState: { screen: "reports-main", highlight: "ai-btn", modal: "ai-generating" },
      },
      {
        duration: 4000,
        narration: "The AI draft covers each required section. You can edit it, then submit for team approval. The approval workflow creates an audit trail showing who approved what and when.",
        uiState: { screen: "reports-main", highlight: null, modal: "ai-draft-done" },
      },
      {
        duration: 3500,
        narration: "Click 'Export PDF' to download a structured BAFA-ready report with timestamp, company data, and digital signature placeholder.",
        uiState: { screen: "reports-main", highlight: "pdf", modal: "pdf-export" },
      },
    ],
  },
  {
    id: "kpi",
    title: "KPI & Effectiveness",
    subtitle: "§9 LkSG effectiveness monitoring",
    law: "§9 LkSG",
    frames: [
      {
        duration: 4000,
        narration: "The KPI dashboard fulfills §9 LkSG effectiveness monitoring. Your 72-point score breaks down as 55% risk quality plus 45% process quality. Audit coverage is 60%, code-of-conduct coverage is 80%.",
        uiState: { screen: "kpi-main", highlight: "score", modal: null },
      },
      {
        duration: 3500,
        narration: "The trend chart shows compliance improvement over 12 months. Click 'Save KPI Snapshot' to record today's state as a dated compliance checkpoint.",
        uiState: { screen: "kpi-main", highlight: "snapshot", modal: null },
      },
      {
        duration: 3500,
        narration: "The SAQ response rate of 33% is a risk indicator. Click a supplier to send an automated SAQ reminder email — tracked and logged for your audit trail.",
        uiState: { screen: "kpi-main", highlight: null, modal: "saq-reminder" },
      },
    ],
  },
  {
    id: "team",
    title: "Team & Billing",
    subtitle: "Multi-user collaboration",
    law: "Pro Plan",
    frames: [
      {
        duration: 3500,
        narration: "Go to Settings and open the Team tab. Click 'Send invite' to email a secure invitation link to a colleague. They get Admin, Member, or Viewer access.",
        uiState: { screen: "team-main", highlight: "invite", modal: null },
      },
      {
        duration: 4000,
        narration: "The invitation email contains a JWT-signed link valid for 7 days. When the colleague clicks it, they set a password and immediately join your compliance workspace.",
        uiState: { screen: "team-main", highlight: null, modal: "invite-sent" },
      },
      {
        duration: 4000,
        narration: "Upgrade to Pro for 149 euros per month to unlock unlimited suppliers, the AI assistant, and 5 team members. The 14-day trial starts immediately — no credit card needed.",
        uiState: { screen: "team-main", highlight: "billing", modal: "billing-upgrade" },
      },
    ],
  },
];

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body{font-family:'DM Sans',system-ui,sans-serif;background:#080e07;color:#fff;height:100%;overflow:hidden}
  
  .shell{display:grid;grid-template-rows:auto auto 1fr auto;height:100vh;overflow:hidden}
  
  /* topbar */
  .tb{display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:52px;background:rgba(8,14,7,.95);border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0}
  .tb-logo{font-size:15px;font-weight:800;color:#fff;text-decoration:none}.tb-logo em{font-style:normal;color:rgba(255,255,255,.3)}
  .tb-r{display:flex;align-items:center;gap:10px}
  .tb-badge{font-size:10.5px;font-weight:700;color:#4ade80;background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.2);padding:3px 10px;border-radius:99px}
  .tb-cta{background:#1B3D2B;color:#fff;border:none;border-radius:7px;padding:7px 16px;font-size:13px;font-weight:700;cursor:pointer;text-decoration:none;transition:all .2s}
  .tb-cta:hover{background:#2d5c3f;transform:translateY(-1px)}
  
  /* scene tabs */
  .scene-tabs{display:flex;overflow-x:auto;padding:0 16px;background:rgba(255,255,255,.025);border-bottom:1px solid rgba(255,255,255,.06);scrollbar-width:none;flex-shrink:0}
  .scene-tabs::-webkit-scrollbar{display:none}
  .stab{display:flex;align-items:center;gap:8px;padding:10px 16px;cursor:pointer;border-bottom:2px solid transparent;color:rgba(255,255,255,.4);font-size:12.5px;font-weight:700;white-space:nowrap;transition:all .2s;flex-shrink:0}
  .stab:hover{color:rgba(255,255,255,.75)}
  .stab.on{color:#4ade80;border-bottom-color:#4ade80}
  .stab-n{width:20px;height:20px;border-radius:6px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800}
  .stab.on .stab-n{background:#1B3D2B;color:#4ade80}
  .stab.done .stab-n{background:rgba(74,222,128,.15);color:#4ade80}
  
  /* main area */
  .main{display:grid;grid-template-columns:1fr 320px;overflow:hidden;height:100%}
  
  /* viewport */
  .viewport{position:relative;overflow:hidden;background:#0d170b}
  .vp-frame{position:absolute;inset:0;opacity:0;transform:translateY(6px) scale(.99);transition:opacity .4s,transform .4s;pointer-events:none}
  .vp-frame.vis{opacity:1;transform:none;pointer-events:auto}
  
  /* right panel - narration + actions */
  .rpanel{display:flex;flex-direction:column;border-left:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.015);overflow:hidden}
  
  .rp-scene-info{padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0}
  .rp-law{font-size:10px;font-weight:800;color:#4ade80;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
  .rp-title{font-size:17px;font-weight:800;color:#fff;letter-spacing:-.3px;margin-bottom:3px;line-height:1.2}
  .rp-sub{font-size:12.5px;color:rgba(255,255,255,.45)}
  
  .rp-narr{flex:1;padding:20px;overflow-y:auto;display:flex;flex-direction:column;gap:12px}
  .narr-bubble{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;font-size:13px;color:rgba(255,255,255,.75);line-height:1.65;position:relative;transition:all .3s}
  .narr-bubble.active{background:rgba(27,61,43,.4);border-color:rgba(74,222,128,.3);color:#fff}
  .narr-bubble::before{content:"";position:absolute;top:14px;left:-5px;width:9px;height:9px;border-radius:50%;background:rgba(74,222,128,.25);transition:background .3s}
  .narr-bubble.active::before{background:#4ade80}
  
  .rp-controls{padding:16px 20px;border-top:1px solid rgba(255,255,255,.07);flex-shrink:0}
  .rc-row1{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
  .rc-play{display:flex;align-items:center;gap:7px;background:rgba(74,222,128,.12);border:1px solid rgba(74,222,128,.25);color:#4ade80;font-size:12.5px;font-weight:700;padding:8px 16px;border-radius:8px;cursor:pointer;transition:all .2s}
  .rc-play:hover{background:rgba(74,222,128,.22)}
  .rc-mute{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.55);font-size:11.5px;font-weight:700;padding:7px 12px;border-radius:7px;cursor:pointer;transition:all .15s}
  .rc-mute:hover{background:rgba(255,255,255,.12);color:#fff}
  .rc-row2{display:flex;gap:8px}
  .rc-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.65);font-size:12px;font-weight:700;padding:8px;border-radius:7px;cursor:pointer;transition:all .15s}
  .rc-btn:hover{background:rgba(255,255,255,.1);color:#fff}
  .rc-btn:disabled{opacity:.2;cursor:not-allowed}
  .rc-btn.p{background:#1B3D2B;border-color:#1B3D2B;color:#fff}
  .rc-btn.p:hover{background:#2d5c3f}

  /* frame progress dots */
  .fp-dots{display:flex;gap:4px;justify-content:center;margin-bottom:10px}
  .fp-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.15);transition:all .3s}
  .fp-dot.on{background:#4ade80;width:14px;border-radius:3px}
  .fp-dot.done{background:rgba(74,222,128,.4)}

  /* progress bar */
  .prog{height:2px;background:rgba(255,255,255,.06)}
  .prog-fill{height:100%;background:linear-gradient(90deg,#1B3D2B,#4ade80);transition:width .12s linear}

  /* ═══ APP UI PRIMITIVES ═══ */
  .browser{display:flex;flex-direction:column;height:100%}
  .bbar{display:flex;align-items:center;gap:8px;padding:8px 14px;background:#1a2018;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0}
  .bdots{display:flex;gap:4px}
  .bdot{width:9px;height:9px;border-radius:50%}
  .burl{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07);border-radius:5px;padding:3px 10px;font-size:11px;color:rgba(255,255,255,.35);font-family:monospace;display:flex;align-items:center;gap:5px}
  .burl-lock{color:#4ade80;font-size:10px}
  .bbody{flex:1;overflow:hidden;position:relative}
  
  .app{display:grid;grid-template-columns:186px 1fr;height:100%;background:#f0f2f0}
  .anav{background:#1B3D2B;display:flex;flex-direction:column;overflow:hidden}
  .an-logo{padding:13px 13px 11px;border-bottom:1px solid rgba(255,255,255,.09);font-size:13.5px;font-weight:800;color:#fff}.an-logo em{font-style:normal;color:rgba(255,255,255,.3)}
  .an-links{padding:9px 6px;display:flex;flex-direction:column;gap:1px;flex:1}
  .an-item{display:flex;align-items:center;gap:7px;padding:7px 9px;border-radius:7px;font-size:12px;font-weight:600;color:rgba(255,255,255,.45);cursor:pointer;transition:all .15s}
  .an-item.on{background:rgba(255,255,255,.11);color:#fff}
  .an-item-d{width:5px;height:5px;border-radius:50%;background:currentColor;opacity:.45;flex-shrink:0}
  .amain{display:flex;flex-direction:column;overflow:hidden}
  .ah{padding:12px 18px;border-bottom:1.5px solid #e5e7e5;background:#fff;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
  .ah-h{font-size:14.5px;font-weight:800;color:#0b0f0c;letter-spacing:-.3px}
  .ac{flex:1;overflow-y:auto;padding:14px 18px;display:flex;flex-direction:column;gap:11px}

  /* card */
  .c{background:#fff;border:1.5px solid #e5e7e5;border-radius:13px;padding:14px}
  .c-h{font-size:12px;font-weight:800;color:#0b0f0c;margin-bottom:9px;display:flex;align-items:center;justify-content:space-between}
  .ctg{font-size:9.5px;font-weight:700;color:#1B3D2B;background:#f0f5f1;border:1px solid #d1e7d9;padding:2px 7px;border-radius:4px}
  .sg{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}
  .sc{background:#fff;border:1.5px solid #e5e7e5;border-radius:10px;padding:11px}
  .sc-n{font-size:21px;font-weight:800;color:#0b0f0c;letter-spacing:-.5px}
  .sc-l{font-size:9.5px;color:#9CA3AF;font-weight:700;text-transform:uppercase;letter-spacing:.4px}
  .green{color:#16A34A}.red{color:#DC2626}.amber{color:#D97706}
  .br{display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:1.5px solid #F3F4F6}
  .br:last-child{border:none}
  .br-m{flex:1;min-width:0}
  .br-n{font-size:12px;font-weight:700;color:#0b0f0c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .br-s{font-size:10.5px;color:#9CA3AF;margin-top:1px}
  .bh{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;white-space:nowrap}
  .bm{background:#FFFBEB;color:#D97706;border:1px solid #FDE68A;font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;white-space:nowrap}
  .bl{background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0;font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;white-space:nowrap}
  .bar{height:5px;background:#F3F4F6;border-radius:3px;overflow:hidden}
  .bar-f{height:100%;border-radius:3px}
  .gf{background:#22c55e}.af{background:#f59e0b}.rf{background:#ef4444}
  .bg{background:#1B3D2B;color:#fff;border:none;border-radius:7px;padding:6px 11px;font-size:11.5px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap}
  .bg:hover{background:#2d5c3f}
  .bs{background:#F3F4F6;color:#374151;border:none;border-radius:7px;padding:6px 11px;font-size:11.5px;font-weight:700;cursor:pointer;white-space:nowrap}
  .bs:hover{background:#E5E7EB}

  /* checklist */
  .cl{display:flex;flex-direction:column;gap:6px}
  .ci{display:flex;align-items:center;gap:7px;padding:7px 9px;border-radius:7px;background:#F9FAFB;font-size:11.5px;font-weight:600;color:#374151}
  .ci.ok{background:#F0FDF4;color:#16A34A}
  .ci.warn{background:#FFFBEB;color:#D97706}
  .ci.err{background:#FEF2F2;color:#DC2626}
  .ci-d{width:14px;height:14px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;flex-shrink:0}
  .ok .ci-d{background:#16A34A;color:#fff}.warn .ci-d{background:#D97706;color:#fff}.err .ci-d{background:#DC2626;color:#fff}

  /* form */
  .fc{background:#fff;border:1.5px solid #e5e7e5;border-radius:13px;padding:22px;max-width:370px;margin:14px auto}
  .fh{font-size:19px;font-weight:800;color:#0b0f0c;margin-bottom:4px;letter-spacing:-.3px}
  .fs{font-size:13px;color:#6b7280;margin-bottom:16px;line-height:1.5}
  .ff{margin-bottom:11px}
  .fl{font-size:10px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.7px;display:block;margin-bottom:5px}
  .fi{width:100%;padding:9px 12px;border:1.5px solid #e5e7e5;border-radius:8px;font-size:13px;color:#0b0f0c;background:#f9fafb;transition:border-color .2s}
  .fi.active{border-color:#1B3D2B;background:#fff}
  .fsb{width:100%;padding:11px;background:#1B3D2B;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:800;cursor:pointer;margin-top:4px;transition:all .2s}
  .fsb.pulse{background:#2d5c3f;transform:scale(.98)}
  .otp-r{display:flex;gap:6px;justify-content:center;margin:4px 0 14px}
  .otp-b{width:42px;height:52px;border:1.5px solid #e5e7e5;border-radius:8px;font-size:22px;font-weight:800;text-align:center;font-family:monospace;background:#f9fafb;display:flex;align-items:center;justify-content:center;color:#9ca3af;transition:all .2s}
  .otp-b.on{border-color:#1B3D2B;background:#f0f5f1;color:#1B3D2B}

  /* MODAL OVERLAY */
  .overlay{position:absolute;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(2px);z-index:20;display:flex;align-items:center;justify-content:center;animation:fadeIn .25s ease}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  .modal{background:#fff;border-radius:16px;padding:22px;width:340px;box-shadow:0 20px 60px rgba(0,0,0,.25);animation:slideUp .3s cubic-bezier(.4,0,.2,1)}
  @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
  .modal-h{font-size:15px;font-weight:800;color:#0b0f0c;margin-bottom:4px;letter-spacing:-.2px}
  .modal-s{font-size:12px;color:#6b7280;margin-bottom:16px;line-height:1.5}
  .modal-field{margin-bottom:10px}
  .modal-label{font-size:10px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.6px;display:block;margin-bottom:4px}
  .modal-input{width:100%;padding:9px 11px;border:1.5px solid #e5e7e5;border-radius:8px;font-size:13px;color:#0b0f0c;background:#f9fafb}
  .modal-input.active{border-color:#1B3D2B;background:#fff}
  .modal-submit{width:100%;padding:11px;background:#1B3D2B;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:800;cursor:pointer;margin-top:4px;display:flex;align-items:center;justify-content:center;gap:6px}
  .modal-row{display:flex;gap:8px}
  .modal-row .modal-input{flex:1}
  .risk-row{display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:12px}
  .risk-row:last-child{border:none}
  .risk-score{font-size:22px;font-weight:800;color:#DC2626}
  .gen-anim{display:flex;align-items:center;gap:10px;padding:14px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px}
  .gen-dot{width:8px;height:8px;border-radius:50%;background:#16A34A;animation:blink 1s infinite}
  .gen-dot:nth-child(2){animation-delay:.2s}
  .gen-dot:nth-child(3){animation-delay:.4s}
  @keyframes blink{0%,100%{opacity:.3}50%{opacity:1}}
  .success-badge{display:inline-flex;align-items:center;gap:6px;background:#F0FDF4;border:1px solid #BBF7D0;color:#16A34A;font-size:13px;font-weight:700;padding:8px 14px;border-radius:8px;margin-bottom:12px}
  
  /* highlight */
  .hl{animation:glow 1.5s ease-out}
  @keyframes glow{0%{box-shadow:0 0 0 0 rgba(74,222,128,.7)}60%{box-shadow:0 0 0 8px rgba(74,222,128,0)}100%{box-shadow:none}}
  
  /* score ring */
  .ring-wrap{position:relative;width:80px;height:80px;margin:0 auto 8px}
  .ring-wrap svg{position:absolute;inset:0;transform:rotate(-90deg)}
  .ring-n{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
  
  @media(max-width:900px){.main{grid-template-columns:1fr}.rpanel{display:none}.scene-tabs .stab{padding:8px 12px;font-size:11px}}
`;

// ── App nav helper ────────────────────────────────────────────────────────────
function AppNav({ active }: { active: string }) {
  return (
    <div className="anav">
      <div className="an-logo">LkSG<em>Compass</em></div>
      <div className="an-links">
        {[["dashboard","Dashboard"],["suppliers","Suppliers"],["complaints","Complaints"],["actions","Actions"],["kpi","KPIs"],["reports","BAFA Report"],["settings","Settings"]].map(([id, label]) => (
          <div key={id} className={`an-item${active === id ? " on" : ""}`}><div className="an-item-d" />{label}</div>
        ))}
      </div>
    </div>
  );
}

function BrowserChrome({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="browser">
      <div className="bbar">
        <div className="bdots"><div className="bdot" style={{ background: "#ef4444" }} /><div className="bdot" style={{ background: "#f59e0b" }} /><div className="bdot" style={{ background: "#22c55e" }} /></div>
        <div className="burl"><span className="burl-lock">🔒</span>{url}</div>
      </div>
      <div className="bbody" style={{ overflow: "hidden", position: "relative" }}>{children}</div>
    </div>
  );
}

// ── FRAME RENDERERS ───────────────────────────────────────────────────────────
function FrameRenderer({ sceneId, frame }: { sceneId: string; frame: Frame }) {
  const { screen, highlight, modal } = frame.uiState;

  // ── Registration screens ──
  if (screen?.startsWith("register")) {
    const showCompany = ["register-company","register-full","register-submit"].includes(screen);
    const showEmail = ["register-full","register-submit"].includes(screen);
    const showPw = ["register-full","register-submit"].includes(screen);
    const submitted = screen === "register-submit";
    return (
      <BrowserChrome url="lksgcompass.de/register">
        <div style={{ background: "#f0f2f0", overflow: "auto", height: "100%" }}>
          <div className="fc">
            <div className="fh">Create your account</div>
            <div className="fs">LkSG compliance workspace in 60 seconds. Free trial, no credit card.</div>
            <div className="ff">
              <label className="fl">Company Name</label>
              <div className={`fi${showCompany ? " active" : ""}`} style={{ color: showCompany ? "#0b0f0c" : "#9ca3af" }}>{showCompany ? "Muster Automotive GmbH" : ""}</div>
            </div>
            <div className="ff">
              <label className="fl">Business Email</label>
              <div className={`fi${showEmail ? " active" : ""}`} style={{ color: showEmail ? "#0b0f0c" : "#9ca3af" }}>{showEmail ? "max@muster-auto.de" : ""}</div>
            </div>
            <div className="ff">
              <label className="fl">Password</label>
              <div className={`fi${showPw ? " active" : ""}`} style={{ color: "#9ca3af" }}>{showPw ? "••••••••••••" : ""}</div>
            </div>
            <div className={`fsb${submitted ? " pulse" : ""}`} style={{ opacity: showCompany ? 1 : 0.45 }}>
              {submitted ? "Creating workspace…" : "Create account →"}
            </div>
            <div style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", marginTop: 10 }}>✓ 14-day free trial · No credit card</div>
          </div>
        </div>
      </BrowserChrome>
    );
  }

  if (screen === "otp") {
    return (
      <BrowserChrome url="lksgcompass.de/register">
        <div style={{ background: "#f0f2f0", overflow: "auto", height: "100%" }}>
          <div className="fc">
            <div className="fh">Check your email</div>
            <div className="fs">We sent a 6-digit verification code to <strong>max@muster-auto.de</strong>.</div>
            <div style={{ background: "#f0f5f1", border: "1px solid #d1e7d9", borderRadius: 9, padding: "9px 13px", fontSize: 12.5, color: "#1B3D2B", marginBottom: 14 }}>✓ Code sent — expires in 15 minutes</div>
            <div className="otp-r">
              {["4","7","3","","",""].map((d, i) => <div key={i} className={`otp-b${d ? " on" : ""}`}>{d}</div>)}
            </div>
            <div className="fsb" style={{ opacity: .5 }}>Confirm code</div>
          </div>
        </div>
      </BrowserChrome>
    );
  }

  // ── Dashboard ──
  if (screen === "dashboard") {
    return (
      <BrowserChrome url="lksgcompass.de/app/dashboard">
        <div className="app">
          <AppNav active="dashboard" />
          <div className="amain">
            <div className="ah">
              <div className="ah-h">Dashboard</div>
              <div style={{ display: "flex", gap: 7 }}>
                <button className="bs" style={{ fontSize: 11 }}>↻</button>
                <button className={`bg${highlight === "add-sup" ? " hl" : ""}`} style={{ fontSize: 11 }}>+ Add Supplier</button>
              </div>
            </div>
            <div className="ac">
              <div className={`sg${highlight === "score" ? " hl" : ""}`} style={{ transition: "box-shadow .3s" }}>
                {[["72","Score","green"],["5","Suppliers",""],["2","Open CAPs","red"],["1","Complaints","amber"]].map(([n,l,c]) => (
                  <div key={l} className="sc"><div className={`sc-n ${c}`}>{n}</div><div className="sc-l">{l}</div></div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
                <div className="c">
                  <div className="c-h">Risk Portfolio <span className="ctg">§5</span></div>
                  {[["High","1 supplier","h"],["Medium","2 suppliers","m"],["Low","2 suppliers","l"]].map(([l,s,t]) => (
                    <div key={String(l)} className="br"><div className="br-m"><div className="br-n">{String(l)}</div><div className="br-s">{String(s)}</div></div><span className={`b${t}`}>{String(t === "h" ? "20%" : t === "m" ? "40%" : "40%")}</span></div>
                  ))}
                </div>
                <div className={`c${highlight === "bafa" ? " hl" : ""}`} style={{ transition: "box-shadow .3s" }}>
                  <div className="c-h">BAFA Readiness</div>
                  <div className="cl">
                    {[["ok","§4 HR Officer ✓"],["ok","§5 Risk analysis ✓"],["warn","§6 CAPs: 2 open"],["err","§8 Officer missing"]].map(([t,l]) => (
                      <div key={String(l)} className={`ci ${t}`}><div className="ci-d">{t==="ok"?"✓":t==="warn"?"!":"✕"}</div>{String(l)}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {modal === "new-supplier" && (
          <div className="overlay">
            <div className="modal">
              <div className="modal-h">Add New Supplier</div>
              <div className="modal-s">The risk engine will score this supplier automatically.</div>
              <div className="modal-field"><label className="modal-label">Supplier Name</label><div className="modal-input active">Ankara Tekstil A.Ş.</div></div>
              <div className="modal-row">
                <div style={{ flex: 1 }}><label className="modal-label">Country</label><div className="modal-input active">Turkey</div></div>
                <div style={{ flex: 1 }}><label className="modal-label">Industry</label><div className="modal-input active">Textile</div></div>
              </div>
              <div className="modal-submit">Calculate Risk & Save →</div>
            </div>
          </div>
        )}
        {modal === "supplier-saved" && (
          <div className="overlay">
            <div className="modal">
              <div className="success-badge">✓ Supplier added — Risk scored</div>
              <div className="modal-h">Ankara Tekstil A.Ş.</div>
              <div className="modal-s">Risk score calculated based on country, industry and profile data.</div>
              {[["Country Risk (Turkey)", "+28 pts"], ["Industry (Textile)", "+15 pts"], ["No Audit", "+12 pts"], ["No CoC", "+8 pts"]].map(([l, v]) => (
                <div key={l} className="risk-row"><span style={{ color: "#374151" }}>{l}</span><span style={{ color: "#DC2626", fontWeight: 700 }}>{v}</span></div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, padding: "10px 14px", background: "#FEF2F2", borderRadius: 9, border: "1px solid #FECACA" }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Final Score</span>
                <span className="risk-score">52 — Medium Risk</span>
              </div>
            </div>
          </div>
        )}
      </BrowserChrome>
    );
  }

  // ── Suppliers ──
  if (screen === "suppliers-list") {
    return (
      <BrowserChrome url="lksgcompass.de/app/suppliers">
        <div className="app">
          <AppNav active="suppliers" />
          <div className="amain">
            <div className="ah">
              <div className="ah-h">Suppliers <span style={{ fontSize: 11.5, color: "#9CA3AF" }}>5 total</span></div>
              <div style={{ display: "flex", gap: 7 }}>
                <button className={`bs${highlight === "excel" ? " hl" : ""}`} style={{ fontSize: 11 }}>📤 Excel Import</button>
                <button className="bg" style={{ fontSize: 11 }}>+ New</button>
              </div>
            </div>
            <div className="ac">
              <div className="c">
                {[
                  { id: "sup-shenzhen", n: "Shenzhen Parts Co.", c: "🇨🇳 China", i: "Electronics", s: 78, r: "h" },
                  { id: "sup-ankara", n: "Ankara Tekstil A.Ş.", c: "🇹🇷 Turkey", i: "Textile", s: 52, r: "m" },
                  { id: "sup-hanoi", n: "Hanoi Electro Ltd.", c: "🇻🇳 Vietnam", i: "Electronics", s: 61, r: "m" },
                  { id: "sup-schmidt", n: "Schmidt Logistik", c: "🇩🇪 Germany", i: "Logistics", s: 18, r: "l" },
                  { id: "sup-warsaw", n: "Warsaw Auto Parts", c: "🇵🇱 Poland", i: "Automotive", s: 24, r: "l" },
                ].map(s => (
                  <div key={s.n} className={`br${highlight === "shenzhen" && s.r === "h" ? " hl" : ""}`} style={{ transition: "box-shadow .3s", cursor: "pointer" }}>
                    <div className="br-m"><div className="br-n">{s.n}</div><div className="br-s">{s.c} · {s.i}</div></div>
                    <div className="bar" style={{ width: 65, marginRight: 8 }}><div className={`bar-f ${s.r === "h" ? "rf" : s.r === "m" ? "af" : "gf"}`} style={{ width: `${s.s}%` }} /></div>
                    <span className={`b${s.r}`}>{s.r === "h" ? "High" : s.r === "m" ? "Medium" : "Low"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {modal === "risk-detail" && (
          <div className="overlay">
            <div className="modal">
              <div className="modal-h">🇨🇳 Shenzhen Parts Co.</div>
              <div className="modal-s">Full risk factor breakdown — §5 LkSG analysis</div>
              {[["Country Risk (China)","🔴 +35 pts","High"],["Industry (Electronics)","🟠 +18 pts","Elevated"],["No Code of Conduct","🔴 +12 pts","Missing"],["No Audit Report","🔴 +13 pts","Missing"],["Previous Violations","🔴 +0 pts","None"]].map(([l, v, t]) => (
                <div key={l} className="risk-row"><div><div style={{ fontSize: 12, fontWeight: 700, color: "#0b0f0c" }}>{l}</div><div style={{ fontSize: 10.5, color: "#9CA3AF" }}>{t}</div></div><span style={{ fontSize: 12, fontWeight: 800, color: "#DC2626" }}>{v}</span></div>
              ))}
              <div style={{ marginTop: 10, padding: "9px 12px", background: "#FEF2F2", borderRadius: 8, border: "1px solid #FECACA", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Total Score</span><span className="risk-score">78/100 — High Risk</span>
              </div>
              <button className="modal-submit" style={{ marginTop: 10 }}>Create Corrective Action Plan →</button>
            </div>
          </div>
        )}
        {modal === "excel-import" && (
          <div className="overlay">
            <div className="modal">
              <div className="modal-h">📤 Excel Import</div>
              <div className="modal-s">Upload an XLSX file. Column detection works automatically.</div>
              <div style={{ border: "2px dashed #d1e7d9", borderRadius: 10, padding: "24px", textAlign: "center", background: "#f0f5f1", marginBottom: 12 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>📊</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1B3D2B" }}>suppliers_2024.xlsx</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>48 rows detected</div>
              </div>
              <button className="modal-submit">Detect columns & preview →</button>
            </div>
          </div>
        )}
        {modal === "excel-preview" && (
          <div className="overlay">
            <div className="modal">
              <div className="modal-h">Column Mapping</div>
              <div className="modal-s">Auto-detected from your XLSX. Review before importing.</div>
              {[["BİNA / APT İSMİ","→ Company Name","✓"],["ÜLKE","→ Country","✓"],["İLÇESİ","→ District / Address","✓"],["YÖN TELEFONU","→ Phone","✓"]].map(([a, b, c]) => (
                <div key={a} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #F3F4F6", fontSize: 12 }}>
                  <span style={{ fontFamily: "monospace", color: "#6b7280" }}>{a}</span>
                  <span style={{ color: "#1B3D2B", fontWeight: 700 }}>{b}</span>
                  <span style={{ color: "#16A34A", fontWeight: 800 }}>{c}</span>
                </div>
              ))}
              <button className="modal-submit" style={{ marginTop: 12 }}>Import 48 suppliers →</button>
            </div>
          </div>
        )}
      </BrowserChrome>
    );
  }

  // ── Complaints ──
  if (screen === "complaints-list") {
    return (
      <BrowserChrome url="lksgcompass.de/app/complaints">
        <div className="app">
          <AppNav active="complaints" />
          <div className="amain">
            <div className="ah">
              <div className="ah-h">Complaints <span style={{ fontSize: 11, color: "#9CA3AF" }}>3 total</span></div>
              <button className={`bs${highlight === "portal" ? " hl" : ""}`} style={{ fontSize: 11 }}>🔗 Copy portal link</button>
            </div>
            <div className="ac">
              <div className={`c${highlight === "critical" ? " hl" : ""}`} style={{ borderColor: "#FECACA", background: "#FFF5F5", cursor: "pointer", transition: "box-shadow .3s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <div><div style={{ fontSize: 10, fontWeight: 800, color: "#DC2626", marginBottom: 3 }}>⚠ NEW · CRITICAL · Act within 7 days</div><div style={{ fontSize: 12.5, fontWeight: 700, color: "#0b0f0c" }}>Child labor at Tier-2 supplier</div><div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>Shenzhen Parts · §2 Nr.1 LkSG · REF: BSWD-3A1B</div></div>
                  <span className="bh">Critical</span>
                </div>
                <div style={{ fontSize: 11.5, color: "#374151", lineHeight: 1.6, padding: "8px 10px", background: "#fff", borderRadius: 7, border: "1px solid #FECACA", marginBottom: 9 }}>
                  "Minors under 15 observed during facility visit at production floor level 3..."
                </div>
                <div style={{ display: "flex", gap: 7 }}>
                  <button className="bg" style={{ fontSize: 10.5 }}>Create CAP</button>
                  <button className="bs" style={{ fontSize: 10.5 }}>Acknowledge</button>
                  <button className="bs" style={{ fontSize: 10.5 }}>Change status</button>
                </div>
              </div>
              {[{ ref: "BSWD-2C4D", c: "Environmental violation", r: "m", st: "Under review" }, { ref: "BSWD-5E6F", c: "Discrimination", r: "l", st: "Resolved ✓" }].map(x => (
                <div key={x.ref} className="c" style={{ padding: "11px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><div style={{ fontSize: 10, fontFamily: "monospace", color: "#9CA3AF" }}>{x.ref}</div><div style={{ fontSize: 12.5, fontWeight: 700, color: "#0b0f0c", marginTop: 1 }}>{x.c}</div></div>
                    <span className={`b${x.r}`}>{x.st}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {modal === "complaint-detail" && (
          <div className="overlay">
            <div className="modal">
              <div className="bh" style={{ marginBottom: 10, display: "inline-flex" }}>§2 Nr.1 LkSG — Child labor</div>
              <div className="modal-h">Full Case: BSWD-3A1B</div>
              <div style={{ background: "#FFF5F5", border: "1px solid #FECACA", borderRadius: 9, padding: "10px 12px", marginBottom: 12, fontSize: 12, color: "#374151", lineHeight: 1.65 }}>
                "Minors under 15 years old were observed working on the production floor during an unannounced facility visit on March 3rd, 2025. Estimated 6-8 individuals affected."
              </div>
              {[["Reported", "Anonymous · via portal"], ["Received", "04.03.2025 · 09:14"], ["LkSG deadline", "11.03.2025 (7 days)"], ["Investigation due", "04.06.2025 (3 months)"]].map(([l, v]) => (
                <div key={l} className="risk-row"><span style={{ fontSize: 11.5, color: "#6b7280" }}>{l}</span><span style={{ fontSize: 12, fontWeight: 700, color: "#0b0f0c" }}>{v}</span></div>
              ))}
              <button className="modal-submit" style={{ marginTop: 12 }}>Create Corrective Action Plan →</button>
            </div>
          </div>
        )}
        {modal === "cap-from-complaint" && (
          <div className="overlay">
            <div className="modal">
              <div className="modal-h">New Corrective Action Plan</div>
              <div className="modal-s">Pre-filled from complaint BSWD-3A1B — §7 LkSG</div>
              <div className="modal-field"><label className="modal-label">Title</label><div className="modal-input active">Investigate & remediate child labor — Shenzhen Parts</div></div>
              <div className="modal-row">
                <div style={{ flex: 1 }}><label className="modal-label">Priority</label><div className="modal-input active">Critical</div></div>
                <div style={{ flex: 1 }}><label className="modal-label">Due date</label><div className="modal-input active">04.06.2025</div></div>
              </div>
              <div className="modal-field"><label className="modal-label">LkSG Reference</label><div className="modal-input active">§7 Abs.1 LkSG — Abhilfemaßnahme</div></div>
              <button className="modal-submit">Save CAP & notify supplier →</button>
            </div>
          </div>
        )}
      </BrowserChrome>
    );
  }

  // ── Actions ──
  if (screen === "actions-list") {
    return (
      <BrowserChrome url="lksgcompass.de/app/actions">
        <div className="app">
          <AppNav active="actions" />
          <div className="amain">
            <div className="ah">
              <div className="ah-h">Action Plans <span style={{ fontSize: 11, color: "#DC2626" }}>2 overdue</span></div>
              <button className="bg" style={{ fontSize: 11 }}>+ New CAP</button>
            </div>
            <div className="ac">
              <div className={`c${highlight === "overdue" ? " hl" : ""}`} style={{ borderColor: "#FECACA", background: "#FFF9F9", cursor: "pointer", transition: "box-shadow .3s" }}>
                <div style={{ fontSize: 10, color: "#DC2626", fontWeight: 800, marginBottom: 5 }}>⏰ OVERDUE — 3 days · §7 LkSG</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: "#0b0f0c", marginBottom: 2 }}>Investigate child labor allegations</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>Shenzhen Parts Co. · Assigned: M. Weber</div>
                    <div className="bar" style={{ width: 120, marginTop: 7 }}><div className="bar-f af" style={{ width: "35%" }} /></div>
                    <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 2 }}>35% complete</div>
                  </div>
                  <span className="bh" style={{ marginLeft: 8 }}>Critical</span>
                </div>
              </div>
              {[{ t: "Sign Code of Conduct", s: "Ankara Tekstil", d: "15.04.2025", p: 60, r: "m" }, { t: "Request audit report", s: "Hanoi Electro", d: "30.04.2025", p: 0, r: "l" }].map(a => (
                <div key={a.t} className="c" style={{ padding: "11px 14px", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0b0f0c" }}>{a.t}</div>
                      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>{a.s} · Due: {a.d}</div>
                      <div className="bar" style={{ width: 90, marginTop: 6 }}><div className={`bar-f ${a.p > 0 ? "af" : "rf"}`} style={{ width: `${Math.max(a.p, 4)}%` }} /></div>
                    </div>
                    <span className={`b${a.r}`} style={{ marginLeft: 8 }}>{a.r === "m" ? "High" : "Medium"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {modal === "cap-detail" && (
          <div className="overlay">
            <div className="modal">
              <div className="bh" style={{ marginBottom: 10, display: "inline-flex" }}>⏰ Overdue 3 days</div>
              <div className="modal-h">Investigate child labor allegations</div>
              <div className="modal-s">Shenzhen Parts Co. · §7 Abs.1 LkSG</div>
              <div className="modal-field"><label className="modal-label">Progress</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="bar" style={{ flex: 1 }}><div className="bar-f af" style={{ width: "35%" }} /></div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>35%</span>
                </div>
              </div>
              <div className="modal-field"><label className="modal-label">Status</label><div className="modal-input active">In Progress</div></div>
              <div className="modal-field"><label className="modal-label">Evidence Notes</label><div className="modal-input active" style={{ minHeight: 52, fontSize: 12 }}>Factory visit scheduled 15.03.2025. Legal team notified...</div></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="modal-submit" style={{ flex: 1 }}>Save changes</button>
                <button className="bs" style={{ padding: "11px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>📎 Evidence</button>
              </div>
            </div>
          </div>
        )}
        {modal === "cap-evidence" && (
          <div className="overlay">
            <div className="modal">
              <div className="modal-h">📎 Attach Evidence</div>
              <div className="modal-s">§10 Abs.1 LkSG — 7-year retention enforced automatically.</div>
              <div style={{ border: "2px dashed #d1e7d9", borderRadius: 9, padding: "18px", textAlign: "center", background: "#f0f5f1", marginBottom: 12 }}>
                <div style={{ fontSize: 24, marginBottom: 5 }}>📄</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1B3D2B" }}>factory_visit_report_15032025.pdf</div>
                <div style={{ fontSize: 10.5, color: "#6b7280", marginTop: 2 }}>2.4 MB · Uploaded now</div>
              </div>
              <div className="gen-anim" style={{ marginBottom: 12 }}>
                <div className="gen-dot" /><div className="gen-dot" /><div className="gen-dot" />
                <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>Evidence stored · Retention: until 2032</span>
              </div>
              <button className="modal-submit">Confirm & link to CAP →</button>
            </div>
          </div>
        )}
      </BrowserChrome>
    );
  }

  // ── Reports ──
  if (screen === "reports-main") {
    return (
      <BrowserChrome url="lksgcompass.de/app/reports">
        <div className="app">
          <AppNav active="reports" />
          <div className="amain">
            <div className="ah">
              <div className="ah-h">BAFA Report 2024</div>
              <div style={{ display: "flex", gap: 7 }}>
                <button className={`bs${highlight === "ai-btn" ? " hl" : ""}`} style={{ fontSize: 11 }}>🤖 AI Draft</button>
                <button className={`bg${highlight === "pdf" ? " hl" : ""}`} style={{ fontSize: 11 }}>📄 Export PDF</button>
              </div>
            </div>
            <div className="ac">
              <div className="c" style={{ borderColor: "#BBF7D0", background: "#F0FDF4" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0b0f0c" }}>Report approved ✓</div><span className="bl">Submitted 12.03.2025</span>
                </div>
                <div style={{ fontSize: 11, color: "#374151" }}>BAFA 2024 · Muster Automotive GmbH · §9 LkSG</div>
              </div>
              <div className={`c${highlight === "sections" ? " hl" : ""}`} style={{ transition: "box-shadow .3s" }}>
                <div className="c-h">Report Sections</div>
                {["§5 Risk Analysis","§6 Prevention Measures","§7 Remediation Actions","§8 Complaint Mechanism","§9 Effectiveness Review","§10 Documentation"].map((s, i) => (
                  <div key={s} className="br"><div className="br-m"><div className="br-n" style={{ fontSize: 12 }}>{s}</div></div><span className={i < 4 ? "bl" : i === 4 ? "bm" : "bh"} style={{ fontSize: 10 }}>{i < 4 ? "✓ Complete" : i === 4 ? "In progress" : "Open"}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {modal === "ai-generating" && (
          <div className="overlay">
            <div className="modal">
              <div className="modal-h">🤖 AI is drafting your report…</div>
              <div className="modal-s">Claude reads your compliance data and writes a structured BAFA report.</div>
              <div className="gen-anim" style={{ marginBottom: 14 }}>
                <div className="gen-dot" /><div className="gen-dot" /><div className="gen-dot" />
                <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>Analysing 5 suppliers, 3 CAPs, 1 complaint…</span>
              </div>
              {["Reading §5 risk data...","Writing §6 prevention section...","Drafting §8 complaint summary..."].map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", fontSize: 12, color: i === 2 ? "#16A34A" : "#9CA3AF", fontWeight: i === 2 ? 700 : 400 }}>
                  <span>{i === 2 ? "✓" : "○"}</span>{s}
                </div>
              ))}
            </div>
          </div>
        )}
        {modal === "ai-draft-done" && (
          <div className="overlay">
            <div className="modal">
              <div className="success-badge">✓ AI draft complete — 847 words</div>
              <div className="modal-h">BAFA Report Draft</div>
              <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 9, padding: "11px 13px", fontSize: 11.5, color: "#374151", lineHeight: 1.7, marginBottom: 12 }}>
                "Die Muster Automotive GmbH hat gemäß §5 LkSG eine Risikoanalyse für 5 direkte Lieferanten durchgeführt. Ein Lieferant wurde als hochriskant eingestuft und ein Abhilfemaßnahmenplan nach §7 LkSG initiiert..."
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="modal-submit" style={{ flex: 1 }}>Submit for approval →</button>
                <button className="bs" style={{ padding: "11px 14px", borderRadius: 8, fontWeight: 700, fontSize: 13 }}>Edit</button>
              </div>
            </div>
          </div>
        )}
        {modal === "pdf-export" && (
          <div className="overlay">
            <div className="modal">
              <div className="success-badge">✓ PDF generated</div>
              <div className="modal-h">📄 BAFA_Bericht_2024_Muster.pdf</div>
              <div className="modal-s">Structured PDF ready for BAFA submission.</div>
              {[["Pages","14"],["Sections","§5 – §10"],["Timestamp","15.03.2025 14:32"],["Approved by","M. Weber (Admin)"]].map(([l,v]) => (
                <div key={l} className="risk-row"><span style={{ fontSize: 12, color: "#6b7280" }}>{l}</span><span style={{ fontSize: 12, fontWeight: 700, color: "#0b0f0c" }}>{v}</span></div>
              ))}
              <button className="modal-submit" style={{ marginTop: 10 }}>⬇ Download PDF</button>
            </div>
          </div>
        )}
      </BrowserChrome>
    );
  }

  // ── KPI ──
  if (screen === "kpi-main") {
    return (
      <BrowserChrome url="lksgcompass.de/app/kpi">
        <div className="app">
          <AppNav active="kpi" />
          <div className="amain">
            <div className="ah">
              <div className="ah-h">KPIs <span style={{ fontSize: 11, color: "#9CA3AF" }}>§9 LkSG</span></div>
              <button className={`bg${highlight === "snapshot" ? " hl" : ""}`} style={{ fontSize: 11 }}>Save snapshot</button>
            </div>
            <div className="ac">
              <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", gap: 11 }}>
                <div className={`c${highlight === "score" ? " hl" : ""}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "box-shadow .3s" }}>
                  <div className="ring-wrap">
                    <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="none" stroke="#F3F4F6" strokeWidth="8"/><circle cx="50" cy="50" r="38" fill="none" stroke="#22c55e" strokeWidth="8" strokeDasharray={`${72*2.39} ${100*2.39}`} strokeLinecap="round"/></svg>
                    <div className="ring-n"><div style={{ fontSize: 20, fontWeight: 800, color: "#16A34A", lineHeight: 1 }}>72</div><div style={{ fontSize: 9.5, color: "#9CA3AF", fontWeight: 700 }}>Grade B</div></div>
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", textAlign: "center", lineHeight: 1.4 }}>Compliance<br/>Score<br/><span style={{ color: "#D97706", fontWeight: 700 }}>↑ +5 last month</span></div>
                </div>
                <div className="c">
                  <div className="c-h">Effectiveness Indicators <span className="ctg">§9</span></div>
                  {[["Audit coverage","60","af"],["CoC coverage","80","gf"],["CAP completion","50","af"],["SAQ response","33","rf"]].map(([l,v,c]) => (
                    <div key={String(l)} className="br"><div className="br-m"><div className="br-n" style={{ fontSize: 11.5 }}>{String(l)}</div></div><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div className="bar" style={{ width: 65 }}><div className={`bar-f ${c}`} style={{ width: `${v}%` }} /></div><span style={{ fontSize: 11.5, fontWeight: 700, color: "#374151", width: 28, textAlign: "right" }}>{v}%</span></div></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {modal === "saq-reminder" && (
          <div className="overlay">
            <div className="modal">
              <div className="modal-h">Send SAQ Reminder</div>
              <div className="modal-s">Supplier Assessment Questionnaire — track responses</div>
              <div className="modal-field"><label className="modal-label">Supplier</label><div className="modal-input active">Hanoi Electro Ltd.</div></div>
              <div className="modal-field"><label className="modal-label">Message</label><div className="modal-input active" style={{ fontSize: 12, minHeight: 48 }}>Dear supplier, please complete your annual SAQ by 30.04.2025...</div></div>
              <div className="gen-anim" style={{ marginBottom: 12 }}>
                <div className="gen-dot" /><div className="gen-dot" /><div className="gen-dot" />
                <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>Sending via Resend · logged in audit trail</span>
              </div>
              <button className="modal-submit">Send reminder →</button>
            </div>
          </div>
        )}
      </BrowserChrome>
    );
  }

  // ── Team ──
  if (screen === "team-main") {
    return (
      <BrowserChrome url="lksgcompass.de/app/settings">
        <div className="app">
          <AppNav active="settings" />
          <div className="amain">
            <div className="ah"><div className="ah-h">Settings</div></div>
            <div className="ac">
              <div style={{ display: "flex", gap: 5, marginBottom: 2 }}>
                {["Company","Team","Billing","Legal"].map((t, i) => (
                  <div key={t} style={{ padding: "6px 11px", borderRadius: 7, fontSize: 12, fontWeight: 700, background: i === 1 ? "#1B3D2B" : "transparent", color: i === 1 ? "#fff" : "#6b7280", cursor: "pointer" }}>{t}</div>
                ))}
              </div>
              <div className={`c${highlight === "invite" ? " hl" : ""}`} style={{ transition: "box-shadow .3s" }}>
                <div className="c-h">Invite team member</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ flex: 1, padding: "8px 11px", border: "1.5px solid #e5e7e5", borderRadius: 8, fontSize: 12.5, color: "#9ca3af", background: "#f9fafb" }}>colleague@company.de</div>
                  <select style={{ padding: "8px 10px", borderRadius: 7, border: "1.5px solid #e5e7e5", fontSize: 12, color: "#374151", background: "#fff" }}><option>Member</option></select>
                  <button className="bg" style={{ fontSize: 11 }}>Send invite</button>
                </div>
              </div>
              <div className="c">
                <div className="c-h">Team <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600 }}>3 members</span></div>
                {[{ e: "max@muster-auto.de", r: "Admin", s: "l" }, { e: "anna@muster-auto.de", r: "Member", s: "l" }, { e: "jo@extern.de", r: "Viewer", s: "m" }].map(m => (
                  <div key={m.e} className="br"><div className="br-m"><div className="br-n" style={{ fontSize: 12 }}>{m.e}</div><div className="br-s">{m.r}</div></div><span className={`b${m.s}`}>{m.s === "l" ? "Active" : "Invited"}</span></div>
                ))}
              </div>
              <div className={`c${highlight === "billing" ? " hl" : ""}`} style={{ transition: "box-shadow .3s" }}>
                <div className="c-h">Billing Plans</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
                  {[{ n: "Free", p: "€0/mo", f: ["5 suppliers","1 user"], c: "#6B7280" }, { n: "Pro", p: "€149/mo", f: ["Unlimited","5 users","AI"], c: "#1B3D2B", best: true }, { n: "Enterprise", p: "€499/mo", f: ["Unlimited","∞ users","SSO"], c: "#7C3AED" }].map(plan => (
                    <div key={plan.n} style={{ border: `1.5px solid ${plan.best ? "#1B3D2B" : "#E5E7EB"}`, borderRadius: 9, padding: 10, background: plan.best ? "#F8FAF8" : "#fff" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: "#0b0f0c" }}>{plan.n}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: plan.c, margin: "3px 0 6px" }}>{plan.p}</div>
                      {plan.f.map(f => <div key={f} style={{ fontSize: 10.5, color: "#6b7280", marginBottom: 2 }}>✓ {f}</div>)}
                      {plan.best && <button className="bg" style={{ width: "100%", fontSize: 10, marginTop: 7 }}>Start trial</button>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {modal === "invite-sent" && (
          <div className="overlay">
            <div className="modal">
              <div className="success-badge">✓ Invitation sent</div>
              <div className="modal-h">Invite: anna@muster-auto.de</div>
              <div className="modal-s">A secure email invitation has been sent.</div>
              {[["Role","Member"],["Link expires","in 7 days"],["Access","Suppliers, Complaints, Actions"],["Email sent via","Resend · logged"]].map(([l,v]) => (
                <div key={l} className="risk-row"><span style={{ fontSize: 12, color: "#6b7280" }}>{l}</span><span style={{ fontSize: 12, fontWeight: 700, color: "#0b0f0c" }}>{v}</span></div>
              ))}
            </div>
          </div>
        )}
        {modal === "billing-upgrade" && (
          <div className="overlay">
            <div className="modal">
              <div className="modal-h">🚀 Upgrade to Pro</div>
              <div className="modal-s">Everything in Free, plus unlimited suppliers, AI assistant and 5 team members.</div>
              {[["Price","€149 / month"],["Trial","14 days free — no credit card"],["Suppliers","Unlimited"],["Team members","Up to 5"],["AI BAFA drafts","✓ Included"],["KPI snapshots","✓ Included"]].map(([l,v]) => (
                <div key={l} className="risk-row"><span style={{ fontSize: 12, color: "#6b7280" }}>{l}</span><span style={{ fontSize: 12, fontWeight: 700, color: "#0b0f0c" }}>{v}</span></div>
              ))}
              <button className="modal-submit" style={{ marginTop: 12 }}>Start 14-day free trial →</button>
            </div>
          </div>
        )}
      </BrowserChrome>
    );
  }

  return null;
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function DemoPage() {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [visited, setVisited] = useState(new Set([0]));
  const [progPct, setProgPct] = useState(0);

  const scene = SCENES[sceneIdx];
  const frame = scene.frames[frameIdx];
  const totalFrames = scene.frames.length;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const speak = useCallback((text: string) => {
    if (muted || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; u.rate = 0.9; u.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Google") || v.name.includes("Daniel")));
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  }, [muted]);

  const stopAll = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progRef.current) clearInterval(progRef.current);
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  const startProgress = useCallback((duration: number) => {
    if (progRef.current) clearInterval(progRef.current);
    setProgPct(0);
    const tick = 80;
    const steps = duration / tick;
    let i = 0;
    progRef.current = setInterval(() => {
      i++;
      setProgPct(Math.min(100, (i / steps) * 100));
      if (i >= steps) clearInterval(progRef.current!);
    }, tick);
  }, []);

  const goToFrame = useCallback((si: number, fi: number, auto = false) => {
    const s = SCENES[si];
    const f = s.frames[fi];
    setSceneIdx(si); setFrameIdx(fi); setProgPct(0);
    setVisited(v => new Set([...v, si]));
    stopAll();
    if (auto) {
      speak(f.narration);
      startProgress(f.duration);
      timerRef.current = setTimeout(() => {
        // advance to next frame or scene
        if (fi + 1 < s.frames.length) {
          goToFrame(si, fi + 1, true);
        } else if (si + 1 < SCENES.length) {
          goToFrame(si + 1, 0, true);
        } else {
          setPlaying(false);
        }
      }, f.duration);
    }
  }, [speak, startProgress, stopAll]);

  useEffect(() => {
    if (playing) goToFrame(sceneIdx, frameIdx, true);
    else stopAll();
    return stopAll;
  }, [playing]);

  useEffect(() => {
    if (muted && typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, [muted]);

  const overall = ((sceneIdx * 10 + (frameIdx / totalFrames) * 10) / (SCENES.length * 10)) * 100 + (progPct / (SCENES.length * 10));

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="shell">
        {/* Topbar */}
        <div className="tb">
          <a href="/" className="tb-logo">LkSG<em>Compass</em></a>
          <div className="tb-r">
            <div className="tb-badge">▶ Interactive Product Demo</div>
            <a href="/register" className="tb-cta">Start free trial →</a>
          </div>
        </div>

        {/* Progress */}
        <div className="prog"><div className="prog-fill" style={{ width: `${overall}%` }} /></div>

        {/* Scene tabs */}
        <div className="scene-tabs">
          {SCENES.map((s, i) => (
            <button key={s.id} className={`stab${sceneIdx === i ? " on" : ""}${visited.has(i) && sceneIdx !== i ? " done" : ""}`}
              onClick={() => { setPlaying(false); goToFrame(i, 0, false); }}>
              <span className="stab-n">{i + 1}</span>{s.title}
            </button>
          ))}
        </div>

        {/* Main */}
        <div className="main">
          {/* Viewport */}
          <div className="viewport">
            {SCENES.map((s, si) =>
              s.frames.map((f, fi) => (
                <div key={`${si}-${fi}`} className={`vp-frame${sceneIdx === si && frameIdx === fi ? " vis" : ""}`}>
                  <FrameRenderer sceneId={s.id} frame={f} />
                </div>
              ))
            )}
          </div>

          {/* Right panel */}
          <div className="rpanel">
            <div className="rp-scene-info">
              <div className="rp-law">{scene.law}</div>
              <div className="rp-title">{scene.title}</div>
              <div className="rp-sub">{scene.subtitle}</div>
            </div>

            <div className="rp-narr">
              {scene.frames.map((f, fi) => (
                <div key={fi} className={`narr-bubble${frameIdx === fi && sceneIdx === sceneIdx ? " active" : ""}`}>
                  <strong style={{ fontSize: 10.5, color: frameIdx === fi ? "#4ade80" : "rgba(255,255,255,.3)", display: "block", marginBottom: 4 }}>
                    Step {fi + 1} of {totalFrames}
                  </strong>
                  {f.narration}
                </div>
              ))}
            </div>

            <div className="rp-controls">
              <div className="fp-dots">
                {scene.frames.map((_, fi) => (
                  <div key={fi} className={`fp-dot${frameIdx === fi ? " on" : fi < frameIdx ? " done" : ""}`}
                    onClick={() => { setPlaying(false); goToFrame(sceneIdx, fi, false); }} />
                ))}
              </div>
              <div className="rc-row1">
                <button className="rc-play" onClick={() => setPlaying(p => !p)}>
                  {playing ? "⏸ Pause" : "▶ Play"} scene
                </button>
                <button className="rc-mute" onClick={() => setMuted(m => !m)}>
                  {muted ? "🔇" : "🔊"}
                </button>
              </div>
              <div className="rc-row2">
                <button className="rc-btn" disabled={sceneIdx === 0 && frameIdx === 0}
                  onClick={() => { setPlaying(false); if (frameIdx > 0) goToFrame(sceneIdx, frameIdx - 1); else goToFrame(sceneIdx - 1, SCENES[sceneIdx - 1].frames.length - 1); }}>
                  ← Back
                </button>
                {sceneIdx === SCENES.length - 1 && frameIdx === totalFrames - 1 ? (
                  <a href="/register" className="rc-btn p" style={{ textDecoration: "none", flex: 1 }}>Get started →</a>
                ) : (
                  <button className="rc-btn p"
                    onClick={() => { setPlaying(false); if (frameIdx < totalFrames - 1) goToFrame(sceneIdx, frameIdx + 1); else goToFrame(sceneIdx + 1, 0); }}>
                    Next →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
