"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { NetworkPost, NetworkPostWithAuthor, NetworkPostComment, ProfileDealInterest } from "@/lib/networking-types";

function postFromRow(r: Record<string, unknown>): NetworkPost {
  return {
    id: String(r.id),
    author_id: String(r.author_id),
    title: r.title ? String(r.title) : null,
    content: String(r.content),
    type: r.type as NetworkPost["type"],
    deal_details: (r.deal_details as Record<string, unknown>) ?? {},
    group_id: r.group_id ? String(r.group_id) : null,
    like_count: Number(r.like_count),
    comment_count: Number(r.comment_count),
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
  };
}

export function useNetworkFeed(type?: "post" | "blog" | "deal") {
  return useQuery({
    queryKey: ["network", "feed", type],
    queryFn: async () => {
      let q = supabase
        .from("network_posts")
        .select(`
          *,
          profiles(id,full_name,avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(50);
      if (type) q = q.eq("type", type);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((r) => ({
        ...postFromRow(r as Record<string, unknown>),
        profiles: (r as { profiles?: unknown }).profiles ?? null,
      })) as NetworkPostWithAuthor[];
    },
  });
}

export function useNetworkPost(id: string | null) {
  return useQuery({
    queryKey: ["network", "post", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("network_posts")
        .select(`
          *,
          profiles(id,full_name,avatar_url)
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      if (!data) return null;
      return {
        ...postFromRow(data as Record<string, unknown>),
        profiles: (data as { profiles?: unknown }).profiles ?? null,
      } as NetworkPostWithAuthor;
    },
    enabled: !!id,
  });
}

export function useNetworkPostComments(postId: string | null) {
  return useQuery({
    queryKey: ["network", "comments", postId],
    queryFn: async () => {
      if (!postId) return [];
      const { data, error } = await supabase
        .from("network_post_comments")
        .select(`
          *,
          profiles(id,full_name,avatar_url)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as (NetworkPostComment & { profiles?: { id: string; full_name: string | null; avatar_url: string | null } })[];
    },
    enabled: !!postId,
  });
}

export function useUserLikedPost(postId: string | null, userId: string | null) {
  return useQuery({
    queryKey: ["network", "userLike", postId, userId],
    queryFn: async () => {
      if (!postId || !userId) return false;
      const { data } = await supabase
        .from("network_post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!postId && !!userId,
  });
}

export function useProfileDealInterests(profileId: string | null) {
  return useQuery({
    queryKey: ["network", "dealInterests", profileId],
    queryFn: async () => {
      if (!profileId) return [];
      const { data, error } = await supabase
        .from("profile_deal_interests")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProfileDealInterest[];
    },
    enabled: !!profileId,
  });
}

export function useCreateNetworkPost(userId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title?: string; content: string; type: "post" | "blog" | "deal"; deal_details?: Record<string, unknown> }) => {
      if (!userId) throw new Error("Sign in to post");
      const { data, error } = await supabase
        .from("network_posts")
        .insert({
          author_id: userId,
          title: input.title || null,
          content: input.content,
          type: input.type,
          deal_details: (input.deal_details ?? {}) as Json,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["network", "feed"] }),
  });
}

export function useLikePost(postId: string | null, userId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!postId || !userId) throw new Error("Missing post or user");
      await supabase.from("network_post_likes").upsert(
        { post_id: postId, user_id: userId },
        { onConflict: "post_id,user_id" }
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["network", "feed"] });
      qc.invalidateQueries({ queryKey: ["network", "post", postId] });
      qc.invalidateQueries({ queryKey: ["network", "userLike", postId, userId] });
    },
  });
}

export function useUnlikePost(postId: string | null, userId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!postId || !userId) throw new Error("Missing post or user");
      await supabase.from("network_post_likes").delete().eq("post_id", postId).eq("user_id", userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["network", "feed"] });
      qc.invalidateQueries({ queryKey: ["network", "post", postId] });
      qc.invalidateQueries({ queryKey: ["network", "userLike", postId, userId] });
    },
  });
}

export function useAddComment(postId: string | null, userId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      if (!postId || !userId) throw new Error("Sign in to comment");
      const { error } = await supabase.from("network_post_comments").insert({
        post_id: postId,
        author_id: userId,
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["network", "comments", postId] });
      qc.invalidateQueries({ queryKey: ["network", "post", postId] });
      qc.invalidateQueries({ queryKey: ["network", "feed"] });
    },
  });
}

export function useAddDealInterest(profileId: string | null, userId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<ProfileDealInterest>) => {
      if (!profileId || userId !== profileId) throw new Error("Unauthorized");
      const { error } = await supabase.from("profile_deal_interests").insert({
        profile_id: profileId,
        interest_type: input.interest_type!,
        title: input.title!,
        description: input.description ?? null,
        property_type: input.property_type ?? null,
        location: input.location ?? null,
        budget_min_cents: input.budget_min_cents ?? null,
        budget_max_cents: input.budget_max_cents ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["network", "dealInterests", profileId] }),
  });
}
