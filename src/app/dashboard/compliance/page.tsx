"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  useAdminPendingProjects,
  useUpdateProjectStatus,
  useUpdateProjectCompliance,
} from "@/hooks/use-compliance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function CompliancePage() {
  const { user } = useAuth();
  const { data: projects = [], isLoading } = useAdminPendingProjects();
  const updateStatus = useUpdateProjectStatus();
  const updateCompliance = useUpdateProjectCompliance();

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

  const handleApprove = async (projectId: string) => {
    try {
      await updateCompliance.mutateAsync({
        projectId,
        compliance_status: "approved",
      });
      await updateStatus.mutateAsync({ projectId, status: "active" });
      toast.success("Project approved and activated");
    } catch (e) {
      toast.error("Failed to approve project");
    }
  };

  const handleReject = async (projectId: string) => {
    try {
      await updateCompliance.mutateAsync({
        projectId,
        compliance_status: "rejected",
      });
      await updateStatus.mutateAsync({ projectId, status: "cancelled" });
      toast.success("Project rejected");
    } catch (e) {
      toast.error("Failed to reject project");
    }
  };

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
              This page is for administrators only. You need the admin role to review and approve
              crowdfunding projects.
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
          SEC / JOBS Act Compliance
        </h1>
        <p className="text-muted-foreground">
          Review and approve crowdfunding projects before they go live
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No projects pending review. Projects in draft or pending_review status will appear here.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {projects.map((p: Record<string, unknown>) => {
            const project = p as {
              id: string;
              title: string;
              status: string;
              min_investment_cents: number;
              target_amount_cents: number;
              category: string;
              crowdfunding_project_compliance?: Array<{
                compliance_status: string;
                admin_notes: string | null;
              }>;
            };
            const compliance = project.crowdfunding_project_compliance?.[0];
            return (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <CardDescription>
                        {project.category} · Min {formatCurrency(project.min_investment_cents)} ·
                        Target {formatCurrency(project.target_amount_cents)}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        project.status === "pending_review"
                          ? "default"
                          : project.status === "draft"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {compliance && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Compliance: </span>
                      <Badge variant="outline" className="ml-1">
                        {compliance.compliance_status}
                      </Badge>
                      {compliance.admin_notes && (
                        <p className="mt-2 text-muted-foreground">{compliance.admin_notes}</p>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/crowdfund/projects/${project.id}`}>
                      <Button variant="outline" size="sm">
                        View project
                      </Button>
                    </Link>
                    {project.status === "draft" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          await updateStatus.mutateAsync({
                            projectId: project.id,
                            status: "pending_review",
                          });
                          toast.success("Submitted for review");
                        }}
                        disabled={updateStatus.isPending}
                      >
                        Submit for review
                      </Button>
                    )}
                    {project.status === "pending_review" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(project.id)}
                          disabled={updateStatus.isPending || updateCompliance.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve & Activate
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(project.id)}
                          disabled={updateStatus.isPending || updateCompliance.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
