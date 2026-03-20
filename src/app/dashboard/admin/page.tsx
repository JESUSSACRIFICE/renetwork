"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  usePhase1Metrics,
  usePendingProfiles,
  useUpdateProfileApproval,
  useOpenDisputes,
  useResolveDispute,
} from "@/hooks/use-phase1-admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShieldCheck,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";

export default function Phase1AdminPage() {
  const { user } = useAuth();
  const { data: metrics, isLoading: metricsLoading } = usePhase1Metrics();
  const { data: pendingProfiles = [], isLoading: profilesLoading } = usePendingProfiles();
  const { data: disputes = [], isLoading: disputesLoading } = useOpenDisputes();
  const updateApproval = useUpdateProfileApproval();
  const resolveDispute = useResolveDispute();

  const { data: isAdmin } = useQuery({
    queryKey: ["user", "admin", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Sign in to access this page.</p>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              This page is for administrators only. Phase-1 Admin: Approvals, Moderation,
              Analytics, Dispute Resolution.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <ShieldCheck className="h-8 w-8" />
          Phase-1 Admin
        </h1>
        <p className="text-muted-foreground">
          Approvals, Moderation, Analytics, Dispute Resolution
        </p>
      </div>

      <Tabs defaultValue="approvals">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>PSP Profile Approvals</CardTitle>
              <CardDescription>
                Approve or reject service provider profiles for directory visibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profilesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : pendingProfiles.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No profiles pending approval.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingProfiles.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium">{p.full_name}</p>
                        <p className="text-sm text-muted-foreground">{p.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {p.created_at
                            ? format(new Date(p.created_at), "MMM d, yyyy")
                            : "—"}{" "}
                          · {p.registration_status ?? ""}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/profiles/${p.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          onClick={() =>
                            updateApproval.mutate(
                              { profileId: p.id, status: "approved" },
                              {
                                onSuccess: () => toast.success("Profile approved"),
                                onError: () => toast.error("Failed to approve"),
                              }
                            )
                          }
                          disabled={updateApproval.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            updateApproval.mutate(
                              { profileId: p.id, status: "rejected" },
                              {
                                onSuccess: () => toast.success("Profile rejected"),
                                onError: () => toast.error("Failed to reject"),
                              }
                            )
                          }
                          disabled={updateApproval.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Phase-1 Metrics
              </CardTitle>
              <CardDescription>
                Signup→Activation, Referral count, Profile approval, 7–14 day return
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : metrics ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Total Profiles</p>
                    <p className="text-2xl font-bold">{metrics.totalProfiles}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Approved PSPs</p>
                    <p className="text-2xl font-bold">{metrics.approvedProfiles}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Total Referrals</p>
                    <p className="text-2xl font-bold">{metrics.totalReferrals}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Activated Investors</p>
                    <p className="text-2xl font-bold">{metrics.activatedInvestors}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Pending Approvals</p>
                    <p className="text-2xl font-bold">{metrics.pendingProfiles}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">7–14 Day Return (referrals)</p>
                    <p className="text-2xl font-bold">{metrics.returnRate7_14}</p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Dispute Resolution
              </CardTitle>
              <CardDescription>
                Resolve referral and commission disputes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {disputesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : disputes.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No open disputes.
                </div>
              ) : (
                <div className="space-y-4">
                  {disputes.map((d) => {
                    // The Supabase query selects dispute row + joined relations.
                    // Cast to the fields we actually render so TS doesn't fail
                    // when relations are missing/typed as SelectQueryError.
                    const dispute = d as unknown as {
                      id: string;
                      reason: string | null;
                      status: string;
                      created_at: string | null;
                    };

                    return (
                      <div
                        key={dispute.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="font-medium">
                            {dispute.reason || "Dispute"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {dispute.created_at
                              ? format(
                                  new Date(dispute.created_at),
                                  "MMM d, yyyy",
                                )
                              : "—"}{" "}
                            · {dispute.status}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() =>
                            resolveDispute.mutate(
                              { disputeId: dispute.id, status: "resolved" },
                              {
                                onSuccess: () => toast.success("Dispute resolved"),
                                onError: () => toast.error("Failed to resolve"),
                              }
                            )
                          }
                          disabled={resolveDispute.isPending}
                        >
                          Resolve
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Moderation
              </CardTitle>
              <CardDescription>
                Phase-1: Basic moderation. Content review and flagging. (Advanced moderation excluded per Phase-1 boundaries.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground">
                Moderation panel placeholder. Phase-1 focuses on Approvals, Analytics, and Disputes.
                Advanced moderation is explicitly out of scope.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Link href="/dashboard/compliance">
          <Button variant="outline">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Crowdfunding Compliance
          </Button>
        </Link>
      </div>
    </div>
  );
}
