"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type {
  NetworkPost,
  NetworkPostWithAuthor,
  NetworkPostComment,
  ProfileDealInterest,
  NetworkAuthorPreview,
  NetworkHighlightPost,
} from "@/lib/networking-types";

function normalizeImageUrls(v: unknown): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) {
    return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  }
  return [];
}

function postFromRow(r: Record<string, unknown>): NetworkPost {
  return {
    id: String(r.id),
    author_id: String(r.author_id),
    title: r.title ? String(r.title) : null,
    content: String(r.content),
    type: r.type as NetworkPost["type"],
    deal_details: (r.deal_details as Record<string, unknown>) ?? {},
    image_urls: normalizeImageUrls(r.image_urls),
    group_id: r.group_id ? String(r.group_id) : null,
    like_count: Number(r.like_count),
    comment_count: Number(r.comment_count),
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
  };
}

export function useNetworkFeed(
  type?: "post" | "blog" | "deal",
  options?: { refetchInterval?: number }
) {
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
    refetchInterval: options?.refetchInterval,
  });
}

/** Lightweight slice of the feed for “related” and summary widgets. */
export function useNetworkFeedPreview(limit = 12) {
  return useQuery({
    queryKey: ["network", "feedPreview", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("network_posts")
        .select(`
          *,
          profiles(id,full_name,avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map((r) => ({
        ...postFromRow(r as Record<string, unknown>),
        profiles: (r as { profiles?: unknown }).profiles ?? null,
      })) as NetworkPostWithAuthor[];
    },
    staleTime: 20_000,
    refetchInterval: 90_000,
  });
}

export function useNetworkActiveAuthors(excludeUserId: string | null, limit = 10) {
  return useQuery({
    queryKey: ["network", "activeAuthors", excludeUserId, limit],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from("network_posts")
        .select("author_id, created_at, profiles(id, full_name, avatar_url, bio)")
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;

      const seen = new Set<string>();
      if (excludeUserId) seen.add(excludeUserId);
      const authors: NetworkAuthorPreview[] = [];

      for (const row of posts ?? []) {
        const aid = String(row.author_id);
        if (seen.has(aid)) continue;
        const p = (row as { profiles?: unknown }).profiles as {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
        } | null;
        if (!p) continue;
        seen.add(aid);
        authors.push({
          id: p.id,
          full_name: p.full_name ?? "User",
          avatar_url: p.avatar_url,
          bio: p.bio,
          lastActiveAt: String(row.created_at),
        });
        if (authors.length >= limit) break;
      }

      if (authors.length < Math.min(4, limit)) {
        let q = supabase
          .from("profiles")
          .select("id, full_name, avatar_url, bio, created_at")
          .order("created_at", { ascending: false })
          .limit(limit * 2);
        if (excludeUserId) q = q.neq("id", excludeUserId);
        const { data: more, error: err2 } = await q;
        if (err2) throw err2;
        for (const p of more ?? []) {
          if (seen.has(p.id)) continue;
          seen.add(p.id);
          authors.push({
            id: p.id,
            full_name: p.full_name,
            avatar_url: p.avatar_url,
            bio: p.bio,
            lastActiveAt: p.created_at ?? new Date().toISOString(),
          });
          if (authors.length >= limit) break;
        }
      }

      return authors.slice(0, limit);
    },
    staleTime: 25_000,
    refetchInterval: 120_000,
  });
}

export function useNetworkRecentHighlights(limit = 4) {
  return useQuery({
    queryKey: ["network", "highlights", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("network_posts")
        .select("id, type, title, content, created_at, image_urls, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map((row): NetworkHighlightPost => {
        const content = String(row.content ?? "").trim();
        const excerpt =
          content.length > 80 ? `${content.slice(0, 80)}…` : content;
        const prof = (row as { profiles?: unknown }).profiles as { full_name: string | null } | null;
        return {
          id: String(row.id),
          type: row.type as NetworkHighlightPost["type"],
          title: row.title ? String(row.title) : null,
          excerpt,
          image_urls: normalizeImageUrls(
            (row as Record<string, unknown>).image_urls
          ),
          created_at: String(row.created_at),
          authorName: prof?.full_name ?? null,
        };
      });
    },
    staleTime: 25_000,
    refetchInterval: 120_000,
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
    mutationFn: async (input: {
      title?: string;
      content: string;
      type: "post" | "blog" | "deal";
      deal_details?: Record<string, unknown>;
      image_urls?: string[];
    }) => {
      if (!userId) throw new Error("Sign in to post");
      const { data, error } = await supabase
        .from("network_posts")
        .insert({
          author_id: userId,
          title: input.title || null,
          content: input.content,
          type: input.type,
          deal_details: (input.deal_details ?? {}) as Json,
          image_urls: (input.image_urls ?? []) as Json,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["network", "feed"] });
      qc.invalidateQueries({ queryKey: ["network", "feedPreview"] });
      qc.invalidateQueries({ queryKey: ["network", "highlights"] });
    },
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

export function useEditNetworkPost(postId: string | null, userId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string | null; content: string }) => {
      if (!postId || !userId) throw new Error("Missing post or user");
      const { error } = await supabase
        .from("network_posts")
        .update({
          title: input.title,
          content: input.content,
        })
        .eq("id", postId)
        // Extra guard; RLS already enforces this, but it keeps intent explicit.
        .eq("author_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["network", "post", postId] });
      qc.invalidateQueries({ queryKey: ["network", "feed"] });
      qc.invalidateQueries({ queryKey: ["network", "feedPreview"] });
      qc.invalidateQueries({ queryKey: ["network", "highlights"] });
    },
  });
}

function normalizeProfileFollowsRow(r: any) {
  return {
    follower_id: String(r.follower_id),
    following_id: String(r.following_id),
  };
}

/**
 * `profile_follows` is introduced by a networking follow/friend migration.
 * It's not part of generated Supabase typings yet, so we cast to `any`.
 */
export function useProfileFollowStatus(viewerId: string | null, profileId: string | null) {
  const supabaseAny = supabase as any;
  return useQuery({
    queryKey: ["network", "profileFollowStatus", viewerId, profileId],
    queryFn: async () => {
      if (!viewerId || !profileId || viewerId === profileId) {
        return { isFollowing: false, isFollower: false, isFriend: false };
      }

      const { data: followingRow, error: err1 } = await supabaseAny
        .from("profile_follows")
        .select("follower_id,following_id")
        .eq("follower_id", viewerId)
        .eq("following_id", profileId)
        .maybeSingle();
      if (err1) throw err1;

      const { data: followerRow, error: err2 } = await supabaseAny
        .from("profile_follows")
        .select("follower_id,following_id")
        .eq("follower_id", profileId)
        .eq("following_id", viewerId)
        .maybeSingle();
      if (err2) throw err2;

      const isFollowing = !!followingRow;
      const isFollower = !!followerRow;
      return {
        isFollowing,
        isFollower,
        isFriend: isFollowing && isFollower,
      };
    },
    enabled: !!viewerId && !!profileId && viewerId !== profileId,
  });
}

export function useFollowProfile(profileId: string | null, viewerId: string | null) {
  const supabaseAny = supabase as any;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!profileId || !viewerId) throw new Error("Missing profile or viewer");
      const { error } = await supabaseAny.from("profile_follows").upsert(
        { follower_id: viewerId, following_id: profileId },
        { onConflict: "follower_id,following_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["network", "profileFollowStatus", viewerId, profileId] });
    },
  });
}

export function useUnfollowProfile(profileId: string | null, viewerId: string | null) {
  const supabaseAny = supabase as any;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!profileId || !viewerId) throw new Error("Missing profile or viewer");
      const { error } = await supabaseAny
        .from("profile_follows")
        .delete()
        .eq("follower_id", viewerId)
        .eq("following_id", profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["network", "profileFollowStatus", viewerId, profileId] });
    },
  });
}

export interface SavedProfileFolder {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface SavedFolderProfile {
  id: string;
  folder_id: string;
  profile_id: string;
  created_at: string;
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  } | null;
}

const SAVED_PROFILE_FOLDERS_KEY = ["network", "savedProfileFolders"] as const;
const SAVED_FOLDER_PROFILES_KEY = ["network", "savedFolderProfiles"] as const;

/**
 * Folder tables are added via SQL migration and may not exist in generated typings yet.
 */
const supabaseAny = supabase as any;

export function useSavedProfileFolders(userId: string | null) {
  return useQuery({
    queryKey: [...SAVED_PROFILE_FOLDERS_KEY, userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabaseAny
        .from("saved_profile_folders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as SavedProfileFolder[];
    },
    enabled: !!userId,
  });
}

export function useSavedFolderProfiles(userId: string | null) {
  return useQuery({
    queryKey: [...SAVED_FOLDER_PROFILES_KEY, userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabaseAny
        .from("saved_folder_profiles")
        .select("id,folder_id,profile_id,created_at,profile:profiles(id,full_name,avatar_url,bio)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SavedFolderProfile[];
    },
    enabled: !!userId,
  });
}

export function useCreateSavedProfileFolder(userId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!userId) throw new Error("Sign in to create folders");
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Folder name is required");
      const { error } = await supabaseAny.from("saved_profile_folders").insert({
        user_id: userId,
        name: trimmed,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SAVED_PROFILE_FOLDERS_KEY });
    },
  });
}

export function useRenameSavedProfileFolder(userId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { folderId: string; name: string }) => {
      if (!userId) throw new Error("Sign in to rename folders");
      const trimmed = input.name.trim();
      if (!trimmed) throw new Error("Folder name is required");
      const { error } = await supabaseAny
        .from("saved_profile_folders")
        .update({ name: trimmed })
        .eq("id", input.folderId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SAVED_PROFILE_FOLDERS_KEY });
    },
  });
}

export function useSaveProfileToFolder(userId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { profileId: string; folderId: string }) => {
      if (!userId) throw new Error("Sign in to save profiles");
      const { error } = await supabaseAny.from("saved_folder_profiles").upsert(
        {
          user_id: userId,
          folder_id: input.folderId,
          profile_id: input.profileId,
        },
        { onConflict: "user_id,folder_id,profile_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SAVED_FOLDER_PROFILES_KEY });
    },
  });
}

export function useRemoveProfileFromFolder(userId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (savedEntryId: string) => {
      if (!userId) throw new Error("Sign in to manage saved profiles");
      const { error } = await supabaseAny
        .from("saved_folder_profiles")
        .delete()
        .eq("id", savedEntryId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SAVED_FOLDER_PROFILES_KEY });
    },
  });
}
