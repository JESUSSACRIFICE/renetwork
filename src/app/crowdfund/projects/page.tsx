"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  DollarSign,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCrowdfundingProjects } from "@/hooks/use-crowdfunding";
import type { CrowdfundingProject } from "@/lib/crowdfunding-types";

/** 5 columns × 2 rows per page */
const PAGE_SIZE = 10;

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
    <Link href={`/crowdfund/projects/${project.id}`} className="block w-full min-w-0">
      <Card className="aspect-square w-full overflow-hidden p-0 gap-0 transition-all hover:shadow-lg hover:border-sky-200 grid grid-rows-[minmax(0,1fr)_40%]">
        <div className="min-h-0 min-w-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          <DollarSign className="w-9 h-9 sm:w-11 sm:h-11 xl:w-14 xl:h-14 text-slate-600 shrink-0" strokeWidth={1.15} />
        </div>
        <CardContent className="min-h-0 min-w-0 h-full flex flex-col p-0 gap-0 border-t-0 overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1.5 py-1.5 sm:px-2 sm:py-1.5 flex flex-col gap-1">
            <h3 className="font-semibold text-[10px] sm:text-[11px] xl:text-xs leading-snug break-words">
              {project.title}
            </h3>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-snug break-words">
              {project.short_description || project.description || "Faith-based investment opportunity."}
            </p>
            {project.location && (
              <div className="flex items-start gap-0.5 text-[9px] sm:text-[10px] text-muted-foreground">
                <MapPin className="w-2.5 h-2.5 flex-shrink-0 mt-0.5" />
                <span className="break-words leading-tight">{project.location}</span>
              </div>
            )}
          </div>
          <div className="shrink-0 px-1.5 py-1.5 sm:px-2 sm:py-1.5 border-t border-border/60 space-y-0.5 bg-card">
            <div className="flex justify-between gap-1 items-start text-[9px] sm:text-[10px]">
              <span className="text-muted-foreground shrink-0">Funded</span>
              <span className="font-medium text-right tabular-nums leading-tight break-words min-w-0">
                {formatCurrency(project.raised_amount_cents)} / {formatCurrency(project.target_amount_cents)}
              </span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function pageNumbers(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "gap")[] = [];
  const edge = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  for (let p = 1; p <= total; p++) {
    if (edge.has(p)) out.push(p);
    else if (out[out.length - 1] !== "gap") out.push("gap");
  }
  return out;
}

export default function CrowdfundingProjectsPage() {
  const { data: projects, isLoading, error } = useCrowdfundingProjects();
  const [page, setPage] = useState(1);

  const totalPages = useMemo(
    () => (projects?.length ? Math.ceil(projects.length / PAGE_SIZE) : 0),
    [projects?.length],
  );

  const paginatedProjects = useMemo(() => {
    if (!projects?.length) return [];
    const start = (page - 1) * PAGE_SIZE;
    return projects.slice(start, start + PAGE_SIZE);
  }, [projects, page]);

  useEffect(() => {
    setPage(1);
  }, [projects?.length]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-[1400px] px-4 py-12">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {Array.from({ length: PAGE_SIZE }, (_, i) => (
                <Card
                  key={i}
                  className="aspect-square w-full min-w-0 overflow-hidden p-0 gap-0 grid grid-rows-[minmax(0,1fr)_40%]"
                >
                  <div className="min-h-0 min-w-0 bg-muted animate-pulse" />
                  <CardContent className="min-h-0 h-full flex flex-col p-0 overflow-hidden border-t-0">
                    <div className="flex-1 min-h-0 p-1.5 sm:p-2 space-y-1">
                      <div className="h-2.5 bg-muted rounded animate-pulse w-4/5" />
                      <div className="space-y-0.5">
                        <div className="h-2 bg-muted rounded animate-pulse w-full" />
                        <div className="h-2 bg-muted rounded animate-pulse w-5/6" />
                      </div>
                      <div className="h-2 bg-muted rounded animate-pulse w-2/5" />
                    </div>
                    <div className="shrink-0 border-t border-border/60 p-1.5 sm:p-2 space-y-0.5">
                      <div className="h-2 bg-muted rounded animate-pulse w-full" />
                      <div className="h-1 bg-muted rounded animate-pulse w-full" />
                    </div>
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
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {paginatedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <div className="flex items-center gap-0.5 sm:gap-1 px-1">
                      {pageNumbers(page, totalPages).map((item, idx) =>
                        item === "gap" ? (
                          <span
                            key={`gap-${idx}`}
                            className="px-1 sm:px-2 text-muted-foreground text-sm"
                            aria-hidden
                          >
                            …
                          </span>
                        ) : (
                          <Button
                            key={item}
                            variant={page === item ? "default" : "outline"}
                            size="sm"
                            className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                            onClick={() => setPage(item)}
                            aria-label={`Page ${item}`}
                            aria-current={page === item ? "page" : undefined}
                          >
                            {item}
                          </Button>
                        ),
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      aria-label="Next page"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4 sm:ml-1" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {(page - 1) * PAGE_SIZE + 1}–
                    {Math.min(page * PAGE_SIZE, projects.length)} of {projects.length}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
