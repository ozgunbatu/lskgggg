"use client";

type Lang = "de" | "en";

type Props = {
  open: boolean;
  L: Lang;
  editingSup: any;
  loading: boolean;
  sName: string;
  setSName: (v: string) => void;
  sCountry: string;
  setSCountry: (v: string) => void;
  sInd: string;
  setSInd: (v: string) => void;
  sSpend: string;
  setSSpend: (v: string) => void;
  sWorkers: string;
  setSWorkers: (v: string) => void;
  sCerts: string;
  setSCerts: (v: string) => void;
  sSubSup: string;
  setSSubSup: (v: string) => void;
  sTransp: string;
  setSTransp: (v: string) => void;
  sAudit: boolean;
  setSAudit: (v: boolean) => void;
  sCoc: boolean;
  setSCoc: (v: boolean) => void;
  sViolations: boolean;
  setSViolations: (v: boolean) => void;
  sNotes: string;
  setSNotes: (v: string) => void;
  countries: string[];
  industries: string[];
  onClose: () => void;
  onSave: () => void;
};

export default function SupplierModal(props: Props) {
  const {
    open, L, editingSup, loading, sName, setSName, sCountry, setSCountry, sInd, setSInd,
    sSpend, setSSpend, sWorkers, setSWorkers, sCerts, setSCerts, sSubSup, setSSubSup,
    sTransp, setSTransp, sAudit, setSAudit, sCoc, setSCoc, sViolations, setSViolations,
    sNotes, setSNotes, countries, industries, onClose, onSave,
  } = props;

  if (!open) return null;

  return (
    <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal-lg">
        <div className="modal-hd">
          <div>
            <div className="modal-title">
              {editingSup ? (L === "de" ? "Lieferant bearbeiten" : "Edit Supplier") : (L === "de" ? "Neuer Lieferant" : "New Supplier")}
              <span className="ltag">§5 LkSG</span>
            </div>
            <div style={{ fontSize: 12.5, color: "#6B7280", marginTop: 3 }}>
              {L === "de" ? "Alle Parameter fliessen in die 20-Faktor Risikobewertung ein." : "All parameters feed into the 20-factor risk assessment."}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>
        <div className="sec-divider">{L === "de" ? "Stammdaten" : "Basic Data"}</div>
        <div className="fl"><label>{L === "de" ? "Unternehmensname *" : "Company name *"}</label><input className="inp" value={sName} onChange={e => setSName(e.target.value)} placeholder={L === "de" ? "Muster GmbH" : "Acme Corp"} /></div>
        <div className="inp-row">
          <div className="fl"><label>{L === "de" ? "Land" : "Country"}</label><select className="sel" value={sCountry} onChange={e => setSCountry(e.target.value)}>{countries.map(c => <option key={c}>{c}</option>)}</select></div>
          <div className="fl"><label>{L === "de" ? "Branche" : "Industry"}</label><select className="sel" value={sInd} onChange={e => setSInd(e.target.value)}>{industries.map(i => <option key={i}>{i}</option>)}</select></div>
        </div>
        <div className="inp-row">
          <div className="fl"><label>{L === "de" ? "Jahresumsatz (EUR)" : "Annual spend (EUR)"}</label><input className="inp" type="number" value={sSpend} onChange={e => setSSpend(e.target.value)} placeholder="500000" /></div>
          <div className="fl"><label>{L === "de" ? "Mitarbeiter" : "Workers"}</label><input className="inp" type="number" value={sWorkers} onChange={e => setSWorkers(e.target.value)} placeholder="500" /></div>
        </div>
        <div className="sec-divider">{L === "de" ? "Compliance & Sorgfalt" : "Compliance & Diligence"}</div>
        <div className="inp-row">
          <div className="fl"><label>{L === "de" ? "Zertifikate (Anzahl)" : "Certifications (count)"}</label><select className="sel" value={sCerts} onChange={e => setSCerts(e.target.value)}>{["0","1","2","3","4","5"].map(v => <option key={v} value={v}>{v}</option>)}</select></div>
          <div className="fl"><label>{L === "de" ? "Unterlieferanten (Anzahl)" : "Sub-suppliers (count)"}</label><input className="inp" type="number" value={sSubSup} onChange={e => setSSubSup(e.target.value)} placeholder="5" /></div>
        </div>
        <div className="fl"><label>{L === "de" ? "Transparenzniveau (1=gering, 5=hoch)" : "Transparency level (1=low, 5=high)"}</label><select className="sel" value={sTransp} onChange={e => setSTransp(e.target.value)}>{["1","2","3","4","5"].map(v => <option key={v} value={v}>{v}</option>)}</select></div>
        <div className="chk-row"><input id="chk-audit" type="checkbox" checked={sAudit} onChange={e => setSAudit(e.target.checked)} /><label htmlFor="chk-audit">{L === "de" ? "Audit durchgefuhrt (reduziert Risiko)" : "Audit conducted (reduces risk)"}</label></div>
        <div className="chk-row"><input id="chk-coc" type="checkbox" checked={sCoc} onChange={e => setSCoc(e.target.checked)} /><label htmlFor="chk-coc">{L === "de" ? "Code of Conduct unterschrieben (reduziert Risiko)" : "Code of Conduct signed (reduces risk)"}</label></div>
        <div className="chk-row"><input id="chk-viol" type="checkbox" checked={sViolations} onChange={e => setSViolations(e.target.checked)} /><label htmlFor="chk-viol" style={{ color: "#DC2626" }}>{L === "de" ? "Fruhere LkSG-Verstoss (erhoht Risiko)" : "Previous LkSG violation (increases risk)"}</label></div>
        <div className="fl" style={{ marginTop: 4 }}><label>{L === "de" ? "Interne Notiz" : "Internal note"}</label><textarea className="ta" rows={2} value={sNotes} onChange={e => setSNotes(e.target.value)} placeholder={L === "de" ? "Zusatzliche Informationen..." : "Additional information..."} /></div>
        <div className="brow" style={{ justifyContent: "flex-end", marginTop: 8 }}>
          <button className="btn btn-g" onClick={onClose}>{L === "de" ? "Abbrechen" : "Cancel"}</button>
          <button className="btn btn-p" onClick={onSave} disabled={loading || !sName.trim()}>{loading ? <span className="spin" /> : null}{editingSup ? (L === "de" ? "Speichern" : "Save") : (L === "de" ? "Anlegen & Bewerten" : "Create & Score")}</button>
        </div>
      </div>
    </div>
  );
}
