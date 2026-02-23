"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  CrowdfundingProject,
  CrowdfundingPledge,
  FundAllocationItem,
} from "@/lib/crowdfunding-types";

function parseFundAllocation(
  val: unknown
): FundAllocationItem[] {
  if (!val || !Array.isArray(val)) return [];
  return val.map((item: unknown) => ({
    category: typeof item === "object" && item && "category" in item ? String((item as { category: unknown }).category) : "",
    description: typeof item === "object" && item && "description" in item ? String((item as { description?: unknown }).description ?? "") : undefined,
    amount_pct: typeof item === "object" && item && "amount_pct" in item ? Number((item as { amount_pct: unknown }).amount_pct) : 0,
  }));
}

function projectFromRow(row: Record<string, unknown>): CrowdfundingProject {
  return {
    id: String(row.id),
    creator_id: row.creator_id ? String(row.creator_id) : null,
    title: String(row.title),
    slug: row.slug ? String(row.slug) : null,
    short_description: row.short_description ? String(row.short_description) : null,
    description: row.description ? String(row.description) : null,
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    category: row.category as CrowdfundingProject["category"],
    location: row.location ? String(row.location) : null,
    min_investment_cents: Number(row.min_investment_cents),
    target_amount_cents: Number(row.target_amount_cents),
    raised_amount_cents: Number(row.raised_amount_cents),
    expected_roi_pct: row.expected_roi_pct != null ? Number(row.expected_roi_pct) : null,
    status: row.status as CrowdfundingProject["status"],
    fund_allocation_json: parseFundAllocation(row.fund_allocation_json),
    deadline_at: row.deadline_at ? String(row.deadline_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function useCrowdfundingProjects(status?: "active" | "funded" | "closed") {
  return useQuery({
    queryKey: ["crowdfunding", "projects", status],
    queryFn: async () => {
      let q = supabase
        .from("crowdfunding_projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (status) {
        q = q.eq("status", status);
      } else {
        q = q.in("status", ["active", "funded", "closed"]);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((r) => projectFromRow(r as Record<string, unknown>));
    },
  });
}

export function useCrowdfundingProject(id: string | null) {
  return useQuery({
    queryKey: ["crowdfunding", "project", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("crowdfunding_projects")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data ? projectFromRow(data as Record<string, unknown>) : null;
    },
    enabled: !!id,
  });
}

export function useCrowdfundingVotes(projectId: string | null) {
  return useQuery({
    queryKey: ["crowdfunding", "votes", projectId],
    queryFn: async () => {
      if (!projectId) return { up: 0, down: 0, interested: 0 };
      const { data, error } = await supabase
        .from("crowdfunding_votes")
        .select("vote_type")
        .eq("project_id", projectId);
      if (error) throw error;
      const votes = (data ?? []) as { vote_type: string }[];
      return {
        up: votes.filter((v) => v.vote_type === "up").length,
        down: votes.filter((v) => v.vote_type === "down").length,
        interested: votes.filter((v) => v.vote_type === "interested").length,
      };
    },
    enabled: !!projectId,
  });
}

export function useUserCrowdfundingPledges(userId: string | null) {
  return useQuery({
    queryKey: ["crowdfunding", "pledges", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("crowdfunding_pledges")
        .select(`
          *,
          crowdfunding_projects(id, title, slug, status, expected_roi_pct)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as (CrowdfundingPledge & { crowdfunding_projects: { id: string; title: string; slug: string | null; status: string; expected_roi_pct: number | null } | null })[];
    },
    enabled: !!userId,
  });
}

export function useUserPledgeForProject(projectId: string | null, userId: string | null) {
  return useQuery({
    queryKey: ["crowdfunding", "pledge", projectId, userId],
    queryFn: async () => {
      if (!projectId || !userId) return null;
      const { data, error } = await supabase
        .from("crowdfunding_pledges")
        .select("*")
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data as CrowdfundingPledge | null;
    },
    enabled: !!projectId && !!userId,
  });
}

export function useUserVoteForProject(projectId: string | null, userId: string | null) {
  return useQuery({
    queryKey: ["crowdfunding", "userVote", projectId, userId],
    queryFn: async () => {
      if (!projectId || !userId) return null;
      const { data, error } = await supabase
        .from("crowdfunding_votes")
        .select("vote_type")
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data?.vote_type as string | null;
    },
    enabled: !!projectId && !!userId,
  });
}

export function useCrowdfundingNotifications(userId: string | null) {
  return useQuery({
    queryKey: ["crowdfunding", "notifications", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("crowdfunding_notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as CrowdfundingNotification[];
    },
    enabled: !!userId,
  });
}

export function useVoteProject(projectId: string | null, userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (voteType: "up" | "down" | "interested") => {
      if (!projectId || !userId) throw new Error("Missing project or user");
      const { error } = await supabase.from("crowdfunding_votes").upsert(
        { project_id: projectId, user_id: userId, vote_type: voteType },
        { onConflict: "project_id,user_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crowdfunding", "votes", projectId] });
      queryClient.invalidateQueries({ queryKey: ["crowdfunding", "userVote", projectId, userId] });
    },
  });
}

export function useRemoveVote(projectId: string | null, userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!projectId || !userId) throw new Error("Missing project or user");
      const { error } = await supabase
        .from("crowdfunding_votes")
        .delete()
        .eq("project_id", projectId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crowdfunding", "votes", projectId] });
      queryClient.invalidateQueries({ queryKey: ["crowdfunding", "userVote", projectId, userId] });
    },
  });
}

export function useCreatePledge(projectId: string | null, userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amountCents: number) => {
      if (!projectId || !userId) throw new Error("Missing project or user");
      const { data, error } = await supabase
        .from("crowdfunding_pledges")
        .upsert(
          { project_id: projectId, user_id: userId, amount_cents: amountCents, status: "pledged" },
          { onConflict: "project_id,user_id" }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crowdfunding", "project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["crowdfunding", "pledge", projectId, userId] });
      queryClient.invalidateQueries({ queryKey: ["crowdfunding", "pledges", userId] });
    },
  });
}

export function useCancelPledge(projectId: string | null, userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!projectId || !userId) throw new Error("Missing project or user");
      const { error } = await supabase
        .from("crowdfunding_pledges")
        .update({ status: "cancelled" })
        .eq("project_id", projectId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crowdfunding", "project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["crowdfunding", "pledge", projectId, userId] });
      queryClient.invalidateQueries({ queryKey: ["crowdfunding", "pledges", userId] });
    },
  });
}

export function useMarkNotificationRead(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!userId) throw new Error("Missing user");
      const { error } = await supabase
        .from("crowdfunding_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crowdfunding", "notifications", userId] });
    },
  });
}

import type { CrowdfundingNotification } from "@/lib/crowdfunding-types";
