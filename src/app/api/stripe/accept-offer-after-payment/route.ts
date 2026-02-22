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

    // Create Supabase client with user's JWT so RLS allows updating offers
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

    const offerId = paymentIntent.metadata?.offer_id;
    if (!offerId) {
      return NextResponse.json({ error: "Invalid payment" }, { status: 400 });
    }

    if (paymentIntent.metadata?.recipient_id !== user.id) {
      return NextResponse.json({ error: "Payment does not belong to you" }, { status: 403 });
    }

    const { data: offer, error: updateError } = await supabase
      .from("offers")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", offerId)
      .eq("recipient_id", user.id)
      .eq("status", "pending")
      .select("*")
      .single();

    if (updateError || !offer) {
      return NextResponse.json({ error: "Failed to accept offer or already accepted" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("accept-offer-after-payment error:", err);
    const message = err instanceof Error ? err.message : "Failed to accept offer";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
