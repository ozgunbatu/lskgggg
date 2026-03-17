"use client";
import { useEffect, useState } from "react";
export default function AuthSplash() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(n => n+1), 350); return () => clearInterval(t); }, []);
  const dots = ".".repeat((tick % 3) + 1);
  return (
    <div style={{ position:"fixed",inset:0,background:"#080c0a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ width:44,height:44,borderRadius:11,background:"#22c55e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#041108",boxShadow:"0 0 32px rgba(34,197,94,0.2)" }}>LC</div>
      <div style={{ fontSize:16,fontWeight:700,color:"#e8ede9",letterSpacing:"-.3px" }}>LkSGCompass</div>
      <div style={{ display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#4a6150" }}>
        <div style={{ width:13,height:13,border:"1.5px solid rgba(34,197,94,.15)",borderTopColor:"#22c55e",borderRadius:"50%",animation:"sp 0.65s linear infinite" }}/>
        Authentifizierung{dots}
      </div>
      <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
