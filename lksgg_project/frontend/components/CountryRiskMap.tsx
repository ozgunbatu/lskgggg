"use client";

import { useEffect, useMemo, useState } from "react";
import Map, { Layer, Source } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL!;

type CountryRisk = { iso2: string; score: number; tier: "low" | "medium" | "high" };

function bandColor(score: number) {
  if (score >= 70) return "#C0392B";
  if (score >= 45) return "#B45309";
  return "#2A5C3F";
}

export default function CountryRiskMap() {
  const [data, setData] = useState<CountryRisk[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = getToken();
        const r = await fetch(`${API}/countries/risks`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "Failed to load country risks");
        if (mounted) setData(j.data || []);
      } catch (e: any) {
        if (mounted) setError(e.message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const fillExpression = useMemo(() => {
    const expr: any[] = ["match", ["get", "iso_3166_1"]];
    for (const c of data) expr.push(c.iso2, bandColor(c.score));
    expr.push("#E3E0D8");
    return expr;
  }, [data]);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  if (!token) {
    return (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Global Risk Map</h2>
        <p style={{ color: "var(--muted)" }}>
          Mapbox token missing. Add <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> to show the world map.
        </p>
        {error && <p style={{ color: "#C0392B" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Global Risk Map</h2>
      {error ? (
        <p style={{ color: "#C0392B" }}>{error}</p>
      ) : (
        <div style={{ height: 420, borderRadius: 16, overflow: "hidden", border: "1px solid var(--line)" }}>
          <Map
            initialViewState={{ longitude: 9, latitude: 20, zoom: 0.8 }}
            mapStyle="mapbox://styles/mapbox/light-v11"
            mapboxAccessToken={token}
            interactive={false}
          >
            <Source id="countries" type="vector" url="mapbox://mapbox.country-boundaries-v1">
              <Layer
                id="country-fill"
                type="fill"
                source-layer="country_boundaries"
                paint={{
                  "fill-color": fillExpression as any,
                  "fill-opacity": 0.8,
                }}
              />
              <Layer
                id="country-line"
                type="line"
                source-layer="country_boundaries"
                paint={{
                  "line-color": "#FFFFFF",
                  "line-width": 0.6,
                }}
              />
            </Source>
          </Map>
        </div>
      )}
    </div>
  );
}
