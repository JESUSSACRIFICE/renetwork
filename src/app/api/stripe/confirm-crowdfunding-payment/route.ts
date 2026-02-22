import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

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

    const supabase = createClient<Database>(
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
    const { paymentIntentId } = body;
    if (!paymentIntentId || typeof paymentIntentId !== "string") {
      return NextResponse.json({ error: "paymentIntentId is required" }, { status: 400 });
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    if (paymentIntent.metadata?.type !== "crowdfunding_invest") {
      return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
    }

    const projectId = paymentIntent.metadata?.project_id;
    if (!projectId) {
      return NextResponse.json({ error: "Invalid payment" }, { status: 400 });
    }

    if (paymentIntent.metadata?.user_id !== user.id) {
      return NextResponse.json({ error: "Payment does not belong to you" }, { status: 403 });
    }

    const amountCents = paymentIntent.amount;

    const { data: pledge, error: pledgeError } = await supabase
      .from("crowdfunding_pledges")
      .upsert(
        {
          project_id: projectId,
          user_id: user.id,
          amount_cents: amountCents,
          status: "confirmed",
        },
        { onConflict: "project_id,user_id" }
      )
      .select()
      .single();

    if (pledgeError || !pledge) {
      return NextResponse.json({ error: "Failed to record investment" }, { status: 500 });
    }

    const { data: project } = await supabase
      .from("crowdfunding_projects")
      .select("title")
      .eq("id", projectId)
      .single();

    await supabase.from("crowdfunding_notifications").insert({
      user_id: user.id,
      project_id: projectId,
      pledge_id: pledge.id,
      type: "project_update",
      title: "Investment confirmed",
      message: `Your investment of $${(amountCents / 100).toFixed(2)} in ${project?.title ?? "project"} has been confirmed.`,
    });

    return NextResponse.json({ success: true, pledge });
  } catch (err: unknown) {
    console.error("confirm-crowdfunding-payment error:", err);
    const message = err instanceof Error ? err.message : "Failed to confirm payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
