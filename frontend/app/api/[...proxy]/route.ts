/**
 * UNIVERSAL PROXY — /api/* → Railway backend
 * More reliable than next.config.js rewrites on Vercel.
 */
import { NextRequest, NextResponse } from "next/server";

const BACKEND =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_URL ||
  "https://lskgggg-production.up.railway.app";

async function handler(
  req: NextRequest,
  { params }: { params: { proxy: string[] } }
) {
  const path = (params.proxy || []).join("/");
  const search = req.nextUrl.search || "";
  const url = `${BACKEND}/${path}${search}`;

  const fwdHeaders = new Headers();
  req.headers.forEach((v, k) => {
    if (!["host","connection","transfer-encoding","x-forwarded-for","x-forwarded-proto","x-forwarded-host"].includes(k.toLowerCase())) {
      fwdHeaders.set(k, v);
    }
  });

  const body = ["GET","HEAD"].includes(req.method) ? undefined : await req.arrayBuffer();

  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers: fwdHeaders,
      body: body || null,
    } as RequestInit);

    const outHeaders = new Headers();
    upstream.headers.forEach((v, k) => {
      if (!["transfer-encoding","connection","keep-alive"].includes(k.toLowerCase())) {
        outHeaders.set(k, v);
      }
    });

    return new NextResponse(await upstream.arrayBuffer(), {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: outHeaders,
    });
  } catch (err: any) {
    console.error("[proxy]", url, err?.message);
    return NextResponse.json({ error: "Backend unreachable", url }, { status: 502 });
  }
}

export const GET     = handler;
export const POST    = handler;
export const PUT     = handler;
export const PATCH   = handler;
export const DELETE  = handler;
export const OPTIONS = handler;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
