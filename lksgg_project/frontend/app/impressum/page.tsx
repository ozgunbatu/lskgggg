export default function Impressum() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "100px 32px 80px", fontFamily: "ui-sans-serif, system-ui, sans-serif", color: "#0b0f0c", lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, color: "#1B3D2B" }}>Impressum</h1>
      <p style={{ color: "#6b7280", marginBottom: 40 }}>Angaben gemass § 5 TMG</p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 10 }}>Angaben zum Unternehmen</h2>
      <p><strong>LkSGCompass GmbH</strong><br />
      [Strasse und Hausnummer]<br />
      [PLZ] [Stadt]<br />
      Deutschland</p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 10 }}>Kontakt</h2>
      <p>E-Mail: <a href="mailto:hello@lksgcompass.de" style={{ color: "#1B3D2B" }}>hello@lksgcompass.de</a></p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 10 }}>Handelsregister</h2>
      <p>Registergericht: [Amtsgericht Stadt]<br />
      Registernummer: HRB [Nummer]</p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 10 }}>Umsatzsteuer-ID</h2>
      <p>Umsatzsteuer-Identifikationsnummer gemass § 27a UStG: DE[Nummer]</p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 10 }}>Geschaftsfuhrung</h2>
      <p>[Name des Geschaftsfuhrers]</p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 10 }}>Verantwortlich fur den Inhalt (§ 55 Abs. 2 RStV)</h2>
      <p>[Name]<br />[Adresse wie oben]</p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 10 }}>Streitschlichtung</h2>
      <p>Die Europaische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr" style={{ color: "#1B3D2B" }}>https://ec.europa.eu/consumers/odr</a>. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>

      <p style={{ marginTop: 48, color: "#6b7280", fontSize: 13 }}>
        <a href="/" style={{ color: "#1B3D2B" }}>? Zuruck zur Startseite</a>
      </p>
    </div>
  );
}
