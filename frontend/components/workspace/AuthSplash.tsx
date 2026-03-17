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
      position: "fixed", inset: 0,
      background: "#f4f5f4",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 14, fontFamily: "'DM Sans',sans-serif",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: "#1B3D2B",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 17, fontWeight: 800, color: "#fff",
        boxShadow: "0 4px 20px rgba(27,61,43,0.25)",
        letterSpacing: -1,
      }}>LC</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#0b0f0c", letterSpacing: -0.3 }}>
        LkSGCompass
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6b7280" }}>
        <div style={{
          width: 14, height: 14,
          border: "2px solid #d1e7d9",
          borderTopColor: "#1B3D2B",
          borderRadius: "50%",
          animation: "splash-spin 0.65s linear infinite",
        }}/>
        Authentifizierung{dots}
      </div>
      <style>{`@keyframes splash-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
