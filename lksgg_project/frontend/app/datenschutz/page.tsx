export default function Datenschutz() {
  const s = { fontSize: 18, fontWeight: 700, marginTop: 36, marginBottom: 10 } as React.CSSProperties;
  const p = { color: "#0b0f0c", marginBottom: 16 } as React.CSSProperties;
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "100px 32px 80px", fontFamily: "ui-sans-serif, system-ui, sans-serif", color: "#0b0f0c", lineHeight: 1.75 }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, color: "#1B3D2B" }}>Datenschutzerklarung</h1>
      <p style={{ color: "#6b7280", marginBottom: 40 }}>Stand: {new Date().toLocaleDateString("de-DE", { year: "numeric", month: "long" })}</p>

      <h2 style={s}>1. Verantwortlicher</h2>
      <p style={p}>Verantwortlicher im Sinne der DSGVO ist:<br />
      <strong>LkSGCompass GmbH</strong><br />
      [Adresse]<br />
      E-Mail: <a href="mailto:datenschutz@lksgcompass.de" style={{ color: "#1B3D2B" }}>datenschutz@lksgcompass.de</a></p>

      <h2 style={s}>2. Datenschutzbeauftragter</h2>
      <p style={p}>Unseren Datenschutzbeauftragten erreichen Sie unter: <a href="mailto:datenschutz@lksgcompass.de" style={{ color: "#1B3D2B" }}>datenschutz@lksgcompass.de</a></p>

      <h2 style={s}>3. Erhobene Daten und Verarbeitungszwecke</h2>
      <p style={p}><strong>3.1 Registrierung und Account</strong><br />
      Bei der Registrierung erheben wir: Unternehmensname, E-Mail-Adresse und Passwort (verschlusselt gespeichert). Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfullung).</p>
      <p style={p}><strong>3.2 Lieferantendaten</strong><br />
      Sie geben selbst Lieferantendaten (Name, Land, Branche) ein. Diese werden ausschliesslich zur Risikoanalyse und BAFA-Berichtserstellung verarbeitet. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.</p>
      <p style={p}><strong>3.3 Hinweisgebersystem</strong><br />
      Meldungen uber das offentliche Portal werden pseudonymisiert gespeichert. Kontaktdaten sind optional und freiwillig. Rechtsgrundlage: Art. 6 Abs. 1 lit. c DSGVO (gesetzliche Verpflichtung nach HinSchG).</p>
      <p style={p}><strong>3.4 Server-Logfiles</strong><br />
      Beim Zugriff auf unsere Website erheben wir technische Daten (IP-Adresse, Browser, Zeitstempel). Diese werden nach 14 Tagen automatisch geloscht. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.</p>

      <h2 style={s}>4. Datenweitergabe</h2>
      <p style={p}>Wir geben Ihre Daten nicht an Dritte weiter, ausser an Auftragsverarbeiter (Hosting-Dienstleister in der EU) auf Basis eines Auftragsverarbeitungsvertrages gemass Art. 28 DSGVO. Ein Transfer in Drittlander findet nicht statt.</p>

      <h2 style={s}>5. Speicherdauer</h2>
      <p style={p}>Daten werden geloscht, sobald sie fur den Verarbeitungszweck nicht mehr erforderlich sind, spatestens jedoch mit Kundigung des Accounts. Handels- und steuerrechtliche Aufbewahrungsfristen (6-10 Jahre) bleiben unberuhrt.</p>

      <h2 style={s}>6. Ihre Rechte (Art. 15-22 DSGVO)</h2>
      <p style={p}>Sie haben folgende Rechte:</p>
      <ul style={{ paddingLeft: 24, marginBottom: 16, color: "#0b0f0c" }}>
        <li style={{ marginBottom: 8 }}><strong>Auskunft</strong> (Art. 15 DSGVO): Welche Daten verarbeiten wir uber Sie?</li>
        <li style={{ marginBottom: 8 }}><strong>Berichtigung</strong> (Art. 16 DSGVO): Korrektur unrichtiger Daten</li>
        <li style={{ marginBottom: 8 }}><strong>Loschung</strong> (Art. 17 DSGVO): Loschung Ihrer Daten auf Anfrage</li>
        <li style={{ marginBottom: 8 }}><strong>Einschrankung</strong> (Art. 18 DSGVO): Einschrankung der Verarbeitung</li>
        <li style={{ marginBottom: 8 }}><strong>Datenubertragbarkeit</strong> (Art. 20 DSGVO): Export Ihrer Daten</li>
        <li style={{ marginBottom: 8 }}><strong>Widerspruch</strong> (Art. 21 DSGVO): Widerspruch gegen Verarbeitung</li>
      </ul>
      <p style={p}>Zur Wahrnehmung Ihrer Rechte wenden Sie sich an: <a href="mailto:datenschutz@lksgcompass.de" style={{ color: "#1B3D2B" }}>datenschutz@lksgcompass.de</a></p>

      <h2 style={s}>7. Beschwerderecht</h2>
      <p style={p}>Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehorde zu beschweren. Die zustandige Behorde ist die fur unseren Unternehmenssitz zustandige Landesbehorde fur Datenschutz.</p>

      <h2 style={s}>8. Cookies und Tracking</h2>
      <p style={p}>Wir verwenden ausschliesslich technisch notwendige Cookies (Session-Token, Authentifizierung). Keine Tracking- oder Marketing-Cookies. Keine Integration von Google Analytics, Facebook Pixel o.a.</p>

      <h2 style={s}>9. Datensicherheit</h2>
      <p style={p}>Alle Datenubertragungen erfolgen verschlusselt via TLS/HTTPS. Passworter werden mit bcrypt gehasht gespeichert. Authentifizierung erfolgt uber signierte JWT-Token.</p>

      <h2 style={s}>10. Auftragsverarbeitung</h2>
      <p style={p}>Auf Anfrage schliessen wir gerne einen Auftragsverarbeitungsvertrag (AVV) gemass Art. 28 DSGVO ab. Bitte kontaktieren Sie uns unter <a href="mailto:datenschutz@lksgcompass.de" style={{ color: "#1B3D2B" }}>datenschutz@lksgcompass.de</a>.</p>

      <p style={{ marginTop: 48, color: "#6b7280", fontSize: 13 }}>
        <a href="/" style={{ color: "#1B3D2B" }}>? Zuruck zur Startseite</a>
      </p>
    </div>
  );
}
