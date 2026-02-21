"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export const AUTH_USER_QUERY_KEY = ["auth", "user"] as const;

async function fetchUser(): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

/**
 * TanStack Query hook that fetches and caches the currently logged-in Supabase user.
 * Invalidates automatically on auth state changes (sign in, sign out, token refresh).
 */
export function useAuth() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: AUTH_USER_QUERY_KEY,
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event) => {
      queryClient.invalidateQueries({ queryKey: AUTH_USER_QUERY_KEY });
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  return {
    user: query.data ?? null,
    error: query.error,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
}
