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

export interface EngagementDataPoint {
  period: string;
  label: string;
  messagesSent: number;
  messagesReceived: number;
  referralsSent: number;
  offersSent: number;
  offersReceived: number;
  favoritesReceived: number;
}

export interface EngagementAnalytics {
  chartData: EngagementDataPoint[];
  summary: {
    totalMessagesSent: number;
    totalMessagesReceived: number;
    totalReferralsSent: number;
    totalOffersSent: number;
    totalOffersReceived: number;
    totalFavoritesReceived: number;
    uniqueConversations: number;
    engagementsCount: number;
    engagementsCompleted: number;
  };
  topServices: Array<{ title: string; count: number; amount_cents: number }>;
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

async function fetchEngagementAnalytics(
  userId: string,
  range: TimeRange
): Promise<EngagementAnalytics> {
  const { from, to } = getDateRange(range);

  const [messagesRes, referralsRes, offersSentRes, offersReceivedRes, favoritesRes, engagementsRes] =
    await Promise.all([
      supabase
        .from("messages")
        .select("id, sender_id, recipient_id, created_at")
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order("created_at", { ascending: true }),
      supabase
        .from("referrals")
        .select("id, referrer_id, status, created_at")
        .eq("referrer_id", userId)
        .order("created_at", { ascending: true }),
      supabase
        .from("offers")
        .select("id, title, amount_cents, sender_id, created_at")
        .eq("sender_id", userId)
        .order("created_at", { ascending: true }),
      supabase
        .from("offers")
        .select("id, title, amount_cents, recipient_id, created_at")
        .eq("recipient_id", userId)
        .order("created_at", { ascending: true }),
      supabase
        .from("favorites")
        .select("id, user_id, profile_id, created_at")
        .eq("profile_id", userId)
        .order("created_at", { ascending: true }),
      supabase
        .from("engagements")
        .select("id, provider_id, client_id, status, created_at")
        .eq("provider_id", userId)
        .order("created_at", { ascending: true }),
    ]);

  const messages = (messagesRes.data ?? []) as Array<{
    id: string;
    sender_id: string;
    recipient_id: string;
    created_at: string;
  }>;
  const referrals = (referralsRes.data ?? []) as Array<{
    id: string;
    referrer_id: string;
    status: string;
    created_at: string | null;
  }>;
  const offersSent = (offersSentRes.data ?? []) as Array<{
    id: string;
    title: string;
    amount_cents: number;
    created_at: string | null;
  }>;
  const offersReceived = (offersReceivedRes.data ?? []) as Array<{
    id: string;
    title: string;
    amount_cents: number;
    created_at: string | null;
  }>;
  const favorites = (favoritesRes.data ?? []) as Array<{
    id: string;
    profile_id: string;
    created_at: string | null;
  }>;
  const engagements = (engagementsRes.data ?? []) as Array<{
    id: string;
    status: string;
    created_at: string | null;
  }>;

  const inRange = (d: string | null) => {
    if (!d) return false;
    const dt = parseISO(d);
    return dt >= from && dt <= to;
  };

  const totalMessagesSent = messages.filter(
    (m) => m.sender_id === userId && inRange(m.created_at)
  ).length;
  const totalMessagesReceived = messages.filter(
    (m) => m.recipient_id === userId && inRange(m.created_at)
  ).length;
  const totalReferralsSent = referrals.filter((r) => inRange(r.created_at)).length;
  const totalOffersSent = offersSent.filter((o) => inRange(o.created_at)).length;
  const totalOffersReceived = offersReceived.filter((o) =>
    inRange(o.created_at)
  ).length;
  const totalFavoritesReceived = favorites.filter((f) =>
    inRange(f.created_at)
  ).length;

  const conversationPairs = new Set<string>();
  messages
    .filter((m) => inRange(m.created_at))
    .forEach((m) => {
      const other =
        m.sender_id === userId ? m.recipient_id : m.sender_id;
      conversationPairs.add([userId, other].sort().join(":"));
    });
  const uniqueConversations = conversationPairs.size;

  const engagementsInRange = engagements.filter((e) => inRange(e.created_at));
  const engagementsCompleted = engagementsInRange.filter(
    (e) => e.status === "completed" || e.status === "closed"
  ).length;

  const chartData = buildEngagementChartData(
    messages,
    referrals,
    offersSent,
    offersReceived,
    favorites,
    userId,
    from,
    to,
    range
  );

  const { data: offersWithStatus } = await supabase
    .from("offers")
    .select("id, title, amount_cents, status, sender_id")
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .in("status", ["accepted", "completed"]);
  const byTitle: Record<string, { count: number; amount_cents: number }> = {};
  (offersWithStatus ?? []).forEach((o: { title: string; amount_cents: number; sender_id: string }) => {
    const t = o.title || "Untitled";
    if (!byTitle[t]) byTitle[t] = { count: 0, amount_cents: 0 };
    byTitle[t].count += 1;
    byTitle[t].amount_cents += o.amount_cents ?? 0;
  });
  const topServices = Object.entries(byTitle)
    .map(([title, v]) => ({ title, count: v.count, amount_cents: v.amount_cents }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    chartData,
    summary: {
      totalMessagesSent,
      totalMessagesReceived,
      totalReferralsSent,
      totalOffersSent,
      totalOffersReceived,
      totalFavoritesReceived,
      uniqueConversations,
      engagementsCount: engagementsInRange.length,
      engagementsCompleted,
    },
    topServices,
  };
}

function buildEngagementChartData(
  messages: Array<{ sender_id: string; recipient_id: string; created_at: string }>,
  referrals: Array<{ created_at: string | null }>,
  offersSent: Array<{ created_at: string | null }>,
  offersReceived: Array<{ created_at: string | null }>,
  favorites: Array<{ created_at: string | null }>,
  userId: string,
  from: Date,
  to: Date,
  range: TimeRange
): EngagementDataPoint[] {
  const points: EngagementDataPoint[] = [];
  const groupByMonth = range === "1y" || range === "90d";

  const countInPeriod = (
    items: Array<{ created_at: string | null }>,
    periodStart: Date,
    periodEnd: Date
  ) =>
    items.filter((i) => {
      if (!i.created_at) return false;
      const d = parseISO(i.created_at);
      return d >= periodStart && d <= periodEnd;
    }).length;

  const countMessagesInPeriod = (
    sent: boolean,
    periodStart: Date,
    periodEnd: Date
  ) =>
    messages.filter((m) => {
      const d = parseISO(m.created_at);
      if (d < periodStart || d > periodEnd) return false;
      return sent ? m.sender_id === userId : m.recipient_id === userId;
    }).length;

  if (groupByMonth) {
    let current = startOfMonth(from);
    while (current <= to) {
      const periodEnd = endOfMonth(current);
      const periodStart = current;
      points.push({
        period: format(current, "yyyy-MM"),
        label: format(current, "MMM yyyy"),
        messagesSent: countMessagesInPeriod(true, periodStart, periodEnd),
        messagesReceived: countMessagesInPeriod(false, periodStart, periodEnd),
        referralsSent: countInPeriod(referrals, periodStart, periodEnd),
        offersSent: countInPeriod(offersSent, periodStart, periodEnd),
        offersReceived: countInPeriod(offersReceived, periodStart, periodEnd),
        favoritesReceived: countInPeriod(favorites, periodStart, periodEnd),
      });
      current = subMonths(periodEnd, -1);
    }
  } else {
    const days = range === "7d" ? 7 : 30;
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(to, i);
      const dayStart = startOfDay(d);
      const dayEnd = endOfDay(d);
      points.push({
        period: format(d, "yyyy-MM-dd"),
        label: format(d, "MMM d"),
        messagesSent: countMessagesInPeriod(true, dayStart, dayEnd),
        messagesReceived: countMessagesInPeriod(false, dayStart, dayEnd),
        referralsSent: countInPeriod(referrals, dayStart, dayEnd),
        offersSent: countInPeriod(offersSent, dayStart, dayEnd),
        offersReceived: countInPeriod(offersReceived, dayStart, dayEnd),
        favoritesReceived: countInPeriod(favorites, dayStart, dayEnd),
      });
    }
  }

  return points;
}

export function useEngagementAnalytics(userId: string | null, range: TimeRange) {
  return useQuery({
    queryKey: ["engagement-analytics", userId, range],
    queryFn: () => fetchEngagementAnalytics(userId!, range),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}
