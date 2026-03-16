"use client";

export default function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div style={{
      background: "var(--bg-1)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-xl)",
      padding: 20,
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            style={{
              height: i === 0 ? 16 : 12,
              width: i === 0 ? "45%" : `${60 + Math.sin(i) * 25}%`,
              borderRadius: 6,
              background: "var(--bg-3)",
              animation: `pulse 1.5s ease-in-out ${i * 0.1}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.8}}`}</style>
    </div>
  );
}
