"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const db = supabase as any;

export interface ServicePackageRow {
  id: string;
  service_id: string;
  title: string;
  description: string | null;
  price: number;
  delivery_days: number;
  sort_order: number;
  created_at: string;
}

export interface ServicePackageInsert {
  service_id: string;
  title: string;
  description?: string | null;
  price: number;
  delivery_days: number;
  sort_order?: number;
}

export interface ServicePackageUpdate {
  id: string;
  title?: string;
  description?: string | null;
  price?: number;
  delivery_days?: number;
  sort_order?: number;
}

const packagesKeys = {
  all: ["service_packages"] as const,
  byService: (serviceId: string | null) =>
    [...packagesKeys.all, serviceId] as const,
};

async function fetchPackagesByService(
  serviceId: string | null
): Promise<ServicePackageRow[]> {
  if (!serviceId) return [];
  const { data, error } = await db
    .from("service_packages")
    .select("id, service_id, title, description, price, delivery_days, sort_order, created_at")
    .eq("service_id", serviceId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ServicePackageRow[];
}

export function useServicePackages(serviceId: string | null) {
  return useQuery({
    queryKey: packagesKeys.byService(serviceId),
    queryFn: () => fetchPackagesByService(serviceId),
    enabled: !!serviceId,
  });
}

async function createPackageRow(
  payload: ServicePackageInsert
): Promise<ServicePackageRow> {
  const { data, error } = await db
    .from("service_packages")
    .insert({
      service_id: payload.service_id,
      title: payload.title,
      description: payload.description ?? null,
      price: payload.price,
      delivery_days: payload.delivery_days,
      sort_order: payload.sort_order ?? 0,
    })
    .select("id, service_id, title, description, price, delivery_days, sort_order, created_at")
    .single();
  if (error) throw error;
  return data as ServicePackageRow;
}

async function updatePackageRow(
  payload: ServicePackageUpdate
): Promise<ServicePackageRow> {
  const { id, ...rest } = payload;
  const updates: Record<string, unknown> = {};
  if (rest.title !== undefined) updates.title = rest.title;
  if (rest.description !== undefined) updates.description = rest.description;
  if (rest.price !== undefined) updates.price = rest.price;
  if (rest.delivery_days !== undefined) updates.delivery_days = rest.delivery_days;
  if (rest.sort_order !== undefined) updates.sort_order = rest.sort_order;
  const { data, error } = await db
    .from("service_packages")
    .update(updates)
    .eq("id", id)
    .select("id, service_id, title, description, price, delivery_days, sort_order, created_at")
    .single();
  if (error) throw error;
  return data as ServicePackageRow;
}

async function deletePackageRow(id: string): Promise<void> {
  const { error } = await db.from("service_packages").delete().eq("id", id);
  if (error) throw error;
}

export function useCreateServicePackage(serviceId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<ServicePackageInsert, "service_id">) =>
      createPackageRow({ ...payload, service_id: serviceId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packagesKeys.byService(serviceId) });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Package added");
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to add package");
    },
  });
}

export function useUpdateServicePackage(serviceId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePackageRow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packagesKeys.byService(serviceId) });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Package updated");
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to update package");
    },
  });
}

export function useDeleteServicePackage(serviceId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePackageRow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packagesKeys.byService(serviceId) });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Package deleted");
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to delete package");
    },
  });
}
