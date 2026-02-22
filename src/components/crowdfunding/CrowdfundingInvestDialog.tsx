"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

interface CrowdfundingInvestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  amountCents: number;
  getAccessToken: () => Promise<string | null>;
  onSuccess: () => void | Promise<void>;
}

function PaymentForm({
  projectTitle,
  amountCents,
  paymentIntentId,
  getAccessToken,
  onSuccess,
  onCancel,
}: {
  projectTitle: string;
  amountCents: number;
  paymentIntentId: string;
  getAccessToken: () => Promise<string | null>;
  onSuccess: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await elements.submit();
    if (error) {
      setErrorMessage(error.message ?? "Validation failed");
      setIsProcessing(false);
      return;
    }

    const returnUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/crowdfund/payment-return`
        : "";

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (confirmError) {
      setErrorMessage(confirmError.message ?? "Payment failed");
      setIsProcessing(false);
      return;
    }

    // Inline success (no redirect): confirm payment and create pledge
    const token = await getAccessToken();
    if (token) {
      const res = await fetch("/api/stripe/confirm-crowdfunding-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentIntentId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(data.error ?? "Failed to record investment");
        setIsProcessing(false);
        return;
      }
    }

    await onSuccess();
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: "tabs" }} />
      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Invest ${(amountCents / 100).toFixed(2)}
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CrowdfundingInvestDialog({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  amountCents,
  getAccessToken,
  onSuccess,
}: CrowdfundingInvestDialogProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !projectId || amountCents < 100) {
      setClientSecret(null);
      setPaymentIntentId(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          setError("Please sign in to invest");
          return;
        }

        const res = await fetch("/api/stripe/crowdfunding-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ projectId, amountCents }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Failed to create payment");
          return;
        }

        if (!cancelled && data.clientSecret) {
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load payment form");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, projectId, amountCents, getAccessToken]);

  const handleSuccess = async () => {
    await onSuccess();
    toast.success("Investment successful!");
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const options = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "stripe" as const,
          variables: {
            colorPrimary: "#0f172a",
          },
        },
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Invest in Project
          </DialogTitle>
          <DialogDescription>
            Complete payment to invest in &quot;{projectTitle}&quot; — ${(amountCents / 100).toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="space-y-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" onClick={handleCancel}>
              Close
            </Button>
          </div>
        ) : clientSecret && options && paymentIntentId ? (
          <Elements stripe={stripePromise} options={options}>
            <PaymentForm
              projectTitle={projectTitle}
              amountCents={amountCents}
              paymentIntentId={paymentIntentId}
              getAccessToken={getAccessToken}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </Elements>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
