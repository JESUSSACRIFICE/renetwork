"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  HandCoins,
  Target,
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
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  useInvestorPerformance,
  type TimeRange,
} from "@/hooks/use-investor-performance";
import { useUserCrowdfundingPledges } from "@/hooks/use-crowdfunding";
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

export default function InvestorROIPage() {
  const { user } = useAuth();
  const [range, setRange] = useState<TimeRange>("30d");

  const { data: performance, isLoading } = useInvestorPerformance(
    user?.id ?? null,
    range
  );
  const { data: pledges = [] } = useUserCrowdfundingPledges(user?.id ?? null);

  const activePledges = pledges.filter(
    (p) => p.status === "pledged" || p.status === "confirmed"
  );

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <Link href="/dashboard/investor">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Investor Dashboard
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              ROI & Performance
            </h1>
            <p className="text-muted-foreground mt-1">
              Track referral earnings, crowdfunding returns, and investment
              performance
            </p>
          </div>
          <Select value={range} onValueChange={(v) => setRange(v as TimeRange)}>
            <SelectTrigger className="w-[160px]">
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
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* ROI Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Referral Earnings
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performance
                    ? formatCurrency(performance.summary.totalEarnedCents)
                    : "$0"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  In selected period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Referral Conversion
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performance
                    ? `${performance.summary.referralConversionRate.toFixed(1)}%`
                    : "0%"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {performance?.summary.convertedReferrals ?? 0} /{" "}
                  {performance?.summary.totalReferrals ?? 0} converted
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Pledged
                </CardTitle>
                <HandCoins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performance
                    ? formatCurrency(performance.summary.totalPledgedCents)
                    : "$0"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Crowdfunding investments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Expected ROI
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performance?.summary.weightedExpectedRoiPct != null
                    ? `${performance.summary.weightedExpectedRoiPct.toFixed(1)}%`
                    : "—"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Weighted by pledge amount
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Earnings Over Time Chart */}
          {performance && performance.chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Earnings Over Time
                </CardTitle>
                <CardDescription>
                  Referral commission earnings in the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
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
                          id="fillRoiEarnings"
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
                        fill="url(#fillRoiEarnings)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Crowdfunding ROI by Project */}
          {activePledges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Crowdfunding ROI by Project</CardTitle>
                <CardDescription>
                  Expected returns from your pledged projects (pre-SEC approval)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activePledges.map((pledge) => {
                    const project = pledge.crowdfunding_projects;
                    const roi = project?.expected_roi_pct ?? null;
                    return (
                      <Link
                        key={pledge.id}
                        href={`/crowdfund/projects/${pledge.project_id}`}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition"
                      >
                        <div>
                          <p className="font-medium">
                            {project?.title ?? "Project"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(pledge.amount_cents)} pledged
                            {pledge.created_at &&
                              ` · ${format(
                                new Date(pledge.created_at),
                                "MMM d, yyyy"
                              )}`}
                          </p>
                        </div>
                        <div className="text-right">
                          {roi != null ? (
                            <p className="text-lg font-semibold text-green-600">
                              {roi}% expected ROI
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              ROI TBD
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <Link href="/crowdfund/projects" className="mt-4 inline-block">
                  <Button variant="outline" size="sm">
                    Browse more projects
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {!performance?.chartData.length &&
            activePledges.length === 0 &&
            !isLoading && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p className="mb-2">No ROI data yet.</p>
                  <p className="text-sm">
                    Start referring leads and pledging to crowdfunding projects
                    to see your performance metrics.
                  </p>
                  <div className="mt-4 flex gap-4 justify-center">
                    <Link href="/dashboard/referral">
                      <Button>Referral Dashboard</Button>
                    </Link>
                    <Link href="/crowdfund/projects">
                      <Button variant="outline">Browse Projects</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      )}
    </div>
  );
}
