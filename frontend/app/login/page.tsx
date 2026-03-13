"use client";
import { useEffect, useMemo, useState } from "react";
import { clearToken, setToken, validateSession } from "../../lib/auth";

// Uses /api proxy (Next.js rewrites to backend) — no CORS, no env var needed
const NEXT_PUBLIC = process.env.NEXT_PUBLIC_API_URL || "";
const API = NEXT_PUBLIC.startsWith("http") ? NEXT_PUBLIC : "/api";

type Lang = "de" | "en";

const css = `
  .lw{min-height:100vh;display:flex;background:#f4f5f4}
  .ll{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 20px;position:relative}
  .lr{width:420px;background:#1B3D2B;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 48px;position:relative;overflow:hidden}
  .lr-pat{position:absolute;inset:0;background-image:radial-gradient(circle at 30% 20%,rgba(255,255,255,0.06),transparent 50%),radial-gradient(circle at 70% 80%,rgba(255,255,255,0.04),transparent 50%);pointer-events:none}
  .lr-con{position:relative;z-index:1;text-align:center}
  .lr-brand{font-family:system-ui,sans-serif;font-size:28px;font-weight:800;color:#fff;margin-bottom:12px;letter-spacing:-0.5px}
  .lr-brand em{font-style:normal;color:rgba(255,255,255,0.4)}
  .lr-tag{font-size:15px;color:rgba(255,255,255,0.6);margin-bottom:48px;line-height:1.5}
  .lf{display:flex;align-items:flex-start;gap:12px;margin-bottom:20px;text-align:left}
  .lf-ic{width:36px;height:36px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
  .lf-tx strong{display:block;font-size:14px;color:#fff;font-weight:600;margin-bottom:2px}
  .lf-tx span{font-size:13px;color:rgba(255,255,255,0.55);line-height:1.4}
  .lbadge{display:inline-flex;gap:8px;margin-top:40px;flex-wrap:wrap;justify-content:center}
  .lbitem{font-size:12px;color:rgba(255,255,255,0.5);background:rgba(255,255,255,0.07);padding:4px 10px;border-radius:20px;border:1px solid rgba(255,255,255,0.1)}
  .lnav{position:absolute;top:0;left:0;right:0;padding:20px 32px;display:flex;align-items:center;justify-content:space-between}
  .llogo{font-family:system-ui,sans-serif;font-weight:800;font-size:16px;color:#1B3D2B}
  .llogo em{font-style:normal;color:#9ca3af}
  .lnl{font-size:13px;color:#6b7280;font-weight:500}
  .lgrp{display:flex;background:#F3F4F3;border:1px solid #e8eae8;border-radius:8px;padding:2px;gap:1px}
  .lb{background:none;border:none;font-size:11px;font-weight:700;color:#9ca3af;padding:3px 9px;border-radius:6px;cursor:pointer;transition:all .15s}
  .lb.on{background:#fff;color:#1B3D2B;box-shadow:0 1px 4px rgba(0,0,0,.1)}
  .lcard{background:#fff;border:1px solid #e8eae8;border-radius:20px;padding:40px;width:100%;max-width:420px;box-shadow:0 4px 40px rgba(0,0,0,0.06)}
  .lti{font-family:system-ui,sans-serif;font-size:26px;font-weight:800;color:#0b0f0c;margin-bottom:6px;letter-spacing:-0.5px}
  .lsu{font-size:14px;color:#6b7280;margin-bottom:28px;line-height:1.5}
  .lfield{margin-bottom:16px}.llr{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
  .llab{font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px}
  .lfg{font-size:12px;color:#1B3D2B;font-weight:600;cursor:pointer;background:none;border:none;padding:0}.lfg:hover{text-decoration:underline}
  .liw{position:relative}
  .linp{width:100%;padding:12px 14px;border:1.5px solid #e8eae8;border-radius:10px;font-size:15px;color:#0b0f0c;background:#fff;transition:border-color 0.2s;outline:none}
  .linp:focus{border-color:#1B3D2B;box-shadow:0 0 0 3px rgba(27,61,43,0.1)}
  .linp::placeholder{color:#9ca3af}
  .lpwt{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#9ca3af;font-size:11px;font-weight:700;padding:4px 6px}
  .lbtn{width:100%;padding:14px;background:#1B3D2B;color:#fff;border:none;border-radius:11px;font-size:15px;font-weight:700;cursor:pointer;transition:all 0.2s;margin-top:8px;display:flex;align-items:center;justify-content:center;gap:8px}
  .lbtn:hover:not(:disabled){background:#2d5c3f;transform:translateY(-1.5px)}
  .lbtn:disabled{opacity:0.55;cursor:not-allowed;transform:none}
  .lbtn.alt{background:#fff;color:#1B3D2B;border:1px solid #dfe3df}
  .lerr{background:#fff0ef;border:1px solid #ffc5c0;color:#8b1d13;border-radius:10px;padding:11px 14px;font-size:14px;margin-bottom:16px;display:flex;align-items:flex-start;gap:8px;line-height:1.4}
  .lok{background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;border-radius:10px;padding:11px 14px;font-size:14px;margin-bottom:16px;line-height:1.4}
  .lpanel{background:#f8faf8;border:1px solid #e8eae8;border-radius:14px;padding:16px;margin:8px 0 18px}
  .lmeta{font-size:12px;color:#6b7280;line-height:1.5;margin-top:8px}
  .ldiv{border:none;border-top:1px solid #e8eae8;margin:20px 0}
  .lfl{text-align:center;font-size:14px;color:#6b7280}.lfl a{color:#1B3D2B;font-weight:600}
  .lsp{width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite}
  .lsp.dark{border-color:rgba(27,61,43,0.2);border-top-color:#1B3D2B}
  @keyframes spin{to{transform:rotate(360deg)}}
  @media(max-width:900px){.lr{display:none}.ll{padding:80px 20px 40px}.lnav{background:#fff;border-bottom:1px solid #e8eae8}}
  @media(max-width:480px){.lcard{padding:28px 20px}}
`;

const features = [
  { icon: "✓", title: "LkSG Compliance", desc: "BAFA-ready workflows, complaint handling and audit-proof documentation." },
  { icon: "◌", title: "Risk scoring", desc: "Supplier risk analysis across countries, industries and incidents." },
  { icon: "▣", title: "Action center", desc: "Prioritised CAPs, evidence and reporting in one compact workspace." },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<Lang>("de");
  const [checking, setChecking] = useState(true);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState("");
  const [previewLink, setPreviewLink] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setLang((localStorage.getItem("lang") || "de") as Lang);
    (async () => {
      const status = await validateSession();
      if (status.ok) {
        window.location.href = "/app";
        return;
      }
      clearToken();
      setChecking(false);
    })();
  }, []);

  function changeLang(l: Lang) {
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
    setLang(l);
  }

  const t = useMemo(() => (de: string, en: string) => lang === "de" ? de : en, [lang]);

  async function submit() {
    setError("");
    setForgotSent("");
    if (!email.trim()) return setError(t("Bitte E-Mail eingeben.", "Please enter your email."));
    if (!password) return setError(t("Bitte Passwort eingeben.", "Please enter your password."));
    setLoading(true);
    try {
      const r = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return setError(d?.error || t("E-Mail oder Passwort ungueltig.", "Invalid email or password."));
      setToken(d.token);
      window.location.href = "/app";
    } catch {
      setError(t("Verbindungsfehler. Bitte erneut versuchen.", "Connection error. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  async function sendReset() {
    setError("");
    setForgotSent("");
    setPreviewLink("");
    if (!email.trim()) return setError(t("Bitte zuerst Ihre E-Mail eingeben.", "Please enter your email first."));
    setLoading(true);
    try {
      const r = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return setError(d?.error || t("Reset fehlgeschlagen.", "Reset failed."));
      setForgotSent(t("Wenn die E-Mail existiert, haben wir einen Reset-Link gesendet.", "If the email exists, we sent a reset link."));
      if (d?.preview) setPreviewLink(d.preview);
    } catch {
      setError(t("Verbindungsfehler. Bitte erneut versuchen.", "Connection error. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  if (checking) return <div style={{ minHeight: "100vh", background: "#f4f5f4", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="lsp dark" /></div>;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="lw">
        <div className="ll">
          <nav className="lnav">
            <a href="/" className="llogo">LkSG<em>Compass</em></a>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="lgrp">
                <button className={"lb" + (lang === "de" ? " on" : "")} onClick={() => changeLang("de")}>DE</button>
                <button className={"lb" + (lang === "en" ? " on" : "")} onClick={() => changeLang("en")}>EN</button>
              </div>
              <a href="/register" className="lnl">{t("Noch kein Konto? Registrieren", "No account? Register")}</a>
            </div>
          </nav>

          <div className="lcard">
            <div className="lti">{t("Willkommen zurueck", "Welcome back")}</div>
            <div className="lsu">{t("Melden Sie sich an oder setzen Sie Ihr Passwort sauber zurueck. Revolutionaer, ich weiss.", "Sign in or reset your password properly. A shocking advance for software.")}</div>

            {error && <div className="lerr"><span>!</span><span>{error}</span></div>}
            {forgotSent && <div className="lok">{forgotSent}</div>}

            <div className="lfield">
              <label className="llab">E-Mail</label>
              <input className="linp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="max@muster-gmbh.de" onKeyDown={e => e.key === "Enter" && !forgotMode && submit()} autoFocus />
            </div>

            {!forgotMode && (
              <div className="lfield">
                <div className="llr">
                  <span className="llab">{t("Passwort", "Password")}</span>
                  <button className="lfg" type="button" onClick={() => { setForgotMode(true); setError(""); }}>{t("Passwort vergessen?", "Forgot password?")}</button>
                </div>
                <div className="liw">
                  <input className="linp" type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ paddingRight: 80 }} onKeyDown={e => e.key === "Enter" && submit()} />
                  <button className="lpwt" onClick={() => setShowPw(s => !s)} type="button">{showPw ? t("Verbergen", "Hide") : t("Anzeigen", "Show")}</button>
                </div>
              </div>
            )}

            {forgotMode && (
              <div className="lpanel">
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0b0f0c", marginBottom: 6 }}>{t("Passwort zuruecksetzen", "Reset password")}</div>
                <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>{t("Wir senden einen Link an Ihre E-Mail. Ohne gueltige Adresse passiert natuerlich nichts. Software kann viel, Magie nicht.", "We will send a link to your email. Without a valid address, nothing happens. Software is many things, not wizardry.")}</div>
                {!!previewLink && <div className="lmeta">{t("Vorschau-Link", "Preview link")}: <a href={previewLink} style={{ color: "#1B3D2B", wordBreak: "break-all" }}>{previewLink}</a></div>}
              </div>
            )}

            {forgotMode ? (
              <>
                <button className="lbtn" onClick={sendReset} disabled={loading}>{loading ? <span className="lsp" /> : t("Reset-Link senden", "Send reset link")}</button>
                <button className="lbtn alt" onClick={() => { setForgotMode(false); setForgotSent(""); setPreviewLink(""); setError(""); }} disabled={loading}>{t("Zurueck zum Login", "Back to sign in")}</button>
              </>
            ) : (
              <button className="lbtn" onClick={submit} disabled={loading}>{loading ? <span className="lsp" /> : t("Einloggen", "Sign in")}</button>
            )}

            <hr className="ldiv" />
            <div className="lfl">{t("Noch kein Konto?", "No account?")} <a href="/register">{t("Jetzt registrieren", "Register now")}</a></div>
          </div>
        </div>

        <aside className="lr">
          <div className="lr-pat" />
          <div className="lr-con">
            <div className="lr-brand">LkSG<em>Compass</em></div>
            <div className="lr-tag">{t("Ein kompakter Arbeitsbereich fuer Due Diligence, Beschwerden, CAPs und BAFA-Reporting.", "A compact workspace for due diligence, complaints, CAPs and BAFA reporting.")}</div>
            {features.map(f => (
              <div className="lf" key={f.title}>
                <div className="lf-ic">{f.icon}</div>
                <div className="lf-tx"><strong>{f.title}</strong><span>{f.desc}</span></div>
              </div>
            ))}
            <div className="lbadge">
              <span className="lbitem">DSGVO</span>
              <span className="lbitem">§§4-10 LkSG</span>
              <span className="lbitem">BAFA-ready</span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
