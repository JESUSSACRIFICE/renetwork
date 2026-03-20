"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useConversionTracking } from "@/hooks/use-conversion-tracking";
import type { TimeRange } from "@/hooks/use-revenue-analytics";
import { TIME_RANGES } from "@/lib/analytics-utils";
import { GitMerge, Briefcase, Users, Loader2 } from "lucide-react";

export default function ConversionAnalyticsPage() {
  const { user } = useAuth();
  const [range, setRange] = useState<TimeRange>("30d");
  const { data: conversionData, isLoading } = useConversionTracking(
    user?.id ?? null,
    range,
  );

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Conversion Tracking
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
        <h1 className="text-2xl md:text-3xl font-bold">Conversion Tracking</h1>
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

      {!conversionData ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No data available.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Track referral progress: requested → accepted → closed. Monitor
            offer and lead conversion rates.
          </p>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Referral conversion
                </CardTitle>
                <GitMerge className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {conversionData.summary.referralConversionRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {conversionData.referralFunnel.totalConverted} /{" "}
                  {conversionData.referralFunnel.totalEntered} converted
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Offer conversion
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {conversionData.summary.offerConversionRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {conversionData.offerFunnel.totalConverted} /{" "}
                  {conversionData.offerFunnel.totalEntered} completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Lead conversion
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {conversionData.summary.leadConversionRate != null
                    ? `${conversionData.summary.leadConversionRate.toFixed(1)}%`
                    : "—"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {conversionData.leadFunnel
                    ? `${conversionData.leadFunnel.totalConverted} / ${conversionData.leadFunnel.totalEntered} converted`
                    : "No leads in period"}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Referral funnel</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Sent → Accepted → Converted
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionData.referralFunnel.stages.map((stage, i) => (
                    <div key={stage.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{stage.label}</span>
                        <span className="font-medium">
                          {stage.count}
                          {i > 0 && (
                            <span className="text-muted-foreground font-normal ml-1">
                              ({stage.pct.toFixed(0)}%)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${stage.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Offer funnel</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Sent/Received → Accepted → Completed
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionData.offerFunnel.stages.map((stage, i) => (
                    <div key={stage.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{stage.label}</span>
                        <span className="font-medium">
                          {stage.count}
                          {i > 0 && (
                            <span className="text-muted-foreground font-normal ml-1">
                              ({stage.pct.toFixed(0)}%)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${stage.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lead funnel</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Received → Converted
                </p>
              </CardHeader>
              <CardContent>
                {conversionData.leadFunnel ? (
                  <div className="space-y-4">
                    {conversionData.leadFunnel.stages.map((stage, i) => (
                      <div key={stage.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{stage.label}</span>
                          <span className="font-medium">
                            {stage.count}
                            {i > 0 && (
                              <span className="text-muted-foreground font-normal ml-1">
                                ({stage.pct.toFixed(0)}%)
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${stage.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4">
                    No leads in this period.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
