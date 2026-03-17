"use client";

type Lang = "de" | "en";

type Props = {
  open: boolean;
  L: Lang;
  capSup: string;
  setCapSup: (v: string) => void;
  capTitle: string;
  setCapTitle: (v: string) => void;
  capDesc: string;
  setCapDesc: (v: string) => void;
  capPara: string;
  setCapPara: (v: string) => void;
  capDue: string;
  setCapDue: (v: string) => void;
  capPri: string;
  setCapPri: (v: string) => void;
  capAssign: string;
  setCapAssign: (v: string) => void;
  suppliers: Array<{ id: string; name: string; risk_level: string }>;
  onClose: () => void;
  onCreate: () => void;
};

export default function CapModal(props: Props) {
  const {
    open, L, capSup, setCapSup, capTitle, setCapTitle, capDesc, setCapDesc,
    capPara, setCapPara, capDue, setCapDue, capPri, setCapPri, capAssign, setCapAssign,
    suppliers, onClose, onCreate,
  } = props;

  if (!open) return null;

  return (
    <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-hd">
          <div>
            <div className="modal-title">{L === "de" ? "Neuer Aktionsplan (CAP)" : "New Action Plan (CAP)"}<span className="ltag">§{capPara} LkSG</span></div>
            <div style={{ fontSize: 12.5, color: "#6B7280", marginTop: 3 }}>{L === "de" ? "E-Mail-Benachrichtigung wird gesendet. Abgeschlossene CAPs sind unveranderlich (§10 LkSG)." : "Email notification will be sent. Completed CAPs are immutable (§10 LkSG)."}</div>
          </div>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>
        <div className="fl"><label>{L === "de" ? "Lieferant" : "Supplier"}</label><select className="sel" value={capSup} onChange={e => setCapSup(e.target.value)}><option value="">{L === "de" ? "-- Kein spezifischer Lieferant --" : "-- No specific supplier --"}</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.risk_level.toUpperCase()})</option>)}</select></div>
        <div className="fl"><label>{L === "de" ? "Massnahmentitel *" : "Action title *"}</label><input className="inp" value={capTitle} onChange={e => setCapTitle(e.target.value)} placeholder={L === "de" ? "z.B. Vor-Ort-Audit durchfuhren" : "e.g. Conduct on-site audit"} /></div>
        <div className="fl"><label>{L === "de" ? "Beschreibung" : "Description"}</label><textarea className="ta" rows={3} value={capDesc} onChange={e => setCapDesc(e.target.value)} placeholder={L === "de" ? "Detaillierte Beschreibung..." : "Detailed description..."} /></div>
        <div className="inp-row">
          <div className="fl"><label>LkSG §</label><select className="sel" value={capPara} onChange={e => setCapPara(e.target.value)}><option value="4">§4 Pravention</option><option value="6">§6 Abhilfe</option><option value="7">§7 Massnahmen</option><option value="8">§8 Beschwerden</option><option value="9">§9 Wirksamkeit</option></select></div>
          <div className="fl"><label>{L === "de" ? "Prioritat" : "Priority"}</label><select className="sel" value={capPri} onChange={e => setCapPri(e.target.value)}><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
        </div>
        <div className="inp-row">
          <div className="fl"><label>{L === "de" ? "Falligkeitsdatum" : "Due date"}</label><input className="inp" type="date" value={capDue} onChange={e => setCapDue(e.target.value)} /></div>
          <div className="fl"><label>{L === "de" ? "Zugewiesen an" : "Assigned to"}</label><input className="inp" value={capAssign} onChange={e => setCapAssign(e.target.value)} placeholder="max@firma.de" /></div>
        </div>
        <div className="brow" style={{ justifyContent: "flex-end", marginTop: 8 }}>
          <button className="btn btn-g" onClick={onClose}>{L === "de" ? "Abbrechen" : "Cancel"}</button>
          <button className="btn btn-p" onClick={onCreate} disabled={!capTitle.trim()}>{L === "de" ? "CAP erstellen" : "Create CAP"}</button>
        </div>
      </div>
    </div>
  );
}
