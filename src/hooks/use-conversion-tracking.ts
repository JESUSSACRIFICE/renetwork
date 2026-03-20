"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";

export type TimeRange = "7d" | "30d" | "90d" | "1y";

export interface FunnelStage {
  label: string;
  count: number;
  pct: number;
}

export interface ConversionFunnel {
  name: string;
  stages: FunnelStage[];
  conversionRate: number;
  totalEntered: number;
  totalConverted: number;
}

export interface ConversionTracking {
  referralFunnel: ConversionFunnel;
  offerFunnel: ConversionFunnel;
  leadFunnel: ConversionFunnel | null;
  summary: {
    referralConversionRate: number;
    offerConversionRate: number;
    leadConversionRate: number | null;
  };
}

function getDateRange(range: TimeRange): { from: Date; to: Date } {
  const to = new Date();
  const days =
    range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
  const from = subDays(to, days);
  return { from, to };
}

async function fetchConversionTracking(
  userId: string,
  range: TimeRange
): Promise<ConversionTracking> {
  const { from, to } = getDateRange(range);
  const fromStr = from.toISOString();
  const toStr = to.toISOString();

  const [referralsRes, offersSentRes, offersReceivedRes, leadsRes] =
    await Promise.all([
      supabase
        .from("referrals")
        .select("id, status, created_at")
        .eq("referrer_id", userId)
        .gte("created_at", fromStr)
        .lte("created_at", toStr),
      supabase
        .from("offers")
        .select("id, status, created_at")
        .eq("sender_id", userId)
        .gte("created_at", fromStr)
        .lte("created_at", toStr),
      supabase
        .from("offers")
        .select("id, status, created_at")
        .eq("recipient_id", userId)
        .gte("created_at", fromStr)
        .lte("created_at", toStr),
      supabase
        .from("leads")
        .select("id, status, created_at, profile_id")
        .eq("profile_id", userId)
        .gte("created_at", fromStr)
        .lte("created_at", toStr),
    ]);

  const referrals = referralsRes.data ?? [];
  const offersSent = offersSentRes.data ?? [];
  const offersReceived = offersReceivedRes.data ?? [];
  const leads = leadsRes.data ?? [];

  const allOffers = [...offersSent, ...offersReceived];

  const refByStatus = countByStatus(referrals, "status");
  const offerByStatus = countByStatus(allOffers, "status");
  const leadByStatus = countByStatus(leads, "status");

  const refPending = refByStatus["pending_acceptance"] ?? 0;
  const refAccepted = refByStatus["accepted"] ?? 0;
  const refConverted = refByStatus["converted"] ?? 0;
  const refTotal = referrals.length;
  const refConversionRate =
    refTotal > 0 ? (refConverted / refTotal) * 100 : 0;

  const referralFunnel: ConversionFunnel = {
    name: "Referral funnel",
    stages: [
      { label: "Sent", count: refTotal, pct: 100 },
      {
        label: "Accepted",
        count: refAccepted + refConverted,
        pct: refTotal > 0 ? ((refAccepted + refConverted) / refTotal) * 100 : 0,
      },
      {
        label: "Converted",
        count: refConverted,
        pct: refConversionRate,
      },
    ],
    conversionRate: refConversionRate,
    totalEntered: refTotal,
    totalConverted: refConverted,
  };

  const offerPending = offerByStatus["pending"] ?? 0;
  const offerAccepted = offerByStatus["accepted"] ?? 0;
  const offerCompleted = offerByStatus["completed"] ?? 0;
  const offerTotal = allOffers.length;
  const offerConverted = offerAccepted + offerCompleted;
  const offerConversionRate =
    offerTotal > 0 ? (offerConverted / offerTotal) * 100 : 0;

  const offerFunnel: ConversionFunnel = {
    name: "Offer funnel",
    stages: [
      { label: "Sent/Received", count: offerTotal, pct: 100 },
      {
        label: "Accepted",
        count: offerConverted,
        pct: offerConversionRate,
      },
      {
        label: "Completed",
        count: offerCompleted,
        pct:
          offerTotal > 0 ? (offerCompleted / offerTotal) * 100 : 0,
      },
    ],
    conversionRate: offerConversionRate,
    totalEntered: offerTotal,
    totalConverted: offerCompleted,
  };

  const leadTotal = leads.length;
  const leadConverted = leadByStatus["converted"] ?? 0;
  const leadConversionRate =
    leadTotal > 0 ? (leadConverted / leadTotal) * 100 : 0;

  const leadFunnel: ConversionFunnel | null =
    leadTotal > 0
      ? {
          name: "Lead funnel",
          stages: [
            { label: "Received", count: leadTotal, pct: 100 },
            {
              label: "Converted",
              count: leadConverted,
              pct: leadConversionRate,
            },
          ],
          conversionRate: leadConversionRate,
          totalEntered: leadTotal,
          totalConverted: leadConverted,
        }
      : null;

  return {
    referralFunnel,
    offerFunnel,
    leadFunnel,
    summary: {
      referralConversionRate: refConversionRate,
      offerConversionRate,
      leadConversionRate: leadTotal > 0 ? leadConversionRate : null,
    },
  };
}

function countByStatus<T extends Record<string, unknown>>(
  items: T[],
  statusKey: keyof T
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const s = String(item[statusKey] ?? "unknown");
    out[s] = (out[s] ?? 0) + 1;
  }
  return out;
}

export function useConversionTracking(userId: string | null, range: TimeRange) {
  return useQuery({
    queryKey: ["conversion-tracking", userId, range],
    queryFn: () => fetchConversionTracking(userId!, range),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}
