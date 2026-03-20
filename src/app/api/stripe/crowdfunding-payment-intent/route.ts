import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY ?? process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key);
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Intentionally avoid `createClient<Database>` here: the generated Database
    // types can be incomplete/out-of-sync for niche tables, which can cause
    // TypeScript to hit "excessively deep" inference on queries.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, amountCents } = body;
    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }
    const amount = Math.round(Number(amountCents));
    if (!Number.isFinite(amount) || amount < 100) {
      return NextResponse.json({ error: "Amount must be at least $1.00" }, { status: 400 });
    }

    const { data: project, error: projectError } = await supabase
      .from("crowdfunding_projects")
      .select("id, title, min_investment_cents, status")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.status !== "active" && project.status !== "funded") {
      return NextResponse.json({ error: "Project is not accepting investments" }, { status: 400 });
    }

    if (amount < project.min_investment_cents) {
      return NextResponse.json(
        { error: `Minimum investment is $${(project.min_investment_cents / 100).toFixed(2)}` },
        { status: 400 }
      );
    }

    const { data: compliance } = await supabase
      .from("investor_compliance")
      .select("annual_income_cents, net_worth_cents, is_accredited, risk_acknowledged_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!compliance) {
      return NextResponse.json(
        { error: "Complete your investor profile before investing" },
        { status: 400 }
      );
    }
    if (!compliance.risk_acknowledged_at) {
      return NextResponse.json(
        { error: "Acknowledge investment risks before investing" },
        { status: 400 }
      );
    }
    const hasFinancials =
      compliance.is_accredited ||
      (compliance.annual_income_cents != null && compliance.net_worth_cents != null);
    if (!hasFinancials) {
      return NextResponse.json(
        { error: "Provide income and net worth for investment limit calculation" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        type: "crowdfunding_invest",
        project_id: projectId,
        user_id: user.id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err: unknown) {
    console.error("crowdfunding-payment-intent error:", err);
    const message = err instanceof Error ? err.message : "Failed to create payment intent";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
