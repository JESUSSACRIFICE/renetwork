"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

function CrowdfundingPaymentReturnContent() {
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

      const res = await fetch("/api/stripe/confirm-crowdfunding-payment", {
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
        setMessage(data.error ?? "Failed to confirm investment.");
        return;
      }

      setStatus("success");
      setTimeout(() => router.push("/dashboard/crowdfunding"), 2000);
    })();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      {status === "loading" && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Completing your investment...</p>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
          <p className="font-semibold text-lg">Investment successful!</p>
          <p className="text-muted-foreground text-sm">Redirecting to your dashboard...</p>
        </>
      )}
      {status === "error" && (
        <>
          <p className="text-destructive font-medium">{message}</p>
          <Link
            href="/crowdfund/projects"
            className="mt-4 text-sky-600 hover:underline font-medium"
          >
            Back to projects
          </Link>
        </>
      )}
    </div>
  );
}

export default function CrowdfundingPaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <CrowdfundingPaymentReturnContent />
    </Suspense>
  );
}
