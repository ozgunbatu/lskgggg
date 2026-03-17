"use client";
import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: string | null; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error?.message || "Unexpected error" };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("[ErrorBoundary]", error?.message, info?.componentStack?.slice(0, 200));
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        minHeight: 240, gap: 16, padding: 32,
      }}>
        <div style={{ fontSize: 36 }}>⚠️</div>
        <div style={{ fontWeight: 700, fontSize: 16 }}>Something went wrong</div>
        <div style={{ fontSize: 13, color: "#6B7280", maxWidth: 400, textAlign: "center" }}>
          {this.state.error}
        </div>
        <button
          onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
          style={{
            background: "#1B3D2B", color: "#fff", border: "none",
            borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontWeight: 600,
          }}
        >
          Reload page
        </button>
      </div>
    );
  }
}
