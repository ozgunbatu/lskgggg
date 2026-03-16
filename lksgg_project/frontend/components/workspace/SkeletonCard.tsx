"use client";

export default function SkeletonCard({ rows = 3, height = 16 }: { rows?: number; height?: number }) {
  return (
    <div className="card" style={{ pointerEvents: "none" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height,
            borderRadius: 6,
            background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "skeleton-shimmer 1.4s infinite",
            marginBottom: i < rows - 1 ? 10 : 0,
            width: i === rows - 1 ? "60%" : "100%",
          }}
        />
      ))}
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
      `}</style>
    </div>
  );
}
