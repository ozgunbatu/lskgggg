/**
 * Debug endpoint — confirms proxy is deployed and shows backend URL
 * Visit: https://www.lksgcompass.de/api/debug
 * DELETE THIS FILE after debugging is complete.
 */
import { NextResponse } from "next/server";

const BACKEND =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_URL ||
  "https://api.lksgcompass.de";

export async function GET() {
  let backendStatus = "unreachable";
  let backendResp = "";

  try {
    const r = await fetch(`${BACKEND}/ping`, { cache: "no-store" });
    backendStatus = r.ok ? "ok" : `http-${r.status}`;
    backendResp = await r.text();
  } catch (e: any) {
    backendStatus = `error: ${e?.message}`;
  }

  return NextResponse.json({
    proxyDeployed: true,
    backendUrl: BACKEND,
    backendStatus,
    backendResponse: backendResp,
    env_NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "(not set)",
    env_BACKEND_URL: process.env.BACKEND_URL || "(not set)",
    timestamp: new Date().toISOString(),
  });
}

export const dynamic = "force-dynamic";
