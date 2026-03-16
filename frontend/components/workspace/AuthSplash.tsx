"use client";
import { useEffect, useState } from "react";

export default function AuthSplash() {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const t = setInterval(() => setDots(d => d === 3 ? 1 : d + 1), 400);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 16,
      zIndex: 9999,
    }}>
      {/* Logo */}
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        background: "linear-gradient(135deg, #1a4a2e 0%, #2d7a4f 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        fontWeight: 800,
        color: "var(--g)",
        border: "1px solid var(--g-border)",
        boxShadow: "0 0 24px rgba(110,231,160,0.15)",
        marginBottom: 8,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        LC
      </div>

      {/* Brand */}
      <div style={{
        fontSize: 17,
        fontWeight: 700,
        color: "var(--t1)",
        letterSpacing: "-0.03em",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        LkSGCompass
      </div>

      {/* Loading */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        color: "var(--t3)",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          width: 16,
          height: 16,
          border: "2px solid rgba(110,231,160,0.15)",
          borderTopColor: "var(--g2)",
          borderRadius: "50%",
          animation: "spin 0.6s linear infinite",
        }} />
        Lade{".".repeat(dots)}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
