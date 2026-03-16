"use client";

export default function AuthSplash() {
  return (
    <div style={{ minHeight: "100vh", background: "#F4F7F4", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #E2E8E2", borderTopColor: "#1B3D2B", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
