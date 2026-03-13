import dotenv from "dotenv";
dotenv.config();
import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function run() {
  console.log("[seed] starting...");

  const company = await db.query(`
    INSERT INTO companies (name, slug, industry, size_employees, address_city, address_country)
    VALUES ('Demo Manufacturing GmbH', 'demo-manufacturing', 'Industrielle Komponenten', 350, 'München', 'Deutschland')
    ON CONFLICT (slug) DO UPDATE SET updated_at = now()
    RETURNING id
  `);
  const companyId = company.rows[0].id;

  const passwordHash = await bcrypt.hash(process.env.DEMO_PASSWORD || "demo12345", 10);
  await db.query(`
    INSERT INTO users (company_id, email, password_hash, role)
    VALUES ($1, $2, $3, 'admin')
    ON CONFLICT (email) DO NOTHING
  `, [companyId, process.env.DEMO_EMAIL || "demo@lksgcompass.com", passwordHash]);

  // Seed suppliers with correct column names
  const suppliers = [
    { name: "Anatolia Textiles A.Ş.", country: "Turkey", industry: "textiles", spend: 180000, workers: 240, audit: false, coc: true },
    { name: "Guangzhou Components Ltd.", country: "China", industry: "electronics", spend: 540000, workers: 1800, audit: false, coc: false },
    { name: "Bavaria Logistics GmbH", country: "Germany", industry: "logistics", spend: 90000, workers: 35, audit: true, coc: true },
    { name: "Eastern Steel Works Sp. z o.o.", country: "Poland", industry: "manufacturing", spend: 320000, workers: 420, audit: false, coc: true },
    { name: "Hanoi Tech Solutions", country: "Vietnam", industry: "electronics", spend: 210000, workers: 650, audit: false, coc: false },
  ];

  for (const s of suppliers) {
    await db.query(`
      INSERT INTO suppliers (company_id, name, country, industry, annual_spend_eur, workers, has_audit, has_code_of_conduct, risk_score, risk_level)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 'unknown')
      ON CONFLICT (company_id, name) DO NOTHING
    `, [companyId, s.name, s.country, s.industry, s.spend, s.workers, s.audit, s.coc]).catch(() => {});
  }

  // Seed one open complaint
  await db.query(`
    INSERT INTO complaints (company_id, category, description, status, severity, source, reference_number)
    VALUES ($1, 'working_conditions', 'Berichte über Überstunden ohne Bezahlung bei einem Tier-1-Lieferanten.', 'open', 'high', 'internal', 'REF-2024-001')
    ON CONFLICT DO NOTHING
  `, [companyId]).catch(() => {});

  console.log("[seed] ✅ demo data ready");
  console.log(`[seed]   company: Demo Manufacturing GmbH (slug: demo-manufacturing)`);
  console.log(`[seed]   login:   ${process.env.DEMO_EMAIL || "demo@lksgcompass.com"} / ${process.env.DEMO_PASSWORD || "demo12345"}`);
  await db.end();
}

run().catch(async (err) => {
  console.error("[seed] failed:", err.message);
  try { await db.end(); } catch {}
  process.exit(1);
});
