"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useReferralCommissions } from "@/hooks/use-referrals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Users, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export default function EarningsPage() {
  const { user } = useAuth();

  const { commissions, isLoading: commissionsLoading } = useReferralCommissions(
    user?.id ?? undefined,
  );

  const { data: offerEarnings, isLoading: offersLoading } = useQuery({
    queryKey: ["earnings", "offers", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("offers")
        .select(
          "id, title, amount_cents, status, accepted_at, created_at, recipient_id",
        )
        .eq("sender_id", user.id)
        .in("status", ["accepted", "completed"])
        .order("accepted_at", { ascending: false });

      if (error) throw error;

      const offers = (data ?? []) as Array<{
        id: string;
        title: string;
        amount_cents: number;
        status: string;
        accepted_at: string | null;
        created_at: string | null;
        recipient_id: string;
      }>;

      if (offers.length > 0) {
        const recipientIds = [...new Set(offers.map((o) => o.recipient_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", recipientIds);
        const nameMap = (profiles ?? []).reduce(
          (
            acc: Record<string, string>,
            p: { id: string; full_name: string | null },
          ) => {
            acc[p.id] = p.full_name ?? "Client";
            return acc;
          },
          {},
        );
        return offers.map((o) => ({
          ...o,
          recipient_name: nameMap[o.recipient_id] ?? "Client",
        }));
      }
      return offers;
    },
    enabled: !!user?.id,
  });

  const referralPaidCents = commissions
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + (c.amount_cents ?? 0), 0);
  const referralPendingCents = commissions
    .filter((c) => c.status === "pending" || c.status === "approved")
    .reduce((sum, c) => sum + (c.amount_cents ?? 0), 0);

  const offerEarnedCents =
    offerEarnings?.reduce((sum, o) => sum + o.amount_cents, 0) ?? 0;

  const totalEarnedCents = referralPaidCents + offerEarnedCents;
  const totalPendingCents = referralPendingCents;

  const isLoading = commissionsLoading || offersLoading;

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Earnings</h1>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Earnings</h1>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earned
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalEarnedCents)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From offers + referral commissions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              From Offers
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(offerEarnedCents)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Accepted & completed offers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalPendingCents)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Referral commissions (pending/approved)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Offer Earnings
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Payments received from accepted offers
            </p>
          </CardHeader>
          <CardContent>
            {!offerEarnings || offerEarnings.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">
                No offer earnings yet. Earnings appear when clients accept and
                pay for your offers.
              </p>
            ) : (
              <div className="space-y-4">
                {offerEarnings.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">{o.title}</p>
                      <p className="text-sm text-muted-foreground">
                        To{" "}
                        {(o as { recipient_name?: string }).recipient_name ??
                          "Client"}
                        {o.accepted_at && (
                          <>
                            {" "}
                            · {format(new Date(o.accepted_at), "MMM d, yyyy")}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(o.amount_cents)}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {o.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Referral Commissions
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Earned when your referrals convert
            </p>
          </CardHeader>
          <CardContent>
            {commissions.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">
                No referral commissions yet. Share your referral link to earn
                when leads convert.
              </p>
            ) : (
              <div className="space-y-4">
                {commissions.map(
                  (c: {
                    id: string;
                    amount_cents: number;
                    status: string;
                    paid_at: string | null;
                    created_at: string;
                    recipient?: { full_name?: string };
                  }) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium">
                          {formatCurrency(c.amount_cents ?? 0)} referral
                          commission
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {c.recipient?.full_name &&
                            `From ${c.recipient.full_name} · `}
                          {format(new Date(c.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Badge
                        variant={
                          c.status === "paid"
                            ? "default"
                            : c.status === "approved"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {c.status}
                      </Badge>
                    </div>
                  ),
                )}
              </div>
            )}
            <div className="mt-4 pt-4 border-t">
              <a
                href="/dashboard/referral"
                className="text-sm font-medium text-primary hover:underline"
              >
                View full referral dashboard →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
