"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  useTrainingModules,
  useStartModule,
  useCompleteModule,
} from "@/hooks/use-training";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function TrainingModulePage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params.slug as string) ?? "";
  const { user } = useAuth();
  const { data: modules = [] } = useTrainingModules(user?.id ?? null);
  const startModule = useStartModule(user?.id ?? null);
  const completeModule = useCompleteModule(user?.id ?? null);

  const trainingModule = modules.find((m) => m.slug === slug);

  if (!trainingModule) {
    return (
      <div className="p-8">
        <Link
          href="/dashboard/training"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Training
        </Link>
        <p className="text-gray-600">Module not found.</p>
      </div>
    );
  }

  const status = trainingModule.progress?.status ?? "not_started";
  const isCompleted = status === "completed";
  const isInProgress = status === "in_progress";

  const handleStart = () => {
    startModule.mutate(trainingModule.id, {
      onSuccess: () => {},
      onError: () => {},
    });
  };

  const handleComplete = () => {
    completeModule.mutate(trainingModule.id, {
      onSuccess: () => {},
      onError: () => {},
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link
        href="/dashboard/training"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Training
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">
                {trainingModule.title}
              </CardTitle>
              {trainingModule.description && (
                <p className="text-gray-600 mt-2">
                  {trainingModule.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                {trainingModule.duration_minutes} min
              </div>
            </div>
            {isCompleted && (
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium shrink-0">
                <CheckCircle2 className="h-4 w-4" />
                Completed
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {trainingModule.link_url && (
            <div className="rounded-lg border bg-gray-50 p-4">
              <p className="text-sm text-gray-700 mb-3">
                Read the full content to complete this module.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={trainingModule.link_url}
                  target="_blank"
                  rel="noopener"
                >
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open content
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 border-t">
            {!isCompleted ? (
              <>
                {!isInProgress && (
                  <Button
                    onClick={handleStart}
                    disabled={startModule.isPending}
                  >
                    {startModule.isPending ? "Starting…" : "Start module"}
                  </Button>
                )}
                <Button
                  variant={isInProgress ? "default" : "secondary"}
                  onClick={handleComplete}
                  disabled={completeModule.isPending}
                >
                  {completeModule.isPending
                    ? "Marking…"
                    : isInProgress
                      ? "Mark as complete"
                      : "Mark as complete"}
                </Button>
              </>
            ) : (
              <Button variant="outline" asChild>
                <Link href="/dashboard/training">Back to modules</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
