import { Router } from "express";
import { db } from "../lib/db";
import { ensureCountrySeed } from "../risk/countryRepo";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Authenticated endpoint: country risk heatmap
router.get("/risks", requireAuth, (_req, res) => {
  (async () => {
    await ensureCountrySeed();
    const r = await db.query(
      "SELECT iso2, country_name, risk_score, risk_level, source, components, updated_at FROM country_risks ORDER BY iso2"
    );
    res.json({ version: "1.0", count: r.rows.length, data: r.rows });
  })().catch(e => res.status(500).json({ error: "countries_risks_failed", detail: String(e?.message || e) }));
});

export default router;
