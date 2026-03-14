export default function Loading() {
  return (
    <div style={{ minHeight: "100vh", background: "#f4f5f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 24, height: 24, border: "3px solid rgba(27,61,43,.15)", borderTopColor: "#1B3D2B", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
