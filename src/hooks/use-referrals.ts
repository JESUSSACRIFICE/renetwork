"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const REFERRAL_CODE_QUERY_KEY = ["referral", "code"] as const;
const REFERRALS_SENT_QUERY_KEY = ["referrals", "sent"] as const;
const REFERRALS_RECEIVED_QUERY_KEY = ["referrals", "received"] as const;
const COMMISSIONS_QUERY_KEY = ["referrals", "commissions"] as const;

/** Default commission amount in cents when a referral converts (e.g. $25 = 2500) */
const DEFAULT_COMMISSION_CENTS = 2500;

/**
 * Get user_id from a referral code
 */
export async function getUserIdFromReferralCode(
  code: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("referral_codes")
    .select("user_id")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (error || !data) return null;
  return data.user_id;
}

/**
 * Get or create referral code for the current user (via RPC)
 */
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const { data, error } = await supabase.rpc("get_or_create_referral_code", {
    p_user_id: userId,
  });

  if (error) throw error;
  return data as string;
}

/**
 * Create a referral record when a lead is submitted with a referrer (legacy/URL ref flow)
 */
export async function createReferral(params: {
  referrerId: string;
  recipientProfileId: string;
  leadId: string;
}): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from("referrals")
    .insert({
      referrer_id: params.referrerId,
      recipient_profile_id: params.recipientProfileId,
      lead_id: params.leadId,
      status: "pending_acceptance",
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: data.id };
}

/**
 * Create a referral by sharing a client's profile + context (new flow)
 */
export async function createReferralWithClient(params: {
  referrerId: string;
  recipientProfileId: string;
  clientProfileId: string;
  notes: string;
}): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from("referrals")
    .insert({
      referrer_id: params.referrerId,
      recipient_profile_id: params.recipientProfileId,
      client_profile_id: params.clientProfileId,
      notes: params.notes,
      status: "pending_acceptance",
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: data.id };
}

/**
 * Recipient accepts a referral (RLS ensures only recipient can update)
 */
export async function acceptReferral(referralId: string): Promise<void> {
  const { error } = await supabase
    .from("referrals")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", referralId);

  if (error) throw error;
}

/**
 * Create engagement (contract). When referral_id is set, triggers auto-conversion.
 */
export async function createEngagement(params: {
  providerId: string;
  clientId: string;
  referralId?: string | null;
  title?: string;
  notes?: string;
}): Promise<{ id: string }> {
  const { data, error } = await (supabase as any)
    .from("engagements")
    .insert({
      provider_id: params.providerId,
      client_id: params.clientId,
      referral_id: params.referralId ?? null,
      title: params.title ?? null,
      notes: params.notes ?? null,
      status: "active",
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: (data as { id: string }).id };
}

/**
 * Create commission when a referred lead is converted
 */
export async function createCommissionForReferral(params: {
  referralId: string;
  amountCents?: number;
}): Promise<void> {
  const amountCents = params.amountCents ?? DEFAULT_COMMISSION_CENTS;

  const { error } = await supabase.from("referral_commissions").insert({
    referral_id: params.referralId,
    amount_cents: amountCents,
    status: "pending",
  });

  if (error) throw error;
}

/**
 * Update referral status to converted
 */
export async function markReferralConverted(referralId: string): Promise<void> {
  const { error } = await supabase
    .from("referrals")
    .update({ status: "converted", updated_at: new Date().toISOString() })
    .eq("id", referralId);

  if (error) throw error;
}

/**
 * Get referral by lead_id (for legacy flow)
 */
export async function getReferralByLeadId(
  leadId: string
): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from("referrals")
    .select("id")
    .eq("lead_id", leadId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

/**
 * Fetch customers who have initiated a chat with the referrer (sent them a message).
 * Service providers can only refer customers who have messaged them first.
 */
export async function getReferrableClients(referrerId: string): Promise<
  Array<{ id: string; full_name: string; email: string | null; avatar_url: string | null }>
> {
  const { data: messages } = await supabase
    .from("messages")
    .select("sender_id")
    .eq("recipient_id", referrerId);

  const senderIds = [...new Set((messages ?? []).map((m: any) => m.sender_id))];
  if (senderIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .in("id", senderIds)
    .eq("user_type", "customer");

  return profiles ?? [];
}

/**
 * Hook: customers who have messaged the current user (referrable clients)
 */
export function useReferrableClients(referrerId: string | undefined) {
  const query = useQuery({
    queryKey: ["referrable-clients", referrerId ?? ""],
    queryFn: () => getReferrableClients(referrerId!),
    enabled: !!referrerId,
  });

  return {
    clients: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

/**
 * Hook: get or create referral code for current user
 */
export function useReferralCode(userId: string | undefined) {
  const query = useQuery({
    queryKey: [...REFERRAL_CODE_QUERY_KEY, userId ?? ""],
    queryFn: () => getOrCreateReferralCode(userId!),
    enabled: !!userId,
  });

  return {
    code: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook: referrals sent by current user (as referrer)
 */
export function useReferralsSent(userId: string | undefined) {
  const query = useQuery({
    queryKey: [...REFERRALS_SENT_QUERY_KEY, userId ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select(
          `
          id,
          recipient_profile_id,
          client_profile_id,
          lead_id,
          notes,
          status,
          created_at,
          updated_at,
          leads (name, email, status)
        `
        )
        .eq("referrer_id", userId!)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const recipientIds = [...new Set((data ?? []).map((r: any) => r.recipient_profile_id))];
      const clientIds = [...new Set((data ?? []).map((r: any) => r.client_profile_id).filter(Boolean))];
      let recipientMap: Record<string, { full_name: string; avatar_url?: string }> = {};
      let clientMap: Record<string, { full_name: string; email?: string }> = {};
      if (recipientIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", recipientIds);
        (profiles ?? []).forEach((p: any) => {
          recipientMap[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
        });
      }
      if (clientIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", clientIds);
        (profiles ?? []).forEach((p: any) => {
          clientMap[p.id] = { full_name: p.full_name, email: p.email };
        });
      }

      return (data ?? []).map((r: any) => ({
        ...r,
        recipient: recipientMap[r.recipient_profile_id],
        client: r.client_profile_id ? clientMap[r.client_profile_id] : null,
      }));
    },
    enabled: !!userId,
  });

  return {
    referrals: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook: referrals received by current user (as PSP/recipient)
 */
export function useReferralsReceived(profileId: string | undefined) {
  const query = useQuery({
    queryKey: [...REFERRALS_RECEIVED_QUERY_KEY, profileId ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select(
          `
          id,
          referrer_id,
          client_profile_id,
          lead_id,
          notes,
          status,
          created_at,
          leads (name, email, status)
        `
        )
        .eq("recipient_profile_id", profileId!)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const referrerIds = [...new Set((data ?? []).map((r: any) => r.referrer_id).filter(Boolean))];
      const clientIds = [...new Set((data ?? []).map((r: any) => r.client_profile_id).filter(Boolean))];
      let referrerMap: Record<string, { full_name: string; avatar_url?: string }> = {};
      let clientMap: Record<string, { full_name: string; email?: string }> = {};
      if (referrerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", referrerIds);
        (profiles ?? []).forEach((p: any) => {
          referrerMap[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
        });
      }
      if (clientIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", clientIds);
        (profiles ?? []).forEach((p: any) => {
          clientMap[p.id] = { full_name: p.full_name, email: p.email };
        });
      }

      return (data ?? []).map((r: any) => ({
        ...r,
        referrer: referrerMap[r.referrer_id],
        client: r.client_profile_id ? clientMap[r.client_profile_id] : null,
      }));
    },
    enabled: !!profileId,
  });

  return {
    referrals: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook: commissions earned by current user (as referrer)
 */
export function useReferralCommissions(userId: string | undefined) {
  const query = useQuery({
    queryKey: [...COMMISSIONS_QUERY_KEY, userId ?? ""],
    queryFn: async () => {
      const { data: referrals } = await supabase
        .from("referrals")
        .select("id, recipient_profile_id")
        .eq("referrer_id", userId!);

      const referralIds = (referrals ?? []).map((r) => r.id);
      if (referralIds.length === 0) return [];

      const { data, error } = await supabase
        .from("referral_commissions")
        .select("id, referral_id, amount_cents, status, paid_at, created_at")
        .in("referral_id", referralIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const recipientIds = [...new Set((referrals ?? []).map((r) => r.recipient_profile_id))];
      let recipientMap: Record<string, { full_name: string }> = {};
      if (recipientIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", recipientIds);
        (profiles ?? []).forEach((p: any) => {
          recipientMap[p.id] = { full_name: p.full_name };
        });
      }

      const refMap = (referrals ?? []).reduce((acc: Record<string, string>, r) => {
        acc[r.id] = r.recipient_profile_id;
        return acc;
      }, {});

      return (data ?? []).map((c: any) => ({
        ...c,
        recipient: recipientMap[refMap[c.referral_id]],
      }));
    },
    enabled: !!userId,
  });

  return {
    commissions: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook: aggregate referral stats for dashboard
 */
export function useReferralStats(userId: string | undefined) {
  const { referrals: sent } = useReferralsSent(userId);
  const { commissions } = useReferralCommissions(userId);

  const pending = sent.filter((r) => r.status === "pending").length;
  const converted = sent.filter((r) => r.status === "converted").length;
  const totalEarnedCents = commissions
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + (c.amount_cents ?? 0), 0);
  const pendingCents = commissions
    .filter((c) => c.status === "pending" || c.status === "approved")
    .reduce((sum, c) => sum + (c.amount_cents ?? 0), 0);

  return {
    totalReferrals: sent.length,
    pendingReferrals: pending,
    convertedReferrals: converted,
    totalEarnedCents,
    pendingCommissionCents: pendingCents,
    commissions,
  };
}
