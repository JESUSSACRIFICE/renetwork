"use client";

import { useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useEngagementAnalytics } from "@/hooks/use-engagement-analytics";
import type { TimeRange } from "@/hooks/use-revenue-analytics";
import { formatCurrency, TIME_RANGES } from "@/lib/analytics-utils";
import {
  MessageSquare,
  Send,
  Heart,
  Briefcase,
  GraduationCap,
  Loader2,
} from "lucide-react";

export default function EngagementAnalyticsPage() {
  const { user } = useAuth();
  const [range, setRange] = useState<TimeRange>("30d");
  const { data: engagementData, isLoading } = useEngagementAnalytics(
    user?.id ?? null,
    range,
  );

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Engagement Analytics
        </h1>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Engagement Analytics</h1>
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

      {!engagementData ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No data available.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Messages
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {engagementData.summary.totalMessagesSent +
                    engagementData.summary.totalMessagesReceived}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {engagementData.summary.totalMessagesSent} sent /{" "}
                  {engagementData.summary.totalMessagesReceived} received
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Referrals Sent
                </CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {engagementData.summary.totalReferralsSent}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  In selected period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Offers
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {engagementData.summary.totalOffersSent +
                    engagementData.summary.totalOffersReceived}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {engagementData.summary.totalOffersSent} sent /{" "}
                  {engagementData.summary.totalOffersReceived} received
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Favorites & Engagements
                </CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {engagementData.summary.totalFavoritesReceived}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Profile favorites ·{" "}
                  {engagementData.summary.engagementsCompleted}/
                  {engagementData.summary.engagementsCount} engagements
                  completed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Engagement over time chart */}
          {engagementData.chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Engagement Over Time</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Messages, referrals, offers, and favorites by period
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ChartContainer
                    config={{
                      messages: {
                        label: "Messages",
                        color: "hsl(221, 83%, 53%)",
                      },
                      referrals: {
                        label: "Referrals",
                        color: "hsl(142, 76%, 36%)",
                      },
                      offers: { label: "Offers", color: "hsl(262, 83%, 58%)" },
                      favorites: {
                        label: "Favorites",
                        color: "hsl(0, 84%, 60%)",
                      },
                    }}
                    className="h-full w-full"
                  >
                    <AreaChart
                      data={engagementData.chartData.map((d) => ({
                        ...d,
                        total:
                          d.messagesSent +
                          d.messagesReceived +
                          d.referralsSent +
                          d.offersSent +
                          d.offersReceived +
                          d.favoritesReceived,
                      }))}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="fillEngagement"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="hsl(221, 83%, 53%)"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(221, 83%, 53%)"
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
                      <YAxis tickLine={false} axisLine={false} fontSize={12} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => String(value)}
                          />
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="hsl(221, 83%, 53%)"
                        fill="url(#fillEngagement)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top-performing services */}
          {engagementData.topServices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Top-Performing Services & Offers
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Accepted or completed offers by title
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {engagementData.topServices.map((s, i) => (
                    <div
                      key={s.title}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground font-mono text-sm w-6">
                          #{i + 1}
                        </span>
                        <span className="font-medium">{s.title}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {s.count} order{s.count !== 1 ? "s" : ""}
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(s.amount_cents)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Training completion metrics */}
          {(engagementData.summary.engagementsCount > 0 ||
            engagementData.summary.uniqueConversations > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Activity & Training Metrics</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Conversations and engagement completions
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium mb-1">
                      Unique conversations
                    </p>
                    <p className="text-2xl font-bold">
                      {engagementData.summary.uniqueConversations}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Message threads in period
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">
                      Engagements completed
                    </p>
                    <p className="text-2xl font-bold">
                      {engagementData.summary.engagementsCompleted} /{" "}
                      {engagementData.summary.engagementsCount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Training/contract completions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
