"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NOTIFICATION_SOUND_VOLUME = 0.15;

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(NOTIFICATION_SOUND_VOLUME, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Ignore if audio fails (e.g. autoplay policy)
  }
}

export const messagesKeys = {
  all: ["messages"] as const,
  list: (userId: string | null) => [...messagesKeys.all, "list", userId] as const,
  unreadCount: (userId: string | null) =>
    [...messagesKeys.all, "unreadCount", userId] as const,
};

export type ParticipantInfo = {
  full_name: string | null;
  avatar_url?: string | null;
};

export type MessageWithParticipants = {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  subject: string | null;
  read: boolean;
  created_at: string;
  sender: ParticipantInfo | null;
  recipient: ParticipantInfo | null;
};

async function fetchMessages(userId: string): Promise<MessageWithParticipants[]> {
  const { data: rows, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  const messages = (rows ?? []) as Omit<MessageWithParticipants, "sender" | "recipient">[];

  if (messages.length === 0) return [];

  const participantIds = [
    ...new Set([
      ...messages.map((m) => m.sender_id),
      ...messages.map((m) => m.recipient_id),
    ]),
  ];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", participantIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [
      p.id,
      { full_name: p.full_name, avatar_url: p.avatar_url },
    ])
  );

  return messages.map((m) => ({
    ...m,
    sender: profileMap.get(m.sender_id) ?? null,
    recipient: profileMap.get(m.recipient_id) ?? null,
  })) as MessageWithParticipants[];
}

/**
 * TanStack Query hook for messages with real-time subscription.
 * Subscribes to new messages where the current user is the recipient.
 */
export function useMessages(userId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: messagesKeys.list(userId),
    queryFn: () => fetchMessages(userId!),
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Real-time: subscribe to new messages where we are the recipient
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`messages:recipient:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${userId}`,
        },
        () => {
          playNotificationSound();
          queryClient.invalidateQueries({ queryKey: messagesKeys.list(userId) });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  const sendMutation = useMutation({
    mutationFn: async ({
      recipientId,
      content,
      subject,
    }: {
      recipientId: string;
      content: string;
      subject?: string;
    }) => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: userId,
          recipient_id: recipientId,
          content,
          subject: subject ?? null,
          read: false,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagesKeys.list(userId) });
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to send message");
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (messageIds: string[]) => {
      if (messageIds.length === 0) return;
      const { error } = await supabase
        .from("messages")
        .update({ read: true })
        .in("id", messageIds)
        .eq("recipient_id", userId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagesKeys.list(userId) });
      queryClient.invalidateQueries({
        queryKey: messagesKeys.unreadCount(userId),
      });
    },
  });

  const messages = query.data ?? [];
  const unreadCount = messages.filter(
    (m) => m.recipient_id === userId && !m.read
  ).length;

  return {
    messages,
    unreadCount,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    sendMessage: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
    markAsRead: markReadMutation.mutate,
  };
}

/**
 * Lightweight hook for unread message count (navbar badge).
 * Uses a separate count query to avoid fetching full messages.
 */
export function useUnreadCount(userId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: messagesKeys.unreadCount(userId),
    queryFn: async () => {
      const { count, error } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", userId!)
        .eq("read", false);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`messages:unread:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: messagesKeys.unreadCount(userId),
          });
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [userId, queryClient]);

  return { unreadCount: query.data ?? 0, isLoading: query.isLoading };
}
