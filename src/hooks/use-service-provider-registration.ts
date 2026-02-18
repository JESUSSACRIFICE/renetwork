"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Query keys for service-provider registration data (use for invalidation after save). */
export const registrationKeys = {
  identityDocuments: (userId: string | null) =>
    ["identity_documents", userId] as const,
  licensesCredentials: (userId: string | null) =>
    ["licenses_credentials", userId] as const,
  businessInfo: (userId: string | null) => ["business_info", userId] as const,
  bondsInsurance: (userId: string | null) =>
    ["bonds_insurance", userId] as const,
  preferenceRankings: (userId: string | null) =>
    ["preference_rankings", userId] as const,
  eSignatures: (userId: string | null) =>
    ["e_signatures", userId] as const,
};

export interface IdentityDocRow {
  country: string;
  state: string | null;
  number: string;
  file_url: string;
}

export interface LicenseDocRow {
  country: string;
  state: string | null;
  number: string;
  active_since: string | null;
  renewal_date: string | null;
  expiration_date: string | null;
  file_url: string;
}

export interface BusinessInfoRow {
  company_name: string | null;
  years_of_experience: number | null;
  business_address: string | null;
  business_hours: string | null;
  best_times_to_reach: string | null;
  number_of_employees: number | null;
}

export interface BondsInsuranceRow {
  file_url: string;
}

export interface PreferenceRankingRow {
  category: string;
  ranking: number;
}

export interface ESignatureRow {
  document_type: string;
  signature_data: string;
  name_printed: string;
  name_signed: string;
  signed_at: string;
}

async function fetchESignatures(userId: string | null): Promise<ESignatureRow[]> {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("e_signatures")
    .select("document_type, signature_data, name_printed, name_signed, signed_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ESignatureRow[];
}

async function fetchIdentityDocuments(userId: string | null): Promise<IdentityDocRow[]> {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("identity_documents")
    .select("country, state, number, file_url")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as IdentityDocRow[];
}

async function fetchLicenseDocs(userId: string | null): Promise<LicenseDocRow[]> {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("licenses_credentials")
    .select("country, state, number, active_since, renewal_date, expiration_date, file_url")
    .eq("user_id", userId)
    .eq("document_type", "license")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as LicenseDocRow[];
}

async function fetchBusinessInfo(userId: string | null): Promise<BusinessInfoRow | null> {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("business_info")
    .select("company_name, years_of_experience, business_address, business_hours, best_times_to_reach, number_of_employees")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as BusinessInfoRow | null;
}

async function fetchBondsInsurance(userId: string | null): Promise<BondsInsuranceRow[]> {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("bonds_insurance")
    .select("file_url")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as BondsInsuranceRow[];
}

async function fetchPreferenceRankings(userId: string | null): Promise<PreferenceRankingRow[]> {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("preference_rankings")
    .select("category, ranking")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as PreferenceRankingRow[];
}

export function useIdentityDocuments(userId: string | null) {
  return useQuery({
    queryKey: registrationKeys.identityDocuments(userId),
    queryFn: () => fetchIdentityDocuments(userId),
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}

export function useLicenseDocs(userId: string | null) {
  return useQuery({
    queryKey: registrationKeys.licensesCredentials(userId),
    queryFn: () => fetchLicenseDocs(userId),
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}

export function useBusinessInfo(userId: string | null) {
  return useQuery({
    queryKey: registrationKeys.businessInfo(userId),
    queryFn: () => fetchBusinessInfo(userId),
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}

export function useBondsInsuranceDocs(userId: string | null) {
  return useQuery({
    queryKey: registrationKeys.bondsInsurance(userId),
    queryFn: () => fetchBondsInsurance(userId),
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}

export function usePreferenceRankings(userId: string | null) {
  return useQuery({
    queryKey: registrationKeys.preferenceRankings(userId),
    queryFn: () => fetchPreferenceRankings(userId),
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}

export function useESignatures(userId: string | null) {
  return useQuery({
    queryKey: registrationKeys.eSignatures(userId),
    queryFn: () => fetchESignatures(userId),
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}
