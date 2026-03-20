"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  parseISO,
  startOfDay,
  endOfDay,
  subDays,
} from "date-fns";

export type TimeRange = "7d" | "30d" | "90d" | "1y";

export interface RevenueDataPoint {
  period: string;
  label: string;
  offers: number;
  referrals: number;
  total: number;
}

export interface RevenueReportRow {
  id: string;
  type: "offer" | "referral";
  date: string;
  title: string;
  amount_cents: number;
  status: string;
}

export interface RevenueAnalytics {
  chartData: RevenueDataPoint[];
  reportRows: RevenueReportRow[];
  summary: {
    totalEarned: number;
    fromOffers: number;
    fromReferrals: number;
    pendingReferrals: number;
    referralSuccessRate: number;
    totalReferrals: number;
    convertedReferrals: number;
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

async function fetchRevenueAnalytics(
  userId: string,
  range: TimeRange
): Promise<RevenueAnalytics> {
  const { from, to } = getDateRange(range);

  const [offersRes, referralsRes] = await Promise.all([
    supabase
      .from("offers")
      .select("id, title, amount_cents, status, accepted_at, created_at")
      .eq("sender_id", userId)
      .in("status", ["accepted", "completed"])
      .order("accepted_at", { ascending: true }),
    supabase
      .from("referrals")
      .select("id, status, created_at")
      .eq("referrer_id", userId),
  ]);

  const offers = (offersRes.data ?? []) as Array<{
    id: string;
    title: string;
    amount_cents: number;
    status: string;
    accepted_at: string | null;
    created_at: string | null;
  }>;
  const referrals = (referralsRes.data ?? []) as Array<{
    id: string;
    status: string;
    created_at: string | null;
  }>;

  const referralIds = referrals.map((r) => r.id);
  const { data: commissionsForUser } =
    referralIds.length > 0
      ? await supabase
          .from("referral_commissions")
          .select("id, amount_cents, status, paid_at, created_at, referral_id")
          .in("referral_id", referralIds)
          .order("paid_at", { ascending: true })
      : { data: [] };

  const commissionsData = (commissionsForUser ?? []) as Array<{
    id: string;
    amount_cents: number;
    status: string;
    paid_at: string | null;
    created_at: string | null;
  }>;

  const convertedReferrals = referrals.filter((r) => r.status === "converted");
  const referralSuccessRate =
    referrals.length > 0
      ? (convertedReferrals.length / referrals.length) * 100
      : 0;

  const paidCommissions = commissionsData.filter((c) => c.status === "paid");
  const pendingCommissions = commissionsData.filter(
    (c) => c.status === "pending" || c.status === "approved"
  );
  const fromOffers = offers.reduce((s, o) => s + o.amount_cents, 0);
  const fromReferralsPaid = paidCommissions.reduce(
    (s, c) => s + (c.amount_cents ?? 0),
    0
  );
  const pendingReferrals = pendingCommissions.reduce(
    (s, c) => s + (c.amount_cents ?? 0),
    0
  );

  const reportRows: RevenueReportRow[] = [
    ...offers.map((o) => ({
      id: o.id,
      type: "offer" as const,
      date: o.accepted_at ?? o.created_at ?? "",
      title: o.title,
      amount_cents: o.amount_cents,
      status: o.status,
    })),
    ...commissionsData.map((c) => ({
      id: c.id,
      type: "referral" as const,
      date: c.paid_at ?? c.created_at ?? "",
      title: "Referral commission",
      amount_cents: c.amount_cents ?? 0,
      status: c.status,
    })),
  ]
    .filter((r) => r.date)
    .filter((r) => {
      const d = parseISO(r.date);
      return d >= from && d <= to;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const chartData = buildChartData(offers, commissionsData, from, to, range);

  return {
    chartData,
    reportRows,
    summary: {
      totalEarned: fromOffers + fromReferralsPaid,
      fromOffers,
      fromReferrals: fromReferralsPaid,
      pendingReferrals,
      referralSuccessRate,
      totalReferrals: referrals.length,
      convertedReferrals: convertedReferrals.length,
    },
  };
}

function buildChartData(
  offers: Array<{ amount_cents: number; accepted_at: string | null; created_at: string | null }>,
  commissions: Array<{ amount_cents: number; paid_at: string | null; created_at: string | null }>,
  from: Date,
  to: Date,
  range: TimeRange
): RevenueDataPoint[] {
  const points: RevenueDataPoint[] = [];
  const groupByMonth = range === "1y" || range === "90d";

  if (groupByMonth) {
    let current = startOfMonth(from);
    while (current <= to) {
      const periodEnd = endOfMonth(current);
      const periodStart = current;
      const offersInPeriod = offers.filter((o) => {
        const d = o.accepted_at
          ? parseISO(o.accepted_at)
          : o.created_at
            ? parseISO(o.created_at)
            : null;
        return d && d >= periodStart && d <= periodEnd;
      });
      const commissionsInPeriod = commissions.filter((c) => {
        const d = c.paid_at
          ? parseISO(c.paid_at)
          : c.created_at
            ? parseISO(c.created_at)
            : null;
        return d && d >= periodStart && d <= periodEnd && c.status === "paid";
      });
      const offerSum = offersInPeriod.reduce((s, o) => s + o.amount_cents, 0);
      const refSum = commissionsInPeriod.reduce(
        (s, c) => s + (c.amount_cents ?? 0),
        0
      );
      points.push({
        period: format(current, "yyyy-MM"),
        label: format(current, "MMM yyyy"),
        offers: offerSum / 100,
        referrals: refSum / 100,
        total: (offerSum + refSum) / 100,
      });
      current = subMonths(periodEnd, -1);
    }
  } else {
    const days = range === "7d" ? 7 : 30;
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(to, i);
      const dayStart = startOfDay(d);
      const dayEnd = endOfDay(d);
      const offersInDay = offers.filter((o) => {
        const dt = o.accepted_at
          ? parseISO(o.accepted_at)
          : o.created_at
            ? parseISO(o.created_at)
            : null;
        return dt && dt >= dayStart && dt <= dayEnd;
      });
      const commissionsInDay = commissions.filter((c) => {
        const dt = c.paid_at
          ? parseISO(c.paid_at)
          : c.created_at
            ? parseISO(c.created_at)
            : null;
        return dt && dt >= dayStart && dt <= dayEnd && c.status === "paid";
      });
      const offerSum = offersInDay.reduce((s, o) => s + o.amount_cents, 0);
      const refSum = commissionsInDay.reduce(
        (s, c) => s + (c.amount_cents ?? 0),
        0
      );
      points.push({
        period: format(d, "yyyy-MM-dd"),
        label: format(d, "MMM d"),
        offers: offerSum / 100,
        referrals: refSum / 100,
        total: (offerSum + refSum) / 100,
      });
    }
  }

  return points;
}

export function useRevenueAnalytics(userId: string | null, range: TimeRange) {
  return useQuery({
    queryKey: ["revenue-analytics", userId, range],
    queryFn: () => fetchRevenueAnalytics(userId!, range),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}
