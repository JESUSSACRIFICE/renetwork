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

    // Create Supabase client with user's JWT so RLS allows reading offers
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
    const { offerId } = body;
    if (!offerId || typeof offerId !== "string") {
      return NextResponse.json({ error: "offerId is required" }, { status: 400 });
    }

    const { data: offer, error: offerError } = await supabase
      .from("offers")
      .select("id, amount_cents, recipient_id, sender_id, status, title")
      .eq("id", offerId)
      .single();

    if (offerError || !offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    if (offer.recipient_id !== user.id) {
      return NextResponse.json({ error: "You can only pay for offers sent to you" }, { status: 403 });
    }

    if (offer.status !== "pending") {
      return NextResponse.json({ error: "Offer is no longer pending" }, { status: 400 });
    }

    if (offer.amount_cents < 50) {
      return NextResponse.json({ error: "Minimum amount is $0.50" }, { status: 400 });
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: offer.amount_cents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        offer_id: offer.id,
        recipient_id: user.id,
        sender_id: offer.sender_id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err: unknown) {
    console.error("create-payment-intent error:", err);
    const message = err instanceof Error ? err.message : "Failed to create payment intent";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
