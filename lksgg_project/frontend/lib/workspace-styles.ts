export const WORKSPACE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:#F0F2F0;color:#0D1110;min-height:100vh;line-height:1.6}
a{color:inherit;text-decoration:none}
button{cursor:pointer;font-family:inherit}
textarea,input,select{font-family:inherit}

/* NAV */
.nav{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.97);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid #E2E8E2;height:54px;display:flex;align-items:center;padding:0 24px;gap:6px;box-shadow:0 1px 0 rgba(0,0,0,.04)}
.nav-logo{display:flex;align-items:center;gap:8px;margin-right:10px;flex-shrink:0}
.nav-logo-mark{width:28px;height:28px;border-radius:8px;background:#1B3D2B;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;letter-spacing:-.5px;flex-shrink:0}
.nav-logo-text{font-size:14.5px;font-weight:800;color:#0D1110;letter-spacing:-.3px}
.nav-logo-text span{color:#9CA3AF;font-weight:600}
.nav-scroll{display:flex;align-items:center;gap:1px;flex:1;overflow-x:auto;scrollbar-width:none}
.nav-scroll::-webkit-scrollbar{display:none}
.nav-tab{display:flex;align-items:center;gap:5px;padding:6px 12px;background:none;border:none;border-radius:8px;font-size:12.5px;font-weight:500;color:#6B7280;white-space:nowrap;transition:all .15s;position:relative}
.nav-tab:hover{background:#F0F5F0;color:#1B3D2B}
.nav-tab.on{background:#F0F5F0;color:#1B3D2B;font-weight:700}
.nav-tab.on::after{content:'';position:absolute;bottom:-2px;left:12px;right:12px;height:2px;background:#1B3D2B;border-radius:1px}
.nav-badge{min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:#DC2626;color:#fff;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;line-height:1}
.nav-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
.lang-grp{display:flex;background:#F3F4F3;border:1px solid #E2E8E2;border-radius:8px;padding:2px;gap:1px}
.lb{background:none;border:none;font-size:11px;font-weight:700;color:#9CA3AF;padding:3px 9px;border-radius:6px;transition:all .15s}
.lb.on{background:#fff;color:#1B3D2B;box-shadow:0 1px 4px rgba(0,0,0,.1)}
.nav-cmp{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:#6B7280;padding:5px 10px;border:1px solid #E2E8E2;border-radius:8px;background:#fff}
.nav-out{background:none;border:1px solid #E2E8E2;color:#6B7280;font-size:12px;font-weight:600;padding:5px 11px;border-radius:8px;transition:all .15s;display:flex;align-items:center;gap:5px}
.nav-out:hover{border-color:#FECACA;color:#DC2626;background:#FEF2F2}

/* PAGE */
.pg{padding:24px;max-width:1360px;margin:0 auto}
@media(max-width:768px){.pg{padding:12px 10px}}

/* TOASTS */
.toasts{position:fixed;bottom:24px;right:24px;z-index:999;display:flex;flex-direction:column;gap:8px;pointer-events:none}
.toast{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:12px;font-size:13px;font-weight:600;box-shadow:0 10px 40px rgba(0,0,0,.18);animation:toastin .25s cubic-bezier(.34,1.56,.64,1);pointer-events:auto;max-width:340px;border:1px solid rgba(255,255,255,.15)}
.toast-ok{background:#1B3D2B;color:#fff}
.toast-err{background:#991B1B;color:#fff}
.toast-info{background:#1E40AF;color:#fff}
@keyframes toastin{from{transform:translateY(16px) scale(.95);opacity:0}to{transform:none;opacity:1}}

/* GRID */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
@media(max-width:1100px){.g3,.g4{grid-template-columns:1fr 1fr}}
@media(max-width:720px){.g2,.g3,.g4{grid-template-columns:1fr}}

/* CARDS */
.card{background:#fff;border:1px solid #E2E8E2;border-radius:16px;padding:22px;box-shadow:0 1px 4px rgba(0,0,0,.05)}
.card-sm{background:#fff;border:1px solid #E2E8E2;border-radius:12px;padding:16px}
.card-xs{background:#fff;border:1px solid #E2E8E2;border-radius:10px;padding:12px}

/* KPIs */
.kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
@media(max-width:960px){.kpi-row{grid-template-columns:1fr 1fr}}
.kpi{background:#fff;border:1px solid #E2E8E2;border-radius:14px;padding:18px 20px;box-shadow:0 1px 4px rgba(0,0,0,.04);position:relative;overflow:hidden;transition:transform .15s,box-shadow .15s}
.kpi:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,.08)}
.kpi-accent{position:absolute;top:0;left:0;right:0;height:3px;border-radius:3px 3px 0 0}
.kpi-lbl{font-size:10px;font-weight:800;color:#9CA3AF;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px;display:flex;align-items:center;gap:6px}
.kpi-val{font-size:30px;font-weight:900;letter-spacing:-1px;line-height:1;margin-bottom:5px}
.kpi-sub{font-size:12px;color:#6B7280;line-height:1.4}

/* SECTION HEADERS */
.sec-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:18px;flex-wrap:wrap}
.sec-title{font-size:18px;font-weight:800;color:#0D1110;letter-spacing:-.4px;margin-bottom:3px}
.sec-sub{font-size:13px;color:#6B7280;line-height:1.5}
.ltag{display:inline-flex;align-items:center;font-size:9.5px;font-weight:800;color:#1B3D2B;background:#EDF7F0;border:1px solid #C6E4CE;padding:1px 8px;border-radius:20px;vertical-align:middle;margin-left:5px;letter-spacing:.3px}
.ltag-red{color:#991B1B;background:#FEF2F2;border-color:#FECACA}
.ltag-blue{color:#1E40AF;background:#EFF6FF;border-color:#BFDBFE}

/* FORMS */
.fl{margin-bottom:14px}
.fl>label{display:block;font-size:10px;font-weight:800;color:#6B7280;text-transform:uppercase;letter-spacing:.7px;margin-bottom:6px}
.inp,.sel,.ta{width:100%;padding:9px 13px;border:1.5px solid #E2E8E2;border-radius:9px;font-size:13.5px;color:#0D1110;background:#fff;transition:border-color .2s,box-shadow .2s;outline:none;line-height:1.5}
.inp:focus,.sel:focus,.ta:focus{border-color:#1B3D2B;box-shadow:0 0 0 3px rgba(27,61,43,.1)}
.inp::placeholder,.ta::placeholder{color:#C4CAC4}
.ta{resize:vertical}
.sel{-webkit-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath fill='%236B7280' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:30px}
.inp-row{display:flex;gap:10px}
.inp-row .fl{flex:1}
.chk-row{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.chk-row input[type=checkbox]{width:16px;height:16px;accent-color:#1B3D2B;cursor:pointer;flex-shrink:0}
.chk-row label{font-size:13px;font-weight:500;color:#374151;cursor:pointer}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 16px;border-radius:9px;font-size:13px;font-weight:700;border:none;transition:all .15s;white-space:nowrap;line-height:1}
.btn-p{background:#1B3D2B;color:#fff}
.btn-p:hover:not(:disabled){background:#244F38;transform:translateY(-1px);box-shadow:0 4px 14px rgba(27,61,43,.32)}
.btn-g{background:#fff;color:#374151;border:1.5px solid #E2E8E2}
.btn-g:hover:not(:disabled){background:#F5F7F5;border-color:#D1E7D9}
.btn-r{background:#fff;color:#DC2626;border:1.5px solid #FECACA}
.btn-r:hover:not(:disabled){background:#FEF2F2}
.btn-ai{background:linear-gradient(135deg,#1B3D2B 0%,#2D6A4F 100%);color:#fff;box-shadow:0 2px 8px rgba(27,61,43,.2)}
.btn-ai:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 16px rgba(27,61,43,.3)}
.btn-warn{background:#fff;color:#D97706;border:1.5px solid #FDE68A}
.btn-warn:hover:not(:disabled){background:#FFFBEB}
.btn-sm{padding:6px 12px;font-size:12px;border-radius:7px}
.btn-xs{padding:3px 9px;font-size:11px;border-radius:6px}
.btn:disabled{opacity:.4;cursor:not-allowed;transform:none!important;box-shadow:none!important}
.brow{display:flex;gap:8px;align-items:center;flex-wrap:wrap}

/* CHIPS */
.chip{display:inline-flex;align-items:center;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.2px}
.ch{background:#FEF2F2;color:#991B1B;border:1px solid #FECACA}
.cm{background:#FFFBEB;color:#92400E;border:1px solid #FDE68A}
.cl{background:#F0FDF4;color:#166534;border:1px solid #BBF7D0}
.cu{background:#F9FAFB;color:#4B5563;border:1px solid #E5E7E5}
.cb{background:#EFF6FF;color:#1E40AF;border:1px solid #BFDBFE}
.cv{background:#F5F3FF;color:#5B21B6;border:1px solid #DDD6FE}

/* ALERTS */
.al{display:flex;align-items:flex-start;gap:10px;padding:12px 15px;border-radius:10px;font-size:13px;line-height:1.55;margin-bottom:12px}
.al-err{background:#FEF2F2;border:1px solid #FECACA;color:#7F1D1D}
.al-warn{background:#FFFBEB;border:1px solid #FDE68A;color:#78350F}
.al-ok{background:#F0FDF4;border:1px solid #BBF7D0;color:#14532D}
.al-info{background:#EDF7F0;border:1px solid #C6E4CE;color:#1B3D2B}
.al-blue{background:#EFF6FF;border:1px solid #BFDBFE;color:#1E3A8A}
.al-icon{font-size:15px;flex-shrink:0;margin-top:1px}

/* TABLE */
.tbl-wrap{overflow-x:auto;border-radius:10px;border:1px solid #E2E8E2}
table{width:100%;border-collapse:collapse;font-size:13px}
thead th{text-align:left;font-size:9.5px;font-weight:800;color:#9CA3AF;text-transform:uppercase;letter-spacing:.7px;padding:10px 16px;border-bottom:1px solid #E2E8E2;background:#F8FAF8;white-space:nowrap}
tbody td{padding:12px 16px;border-bottom:1px solid #F0F2F0;vertical-align:middle}
tbody tr:last-child td{border-bottom:none}
tbody tr:hover{background:#FAFBFA;cursor:default}
tbody tr.clickable:hover{background:#F5F7F5;cursor:pointer}

/* SCORE RING */
.ring-wrap{position:relative;flex-shrink:0}
.ring-wrap svg{transform:rotate(-90deg)}
.ring-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}

/* RISK BAR */
.rb{height:6px;border-radius:4px;background:#E2E8E2;overflow:hidden;display:flex}
.rs{transition:flex .6s cubic-bezier(.34,1.56,.64,1)}

/* PARAM BAR */
.param-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.param-lbl{font-size:11.5px;color:#4B5563;flex:1;min-width:0}
.param-bar-wrap{width:80px;height:6px;border-radius:4px;background:#E2E8E2;overflow:hidden;flex-shrink:0}
.param-bar-fill{height:100%;border-radius:4px;transition:width .5s}
.param-val{font-size:11px;font-weight:700;width:24px;text-align:right;flex-shrink:0}

/* PROGRESS */
.prog{height:5px;border-radius:4px;background:#E2E8E2;overflow:hidden}
.prog-fill{height:100%;border-radius:4px;transition:width .6s}

/* AI */
.ai-box{display:flex;flex-direction:column;background:#fff;border:1px solid #E2E8E2;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.04)}
.ai-hd{padding:18px 22px;border-bottom:1px solid #E2E8E2;display:flex;align-items:center;gap:14px;background:linear-gradient(135deg,#EDF7F0 0%,#fff 60%)}
.ai-av{width:42px;height:42px;border-radius:13px;background:linear-gradient(135deg,#1B3D2B,#2D6A4F);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px;box-shadow:0 4px 12px rgba(27,61,43,.25)}
.ai-msgs{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:14px;min-height:360px;max-height:520px;background:#F8FAF8}
.ai-msg{display:flex;gap:10px;animation:toastin .2s ease}
.ai-msg.u{flex-direction:row-reverse}
.ai-bub{padding:11px 15px;border-radius:14px;font-size:13.5px;line-height:1.7;max-width:84%;white-space:pre-wrap}
.ai-bub.u{background:#1B3D2B;color:#fff;border-radius:14px 14px 3px 14px}
.ai-bub.a{background:#fff;border:1px solid #E2E8E2;border-radius:14px 14px 14px 3px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.ai-ico{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px;border:1.5px solid #E2E8E2;background:#fff;font-weight:700;color:#1B3D2B}
.ai-qs{display:flex;gap:6px;flex-wrap:wrap;padding:12px 18px;border-top:1px solid #E2E8E2;background:#F8FAF8}
.ai-q{padding:5px 12px;border-radius:20px;border:1.5px solid #C6E4CE;background:#EDF7F0;color:#1B3D2B;font-size:11.5px;font-weight:700;cursor:pointer;transition:all .15s}
.ai-q:hover{background:#C6E4CE;border-color:#1B3D2B}
.ai-ir{display:flex;gap:8px;padding:14px 18px;border-top:1px solid #E2E8E2;background:#fff}
.ai-ta{flex:1;padding:10px 14px;border:1.5px solid #E2E8E2;border-radius:10px;font-size:13.5px;resize:none;outline:none;transition:border-color .2s;line-height:1.5}
.ai-ta:focus{border-color:#1B3D2B;box-shadow:0 0 0 3px rgba(27,61,43,.1)}
.ai-dis{font-size:11px;color:#9CA3AF;text-align:center;padding:6px 16px;border-top:1px solid #E2E8E2;line-height:1.4}

/* MODAL */
.modal-bg{position:fixed;inset:0;background:rgba(13,17,16,.55);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);animation:fade .15s ease}
.modal{background:#fff;border-radius:18px;padding:30px;width:100%;max-width:580px;box-shadow:0 24px 80px rgba(0,0,0,.22);max-height:90vh;overflow-y:auto;animation:slideup .2s cubic-bezier(.34,1.56,.64,1)}
.modal-lg{max-width:720px}
.modal-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:22px}
.modal-title{font-size:19px;font-weight:900;letter-spacing:-.4px}
.modal-close{background:none;border:1px solid #E2E8E2;font-size:16px;color:#9CA3AF;cursor:pointer;line-height:1;padding:5px 8px;border-radius:7px;transition:all .15s}
.modal-close:hover{color:#0D1110;background:#F3F4F3}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes slideup{from{transform:translateY(20px) scale(.97);opacity:0}to{transform:none;opacity:1}}

/* MISC */
.spin{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:rot .7s linear infinite;flex-shrink:0}
.spin-d{border-color:rgba(0,0,0,.12);border-top-color:#1B3D2B}
@keyframes rot{to{transform:rotate(360deg)}}
hr.div{border:none;border-top:1px solid #E2E8E2;margin:18px 0}
.empty{text-align:center;padding:48px 20px;color:#6B7280}
.empty-ic{width:56px;height:56px;border-radius:18px;background:#EDF7F0;border:2px solid #C6E4CE;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px}
.empty-t{font-size:15px;font-weight:800;color:#0D1110;margin-bottom:6px;letter-spacing:-.2px}
.mono{font-family:'DM Mono',monospace;font-size:11.5px}
.badge-ok{background:#F0FDF4;color:#166534;border:1px solid #BBF7D0;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700}
.badge-warn{background:#FFFBEB;color:#92400E;border:1px solid #FDE68A;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700}
.badge-err{background:#FEF2F2;color:#991B1B;border:1px solid #FECACA;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700}
.row-exp{background:#F8FAF8;border-top:1px solid #E2E8E2}
.sec-divider{font-size:10px;font-weight:800;color:#9CA3AF;text-transform:uppercase;letter-spacing:.8px;margin:18px 0 12px;display:flex;align-items:center;gap:8px}
.sec-divider::after{content:'';flex:1;height:1px;background:#E2E8E2}
.score-breakdown{background:#F8FAF8;border:1px solid #E2E8E2;border-radius:12px;padding:14px;margin-top:12px}
.stat-pill{display:inline-flex;align-items:center;gap:5px;background:#F3F4F3;border:1px solid #E2E8E2;border-radius:8px;padding:4px 10px;font-size:11.5px;font-weight:600;color:#4B5563}

.workspace-bar{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin:0 0 16px;background:linear-gradient(180deg,#fff 0%,#F8FAF8 100%);border:1px solid #E2E8E2;border-radius:18px;padding:18px 20px;box-shadow:0 1px 4px rgba(0,0,0,.04)}
.workspace-meta{display:flex;flex-direction:column;gap:6px}
.workspace-kicker{font-size:10px;font-weight:800;color:#9CA3AF;text-transform:uppercase;letter-spacing:.8px}
.workspace-title{font-size:22px;font-weight:900;letter-spacing:-.5px;color:#0D1110;line-height:1.1}
.workspace-sub{font-size:13px;color:#6B7280;max-width:780px}
.workspace-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
.nav-scroll.grouped{gap:12px;align-items:stretch;padding:8px 0}
.nav-group{display:flex;align-items:center;gap:6px;padding:0 10px;border-left:1px solid #EEF2EF}
.nav-group:first-child{border-left:none;padding-left:0}
.nav-group-title{font-size:10px;font-weight:800;color:#9CA3AF;text-transform:uppercase;letter-spacing:.7px;padding:0 4px;white-space:nowrap}
.quickstart-card{background:#fff;border:1px solid #E2E8E2;border-radius:16px;padding:18px 20px;box-shadow:0 1px 4px rgba(0,0,0,.04);margin-bottom:16px}
.quickstart-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:14px}
@media(max-width:1100px){.quickstart-grid{grid-template-columns:1fr 1fr 1fr}}
@media(max-width:980px){.workspace-focus{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:720px){.workspace-bar{padding:16px;flex-direction:column}.workspace-focus{grid-template-columns:1fr}.quickstart-grid{grid-template-columns:1fr}.nav{height:auto;min-height:54px;align-items:flex-start;padding:10px 12px;flex-wrap:wrap}.nav-right{width:100%;justify-content:space-between}.nav-scroll.grouped{order:3;width:100%;overflow-x:auto;padding-top:6px}.nav-group{padding:0 6px}}
.quickstep{background:#F8FAF8;border:1px solid #E2E8E2;border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:8px;min-height:138px}
.quickstep.done{background:#F0FDF4;border-color:#BBF7D0}
.quickstep-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.quickstep-num{width:24px;height:24px;border-radius:999px;background:#EDF7F0;color:#1B3D2B;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0}
.quickstep.done .quickstep-num{background:#16A34A;color:#fff}
.quickstep-status{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.7px;color:#9CA3AF}
.quickstep.done .quickstep-status{color:#166534}
.quickstep-title{font-size:13px;font-weight:800;color:#0D1110;line-height:1.3}
.quickstep-copy{font-size:12px;color:#6B7280;line-height:1.5;flex:1}
.quickstart-progress{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.quickstart-progress .prog{flex:1;min-width:180px;height:8px}
.quickstart-progress-note{font-size:12px;color:#6B7280}

.empty-c{font-size:12.5px;line-height:1.6;max-width:520px;margin:0 auto;color:#6B7280}
.empty-compact{padding:28px 16px}
.section-meta{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin:-2px 0 14px;padding:10px 12px;border:1px solid #E5ECE7;border-radius:12px;background:#FBFCFB}
.section-meta-left{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.section-meta-title{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#6B7280}
.section-meta-pill{font-size:10px;font-weight:800;border-radius:999px;padding:3px 8px;border:1px solid #D7E0D9;background:#fff;color:#4B5563}
.section-meta-pill.is-loading{background:#EEF6FF;border-color:#CFE0FF;color:#2563EB}
.section-meta-pill.is-error{background:#FFF2F0;border-color:#F8D0C8;color:#B42318}
.section-meta-pill.is-stale{background:#FFF8EB;border-color:#F5D58A;color:#B45309}
.section-meta-pill.is-ok{background:#F3FBF5;border-color:#C6E4CE;color:#166534}
.section-meta-copy{font-size:11.5px;color:#6B7280}
.action-prompt{display:flex;justify-content:space-between;align-items:center;gap:12px;border-radius:14px;padding:14px 16px;margin-bottom:14px}
.action-prompt-title{font-size:13px;font-weight:800;color:#0D1110;margin-bottom:4px}
.action-prompt-copy{font-size:12px;line-height:1.55;color:#4B5563}
.action-prompt-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.module-guide{background:linear-gradient(180deg,#fff 0%,#F8FAF8 100%);border:1px solid #E2E8E2;border-radius:16px;padding:18px 20px;box-shadow:0 1px 4px rgba(0,0,0,.04);margin-bottom:16px}
.module-guide-collapsed{display:flex;align-items:center;justify-content:space-between;gap:10px;background:#fff;border:1px dashed #D1D5DB;border-radius:12px;padding:10px 12px;margin-bottom:16px}
.module-guide-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px;flex-wrap:wrap}
.module-guide-title{font-size:15px;font-weight:800;color:#0D1110}
.module-guide-sub{font-size:12.5px;color:#6B7280;max-width:760px}
.module-guide-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.module-guide-step{background:#F8FAF8;border:1px solid #E2E8E2;border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:8px;min-height:126px}
.module-guide-step.done{background:#F0FDF4;border-color:#BBF7D0}
.module-guide-step-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.module-guide-step-num{width:22px;height:22px;border-radius:999px;background:#EDF7F0;color:#1B3D2B;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800}
.module-guide-step.done .module-guide-step-num{background:#16A34A;color:#fff}
.module-guide-step-status{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.7px;color:#9CA3AF}
.module-guide-step.done .module-guide-step-status{color:#166534}
.module-guide-step-title{font-size:13px;font-weight:800;color:#0D1110;line-height:1.35}
.module-guide-step-copy{font-size:12px;color:#6B7280;line-height:1.5}
.module-launchpad{margin-bottom:16px}
.module-launchpad-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.module-launchpad-card{border:1px solid #E2E8E2;border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:8px}
.module-launchpad-status{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.8px}
.module-launchpad-title{font-size:14px;font-weight:800;color:#0D1110}
.module-launchpad-copy{font-size:12.5px;color:#4B5563;line-height:1.5;flex:1}
@media(max-width:960px){.module-guide-grid,.module-launchpad-grid{grid-template-columns:1fr}}
`;

export const WORKSPACE_STAGE_V52_CSS = `
.approval-aging-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.approval-aging-card{border:1px solid #E2E8E2;border-radius:12px;padding:12px;background:#F8FAF8}
.approval-aging-label{font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#6B7280;margin-bottom:6px}
.approval-aging-value{font-size:20px;font-weight:900;color:#0D1110;line-height:1.1}
@media(max-width:900px){.approval-aging-grid{grid-template-columns:1fr 1fr}}
@media(max-width:640px){.approval-aging-grid{grid-template-columns:1fr}}
`;


export const WORKSPACE_STAGE_V57_CSS = `
:root{--shell-max:1440px;--shell-bg:linear-gradient(180deg,#f7faf7 0%,#f3f7f4 42%,#eef3ef 100%);--panel-shadow:0 10px 30px rgba(16,24,19,.06),0 2px 8px rgba(16,24,19,.04);--panel-border:#dde7df;--text-strong:#0d1110;--text-soft:#5d675f;--brand:#153b2c;--brand-2:#1f5a41;--mint:#e9f6ee;}
body{background:radial-gradient(circle at top left,rgba(198,228,206,.42),transparent 28%),radial-gradient(circle at top right,rgba(21,59,44,.06),transparent 24%),var(--shell-bg)}
.nav{position:sticky;top:0;z-index:40;backdrop-filter:blur(16px);background:rgba(255,255,255,.78);border-bottom:1px solid rgba(221,231,223,.9);box-shadow:0 10px 26px rgba(16,24,19,.06)}
.nav-logo-mark{background:linear-gradient(135deg,var(--brand),var(--brand-2));box-shadow:0 10px 20px rgba(21,59,44,.18)}
.nav-tab{border-radius:999px;padding:10px 14px;font-weight:800;letter-spacing:-.01em}
.nav-tab.on{box-shadow:0 8px 18px rgba(21,59,44,.14)}
.nav-badge{box-shadow:0 2px 8px rgba(0,0,0,.08)}
.nav-cmp{background:linear-gradient(180deg,#fff 0%,#f7faf7 100%);border-color:var(--panel-border);box-shadow:0 1px 4px rgba(16,24,19,.04)}
.pg{max-width:var(--shell-max);padding:26px 24px 42px}
.workspace-shell{display:grid;grid-template-columns:minmax(0,1fr);gap:18px}
.workspace-bar{position:relative;overflow:hidden;padding:24px 24px 22px;border:1px solid var(--panel-border);border-radius:24px;background:linear-gradient(135deg,rgba(255,255,255,.95) 0%,rgba(247,250,247,.96) 56%,rgba(233,246,238,.94) 100%);box-shadow:var(--panel-shadow)}
.workspace-bar::after{content:'';position:absolute;right:-80px;top:-80px;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(21,59,44,.11) 0%,rgba(21,59,44,0) 68%);pointer-events:none}
.workspace-title{font-size:30px;letter-spacing:-.03em}
.workspace-sub{font-size:14px;line-height:1.65;color:var(--text-soft)}
.workspace-actions .btn{box-shadow:0 8px 18px rgba(21,59,44,.12)}
.workspace-focus{grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:0 0 18px}
.focus-card{position:relative;overflow:hidden;border:1px solid var(--panel-border);border-radius:22px;background:linear-gradient(180deg,#fff 0%,#f9fbf9 100%);box-shadow:var(--panel-shadow);padding:18px;min-height:176px;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}
.focus-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,var(--brand),#43a06d)}
.focus-card:hover{transform:translateY(-2px);box-shadow:0 18px 36px rgba(16,24,19,.09),0 4px 12px rgba(16,24,19,.05);border-color:#c6d7ca}
.focus-kicker{font-size:10px;letter-spacing:.1em}
.focus-value{font-size:30px;letter-spacing:-.04em;margin:6px 0 8px}
.focus-chip{background:var(--mint);border-color:#c6e4ce;color:var(--brand)}
.focus-copy{font-size:12.5px;line-height:1.6;color:var(--text-soft);max-width:28ch}
.focus-action{margin-top:auto;padding-top:12px}
.quickstart-card,.module-guide,.card,.workspace-data-state,.score-breakdown,.module-launchpad-card,.approval-aging-card,.section-meta{border-color:var(--panel-border);box-shadow:var(--panel-shadow)}
.card{border-radius:22px;background:linear-gradient(180deg,#fff 0%,#fbfcfb 100%)}
.card:hover{box-shadow:0 18px 34px rgba(16,24,19,.08),0 3px 12px rgba(16,24,19,.04)}
.section-meta{border-radius:14px;background:rgba(255,255,255,.8);backdrop-filter:blur(10px)}
.module-guide-step,.quickstep,.module-launchpad-card,.approval-aging-card{border-radius:16px}
.tbl{border-radius:18px;overflow:hidden}
.tbl th{font-size:11px;letter-spacing:.08em;text-transform:uppercase;background:#f7faf7}
.tbl td{vertical-align:middle}
.btn{border-radius:12px}
.btn-p{background:linear-gradient(135deg,var(--brand),var(--brand-2));border:none;box-shadow:0 12px 24px rgba(21,59,44,.18)}
.btn-g{background:#fff;border:1px solid var(--panel-border)}
.btn-g:hover{border-color:#c6d7ca;background:#f8fbf8}
.ai-wrap,.modal,.quickstart-card,.module-guide,.workspace-commandbar,.workspace-approval-inbox,.workspace-readonly-banner,.workspace-approval-prep,.workspace-actionrail{box-shadow:var(--panel-shadow)}
.workspace-commandbar,.workspace-actionrail,.workspace-readonly-banner,.workspace-approval-prep,.workspace-approval-inbox{border:1px solid var(--panel-border);border-radius:18px;background:linear-gradient(180deg,#fff 0%,#fbfcfb 100%)}
.empty{padding:58px 20px}
.empty-ic{box-shadow:0 10px 18px rgba(21,59,44,.08)}
@media(max-width:1180px){.workspace-focus{grid-template-columns:repeat(2,minmax(0,1fr))}.pg{padding:20px 18px 34px}.workspace-title{font-size:26px}}
@media(max-width:760px){.workspace-focus{grid-template-columns:1fr}.workspace-bar{padding:18px}.workspace-title{font-size:24px}.nav{backdrop-filter:blur(10px)}.pg{padding:16px 14px 28px}}
`;
