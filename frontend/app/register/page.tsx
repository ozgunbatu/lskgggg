"use client";
import { useEffect, useRef, useState } from "react";
import { clearToken, setToken, validateSession } from "@/lib/auth";

// Always use /api proxy — Next.js rewrites to backend (no CORS)
const API = "/api";

const css = `
  *,*::before,*::after{box-sizing:border-box}
  .rw{min-height:100vh;background:linear-gradient(160deg,#f0f4f1 0%,#e8eee9 100%);padding:24px 20px;display:flex;flex-direction:column;align-items:center}
  .rnav{width:100%;max-width:1100px;display:flex;align-items:center;justify-content:space-between;margin-bottom:32px}
  .rlogo{font-family:system-ui,sans-serif;font-weight:800;font-size:18px;color:#1B3D2B;text-decoration:none}
  .rlogo em{font-style:normal;color:#9ca3af}
  .rlink{font-size:13.5px;color:#6b7280;font-weight:600;text-decoration:none}
  .rlink:hover{color:#1B3D2B}
  .rwrap{display:grid;grid-template-columns:minmax(0,440px) minmax(0,1fr);gap:24px;width:100%;max-width:1100px;align-items:start}
  .rcard{background:#fff;border:1.5px solid #e2e8e3;border-radius:24px;padding:40px;box-shadow:0 8px 40px rgba(0,0,0,0.07)}
  .rside{background:#1B3D2B;border-radius:24px;padding:44px;color:#fff;position:relative;overflow:hidden;min-height:420px;display:flex;flex-direction:column;justify-content:center}
  .rside::before{content:"";position:absolute;width:320px;height:320px;border-radius:50%;background:rgba(255,255,255,0.05);top:-120px;right:-80px}
  .rside::after{content:"";position:absolute;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,0.04);bottom:-60px;left:-60px}
  .rh{font-size:27px;font-weight:800;color:#0b1209;letter-spacing:-.5px;margin:0 0 6px}
  .rs{font-size:14px;color:#6b7280;line-height:1.6;margin:0 0 28px}
  .rf{margin-bottom:18px}
  .rl{font-size:11px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:7px}
  .ri{width:100%;padding:13px 16px;border:1.5px solid #e0e5e1;border-radius:12px;font-size:15px;color:#0b1209;background:#fafbfa;outline:none;transition:border-color .2s,box-shadow .2s}
  .ri:focus{border-color:#1B3D2B;box-shadow:0 0 0 3px rgba(27,61,43,.1);background:#fff}
  .riw{position:relative}
  .rpwt{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#9ca3af;font-size:11.5px;font-weight:700;padding:4px 6px}
  .rstr{display:flex;gap:5px;margin-top:8px}
  .rstrb{flex:1;height:3px;border-radius:99px;background:#e8eae8;transition:background .3s}
  .rstrl{font-size:11px;margin-top:4px;text-align:right;font-weight:600}
  .rbtn{width:100%;padding:15px;background:#1B3D2B;color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s;margin-top:4px}
  .rbtn:hover:not(:disabled){background:#2d5c3f;transform:translateY(-1px);box-shadow:0 4px 16px rgba(27,61,43,.3)}
  .rbtn:disabled{opacity:.5;cursor:not-allowed;transform:none}
  .rerr{background:#fff0ef;border:1px solid #ffc5c0;color:#8b1d13;border-radius:10px;padding:12px 14px;font-size:13.5px;margin-bottom:16px;line-height:1.5;display:flex;gap:8px}
  .rinfo{background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;border-radius:10px;padding:12px 14px;font-size:13.5px;margin-bottom:16px;line-height:1.5}
  .rdiv{border:none;border-top:1.5px solid #f0f2f0;margin:22px 0}
  .rfl{text-align:center;font-size:14px;color:#6b7280}
  .rfl a{color:#1B3D2B;font-weight:700;text-decoration:none}
  .sp{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite}
  .sp.d{border-color:rgba(27,61,43,.2);border-top-color:#1B3D2B}
  @keyframes spin{to{transform:rotate(360deg)}}
  .otpwrap{display:flex;gap:8px;justify-content:center;margin:4px 0 20px}
  .otpbox{width:52px;height:62px;border:1.5px solid #e0e5e1;border-radius:12px;font-size:28px;font-weight:800;text-align:center;outline:none;font-family:monospace;color:#0b1209;background:#fafbfa;transition:border-color .2s}
  .otpbox:focus{border-color:#1B3D2B;box-shadow:0 0 0 3px rgba(27,61,43,.1);background:#fff}
  .rbk{display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;color:#6b7280;font-size:13.5px;font-weight:700;padding:0 0 18px;transition:color .15s}
  .rbk:hover{color:#1B3D2B}
  .rresend{background:none;border:none;cursor:pointer;color:#1B3D2B;font-weight:700;font-size:14px;padding:0}
  .rresend:disabled{opacity:.5;cursor:not-allowed}
  .rinvite{background:linear-gradient(135deg,#1B3D2B,#2d6348);border:none;border-radius:16px;padding:16px;margin-bottom:24px;color:#fff}
  .rinvite-h{font-size:14px;font-weight:800;margin:0 0 4px}
  .rinvite-s{font-size:13px;color:rgba(255,255,255,.75);margin:0}
  .scheck{display:grid;gap:16px;position:relative;z-index:1}
  .scheck-i{display:flex;gap:12px;align-items:flex-start}
  .scheck-ic{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0}
  .scheck b{display:block;margin-bottom:2px;font-size:14px}
  .scheck span{font-size:13px;color:rgba(255,255,255,.65);line-height:1.5}
  .spills{display:flex;flex-wrap:wrap;gap:8px;margin-top:32px;position:relative;z-index:1}
  .spill{font-size:12px;color:rgba(255,255,255,.75);background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);padding:5px 12px;border-radius:99px}
  @media(max-width:860px){.rwrap{grid-template-columns:1fr}.rside{display:none}}
  @media(max-width:480px){.rcard{padding:28px 20px}.otpbox{width:42px;height:54px;font-size:22px}}
`;

export default function RegisterPage() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [checking, setChecking] = useState(true);
  const [invite, setInvite] = useState<{ email: string; companyName: string; companyId: string; token: string } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    (async () => {
      const status = await validateSession();
      if (status.ok) { window.location.href = "/app"; return; }
      clearToken();

      // Check for invite token
      const params = new URLSearchParams(window.location.search);
      const inviteToken = params.get("invite");
      if (inviteToken) {
        try {
          const r = await fetch(`${API}/team/accept/${inviteToken}`);
          const d = await r.json();
          if (d.valid) {
            setInvite({ email: d.email, companyName: d.companyName, companyId: d.companyId, token: inviteToken });
            setEmail(d.email);
            setCompanyName(d.companyName);
          }
        } catch {}
      }
      setChecking(false);
    })();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function submit() {
    setError(""); setInfo("");
    if (!invite && !companyName.trim()) return setError("Bitte Unternehmensnamen eingeben.");
    if (!email.trim()) return setError("Bitte E-Mail eingeben.");
    if (password.length < 8) return setError("Passwort muss mindestens 8 Zeichen lang sein.");
    setLoading(true);
    try {
      const body: any = { email, password };
      if (invite) {
        body.inviteToken = invite.token;
      } else {
        body.companyName = companyName;
      }
      const r = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return setError(d?.error || "Registrierung fehlgeschlagen.");
      if (d.requiresOtp === false) {
        setToken(d.token);
        window.location.href = "/app?welcome=1";
        return;
      }
      setStep("otp");
      setCooldown(60);
      setInfo("Bestätigungscode gesendet. Bitte prüfen Sie Ihre E-Mail.");
      setTimeout(() => refs.current[0]?.focus(), 100);
    } catch {
      setError("Verbindungsfehler. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }

  function onOtpChange(i: number, val: string) {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[i] = val.slice(-1); setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
    if (next.every(d => d)) verifyOtp(next.join(""));
  }
  function onOtpKey(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  }

  async function verifyOtp(code?: string) {
    const finalCode = code ?? otp.join("");
    if (finalCode.length !== 6) return setError("Bitte alle 6 Stellen eingeben.");
    setLoading(true); setError("");
    try {
      const r = await fetch(`${API}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: finalCode }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return setError(d?.error || "Ungültiger Code.");
      setToken(d.token);
      window.location.href = "/app?welcome=1";
    } catch { setError("Verbindungsfehler."); }
    finally { setLoading(false); }
  }

  async function resend() {
    if (cooldown > 0) return;
    setLoading(true); setError(""); setInfo("");
    try {
      const r = await fetch(`${API}/auth/resend-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return setError(d?.error || "Fehler.");
      setOtp(["", "", "", "", "", ""]); setCooldown(60);
      setInfo("Neuer Code wurde gesendet.");
      setTimeout(() => refs.current[0]?.focus(), 100);
    } catch { setError("Verbindungsfehler."); }
    finally { setLoading(false); }
  }

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const sc = ["", "#ef4444", "#f59e0b", "#22c55e"][strength];
  const slabel = ["", "Schwach", "Mittel", "Stark"][strength];

  if (checking) return <div style={{ minHeight: "100vh", background: "#f0f4f1", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="sp d" /></div>;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="rw">
        <nav className="rnav">
          <a href="/" className="rlogo">LkSG<em>Compass</em></a>
          <a href="/login" className="rlink">Bereits registriert? Einloggen →</a>
        </nav>
        <div className="rwrap">
          <div className="rcard">
            {step === "form" ? (
              <>
                {invite ? (
                  <div className="rinvite">
                    <div className="rinvite-h">🎉 Sie wurden eingeladen</div>
                    <div className="rinvite-s">Workspace: <strong>{invite.companyName}</strong> — Wählen Sie ein Passwort, um der Einladung zu folgen.</div>
                  </div>
                ) : null}
                <div className="rh">{invite ? "Account aktivieren" : "Account erstellen"}</div>
                <div className="rs">{invite ? `Geben Sie ein Passwort für ${invite.email} ein.` : "Erstellen Sie Ihren LkSGCompass-Workspace in unter 60 Sekunden."}</div>
                {error && <div className="rerr"><span>!</span><span>{error}</span></div>}
                {info && <div className="rinfo">{info}</div>}
                {!invite && (
                  <div className="rf">
                    <label className="rl">Unternehmensname</label>
                    <input className="ri" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Muster GmbH" onKeyDown={e => e.key === "Enter" && submit()} autoFocus />
                  </div>
                )}
                <div className="rf">
                  <label className="rl">Geschäftliche E-Mail</label>
                  <input className="ri" type="email" value={email} onChange={e => !invite && setEmail(e.target.value)} placeholder="max@muster-gmbh.de" readOnly={!!invite} style={invite ? { background: "#f8f9f8", color: "#6b7280" } : {}} onKeyDown={e => e.key === "Enter" && submit()} autoFocus={!!invite} />
                </div>
                <div className="rf">
                  <label className="rl">Passwort</label>
                  <div className="riw">
                    <input className="ri" type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mindestens 8 Zeichen" style={{ paddingRight: 80 }} onKeyDown={e => e.key === "Enter" && submit()} />
                    <button className="rpwt" type="button" onClick={() => setShowPw(s => !s)}>{showPw ? "Verbergen" : "Anzeigen"}</button>
                  </div>
                  {password.length > 0 && <>
                    <div className="rstr">{[1,2,3].map(i => <div key={i} className="rstrb" style={{ background: i <= strength ? sc : undefined }} />)}</div>
                    <div className="rstrl" style={{ color: sc }}>{slabel}</div>
                  </>}
                </div>
                <button className="rbtn" onClick={submit} disabled={loading}>{loading ? <span className="sp" /> : invite ? "Einladung annehmen →" : "Konto erstellen →"}</button>
                <hr className="rdiv" />
                <div className="rfl">Bereits ein Konto? <a href="/login">Einloggen</a></div>
              </>
            ) : (
              <>
                <button className="rbk" onClick={() => { setStep("form"); setError(""); setInfo(""); setOtp(["","","","","",""]); }}>← Zurück</button>
                <div className="rh">E-Mail bestätigen</div>
                <div className="rs">Wir haben einen 6-stelligen Code an <strong>{email}</strong> gesendet.</div>
                {error && <div className="rerr"><span>!</span><span>{error}</span></div>}
                {info && <div className="rinfo">{info}</div>}
                <div className="otpwrap">
                  {otp.map((d, i) => (
                    <input key={i} ref={el => refs.current[i] = el} className="otpbox" inputMode="numeric" maxLength={1} value={d}
                      onChange={e => onOtpChange(i, e.target.value)} onKeyDown={e => onOtpKey(i, e)} />
                  ))}
                </div>
                <button className="rbtn" onClick={() => verifyOtp()} disabled={loading || otp.join("").length !== 6}>{loading ? <span className="sp" /> : "Code bestätigen"}</button>
                <div style={{ textAlign: "center", marginTop: 16, fontSize: 14, color: "#6b7280" }}>
                  Kein Code?{" "}
                  <button className="rresend" onClick={resend} disabled={loading || cooldown > 0}>
                    {cooldown > 0 ? `Erneut senden in ${cooldown}s` : "Code erneut senden"}
                  </button>
                </div>
              </>
            )}
          </div>

          <aside className="rside">
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.5)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>LkSGCompass v80</div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.5px", marginBottom: 10, lineHeight: 1.2 }}>Compliance-Workspace für §§4–10 LkSG</div>
              <div style={{ color: "rgba(255,255,255,.65)", lineHeight: 1.6, fontSize: 14, marginBottom: 36 }}>Von der Risikoanalyse bis zum BAFA-Bericht — in einem kompakten, audit-sicheren Workspace.</div>
              <div className="scheck">
                <div className="scheck-i"><div className="scheck-ic">§5</div><div><b>Risikoanalyse</b><span>Länder-, Branchen- und Profil-Scoring nach §5 LkSG.</span></div></div>
                <div className="scheck-i"><div className="scheck-ic">§8</div><div><b>Beschwerdemanagement</b><span>Whistleblowing-Portal + §8 Abs.5 Rückmeldepflicht.</span></div></div>
                <div className="scheck-i"><div className="scheck-ic">§9</div><div><b>BAFA Reporting</b><span>Wirksamkeitskontrolle und PDF-Bericht auf Knopfdruck.</span></div></div>
              </div>
              <div className="spills">
                <span className="spill">DSGVO-konform</span>
                <span className="spill">BAFA-ready</span>
                <span className="spill">HinSchG §16</span>
                <span className="spill">14 Tage kostenlos</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
