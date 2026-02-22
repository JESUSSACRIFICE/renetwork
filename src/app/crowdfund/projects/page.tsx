"use client";

import Link from "next/link";
import { MapPin, DollarSign, ArrowRight, TrendingUp } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCrowdfundingProjects } from "@/hooks/use-crowdfunding";
import type { CrowdfundingProject } from "@/lib/crowdfunding-types";

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

function ProjectCard({ project }: { project: CrowdfundingProject }) {
  const progress = Math.min(
    100,
    (project.raised_amount_cents / project.target_amount_cents) * 100
  );

  return (
    <Link href={`/crowdfund/projects/${project.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:border-sky-200">
        <div className="aspect-[16/10] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          <DollarSign className="w-16 h-16 text-slate-600" />
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <Badge variant="secondary">
              {project.category ? CATEGORY_LABELS[project.category] ?? project.category : "Project"}
            </Badge>
            {project.expected_roi_pct != null && (
              <Badge className="bg-emerald-600 text-white">
                {project.expected_roi_pct}% ROI
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-lg line-clamp-2">{project.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.short_description || project.description || "Faith-based investment opportunity."}
          </p>
          {project.location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{project.location}</span>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Funded</span>
              <span className="font-medium">
                {formatCurrency(project.raised_amount_cents)} / {formatCurrency(project.target_amount_cents)}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Min. {formatCurrency(project.min_investment_cents)}
            </span>
            <span className="text-sm font-medium text-sky-600 flex items-center gap-1">
              View details <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function CrowdfundingProjectsPage() {
  const { data: projects, isLoading, error } = useCrowdfundingProjects();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 mb-2">
              Faith-Based Investing
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Crowdfunding Projects
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Democratize investment in faith-based real estate and entertainment projects.
              Community voting, transparent fund allocation, and JOBS Act-minded design.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/allin1realestate/crowdfunding"
                className="text-sm font-medium text-sky-600 hover:text-sky-700 underline"
              >
                Learn about our vision and SEC notice
              </Link>
            </div>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-[16/10] bg-muted animate-pulse" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-muted rounded animate-pulse w-full" />
                    <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
              <p className="font-medium">Unable to load projects</p>
              <p className="text-sm mt-1">Run the Supabase migrations to set up the crowdfunding tables.</p>
            </div>
          )}

          {!isLoading && !error && projects && projects.length === 0 && (
            <Card>
              <CardContent className="py-16 text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No projects yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  New faith-based crowdfunding projects will appear here. Check back soon or join the interest list.
                </p>
                <Link
                  href="/allin1realestate/crowdfunding#pledge"
                  className="inline-block mt-4 text-sky-600 font-medium hover:underline"
                >
                  Join the early interest list
                </Link>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && projects && projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
