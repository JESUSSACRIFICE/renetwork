"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  DollarSign,
  TrendingUp,
  Calendar,
  PieChart,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Heart,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  useCrowdfundingProject,
  useCrowdfundingVotes,
  useUserVoteForProject,
  useUserPledgeForProject,
  useVoteProject,
  useRemoveVote,
  useCancelPledge,
} from "@/hooks/use-crowdfunding";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CrowdfundingInvestDialog } from "@/components/crowdfunding/CrowdfundingInvestDialog";
import type { CrowdfundingProject, FundAllocationItem } from "@/lib/crowdfunding-types";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORY_LABELS: Record<string, string> = {
  real_estate: "Real Estate",
  entertainment: "Entertainment",
  recreation: "Recreation",
  other: "Other",
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function FundAllocationSection({
  allocations,
}: {
  allocations: FundAllocationItem[];
}) {
  if (!allocations || allocations.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <h3 className="flex items-center gap-2 font-semibold">
          <PieChart className="w-5 h-5" />
          Transparent Fund Allocation
        </h3>
        <p className="text-sm text-muted-foreground">
          How funds will be used for this project
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allocations.map((item, i) => (
            <div key={i} className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{item.category}</p>
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
              </div>
              <span className="font-semibold text-sky-600 whitespace-nowrap">
                {item.amount_pct}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SecNotice() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900">
      <p className="font-semibold mb-1">Important notice</p>
      <p>
        This page describes a vision for future crowdfunding opportunities. It is not an offer to sell securities.
        Any eventual investment would align with the JOBS Act and would only be available after required approvals.
      </p>
    </div>
  );
}

export default function CrowdfundingProjectDetailPage() {
  const params = useParams();
  const id = (params?.id as string) ?? null;
  const { user } = useAuth();
  const { data: project, isLoading, error } = useCrowdfundingProject(id);
  const { data: votes } = useCrowdfundingVotes(id);
  const { data: userVote } = useUserVoteForProject(id, user?.id ?? null);
  const { data: userPledge } = useUserPledgeForProject(id, user?.id ?? null);
  const queryClient = useQueryClient();
  const voteMutation = useVoteProject(id, user?.id ?? null);
  const removeVoteMutation = useRemoveVote(id, user?.id ?? null);
  const cancelPledgeMutation = useCancelPledge(id, user?.id ?? null);

  const [pledgeAmount, setPledgeAmount] = useState("");
  const [showPledgeForm, setShowPledgeForm] = useState(false);
  const [investDialogOpen, setInvestDialogOpen] = useState(false);

  const handleVote = (type: "up" | "down" | "interested") => {
    if (!user) {
      toast.error("Sign in to vote");
      return;
    }
    if (userVote === type) {
      removeVoteMutation.mutate(undefined, {
        onSuccess: () => toast.success("Vote removed"),
        onError: () => toast.error("Failed to remove vote"),
      });
    } else {
      voteMutation.mutate(type, {
        onSuccess: () => toast.success("Vote recorded"),
        onError: () => toast.error("Failed to vote"),
      });
    }
  };

  const handleInvestWithStripe = () => {
    if (!user) {
      toast.error("Sign in to invest");
      return;
    }
    const cents = Math.round(parseFloat(pledgeAmount || "0") * 100);
    if (cents < (project?.min_investment_cents ?? 0)) {
      toast.error(`Minimum investment is ${formatCurrency(project!.min_investment_cents)}`);
      return;
    }
    setInvestDialogOpen(true);
  };

  const getAccessToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  const handleCancelPledge = () => {
    if (!user) return;
    cancelPledgeMutation.mutate(undefined, {
      onSuccess: () => toast.success("Pledge cancelled"),
      onError: () => toast.error("Failed to cancel pledge"),
    });
  };

  if (isLoading || !id) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Project not found</h2>
            <Link href="/crowdfund/projects" className="text-sky-600 hover:underline">
              Back to projects
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const progress = Math.min(
    100,
    (project.raised_amount_cents / project.target_amount_cents) * 100
  );
  const allocations = project.fund_allocation_json ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Link
            href="/crowdfund/projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to projects
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <DollarSign className="w-24 h-24 text-slate-600" />
              </div>

              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">
                    {project.category ? CATEGORY_LABELS[project.category] ?? project.category : "Project"}
                  </Badge>
                  {project.expected_roi_pct != null && (
                    <Badge className="bg-emerald-600 text-white">
                      {project.expected_roi_pct}% expected ROI
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-3">{project.title}</h1>
                {project.location && (
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                )}
                <div className="prose prose-slate max-w-none">
                  <p className="text-muted-foreground">
                    {project.short_description || project.description || "Faith-based investment opportunity."}
                  </p>
                  {project.description && project.short_description !== project.description && (
                    <div className="mt-4 text-muted-foreground whitespace-pre-wrap">
                      {project.description}
                    </div>
                  )}
                </div>
              </div>

              <FundAllocationSection allocations={allocations} />
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Funding progress</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Raised</span>
                      <span className="font-semibold">
                        {formatCurrency(project.raised_amount_cents)} / {formatCurrency(project.target_amount_cents)}
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Min. investment</p>
                      <p className="font-semibold">{formatCurrency(project.min_investment_cents)}</p>
                    </div>
                    {project.deadline_at && (
                      <div>
                        <p className="text-muted-foreground">Deadline</p>
                        <p className="font-semibold">{formatDate(project.deadline_at)}</p>
                      </div>
                    )}
                  </div>

                  {userPledge ? (
                    <div className="rounded-lg bg-sky-50 border border-sky-200 p-4">
                      <p className="font-medium text-sky-900">Your pledge</p>
                      <p className="text-2xl font-bold text-sky-700">
                        {formatCurrency(userPledge.amount_cents)}
                      </p>
                      <p className="text-xs text-sky-700 mt-1">
                        Status: {userPledge.status}
                        {userPledge.status === "pledged" && " (interest only until SEC approval)"}
                      </p>
                      {userPledge.status === "pledged" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={handleCancelPledge}
                          disabled={cancelPledgeMutation.isPending}
                        >
                          Cancel pledge
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      {!showPledgeForm ? (
                        <Button
                          className="w-full"
                          onClick={() => setShowPledgeForm(true)}
                          disabled={!user}
                        >
                          {user ? "Invest in this project" : "Sign in to invest"}
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium">Amount (USD)</label>
                            <Input
                              type="number"
                              min={project.min_investment_cents / 100}
                              step="100"
                              value={pledgeAmount}
                              onChange={(e) => setPledgeAmount(e.target.value)}
                              placeholder={`Min. ${formatCurrency(project.min_investment_cents)}`}
                              className="mt-1"
                            />
                          </div>
                          <Button
                            className="w-full"
                            onClick={handleInvestWithStripe}
                            disabled={
                              !pledgeAmount ||
                              parseFloat(pledgeAmount) * 100 < project.min_investment_cents
                            }
                          >
                            Invest with Stripe
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => {
                              setShowPledgeForm(false);
                              setPledgeAmount("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Community voting</h3>
                  <p className="text-sm text-muted-foreground">
                    Show your support or interest
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={userVote === "up" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleVote("up")}
                      disabled={voteMutation.isPending || removeVoteMutation.isPending}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {votes?.up ?? 0}
                    </Button>
                    <Button
                      variant={userVote === "down" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleVote("down")}
                      disabled={voteMutation.isPending || removeVoteMutation.isPending}
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      {votes?.down ?? 0}
                    </Button>
                    <Button
                      variant={userVote === "interested" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleVote("interested")}
                      disabled={voteMutation.isPending || removeVoteMutation.isPending}
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      Interested {votes?.interested ?? 0}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <SecNotice />
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <CrowdfundingInvestDialog
        open={investDialogOpen}
        onOpenChange={setInvestDialogOpen}
        projectId={id}
        projectTitle={project.title}
        amountCents={Math.round(parseFloat(pledgeAmount || "0") * 100)}
        getAccessToken={getAccessToken}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["crowdfunding", "project", id] });
          queryClient.invalidateQueries({ queryKey: ["crowdfunding", "pledge", id, user?.id] });
          queryClient.invalidateQueries({ queryKey: ["crowdfunding", "pledges", user?.id] });
          setShowPledgeForm(false);
          setPledgeAmount("");
        }}
      />
    </div>
  );
}
