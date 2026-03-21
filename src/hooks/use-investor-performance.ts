"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  format,
  parseISO,
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";

export type TimeRange = "7d" | "30d" | "90d" | "1y";

export interface InvestorChartPoint {
  period: string;
  label: string;
  earnings: number;
}

export interface InvestorPerformance {
  chartData: InvestorChartPoint[];
  summary: {
    referralConversionRate: number;
    totalReferrals: number;
    convertedReferrals: number;
    totalEarnedCents: number;
    pendingCommissionCents: number;
    totalPledgedCents: number;
    weightedExpectedRoiPct: number | null;
    activeInvestments: number;
  };
}

function getDateRange(range: TimeRange): { from: Date; to: Date } {
  const to = new Date();
  let from: Date;
  switch (range) {
    case "7d":
      from = subDays(to, 7);
      break;
    case "30d":
      from = subDays(to, 30);
      break;
    case "90d":
      from = subDays(to, 90);
      break;
    case "1y":
      from = subDays(to, 365);
      break;
    default:
      from = subDays(to, 30);
  }
  return { from, to };
}

async function fetchInvestorPerformance(
  userId: string,
  range: TimeRange
): Promise<InvestorPerformance> {
  const { from, to } = getDateRange(range);

  const [referralsRes, pledgesRes] = await Promise.all([
    supabase
      .from("referrals")
      .select("id, status, created_at")
      .eq("referrer_id", userId),
    supabase
      .from("crowdfunding_pledges")
      .select(`
        amount_cents,
        status,
        crowdfunding_projects(expected_roi_pct)
      `)
      .eq("user_id", userId)
      .in("status", ["pledged", "confirmed"]),
  ]);

  const referrals = (referralsRes.data ?? []) as Array<{
    id: string;
    status: string;
    created_at: string | null;
  }>;

  const referralIds = referrals.map((r) => r.id);
  const { data: commissionsData } =
    referralIds.length > 0
      ? await supabase
          .from("referral_commissions")
          .select("id, amount_cents, status, paid_at, created_at, referral_id")
          .in("referral_id", referralIds)
          .order("paid_at", { ascending: true })
      : { data: [] };

  const commissions = (commissionsData ?? []) as Array<{
    id: string;
    amount_cents: number;
    status: string;
    paid_at: string | null;
    created_at: string | null;
  }>;

  // Embed type is SelectQueryError when FK isn't in generated Database typings;
  // assert via unknown so runtime shape still matches the select string.
  const pledges = (pledgesRes.data ?? []) as unknown as Array<{
    amount_cents: number;
    status: string;
    crowdfunding_projects: { expected_roi_pct: number | null } | null;
  }>;

  const convertedReferrals = referrals.filter((r) => r.status === "converted");
  const referralConversionRate =
    referrals.length > 0
      ? (convertedReferrals.length / referrals.length) * 100
      : 0;

  const paidCommissions = commissions.filter((c) => c.status === "paid");
  const totalEarnedCents = paidCommissions.reduce(
    (s, c) => s + (c.amount_cents ?? 0),
    0
  );
  const pendingCommissionCents = commissions
    .filter((c) => c.status === "pending" || c.status === "approved")
    .reduce((s, c) => s + (c.amount_cents ?? 0), 0);

  const totalPledgedCents = pledges.reduce((s, p) => s + p.amount_cents, 0);
  const activeInvestments = pledges.length;

  let weightedExpectedRoiPct: number | null = null;
  if (totalPledgedCents > 0) {
    const weightedSum = pledges.reduce((s, p) => {
      const roi = p.crowdfunding_projects?.expected_roi_pct ?? 0;
      return s + (p.amount_cents / totalPledgedCents) * roi;
    }, 0);
    weightedExpectedRoiPct = weightedSum;
  }

  const chartData = buildChartData(commissions, from, to, range);

  return {
    chartData,
    summary: {
      referralConversionRate,
      totalReferrals: referrals.length,
      convertedReferrals: convertedReferrals.length,
      totalEarnedCents,
      pendingCommissionCents,
      totalPledgedCents,
      weightedExpectedRoiPct,
      activeInvestments,
    },
  };
}

function buildChartData(
  commissions: Array<{
    amount_cents: number;
    status: string;
    paid_at: string | null;
    created_at: string | null;
  }>,
  from: Date,
  to: Date,
  range: TimeRange
): InvestorChartPoint[] {
  const points: InvestorChartPoint[] = [];
  const groupByMonth = range === "1y" || range === "90d";

  const paidCommissions = commissions.filter((c) => c.status === "paid");

  if (groupByMonth) {
    let current = startOfMonth(from);
    while (current <= to) {
      const periodEnd = endOfMonth(current);
      const periodStart = current;
      const commissionsInPeriod = paidCommissions.filter((c) => {
        const d = c.paid_at
          ? parseISO(c.paid_at)
          : c.created_at
            ? parseISO(c.created_at)
            : null;
        return d && d >= periodStart && d <= periodEnd;
      });
      const sum = commissionsInPeriod.reduce(
        (s, c) => s + (c.amount_cents ?? 0),
        0
      );
      points.push({
        period: format(current, "yyyy-MM"),
        label: format(current, "MMM yyyy"),
        earnings: sum / 100,
      });
      current = subMonths(periodEnd, -1);
    }
  } else {
    const days = range === "7d" ? 7 : 30;
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(to, i);
      const dayStart = startOfDay(d);
      const dayEnd = endOfDay(d);
      const commissionsInDay = paidCommissions.filter((c) => {
        const dt = c.paid_at
          ? parseISO(c.paid_at)
          : c.created_at
            ? parseISO(c.created_at)
            : null;
        return dt && dt >= dayStart && dt <= dayEnd;
      });
      const sum = commissionsInDay.reduce(
        (s, c) => s + (c.amount_cents ?? 0),
        0
      );
      points.push({
        period: format(d, "yyyy-MM-dd"),
        label: format(d, "MMM d"),
        earnings: sum / 100,
      });
    }
  }

  return points;
}

export function useInvestorPerformance(userId: string | null, range: TimeRange) {
  return useQuery({
    queryKey: ["investor-performance", userId, range],
    queryFn: () => fetchInvestorPerformance(userId!, range),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}
