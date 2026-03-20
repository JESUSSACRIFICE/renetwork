"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  HandCoins,
  ArrowRight,
  BarChart3,
  Loader2,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  useUserCrowdfundingPledges,
  useCrowdfundingNotifications,
} from "@/hooks/use-crowdfunding";
import {
  useInvestorPerformance,
  type TimeRange,
} from "@/hooks/use-investor-performance";
import { format } from "date-fns";

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" },
];

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function InvestorDashboardPage() {
  const { user } = useAuth();
  const [range, setRange] = useState<TimeRange>("30d");

  const { data: pledges = [] } = useUserCrowdfundingPledges(user?.id ?? null);
  const { data: notifications = [] } = useCrowdfundingNotifications(user?.id ?? null);
  const { data: performance, isLoading: performanceLoading } =
    useInvestorPerformance(user?.id ?? null, range);

  // Crowdfunding stats
  const totalPledged = pledges.reduce((sum, p) => sum + p.amount_cents, 0);
  const activeInvestments = pledges.filter(
    (p) => p.status === "pledged" || p.status === "confirmed"
  ).length;
  const unreadNotifications = notifications.filter((n) => !n.read_at).length;

  const recentPledges = pledges.slice(0, 3);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Investor Dashboard</h1>
        <p className="text-muted-foreground">
          Track your crowdfunding investments, ROI, and performance metrics
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Crowdfunding Pledged
            </CardTitle>
            <HandCoins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPledged)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeInvestments} active project{activeInvestments !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Notifications
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadNotifications}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unread updates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics (per requirements: Analytics & Performance Panel) */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Referral success rates, earnings over time, and crowdfunding ROI
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={range} onValueChange={(v) => setRange(v as TimeRange)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_RANGES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Link href="/dashboard/investor/roi">
                <Button variant="outline" size="sm">
                  ROI Details <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {performanceLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : performance ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Referral Conversion Rate
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {performance.summary.referralConversionRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {performance.summary.convertedReferrals} /{" "}
                    {performance.summary.totalReferrals} converted
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Earnings (Period)
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(performance.summary.totalEarnedCents)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(performance.summary.pendingCommissionCents)}{" "}
                    pending
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Crowdfunding Portfolio
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(performance.summary.totalPledgedCents)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {performance.summary.activeInvestments} active project
                    {performance.summary.activeInvestments !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Expected ROI (Weighted)
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {performance.summary.weightedExpectedRoiPct != null
                      ? `${performance.summary.weightedExpectedRoiPct.toFixed(1)}%`
                      : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    From pledged projects
                  </p>
                </div>
              </div>
              {performance.chartData.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">Earnings Over Time</p>
                  <div className="h-[240px] w-full">
                    <ChartContainer
                      config={{
                        earnings: {
                          label: "Earnings",
                          color: "hsl(142, 76%, 36%)",
                        },
                      }}
                      className="h-full w-full"
                    >
                      <AreaChart
                        data={performance.chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="fillInvestorEarnings"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="hsl(142, 76%, 36%)"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="hsl(142, 76%, 36%)"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          fontSize={12}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          fontSize={12}
                          tickFormatter={(v) => `$${v}`}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(value) =>
                                `$${Number(value).toFixed(2)}`
                              }
                            />
                          }
                        />
                        <Area
                          type="monotone"
                          dataKey="earnings"
                          stroke="hsl(142, 76%, 36%)"
                          fill="url(#fillInvestorEarnings)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No performance data yet. Start referring and investing to see
              metrics.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick actions & content */}
      <div className="grid gap-6">
        {/* Crowdfunding investments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <HandCoins className="h-5 w-5" />
                Crowdfunding
              </CardTitle>
              <Link href="/dashboard/crowdfunding">
                <Button variant="outline" size="sm">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            <CardDescription>
              Your pledges and interest in projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentPledges.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No crowdfunding pledges yet. Browse projects to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {recentPledges.map((pledge) => {
                  const project = pledge.crowdfunding_projects;
                  return (
                    <Link
                      key={pledge.id}
                      href={`/crowdfund/projects/${pledge.project_id}`}
                      className="block rounded-lg border p-3 hover:bg-muted/50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {project?.title ?? "Project"}
                          </p>
                          <p className="text-xs text-muted-foreground">
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
                    </Link>
                  );
                })}
              </div>
            )}
            <Link href="/crowdfund/projects" className="mt-4 inline-block">
              <Button variant="ghost" size="sm">
                Browse projects <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dashboard/earnings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 rounded-full bg-emerald-100">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold">Earnings</p>
                <p className="text-sm text-muted-foreground">
                  Commissions and offers
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/crowdfunding">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 rounded-full bg-sky-100">
                <HandCoins className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <p className="font-semibold">Crowdfunding</p>
                <p className="text-sm text-muted-foreground">
                  Investments and notifications
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
