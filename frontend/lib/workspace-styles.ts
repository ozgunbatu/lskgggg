/* ──────────────────────────────────────────────────────────────────────────
   LkSGCompass Design System v100
   Aesthetic: Premium dark SaaS — Linear × Vercel × Stripe DNA
   Typefaces: Geist (display) + DM Sans (body) + DM Mono (data)
   ────────────────────────────────────────────────────────────────────────── */
export const WORKSPACE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

:root {
  --bg:       #f4f8f3;
  --bg-1:     #ffffff;
  --bg-2:     #f7fbf6;
  --bg-3:     #eef5ef;
  --bg-4:     #e3eee5;
  --border:   rgba(27,61,43,0.10);
  --border-2: rgba(27,61,43,0.16);
  --border-3: rgba(27,61,43,0.22);
  --t1: #112317;
  --t2: #415346;
  --t3: #607266;
  --t4: #8da194;
  --g:   #7bcf8f;
  --g1:  #1f7a45;
  --g2:  #16914c;
  --g-bg: rgba(31,122,69,0.08);
  --g-border: rgba(31,122,69,0.18);
  --red:    #dc5f5f;
  --red-bg: rgba(220,95,95,0.08);
  --red-border: rgba(220,95,95,0.22);
  --amber:     #c88719;
  --amber-bg:  rgba(200,135,25,0.10);
  --amber-border: rgba(200,135,25,0.22);
  --blue:    #3677d8;
  --blue-bg: rgba(54,119,216,0.08);
  --blue-border: rgba(54,119,216,0.18);
  --purple:    #9158d9;
  --purple-bg: rgba(145,88,217,0.08);
  --purple-border: rgba(145,88,217,0.18);
  --shadow-sm: 0 1px 2px rgba(16,24,18,0.05), 0 2px 10px rgba(16,24,18,0.04);
  --shadow-md: 0 8px 28px rgba(16,24,18,0.08), 0 2px 8px rgba(16,24,18,0.06);
  --shadow-lg: 0 18px 48px rgba(16,24,18,0.12), 0 6px 18px rgba(16,24,18,0.08);
  --shadow-glow: 0 0 0 1px rgba(31,122,69,0.12), 0 10px 32px rgba(31,122,69,0.10);
  --r-sm: 8px;
  --r-md: 12px;
  --r-lg: 16px;
  --r-xl: 20px;
  --r-2xl: 24px;
}

*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; scroll-behavior: smooth; }
body {
  font-family: 'DM Sans', system-ui, sans-serif;
  background:
    radial-gradient(circle at top left, rgba(123,207,143,0.18), transparent 28%),
    linear-gradient(180deg, #f7fbf6 0%, #eef5ef 100%);
  color: var(--t1);
  min-height: 100vh;
  line-height: 1.6;
  font-size: 14px;
}
a { color: inherit; text-decoration: none; }
button { cursor: pointer; font-family: inherit; }
textarea, input, select { font-family: inherit; }

/* ── SCROLLBAR ─────────────────────────────────────────────────────────────── */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--bg-4); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: var(--bg-4); }

/* ── NAV ───────────────────────────────────────────────────────────────────── */
.nav {
  position: sticky;
  top: 12px;
  z-index: 100;
  margin: 12px auto 0;
  width: min(1440px, calc(100% - 24px));
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid rgba(27,61,43,0.08);
  border-radius: 24px;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
}
.nav-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.nav-brand-block {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}
.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.nav-logo-mark {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: linear-gradient(135deg, #143524 0%, #2f8153 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: #e8fff0;
  letter-spacing: -0.4px;
  border: 1px solid rgba(31,122,69,0.28);
  box-shadow: 0 8px 18px rgba(31,122,69,0.18);
}
.nav-logo-text {
  font-size: 16px;
  font-weight: 800;
  color: var(--t1);
  letter-spacing: -0.3px;
}
.nav-logo-text span { color: var(--t3); font-weight: 600; }
.nav-context {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding-left: 14px;
  border-left: 1px solid var(--border);
}
.nav-context-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--t4);
  font-weight: 700;
}
.nav-context-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--t2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-mainrow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}
.nav-primary-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.nav-main-tab, .nav-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--t2);
  font-size: 13px;
  font-weight: 700;
  transition: all 0.16s ease;
}
.nav-main-tab:hover, .nav-more-btn:hover {
  background: var(--bg-3);
  border-color: var(--border);
  color: var(--t1);
}
.nav-main-tab.on, .nav-more-btn.on {
  background: linear-gradient(180deg, #173927 0%, #143524 100%);
  color: #f5fff7;
  box-shadow: 0 10px 24px rgba(20,53,36,0.16);
}
.nav-main-tab.on .nav-badge, .nav-more-btn.on .nav-badge {
  background: rgba(255,255,255,0.18);
  color: #fff;
}
.nav-main-icon {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
  font-size: 12px;
}
.nav-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #173927;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.nav-secondary-actions { margin-left: auto; }
.nav-more-chevron { font-size: 11px; opacity: 0.8; }
.nav-more-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  padding-top: 6px;
  border-top: 1px solid var(--border);
}
.nav-more-group {
  background: rgba(244,248,243,0.85);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 14px;
}
.nav-more-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--t4);
  font-weight: 800;
  margin-bottom: 10px;
}
.nav-more-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.nav-more-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px;
  color: var(--t2);
  text-align: left;
  min-height: 82px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.16s ease;
}
.nav-more-card:hover {
  border-color: var(--g-border);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}
.nav-more-card.on {
  background: linear-gradient(180deg, rgba(31,122,69,0.09) 0%, rgba(255,255,255,0.95) 100%);
  border-color: var(--g-border);
  box-shadow: var(--shadow-glow);
  color: var(--t1);
}
.nav-more-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav-more-card-label {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
}
.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.lang-grp {
  display: flex;
  background: var(--bg-3);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 3px;
  gap: 2px;
}
.lb {
  background: none;
  border: none;
  font-size: 11px;
  font-weight: 700;
  color: var(--t3);
  padding: 6px 10px;
  border-radius: 9px;
  transition: all 0.12s;
  letter-spacing: 0.05em;
}
.lb.on { background: #fff; color: var(--t1); box-shadow: var(--shadow-sm); }
.nav-cmp {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--t2);
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: rgba(255,255,255,0.72);
}
.nav-out {
  background: #fff;
  border: 1px solid var(--border);
  color: var(--t2);
  font-size: 12px;
  font-weight: 700;
  padding: 9px 12px;
  border-radius: 12px;
  transition: all 0.12s;
}
.nav-out:hover { border-color: var(--red-border); color: var(--red); background: var(--red-bg); }

/* ── PAGE ──────────────────────────────────────────────────────────────────── */
.pg { padding: 22px 24px 48px; max-width: 1440px; margin: 0 auto; }
@media(max-width: 768px) { .pg { padding: 14px 12px 32px; } }


@media(max-width: 1080px) {
  .nav-more-panel { grid-template-columns: 1fr; }
}
@media(max-width: 900px) {
  .nav { width: calc(100% - 16px); top: 8px; padding: 12px; border-radius: 20px; }
  .nav-topline, .nav-mainrow { flex-direction: column; align-items: stretch; }
  .nav-right { justify-content: flex-start; }
  .nav-primary-tabs { overflow-x: auto; flex-wrap: nowrap; padding-bottom: 2px; }
  .nav-main-tab { white-space: nowrap; }
}
@media(max-width: 640px) {
  .nav-context { display: none; }
  .nav-more-grid { grid-template-columns: 1fr; }
  .nav-company-pill { max-width: 100%; }
}
/* ── TOASTS ────────────────────────────────────────────────────────────────── */
.toasts {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 16px;
  border-radius: var(--r-md);
  font-size: 13px;
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  animation: toastin 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: auto;
  max-width: 320px;
  border: 1px solid var(--border-2);
}
.toast-ok  { background: #0f2a1a; color: var(--g); border-color: var(--g-border); }
.toast-err { background: #2a0f0f; color: var(--red); border-color: var(--red-border); }
.toast-info { background: #0f1a2a; color: var(--blue); border-color: var(--blue-border); }
@keyframes toastin { from { transform: translateY(12px) scale(0.95); opacity: 0; } to { transform: none; opacity: 1; } }

/* ── GRID ──────────────────────────────────────────────────────────────────── */
.g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.g3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.g4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
@media(max-width: 1100px) { .g3, .g4 { grid-template-columns: 1fr 1fr; } }
@media(max-width: 680px) { .g2, .g3, .g4 { grid-template-columns: 1fr; } }

/* ── CARDS ─────────────────────────────────────────────────────────────────── */
.card {
  background: var(--bg-1);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  padding: 20px;
  transition: border-color 0.15s;
}
.card:hover { border-color: var(--border-2); }
.card-sm { background: var(--bg-1); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 16px; }
.card-xs { background: var(--bg-2); border: 1px solid var(--border); border-radius: var(--r-md); padding: 12px; }

/* ── KPI ROW ───────────────────────────────────────────────────────────────── */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
@media(max-width: 960px) { .kpi-row { grid-template-columns: 1fr 1fr; } }
.kpi {
  background: var(--bg-1);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  padding: 18px 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.15s;
  cursor: default;
}
.kpi:hover { border-color: var(--border-2); transform: translateY(-1px); box-shadow: var(--shadow-md); }
.kpi-accent {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  border-radius: 3px 3px 0 0;
}
.kpi-lbl {
  font-size: 11px;
  font-weight: 600;
  color: var(--t3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.kpi-val {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  margin-bottom: 6px;
  font-variant-numeric: tabular-nums;
}
.kpi-sub { font-size: 12px; color: var(--t3); line-height: 1.4; }

/* ── SECTION HEADERS ───────────────────────────────────────────────────────── */
.sec-hd {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.sec-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--t1);
  letter-spacing: -0.02em;
  margin-bottom: 2px;
}
.sec-sub { font-size: 12.5px; color: var(--t3); line-height: 1.5; }
.ltag {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 600;
  color: var(--g1);
  background: var(--g-bg);
  border: 1px solid var(--g-border);
  padding: 1px 8px;
  border-radius: 20px;
  vertical-align: middle;
  margin-left: 6px;
  letter-spacing: 0.04em;
}
.ltag-red   { color: var(--red);    background: var(--red-bg);    border-color: var(--red-border); }
.ltag-blue  { color: var(--blue);   background: var(--blue-bg);   border-color: var(--blue-border); }
.ltag-amber { color: var(--amber);  background: var(--amber-bg);  border-color: var(--amber-border); }

/* ── FORMS ─────────────────────────────────────────────────────────────────── */
.fl { margin-bottom: 14px; }
.fl > label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--t3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}
.inp, .sel, .ta {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-2);
  border-radius: var(--r-md);
  font-size: 13.5px;
  color: var(--t1);
  background: var(--bg-2);
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
  line-height: 1.5;
}
.inp:focus, .sel:focus, .ta:focus {
  border-color: var(--g-border);
  box-shadow: 0 0 0 3px rgba(110,231,160,0.08);
  background: var(--bg-3);
}
.inp::placeholder, .ta::placeholder { color: var(--t4); }
.ta { resize: vertical; }
.sel {
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath fill='%235c665e' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 30px;
  color-scheme: dark;
}
.sel option { background: var(--bg-2); }
.inp-row { display: flex; gap: 10px; }
.inp-row .fl { flex: 1; }
.chk-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.chk-row input[type=checkbox] { width: 15px; height: 15px; accent-color: var(--g2); cursor: pointer; flex-shrink: 0; }
.chk-row label { font-size: 13px; font-weight: 400; color: var(--t2); cursor: pointer; }

/* ── BUTTONS ───────────────────────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--r-md);
  font-size: 13px;
  font-weight: 600;
  border: none;
  transition: all 0.12s;
  white-space: nowrap;
  line-height: 1;
  letter-spacing: -0.01em;
}
.btn-p {
  background: var(--g2);
  color: #0a1a0f;
  border: 1px solid transparent;
}
.btn-p:hover:not(:disabled) {
  background: var(--g1);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(34,197,94,0.25);
}
.btn-g {
  background: var(--bg-2);
  color: var(--t2);
  border: 1px solid var(--border-2);
}
.btn-g:hover:not(:disabled) { background: var(--bg-3); border-color: var(--border-3); color: var(--t1); }
.btn-r {
  background: var(--red-bg);
  color: var(--red);
  border: 1px solid var(--red-border);
}
.btn-r:hover:not(:disabled) { background: rgba(248,113,113,0.14); }
.btn-ai {
  background: linear-gradient(135deg, #0f2a1a, #1a4a2e);
  color: var(--g);
  border: 1px solid var(--g-border);
  box-shadow: 0 0 12px rgba(110,231,160,0.08);
}
.btn-ai:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(110,231,160,0.15); }
.btn-warn { background: var(--amber-bg); color: var(--amber); border: 1px solid var(--amber-border); }
.btn-warn:hover:not(:disabled) { background: rgba(251,191,36,0.14); }
.btn-sm { padding: 5px 11px; font-size: 12px; border-radius: var(--r-sm); }
.btn-xs { padding: 3px 8px; font-size: 11px; border-radius: 6px; }
.btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
.brow { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

/* ── CHIPS ─────────────────────────────────────────────────────────────────── */
.chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.ch { background: var(--red-bg);    color: var(--red);    border: 1px solid var(--red-border); }
.cm { background: var(--amber-bg);  color: var(--amber);  border: 1px solid var(--amber-border); }
.cl { background: var(--g-bg);      color: var(--g1);     border: 1px solid var(--g-border); }
.cu { background: var(--bg-3);      color: var(--t3);     border: 1px solid var(--border-2); }
.cb { background: var(--blue-bg);   color: var(--blue);   border: 1px solid var(--blue-border); }
.cv { background: var(--purple-bg); color: var(--purple); border: 1px solid var(--purple-border); }

/* ── ALERTS ────────────────────────────────────────────────────────────────── */
.al {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--r-md);
  font-size: 13px;
  line-height: 1.55;
  margin-bottom: 12px;
}
.al-err  { background: var(--red-bg);    border: 1px solid var(--red-border);    color: #fca5a5; }
.al-warn { background: var(--amber-bg);  border: 1px solid var(--amber-border);  color: #fcd34d; }
.al-ok   { background: var(--g-bg);      border: 1px solid var(--g-border);      color: var(--g1); }
.al-info { background: var(--bg-2);      border: 1px solid var(--border-2);      color: var(--t2); }
.al-blue { background: var(--blue-bg);   border: 1px solid var(--blue-border);   color: #93c5fd; }
.al-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }

/* ── TABLE ─────────────────────────────────────────────────────────────────── */
.tbl-wrap {
  overflow-x: auto;
  border-radius: var(--r-lg);
  border: 1px solid var(--border);
  background: var(--bg-1);
}
table { width: 100%; border-collapse: collapse; font-size: 13px; }
thead th {
  text-align: left;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--t3);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-2);
  white-space: nowrap;
}
tbody td {
  padding: 11px 16px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
  color: var(--t2);
}
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover { background: var(--bg-2); cursor: default; }
tbody tr.clickable:hover { background: var(--bg-2); cursor: pointer; }
td strong, td .mono { color: var(--t1); }

/* ── SCORE RING ────────────────────────────────────────────────────────────── */
.ring-wrap { position: relative; flex-shrink: 0; }
.ring-wrap svg { transform: rotate(-90deg); }
.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* ── RISK BAR ──────────────────────────────────────────────────────────────── */
.rb { height: 4px; border-radius: 2px; background: var(--bg-4); overflow: hidden; display: flex; }
.rs { transition: flex 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }

/* ── PARAM BAR ─────────────────────────────────────────────────────────────── */
.param-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.param-lbl { font-size: 11.5px; color: var(--t2); flex: 1; min-width: 0; }
.param-bar-wrap { width: 72px; height: 4px; border-radius: 2px; background: var(--bg-4); overflow: hidden; flex-shrink: 0; }
.param-bar-fill { height: 100%; border-radius: 2px; transition: width 0.5s; }
.param-val { font-size: 11px; font-weight: 700; width: 24px; text-align: right; flex-shrink: 0; font-variant-numeric: tabular-nums; }

/* ── PROGRESS ──────────────────────────────────────────────────────────────── */
.prog { height: 4px; border-radius: 2px; background: var(--bg-4); overflow: hidden; }
.prog-fill { height: 100%; border-radius: 2px; transition: width 0.6s; }

/* ── AI BOX ────────────────────────────────────────────────────────────────── */
.ai-box {
  display: flex;
  flex-direction: column;
  background: var(--bg-1);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  overflow: hidden;
}
.ai-hd {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-2);
}
.ai-av {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: linear-gradient(135deg, #0f2a1a, #1a4a2e);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
  border: 1px solid var(--g-border);
  box-shadow: 0 0 12px rgba(110,231,160,0.1);
}
.ai-msgs {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 360px;
  max-height: 520px;
  background: var(--bg);
}
.ai-msg { display: flex; gap: 8px; animation: toastin 0.15s ease; }
.ai-msg.u { flex-direction: row-reverse; }
.ai-bub {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13.5px;
  line-height: 1.7;
  max-width: 84%;
  white-space: pre-wrap;
}
.ai-bub.u { background: #0f2a1a; color: var(--g1); border: 1px solid var(--g-border); border-radius: 12px 12px 3px 12px; }
.ai-bub.a { background: var(--bg-2); border: 1px solid var(--border); border-radius: 12px 12px 12px 3px; color: var(--t2); }
.ai-ico { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px; border: 1px solid var(--border-2); background: var(--bg-2); font-weight: 700; color: var(--t2); }
.ai-qs { display: flex; gap: 6px; flex-wrap: wrap; padding: 10px 16px; border-top: 1px solid var(--border); background: var(--bg-1); }
.ai-q { padding: 4px 12px; border-radius: 20px; border: 1px solid var(--g-border); background: var(--g-bg); color: var(--g1); font-size: 11.5px; font-weight: 600; cursor: pointer; transition: all 0.12s; }
.ai-q:hover { background: rgba(110,231,160,0.12); }
.ai-ir { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--border); background: var(--bg-1); }
.ai-ta { flex: 1; padding: 9px 12px; border: 1px solid var(--border-2); border-radius: var(--r-md); font-size: 13px; resize: none; outline: none; transition: border-color 0.15s; line-height: 1.5; background: var(--bg-2); color: var(--t1); }
.ai-ta:focus { border-color: var(--g-border); box-shadow: 0 0 0 3px rgba(110,231,160,0.08); }
.ai-dis { font-size: 11px; color: var(--t4); text-align: center; padding: 6px 14px; border-top: 1px solid var(--border); line-height: 1.4; background: var(--bg-1); }

/* ── MODAL ─────────────────────────────────────────────────────────────────── */
.modal-bg {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(8px);
  animation: fade 0.15s ease;
}
.modal {
  background: var(--bg-1);
  border: 1px solid var(--border-2);
  border-radius: var(--r-2xl);
  padding: 28px;
  width: 100%;
  max-width: 560px;
  box-shadow: var(--shadow-lg);
  max-height: 90vh;
  overflow-y: auto;
  animation: slideup 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-lg { max-width: 720px; }
.modal-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-title { font-size: 17px; font-weight: 700; letter-spacing: -0.03em; color: var(--t1); }
.modal-close {
  background: none;
  border: 1px solid var(--border-2);
  font-size: 14px;
  color: var(--t3);
  cursor: pointer;
  line-height: 1;
  padding: 5px 8px;
  border-radius: 7px;
  transition: all 0.12s;
}
.modal-close:hover { color: var(--t1); background: var(--bg-3); }
@keyframes fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideup { from { transform: translateY(16px) scale(0.97); opacity: 0; } to { transform: none; opacity: 1; } }

/* ── MISC ──────────────────────────────────────────────────────────────────── */
.spin { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.15); border-top-color: var(--t2); border-radius: 50%; animation: rot 0.65s linear infinite; flex-shrink: 0; }
.spin-d { border-color: rgba(110,231,160,0.15); border-top-color: var(--g2); }
@keyframes rot { to { transform: rotate(360deg); } }
hr.div { border: none; border-top: 1px solid var(--border); margin: 16px 0; }
.empty { text-align: center; padding: 52px 20px; color: var(--t3); }
.empty-ic {
  width: 52px;
  height: 52px;
  border-radius: var(--r-lg);
  background: var(--bg-2);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
  font-size: 22px;
}
.empty-t { font-size: 14px; font-weight: 700; color: var(--t2); margin-bottom: 6px; letter-spacing: -0.02em; }
.empty-c { font-size: 12.5px; line-height: 1.6; max-width: 420px; margin: 0 auto; color: var(--t3); }
.empty-compact { padding: 24px 16px; }
.mono { font-family: 'DM Mono', monospace; font-size: 11.5px; letter-spacing: -0.02em; }
.badge-ok   { background: var(--g-bg);     color: var(--g1);    border: 1px solid var(--g-border);     padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-warn { background: var(--amber-bg); color: var(--amber); border: 1px solid var(--amber-border); padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-err  { background: var(--red-bg);   color: var(--red);   border: 1px solid var(--red-border);   padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.row-exp { background: var(--bg-2); border-top: 1px solid var(--border); }
.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--bg-3);
  border: 1px solid var(--border-2);
  border-radius: var(--r-sm);
  padding: 4px 10px;
  font-size: 11.5px;
  font-weight: 500;
  color: var(--t3);
}
.sec-divider {
  font-size: 10px;
  font-weight: 600;
  color: var(--t4);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 16px 0 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sec-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.score-breakdown { background: var(--bg-2); border: 1px solid var(--border); border-radius: var(--r-md); padding: 14px; margin-top: 12px; }

/* ── WORKSPACE SHELL ───────────────────────────────────────────────────────── */
.workspace-bar {
  position: relative;
  overflow: hidden;
  padding: 22px 24px;
  border: 1px solid var(--border);
  border-radius: var(--r-2xl);
  background: var(--bg-1);
  margin-bottom: 16px;
}
.workspace-bar::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(110,231,160,0.3), transparent);
}
.workspace-meta { display: flex; flex-direction: column; gap: 5px; }
.workspace-kicker { font-size: 10px; font-weight: 600; color: var(--t3); text-transform: uppercase; letter-spacing: 0.1em; }
.workspace-title { font-size: 22px; font-weight: 700; letter-spacing: -0.04em; color: var(--t1); line-height: 1.2; }
.workspace-sub { font-size: 13px; color: var(--t3); max-width: 680px; line-height: 1.6; }
.workspace-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }

/* ── KPI FOCUS CARDS ───────────────────────────────────────────────────────── */
.workspace-focus {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 0 0 16px;
}
.focus-card {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  background: var(--bg-1);
  padding: 18px;
  min-height: 168px;
  display: flex;
  flex-direction: column;
  transition: all 0.15s;
  cursor: default;
}
.focus-card::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
}
.focus-card:hover { border-color: var(--border-2); transform: translateY(-1px); box-shadow: var(--shadow-md); }
.focus-kicker {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--t3);
  margin-bottom: 8px;
}
.focus-value {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  margin-bottom: 8px;
  font-variant-numeric: tabular-nums;
  color: var(--t1);
}
.focus-chip { margin-bottom: 6px; }
.focus-copy { font-size: 12px; line-height: 1.55; color: var(--t3); flex: 1; }
.focus-action { margin-top: auto; padding-top: 12px; }

/* ── SECTION META ──────────────────────────────────────────────────────────── */
.section-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin: -2px 0 12px;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  background: var(--bg-2);
}
.section-meta-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.section-meta-title { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--t3); }
.section-meta-pill { font-size: 10px; font-weight: 600; border-radius: 999px; padding: 2px 8px; border: 1px solid var(--border-2); background: var(--bg-3); color: var(--t3); }
.section-meta-pill.is-loading { background: var(--blue-bg); border-color: var(--blue-border); color: var(--blue); }
.section-meta-pill.is-error   { background: var(--red-bg);  border-color: var(--red-border);  color: var(--red); }
.section-meta-pill.is-stale   { background: var(--amber-bg);border-color: var(--amber-border);color: var(--amber); }
.section-meta-pill.is-ok      { background: var(--g-bg);    border-color: var(--g-border);    color: var(--g1); }
.section-meta-copy { font-size: 11.5px; color: var(--t3); }

/* ── ACTION PROMPT ─────────────────────────────────────────────────────────── */
.action-prompt {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border-radius: var(--r-lg);
  padding: 14px 16px;
  margin-bottom: 14px;
}
.action-prompt-title { font-size: 13px; font-weight: 700; color: var(--t1); margin-bottom: 3px; }
.action-prompt-copy  { font-size: 12px; line-height: 1.5; color: var(--t3); }
.action-prompt-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

/* ── MODULE GUIDE ──────────────────────────────────────────────────────────── */
.module-guide { background: var(--bg-1); border: 1px solid var(--border); border-radius: var(--r-xl); padding: 18px 20px; margin-bottom: 16px; }
.module-guide-collapsed {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: var(--bg-2);
  border: 1px dashed var(--border-2);
  border-radius: var(--r-md);
  padding: 10px 12px;
  margin-bottom: 16px;
}
.module-guide-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 10px; flex-wrap: wrap; }
.module-guide-title { font-size: 14px; font-weight: 700; color: var(--t1); }
.module-guide-sub { font-size: 12.5px; color: var(--t3); max-width: 720px; }
.module-guide-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.module-guide-step { background: var(--bg-2); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 12px; display: flex; flex-direction: column; gap: 7px; min-height: 120px; }
.module-guide-step.done { background: rgba(110,231,160,0.04); border-color: var(--g-border); }
.module-guide-step-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.module-guide-step-num {
  width: 22px; height: 22px; border-radius: 999px;
  background: var(--bg-3); color: var(--t3);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
}
.module-guide-step.done .module-guide-step-num { background: rgba(110,231,160,0.2); color: var(--g1); }
.module-guide-step-status { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; color: var(--t4); }
.module-guide-step.done .module-guide-step-status { color: var(--g1); }
.module-guide-step-title { font-size: 13px; font-weight: 600; color: var(--t1); line-height: 1.35; }
.module-guide-step-copy { font-size: 12px; color: var(--t3); line-height: 1.5; }

/* ── QUICKSTART ────────────────────────────────────────────────────────────── */
.quickstart-card { background: var(--bg-1); border: 1px solid var(--border); border-radius: var(--r-xl); padding: 18px 20px; margin-bottom: 16px; }
.quickstart-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 14px; }
@media(max-width: 1100px) { .quickstart-grid { grid-template-columns: 1fr 1fr 1fr; } }
.quickstep { background: var(--bg-2); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 12px; display: flex; flex-direction: column; gap: 7px; min-height: 132px; }
.quickstep.done { background: rgba(110,231,160,0.04); border-color: var(--g-border); }
.quickstep-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.quickstep-num { width: 22px; height: 22px; border-radius: 999px; background: var(--bg-3); color: var(--t3); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
.quickstep.done .quickstep-num { background: rgba(110,231,160,0.2); color: var(--g1); }
.quickstep-status { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; color: var(--t4); }
.quickstep.done .quickstep-status { color: var(--g1); }
.quickstep-title { font-size: 13px; font-weight: 600; color: var(--t1); line-height: 1.3; }
.quickstep-copy { font-size: 12px; color: var(--t3); line-height: 1.5; flex: 1; }
.quickstart-progress { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.quickstart-progress .prog { flex: 1; min-width: 160px; height: 5px; }
.quickstart-progress-note { font-size: 12px; color: var(--t3); }

/* ── MODULE LAUNCHPAD ──────────────────────────────────────────────────────── */
.module-launchpad { margin-bottom: 16px; }
.module-launchpad-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.module-launchpad-card { border: 1px solid var(--border); border-radius: var(--r-xl); padding: 16px; display: flex; flex-direction: column; gap: 8px; background: var(--bg-1); transition: all 0.15s; }
.module-launchpad-card:hover { border-color: var(--border-2); background: var(--bg-2); }
.module-launchpad-status { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
.module-launchpad-title  { font-size: 14px; font-weight: 700; color: var(--t1); }
.module-launchpad-copy   { font-size: 12.5px; color: var(--t3); line-height: 1.5; flex: 1; }
@media(max-width: 960px)  { .module-guide-grid, .module-launchpad-grid { grid-template-columns: 1fr; } }

/* ── APPROVAL ──────────────────────────────────────────────────────────────── */
.approval-aging-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.approval-aging-card { border: 1px solid var(--border); border-radius: var(--r-lg); padding: 12px; background: var(--bg-2); }
.approval-aging-label { font-size: 10px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--t3); margin-bottom: 6px; }
.approval-aging-value { font-size: 20px; font-weight: 700; color: var(--t1); line-height: 1.1; letter-spacing: -0.03em; }
@media(max-width: 900px)  { .approval-aging-grid { grid-template-columns: 1fr 1fr; } }
@media(max-width: 600px)  { .approval-aging-grid { grid-template-columns: 1fr; } }

/* ── RESPONSIVE BREAKPOINTS ────────────────────────────────────────────────── */
@media(max-width: 1180px) {
  .workspace-focus { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .pg { padding: 18px 18px 36px; }
}
@media(max-width: 760px) {
  .workspace-focus { grid-template-columns: 1fr; }
  .workspace-bar { padding: 16px; }
  .workspace-title { font-size: 20px; }
  .pg { padding: 14px 12px 28px; }
}
`;

export const WORKSPACE_STAGE_V52_CSS = ``;
export const WORKSPACE_STAGE_V57_CSS = ``;
