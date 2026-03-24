"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  DollarSign,
  PieChart,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Heart,
  ChevronRight,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  useCrowdfundingCreatorProfile,
} from "@/hooks/use-crowdfunding";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CrowdfundingInvestDialog } from "@/components/crowdfunding/CrowdfundingInvestDialog";
import { InvestorComplianceDialog } from "@/components/compliance/InvestorComplianceDialog";
import { RiskAcknowledgmentDialog } from "@/components/compliance/RiskAcknowledgmentDialog";
import type { CrowdfundingProject, FundAllocationItem } from "@/lib/crowdfunding-types";
import { Input } from "@/components/ui/input";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useInvestmentEligibility } from "@/hooks/use-compliance";
import { useUserCrowdfundingPledges } from "@/hooks/use-crowdfunding";

const ProjectLocationMap = dynamic(() => import("@/components/crowdfunding/ProjectLocationMap"), {
  ssr: false,
  loading: () => (
    <Card>
      <CardHeader>
        <h3 className="flex items-center gap-2 font-semibold">
          <MapPin className="w-5 h-5" />
          Project location
        </h3>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[220px] animate-pulse rounded-lg bg-muted" />
      </CardContent>
    </Card>
  ),
});

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

function CreatorPhoneLink({ phone }: { phone: string }) {
  const tel = phone.replace(/[^\d+]/g, "");
  if (tel.length === 0) {
    return <span className="text-foreground break-all">{phone}</span>;
  }
  return (
    <a href={`tel:${tel}`} className="text-sky-600 font-medium hover:underline break-all">
      {phone}
    </a>
  );
}

function HeroSlideImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const isRemote = /^https?:\/\//i.test(src);
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 1024px) 100vw, min(896px, 66vw)"
      unoptimized={isRemote}
      priority={priority}
    />
  );
}

function ProjectHeroMedia({ images, title }: { images: string[]; title: string }) {
  const urls = useMemo(
    () => images.map((s) => s.trim()).filter(Boolean),
    [images],
  );
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off?.("select", onSelect);
    };
  }, [api]);

  if (urls.length === 0) {
    return (
      <div className="aspect-video rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <DollarSign className="w-24 h-24 text-slate-600" />
      </div>
    );
  }

  if (urls.length === 1) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900">
        <HeroSlideImage src={urls[0]} alt={title} priority />
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-slate-900 shadow-sm">
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent className="-ml-0">
          {urls.map((src, i) => (
            <CarouselItem key={`${src}-${i}`} className="basis-full pl-0">
              <div className="relative aspect-video w-full">
                <HeroSlideImage
                  src={src}
                  alt={`${title} — image ${i + 1} of ${urls.length}`}
                  priority={i === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 top-1/2 z-10 -translate-y-1/2 border-white/30 bg-black/40 text-white hover:bg-black/60 hover:text-white" />
        <CarouselNext className="right-2 top-1/2 z-10 -translate-y-1/2 border-white/30 bg-black/40 text-white hover:bg-black/60 hover:text-white" />
      </Carousel>
      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
        {urls.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to image ${i + 1}`}
            aria-current={i === current ? true : undefined}
            className={cn(
              "pointer-events-auto h-1.5 rounded-full transition-all",
              i === current ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/70",
            )}
            onClick={() => api?.scrollTo(i)}
          />
        ))}
      </div>
    </div>
  );
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
  const { data: creator, isLoading: creatorLoading } = useCrowdfundingCreatorProfile(
    project?.creator_id ?? null,
  );
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
  const [complianceDialogOpen, setComplianceDialogOpen] = useState(false);
  const [riskDialogOpen, setRiskDialogOpen] = useState(false);

  const { data: pledges = [] } = useUserCrowdfundingPledges(user?.id ?? null);
  const totalPledgedCents = pledges
    .filter((p) => p.status === "pledged" || p.status === "confirmed")
    .reduce((s, p) => s + p.amount_cents, 0);
  const amountCents = Math.round(parseFloat(pledgeAmount || "0") * 100);
  const eligibility = useInvestmentEligibility(user?.id ?? null, amountCents, totalPledgedCents);

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

  const proceedToInvest = () => {
    if (eligibility.canInvest) {
      setInvestDialogOpen(true);
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
    if (!eligibility.hasCompliance) {
      setComplianceDialogOpen(true);
      return;
    }
    if (!eligibility.riskAcknowledged) {
      setRiskDialogOpen(true);
      return;
    }
    if (!eligibility.withinLimit) {
      toast.error(
        `Investment limit exceeded. Your limit is ${formatCurrency(eligibility.limitCents)}. You have already pledged ${formatCurrency(totalPledgedCents)}.`
      );
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
        <div className="w-full px-4 lg:px-20 py-8">
          {/* <Link
            href="/crowdfund/projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to projects
          </Link> */}

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <ProjectHeroMedia images={project.images ?? []} title={project.title} />

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
              {project.creator_id && (
                <Card className="border-border/80 shadow-sm">
                  <CardHeader className="pb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Project creator</h3>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {creatorLoading ? (
                      <div className="flex items-center gap-3 animate-pulse">
                        <div className="h-12 w-12 rounded-full bg-muted" />
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-4 w-36 max-w-full rounded bg-muted" />
                          <div className="h-3 w-full rounded bg-muted" />
                        </div>
                      </div>
                    ) : creator ? (
                      <div className="flex gap-3 rounded-lg -m-2 p-2 text-left transition-colors hover:bg-muted/70">
                        <Link
                          href={`/profiles/${creator.id}`}
                          className="shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                          aria-label={`${creator.full_name} profile`}
                        >
                          <Avatar className="h-12 w-12 border border-border/50">
                            <AvatarImage src={creator.avatar_url ?? undefined} alt="" />
                            <AvatarFallback className="text-base font-semibold">
                              {(creator.full_name?.charAt(0) ?? "?").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 space-y-1">
                              <Link
                                href={`/profiles/${creator.id}`}
                                className="font-semibold text-foreground hover:underline block"
                              >
                                {creator.full_name}
                              </Link>
                              {creator.license_number && (
                                <p className="text-sm text-foreground break-words">
                                  <span className="text-muted-foreground">License </span>
                                  {creator.license_number}
                                </p>
                              )}
                              {creator.phone && (
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Contact </span>
                                  <CreatorPhoneLink phone={creator.phone} />
                                </p>
                              )}
                              <Link
                                href={`/profiles/${creator.id}`}
                                className="text-sm text-muted-foreground line-clamp-2 hover:underline inline-block mt-0.5"
                              >
                                {creator.bio?.trim() ? creator.bio : "View full profile"}
                              </Link>
                            </div>
                            <Link
                              href={`/profiles/${creator.id}`}
                              className="shrink-0 p-0.5 text-muted-foreground hover:text-foreground rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              aria-label="View full profile"
                            >
                              <ChevronRight className="h-5 w-5" aria-hidden />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        This creator&apos;s profile isn&apos;t available.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

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
              <ProjectLocationMap location={project.location} title={project.title} />
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
          queryClient.invalidateQueries({ queryKey: ["compliance", "investor"] });
          setShowPledgeForm(false);
          setPledgeAmount("");
        }}
      />

      <InvestorComplianceDialog
        open={complianceDialogOpen}
        onOpenChange={setComplianceDialogOpen}
        userId={user?.id ?? null}
        onComplete={() => {
          setComplianceDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: ["compliance", "investor"] });
          setRiskDialogOpen(true);
        }}
      />

      <RiskAcknowledgmentDialog
        open={riskDialogOpen}
        onOpenChange={setRiskDialogOpen}
        userId={user?.id ?? null}
        onAcknowledged={() => {
          setRiskDialogOpen(false);
          proceedToInvest();
        }}
      />
    </div>
  );
}
