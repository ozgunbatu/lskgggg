export default function NotFound() {
  return (
    <html lang="de">
      <body style={{ margin: 0, background: "#f4f5f4", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
        <div style={{ textAlign: "center", padding: "40px 24px" }}>
          <div style={{ fontSize: 64, fontWeight: 800, color: "#1B3D2B", lineHeight: 1, marginBottom: 8 }}>404</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0b1209", marginBottom: 8 }}>Seite nicht gefunden</div>
          <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 28 }}>Diese Seite existiert nicht oder wurde verschoben.</div>
          <a href="/" style={{ background: "#1B3D2B", color: "#fff", padding: "12px 24px", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>Zur Startseite</a>
        </div>
      </body>
    </html>
  );
}
