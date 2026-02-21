"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-professional-profiles";
import { useAllOffers, useChatOffers, type OfferWithParty } from "@/hooks/use-chat-offers";
import { AcceptOfferPaymentDialog } from "@/components/professional/AcceptOfferPaymentDialog";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { FileText, Loader2, Clock, CheckCircle, Check, X, CheckCircle2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

type UserType = "service_provider" | "agent";

function OfferCard({
  offer,
  isServiceProvider,
  userId,
  onMarkComplete,
  onRespondToCompletion,
  onPayAndAccept,
  isMarkingComplete,
  isRespondingToCompletion,
}: {
  offer: OfferWithParty;
  isServiceProvider: boolean;
  userId: string;
  onMarkComplete: (offerId: string) => void;
  onRespondToCompletion: (params: { offerId: string; accept: boolean }) => void;
  onPayAndAccept?: (offer: { id: string; title: string; amount_cents: number }) => void;
  isMarkingComplete: boolean;
  isRespondingToCompletion: boolean;
}) {
  const isSender = offer.sender_id === userId;
  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    accepted: "bg-green-100 text-green-800",
    declined: "bg-gray-100 text-gray-600",
    withdrawn: "bg-gray-100 text-gray-500",
    completion_requested: "bg-blue-100 text-blue-800",
    completed: "bg-emerald-100 text-emerald-800",
  };
  const acceptedAt = offer.accepted_at;
  const deliveryDays = offer.delivery_days;
  const completionRequestedAt = offer.completion_requested_at;
  const canMarkComplete = isServiceProvider && isSender && offer.status === "accepted";
  const canRespondToCompletion =
    !isServiceProvider && !isSender && offer.status === "completion_requested";
  const canPayAndAccept =
    !isServiceProvider && !isSender && offer.status === "pending" && onPayAndAccept;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-start gap-4 min-w-0">
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage src={offer.otherParty.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {offer.otherParty.full_name?.charAt(0) ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{offer.title}</p>
              <p className="text-sm text-muted-foreground">
                {isSender ? "To" : "From"}{" "}
                {offer.otherParty.full_name ?? "Unknown"}
              </p>
              {offer.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {offer.description}
                </p>
              )}
              <p className="text-sm font-medium mt-1">
                ${(offer.amount_cents / 100).toFixed(2)}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge className={statusColors[offer.status] ?? "bg-gray-100"}>
                  {offer.status.replace("_", " ")}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(offer.created_at ?? 0), "MMM d, yyyy h:mm a")}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {(acceptedAt || deliveryDays || completionRequestedAt || offer.status === "completed") && (
            <div className="border-t bg-muted/30 px-4 py-3 rounded-b-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2">Timeline</p>
              <div className="flex flex-wrap gap-4 text-sm">
                {acceptedAt && (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Accepted {format(new Date(acceptedAt), "MMM d, h:mm a")}
                  </span>
                )}
                {deliveryDays && acceptedAt && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    Est. {deliveryDays} day{deliveryDays !== 1 ? "s" : ""} delivery
                  </span>
                )}
                {completionRequestedAt && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Completion requested{" "}
                    {format(new Date(completionRequestedAt), "MMM d, h:mm a")}
                  </span>
                )}
                {offer.status === "completed" && (
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {canPayAndAccept && (
              <Button
                size="sm"
                onClick={() =>
                  onPayAndAccept!({
                    id: offer.id,
                    title: offer.title,
                    amount_cents: offer.amount_cents,
                  })
                }
              >
                <Check className="h-4 w-4 mr-2" />
                Pay & Accept
              </Button>
            )}
            {canMarkComplete && (
              <Button
                size="sm"
                onClick={() => onMarkComplete(offer.id)}
                disabled={isMarkingComplete}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark as complete
              </Button>
            )}
            {canRespondToCompletion && (
              <>
                <Button
                  size="sm"
                  onClick={() => onRespondToCompletion({ offerId: offer.id, accept: true })}
                  disabled={isRespondingToCompletion}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept completion
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRespondToCompletion({ offerId: offer.id, accept: false })}
                  disabled={isRespondingToCompletion}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            <Link href={`/dashboard/messages?recipient=${offer.otherParty.id}`}>
              <Button variant="secondary" size="sm">
                Open in Messages
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OffersPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id ?? null);
  const userType: UserType =
    profile?.user_roles?.length ? "service_provider" : "agent";
  const { offers, isLoading } = useAllOffers(user?.id ?? null);
  const {
    markComplete,
    isMarkingComplete,
    respondToCompletion,
    isRespondingToCompletion,
    respondToOffer,
  } = useChatOffers(user?.id ?? null, null);
  const [paymentOffer, setPaymentOffer] = useState<{
    id: string;
    title: string;
    amount_cents: number;
  } | null>(null);

  const pageTitle =
    userType === "service_provider" ? "Offers Sent" : "Offers Received";
  const pageDescription =
    userType === "service_provider"
      ? "Offers you've sent to customers. Mark complete when done; customer will accept or reject."
      : "Offers from service providers. Accept or decline in messages. Approve completion when provider marks done.";

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
        <p className="text-muted-foreground mt-1">{pageDescription}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Offers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : offers.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No offers yet.{" "}
              <Link
                href="/dashboard/messages"
                className="text-primary hover:underline"
              >
                Go to Messages
              </Link>{" "}
              to send or receive offers.
            </p>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  isServiceProvider={userType === "service_provider"}
                  userId={user!.id}
                        onMarkComplete={markComplete}
                        onRespondToCompletion={respondToCompletion}
                        onPayAndAccept={(o) => setPaymentOffer(o)}
                        isMarkingComplete={isMarkingComplete}
                        isRespondingToCompletion={isRespondingToCompletion}
                      />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {paymentOffer && (
        <AcceptOfferPaymentDialog
          open={!!paymentOffer}
          onOpenChange={(open) => !open && setPaymentOffer(null)}
          offer={paymentOffer}
          onSuccess={() => {
            respondToOffer({
              offerId: paymentOffer.id,
              status: "accepted",
            });
            setPaymentOffer(null);
          }}
          getAccessToken={async () => {
            const { data: { session } } = await supabase.auth.getSession();
            return session?.access_token ?? null;
          }}
        />
      )}
    </div>
  );
}
