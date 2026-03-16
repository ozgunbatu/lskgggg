import { Pool } from "pg";

function cleanUrl(raw: string): string {
  if (!raw) return "";
  try {
    const u = new URL(raw);
    u.searchParams.delete("sslmode");
    u.searchParams.delete("channel_binding");
    u.searchParams.delete("connect_timeout");
    const clean = u.toString();
    console.log("[db] host:", u.hostname, "db:", u.pathname.slice(1));
    return clean;
  } catch {
    return raw
      .replace(/[?&]sslmode=[^&]*/g, "")
      .replace(/[?&]channel_binding=[^&]*/g, "")
      .replace(/&&+/g, "&")
      .replace(/\?&/, "?")
      .replace(/[?&]$/, "");
  }
}

const DATABASE_URL = process.env.DATABASE_URL || "";
if (!DATABASE_URL) console.warn("[db] WARNING: DATABASE_URL not set!");

export const db = new Pool({
  connectionString: cleanUrl(DATABASE_URL),
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

db.on("error", (err) => {
  console.error("[db] pool error:", err.message?.slice(0, 120));
});

export async function healthcheck() {
  const r = await db.query("SELECT 1 as ok");
  return r.rows[0]?.ok === 1;
}
