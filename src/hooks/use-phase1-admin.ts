"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Phase-1 metrics: Signup→Activation, Referral count, Profile approval, 7-14 day return */
export function usePhase1Metrics() {
  return useQuery({
    queryKey: ["phase1", "metrics"],
    queryFn: async () => {
      const now = new Date();
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const [
        { count: totalProfiles },
        { count: approvedProfiles },
        { count: pendingProfiles },
        { data: referrals },
        { count: totalReferrals },
        { data: recentSignups },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("user_type", "service_provider")
          .eq("registration_status", "approved"),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("user_type", "service_provider")
          .in("registration_status", ["pending", "under_review"]),
        supabase.from("referrals").select("id, created_at, referrer_id"),
        supabase.from("referrals").select("*", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("id, created_at")
          .gte("created_at", fourteenDaysAgo.toISOString()),
      ]);

      const investorsWithReferrals = new Set(
        (referrals ?? []).map((r: { referrer_id: string }) => r.referrer_id)
      );
      const signupIds = new Set((recentSignups ?? []).map((p: { id: string }) => p.id));
      const returnedWithin14Days = (referrals ?? []).filter(
        (r: { referrer_id: string; created_at: string }) => {
          const signup = recentSignups?.find((s: { id: string }) => s.id === r.referrer_id);
          if (!signup) return false;
          const signupDate = new Date(signup.created_at);
          const referralDate = new Date(r.created_at);
          const daysDiff = (referralDate.getTime() - signupDate.getTime()) / (24 * 60 * 60 * 1000);
          return daysDiff >= 0 && daysDiff <= 14;
        }
      ).length;

      return {
        totalProfiles: totalProfiles ?? 0,
        approvedProfiles: approvedProfiles ?? 0,
        pendingProfiles: pendingProfiles ?? 0,
        totalReferrals: totalReferrals ?? 0,
        activatedInvestors: investorsWithReferrals.size,
        signupActivationConversion:
          (recentSignups?.length ?? 0) > 0
            ? Math.round((investorsWithReferrals.size / (recentSignups?.length ?? 1)) * 100)
            : 0,
        returnRate7_14: returnedWithin14Days,
      };
    },
  });
}

/** Pending PSP profiles for admin approval */
export function usePendingProfiles() {
  return useQuery({
    queryKey: ["phase1", "pending-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, user_type, created_at, registration_status")
        .eq("user_type", "service_provider")
        .in("registration_status", ["pending", "under_review"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Approve or reject profile */
export function useUpdateProfileApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      profileId: string;
      status: "approved" | "rejected";
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          registration_status: params.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phase1"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

/** Open disputes */
export function useOpenDisputes() {
  return useQuery({
    queryKey: ["phase1", "disputes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referral_disputes")
        .select(`
          *,
          referrals(id, referrer_id, recipient_profile_id, status),
          referral_commissions(id, amount_cents, status)
        `)
        .in("status", ["open", "in_review"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Create dispute (Investor/PSP) */
export function useCreateDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      referralId?: string;
      commissionId?: string;
      reason: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error("Sign in required");
      const profileRes = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();
      const profileId = profileRes.data?.id ?? user.id;
      const { data, error } = await supabase
        .from("referral_disputes")
        .insert({
          referral_id: params.referralId ?? null,
          commission_id: params.commissionId ?? null,
          raised_by: profileId,
          reason: params.reason,
          status: "open",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phase1", "disputes"] });
    },
  });
}

/** Resolve dispute */
export function useResolveDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      disputeId: string;
      status: "resolved" | "closed";
      admin_notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("referral_disputes")
        .update({
          status: params.status,
          admin_notes: params.admin_notes,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.disputeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phase1", "disputes"] });
    },
  });
}
