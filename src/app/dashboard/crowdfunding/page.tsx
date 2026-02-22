"use client";

import Link from "next/link";
import {
  HandCoins,
  TrendingUp,
  Bell,
  ArrowRight,
  DollarSign,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  useUserCrowdfundingPledges,
  useCrowdfundingNotifications,
  useMarkNotificationRead,
} from "@/hooks/use-crowdfunding";
import { format } from "date-fns";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function DashboardCrowdfundingPage() {
  const { user } = useAuth();
  const { data: pledges, isLoading: pledgesLoading } = useUserCrowdfundingPledges(user?.id ?? null);
  const { data: notifications, isLoading: notifLoading } = useCrowdfundingNotifications(user?.id ?? null);
  const markRead = useMarkNotificationRead(user?.id ?? null);

  const totalPledged = pledges?.reduce((sum, p) => sum + p.amount_cents, 0) ?? 0;
  const unreadCount = notifications?.filter((n) => !n.read_at).length ?? 0;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Crowdfunding</h1>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pledged
            </CardTitle>
            <HandCoins className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalPledged)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Interest only until SEC approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Investments
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pledges?.filter((p) => p.status === "pledged" || p.status === "confirmed").length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Projects you&apos;ve pledged to
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Notifications
            </CardTitle>
            <Bell className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {unreadCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Unread notifications
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Investments</CardTitle>
              <Link href="/crowdfund/projects">
                <Button variant="outline" size="sm">
                  Browse projects <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Track your pledges and interest in projects
            </p>
          </CardHeader>
          <CardContent>
            {pledgesLoading && (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            )}
            {!pledgesLoading && (!pledges || pledges.length === 0) && (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t pledged to any projects yet.
                </p>
                <Link href="/crowdfund/projects">
                  <Button>Browse projects</Button>
                </Link>
              </div>
            )}
            {!pledgesLoading && pledges && pledges.length > 0 && (
              <div className="space-y-4">
                {pledges.map((pledge) => {
                  const project = pledge.crowdfunding_projects;
                  return (
                    <Link
                      key={pledge.id}
                      href={`/crowdfund/projects/${pledge.project_id}`}
                      className="block rounded-lg border p-4 hover:bg-muted/50 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-sm">
                            {project?.title ?? "Project"}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatCurrency(pledge.amount_cents)} pledged
                            {project?.expected_roi_pct != null && (
                              <> · {project.expected_roi_pct}% expected ROI</>
                            )}
                          </p>
                        </div>
                        <Badge
                          variant={
                            pledge.status === "confirmed"
                              ? "default"
                              : pledge.status === "cancelled"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {pledge.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-sky-600">
                        View project <ArrowRight className="w-3 h-3" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <p className="text-sm text-muted-foreground">
              Project updates, returns, and milestones
            </p>
          </CardHeader>
          <CardContent>
            {notifLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            )}
            {!notifLoading && (!notifications || notifications.length === 0) && (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No notifications yet.
                </p>
              </div>
            )}
            {!notifLoading && notifications && notifications.length > 0 && (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-lg border p-3 ${
                      !n.read_at ? "bg-sky-50/50 border-sky-100" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{n.title}</p>
                        {n.message && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {n.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(n.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      {!n.read_at && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markRead.mutate(n.id)}
                          disabled={markRead.isPending}
                        >
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900">
        <p className="font-semibold mb-1">Important notice</p>
        <p>
          Pledges are interest-only until SEC approval. No investments are being offered or accepted at this time.
          See{" "}
          <Link href="/allin1realestate/crowdfunding" className="underline">
            our vision page
          </Link>{" "}
          for details.
        </p>
      </div>
    </div>
  );
}
