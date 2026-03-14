"use client";
import { useState, useEffect, useRef } from "react";

// ─── Styles ──────────────────────────────────────────────────────────────────
const css = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  body,html{font-family:'DM Sans',system-ui,sans-serif;background:#0b1209;color:#fff;overflow-x:hidden}

  /* ── Layout ── */
  .demo-shell{display:grid;grid-template-rows:56px 1fr;min-height:100vh}
  .demo-topbar{display:flex;align-items:center;justify-content:space-between;padding:0 24px;background:rgba(11,18,9,.9);border-bottom:1px solid rgba(255,255,255,.08);backdrop-filter:blur(12px);position:sticky;top:0;z-index:50}
  .demo-logo{font-size:16px;font-weight:800;color:#fff;text-decoration:none}
  .demo-logo em{font-style:normal;color:rgba(255,255,255,.35)}
  .demo-topbar-r{display:flex;align-items:center;gap:12px}
  .demo-pill{font-size:11px;font-weight:700;color:#4ade80;background:rgba(74,222,128,.12);border:1px solid rgba(74,222,128,.25);padding:4px 10px;border-radius:99px;letter-spacing:.3px}
  .demo-cta{background:#1B3D2B;color:#fff;border:none;border-radius:8px;padding:8px 18px;font-size:13px;font-weight:700;cursor:pointer;text-decoration:none;transition:background .2s}
  .demo-cta:hover{background:#2d5c3f}

  /* ── Main area ── */
  .demo-body{display:grid;grid-template-columns:260px 1fr;overflow:hidden;height:calc(100vh - 56px)}

  /* ── Sidebar: step list ── */
  .demo-sidebar{background:rgba(255,255,255,.025);border-right:1px solid rgba(255,255,255,.07);padding:20px 0;overflow-y:auto}
  .demo-sidebar-h{font-size:10px;font-weight:800;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:1.2px;padding:0 20px;margin-bottom:12px}
  .demo-step-btn{display:flex;align-items:center;gap:12px;width:100%;padding:10px 20px;background:none;border:none;cursor:pointer;text-align:left;transition:background .15s;position:relative}
  .demo-step-btn:hover{background:rgba(255,255,255,.04)}
  .demo-step-btn.active{background:rgba(27,61,43,.3)}
  .demo-step-btn.active::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:#4ade80;border-radius:0 2px 2px 0}
  .demo-step-num{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0;background:rgba(255,255,255,.08);color:rgba(255,255,255,.4);transition:all .2s}
  .active .demo-step-num{background:#1B3D2B;color:#4ade80}
  .done .demo-step-num{background:rgba(74,222,128,.15);color:#4ade80}
  .demo-step-info{min-width:0}
  .demo-step-title{font-size:13px;font-weight:700;color:rgba(255,255,255,.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color .15s}
  .active .demo-step-title{color:#fff}
  .demo-step-sub{font-size:11px;color:rgba(255,255,255,.3);margin-top:1px}
  .demo-step-check{margin-left:auto;color:#4ade80;font-size:14px;flex-shrink:0;opacity:0;transition:opacity .2s}
  .done .demo-step-check{opacity:1}

  /* ── Progress bar ── */
  .demo-progress{height:2px;background:rgba(255,255,255,.08);position:relative;overflow:hidden}
  .demo-progress-fill{height:100%;background:linear-gradient(90deg,#1B3D2B,#4ade80);transition:width .6s cubic-bezier(.4,0,.2,1)}

  /* ── Screen viewer ── */
  .demo-content{display:flex;flex-direction:column;overflow:hidden}
  .demo-screen-wrap{flex:1;overflow:hidden;position:relative;background:#0f1a0d}
  .demo-screen{position:absolute;inset:0;transition:opacity .4s,transform .4s;opacity:0;transform:translateY(12px);pointer-events:none;overflow:hidden}
  .demo-screen.visible{opacity:1;transform:translateY(0);pointer-events:auto}

  /* ── Browser chrome ── */
  .browser{display:flex;flex-direction:column;height:100%}
  .browser-bar{display:flex;align-items:center;gap:8px;padding:10px 16px;background:#1a2018;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0}
  .browser-dots{display:flex;gap:5px}
  .browser-dot{width:10px;height:10px;border-radius:50%}
  .browser-url{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:6px;padding:4px 12px;font-size:11.5px;color:rgba(255,255,255,.4);font-family:monospace;display:flex;align-items:center;gap:6px}
  .browser-url-lock{color:#4ade80;font-size:11px}
  .browser-body{flex:1;overflow:hidden;position:relative}

  /* ── Fake app chrome ── */
  .app-shell{display:grid;grid-template-columns:200px 1fr;height:100%;background:#f4f5f4}
  .app-nav{background:#1B3D2B;display:flex;flex-direction:column;overflow:hidden}
  .app-nav-logo{padding:18px 16px 14px;border-bottom:1px solid rgba(255,255,255,.1)}
  .app-nav-logo-t{font-size:15px;font-weight:800;color:#fff}
  .app-nav-logo-t em{font-style:normal;color:rgba(255,255,255,.4)}
  .app-nav-links{padding:12px 8px;display:flex;flex-direction:column;gap:2px;flex:1}
  .app-nav-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;font-size:12.5px;font-weight:600;color:rgba(255,255,255,.55);cursor:pointer;transition:all .15s}
  .app-nav-item.on{background:rgba(255,255,255,.12);color:#fff}
  .app-nav-item-dot{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.6}
  .app-main{overflow:hidden;display:flex;flex-direction:column}
  .app-header{padding:16px 24px;border-bottom:1.5px solid #e8eae8;background:#fff;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
  .app-header-h{font-size:17px;font-weight:800;color:#0b0f0c;letter-spacing:-.3px}
  .app-content{flex:1;overflow-y:auto;padding:20px 24px;display:flex;flex-direction:column;gap:14px}

  /* ── Cards ── */
  .card{background:#fff;border:1.5px solid #e8eae8;border-radius:16px;padding:18px}
  .card-h{font-size:13px;font-weight:800;color:#0b0f0c;letter-spacing:-.2px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between}
  .card-tag{font-size:10.5px;font-weight:700;color:#1B3D2B;background:#f0f5f1;border:1px solid #d1e7d9;padding:2px 8px;border-radius:5px}
  .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
  .stat{background:#fff;border:1.5px solid #e8eae8;border-radius:12px;padding:14px}
  .stat-n{font-size:26px;font-weight:800;color:#0b0f0c;letter-spacing:-.5px;margin-bottom:2px}
  .stat-l{font-size:11px;color:#9CA3AF;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
  .stat-green .stat-n{color:#16A34A}
  .stat-red .stat-n{color:#DC2626}
  .stat-amber .stat-n{color:#D97706}
  .badge{display:inline-flex;padding:3px 9px;border-radius:6px;font-size:11px;font-weight:700}
  .badge-h{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA}
  .badge-m{background:#FFFBEB;color:#D97706;border:1px solid #FDE68A}
  .badge-l{background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0}
  .badge-i{background:#EFF6FF;color:#2563EB;border:1px solid #BFDBFE}
  .row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1.5px solid #F3F4F6}
  .row:last-child{border-bottom:none}
  .row-main{flex:1;min-width:0}
  .row-name{font-size:13px;font-weight:700;color:#0b0f0c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .row-sub{font-size:11.5px;color:#9CA3AF;margin-top:1px}
  .score-ring{width:80px;height:80px;position:relative;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .score-ring svg{position:absolute;inset:0;transform:rotate(-90deg)}
  .score-ring-n{font-size:20px;font-weight:800;color:#16A34A;line-height:1}
  .score-ring-l{font-size:9px;color:#9CA3AF;font-weight:700;margin-top:2px}
  .bar{height:6px;background:#F3F4F6;border-radius:3px;overflow:hidden}
  .bar-fill{height:100%;border-radius:3px;transition:width .8s ease}
  .green-fill{background:#22c55e}
  .amber-fill{background:#f59e0b}
  .red-fill{background:#ef4444}
  .checklist{display:flex;flex-direction:column;gap:8px}
  .check-item{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;background:#F9FAFB;font-size:12.5px;font-weight:600;color:#374151}
  .check-item.ok{background:#F0FDF4;color:#16A34A}
  .check-item.warn{background:#FFFBEB;color:#D97706}
  .check-item.err{background:#FEF2F2;color:#DC2626}
  .check-dot{width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0}
  .ok .check-dot{background:#16A34A;color:#fff}
  .warn .check-dot{background:#D97706;color:#fff}
  .err .check-dot{background:#DC2626;color:#fff}
  .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;border:none;transition:all .2s}
  .btn-g{background:#1B3D2B;color:#fff}
  .btn-s{background:#F3F4F6;color:#374151}

  /* ── Form styles ── */
  .form-card{background:#fff;border:1.5px solid #e8eae8;border-radius:16px;padding:28px;max-width:400px;margin:20px auto}
  .form-h{font-size:22px;font-weight:800;color:#0b0f0c;margin-bottom:6px;letter-spacing:-.3px}
  .form-s{font-size:13.5px;color:#6b7280;margin-bottom:22px;line-height:1.5}
  .form-field{margin-bottom:14px}
  .form-label{font-size:11px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.7px;display:block;margin-bottom:6px}
  .form-input{width:100%;padding:11px 14px;border:1.5px solid #e8eae8;border-radius:10px;font-size:14px;color:#0b0f0c;background:#f9fafb}
  .form-submit{width:100%;padding:13px;background:#1B3D2B;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;margin-top:4px;display:flex;align-items:center;justify-content:center;gap:8px}
  .otp-row{display:flex;gap:8px;justify-content:center;margin:4px 0 18px}
  .otp-box{width:48px;height:58px;border:1.5px solid #e8eae8;border-radius:10px;font-size:26px;font-weight:800;text-align:center;font-family:monospace;background:#f9fafb}
  .otp-box.filled{border-color:#1B3D2B;background:#f0f5f1;color:#1B3D2B}

  /* ── Bottom controls ── */
  .demo-controls{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;background:#0f1a0d;border-top:1px solid rgba(255,255,255,.07);flex-shrink:0}
  .demo-ctrl-btn{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.7);font-size:13px;font-weight:700;padding:8px 16px;border-radius:8px;cursor:pointer;transition:all .2s}
  .demo-ctrl-btn:hover{background:rgba(255,255,255,.1);color:#fff}
  .demo-ctrl-btn:disabled{opacity:.25;cursor:not-allowed}
  .demo-ctrl-btn.primary{background:#1B3D2B;border-color:#1B3D2B;color:#fff}
  .demo-ctrl-btn.primary:hover{background:#2d5c3f}
  .demo-ctrl-center{display:flex;flex-direction:column;align-items:center;gap:8px}
  .demo-dots{display:flex;gap:5px}
  .demo-dot{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.15);cursor:pointer;transition:all .3s}
  .demo-dot.on{background:#4ade80;width:18px;border-radius:4px}
  .demo-play-btn{display:flex;align-items:center;gap:5px;background:rgba(74,222,128,.12);border:1px solid rgba(74,222,128,.25);color:#4ade80;font-size:11.5px;font-weight:700;padding:5px 12px;border-radius:99px;cursor:pointer;transition:all .2s}
  .demo-play-btn:hover{background:rgba(74,222,128,.2)}
  .timer-bar{width:200px;height:2px;background:rgba(255,255,255,.08);border-radius:1px;overflow:hidden}
  .timer-fill{height:100%;background:#4ade80;transition:width linear}

  @media(max-width:900px){.demo-body{grid-template-columns:1fr}.demo-sidebar{display:none}}
`;

// ─── Screen components ────────────────────────────────────────────────────────

function RegisterScreen() {
  return (
    <div className="browser" style={{ background: "#f4f5f4" }}>
      <div className="browser-bar">
        <div className="browser-dots">
          <div className="browser-dot" style={{ background: "#ef4444" }} />
          <div className="browser-dot" style={{ background: "#f59e0b" }} />
          <div className="browser-dot" style={{ background: "#22c55e" }} />
        </div>
        <div className="browser-url"><span className="browser-url-lock">🔒</span>lksgcompass.de/register</div>
      </div>
      <div className="browser-body" style={{ overflow: "auto", background: "#f4f5f4" }}>
        <div className="form-card">
          <div className="form-h">Account erstellen</div>
          <div className="form-s">Compliance-Workspace in 60 Sekunden einrichten.</div>
          <div className="form-field">
            <label className="form-label">Unternehmensname</label>
            <div className="form-input" style={{ color: "#0b0f0c" }}>Muster Automotive GmbH</div>
          </div>
          <div className="form-field">
            <label className="form-label">Geschäftliche E-Mail</label>
            <div className="form-input" style={{ color: "#0b0f0c" }}>max@muster-auto.de</div>
          </div>
          <div className="form-field">
            <label className="form-label">Passwort</label>
            <div className="form-input" style={{ color: "#9ca3af" }}>••••••••••••</div>
          </div>
          <div className="form-submit">Konto erstellen →</div>
          <div style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginTop: 12 }}>✓ 14 Tage kostenlos · Keine Kreditkarte erforderlich</div>
        </div>
      </div>
    </div>
  );
}

function OtpScreen() {
  return (
    <div className="browser" style={{ background: "#f4f5f4" }}>
      <div className="browser-bar">
        <div className="browser-dots"><div className="browser-dot" style={{ background: "#ef4444" }} /><div className="browser-dot" style={{ background: "#f59e0b" }} /><div className="browser-dot" style={{ background: "#22c55e" }} /></div>
        <div className="browser-url"><span className="browser-url-lock">🔒</span>lksgcompass.de/register</div>
      </div>
      <div className="browser-body" style={{ overflow: "auto", background: "#f4f5f4" }}>
        <div className="form-card">
          <div className="form-h">E-Mail bestätigen</div>
          <div className="form-s">Wir haben einen Code an <strong>max@muster-auto.de</strong> gesendet.</div>
          <div style={{ background: "#f0f5f1", border: "1px solid #d1e7d9", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#1B3D2B", marginBottom: 18 }}>
            <strong>Code gesendet ✓</strong><br /><span style={{ fontSize: 12, opacity: .8 }}>Bitte prüfen Sie Ihr E-Mail-Postfach.</span>
          </div>
          <div className="otp-row">
            {["4","7","3","1","9","2"].map((d, i) => (
              <div key={i} className={`otp-box${i < 4 ? " filled" : ""}`}>{i < 4 ? d : ""}</div>
            ))}
          </div>
          <div className="form-submit" style={{ opacity: .5 }}>Code bestätigen</div>
        </div>
      </div>
    </div>
  );
}

function DashboardScreen() {
  return (
    <div className="browser">
      <div className="browser-bar">
        <div className="browser-dots"><div className="browser-dot" style={{ background: "#ef4444" }} /><div className="browser-dot" style={{ background: "#f59e0b" }} /><div className="browser-dot" style={{ background: "#22c55e" }} /></div>
        <div className="browser-url"><span className="browser-url-lock">🔒</span>lksgcompass.de/app/dashboard</div>
      </div>
      <div className="browser-body">
        <div className="app-shell">
          <AppNav active="dashboard" />
          <div className="app-main">
            <div className="app-header">
              <div className="app-header-h">Dashboard</div>
              <div style={{ display: "flex", gap: 8 }}>
                <div className="btn btn-s" style={{ fontSize: 12, padding: "6px 12px" }}>↻ Aktualisieren</div>
                <div className="btn btn-g" style={{ fontSize: 12, padding: "6px 12px" }}>+ Lieferant</div>
              </div>
            </div>
            <div className="app-content">
              <div className="stats-row">
                <div className="stat stat-green"><div className="stat-n">72</div><div className="stat-l">Compliance Score</div></div>
                <div className="stat"><div className="stat-n">5</div><div className="stat-l">Lieferanten</div></div>
                <div className="stat stat-red"><div className="stat-n">2</div><div className="stat-l">Offene CAPs</div></div>
                <div className="stat stat-amber"><div className="stat-n">1</div><div className="stat-l">Beschwerden</div></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="card">
                  <div className="card-h">Risiko-Portfolio <span className="card-tag">§5 LkSG</span></div>
                  {[["Hoch", "1 Lieferant", "h", 20], ["Mittel", "2 Lieferanten", "m", 40], ["Niedrig", "2 Lieferanten", "l", 40]].map(([l, s, t, p]) => (
                    <div key={String(l)} className="row">
                      <div className="row-main"><div className="row-name">{String(l)}</div><div className="row-sub">{String(s)}</div></div>
                      <span className={`badge badge-${t}`}>{String(p)}%</span>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="card-h">BAFA-Readiness</div>
                  <div className="checklist">
                    {[["ok","§4 Menschenrechtsbeauftragter ✓"], ["ok","§5 Risikoanalyse abgeschlossen ✓"], ["warn","§6 CAPs: 2 ausstehend"], ["err","§8 Beschwerdebeauftragter fehlt"]].map(([t, label]) => (
                      <div key={String(label)} className={`check-item ${t}`}>
                        <div className="check-dot">{t === "ok" ? "✓" : t === "warn" ? "!" : "✕"}</div>
                        {String(label)}
                      </div>
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

function SuppliersScreen() {
  return (
    <div className="browser">
      <div className="browser-bar">
        <div className="browser-dots"><div className="browser-dot" style={{ background: "#ef4444" }} /><div className="browser-dot" style={{ background: "#f59e0b" }} /><div className="browser-dot" style={{ background: "#22c55e" }} /></div>
        <div className="browser-url"><span className="browser-url-lock">🔒</span>lksgcompass.de/app/suppliers</div>
      </div>
      <div className="browser-body">
        <div className="app-shell">
          <AppNav active="suppliers" />
          <div className="app-main">
            <div className="app-header">
              <div className="app-header-h">Lieferanten <span style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600 }}>5 gesamt</span></div>
              <div style={{ display: "flex", gap: 8 }}>
                <div className="btn btn-s" style={{ fontSize: 12, padding: "6px 12px" }}>Excel importieren</div>
                <div className="btn btn-g" style={{ fontSize: 12, padding: "6px 12px" }}>+ Lieferant</div>
              </div>
            </div>
            <div className="app-content">
              <div className="card">
                <div className="card-h">Alle Lieferanten <span className="card-tag">§5 Risikoanalyse</span></div>
                {[
                  { name: "Shenzhen Parts Co.", country: "🇨🇳 China", industry: "Elektronik", score: 78, risk: "h" },
                  { name: "Ankara Tekstil A.Ş.", country: "🇹🇷 Türkei", industry: "Textil", score: 52, risk: "m" },
                  { name: "Hanoi Electro Ltd.", country: "🇻🇳 Vietnam", industry: "Elektronik", score: 61, risk: "m" },
                  { name: "Schmidt Logistik", country: "🇩🇪 Deutschland", industry: "Logistik", score: 18, risk: "l" },
                  { name: "Warsaw Auto Parts", country: "🇵🇱 Polen", industry: "Automotive", score: 24, risk: "l" },
                ].map((s) => (
                  <div key={s.name} className="row">
                    <div className="row-main">
                      <div className="row-name">{s.name}</div>
                      <div className="row-sub">{s.country} · {s.industry}</div>
                    </div>
                    <div className="bar" style={{ width: 80, marginRight: 10 }}>
                      <div className={`bar-fill ${s.risk === "h" ? "red-fill" : s.risk === "m" ? "amber-fill" : "green-fill"}`} style={{ width: `${s.score}%` }} />
                    </div>
                    <span className={`badge badge-${s.risk}`}>{s.risk === "h" ? "Hoch" : s.risk === "m" ? "Mittel" : "Niedrig"}</span>
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

function ComplaintsScreen() {
  return (
    <div className="browser">
      <div className="browser-bar">
        <div className="browser-dots"><div className="browser-dot" style={{ background: "#ef4444" }} /><div className="browser-dot" style={{ background: "#f59e0b" }} /><div className="browser-dot" style={{ background: "#22c55e" }} /></div>
        <div className="browser-url"><span className="browser-url-lock">🔒</span>lksgcompass.de/app/complaints</div>
      </div>
      <div className="browser-body">
        <div className="app-shell">
          <AppNav active="complaints" />
          <div className="app-main">
            <div className="app-header">
              <div className="app-header-h">Beschwerden <span style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600 }}>3 gesamt</span></div>
              <div className="btn btn-s" style={{ fontSize: 12, padding: "6px 12px" }}>Portal-Link kopieren</div>
            </div>
            <div className="app-content">
              <div className="card" style={{ borderColor: "#FECACA", background: "#FFF5F5" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#DC2626", marginBottom: 4 }}>⚠ NEUE BESCHWERDE — Kritisch</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0b0f0c" }}>Kinderarbeit bei Tier-2 Lieferant</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Shenzhen Parts Co. · §2 Abs.2 Nr.1 LkSG · REF: BSWD-3A1B-X7</div>
                  </div>
                  <span className="badge badge-h">Kritisch</span>
                </div>
                <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6, padding: "10px 14px", background: "#fff", borderRadius: 8, border: "1px solid #FECACA" }}>
                  "Bei einer Vor-Ort-Begehung wurden Minderjährige unter 15 Jahren in der Produktion angetroffen..."
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <div className="btn btn-g" style={{ fontSize: 12, padding: "6px 12px" }}>CAP erstellen</div>
                  <div className="btn btn-s" style={{ fontSize: 12, padding: "6px 12px" }}>Status ändern</div>
                </div>
              </div>
              {[
                { ref: "BSWD-2C4D", cat: "Umweltverstoss", status: "In Prüfung", sev: "m" },
                { ref: "BSWD-5E6F", cat: "Diskriminierung", status: "Gelöst ✓", sev: "l" },
              ].map(c => (
                <div key={c.ref} className="card" style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 11, fontFamily: "monospace", color: "#9CA3AF", marginBottom: 3 }}>{c.ref}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0b0f0c" }}>{c.cat}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className={`badge badge-${c.sev}`}>{c.status}</span>
                    </div>
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

function ActionsScreen() {
  return (
    <div className="browser">
      <div className="browser-bar">
        <div className="browser-dots"><div className="browser-dot" style={{ background: "#ef4444" }} /><div className="browser-dot" style={{ background: "#f59e0b" }} /><div className="browser-dot" style={{ background: "#22c55e" }} /></div>
        <div className="browser-url"><span className="browser-url-lock">🔒</span>lksgcompass.de/app/actions</div>
      </div>
      <div className="browser-body">
        <div className="app-shell">
          <AppNav active="actions" />
          <div className="app-main">
            <div className="app-header">
              <div className="app-header-h">Maßnahmenplan <span style={{ fontSize: 13, color: "#DC2626", fontWeight: 700 }}>2 überfällig</span></div>
              <div className="btn btn-g" style={{ fontSize: 12, padding: "6px 12px" }}>+ CAP erstellen</div>
            </div>
            <div className="app-content">
              <div className="card" style={{ borderColor: "#FECACA", background: "#FFF9F9" }}>
                <div style={{ fontSize: 11, color: "#DC2626", fontWeight: 800, marginBottom: 6 }}>⏰ ÜBERFÄLLIG — seit 3 Tagen</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0b0f0c", marginBottom: 4 }}>Code of Conduct unterzeichnen lassen</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>Shenzhen Parts Co. · §6 Abs.2 LkSG · Zugewiesen: M. Weber</div>
                    <div className="bar" style={{ width: 140, marginTop: 8 }}>
                      <div className="bar-fill amber-fill" style={{ width: "35%" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}>35% abgeschlossen</div>
                  </div>
                  <span className="badge badge-h">Kritisch</span>
                </div>
              </div>
              {[
                { title: "Audit-Bericht anfordern", sup: "Ankara Tekstil A.Ş.", para: "§6 Abs.4", due: "15.04.2025", prog: 60, pri: "m" },
                { title: "SAQ an Lieferanten senden", sup: "Hanoi Electro Ltd.", para: "§6 Abs.3", due: "30.04.2025", prog: 0, pri: "l" },
              ].map(a => (
                <div key={a.title} className="card" style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0b0f0c", marginBottom: 3 }}>{a.title}</div>
                      <div style={{ fontSize: 11.5, color: "#6b7280" }}>{a.sup} · {a.para} · Fällig: {a.due}</div>
                      <div className="bar" style={{ width: 120, marginTop: 8 }}>
                        <div className={`bar-fill ${a.prog > 50 ? "green-fill" : "amber-fill"}`} style={{ width: `${a.prog}%` }} />
                      </div>
                    </div>
                    <span className={`badge badge-${a.pri}`} style={{ marginLeft: 12 }}>{a.pri === "m" ? "Hoch" : "Mittel"}</span>
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

function KpiScreen() {
  return (
    <div className="browser">
      <div className="browser-bar">
        <div className="browser-dots"><div className="browser-dot" style={{ background: "#ef4444" }} /><div className="browser-dot" style={{ background: "#f59e0b" }} /><div className="browser-dot" style={{ background: "#22c55e" }} /></div>
        <div className="browser-url"><span className="browser-url-lock">🔒</span>lksgcompass.de/app/kpi</div>
      </div>
      <div className="browser-body">
        <div className="app-shell">
          <AppNav active="kpi" />
          <div className="app-main">
            <div className="app-header">
              <div className="app-header-h">KPIs & Wirksamkeit <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>§9 LkSG</span></div>
              <div className="btn btn-g" style={{ fontSize: 12, padding: "6px 12px" }}>Snapshot speichern</div>
            </div>
            <div className="app-content">
              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 14 }}>
                <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "relative", width: 100, height: 100, marginBottom: 8 }}>
                    <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#F3F4F6" strokeWidth="8" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="8" strokeDasharray={`${72 * 2.51} ${100 * 2.51}`} strokeLinecap="round" />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "#16A34A", lineHeight: 1 }}>72</div>
                      <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700 }}>Grade B</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", textAlign: "center", lineHeight: 1.4 }}>Compliance-Score<br/><span style={{ color: "#D97706", fontWeight: 700 }}>↑ +5 vs Vormonat</span></div>
                </div>
                <div className="card">
                  <div className="card-h">Wirksamkeits-Indikatoren</div>
                  {[
                    { label: "Audit-Abdeckung", val: 60, color: "amber-fill" },
                    { label: "CoC-Abdeckung", val: 80, color: "green-fill" },
                    { label: "CAP-Abschlussrate", val: 50, color: "amber-fill" },
                    { label: "SAQ-Rücklaufquote", val: 33, color: "red-fill" },
                  ].map(k => (
                    <div key={k.label} className="row">
                      <div className="row-main"><div className="row-name" style={{ fontSize: 12.5 }}>{k.label}</div></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="bar" style={{ width: 80 }}><div className={`bar-fill ${k.color}`} style={{ width: `${k.val}%` }} /></div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", width: 32, textAlign: "right" }}>{k.val}%</div>
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

function ReportsScreen() {
  return (
    <div className="browser">
      <div className="browser-bar">
        <div className="browser-dots"><div className="browser-dot" style={{ background: "#ef4444" }} /><div className="browser-dot" style={{ background: "#f59e0b" }} /><div className="browser-dot" style={{ background: "#22c55e" }} /></div>
        <div className="browser-url"><span className="browser-url-lock">🔒</span>lksgcompass.de/app/reports</div>
      </div>
      <div className="browser-body">
        <div className="app-shell">
          <AppNav active="reports" />
          <div className="app-main">
            <div className="app-header">
              <div className="app-header-h">BAFA-Bericht 2024</div>
              <div style={{ display: "flex", gap: 8 }}>
                <div className="btn btn-s" style={{ fontSize: 12, padding: "6px 12px" }}>KI-Entwurf</div>
                <div className="btn btn-g" style={{ fontSize: 12, padding: "6px 12px" }}>PDF exportieren</div>
              </div>
            </div>
            <div className="app-content">
              <div className="card" style={{ borderColor: "#BBF7D0", background: "#F0FDF4" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0b0f0c" }}>Bericht genehmigt ✓</div>
                  <span className="badge badge-l">Eingereicht 12.03.2025</span>
                </div>
                <div style={{ fontSize: 12, color: "#374151" }}>BAFA Berichtsjahr 2024 · Muster Automotive GmbH · §9 LkSG</div>
              </div>
              <div className="card">
                <div className="card-h">Berichtsinhalt</div>
                {["§5 Risikoanalyse", "§6 Präventionsmaßnahmen", "§7 Abhilfemaßnahmen", "§8 Beschwerdemechanismus", "§9 Wirksamkeitskontrolle", "§10 Dokumentation"].map((s, i) => (
                  <div key={s} className="row">
                    <div className="row-main"><div className="row-name" style={{ fontSize: 12.5 }}>{s}</div></div>
                    <span className={`badge ${i < 4 ? "badge-l" : i === 4 ? "badge-m" : "badge-i"}`}>{i < 4 ? "✓ Vollständig" : i === 4 ? "In Bearbeitung" : "Offen"}</span>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="card-h">KI-Entwurf <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600 }}>Claude AI</span></div>
                <div style={{ fontSize: 12.5, color: "#374151", lineHeight: 1.7, padding: "12px 14px", background: "#F9FAFB", borderRadius: 8, border: "1px solid #E5E7EB" }}>
                  "Die Muster Automotive GmbH hat gemäß §5 LkSG eine anlassbezogene Risikoanalyse für 5 direkte Lieferanten durchgeführt. Ein Lieferant (Shenzhen Parts Co., China) wurde als hochriskant eingestuft und ein Corrective Action Plan initiiert..."
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamScreen() {
  return (
    <div className="browser">
      <div className="browser-bar">
        <div className="browser-dots"><div className="browser-dot" style={{ background: "#ef4444" }} /><div className="browser-dot" style={{ background: "#f59e0b" }} /><div className="browser-dot" style={{ background: "#22c55e" }} /></div>
        <div className="browser-url"><span className="browser-url-lock">🔒</span>lksgcompass.de/app/settings</div>
      </div>
      <div className="browser-body">
        <div className="app-shell">
          <AppNav active="settings" />
          <div className="app-main">
            <div className="app-header"><div className="app-header-h">Einstellungen</div></div>
            <div className="app-content">
              <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                {["Unternehmen","Team","Billing","Legal"].map((t, i) => (
                  <div key={t} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700, background: i === 1 ? "#1B3D2B" : "transparent", color: i === 1 ? "#fff" : "#6b7280", cursor: "pointer" }}>{t}</div>
                ))}
              </div>
              <div className="card">
                <div className="card-h">Mitglied einladen</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div className="form-input" style={{ flex: 1, padding: "9px 12px", fontSize: 13, color: "#9ca3af" }}>kollegin@muster-auto.de</div>
                  <select style={{ padding: "9px 10px", borderRadius: 8, border: "1.5px solid #e8eae8", fontSize: 13, color: "#374151", background: "#fff" }}><option>Member</option></select>
                  <div className="btn btn-g" style={{ fontSize: 12, padding: "9px 14px", whiteSpace: "nowrap" }}>Einladen</div>
                </div>
              </div>
              <div className="card">
                <div className="card-h">Team <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600 }}>3 Mitglieder</span></div>
                {[
                  { email: "max@muster-auto.de", role: "Admin", status: "l", active: true },
                  { email: "anna@muster-auto.de", role: "Member", status: "l", active: true },
                  { email: "jo@extern.de", role: "Viewer", status: "m", active: false },
                ].map(m => (
                  <div key={m.email} className="row">
                    <div className="row-main">
                      <div className="row-name" style={{ fontSize: 13 }}>{m.email}</div>
                      <div className="row-sub">{m.role}</div>
                    </div>
                    <span className={`badge badge-${m.status}`}>{m.active ? "Aktiv" : "Eingeladen"}</span>
                  </div>
                ))}
              </div>
              <div className="card" style={{ background: "linear-gradient(135deg,#1B3D2B,#2d6348)", color: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div><div style={{ fontSize: 14, fontWeight: 800 }}>Pro Plan</div><div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", marginTop: 2 }}>€149/mo · bis zu 5 Nutzer · 14 Tage Trial</div></div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ background: "rgba(74,222,128,.2)", border: "1px solid rgba(74,222,128,.4)", color: "#4ade80", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6 }}>Aktiv</div>
                    <div style={{ background: "rgba(255,255,255,.1)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, cursor: "pointer" }}>Verwalten</div>
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

function AppNav({ active }: { active: string }) {
  const items = [
    { id: "dashboard", label: "Dashboard" },
    { id: "suppliers", label: "Lieferanten" },
    { id: "complaints", label: "Beschwerden" },
    { id: "actions", label: "Maßnahmen" },
    { id: "kpi", label: "KPIs" },
    { id: "reports", label: "BAFA-Bericht" },
    { id: "settings", label: "Einstellungen" },
  ];
  return (
    <div className="app-nav">
      <div className="app-nav-logo"><div className="app-nav-logo-t">LkSG<em>Compass</em></div></div>
      <div className="app-nav-links">
        {items.map(i => (
          <div key={i.id} className={`app-nav-item${i.id === active ? " on" : ""}`}>
            <div className="app-nav-item-dot" />
            {i.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step definitions ────────────────────────────────────────────────────────
const STEPS = [
  { id: "register", title: "Registrierung", sub: "Account erstellen", law: "§4 LkSG", screen: RegisterScreen },
  { id: "otp", title: "E-Mail Verifikation", sub: "OTP bestätigen", law: "Sicherheit", screen: OtpScreen },
  { id: "dashboard", title: "Dashboard", sub: "Compliance-Übersicht", law: "§9 LkSG", screen: DashboardScreen },
  { id: "suppliers", title: "Lieferanten", sub: "Risikobewertung", law: "§5 LkSG", screen: SuppliersScreen },
  { id: "complaints", title: "Beschwerden", sub: "Whistleblowing", law: "§8 LkSG", screen: ComplaintsScreen },
  { id: "actions", title: "Maßnahmenplan", sub: "CAP-Tracking", law: "§6 LkSG", screen: ActionsScreen },
  { id: "kpi", title: "KPIs", sub: "Wirksamkeitskontrolle", law: "§9 LkSG", screen: KpiScreen },
  { id: "reports", title: "BAFA-Bericht", sub: "Berichterstattung", law: "§9 LkSG", screen: ReportsScreen },
  { id: "team", title: "Team & Billing", sub: "Multi-User", law: "Pro Plan", screen: TeamScreen },
];

const STEP_DURATION = 6000; // ms per step

// ─── Demo page ───────────────────────────────────────────────────────────────
export default function DemoPage() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function goTo(i: number) {
    setStep(i);
    setProgress(0);
    setVisited(v => new Set([...v, i]));
  }

  function startProgress() {
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) return 100;
        return p + (100 / (STEP_DURATION / 100));
      });
    }, 100);
  }

  function startTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setStep(s => {
        const next = s + 1 >= STEPS.length ? 0 : s + 1;
        setVisited(v => new Set([...v, next]));
        setProgress(0);
        return next;
      });
    }, STEP_DURATION);
    startProgress();
  }

  function stopAll() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  }

  useEffect(() => {
    if (playing) startTimer();
    else stopAll();
    return stopAll;
  }, [playing]);

  useEffect(() => {
    if (playing) startProgress();
  }, [step, playing]);

  const Screen = STEPS[step].screen;
  const pct = ((step) / STEPS.length) * 100;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="demo-shell">
        {/* Top bar */}
        <div className="demo-topbar">
          <a href="/" className="demo-logo">LkSG<em>Compass</em></a>
          <div className="demo-topbar-r">
            <div className="demo-pill">▶ Produkt-Demo</div>
            <a href="/register" className="demo-cta">Kostenlos starten →</a>
          </div>
        </div>

        {/* Progress bar */}
        <div className="demo-progress" style={{ height: 2, background: "rgba(255,255,255,.08)" }}>
          <div className="demo-progress-fill" style={{ width: `${pct + (progress / STEPS.length)}%`, height: "100%", background: "linear-gradient(90deg,#1B3D2B,#4ade80)", transition: "width 0.1s linear" }} />
        </div>

        <div className="demo-body">
          {/* Sidebar */}
          <div className="demo-sidebar">
            <div className="demo-sidebar-h">Produkt-Tour</div>
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                className={`demo-step-btn${step === i ? " active" : ""}${visited.has(i) && step !== i ? " done" : ""}`}
                onClick={() => { goTo(i); setPlaying(false); }}
              >
                <div className="demo-step-num">{i + 1}</div>
                <div className="demo-step-info">
                  <div className="demo-step-title">{s.title}</div>
                  <div className="demo-step-sub">{s.law}</div>
                </div>
                <div className="demo-step-check">✓</div>
              </button>
            ))}
          </div>

          {/* Screen area */}
          <div className="demo-content">
            <div className="demo-screen-wrap">
              {STEPS.map((s, i) => {
                const S = s.screen;
                return (
                  <div key={s.id} className={`demo-screen${step === i ? " visible" : ""}`}>
                    <S />
                  </div>
                );
              })}
            </div>

            {/* Controls */}
            <div className="demo-controls">
              <button
                className="demo-ctrl-btn"
                onClick={() => { goTo(Math.max(0, step - 1)); setPlaying(false); }}
                disabled={step === 0}
              >
                ← Zurück
              </button>

              <div className="demo-ctrl-center">
                <div className="demo-dots">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`demo-dot${step === i ? " on" : ""}`}
                      onClick={() => { goTo(i); setPlaying(false); }}
                    />
                  ))}
                </div>
                <button className="demo-play-btn" onClick={() => setPlaying(p => !p)}>
                  {playing ? "⏸ Pause" : "▶ Play"} — {STEPS[step].title}
                </button>
                <div className="timer-bar">
                  <div className="timer-fill" style={{ width: playing ? `${progress}%` : "0%", transition: `width ${playing ? 0.1 : 0}s linear` }} />
                </div>
              </div>

              {step < STEPS.length - 1 ? (
                <button
                  className="demo-ctrl-btn primary"
                  onClick={() => { goTo(step + 1); setPlaying(false); }}
                >
                  Weiter →
                </button>
              ) : (
                <a href="/register" className="demo-ctrl-btn primary" style={{ textDecoration: "none" }}>
                  Jetzt starten →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
