"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle } from "lucide-react";

export default function PaymentReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const paymentIntent = searchParams.get("payment_intent");
    const redirectStatus = searchParams.get("redirect_status");

    if (!paymentIntent || redirectStatus !== "succeeded") {
      setStatus("error");
      setMessage("Payment could not be verified.");
      return;
    }

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setStatus("error");
        setMessage("Please sign in.");
        return;
      }

      const res = await fetch("/api/stripe/accept-offer-after-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentIntentId: paymentIntent }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Failed to accept offer.");
        return;
      }

      setStatus("success");
      setTimeout(() => router.push("/dashboard/offers"), 2000);
    })();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] p-8">
      {status === "loading" && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Completing your payment...</p>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
          <p className="font-semibold text-lg">Payment successful!</p>
          <p className="text-muted-foreground text-sm">Offer accepted. Redirecting...</p>
        </>
      )}
      {status === "error" && (
        <>
          <p className="text-destructive font-medium">{message}</p>
          <button
            onClick={() => router.push("/dashboard/offers")}
            className="mt-4 text-primary hover:underline"
          >
            Back to Offers
          </button>
        </>
      )}
    </div>
  );
}
