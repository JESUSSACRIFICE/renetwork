"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CommunityVoteItem } from "@/lib/community-vote-types";

function itemFromRow(row: Record<string, unknown>): CommunityVoteItem {
  return {
    id: String(row.id),
    title: String(row.title),
    description: row.description ? String(row.description) : null,
    item_type: row.item_type as CommunityVoteItem["item_type"],
    status: row.status as CommunityVoteItem["status"],
    vote_count: Number(row.vote_count),
    sort_order: Number(row.sort_order),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function useCommunityVoteItems(itemType?: "location" | "feature") {
  return useQuery({
    queryKey: ["communityVotes", "items", itemType],
    queryFn: async () => {
      let q = supabase
        .from("community_vote_items")
        .select("*")
        .eq("status", "open")
        .order("vote_count", { ascending: false })
        .order("sort_order", { ascending: true });
      if (itemType) {
        q = q.eq("item_type", itemType);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((r) => itemFromRow(r as Record<string, unknown>));
    },
  });
}

export function useUserVotedItemIds(userId: string | null) {
  return useQuery({
    queryKey: ["communityVotes", "userVotes", userId],
    queryFn: async () => {
      if (!userId) return new Set<string>();
      const { data, error } = await supabase
        .from("community_votes")
        .select("item_id")
        .eq("user_id", userId);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.item_id));
    },
    enabled: !!userId,
  });
}

export function useVoteItem(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!itemId || !userId) throw new Error("Missing item or user");
      const { error } = await supabase.from("community_votes").insert({
        item_id: itemId,
        user_id: userId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityVotes"] });
    },
  });
}

export function useRemoveVoteItem(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!itemId || !userId) throw new Error("Missing item or user");
      const { error } = await supabase
        .from("community_votes")
        .delete()
        .eq("item_id", itemId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityVotes"] });
    },
  });
}
