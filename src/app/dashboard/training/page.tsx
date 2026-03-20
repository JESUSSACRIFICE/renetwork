"use client";

import { useAuth } from "@/hooks/use-auth";
import {
  useTrainingModules,
  useTrainingProgressSummary,
} from "@/hooks/use-training";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function TrainingPage() {
  const { user } = useAuth();
  const { data: modules = [], isLoading } = useTrainingModules(user?.id ?? null);
  const { data: summary } = useTrainingProgressSummary(user?.id ?? null);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Training</h1>
      <p className="text-gray-600 mb-8">
        Learn referral best practices, contracts, and platform policies.
      </p>

      {/* Progress summary */}
      {summary && summary.total > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Your progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Progress value={summary.percent} className="flex-1 h-3" />
              <span className="text-sm font-medium text-gray-700 min-w-[4rem]">
                {summary.percent}%
              </span>
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <span>{summary.completed} of {summary.total} completed</span>
              {summary.inProgress > 0 && (
                <span>{summary.inProgress} in progress</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Module list */}
      <Card>
        <CardHeader>
          <CardTitle>Modules</CardTitle>
          <p className="text-sm text-gray-600">
            Complete each module to understand referrals and platform terms.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-lg border animate-pulse"
                >
                  <div className="h-12 w-12 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 w-48 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-32 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <GraduationCap className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No training modules available yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {modules.map((mod) => {
                const status = mod.progress?.status ?? "not_started";
                const isCompleted = status === "completed";
                const isInProgress = status === "in_progress";
                return (
                  <div
                    key={mod.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                        isCompleted && "bg-green-100 text-green-600",
                        isInProgress && "bg-primary/10 text-primary",
                        !isCompleted && !isInProgress && "bg-gray-100 text-gray-500"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <GraduationCap className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">{mod.title}</h3>
                      {mod.description && (
                        <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                          {mod.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {mod.duration_minutes} min
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {mod.link_url && (
                        <Link href={mod.link_url} target="_blank" rel="noopener">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Read
                          </Button>
                        </Link>
                      )}
                      <Link href={`/dashboard/training/${mod.slug}`}>
                        <Button size="sm">
                          {isCompleted ? "Review" : isInProgress ? "Continue" : "Start"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
