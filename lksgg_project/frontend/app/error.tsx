"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f4f5f4", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ textAlign: "center", padding: "40px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#0b1209", marginBottom: 8 }}>Etwas ist schiefgelaufen</div>
        <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>Ein unerwarteter Fehler ist aufgetreten.</div>
        <button onClick={reset} style={{ background: "#1B3D2B", color: "#fff", padding: "12px 24px", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Erneut versuchen</button>
      </div>
    </div>
  );
}
