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

type OfferForPayment = {
  id: string;
  title: string;
  amount_cents: number;
};

interface AcceptOfferPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: OfferForPayment | null;
  onSuccess: () => void | Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

function PaymentForm({
  offer,
  onSuccess,
  onCancel,
}: {
  offer: OfferForPayment;
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

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url:
          typeof window !== "undefined"
            ? `${window.location.origin}/dashboard/offers/payment-return`
            : "",
      },
    });

    if (confirmError) {
      setErrorMessage(confirmError.message ?? "Payment failed");
      setIsProcessing(false);
      return;
    }

    await onSuccess();
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
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
              Pay ${(offer.amount_cents / 100).toFixed(2)} & Accept
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AcceptOfferPaymentDialog({
  open,
  onOpenChange,
  offer,
  onSuccess,
  getAccessToken,
}: AcceptOfferPaymentDialogProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !offer) {
      setClientSecret(null);
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
          setError("Please sign in to pay");
          return;
        }

        const res = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ offerId: offer.id }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Failed to create payment");
          return;
        }

        if (!cancelled && data.clientSecret) {
          setClientSecret(data.clientSecret);
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
  }, [open, offer?.id, getAccessToken]);

  const handleSuccess = async () => {
    await onSuccess();
    toast.success("Payment successful! Offer accepted.");
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!offer) return null;

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
            Pay for Offer
          </DialogTitle>
          <DialogDescription>
            Complete payment to accept &quot;{offer.title}&quot; — ${(offer.amount_cents / 100).toFixed(2)}
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
        ) : clientSecret && options ? (
          <Elements stripe={stripePromise} options={options}>
            <PaymentForm
              offer={offer}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </Elements>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
