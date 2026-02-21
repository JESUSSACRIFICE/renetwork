"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReferralHeader from "@/components/referral/ReferralHeader";
import ReferralFooter from "@/components/referral/ReferralFooter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Briefcase,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Copy,
  Share2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import {
  useReferralCode,
  useReferralsSent,
  useReferralCommissions,
} from "@/hooks/use-referrals";
import { format } from "date-fns";
import { toast } from "sonner";

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function ReferralDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [userType, setUserType] = useState<"referrer" | "psp">("referrer");

  const { code: referralCode } = useReferralCode(user?.id);
  const { referrals } = useReferralsSent(user?.id);
  const { commissions } = useReferralCommissions(user?.id);

  const totalReferrals = referrals.length;
  const pendingReferrals = referrals.filter(
    (r) => r.status === "pending_acceptance" || r.status === "accepted"
  ).length;
  const convertedReferrals = referrals.filter(
    (r) => r.status === "converted",
  ).length;
  const totalEarnedCents = commissions
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + (c.amount_cents ?? 0), 0);
  const pendingCommissionCents = commissions
    .filter((c) => c.status === "pending" || c.status === "approved")
    .reduce((sum, c) => sum + (c.amount_cents ?? 0), 0);

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*, user_roles(role)")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data);
        const hasRoles = data?.user_roles && data.user_roles.length > 0;
        setUserType(hasRoles ? "psp" : "referrer");
      });
  }, [user?.id]);

  const copyReferralLink = (profileId?: string) => {
    if (!referralCode) return;
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const path = profileId ? `/profile/${profileId}` : "/referral";
    const url = `${base}${path}?ref=${referralCode}`;
    navigator.clipboard.writeText(url);
    toast.success("Referral link copied!");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-full">
      <ReferralHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Referral Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {profile?.full_name || user.email}
            </p>
          </div>

          <Tabs defaultValue={userType} onValueChange={(v) => setUserType(v as any)}>
            <TabsList>
              <TabsTrigger value="referrer">Referral Earnings</TabsTrigger>
              <TabsTrigger value="psp">Services & Leads</TabsTrigger>
            </TabsList>

            {/* Referral Earnings - Real data */}
            <TabsContent value="referrer" className="space-y-6">
              {/* Referral link card */}
              {referralCode && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Share2 className="h-5 w-5" />
                      Your Referral Link
                    </CardTitle>
                    <CardDescription>
                      Share this link when referring customers to professionals.
                      You earn commission when the lead converts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <code className="flex-1 p-3 bg-muted rounded-lg text-sm truncate">
                        {typeof window !== "undefined"
                          ? `${window.location.origin}/referral?ref=${referralCode}`
                          : `...?ref=${referralCode}`}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyReferralLink()}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Or add ?ref={referralCode} to any profile URL, e.g.
                      /profile/[id]?ref={referralCode}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Referrals
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalReferrals}</div>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pendingReferrals}</div>
                    <p className="text-xs text-muted-foreground">
                      Awaiting conversion
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Converted</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{convertedReferrals}</div>
                    <p className="text-xs text-muted-foreground">
                      Deals closed
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Earned
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCents(totalEarnedCents)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCents(pendingCommissionCents)} pending
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Referrals list */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Referrals</CardTitle>
                  <CardDescription>
                    People you referred to professionals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {referrals.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center">
                      No referrals yet. Share your link to start earning!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {referrals.map((r: any) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between border-b pb-4 last:border-0"
                        >
                          <div>
                            <p className="font-medium">
                              {r.leads?.name ?? "Unknown"} →{" "}
                              {r.recipient?.full_name ?? "Professional"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {r.created_at
                                ? format(
                                    new Date(r.created_at),
                                    "MMM d, yyyy",
                                  )
                                : ""}
                            </p>
                          </div>
                          <Badge
                            variant={
                              r.status === "converted"
                                ? "default"
                                : r.status === "pending"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {r.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Commissions list */}
              <Card>
                <CardHeader>
                  <CardTitle>Commissions</CardTitle>
                  <CardDescription>
                    Earnings when your referrals convert
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {commissions.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center">
                      No commissions yet. Referrals earn $25 when the lead
                      converts.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {commissions.map((c: any) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between border-b pb-4 last:border-0"
                        >
                          <div>
                            <p className="font-medium">
                              {formatCents(c.amount_cents ?? 0)} →{" "}
                              {c.recipient?.full_name ?? "Professional"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {c.created_at
                                ? format(
                                    new Date(c.created_at),
                                    "MMM d, yyyy",
                                  )
                                : ""}
                            </p>
                          </div>
                          <Badge
                            variant={
                              c.status === "paid"
                                ? "default"
                                : c.status === "pending"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {c.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Services & Leads - for Service Providers */}
            <TabsContent value="psp" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Services & Leads</CardTitle>
                  <CardDescription>
                    As a Service Provider, manage your services, leads, and referrals from the main dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard">
                    <Button>
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/dashboard/services/create">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Post a Service</CardTitle>
                  <CardDescription>List your services</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/referral/settings">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Manage your account</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/referral">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Referral Hub</CardTitle>
                  <CardDescription>Search and refer professionals</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </main>
      <ReferralFooter />
    </div>
  );
}
