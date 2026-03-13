export default function AGB() {
  const s = { fontSize: 18, fontWeight: 700, marginTop: 36, marginBottom: 10 } as React.CSSProperties;
  const p = { color: "#0b0f0c", marginBottom: 16 } as React.CSSProperties;
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "100px 32px 80px", fontFamily: "ui-sans-serif, system-ui, sans-serif", color: "#0b0f0c", lineHeight: 1.75 }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, color: "#1B3D2B" }}>Allgemeine Geschaftsbedingungen (AGB)</h1>
      <p style={{ color: "#6b7280", marginBottom: 40 }}>Stand: {new Date().toLocaleDateString("de-DE", { year: "numeric", month: "long" })}</p>

      <h2 style={s}>§ 1 Geltungsbereich</h2>
      <p style={p}>Diese AGB gelten fur alle Vertrage zwischen LkSGCompass GmbH (nachfolgend "Anbieter") und Unternehmenskunden (nachfolgend "Kunde") uber die Nutzung der SaaS-Plattform LkSGCompass.</p>

      <h2 style={s}>§ 2 Leistungsgegenstand</h2>
      <p style={p}>Der Anbieter stellt dem Kunden eine webbasierte Software-as-a-Service-Losung zur LkSG-Compliance-Verwaltung bereit. Umfang der Leistungen richtet sich nach dem gewahlten Abonnement-Plan.</p>

      <h2 style={s}>§ 3 Vertragsschluss</h2>
      <p style={p}>Der Vertrag kommt durch Registrierung und Auswahl eines kostenpflichtigen Plans zustande. Die kostenlose Nutzung (Starter-Free) gilt als vorvertragliche Nutzung.</p>

      <h2 style={s}>§ 4 Zahlungsbedingungen</h2>
      <p style={p}>Die Vergutung richtet sich nach der aktuellen Preisliste. Jahresabonnements sind im Voraus fallig. Bei Zahlungsverzug behalt sich der Anbieter vor, den Zugang zu sperren.</p>

      <h2 style={s}>§ 5 Kundigung</h2>
      <p style={p}>Abonnements konnen jederzeit zum Ende des Abrechnungszeitraums gekundigt werden. Nach Kundigung werden alle Daten des Kunden nach einer Ubergangsfrist von 30 Tagen unwiderruflich geloscht.</p>

      <h2 style={s}>§ 6 Haftungsbeschrankung</h2>
      <p style={p}>Der Anbieter haftet nicht fur die inhaltliche Richtigkeit oder Vollstandigkeit der generierten Berichte. Die Plattform unterstutzt den Compliance-Prozess, ersetzt jedoch keine rechtliche Beratung. Vor Einreichung bei BAFA ist eine fachliche Prufung durch qualifizierte Berater erforderlich.</p>

      <h2 style={s}>§ 7 Datenschutz und Auftragsverarbeitung</h2>
      <p style={p}>Der Anbieter verarbeitet personenbezogene Daten des Kunden ausschliesslich als Auftragsverarbeiter gemass Art. 28 DSGVO. Ein separater Auftragsverarbeitungsvertrag (AVV) wird auf Anfrage geschlossen.</p>

      <h2 style={s}>§ 8 Verfugbarkeit</h2>
      <p style={p}>Der Anbieter strebt eine Verfugbarkeit von 99 % im Jahresmittel an. Geplante Wartungsarbeiten werden rechtzeitig angekundigt.</p>

      <h2 style={s}>§ 9 Anwendbares Recht</h2>
      <p style={p}>Es gilt deutsches Recht. Gerichtsstand ist der Sitz des Anbieters, sofern der Kunde Kaufmann ist.</p>

      <p style={{ marginTop: 48, color: "#6b7280", fontSize: 13 }}>
        <a href="/" style={{ color: "#1B3D2B" }}>? Zuruck zur Startseite</a>
      </p>
    </div>
  );
}
