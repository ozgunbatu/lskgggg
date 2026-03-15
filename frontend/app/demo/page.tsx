"use client";
import { useState, useEffect, useRef, useCallback } from "react";

type UiState = Record<string, any>;
type Frame = { narration: string; ui: UiState };
type Scene = { id: string; title: string; subtitle: string; law: string; frames: Frame[] };

// ── SCENES — narrations kept to max 20 words so speech always completes ───────
const SCENES: Scene[] = [
  { id:"register", title:"Account erstellen", subtitle:"60-Sekunden-Onboarding", law:"§4 LkSG", frames:[
    { narration:"Welcome to LkSGCompass. Click Get started free to open the registration form.", ui:{step:"empty"} },
    { narration:"Enter your company name. LkSGCompass creates an isolated workspace just for you.", ui:{step:"company"} },
    { narration:"Add your business email and password. Fourteen-day free trial, no credit card.", ui:{step:"full"} },
    { narration:"Click Create account. A six-digit verification code is sent to your email.", ui:{step:"submit"} },
    { narration:"Enter the code. Your compliance workspace is live in under sixty seconds.", ui:{step:"otp"} },
  ]},
  { id:"dashboard", title:"Dashboard", subtitle:"Compliance-Überblick", law:"§9 LkSG", frames:[
    { narration:"The dashboard shows your compliance score: seventy-two out of one hundred, Grade B.", ui:{hl:"score",modal:null} },
    { narration:"The BAFA readiness checklist shows what is still missing. The Complaints Officer field is empty.", ui:{hl:"bafa",modal:null} },
    { narration:"Click Add Supplier to open the form. The risk engine scores automatically.", ui:{hl:"addsup",modal:"new-supplier"} },
    { narration:"Risk score saved. Country, industry, and missing controls contribute to the result.", ui:{hl:null,modal:"supplier-saved"} },
  ]},
  { id:"suppliers", title:"Lieferanten", subtitle:"Automatisches §5 Scoring", law:"§5 LkSG", frames:[
    { narration:"Five suppliers are ranked by risk score. Shenzhen Parts is high risk at seventy-eight.", ui:{hl:null,modal:null} },
    { narration:"Click Shenzhen Parts to open the breakdown. Country risk adds thirty-five points.", ui:{hl:"shenzhen",modal:"risk-detail"} },
    { narration:"Click Excel Import. Upload any XLSX file. Columns are detected automatically.", ui:{hl:"excel",modal:"excel-import"} },
    { narration:"Review the column mapping. Import fifty suppliers in seconds instead of hours.", ui:{hl:null,modal:"excel-preview"} },
  ]},
  { id:"complaints", title:"Beschwerden", subtitle:"§8 Hinweisgebersystem", law:"§8 LkSG", frames:[
    { narration:"The complaints module handles your paragraph eight obligations. A public portal URL is created automatically.", ui:{hl:"portal",modal:null} },
    { narration:"A critical complaint arrived: child labor at a supplier. You must acknowledge within seven days.", ui:{hl:"critical",modal:null} },
    { narration:"Open the complaint to see the full case, deadlines, and complete audit trail.", ui:{hl:null,modal:"complaint-detail"} },
    { narration:"Click Create Action Plan. It is pre-filled with supplier and legal reference.", ui:{hl:null,modal:"cap-from-complaint"} },
  ]},
  { id:"actions", title:"Aktionspläne", subtitle:"CAP & Nachweise", law:"§6 & §7 LkSG", frames:[
    { narration:"The action plan view lists all corrective actions. Red items are overdue and reduce your score.", ui:{hl:"overdue",modal:null} },
    { narration:"Open an overdue plan. Update progress, add notes, and change the status.", ui:{hl:null,modal:"cap-detail"} },
    { narration:"Attach evidence. Documents are stored with seven-year retention per paragraph ten.", ui:{hl:null,modal:"cap-evidence"} },
  ]},
  { id:"legal", title:"Rechtsassistent", subtitle:"Vorlagen, Q&A & Vertragscheck", law:"§6 Abs.2", frames:[
    { narration:"The Legal Assistant contains six ready-to-use LkSG document templates.", ui:{view:"templates"} },
    { narration:"Click Generate. Claude writes a complete Code of Conduct in German or English.", ui:{view:"templates",modal:"coc-generating"} },
    { narration:"The Legal Q&A answers your LkSG questions with paragraph references and action steps.", ui:{view:"ask"} },
    { narration:"Paste any contract text for review. The AI flags missing audit rights and gaps.", ui:{view:"review"} },
  ]},
  { id:"reports", title:"BAFA-Bericht", subtitle:"KI-generiert, prüfbereit", law:"§9 LkSG", frames:[
    { narration:"The report module tracks all six BAFA sections from paragraph five through ten.", ui:{hl:"sections",modal:null} },
    { narration:"Click AI Draft. Claude reads your data and writes the German report in seconds.", ui:{hl:"ai-btn",modal:"ai-generating"} },
    { narration:"The draft covers all sections with real numbers. Submit for team approval.", ui:{hl:null,modal:"ai-draft-done"} },
    { narration:"Export as PDF. Structured and BAFA-ready with timestamp and approval signature.", ui:{hl:"pdf",modal:"pdf-export"} },
  ]},
  { id:"defense", title:"Verteidigungsakte", subtitle:"BAFA-Prüfungsdokumentation", law:"§10 LkSG", frames:[
    { narration:"The BAFA Defense File exports all paragraph five through ten evidence in one structured document.", ui:{view:"defense",highlight:null} },
    { narration:"It includes risk data, action plans, complaint records, and two hundred audit trail entries.", ui:{view:"defense",highlight:"sections"} },
    { narration:"Download with one click. Your lawyer starts from a complete file when BAFA investigates.", ui:{view:"defense",highlight:"download"} },
  ]},
  { id:"team", title:"Team & Abonnement", subtitle:"Multi-User-Zusammenarbeit", law:"Pro Plan", frames:[
    { narration:"Open Settings, Team tab. Send a secure invitation link valid for seven days.", ui:{hl:"invite",modal:null} },
    { narration:"The colleague clicks the link, sets a password, and joins your workspace instantly.", ui:{hl:null,modal:"invite-sent"} },
    { narration:"Upgrade to Pro for one hundred forty-nine euros per month. Fourteen-day free trial, no card.", ui:{hl:"billing",modal:"billing-upgrade"} },
  ]},
  { id:"cta", title:"Jetzt starten", subtitle:"14 Tage kostenlos", law:"Free Trial", frames:[
    { narration:"LkSGCompass covers the full LkSG from paragraph four to paragraph ten. Start your free trial today.", ui:{view:"cta"} },
  ]},
];

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body{font-family:'DM Sans',system-ui,sans-serif;background:#060d05;color:#fff;height:100%;overflow:hidden}
  .shell{display:grid;grid-template-rows:48px 2px 36px 1fr 60px;height:100vh;overflow:hidden}
  .tb{display:flex;align-items:center;justify-content:space-between;padding:0 20px;background:rgba(6,13,5,.97);border-bottom:1px solid rgba(255,255,255,.07)}
  .logo{font-size:15px;font-weight:800;color:#fff;text-decoration:none}.logo em{font-style:normal;color:rgba(255,255,255,.3)}
  .tb-r{display:flex;align-items:center;gap:10px}
  .tb-badge{font-size:10px;font-weight:700;color:#4ade80;background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.2);padding:3px 9px;border-radius:99px}
  .tb-cta{background:#1B3D2B;color:#fff;border:none;border-radius:7px;padding:6px 15px;font-size:12.5px;font-weight:700;cursor:pointer;text-decoration:none;transition:all .2s}
  .tb-cta:hover{background:#2d5c3f}
  .prog{background:rgba(255,255,255,.05)}
  .prog-fill{height:2px;background:linear-gradient(90deg,#1B3D2B,#4ade80);transition:width .15s linear}
  .stabs{display:flex;overflow-x:auto;padding:0 12px;background:rgba(255,255,255,.02);border-bottom:1px solid rgba(255,255,255,.05);scrollbar-width:none;align-items:center}
  .stabs::-webkit-scrollbar{display:none}
  .stab{display:flex;align-items:center;gap:6px;padding:0 12px;height:36px;cursor:pointer;border-bottom:2px solid transparent;color:rgba(255,255,255,.35);font-size:11px;font-weight:700;white-space:nowrap;transition:all .2s;flex-shrink:0}
  .stab:hover{color:rgba(255,255,255,.7)}
  .stab.on{color:#4ade80;border-bottom-color:#4ade80}
  .stab-n{width:17px;height:17px;border-radius:5px;background:rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800}
  .stab.on .stab-n{background:#1B3D2B;color:#4ade80}
  .stab.done .stab-n{background:rgba(74,222,128,.15);color:#4ade80}
  .body{display:grid;grid-template-columns:1fr 290px;overflow:hidden;height:100%}
  .vp{position:relative;overflow:hidden;background:#0d170b}
  .vp-frame{position:absolute;inset:0;opacity:0;transform:translateY(5px) scale(.995);transition:opacity .4s,transform .4s;pointer-events:none}
  .vp-frame.vis{opacity:1;transform:none;pointer-events:auto}
  .rp{display:flex;flex-direction:column;border-left:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.015);overflow:hidden}
  .rp-info{padding:15px 17px 13px;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0}
  .rp-law{font-size:9px;font-weight:800;color:#4ade80;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:5px}
  .rp-title{font-size:15px;font-weight:800;color:#fff;letter-spacing:-.3px;margin-bottom:2px}
  .rp-sub{font-size:11px;color:rgba(255,255,255,.4)}
  .rp-narr{flex:1;padding:13px 16px;overflow-y:auto;display:flex;flex-direction:column;gap:9px}
  .nb{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-left:2.5px solid rgba(255,255,255,.08);border-radius:9px;padding:11px;font-size:12px;color:rgba(255,255,255,.5);line-height:1.65;transition:all .3s;cursor:pointer}
  .nb:hover{background:rgba(255,255,255,.06)}
  .nb.on{background:rgba(27,61,43,.45);border-left-color:#4ade80;color:#fff}
  .nb-step{font-size:9.5px;font-weight:800;color:rgba(255,255,255,.22);margin-bottom:4px;letter-spacing:.5px;text-transform:uppercase}
  .nb.on .nb-step{color:#4ade80}
  .ctrl{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:#07100600;border-top:1px solid rgba(255,255,255,.06);flex-shrink:0;gap:8px;background:#080f07}
  .cb{display:flex;align-items:center;gap:4px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.6);font-size:11.5px;font-weight:700;padding:7px 12px;border-radius:7px;cursor:pointer;transition:all .15s;white-space:nowrap}
  .cb:hover{background:rgba(255,255,255,.1);color:#fff}
  .cb:disabled{opacity:.2;cursor:not-allowed}
  .cb.p{background:#1B3D2B;border-color:#1B3D2B;color:#fff}
  .cb.p:hover{background:#2d5c3f}
  .cc{display:flex;flex-direction:column;align-items:center;gap:7px}
  .fdots{display:flex;gap:3px}
  .fd{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.15);cursor:pointer;transition:all .25s}
  .fd.on{background:#4ade80;width:13px;border-radius:3px}
  .fd.done{background:rgba(74,222,128,.4)}
  .play-btn{display:flex;align-items:center;gap:5px;background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.2);color:#4ade80;font-size:10.5px;font-weight:700;padding:3px 11px;border-radius:99px;cursor:pointer;transition:all .15s}
  .play-btn:hover{background:rgba(74,222,128,.2)}
  .timer-bar{width:160px;height:2px;background:rgba(255,255,255,.07);border-radius:1px;overflow:hidden}
  .timer-fill{height:100%;background:rgba(74,222,128,.6);transition:width .1s linear}
  /* BROWSER */
  .bbar{display:flex;align-items:center;gap:7px;padding:7px 12px;background:#192017;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0}
  .bdots{display:flex;gap:4px}
  .bdot{width:8px;height:8px;border-radius:50%}
  .burl{flex:1;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:4px;padding:3px 9px;font-size:10px;color:rgba(255,255,255,.3);font-family:monospace;display:flex;align-items:center;gap:4px}
  .lock{color:#4ade80;font-size:9px}
  /* APP */
  .app{display:grid;grid-template-columns:175px 1fr;height:100%;background:#f0f2f0}
  .nav{background:#1B3D2B;display:flex;flex-direction:column}
  .nlogo{padding:11px 11px 9px;border-bottom:1px solid rgba(255,255,255,.09);font-size:12.5px;font-weight:800;color:#fff}
  .nlogo em{font-style:normal;color:rgba(255,255,255,.3)}
  .nlinks{padding:8px 5px;display:flex;flex-direction:column;gap:1px}
  .ni{display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:6px;font-size:11px;font-weight:600;color:rgba(255,255,255,.45)}
  .ni.on{background:rgba(255,255,255,.11);color:#fff}
  .ni-d{width:4px;height:4px;border-radius:50%;background:currentColor;opacity:.4;flex-shrink:0}
  .amain{display:flex;flex-direction:column;overflow:hidden}
  .ah{padding:10px 16px;border-bottom:1.5px solid #e4e6e4;background:#fff;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
  .ah-h{font-size:13.5px;font-weight:800;color:#0b0f0c;letter-spacing:-.3px}
  .ac{flex:1;overflow-y:auto;padding:12px 16px;display:flex;flex-direction:column;gap:10px}
  .c{background:#fff;border:1.5px solid #e4e6e4;border-radius:12px;padding:12px}
  .c-h{font-size:11px;font-weight:800;color:#0b0f0c;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between}
  .ctg{font-size:9px;font-weight:700;color:#1B3D2B;background:#f0f5f1;border:1px solid #d1e7d9;padding:1px 6px;border-radius:4px}
  .sg{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}
  .sc{background:#fff;border:1.5px solid #e4e6e4;border-radius:9px;padding:9px}
  .sc-n{font-size:19px;font-weight:800;color:#0b0f0c;letter-spacing:-.5px}
  .sc-l{font-size:9px;color:#9CA3AF;font-weight:700;text-transform:uppercase;letter-spacing:.4px}
  .grn{color:#16A34A}.red{color:#DC2626}.amb{color:#D97706}
  .br{display:flex;align-items:center;gap:7px;padding:5px 0;border-bottom:1.5px solid #F3F4F6}
  .br:last-child{border:none}
  .bm{flex:1;min-width:0}
  .bn{font-size:11.5px;font-weight:700;color:#0b0f0c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .bs{font-size:10px;color:#9CA3AF;margin-top:1px}
  .bh{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;font-size:9.5px;font-weight:700;padding:1px 6px;border-radius:4px;white-space:nowrap}
  .bm2{background:#FFFBEB;color:#D97706;border:1px solid #FDE68A;font-size:9.5px;font-weight:700;padding:1px 6px;border-radius:4px;white-space:nowrap}
  .bl{background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0;font-size:9.5px;font-weight:700;padding:1px 6px;border-radius:4px;white-space:nowrap}
  .bar{height:4px;background:#F3F4F6;border-radius:3px;overflow:hidden}
  .bar-f{height:100%;border-radius:3px}
  .gf{background:#22c55e}.af{background:#f59e0b}.rf{background:#ef4444}
  .bg{background:#1B3D2B;color:#fff;border:none;border-radius:7px;padding:5px 10px;font-size:10.5px;font-weight:700;cursor:pointer;white-space:nowrap;transition:all .2s}
  .bg:hover,.bg.hl{background:#2d5c3f;box-shadow:0 0 0 3px rgba(74,222,128,.3)}
  .bs2{background:#F3F4F6;color:#374151;border:none;border-radius:7px;padding:5px 10px;font-size:10.5px;font-weight:700;cursor:pointer;white-space:nowrap}
  .bs2.hl{background:#E5E7EB;box-shadow:0 0 0 3px rgba(59,130,246,.2)}
  .cl{display:flex;flex-direction:column;gap:5px}
  .ci{display:flex;align-items:center;gap:6px;padding:5px 7px;border-radius:6px;background:#F9FAFB;font-size:11px;font-weight:600;color:#374151}
  .ci.ok{background:#F0FDF4;color:#16A34A}.ci.warn{background:#FFFBEB;color:#D97706}.ci.err{background:#FEF2F2;color:#DC2626}
  .ci-d{width:13px;height:13px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;flex-shrink:0}
  .ok .ci-d{background:#16A34A;color:#fff}.warn .ci-d{background:#D97706;color:#fff}.err .ci-d{background:#DC2626;color:#fff}
  .fc{background:#fff;border:1.5px solid #e4e6e4;border-radius:12px;padding:20px;max-width:340px;margin:12px auto}
  .fh{font-size:16px;font-weight:800;color:#0b0f0c;margin-bottom:3px;letter-spacing:-.3px}
  .fs2{font-size:11.5px;color:#6b7280;margin-bottom:12px;line-height:1.5}
  .ff{margin-bottom:9px}
  .fl{font-size:9px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.7px;display:block;margin-bottom:4px}
  .fi{width:100%;padding:8px 10px;border:1.5px solid #e4e6e4;border-radius:7px;font-size:12.5px;color:#0b0f0c;background:#f9fafb;transition:border-color .2s}
  .fi.on{border-color:#1B3D2B;background:#fff}
  .fsb{width:100%;padding:9px;background:#1B3D2B;color:#fff;border:none;border-radius:7px;font-size:12.5px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:all .2s}
  .fsb.pulse{background:#2d5c3f;transform:scale(.97)}
  .otp-r{display:flex;gap:5px;justify-content:center;margin:3px 0 12px}
  .otp-b{width:38px;height:48px;border:1.5px solid #e4e6e4;border-radius:7px;font-size:20px;font-weight:800;font-family:monospace;background:#f9fafb;display:flex;align-items:center;justify-content:center;color:#9ca3af;transition:all .2s}
  .otp-b.on{border-color:#1B3D2B;background:#f0f5f1;color:#1B3D2B}
  .overlay{position:absolute;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(2px);z-index:30;display:flex;align-items:center;justify-content:center;animation:fIn .2s ease}
  @keyframes fIn{from{opacity:0}to{opacity:1}}
  .modal{background:#fff;border-radius:13px;padding:18px;width:300px;box-shadow:0 20px 60px rgba(0,0,0,.3);animation:sUp .25s cubic-bezier(.4,0,.2,1)}
  @keyframes sUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  .mh{font-size:13.5px;font-weight:800;color:#0b0f0c;margin-bottom:3px;letter-spacing:-.2px}
  .ms{font-size:11px;color:#6b7280;margin-bottom:12px;line-height:1.5}
  .mf{margin-bottom:8px}
  .ml{font-size:9px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.6px;display:block;margin-bottom:3px}
  .mi{width:100%;padding:7px 10px;border:1.5px solid #e4e6e4;border-radius:7px;font-size:12.5px;color:#0b0f0c;background:#f9fafb}
  .mi.on{border-color:#1B3D2B;background:#fff}
  .msub{width:100%;padding:9px;background:#1B3D2B;color:#fff;border:none;border-radius:7px;font-size:12.5px;font-weight:800;cursor:pointer;margin-top:3px;display:flex;align-items:center;justify-content:center;gap:5px}
  .mrow{display:flex;gap:6px}
  .rrow{display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid #F3F4F6;font-size:11px}
  .rrow:last-child{border:none}
  .rscore{font-size:17px;font-weight:800;color:#DC2626}
  .gen-a{display:flex;align-items:center;gap:7px;padding:10px 12px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;margin-bottom:10px}
  .gd{width:6px;height:6px;border-radius:50%;background:#16A34A;animation:bd 1s infinite}
  .gd:nth-child(2){animation-delay:.2s}.gd:nth-child(3){animation-delay:.4s}
  @keyframes bd{0%,100%{opacity:.25}50%{opacity:1}}
  .sbadge{display:inline-flex;align-items:center;gap:5px;background:#F0FDF4;border:1px solid #BBF7D0;color:#16A34A;font-size:11.5px;font-weight:700;padding:5px 10px;border-radius:7px;margin-bottom:9px}
  .hl-row{background:rgba(74,222,128,.06);border-radius:8px}
  .hl-btn{animation:bG 1.5s ease-out}
  @keyframes bG{0%{box-shadow:0 0 0 0 rgba(74,222,128,.7)}70%{box-shadow:0 0 0 8px rgba(74,222,128,0)}100%{box-shadow:none}}
  .ring{position:relative;width:72px;height:72px;margin:0 auto 6px}
  .ring svg{position:absolute;inset:0;transform:rotate(-90deg)}
  .ring-n{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
  /* CTA SCREEN */
  .cta-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:linear-gradient(135deg,#0d1f14 0%,#0b1209 100%);padding:48px 32px;text-align:center}
  .cta-logo{font-size:28px;font-weight:800;color:#fff;margin-bottom:6px;letter-spacing:-.5px}
  .cta-logo em{font-style:normal;color:rgba(255,255,255,.3)}
  .cta-h{font-size:clamp(28px,3.5vw,44px);font-weight:800;color:#fff;line-height:1.15;letter-spacing:-.8px;margin-bottom:16px;max-width:580px}
  .cta-h em{font-style:normal;color:#4ade80}
  .cta-sub{font-size:15px;color:rgba(255,255,255,.55);line-height:1.7;margin-bottom:36px;max-width:440px}
  .cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:28px}
  .cta-btn-main{background:#4ade80;color:#0b1209;border:none;border-radius:10px;padding:14px 32px;font-size:15px;font-weight:800;cursor:pointer;text-decoration:none;transition:all .2s;display:inline-flex;align-items:center;gap:8px}
  .cta-btn-main:hover{background:#22c55e;transform:translateY(-2px)}
  .cta-btn-ghost{border:1.5px solid rgba(255,255,255,.2);color:rgba(255,255,255,.8);background:transparent;border-radius:10px;padding:13px 24px;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;transition:all .2s}
  .cta-btn-ghost:hover{border-color:rgba(255,255,255,.5);color:#fff}
  .cta-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:540px;width:100%;margin-bottom:28px}
  .cta-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:16px;text-align:left}
  .cta-card-t{font-size:12px;font-weight:800;color:#fff;margin-bottom:4px}
  .cta-card-s{font-size:11px;color:rgba(255,255,255,.4);line-height:1.5}
  .cta-note{font-size:11.5px;color:rgba(255,255,255,.3);font-family:monospace;letter-spacing:.3px}
  @media(max-width:860px){.body{grid-template-columns:1fr}.rp{display:none}}
`;

function Nav({ active }: { active: string }) {
  return (
    <div className="nav">
      <div className="nlogo">LkSG<em>Compass</em></div>
      <div className="nlinks">
        {[["dashboard","Dashboard"],["suppliers","Lieferanten"],["complaints","Beschwerden"],["actions","Aktionspläne"],["legal","Rechtsassistent"],["kpi","Wirksamkeit"],["reports","BAFA-Bericht"],["settings","Einstellungen"]].map(([id,label])=>(
          <div key={id} className={`ni${active===id?" on":""}`}><div className="ni-d"/>{label}</div>
        ))}
      </div>
    </div>
  );
}

function BW({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div className="bbar">
        <div className="bdots"><div className="bdot" style={{background:"#ef4444"}}/><div className="bdot" style={{background:"#f59e0b"}}/><div className="bdot" style={{background:"#22c55e"}}/></div>
        <div className="burl"><span className="lock">🔒</span>{url}</div>
      </div>
      <div style={{flex:1,overflow:"hidden",position:"relative"}}>{children}</div>
    </div>
  );
}

// ── ALL FRAME RENDERERS ───────────────────────────────────────────────────────
function RenderFrame({ sceneId, ui }: { sceneId: string; ui: UiState }) {
  const { step, hl, modal, view, highlight } = ui;

  if (sceneId === "register") {
    if (step === "otp") return (
      <BW url="lksgcompass.de/register">
        <div style={{background:"#f0f2f0",overflow:"auto",height:"100%"}}>
          <div className="fc">
            <div className="fh">E-Mail bestätigen</div>
            <div className="fs2">6-stelliger Code an <strong>max@muster-auto.de</strong></div>
            <div style={{background:"#f0f5f1",border:"1px solid #d1e7d9",borderRadius:8,padding:"7px 11px",fontSize:12,color:"#1B3D2B",marginBottom:12}}>✓ Code gesendet — gültig 15 Minuten</div>
            <div className="otp-r">{["4","7","3","","",""].map((d,i)=><div key={i} className={`otp-b${d?" on":""}`}>{d}</div>)}</div>
            <div className="fsb" style={{opacity:.5}}>Code bestätigen</div>
          </div>
        </div>
      </BW>
    );
    const c = step, e = ["full","submit"].includes(c), s = c !== "empty";
    return (
      <BW url="lksgcompass.de/register">
        <div style={{background:"#f0f2f0",overflow:"auto",height:"100%"}}>
          <div className="fc">
            <div className="fh">Konto erstellen</div>
            <div className="fs2">LkSG-Compliance-Workspace in 60 Sekunden. Kostenlose Testversion.</div>
            <div className="ff"><label className="fl">Firmenname</label><div className={`fi${s?" on":""}`} style={{color:s?"#0b0f0c":"#9ca3af"}}>{s?"Muster Automotive GmbH":""}</div></div>
            <div className="ff"><label className="fl">E-Mail</label><div className={`fi${e?" on":""}`} style={{color:e?"#0b0f0c":"#9ca3af"}}>{e?"max@muster-auto.de":""}</div></div>
            <div className="ff"><label className="fl">Passwort</label><div className={`fi${e?" on":""}`} style={{color:"#9ca3af"}}>{e?"••••••••••":""}</div></div>
            <div className={`fsb${c==="submit"?" pulse":""}`} style={{opacity:s?1:.4}}>{c==="submit"?"Workspace wird erstellt…":"Konto erstellen →"}</div>
            <div style={{textAlign:"center",fontSize:10.5,color:"#9ca3af",marginTop:9}}>✓ 14 Tage kostenlos · Keine Kreditkarte</div>
          </div>
        </div>
      </BW>
    );
  }

  if (sceneId === "dashboard") return (
    <BW url="lksgcompass.de/app/dashboard">
      <div className="app"><Nav active="dashboard"/>
        <div className="amain">
          <div className="ah"><div className="ah-h">Dashboard</div>
            <div style={{display:"flex",gap:6}}>
              <button className="bs2" style={{fontSize:10}}>↻</button>
              <button className={`bg${hl==="addsup"?" hl-btn":""}`} style={{fontSize:10}}>+ Lieferant</button>
            </div>
          </div>
          <div className="ac">
            <div className={`sg${hl==="score"?" hl-row":""}`} style={{padding:hl==="score"?4:0,borderRadius:8,transition:"all .3s"}}>
              {[["72","Score","grn"],["5","Lieferanten",""],["2","Offene CAPs","red"],["1","Beschwerden","amb"]].map(([n,l,c])=>(
                <div key={l} className="sc"><div className={`sc-n ${c}`}>{n}</div><div className="sc-l">{l}</div></div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
              <div className="c"><div className="c-h">Risikoverteilung <span className="ctg">§5</span></div>
                {[["Hoch","1","h"],["Mittel","2","m"],["Niedrig","2","l"]].map(([l,n,t])=>(
                  <div key={String(l)} className="br"><div className="bm"><div className="bn">{String(l)}</div><div className="bs">{n} Lieferant{n==="1"?"":"en"}</div></div><span className={`b${t}`}>{t==="h"?"20%":t==="m"?"40%":"40%"}</span></div>
                ))}
              </div>
              <div className={`c${hl==="bafa"?" hl-row":""}`} style={{padding:hl==="bafa"?"10px 12px":12,transition:"all .3s"}}>
                <div className="c-h">BAFA-Bereitschaft</div>
                <div className="cl">
                  {[["ok","§4 HR-Beauftragter ✓"],["ok","§5 Risikoanalyse ✓"],["warn","§6 CAPs: 2 offen"],["err","§8 Beauftragter fehlt"]].map(([t,l])=>(
                    <div key={String(l)} className={`ci ${t}`}><div className="ci-d">{t==="ok"?"✓":t==="warn"?"!":"✕"}</div>{String(l)}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {modal==="new-supplier" && <div className="overlay"><div className="modal">
        <div className="mh">Neuen Lieferanten hinzufügen</div><div className="ms">Die Risk Engine bewertet automatisch aus 190 Länderprofilen.</div>
        <div className="mf"><label className="ml">Lieferantenname</label><div className="mi on">Ankara Tekstil A.Ş.</div></div>
        <div className="mrow"><div style={{flex:1}}><label className="ml">Land</label><div className="mi on">Türkei</div></div><div style={{flex:1}}><label className="ml">Branche</label><div className="mi on">Textil</div></div></div>
        <div className="msub">Risiko berechnen & speichern →</div>
      </div></div>}
      {modal==="supplier-saved" && <div className="overlay"><div className="modal">
        <div className="sbadge">✓ Lieferant gespeichert</div>
        <div className="mh">Ankara Tekstil A.Ş.</div><div className="ms">Risikoscore automatisch berechnet.</div>
        {[["Länderrisiko (Türkei)","+28"],["Branche (Textil)","+15"],["Kein Audit","+12"],["Kein CoC","+8"]].map(([l,v])=>(
          <div key={l} className="rrow"><span style={{color:"#374151"}}>{l}</span><span style={{color:"#DC2626",fontWeight:700}}>{v} Pkt</span></div>
        ))}
        <div style={{marginTop:8,padding:"7px 10px",background:"#FEF2F2",borderRadius:7,border:"1px solid #FECACA",display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:12,fontWeight:700}}>Score</span><span className="rscore">52 — Mittel</span>
        </div>
      </div></div>}
    </BW>
  );

  if (sceneId === "suppliers") return (
    <BW url="lksgcompass.de/app/suppliers">
      <div className="app"><Nav active="suppliers"/>
        <div className="amain">
          <div className="ah"><div className="ah-h">Lieferanten <span style={{fontSize:10.5,color:"#9CA3AF"}}>5 gesamt</span></div>
            <div style={{display:"flex",gap:6}}>
              <button className={`bs2${hl==="excel"?" hl-btn":""}`} style={{fontSize:10}}>📤 Excel-Import</button>
              <button className="bg" style={{fontSize:10}}>+ Neu</button>
            </div>
          </div>
          <div className="ac"><div className="c">
            {[{n:"Shenzhen Parts Co.",c:"🇨🇳 China",i:"Elektronik",s:78,r:"h"},{n:"Ankara Tekstil",c:"🇹🇷 Türkei",i:"Textil",s:52,r:"m"},{n:"Hanoi Electro",c:"🇻🇳 Vietnam",i:"Elektronik",s:61,r:"m"},{n:"Schmidt Logistik",c:"🇩🇪 Deutschland",i:"Logistik",s:18,r:"l"},{n:"Warsaw Auto Parts",c:"🇵🇱 Polen",i:"Automotive",s:24,r:"l"}].map(s=>(
              <div key={s.n} className={`br${hl==="shenzhen"&&s.r==="h"?" hl-row":""}`}>
                <div className="bm"><div className="bn">{s.n}</div><div className="bs">{s.c} · {s.i}</div></div>
                <div className="bar" style={{width:55,marginRight:7}}><div className={`bar-f ${s.r==="h"?"rf":s.r==="m"?"af":"gf"}`} style={{width:`${s.s}%`}}/></div>
                <span className={`b${s.r}`}>{s.r==="h"?"Hoch":s.r==="m"?"Mittel":"Niedrig"}</span>
              </div>
            ))}
          </div></div>
        </div>
      </div>
      {modal==="risk-detail"&&<div className="overlay"><div className="modal">
        <div className="mh">🇨🇳 Shenzhen Parts Co.</div><div className="ms">§5 LkSG — Vollständige Risikobewertung</div>
        {[["Länderrisiko (China)","🔴 +35"],["Branche (Elektronik)","🟠 +18"],["Kein Verhaltenskodex","🔴 +12"],["Kein Audit","🔴 +13"]].map(([l,v])=>(
          <div key={l} className="rrow"><span style={{color:"#374151",fontSize:11.5}}>{l}</span><span style={{color:"#DC2626",fontWeight:700,fontSize:11.5}}>{v}</span></div>
        ))}
        <div style={{marginTop:8,padding:"7px 10px",background:"#FEF2F2",borderRadius:7,border:"1px solid #FECACA",display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:12,fontWeight:700}}>Score</span><span className="rscore">78 — Hoch</span>
        </div>
        <div className="msub" style={{marginTop:8}}>Korrekturmaßnahmen erstellen →</div>
      </div></div>}
      {modal==="excel-import"&&<div className="overlay"><div className="modal">
        <div className="mh">📤 Excel-Import</div><div className="ms">Spaltenerkennung automatisch — auch türkische Spaltenbezeichnungen.</div>
        <div style={{border:"2px dashed #d1e7d9",borderRadius:8,padding:"18px",textAlign:"center",background:"#f0f5f1",marginBottom:10}}>
          <div style={{fontSize:22,marginBottom:4}}>📊</div>
          <div style={{fontSize:12,fontWeight:700,color:"#1B3D2B"}}>lieferanten_2024.xlsx</div>
          <div style={{fontSize:10.5,color:"#6b7280",marginTop:2}}>48 Zeilen · 8 Spalten erkannt</div>
        </div>
        <div className="msub">Spalten erkennen & Vorschau →</div>
      </div></div>}
      {modal==="excel-preview"&&<div className="overlay"><div className="modal">
        <div className="mh">Spaltenzuordnung</div><div className="ms">Automatisch erkannt. Vor Import prüfen.</div>
        {[["BİNA / APT İSMİ","→ Firmenname","✓"],["ÜLKE","→ Land","✓"],["YÖN TELEFONU","→ Telefon","✓"],["KİMLİK NO","→ ID","✓"]].map(([a,b,cc])=>(
          <div key={a} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #F3F4F6",fontSize:11}}>
            <span style={{fontFamily:"monospace",color:"#6b7280"}}>{a}</span>
            <span style={{color:"#1B3D2B",fontWeight:700}}>{b}</span>
            <span style={{color:"#16A34A",fontWeight:800}}>{cc}</span>
          </div>
        ))}
        <div className="msub" style={{marginTop:10}}>48 Lieferanten importieren →</div>
      </div></div>}
    </BW>
  );

  if (sceneId === "complaints") return (
    <BW url="lksgcompass.de/app/complaints">
      <div className="app"><Nav active="complaints"/>
        <div className="amain">
          <div className="ah"><div className="ah-h">Beschwerden <span style={{fontSize:10.5,color:"#9CA3AF"}}>3 gesamt</span></div>
            <button className={`bs2${hl==="portal"?" hl-btn":""}`} style={{fontSize:10}}>🔗 Portal-Link kopieren</button>
          </div>
          <div className="ac">
            <div className={`c${hl==="critical"?" hl-row":""}`} style={{borderColor:"#FECACA",background:"#FFF5F5",cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <div><div style={{fontSize:9,fontWeight:800,color:"#DC2626",marginBottom:2}}>⚠ NEU · KRITISCH · Frist: 7 Tage</div>
                  <div style={{fontSize:12,fontWeight:700,color:"#0b0f0c"}}>Kinderarbeit bei Tier-2-Lieferanten</div>
                  <div style={{fontSize:10,color:"#6b7280"}}>Shenzhen Parts · §2 Nr.1 LkSG · BSWD-3A1B</div></div>
                <span className="bh">Kritisch</span>
              </div>
              <div style={{fontSize:11,color:"#374151",lineHeight:1.6,padding:"7px 9px",background:"#fff",borderRadius:6,border:"1px solid #FECACA",marginBottom:8}}>
                „Minderjährige unter 15 Jahren auf dem Produktionsflur beobachtet..."
              </div>
              <div style={{display:"flex",gap:5}}>
                <button className="bg" style={{fontSize:10}}>CAP erstellen</button>
                <button className="bs2" style={{fontSize:10}}>Bestätigen</button>
                <button className="bs2" style={{fontSize:10}}>Status ändern</button>
              </div>
            </div>
            {[{ref:"BSWD-2C4D",c:"Umweltverletzung",r:"m",st:"In Bearbeitung"},{ref:"BSWD-5E6F",c:"Diskriminierung",r:"l",st:"Gelöst ✓"}].map(x=>(
              <div key={x.ref} className="c" style={{padding:"9px 12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:9.5,fontFamily:"monospace",color:"#9CA3AF"}}>{x.ref}</div><div style={{fontSize:12,fontWeight:700,color:"#0b0f0c"}}>{x.c}</div></div>
                  <span className={`b${x.r}`}>{x.st}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {modal==="complaint-detail"&&<div className="overlay"><div className="modal">
        <span className="bh" style={{display:"inline-flex",marginBottom:8}}>§2 Nr.1 — Kinderarbeit</span>
        <div className="mh">Fall BSWD-3A1B</div><div className="ms">Vollständige Details, Fristen und Audit-Trail.</div>
        <div style={{background:"#FFF5F5",border:"1px solid #FECACA",borderRadius:7,padding:"8px 10px",marginBottom:10,fontSize:11,color:"#374151",lineHeight:1.6}}>
          „Minderjährige unter 15 Jahren bei unangemeldetem Besuch am 03.03.2025 auf Produktionsebene 3 beobachtet."
        </div>
        {[["Eingegangen","04.03.2025 · 09:14"],["Bestätigung bis","11.03.2025 (7 Tage)"],["Untersuchung bis","04.06.2025 (3 Monate)"]].map(([l,v])=>(
          <div key={l} className="rrow"><span style={{color:"#6b7280"}}>{l}</span><span style={{fontWeight:700}}>{v}</span></div>
        ))}
        <div className="msub" style={{marginTop:10}}>Korrekturmaßnahmen-Plan erstellen →</div>
      </div></div>}
      {modal==="cap-from-complaint"&&<div className="overlay"><div className="modal">
        <div className="mh">Neuer Aktionsplan</div><div className="ms">Vorausgefüllt aus Beschwerde BSWD-3A1B</div>
        <div className="mf"><label className="ml">Titel</label><div className="mi on">Kinderarbeit untersuchen — Shenzhen Parts</div></div>
        <div className="mrow">
          <div style={{flex:1}}><label className="ml">Priorität</label><div className="mi on">Kritisch</div></div>
          <div style={{flex:1}}><label className="ml">Fällig</label><div className="mi on">04.06.2025</div></div>
        </div>
        <div className="mf"><label className="ml">LkSG-Referenz</label><div className="mi on">§7 Abs.1 — Abhilfemaßnahme</div></div>
        <div className="msub">Speichern & Lieferant benachrichtigen →</div>
      </div></div>}
    </BW>
  );

  if (sceneId === "actions") return (
    <BW url="lksgcompass.de/app/actions">
      <div className="app"><Nav active="actions"/>
        <div className="amain">
          <div className="ah"><div className="ah-h">Aktionspläne <span style={{fontSize:10.5,color:"#DC2626"}}>2 überfällig</span></div>
            <button className="bg" style={{fontSize:10}}>+ Neuer CAP</button>
          </div>
          <div className="ac">
            <div className={`c${hl==="overdue"?" hl-row":""}`} style={{borderColor:"#FECACA",background:"#FFF9F9",cursor:"pointer"}}>
              <div style={{fontSize:9,color:"#DC2626",fontWeight:800,marginBottom:4}}>⏰ ÜBERFÄLLIG — 3 Tage · §7 LkSG</div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#0b0f0c",marginBottom:2}}>Kinderarbeit untersuchen</div>
                  <div style={{fontSize:10,color:"#6b7280"}}>Shenzhen Parts · M. Weber</div>
                  <div className="bar" style={{width:100,marginTop:5}}><div className="bar-f af" style={{width:"35%"}}/></div>
                  <div style={{fontSize:9.5,color:"#9CA3AF",marginTop:2}}>35% abgeschlossen</div>
                </div>
                <span className="bh" style={{marginLeft:6}}>Kritisch</span>
              </div>
            </div>
            {[{t:"Verhaltenskodex unterzeichnen",s:"Ankara Tekstil",d:"15.04",p:60,r:"m"},{t:"Auditbericht anfordern",s:"Hanoi Electro",d:"30.04",p:0,r:"l"}].map(a=>(
              <div key={a.t} className="c" style={{padding:"9px 12px",cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#0b0f0c"}}>{a.t}</div>
                    <div style={{fontSize:10,color:"#6b7280",marginTop:1}}>{a.s} · Fällig: {a.d}</div>
                    <div className="bar" style={{width:70,marginTop:5}}><div className={`bar-f ${a.p>0?"af":"rf"}`} style={{width:`${Math.max(a.p,4)}%`}}/></div>
                  </div>
                  <span className={`b${a.r}`} style={{marginLeft:6}}>{a.r==="m"?"Hoch":"Mittel"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {modal==="cap-detail"&&<div className="overlay"><div className="modal">
        <span className="bh" style={{display:"inline-flex",marginBottom:8}}>⏰ 3 Tage überfällig</span>
        <div className="mh">Kinderarbeit untersuchen</div><div className="ms">Shenzhen Parts · §7 LkSG</div>
        <div className="mf"><label className="ml">Fortschritt</label>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div className="bar" style={{flex:1}}><div className="bar-f af" style={{width:"35%"}}/></div>
            <span style={{fontSize:11.5,fontWeight:700,color:"#374151"}}>35%</span>
          </div>
        </div>
        <div className="mf"><label className="ml">Status</label><div className="mi on">In Bearbeitung</div></div>
        <div className="mf"><label className="ml">Nachweis-Notizen</label><div className="mi on" style={{minHeight:40,fontSize:11}}>Fabrikbesuch geplant 15.03.2025. Rechtsabteilung informiert...</div></div>
        <div style={{display:"flex",gap:6}}><div className="msub" style={{flex:1}}>Speichern</div><button className="bs2" style={{padding:"9px 12px",borderRadius:7,fontWeight:700,fontSize:12}}>📎 Nachweis</button></div>
      </div></div>}
      {modal==="cap-evidence"&&<div className="overlay"><div className="modal">
        <div className="mh">📎 Nachweis anhängen</div><div className="ms">§10 Abs.1 — 7 Jahre Aufbewahrung automatisch.</div>
        <div style={{border:"2px dashed #d1e7d9",borderRadius:8,padding:"16px",textAlign:"center",background:"#f0f5f1",marginBottom:10}}>
          <div style={{fontSize:20,marginBottom:4}}>📄</div>
          <div style={{fontSize:11.5,fontWeight:700,color:"#1B3D2B"}}>fabrikbesuch_15032025.pdf</div>
          <div style={{fontSize:10,color:"#6b7280",marginTop:2}}>2,4 MB · Gerade hochgeladen</div>
        </div>
        <div className="gen-a" style={{marginBottom:10}}><div className="gd"/><div className="gd"/><div className="gd"/><span style={{fontSize:11,color:"#16A34A",fontWeight:700}}>Gespeichert · Aufbewahrung bis 2032</span></div>
        <div className="msub">Bestätigen & CAP zuordnen →</div>
      </div></div>}
    </BW>
  );

  if (sceneId === "legal") return (
    <BW url="lksgcompass.de/app/legal">
      <div className="app"><Nav active="legal"/>
        <div className="amain">
          <div className="ah">
            <div className="ah-h">Rechtsassistent <span style={{fontSize:9.5,color:"#7C3AED",fontWeight:700,background:"#F5F3FF",border:"1px solid #DDD6FE",borderRadius:4,padding:"1px 6px"}}>NEU</span></div>
          </div>
          <div className="ac">
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:4}}>
              {[["templates","📄 Vorlagen"],["ask","❓ Rechtsfrage"],["review","🔍 Vertragscheck"],["defense","🛡 Verteidigungsakte"],["updates","📰 Updates"]].map(([v,l])=>(
                <div key={v} style={{padding:"4px 9px",borderRadius:7,background:view===v?"#1B3D2B":"transparent",color:view===v?"#fff":"#6b7280",fontSize:10.5,fontWeight:700,cursor:"pointer"}}>{l}</div>
              ))}
            </div>
            {view==="templates" && <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
              {[{t:"Verhaltenskodex Lieferanten",r:"§6 Abs.2",tag:"Pflicht"},{t:"Vertragsklausel LkSG",r:"§6 Abs.3",tag:"Vertrag"},{t:"Lieferanten-SAQ",r:"§5 Abs.2",tag:"Fragebogen"},{t:"Auditprotokoll",r:"§6 Nr.2",tag:"Prozess"},{t:"Hinweisgeberschutz",r:"§8, HinSchG",tag:"Pflicht"},{t:"Risikoanalyse §5",r:"§5 Abs.1-4",tag:"Methodik"}].map(({t,r,tag})=>(
                <div key={t} className="c" style={{padding:"9px 11px"}}>
                  <div style={{fontSize:11.5,fontWeight:800,color:"#0b0f0c",marginBottom:4}}>{t}</div>
                  <div style={{display:"flex",gap:4,marginBottom:7}}>
                    <span style={{background:"#f0f5f1",border:"1px solid #d1e7d9",color:"#1B3D2B",fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:4}}>{r}</span>
                    <span style={{background:"#F3F4F6",color:"#6b7280",fontSize:9,fontWeight:600,padding:"1px 5px",borderRadius:4}}>{tag}</span>
                  </div>
                  <button className="bg" style={{width:"100%",fontSize:9.5}}>Dokument generieren →</button>
                </div>
              ))}
            </div>}
            {view==="ask" && <div className="c">
              <div style={{fontSize:12,fontWeight:700,color:"#0b0f0c",marginBottom:7}}>❓ LkSG-Rechtsfrage</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:9}}>
                {["Tier-2-Pflichten?","Aufbewahrungsfristen Beschwerden?","CoC-Verweigerung?"].map(q=>(
                  <div key={q} style={{padding:"4px 8px",background:"#F0F5F1",border:"1px solid #D1E7D9",borderRadius:6,fontSize:10.5,color:"#1B3D2B",fontWeight:600,cursor:"pointer"}}>{q}</div>
                ))}
              </div>
              <div style={{padding:"7px 10px",border:"1.5px solid #1B3D2B",borderRadius:8,fontSize:11.5,color:"#6b7280",marginBottom:7}}>Welche Pflichten gelten für indirekte Tier-2-Lieferanten?</div>
              <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:8,padding:"10px 12px",fontSize:11.5,color:"#374151",lineHeight:1.65}}>
                <strong style={{color:"#0b0f0c",display:"block",marginBottom:4}}>⚖️ Rechtliche Einschätzung</strong>
                §2 Abs.3 LkSG verpflichtet Sie zu angemessenen Maßnahmen bei indirekten Lieferanten, wenn „substantiierte Kenntnis" über mögliche Verletzungen vorliegt...
              </div>
            </div>}
            {view==="review" && <div className="c">
              <div style={{fontSize:12,fontWeight:700,color:"#0b0f0c",marginBottom:7}}>🔍 Vertragscheck</div>
              <div style={{padding:"7px 10px",border:"1.5px solid #e4e6e4",borderRadius:8,fontSize:11,color:"#9ca3af",minHeight:55,marginBottom:7}}>Vertragstext oder Klausel hier einfügen...</div>
              <div style={{background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:7,padding:"9px 11px",fontSize:11,color:"#374151",lineHeight:1.6}}>
                <strong style={{color:"#D97706",display:"block",marginBottom:3}}>⚠ 2 Lücken gefunden</strong>
                (1) Auditrecht fehlt — §6 Abs.3 erfordert explizites Recht zur Lieferantenprüfung. (2) Weitergabepflicht nicht enthalten...
              </div>
            </div>}
          </div>
        </div>
      </div>
      {modal==="coc-generating"&&<div className="overlay"><div className="modal">
        <div className="mh">🤖 Verhaltenskodex wird erstellt...</div><div className="ms">Claude schreibt einen vollständigen §6 Abs.2 konformen CoC.</div>
        <div className="gen-a" style={{marginBottom:10}}><div className="gd"/><div className="gd"/><div className="gd"/><span style={{fontSize:11,color:"#16A34A",fontWeight:700}}>§2 Menschenrechte wird verfasst...</span></div>
        {["§2 Menschenrechte & Arbeit ✓","§2 Abs.3 Umwelt ✓","§2 Nr.10 Anti-Korruption..."].map((s,i)=>(
          <div key={s} style={{display:"flex",gap:6,padding:"4px 0",fontSize:11,color:i<2?"#16A34A":"#9CA3AF"}}><span>{i<2?"✓":"○"}</span>{s}</div>
        ))}
      </div></div>}
    </BW>
  );

  if (sceneId === "reports") return (
    <BW url="lksgcompass.de/app/reports">
      <div className="app"><Nav active="reports"/>
        <div className="amain">
          <div className="ah"><div className="ah-h">BAFA-Bericht 2024</div>
            <div style={{display:"flex",gap:6}}>
              <button className={`bs2${hl==="ai-btn"?" hl-btn":""}`} style={{fontSize:10}}>🤖 KI-Entwurf</button>
              <button className={`bg${hl==="pdf"?" hl-btn":""}`} style={{fontSize:10}}>📄 PDF exportieren</button>
            </div>
          </div>
          <div className="ac">
            <div className="c" style={{borderColor:"#BBF7D0",background:"#F0FDF4"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div style={{fontSize:12.5,fontWeight:800,color:"#0b0f0c"}}>Bericht genehmigt ✓</div><span className="bl">Eingereicht 12.03</span></div>
            </div>
            <div className={`c${hl==="sections"?" hl-row":""}`} style={{padding:hl==="sections"?"10px 12px":12,transition:"all .3s"}}>
              <div className="c-h">Berichtsabschnitte</div>
              {["§5 Risikoanalyse","§6 Präventionsmaßnahmen","§7 Abhilfe","§8 Beschwerdeverfahren","§9 Wirksamkeit","§10 Dokumentation"].map((s,i)=>(
                <div key={s} className="br"><div className="bm"><div className="bn" style={{fontSize:11}}>{s}</div></div><span className={i<4?"bl":i===4?"bm2":"bh"} style={{fontSize:9}}>{i<4?"✓ Vollständig":i===4?"In Bearbeitung":"Offen"}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {modal==="ai-generating"&&<div className="overlay"><div className="modal">
        <div className="mh">🤖 KI erstellt BAFA-Bericht...</div><div className="ms">Claude liest Ihre Echtdaten und schreibt den strukturierten Bericht.</div>
        <div className="gen-a" style={{marginBottom:10}}><div className="gd"/><div className="gd"/><div className="gd"/><span style={{fontSize:11,color:"#16A34A",fontWeight:700}}>Analysiere 5 Lieferanten, 3 CAPs...</span></div>
        {["§5 Risikodaten analysiert ✓","§6 Präventionsmaßnahmen ✓","§8 Beschwerdezusammenfassung..."].map((s,i)=>(
          <div key={s} style={{display:"flex",gap:6,padding:"4px 0",fontSize:11,color:i<2?"#16A34A":"#9CA3AF"}}><span>{i<2?"✓":"○"}</span>{s}</div>
        ))}
      </div></div>}
      {modal==="ai-draft-done"&&<div className="overlay"><div className="modal">
        <div className="sbadge">✓ KI-Entwurf fertig — 847 Wörter</div>
        <div className="mh">BAFA-Berichtsentwurf</div>
        <div style={{background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:8,padding:"9px 11px",fontSize:11,color:"#374151",lineHeight:1.7,marginBottom:10}}>
          „Die Muster Automotive GmbH hat gemäß §5 LkSG eine Risikoanalyse für 5 direkte Lieferanten durchgeführt. Ein Lieferant wurde als hochriskant eingestuft und ein Abhilfemaßnahmenplan nach §7 LkSG initiiert..."
        </div>
        <div style={{display:"flex",gap:6}}><div className="msub" style={{flex:1}}>Zur Genehmigung →</div><button className="bs2" style={{padding:"9px 12px",borderRadius:7,fontWeight:700,fontSize:12}}>Bearbeiten</button></div>
      </div></div>}
      {modal==="pdf-export"&&<div className="overlay"><div className="modal">
        <div className="sbadge">✓ PDF erstellt</div>
        <div className="mh">📄 BAFA_Bericht_2024.pdf</div>
        {[["Seiten","14"],["Abschnitte","§5 – §10"],["Zeitstempel","15.03.2025 14:32"],["Genehmigt von","M. Weber"]].map(([l,v])=>(
          <div key={l} className="rrow"><span style={{color:"#6b7280"}}>{l}</span><span style={{fontWeight:700}}>{v}</span></div>
        ))}
        <div className="msub" style={{marginTop:9}}>⬇ PDF herunterladen</div>
      </div></div>}
    </BW>
  );

  if (sceneId === "defense") return (
    <BW url="lksgcompass.de/app/legal">
      <div className="app"><Nav active="legal"/>
        <div className="amain">
          <div className="ah"><div className="ah-h">BAFA-Verteidigungsakte <span style={{fontSize:9.5,color:"#7C3AED",fontWeight:700,background:"#F5F3FF",border:"1px solid #DDD6FE",borderRadius:4,padding:"1px 6px"}}>NEU</span></div></div>
          <div className="ac">
            <div className="c" style={{border:"1.5px solid #1B3D2B"}}>
              <div style={{fontSize:12.5,fontWeight:800,color:"#0b0f0c",marginBottom:4}}>🛡 BAFA-Prüfungsdokumentation</div>
              <div style={{fontSize:11,color:"#6b7280",lineHeight:1.55,marginBottom:12}}>Ein-Klick-Export aller §5–§10-Nachweise in einem strukturierten JSON-Dokument. Was Anwälte früher tagelang zusammengestellt haben.</div>
              <div className={`${highlight==="sections"?"hl-row":""}`} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12,padding:highlight==="sections"?5:0,borderRadius:8}}>
                {["§5 Risikoanalyse","§6 Prävention","§7 Abhilfemaßnahmen","§8 Beschwerden","§9 KPI-Nachweise","§10 Audit-Trail"].map(s=>(
                  <div key={s} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 9px",background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:7,fontSize:11,fontWeight:600,color:"#16A34A"}}>✓ {s}</div>
                ))}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <select style={{padding:"7px 11px",border:"1.5px solid #e4e6e4",borderRadius:7,fontSize:13,background:"#fff",fontWeight:700}}>
                  <option>2024</option><option>2023</option>
                </select>
                <button className={`bg${highlight==="download"?" hl-btn":""}`} style={{padding:"8px 18px",fontSize:12,fontWeight:800}}>⬇ Akte herunterladen</button>
              </div>
            </div>
            <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:9,padding:"10px 13px",fontSize:11.5,color:"#2563EB",lineHeight:1.6}}>
              <strong>Was ist enthalten?</strong> Alle §5–§10-Daten mit Zeitstempeln, 200 Audit-Trail-Einträge, vollständige Lieferantenprofile und Wirksamkeitskennzahlen.
            </div>
          </div>
        </div>
      </div>
    </BW>
  );

  if (sceneId === "team") return (
    <BW url="lksgcompass.de/app/settings">
      <div className="app"><Nav active="settings"/>
        <div className="amain">
          <div className="ah"><div className="ah-h">Einstellungen</div></div>
          <div className="ac">
            <div style={{display:"flex",gap:5,marginBottom:2}}>
              {["Unternehmen","Team","Abonnement","Rechtliches"].map((t,i)=>(
                <div key={t} style={{padding:"5px 10px",borderRadius:6,fontSize:11,fontWeight:700,background:i===1?"#1B3D2B":"transparent",color:i===1?"#fff":"#6b7280",cursor:"pointer"}}>{t}</div>
              ))}
            </div>
            <div className={`c${hl==="invite"?" hl-row":""}`} style={{transition:"all .3s"}}>
              <div className="c-h">Teammitglied einladen</div>
              <div style={{display:"flex",gap:7,alignItems:"center"}}>
                <div style={{flex:1,padding:"7px 10px",border:"1.5px solid #e4e6e4",borderRadius:7,fontSize:12,color:"#9ca3af",background:"#f9fafb"}}>kollege@firma.de</div>
                <select style={{padding:"7px 9px",borderRadius:7,border:"1.5px solid #e4e6e4",fontSize:11,background:"#fff"}}><option>Mitglied</option></select>
                <button className="bg" style={{fontSize:10}}>Einladen</button>
              </div>
            </div>
            <div className="c">
              <div className="c-h">Team <span style={{fontSize:9.5,color:"#9CA3AF"}}>3 Mitglieder</span></div>
              {[{e:"max@muster-auto.de",r:"Admin",s:"l"},{e:"anna@muster-auto.de",r:"Mitglied",s:"l"},{e:"jo@extern.de",r:"Betrachter",s:"m"}].map(m=>(
                <div key={m.e} className="br"><div className="bm"><div className="bn" style={{fontSize:11.5}}>{m.e}</div><div className="bs">{m.r}</div></div><span className={`b${m.s}`}>{m.s==="l"?"Aktiv":"Eingeladen"}</span></div>
              ))}
            </div>
            <div className={`c${hl==="billing"?" hl-row":""}`} style={{transition:"all .3s"}}>
              <div className="c-h">Abonnementpläne</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7}}>
                {[{n:"Free",p:"€0/Mo.",c:"#6B7280",f:["5 Lieferanten","1 Nutzer"]},{n:"Pro",p:"€149/Mo.",c:"#1B3D2B",f:["Unbegrenzt","5 Nutzer","KI"],best:true},{n:"Enterprise",p:"€499/Mo.",c:"#7C3AED",f:["Unbegrenzt","∞ Nutzer","SSO"]}].map((pl)=>(
                  <div key={pl.n} style={{border:`1.5px solid ${(pl as any).best?"#1B3D2B":"#E5E7EB"}`,borderRadius:8,padding:9,background:(pl as any).best?"#F8FAF8":"#fff"}}>
                    <div style={{fontSize:12,fontWeight:800,color:"#0b0f0c"}}>{pl.n}</div>
                    <div style={{fontSize:13,fontWeight:800,color:pl.c,margin:"2px 0 5px"}}>{pl.p}</div>
                    {pl.f.map(f=><div key={f} style={{fontSize:10,color:"#6b7280",marginBottom:2}}>✓ {f}</div>)}
                    {(pl as any).best&&<button className="bg" style={{width:"100%",fontSize:9.5,marginTop:5}}>Testversion</button>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {modal==="invite-sent"&&<div className="overlay"><div className="modal">
        <div className="sbadge">✓ Einladung gesendet</div>
        <div className="mh">Einladung: anna@muster-auto.de</div>
        {[["Rolle","Mitglied"],["Link gültig","7 Tage"],["Zugang","Lieferanten, Beschwerden"],["Gesendet via","Resend · protokolliert"]].map(([l,v])=>(
          <div key={l} className="rrow"><span style={{color:"#6b7280"}}>{l}</span><span style={{fontWeight:700}}>{v}</span></div>
        ))}
      </div></div>}
      {modal==="billing-upgrade"&&<div className="overlay"><div className="modal">
        <div className="mh">🚀 Upgrade auf Pro</div><div className="ms">Unbegrenzte Lieferanten, KI-Assistent, 5 Teammitglieder.</div>
        {[["Preis","149 € / Monat"],["Testversion","14 Tage kostenlos"],["Lieferanten","Unbegrenzt"],["KI-Assistent","✓ Enthalten"],["Rechtsvorlagen","✓ 6 Vorlagen"],["BAFA-Verteidigungsakte","✓ Enthalten"]].map(([l,v])=>(
          <div key={l} className="rrow"><span style={{color:"#6b7280"}}>{l}</span><span style={{fontWeight:700}}>{v}</span></div>
        ))}
        <div className="msub" style={{marginTop:10}}>14 Tage kostenlos testen →</div>
      </div></div>}
    </BW>
  );

  // CTA scene
  if (sceneId === "cta") return (
    <div className="cta-screen">
      <div className="cta-logo">LkSG<em>Compass</em></div>
      <div style={{fontSize:11,color:"rgba(255,255,255,.3)",fontFamily:"monospace",letterSpacing:"1px",marginBottom:28,textTransform:"uppercase"}}>§4 · §5 · §6 · §7 · §8 · §9 · §10 LkSG</div>
      <div className="cta-h">LkSG-Compliance.<br/>Von <em>§4 bis §10.</em><br/>Ohne Anwaltsstunden.</div>
      <div className="cta-sub">Risikoanalyse, Aktionspläne, KI-BAFA-Bericht, Rechtsvorlagen und BAFA-Verteidigungsakte — alles in einer Plattform. 14 Tage kostenlos.</div>
      <div className="cta-grid">
        {[{t:"§5 Risikoanalyse",s:"190 Länderprofile, automatisch"},{ t:"§8 Beschwerden",s:"Anonymes Hinweisgeberportal"},{t:"⚖️ Rechtsvorlagen",s:"CoC, SAQ, Vertrag, Audit"},{t:"🤖 KI-BAFA-Bericht",s:"Entwurf in Sekunden"},{t:"🛡 Verteidigungsakte",s:"Ein-Klick-BAFA-Export"},{t:"👥 Team",s:"Multi-User, Rollen, Einladungen"}].map(({t,s})=>(
          <div key={t} className="cta-card"><div className="cta-card-t">{t}</div><div className="cta-card-s">{s}</div></div>
        ))}
      </div>
      <div className="cta-btns">
        <a href="/register" className="cta-btn-main">Kostenlos starten →</a>
        <a href="/demo" className="cta-btn-ghost">Demo neu starten</a>
      </div>
      <div className="cta-note">✓ 14 Tage kostenlos · Keine Kreditkarte · DSGVO-konform · EU-Hosting</div>
    </div>
  );

  return null;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function DemoPage() {
  const [sIdx, setSIdx] = useState(0);
  const [fIdx, setFIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [visited, setVisited] = useState(new Set([0]));
  const [pct, setPct] = useState(0);
  const [speechDone, setSpeechDone] = useState(false);

  const s = SCENES[sIdx];
  const f = s.frames[fIdx];
  const nf = s.frames.length;
  const isCta = sIdx === SCENES.length - 1;

  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fbTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const playingRef  = useRef(true);
  const uttRef      = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => { playingRef.current = playing; }, [playing]);

  const clearAll = useCallback(() => {
    [timerRef, fbTimerRef].forEach(r => { if (r.current) { clearTimeout(r.current); r.current = null; } });
    if (progRef.current) { clearInterval(progRef.current); progRef.current = null; }
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, []);

  // Progress bar ticks continuously while playing
  const runProg = useCallback((minMs: number, maxMs: number) => {
    if (progRef.current) clearInterval(progRef.current);
    setPct(0);
    const tick = 100;
    let elapsed = 0;
    progRef.current = setInterval(() => {
      elapsed += tick;
      // Fill to 90% over maxMs, then hold
      const p = Math.min(90, (elapsed / maxMs) * 90);
      setPct(p);
    }, tick);
  }, []);

  const advanceTo = useCallback((si: number, fi: number) => {
    if (!playingRef.current) return;
    const scene = SCENES[si];
    const frame = scene.frames[fi];

    clearAll();
    setSIdx(si); setFIdx(fi); setPct(0); setSpeechDone(false);
    setVisited(v => new Set([...v, si]));

    // Min display time: 5s, Max: 15s
    const MIN_MS = 5000;
    const MAX_MS = 15000;
    runProg(MIN_MS, MAX_MS);

    let speechEnded = false;
    let minElapsed = false;

    const tryAdvance = () => {
      if (speechEnded && minElapsed && playingRef.current) {
        setSpeechDone(true);
        setPct(100);
        if (progRef.current) { clearInterval(progRef.current); progRef.current = null; }
        timerRef.current = setTimeout(() => {
          const nextFi = fi + 1;
          if (nextFi < scene.frames.length) advanceTo(si, nextFi);
          else {
            const nextSi = (si + 1) % SCENES.length;
            advanceTo(nextSi, 0);
          }
        }, 1200);
      }
    };

    // Min display timer
    fbTimerRef.current = setTimeout(() => {
      minElapsed = true;
      tryAdvance();
      // Hard fallback: if speech never ends, advance after MAX_MS anyway
      timerRef.current = setTimeout(() => {
        speechEnded = true; minElapsed = true;
        tryAdvance();
      }, MAX_MS - MIN_MS);
    }, MIN_MS);

    // Speech
    if (!muted && typeof window !== "undefined" && window.speechSynthesis) {
      setTimeout(() => { // tiny delay so voices load on first call
        const u = new SpeechSynthesisUtterance(frame.narration);
        u.lang = "en-US"; u.rate = 0.85; u.pitch = 1.05;
        const voices = window.speechSynthesis.getVoices();
        const v = voices.find(v =>
          v.lang.startsWith("en") &&
          (v.name.includes("Samantha") || v.name.includes("Karen") ||
           v.name.includes("Google US") || v.name.includes("Daniel") ||
           v.name.includes("Moira"))
        );
        if (v) u.voice = v;
        u.onend = () => { speechEnded = true; tryAdvance(); };
        u.onerror = () => { speechEnded = true; tryAdvance(); };
        uttRef.current = u;
        window.speechSynthesis.speak(u);
      }, 120);
    } else {
      speechEnded = true;
    }
  }, [muted, clearAll, runProg]);

  // Auto-start
  useEffect(() => {
    const t = setTimeout(() => advanceTo(0, 0), 900);
    return () => { clearTimeout(t); clearAll(); };
  }, []);

  useEffect(() => {
    if (!playing) clearAll();
    else advanceTo(sIdx, fIdx);
  }, [playing]);

  useEffect(() => {
    if (muted) window.speechSynthesis?.cancel();
  }, [muted]);

  function goTo(si: number, fi = 0) {
    if (playing) advanceTo(si, fi);
    else { clearAll(); setSIdx(si); setFIdx(fi); setPct(0); setVisited(v => new Set([...v, si])); }
  }

  const overall = ((sIdx + fIdx / Math.max(nf, 1)) / SCENES.length) * 100;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="shell">
        <div className="tb">
          <a href="/" className="logo">LkSG<em>Compass</em></a>
          <div className="tb-r">
            <div className="tb-badge">▶ Interaktive Produktdemo</div>
            <a href="/register" className="tb-cta">Kostenlos starten →</a>
          </div>
        </div>
        <div className="prog"><div className="prog-fill" style={{ width: `${overall}%` }} /></div>
        <div className="stabs">
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
                  <RenderFrame sceneId={sc.id} ui={fr.ui} />
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
                  <div className="nb-step">Schritt {fi + 1} von {nf}</div>
                  {fr.narration}
                </div>
              ))}
            </div>
            <div className="ctrl">
              <button className="cb" disabled={sIdx===0&&fIdx===0}
                onClick={() => { setPlaying(false); if(fIdx>0) goTo(sIdx,fIdx-1); else if(sIdx>0) goTo(sIdx-1,SCENES[sIdx-1].frames.length-1); }}>← Zurück</button>
              <div className="cc">
                <div className="fdots">
                  {s.frames.map((_,fi)=>(
                    <div key={fi} className={`fd${fIdx===fi?" on":fi<fIdx?" done":""}`} onClick={()=>goTo(sIdx,fi)} />
                  ))}
                </div>
                <button className="play-btn" onClick={() => { if(playing){clearAll();setPlaying(false);}else{setPlaying(true);} }}>
                  {playing ? "⏸ Pause" : "▶ Abspielen"}
                </button>
                <div className="timer-bar"><div className="timer-fill" style={{ width: `${pct}%`, transition: pct===0?"none":"width .1s linear" }} /></div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <button className="cb" onClick={() => setMuted(m => !m)} style={{padding:"7px 9px"}}>{muted?"🔇":"🔊"}</button>
                {isCta && fIdx===nf-1
                  ? <a href="/register" className="cb p" style={{textDecoration:"none"}}>Starten →</a>
                  : <button className="cb p" onClick={() => { setPlaying(false); if(fIdx<nf-1) goTo(sIdx,fIdx+1); else goTo(sIdx+1,0); }}>Weiter →</button>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
