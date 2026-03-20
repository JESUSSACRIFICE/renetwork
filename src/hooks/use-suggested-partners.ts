"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

export interface SuggestedPartner {
  id: string;
  full_name: string;
  avatar_url: string | null;
  title: string;
  location: string;
  psp_labels: string[];
  rating: number;
  reviews: number;
  referral_fee_percentage: number | null;
}

const SUGGESTED_PARTNERS_KEY = ["suggested-partners"] as const;

function scorePartner(
  p: {
    zip_code?: string;
    psp_labels: string[];
    review_count: number;
    referral_fee_percentage: number | null;
    willing_to_train: boolean | null;
  },
  userZipCode: string | null,
  userPspLabels: string[]
): number {
  let score = 0;
  if (userZipCode && p.zip_code) {
    if (p.zip_code === userZipCode) score += 10;
    else if (p.zip_code.slice(0, 3) === userZipCode.slice(0, 3)) score += 5;
  }
  if (userPspLabels.length > 0 && p.psp_labels.some((l) => userPspLabels.includes(l)))
    score += 5;
  if (p.review_count > 0) score += 3;
  if (p.referral_fee_percentage != null) score += 2;
  if (p.willing_to_train) score += 1;
  return score;
}

export function useSuggestedPartners(
  userId: string | null,
  userZipCode: string | null,
  userPspLabels: string[],
  limit = 12
) {
  return useQuery({
    queryKey: [...SUGGESTED_PARTNERS_KEY, userId, userZipCode, userPspLabels.join(","), limit],
    queryFn: async (): Promise<SuggestedPartner[]> => {
      if (!userId) return [];

      const { data: profilesData, error: profilesError } = await db
        .from("profiles")
        .select("id, full_name, avatar_url, referral_fee_percentage, willing_to_train")
        .eq("user_type", "service_provider")
        .neq("id", userId)
        .or("registration_status.eq.approved,registration_status.is.null")
        .limit(limit * 3);

      if (profilesError) throw profilesError;
      const profileIds = (profilesData || []).map((p: { id: string }) => p.id);
      if (profileIds.length === 0) return [];

      const [
        areasRes,
        bizRes,
        userPspRes,
        pspTypesRes,
        reviewsRes,
      ] = await Promise.all([
        db.from("service_areas").select("user_id, zip_code").in("user_id", profileIds),
        db.from("business_info").select("user_id, company_name").in("user_id", profileIds),
        db.from("user_psp_types").select("user_id, psp_type_id").in("user_id", profileIds),
        db.from("psp_types").select("id, label"),
        db.from("reviews").select("profile_id, rating").in("profile_id", profileIds),
      ]);

      const pspLabelById: Record<string, string> = {};
      (pspTypesRes?.data || []).forEach((r: { id: string; label: string }) => {
        pspLabelById[r.id] = r.label;
      });

      const zipByUser: Record<string, string> = {};
      (areasRes?.data || []).forEach((a: { user_id: string; zip_code: string }) => {
        if (!zipByUser[a.user_id]) zipByUser[a.user_id] = a.zip_code;
      });

      const companyByUser: Record<string, string | null> = {};
      (bizRes?.data || []).forEach((b: { user_id: string; company_name: string | null }) => {
        companyByUser[b.user_id] = b.company_name ?? null;
      });

      const pspLabelsByUser: Record<string, string[]> = {};
      (userPspRes?.data || []).forEach((r: { user_id: string; psp_type_id: string }) => {
        const label = pspLabelById[r.psp_type_id];
        if (label) {
          if (!pspLabelsByUser[r.user_id]) pspLabelsByUser[r.user_id] = [];
          pspLabelsByUser[r.user_id].push(label);
        }
      });

      const reviewStats: Record<string, { count: number; sum: number }> = {};
      (reviewsRes?.data || []).forEach((r: { profile_id: string; rating: number }) => {
        if (!reviewStats[r.profile_id]) reviewStats[r.profile_id] = { count: 0, sum: 0 };
        reviewStats[r.profile_id].count++;
        reviewStats[r.profile_id].sum += r.rating;
      });

      const scored = (profilesData || []).map((p: any) => {
        const pspLabels = pspLabelsByUser[p.id] || [];
        const rev = reviewStats[p.id];
        const s = scorePartner(
          {
            zip_code: zipByUser[p.id],
            psp_labels: pspLabels,
            review_count: rev?.count ?? 0,
            referral_fee_percentage: p.referral_fee_percentage,
            willing_to_train: p.willing_to_train,
          },
          userZipCode,
          userPspLabels
        );
        return {
          ...p,
          score: s,
          psp_labels: pspLabels,
          zip_code: zipByUser[p.id],
          review_count: rev?.count ?? 0,
          rating_avg: rev ? rev.sum / rev.count : 0,
        };
      });

      scored.sort((a: { score: number }, b: { score: number }) => b.score - a.score);

      return scored.slice(0, limit).map((p: any) => ({
        id: p.id,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        title: companyByUser[p.id] || p.full_name,
        location: p.zip_code || "Location not specified",
        psp_labels: p.psp_labels,
        rating: p.rating_avg ? parseFloat(p.rating_avg.toFixed(1)) : 0,
        reviews: p.review_count,
        referral_fee_percentage: p.referral_fee_percentage,
      }));
    },
    enabled: !!userId,
  });
}
