"use client";
import { useEffect, useState } from "react";

export default function AuthSplash() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 350);
    return () => clearInterval(t);
  }, []);
  const dots = ".".repeat((tick % 3) + 1);
  return (
    <div style={{
      position:"fixed", inset:0,
      background:"#07090a",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      gap:14, fontFamily:"'DM Sans',sans-serif",
    }}>
      <div style={{
        width:44, height:44, borderRadius:12,
        background:"linear-gradient(145deg,#142918,#1e4526)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:17, fontWeight:800, color:"#22c55e",
        border:"1px solid rgba(34,197,94,0.2)",
        boxShadow:"0 0 24px rgba(34,197,94,0.12)",
        letterSpacing:-1,
      }}>LC</div>
      <div style={{ fontSize:15, fontWeight:700, color:"#ecf0ec", letterSpacing:-0.3 }}>
        LkSGCompass
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"#445547" }}>
        <div style={{
          width:13, height:13,
          border:"1.5px solid rgba(34,197,94,0.15)",
          borderTopColor:"#22c55e",
          borderRadius:"50%",
          animation:"spin 0.65s linear infinite",
        }}/>
        Authentifizierung{dots}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
