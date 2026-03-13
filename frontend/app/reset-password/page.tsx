"use client";
import { useMemo, useState } from "react";

const NEXT_PUBLIC = process.env.NEXT_PUBLIC_API_URL || "";
const API = NEXT_PUBLIC.startsWith("http") ? NEXT_PUBLIC : "/api";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const token = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("token") || "";
  }, []);

  async function submit() {
    setError("");
    if (!token) return setError("Reset-Link fehlt oder ist ungueltig.");
    if (password.length < 8) return setError("Passwort muss mindestens 8 Zeichen lang sein.");
    if (password !== confirm) return setError("Passwoerter stimmen nicht ueberein.");
    setLoading(true);
    try {
      const r = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return setError(d?.error || "Reset fehlgeschlagen.");
      setDone(true);
    } catch {
      setError("Verbindungsfehler. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5f4", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#fff", border: "1px solid #e8eae8", borderRadius: 20, padding: 32, boxShadow: "0 10px 36px rgba(0,0,0,.06)" }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#0b0f0c", letterSpacing: "-.4px", marginBottom: 6 }}>Neues Passwort</div>
        <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.5, marginBottom: 24 }}>Einmal sauber zuruecksetzen, dann weiterarbeiten. Faszinierend effizientes Konzept.</div>
        {error && <div style={{ background: "#fff0ef", border: "1px solid #ffc5c0", color: "#8b1d13", borderRadius: 10, padding: "11px 14px", fontSize: 14, marginBottom: 16 }}>{error}</div>}
        {done ? (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: 10, padding: "14px 16px", fontSize: 14, lineHeight: 1.5 }}>
            Passwort erfolgreich aktualisiert. <a href="/login" style={{ color: "#1B3D2B", fontWeight: 700 }}>Zum Login</a>
          </div>
        ) : (
          <>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 7 }}>Neues Passwort</label>
            <div style={{ position: "relative", marginBottom: 14 }}>
              <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: "13px 14px", paddingRight: 78, borderRadius: 12, border: "1.5px solid #e8eae8", outline: "none" }} />
              <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9ca3af", fontSize: 11, fontWeight: 700 }}>{showPw ? "Verbergen" : "Anzeigen"}</button>
            </div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 7 }}>Passwort bestaetigen</label>
            <input type={showPw ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: "1.5px solid #e8eae8", outline: "none", marginBottom: 16 }} />
            <button onClick={submit} disabled={loading} style={{ width: "100%", padding: 14, background: "#1B3D2B", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .6 : 1 }}>{loading ? "Wird gespeichert..." : "Passwort speichern"}</button>
          </>
        )}
      </div>
    </div>
  );
}
