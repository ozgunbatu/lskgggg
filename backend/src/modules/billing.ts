/**
 * Billing — Stripe integration
 * Plans: Free | Pro (€149/mo) | Enterprise (€499/mo)
 */
import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth } from "../middleware/auth";

const router = Router();

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || "";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const PRO_PRICE = process.env.STRIPE_PRO_PRICE_ID || "";
const ENT_PRICE = process.env.STRIPE_ENTERPRISE_PRICE_ID || "";
const APP_URL = process.env.PUBLIC_APP_URL || "https://lksgcompass.de";

let stripe: any = null;
async function getStripe() {
  if (!STRIPE_SECRET || STRIPE_SECRET.length < 10) return null;
  if (!stripe) {
    try {
      const { default: Stripe } = await import("stripe");
      stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2026-02-25.clover" });
    } catch { return null; }
  }
  return stripe;
}

async function ensureTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      plan TEXT NOT NULL DEFAULT 'free',
      status TEXT NOT NULL DEFAULT 'active',
      trial_ends_at TIMESTAMPTZ,
      current_period_end TIMESTAMPTZ,
      cancel_at_period_end BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(company_id)
    );
    CREATE INDEX IF NOT EXISTS idx_sub_company ON subscriptions(company_id);
    CREATE INDEX IF NOT EXISTS idx_sub_stripe ON subscriptions(stripe_subscription_id);
  `);
}

// GET /billing/status
router.get("/status", requireAuth, async (req, res) => {
  try {
    await ensureTables();
    const { companyId } = req.auth!;
    const r = await db.query(
      "SELECT * FROM subscriptions WHERE company_id=$1",
      [companyId]
    );
    if (!r.rows.length) {
      // Free plan — ensure row exists
      await db.query(
        "INSERT INTO subscriptions(company_id, plan, status) VALUES($1,'free','active') ON CONFLICT(company_id) DO NOTHING",
        [companyId]
      );
      return res.json({ plan: "free", status: "active", stripeEnabled: !!STRIPE_SECRET });
    }
    const sub = r.rows[0];
    res.json({
      plan: sub.plan,
      status: sub.status,
      trialEndsAt: sub.trial_ends_at,
      currentPeriodEnd: sub.current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      stripeEnabled: !!STRIPE_SECRET,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /billing/create-checkout — start Stripe checkout
router.post("/create-checkout", requireAuth, async (req, res) => {
  try {
    await ensureTables();
    const s = await getStripe();
    if (!s) return res.status(503).json({ error: "Billing not configured. Set STRIPE_SECRET_KEY." });

    const { plan } = req.body; // "pro" | "enterprise"
    const priceId = plan === "enterprise" ? ENT_PRICE : PRO_PRICE;
    if (!priceId) return res.status(400).json({ error: "Price ID not configured for this plan." });

    const { companyId, email } = req.auth!;
    const co = await db.query("SELECT name FROM companies WHERE id=$1", [companyId]);
    const companyName = co.rows[0]?.name || "";

    // Get or create Stripe customer
    let sub = (await db.query("SELECT * FROM subscriptions WHERE company_id=$1", [companyId])).rows[0];
    let customerId = sub?.stripe_customer_id;

    if (!customerId) {
      const customer = await s.customers.create({
        email: email || undefined,
        name: companyName,
        metadata: { company_id: companyId },
      });
      customerId = customer.id;
    }

    const session = await s.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/app/settings?billing=success`,
      cancel_url: `${APP_URL}/app/settings?billing=cancelled`,
      subscription_data: {
        trial_period_days: 14,
        metadata: { company_id: companyId },
      },
      metadata: { company_id: companyId, plan },
    });

    res.json({ url: session.url });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /billing/portal — Stripe billing portal (manage/cancel)
router.post("/portal", requireAuth, async (req, res) => {
  try {
    const s = await getStripe();
    if (!s) return res.status(503).json({ error: "Billing not configured." });

    const sub = (await db.query("SELECT * FROM subscriptions WHERE company_id=$1", [req.auth!.companyId])).rows[0];
    if (!sub?.stripe_customer_id) return res.status(400).json({ error: "No billing account found." });

    const session = await s.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${APP_URL}/app/settings`,
    });
    res.json({ url: session.url });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /billing/webhook — Stripe webhook handler
router.post("/webhook", async (req, res) => {
  const s = await getStripe();
  if (!s || !WEBHOOK_SECRET) return res.status(200).json({ received: true });

  let event: any;
  try {
    event = s.webhooks.constructEvent(req.body, req.headers["stripe-signature"], WEBHOOK_SECRET);
  } catch (e: any) {
    return res.status(400).json({ error: `Webhook signature failed: ${e.message}` });
  }

  await ensureTables();

  const obj = event.data.object;
  const companyId = obj.metadata?.company_id;
  if (!companyId) return res.json({ received: true });

  switch (event.type) {
    case "checkout.session.completed": {
      const plan = obj.metadata?.plan || "pro";
      await db.query(
        `INSERT INTO subscriptions(company_id, stripe_customer_id, stripe_subscription_id, plan, status)
         VALUES($1,$2,$3,$4,'active')
         ON CONFLICT(company_id) DO UPDATE SET
           stripe_customer_id=$2, stripe_subscription_id=$3, plan=$4, status='active', updated_at=now()`,
        [companyId, obj.customer, obj.subscription, plan]
      );
      break;
    }
    case "customer.subscription.updated": {
      const plan = obj.metadata?.plan || "pro";
      const endsAt = obj.current_period_end ? new Date(obj.current_period_end * 1000) : null;
      const trialEnd = obj.trial_end ? new Date(obj.trial_end * 1000) : null;
      await db.query(
        `UPDATE subscriptions SET plan=$1, status=$2, current_period_end=$3,
         trial_ends_at=$4, cancel_at_period_end=$5, updated_at=now()
         WHERE company_id=$6`,
        [plan, obj.status, endsAt, trialEnd, obj.cancel_at_period_end, companyId]
      );
      break;
    }
    case "customer.subscription.deleted": {
      await db.query(
        "UPDATE subscriptions SET plan='free', status='cancelled', updated_at=now() WHERE company_id=$1",
        [companyId]
      );
      break;
    }
  }
  res.json({ received: true });
});

export default router;
