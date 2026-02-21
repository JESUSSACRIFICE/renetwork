"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const chatOffersKeys = {
  all: ["offers"] as const,
  thread: (userId: string | null, otherId: string | null) =>
    [...chatOffersKeys.all, "thread", userId, otherId] as const,
  allForUser: (userId: string | null) =>
    [...chatOffersKeys.all, "all", userId] as const,
};

export type ChatOffer = {
  id: string;
  sender_id: string;
  recipient_id: string;
  title: string;
  description: string | null;
  amount_cents: number;
  status: "pending" | "accepted" | "declined" | "withdrawn" | "completion_requested" | "completed";
  accepted_at: string | null;
  delivery_started_at: string | null;
  delivery_days: number | null;
  completion_requested_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

async function fetchOffersForThread(
  userId: string,
  otherId: string
): Promise<ChatOffer[]> {
  // Fetch offers in either direction: (me -> other) or (other -> me)
  const { data: sent, error: err1 } = await supabase
    .from("offers")
    .select("*")
    .eq("sender_id", userId)
    .eq("recipient_id", otherId)
    .order("created_at", { ascending: true });

  if (err1) throw err1;

  const { data: received, error: err2 } = await supabase
    .from("offers")
    .select("*")
    .eq("sender_id", otherId)
    .eq("recipient_id", userId)
    .order("created_at", { ascending: true });

  if (err2) throw err2;

  const combined = [...(sent ?? []), ...(received ?? [])].sort(
    (a, b) =>
      new Date(a.created_at ?? 0).getTime() -
      new Date(b.created_at ?? 0).getTime()
  );
  return combined as ChatOffer[];
}

export type OfferThread = {
  otherId: string;
  lastOffer: ChatOffer;
  isRecipient: boolean; // true if we received the offer (pending = actionable)
};

async function fetchAllOffersForUser(userId: string): Promise<OfferThread[]> {
  const { data: sent, error: err1 } = await supabase
    .from("offers")
    .select("*")
    .eq("sender_id", userId)
    .order("created_at", { ascending: false });

  if (err1) throw err1;

  const { data: received, error: err2 } = await supabase
    .from("offers")
    .select("*")
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false });

  if (err2) throw err2;

  const byOther = new Map<string, OfferThread>();
  for (const o of sent ?? []) {
    const otherId = o.recipient_id;
    const existing = byOther.get(otherId);
    const oTime = new Date(o.created_at ?? 0).getTime();
    if (!existing || new Date(existing.lastOffer.created_at ?? 0).getTime() < oTime) {
      byOther.set(otherId, { otherId, lastOffer: o, isRecipient: false });
    }
  }
  for (const o of received ?? []) {
    const otherId = o.sender_id;
    const existing = byOther.get(otherId);
    const oTime = new Date(o.created_at ?? 0).getTime();
    if (!existing || new Date(existing.lastOffer.created_at ?? 0).getTime() < oTime) {
      byOther.set(otherId, { otherId, lastOffer: o, isRecipient: true });
    }
  }
  return Array.from(byOther.values()).sort(
    (a, b) =>
      new Date(b.lastOffer.created_at ?? 0).getTime() -
      new Date(a.lastOffer.created_at ?? 0).getTime()
  );
}

/**
 * Fetch all offer threads for user (for sidebar - conversations with offers but no messages).
 */
export function useAllOfferThreads(userId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: chatOffersKeys.allForUser(userId),
    queryFn: () => fetchAllOffersForUser(userId!),
    enabled: !!userId,
    staleTime: 1000 * 15,
  });

  useEffect(() => {
    if (!userId) return;
    const invalidate = () =>
      queryClient.invalidateQueries({
        queryKey: chatOffersKeys.allForUser(userId),
      });
    const channel = supabase
      .channel(`offers:all:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "offers",
          filter: `sender_id=eq.${userId}`,
        },
        invalidate
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "offers",
          filter: `recipient_id=eq.${userId}`,
        },
        invalidate
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return {
    offerThreads: query.data ?? [],
    isLoading: query.isLoading,
  };
}

export type OfferWithParty = ChatOffer & {
  otherParty: { id: string; full_name: string | null; avatar_url: string | null };
  isSender: boolean;
};

async function fetchAllOffers(userId: string): Promise<OfferWithParty[]> {
  const { data: sent, error: err1 } = await supabase
    .from("offers")
    .select("*")
    .eq("sender_id", userId)
    .order("created_at", { ascending: false });

  if (err1) throw err1;

  const { data: received, error: err2 } = await supabase
    .from("offers")
    .select("*")
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false });

  if (err2) throw err2;

  const allOffers = [
    ...(sent ?? []).map((o) => ({ ...o, otherId: o.recipient_id, isSender: true })),
    ...(received ?? []).map((o) => ({ ...o, otherId: o.sender_id, isSender: false })),
  ].sort(
    (a, b) =>
      new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  );

  const otherIds = [...new Set(allOffers.map((o) => o.otherId))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", otherIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, { id: p.id, full_name: p.full_name, avatar_url: p.avatar_url }])
  );

  return allOffers.map((o) => {
    const { otherId, isSender, ...offer } = o;
    return {
      ...offer,
      otherParty: profileMap.get(otherId) ?? {
        id: otherId,
        full_name: null,
        avatar_url: null,
      },
      isSender,
    };
  }) as OfferWithParty[];
}

/**
 * Fetch all offers for user (for offers page).
 */
export function useAllOffers(userId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...chatOffersKeys.allForUser(userId), "list"],
    queryFn: () => fetchAllOffers(userId!),
    enabled: !!userId,
    staleTime: 1000 * 15,
  });

  useEffect(() => {
    if (!userId) return;
    const invalidate = () =>
      queryClient.invalidateQueries({
        queryKey: chatOffersKeys.allForUser(userId),
      });
    const channel = supabase
      .channel(`offers:list:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "offers",
          filter: `sender_id=eq.${userId}`,
        },
        invalidate
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "offers",
          filter: `recipient_id=eq.${userId}`,
        },
        invalidate
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return {
    offers: query.data ?? [],
    isLoading: query.isLoading,
  };
}

/**
 * Fetch chat offers for a conversation thread.
 * Works for both provider→client and client→provider direction.
 */
export function useChatOffers(userId: string | null, otherId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: chatOffersKeys.thread(userId, otherId),
    queryFn: () => fetchOffersForThread(userId!, otherId!),
    enabled: !!userId && !!otherId,
    staleTime: 1000 * 15,
  });

  // Real-time: subscribe to changes where we're sender or recipient
  useEffect(() => {
    if (!userId || !otherId) return;

    const invalidate = () =>
      queryClient.invalidateQueries({
        queryKey: chatOffersKeys.thread(userId, otherId),
      });

    const channel = supabase
      .channel(`offers:${userId}:${otherId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "offers",
          filter: `sender_id=eq.${userId}`,
        },
        invalidate
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "offers",
          filter: `recipient_id=eq.${userId}`,
        },
        invalidate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, otherId, queryClient]);

  const sendMutation = useMutation({
    mutationFn: async (params: {
      recipientId: string;
      title: string;
      description?: string;
      amountCents: number;
      deliveryDays?: number;
    }) => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("offers")
        .insert({
          sender_id: userId,
          recipient_id: params.recipientId,
          title: params.title,
          description: params.description ?? null,
          amount_cents: params.amountCents,
          delivery_days: params.deliveryDays ?? null,
          status: "pending",
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as ChatOffer;
    },
    onSuccess: () => {
      if (userId && otherId) {
        queryClient.invalidateQueries({
          queryKey: chatOffersKeys.thread(userId, otherId),
        });
        queryClient.invalidateQueries({
          queryKey: chatOffersKeys.allForUser(userId),
        });
      }
    },
    onError: (err: Error) => {
      const msg = err?.message ?? "Failed to send offer";
      toast.error(
        msg.includes("active offer") || msg.includes("pending offer") ? msg : "Failed to send offer"
      );
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({
      offerId,
      status,
    }: {
      offerId: string;
      status: "accepted" | "declined";
    }) => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("offers")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", offerId)
        .eq("recipient_id", userId)
        .select("*")
        .single();
      if (error) throw error;
      return data as ChatOffer;
    },
    onSuccess: () => {
      if (userId && otherId) {
        queryClient.invalidateQueries({
          queryKey: chatOffersKeys.thread(userId, otherId),
        });
        queryClient.invalidateQueries({
          queryKey: chatOffersKeys.allForUser(userId),
        });
      }
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to respond to offer");
    },
  });

  const markCompleteMutation = useMutation({
    mutationFn: async (offerId: string) => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("offers")
        .update({
          status: "completion_requested",
          completion_requested_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", offerId)
        .eq("sender_id", userId)
        .eq("status", "accepted")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Offer not found or already marked complete");
      return data as ChatOffer;
    },
    onSuccess: () => {
      toast.success("Completion requested. Waiting for customer approval.");
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: chatOffersKeys.allForUser(userId),
        });
        if (otherId) {
          queryClient.invalidateQueries({
            queryKey: chatOffersKeys.thread(userId, otherId),
          });
        }
      }
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to mark complete");
    },
  });

  const respondToCompletionMutation = useMutation({
    mutationFn: async ({
      offerId,
      accept,
    }: {
      offerId: string;
      accept: boolean;
    }) => {
      if (!userId) throw new Error("Not authenticated");
      const newStatus = accept ? "completed" : "accepted";
      const { data, error } = await supabase
        .from("offers")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", offerId)
        .eq("recipient_id", userId)
        .eq("status", "completion_requested")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Offer not found or completion already responded");
      return data as ChatOffer;
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.accept ? "Offer marked as completed." : "Completion rejected. Provider can try again."
      );
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: chatOffersKeys.allForUser(userId),
        });
        if (otherId) {
          queryClient.invalidateQueries({
            queryKey: chatOffersKeys.thread(userId, otherId),
          });
        }
      }
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to respond");
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (offerId: string) => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("offers")
        .update({ status: "withdrawn", updated_at: new Date().toISOString() })
        .eq("id", offerId)
        .eq("sender_id", userId)
        .eq("status", "pending")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Offer not found or already withdrawn");
      return data as ChatOffer;
    },
    onSuccess: () => {
      toast.success("Offer withdrawn");
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: chatOffersKeys.allForUser(userId),
        });
        if (otherId) {
          queryClient.invalidateQueries({
            queryKey: chatOffersKeys.thread(userId, otherId),
          });
        }
      }
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to withdraw offer");
    },
  });

  return {
    offers: query.data ?? [],
    isLoading: query.isLoading,
    sendOffer: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
    respondToOffer: respondMutation.mutateAsync,
    isResponding: respondMutation.isPending,
    withdrawOffer: withdrawMutation.mutateAsync,
    isWithdrawing: withdrawMutation.isPending,
    markComplete: markCompleteMutation.mutateAsync,
    isMarkingComplete: markCompleteMutation.isPending,
    respondToCompletion: respondToCompletionMutation.mutateAsync,
    isRespondingToCompletion: respondToCompletionMutation.isPending,
  };
}
