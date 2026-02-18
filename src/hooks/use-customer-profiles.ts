"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const customerProfileKeys = {
  all: ["profiles", "customer"] as const,
  details: () => [...customerProfileKeys.all, "detail"] as const,
  detail: (id: string | null) => [...customerProfileKeys.details(), id] as const,
};

export interface CustomerProfile {
  id: string;
  full_name: string;
  email: string | null;
  user_type: "customer" | null;
  avatar_url: string | null;
  phone: string | null;
  mailing_address: string | null;
  created_at: string | null;
  updated_at: string | null;
}

async function fetchCustomerProfile(
  id: string | null
): Promise<CustomerProfile | null> {
  if (!id) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, user_type, avatar_url, phone, mailing_address, created_at, updated_at")
    .eq("id", id)
    .eq("user_type", "customer")
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as CustomerProfile;
}

/**
 * Fetch a customer profile by id. Only returns data when user_type is 'customer'.
 */
export function useCustomerProfile(id: string | null) {
  return useQuery({
    queryKey: customerProfileKeys.detail(id),
    queryFn: () => fetchCustomerProfile(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export interface CustomerProfileUpdatePayload {
  userId: string;
  full_name: string;
  email?: string;
  phone?: string;
  mailing_address?: string;
}

async function updateCustomerProfileMutation(
  payload: CustomerProfileUpdatePayload
): Promise<void> {
  const { userId, full_name, email, phone, mailing_address } = payload;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name,
      email: email ?? null,
      phone: phone ?? null,
      mailing_address: mailing_address ?? null,
    })
    .eq("id", userId)
    .eq("user_type", "customer");

  if (error) throw error;
}

/**
 * Update customer profile (basic info). Invalidates customer profile query on success.
 */
export function useCustomerProfileUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCustomerProfileMutation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customerProfileKeys.detail(variables.userId),
      });
      toast.success("Profile updated successfully!");
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Failed to update profile");
    },
  });
}
