"use client";

import { useState, useEffect } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import {
  useRevenueAnalytics,
  type TimeRange,
} from "@/hooks/use-revenue-analytics";
import {
  formatCurrency,
  formatDollars,
  exportToCsv,
  TIME_RANGES,
  GOAL_STORAGE_KEYS,
} from "@/lib/analytics-utils";
import {
  TrendingUp,
  FileText,
  Download,
  Loader2,
  Target,
  BarChart3,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";

const chartConfig = {
  total: { label: "Total", color: "hsl(142, 76%, 36%)" },
  offers: { label: "From Offers", color: "hsl(221, 83%, 53%)" },
  referrals: { label: "From Referrals", color: "hsl(262, 83%, 58%)" },
};

export default function RevenueAnalyticsPage() {
  const { user } = useAuth();
  const [range, setRange] = useState<TimeRange>("30d");
  const { data, isLoading } = useRevenueAnalytics(user?.id ?? null, range);

  const [storedGoals, setStoredGoals] = useState({ monthly: 0, yearly: 0 });
  const [monthlyGoalInput, setMonthlyGoalInput] = useState("");
  const [yearlyGoalInput, setYearlyGoalInput] = useState("");
  useEffect(() => {
    const m = parseFloat(
      localStorage.getItem(GOAL_STORAGE_KEYS.monthly) ?? "0",
    );
    const y = parseFloat(localStorage.getItem(GOAL_STORAGE_KEYS.yearly) ?? "0");
    setStoredGoals({ monthly: m, yearly: y });
  }, []);

  const monthlyGoal = storedGoals.monthly;
  const yearlyGoal = storedGoals.yearly;

  const saveGoals = () => {
    const m = parseFloat(monthlyGoalInput) || 0;
    const y = parseFloat(yearlyGoalInput) || 0;
    if (typeof window !== "undefined") {
      localStorage.setItem(GOAL_STORAGE_KEYS.monthly, String(m));
      localStorage.setItem(GOAL_STORAGE_KEYS.yearly, String(y));
      setStoredGoals({ monthly: m, yearly: y });
      setMonthlyGoalInput("");
      setYearlyGoalInput("");
      toast.success("Goals saved");
    }
  };

  const progressMonth =
    monthlyGoal > 0 && data
      ? Math.min(100, (data.summary.totalEarned / 100 / monthlyGoal) * 100)
      : 0;
  const progressYear =
    yearlyGoal > 0 && data
      ? Math.min(100, (data.summary.totalEarned / 100 / yearlyGoal) * 100)
      : 0;

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Revenue Reports</h1>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Revenue Reports</h1>
        <div className="flex items-center gap-2">
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
          {data && data.reportRows.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCsv(data.reportRows)}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {!data ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No data available.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Earned
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(data.summary.totalEarned)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  In selected period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  From Offers
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(data.summary.fromOffers)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Service payments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  From Referrals
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(data.summary.fromReferrals)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Paid commissions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Referral Success
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.summary.referralSuccessRate.toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.summary.convertedReferrals} /{" "}
                  {data.summary.totalReferrals} converted
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Earnings over time chart */}
          <Card>
            <CardHeader>
              <CardTitle>Earnings Over Time</CardTitle>
              <p className="text-sm text-muted-foreground">
                Revenue from offers and referral commissions
              </p>
            </CardHeader>
            <CardContent>
              {data.chartData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No earnings data in this period
                </div>
              ) : (
                <div className="h-[300px] w-full">
                  <ChartContainer
                    config={chartConfig}
                    className="h-full w-full"
                  >
                    <AreaChart
                      data={data.chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="fillTotal"
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
                            formatter={(value) => formatDollars(Number(value))}
                          />
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="hsl(142, 76%, 36%)"
                        fill="url(#fillTotal)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue by source (stacked bar) */}
          {data.chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Source</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Offers vs referral commissions by period
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full">
                  <ChartContainer
                    config={chartConfig}
                    className="h-full w-full"
                  >
                    <BarChart
                      data={data.chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
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
                            formatter={(value) => formatDollars(Number(value))}
                          />
                        }
                      />
                      <Bar
                        dataKey="offers"
                        stackId="a"
                        fill="hsl(221, 83%, 53%)"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="referrals"
                        stackId="a"
                        fill="hsl(262, 83%, 58%)"
                        radius={[0, 0, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Earnings goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Earnings Goals
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Set monthly or yearly goals to track progress. Goals are stored
                locally in your browser.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium mb-2">Monthly goal</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {monthlyGoal > 0 ? formatDollars(monthlyGoal) : "Not set"}
                    </span>
                  </div>
                  {monthlyGoal > 0 && (
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${progressMonth}%` }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Yearly goal</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {yearlyGoal > 0 ? formatDollars(yearlyGoal) : "Not set"}
                    </span>
                  </div>
                  {yearlyGoal > 0 && (
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${progressYear}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 pt-6 border-t grid gap-4 sm:grid-cols-2 sm:flex sm:items-end">
                <div>
                  <Label htmlFor="monthly-goal">Monthly goal ($)</Label>
                  <Input
                    id="monthly-goal"
                    type="number"
                    min="0"
                    step="100"
                    placeholder="e.g. 5000"
                    value={monthlyGoalInput}
                    onChange={(e) => setMonthlyGoalInput(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="yearly-goal">Yearly goal ($)</Label>
                  <Input
                    id="yearly-goal"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="e.g. 60000"
                    value={yearlyGoalInput}
                    onChange={(e) => setYearlyGoalInput(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={saveGoals}
                  disabled={!monthlyGoalInput && !yearlyGoalInput}
                >
                  Save goals
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Revenue report table */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Report</CardTitle>
              <p className="text-sm text-muted-foreground">
                Transaction list for the selected period. Export as CSV for
                records.
              </p>
            </CardHeader>
            <CardContent>
              {data.reportRows.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">
                  No transactions in this period.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 font-medium">Date</th>
                        <th className="text-left py-3 font-medium">Type</th>
                        <th className="text-left py-3 font-medium">Title</th>
                        <th className="text-right py-3 font-medium">Amount</th>
                        <th className="text-left py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.reportRows.map((row) => (
                        <tr key={row.id} className="border-b last:border-0">
                          <td className="py-3">
                            {row.date
                              ? format(new Date(row.date), "MMM d, yyyy")
                              : "—"}
                          </td>
                          <td className="py-3 capitalize">{row.type}</td>
                          <td className="py-3">{row.title}</td>
                          <td className="py-3 text-right font-medium">
                            {formatCurrency(row.amount_cents)}
                          </td>
                          <td className="py-3">
                            <span
                              className={
                                row.status === "paid" ||
                                row.status === "completed"
                                  ? "text-green-600"
                                  : "text-muted-foreground"
                              }
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
