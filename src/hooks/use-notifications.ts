"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { UserNotification } from "@/lib/notification-types";

/**
 * `user_notifications` and `notification_preferences` are not in generated
 * `Database` typings; the typed client triggers excessive TS instantiation on `.from(...)`.
 */
const supabaseNotifications = supabase as any;

const NOTIFICATIONS_QUERY_KEY = ["user-notifications"] as const;
const PREFERENCES_QUERY_KEY = ["notification-preferences"] as const;

function notificationFromRow(row: Record<string, unknown>): UserNotification {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    type: row.type as UserNotification["type"],
    title: String(row.title),
    message: row.message != null ? String(row.message) : null,
    link_url: row.link_url != null ? String(row.link_url) : null,
    entity_type: row.entity_type != null ? String(row.entity_type) : null,
    entity_id: row.entity_id != null ? String(row.entity_id) : null,
    read_at: row.read_at != null ? String(row.read_at) : null,
    created_at: String(row.created_at),
  };
}

export function useUserNotifications(userId: string | null, limit = 50) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, userId, limit],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabaseNotifications
        .from("user_notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map((r) =>
        notificationFromRow(r as Record<string, unknown>)
      );
    },
    enabled: !!userId,
  });
}

export function useUnreadNotificationCount(userId: string | null) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, userId, "unread-count"],
    queryFn: async () => {
      if (!userId) return 0;
      const { count, error } = await supabaseNotifications
        .from("user_notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .is("read_at", null);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!userId,
  });
}

export function useMarkNotificationRead(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!userId) throw new Error("Not authenticated");
      const { error } = await supabaseNotifications
        .from("user_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}

export function useMarkAllNotificationsRead(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not authenticated");
      const { error } = await supabaseNotifications
        .from("user_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", userId)
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}

export function useNotificationPreferences(userId: string | null) {
  return useQuery({
    queryKey: [...PREFERENCES_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabaseNotifications
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data as {
        user_id: string;
        email_enabled: boolean;
        push_enabled: boolean;
        sms_enabled: boolean;
        frequency: string;
        referral_alerts: boolean;
        offer_alerts: boolean;
        payment_alerts: boolean;
        crowdfunding_alerts: boolean;
        created_at: string;
        updated_at: string;
      } | null;
    },
    enabled: !!userId,
  });
}

export function useUpsertNotificationPreferences(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: {
      email_enabled?: boolean;
      push_enabled?: boolean;
      sms_enabled?: boolean;
      frequency?: "realtime" | "daily" | "weekly" | "off";
      referral_alerts?: boolean;
      offer_alerts?: boolean;
      payment_alerts?: boolean;
      crowdfunding_alerts?: boolean;
    }) => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabaseNotifications
        .from("notification_preferences")
        .upsert(
          { user_id: userId, ...prefs, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PREFERENCES_QUERY_KEY });
    },
  });
}
