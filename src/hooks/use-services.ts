"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Use typed client for tables in schema; use db for psp_types, service_psp_types (not in generated types)
const db = supabase as any;

const ADDRESS_MAP: Record<string, string> = {
  "10001": "350 5th Ave, New York, NY 10001, USA",
  "90001": "123 Main St, Los Angeles, CA 90001, USA",
  "90210": "456 Rodeo Dr, Beverly Hills, CA 90210, USA",
  "94102": "789 Market St, San Francisco, CA 94102, USA",
  "60601": "321 State St, Chicago, IL 60601, USA",
  "33139": "654 Ocean Dr, Miami Beach, FL 33139, USA",
};

export const servicesKeys = {
  all: ["services"] as const,
  lists: () => [...servicesKeys.all, "list"] as const,
  list: (options?: ServicesListOptions) =>
    [...servicesKeys.lists(), options ?? {}] as const,
  myServices: (providerId: string | null) =>
    [...servicesKeys.all, "my", providerId] as const,
  myService: (providerId: string | null, serviceId: string | null) =>
    [...servicesKeys.all, "my", providerId, serviceId] as const,
  details: () => [...servicesKeys.all, "detail"] as const,
  detail: (id: string | null) => [...servicesKeys.details(), id] as const,
};

/** Row shape from public.services for provider's own list / forms */
export interface ServiceRow {
  id: string;
  provider_id: string;
  title: string;
  category: string;
  description: string | null;
  price: number;
  image_url: string | null;
  delivery_days: number | null;
  service_fields?: string[] | null;
  created_at: string;
  updated_at: string;
}

/** Payload to create a service (provider_id set by caller) */
export interface ServiceInsert {
  provider_id: string;
  title: string;
  category: string;
  description?: string | null;
  price?: number;
  image_url?: string | null;
  delivery_days?: number | null;
  service_fields?: string[] | null;
}

/** Payload to update a service (id required; provider_id immutable) */
export interface ServiceUpdate {
  id: string;
  title?: string;
  category?: string;
  description?: string | null;
  price?: number;
  image_url?: string | null;
  delivery_days?: number | null;
  service_fields?: string[] | null;
}

/** Price tier ranges in dollars (min inclusive, max inclusive) */
const PRICE_TIERS: Record<string, { min: number; max: number }> = {
  Budget: { min: 0, max: 25 },
  Economic: { min: 25, max: 50 },
  Affordable: { min: 50, max: 100 },
  Mid: { min: 100, max: 500 },
  Premium: { min: 300, max: 99999 },
  Luxury: { min: 500, max: 99999 },
};

export interface ServicesListOptions {
  limit?: number;
  withAreas?: boolean;
  sortBy?: "default" | "rating" | "price-low" | "price-high";
  /** PSP labels to filter by (e.g. ["Accountant", "Agent"]) - matches service_psp_types */
  psp?: string[];
  /** Price tier labels (Luxury, Mid, etc.) - service price must fall in at least one */
  price?: string[];
  /** Property/field types (Commercial, Residential, etc.) - matches service_fields */
  fields?: string[];
  /** Filter by provider willing_to_train */
  willingToTrain?: boolean;
}

/** Preview shape for landing / cards (no service areas) */
export interface ServicePreview {
  id: string;
  title: string;
  category: string;
  description: string | null;
  price: number;
  provider_id: string;
  provider_name: string;
  provider_avatar?: string;
}

/** Full list item with location/areas for search page */
export interface ServiceListItem extends ServicePreview {
  rating: number;
  reviews: number;
  location?: string;
  full_address?: string;
  image_url?: string;
  serviceAreas?: Array<{
    zip_code: string;
    radius_miles: number;
    lat?: number;
    lng?: number;
  }>;
}

async function fetchServicesList(
  options: ServicesListOptions = {}
): Promise<ServiceListItem[]> {
  const {
    limit,
    withAreas = false,
    sortBy = "default",
    psp: pspLabels,
    price: priceLabels,
    fields: fieldLabels,
    willingToTrain,
  } = options;

  let serviceIdsFilter: string[] | null = null;
  if (pspLabels && pspLabels.length > 0) {
    const { data: pspRows } = await db
      .from("psp_types")
      .select("id")
      .in("label", pspLabels);
    const pspTypeIds = (pspRows ?? []).map((r: { id: string }) => r.id);
    if (pspTypeIds.length > 0) {
      const { data: junctionRows } = await db
        .from("service_psp_types")
        .select("service_id")
        .in("psp_type_id", pspTypeIds);
      serviceIdsFilter = [...new Set((junctionRows ?? []).map((r: { service_id: string }) => r.service_id))] as string[];
    }
    if (serviceIdsFilter && serviceIdsFilter.length === 0) {
      return [];
    }
  }

  let providerIdsFilter: string[] | null = null;
  if (willingToTrain === true) {
    const { data: profileRows } = await db
      .from("profiles")
      .select("id")
      .eq("willing_to_train", true);
    providerIdsFilter = (profileRows ?? []).map((r: { id: string }) => r.id) as string[];
    if (providerIdsFilter.length === 0) return [];
  }

  let query = supabase
    .from("services")
    .select(
      `
      id,
      provider_id,
      title,
      category,
      description,
      price,
      image_url,
      delivery_days,
      service_fields,
      profiles ( full_name, avatar_url )
    `
    )
    .order("created_at", { ascending: false });

  if (serviceIdsFilter && serviceIdsFilter.length > 0) {
    query = query.in("id", serviceIdsFilter);
  }
  if (providerIdsFilter && providerIdsFilter.length > 0) {
    query = query.in("provider_id", providerIdsFilter);
  }
  if (fieldLabels && fieldLabels.length > 0) {
    query = (query as any).overlaps("service_fields", fieldLabels);
  }
  if (limit != null && limit > 0) {
    query = query.limit(limit);
  }

  const { data: servicesData, error } = await query;
  if (error) throw error;

  const rows = servicesData ?? [];
  const providerIds = rows.map((r: any) => r.provider_id).filter(Boolean);
  const providerIdsUnique = [...new Set(providerIds)] as string[];
  let businessInfoMap = new Map<string, { company_name: string | null }>();
  if (providerIdsUnique.length > 0) {
    const { data: bizData } = await supabase
      .from("business_info")
      .select("user_id, company_name")
      .in("user_id", providerIdsUnique);
    (bizData ?? []).forEach((b: any) => businessInfoMap.set(b.user_id, { company_name: b.company_name }));
  }

  let serviceAreasMap = new Map<string, Array<{ zip_code: string; radius_miles: number; lat?: number; lng?: number }>>();
  if (withAreas && providerIds.length > 0) {
    const { data: serviceAreasData } = await supabase
      .from("service_areas")
      .select("user_id, zip_code, radius_miles")
      .in("user_id", providerIds);
    (serviceAreasData ?? []).forEach((sa: any) => {
      if (!serviceAreasMap.has(sa.user_id)) serviceAreasMap.set(sa.user_id, []);
      serviceAreasMap.get(sa.user_id)!.push({
        zip_code: sa.zip_code,
        radius_miles: sa.radius_miles,
        lat: sa.lat,
        lng: sa.lng,
      });
    });
  }

  let list: ServiceListItem[] = rows.map((row: any) => {
    const profile = row.profiles ? { ...row.profiles, company_name: businessInfoMap.get(row.provider_id)?.company_name ?? null } : null;
    const serviceAreas = serviceAreasMap.get(row.provider_id) ?? [];
    const zipCode = serviceAreas[0]?.zip_code;
    const full_address = zipCode ? ADDRESS_MAP[zipCode] ?? `${zipCode}, USA` : "";
    const location = full_address ? full_address.split(",").slice(0, 2).join(", ") : "Various";

    return {
      id: row.id,
      title: row.title,
      category: row.category,
      description: row.description ?? "Professional service offering",
      price: Number(row.price) ?? 0,
      provider_id: row.provider_id,
      provider_name: profile?.full_name ?? "Professional",
      provider_avatar: profile?.avatar_url,
      rating: 4.0 + Math.random() * 0.5,
      reviews: Math.floor(Math.random() * 20) + 1,
      location,
      full_address: full_address || undefined,
      image_url: row.image_url ?? undefined,
      serviceAreas: serviceAreas.map((sa: any) => ({
        zip_code: sa.zip_code,
        radius_miles: sa.radius_miles,
        lat: sa.lat,
        lng: sa.lng,
      })),
    };
  });

  if (priceLabels && priceLabels.length > 0) {
    list = list.filter((s) =>
      priceLabels.some((label) => {
        const tier = PRICE_TIERS[label];
        if (!tier) return false;
        return s.price >= tier.min && s.price <= tier.max;
      })
    );
  }

  if (sortBy === "rating") {
    list = [...list].sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "price-low") {
    list = [...list].sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    list = [...list].sort((a, b) => b.price - a.price);
  }

  return list;
}

/**
 * Fetch a list of services (preview or full with areas).
 * - Customer landing: useServicesList({ limit: 6 }) for preview.
 * - Search page: useServicesList({ withAreas: true, sortBy }) for full list with map.
 */
export function useServicesList(options: ServicesListOptions = {}) {
  return useQuery({
    queryKey: servicesKeys.list(options),
    queryFn: () => fetchServicesList(options),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

/** Detail page service shape (subset used by detail page) */
export interface ServiceDetailData {
  id: string;
  title: string;
  category: string;
  description: string;
  rating: number;
  reviews: number;
  price: number;
  provider_id: string;
  provider_name: string;
  provider_avatar?: string;
  provider_title?: string;
  location?: string;
  delivery_time?: string;
  english_level?: string;
  images?: string[];
  features?: string[];
  app_types?: string[];
  design_tools?: string[];
  devices?: string[];
  packages?: Array<{ title: string; description?: string | null; price: number; delivery_days: number }>;
  faqs?: Array<{ question: string; answer: string; isOpen: boolean }>;
  relatedServices?: ServiceDetailData[];
}

async function fetchServiceDetail(id: string | null): Promise<ServiceDetailData | null> {
  if (!id) return null;

  const { data: serviceRow, error: serviceError } = await supabase
    .from("services")
    .select(
      `
      id,
      provider_id,
      title,
      category,
      description,
      price,
      image_url,
      delivery_days,
      profiles ( full_name, avatar_url )
    `
    )
    .eq("id", id)
    .single();

  if (serviceError || !serviceRow) return null;

  const profile = (serviceRow as any).profiles;
  const providerId = serviceRow.provider_id;
  let companyName: string | null = null;
  const { data: bizRow } = await supabase
    .from("business_info")
    .select("company_name")
    .eq("user_id", providerId)
    .maybeSingle();
  if (bizRow) companyName = bizRow.company_name;

  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, reviewer_id")
    .eq("profile_id", providerId)
    .order("created_at", { ascending: false });

  const reviewerIds = (reviewsData ?? []).map((r: any) => r.reviewer_id).filter(Boolean);
  let reviewerNames: Record<string, string> = {};
  if (reviewerIds.length > 0) {
    const { data: reviewersData } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", reviewerIds);
    (reviewersData ?? []).forEach((r: any) => {
      reviewerNames[r.id] = r.full_name;
    });
  }
  const reviews = (reviewsData ?? []).map((r: any) => ({
    ...r,
    reviewer_name: reviewerNames[r.reviewer_id] ?? "Anonymous",
  }));
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
      : 0;

  const { data: serviceAreasData } = await supabase
    .from("service_areas")
    .select("zip_code, radius_miles")
    .eq("user_id", providerId);

  const { data: packagesData } = await (supabase as any)
    .from("service_packages")
    .select("title, description, price, delivery_days")
    .eq("service_id", id)
    .order("sort_order", { ascending: true });

  const packages =
    packagesData && packagesData.length > 0
      ? packagesData.map((p: any) => ({
          title: p.title,
          description: p.description ?? undefined,
          price: Number(p.price),
          delivery_days: p.delivery_days,
        }))
      : serviceRow.delivery_days
        ? [{ title: "Standard", price: Number(serviceRow.price), delivery_days: serviceRow.delivery_days }]
        : [{ title: "Standard", price: Number(serviceRow.price), delivery_days: 3 }];

  return {
    id: serviceRow.id,
    title: serviceRow.title,
    category: serviceRow.category,
    description: serviceRow.description ?? "",
    rating: parseFloat(avgRating.toFixed(1)) || 4.0,
    reviews: reviews.length,
    price: Number(serviceRow.price) ?? 0,
    provider_id: providerId,
    provider_name: profile?.full_name ?? "Professional",
    provider_avatar: profile?.avatar_url,
    provider_title: companyName ?? undefined,
    location: serviceAreasData?.[0]?.zip_code ? `${serviceAreasData[0].zip_code}` : "Various",
    delivery_time: serviceRow.delivery_days ? `${serviceRow.delivery_days} Days` : "2 Days",
    english_level: "Native Or Bilingual",
    images: serviceRow.image_url ? [serviceRow.image_url] : [],
    features: ["Professional service", "Quality assured", "Verified provider"],
    app_types: [],
    design_tools: [],
    devices: [],
    packages,
    faqs: [
      {
        question: "What methods of payment are supported?",
        answer: "We accept standard payment methods. Details at checkout.",
        isOpen: true,
      },
      { question: "Can I cancel?", answer: "Yes, per our cancellation policy.", isOpen: false },
    ],
    relatedServices: [],
  };
}

/**
 * Fetch a single service by id for the detail page.
 * Returns null if not found (caller can fall back to profile-as-service).
 */
export function useService(id: string | null) {
  return useQuery({
    queryKey: servicesKeys.detail(id),
    queryFn: () => fetchServiceDetail(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

/** Invalidate services list/detail caches (e.g. after create/update/delete). */
export function useInvalidateServices() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: servicesKeys.all });
}

const serviceCategoriesKeys = {
  all: ["service_categories"] as const,
  byService: (serviceId: string | null) =>
    [...serviceCategoriesKeys.all, serviceId] as const,
};

async function fetchServiceCategoryIds(
  serviceId: string | null
): Promise<string[]> {
  if (!serviceId) return [];
  const db = supabase as any;
  const { data, error } = await db
    .from("service_psp_types")
    .select("psp_type_id")
    .eq("service_id", serviceId);
  if (error) throw error;
  return (data ?? []).map((r: { psp_type_id: string }) => r.psp_type_id);
}

export function useServiceCategories(serviceId: string | null) {
  return useQuery({
    queryKey: serviceCategoriesKeys.byService(serviceId),
    queryFn: () => fetchServiceCategoryIds(serviceId),
    enabled: !!serviceId,
  });
}

export async function updateServiceCategories(
  serviceId: string,
  categoryIds: string[],
  providerId: string
): Promise<void> {
  const db = supabase as any;
  await db.from("service_psp_types").delete().eq("service_id", serviceId);
  const primaryLabel =
    categoryIds.length > 0
      ? (await db.from("psp_types").select("label").eq("id", categoryIds[0]).single())
          .data?.label ?? "General"
      : "General";
  await supabase
    .from("services")
    .update({ category: primaryLabel })
    .eq("id", serviceId)
    .eq("provider_id", providerId);
  if (categoryIds.length > 0) {
    await db.from("service_psp_types").insert(
      categoryIds.map((psp_type_id: string) => ({
        service_id: serviceId,
        psp_type_id,
      }))
    );
  }
}

async function fetchMyServices(providerId: string | null): Promise<ServiceRow[]> {
  if (!providerId) return [];
  const { data, error } = await supabase
    .from("services")
    .select("id, provider_id, title, category, description, price, image_url, delivery_days, service_fields, created_at, updated_at")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ServiceRow[];
}

/** List services for the current provider (dashboard "My Services"). */
export function useMyServices(providerId: string | null) {
  return useQuery({
    queryKey: servicesKeys.myServices(providerId),
    queryFn: () => fetchMyServices(providerId),
    enabled: !!providerId,
    refetchOnWindowFocus: false,
  });
}

async function fetchMyService(
  providerId: string | null,
  serviceId: string | null
): Promise<ServiceRow | null> {
  if (!providerId || !serviceId) return null;
  const { data, error } = await supabase
    .from("services")
    .select("id, provider_id, title, category, description, price, image_url, delivery_days, service_fields, created_at, updated_at")
    .eq("id", serviceId)
    .eq("provider_id", providerId)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as ServiceRow | null;
}

/** Fetch a single service for edit (provider must own it). */
export function useMyService(providerId: string | null, serviceId: string | null) {
  return useQuery({
    queryKey: servicesKeys.myService(providerId, serviceId),
    queryFn: () => fetchMyService(providerId, serviceId),
    enabled: !!providerId && !!serviceId,
  });
}

async function createServiceRow(payload: ServiceInsert): Promise<ServiceRow> {
  const { data, error } = await supabase
    .from("services")
    .insert({
      provider_id: payload.provider_id,
      title: payload.title,
      category: payload.category || "General",
      description: payload.description ?? null,
      price: payload.price ?? 0,
      image_url: payload.image_url ?? null,
      delivery_days: payload.delivery_days ?? null,
      service_fields: payload.service_fields ?? [],
    })
    .select("id, provider_id, title, category, description, price, image_url, delivery_days, created_at, updated_at")
    .single();
  if (error) throw error;
  return data as ServiceRow;
}

async function updateServiceRow(payload: ServiceUpdate): Promise<ServiceRow> {
  const { id, ...rest } = payload;
  const updates: Record<string, unknown> = {};
  if (rest.title !== undefined) updates.title = rest.title;
  if (rest.category !== undefined) updates.category = rest.category;
  if (rest.description !== undefined) updates.description = rest.description;
  if (rest.price !== undefined) updates.price = rest.price;
  if (rest.image_url !== undefined) updates.image_url = rest.image_url;
  if (rest.delivery_days !== undefined) updates.delivery_days = rest.delivery_days;
  if (rest.service_fields !== undefined) updates.service_fields = rest.service_fields;
  const { data, error } = await supabase
    .from("services")
    .update(updates)
    .eq("id", id)
    .select("id, provider_id, title, category, description, price, image_url, delivery_days, created_at, updated_at")
    .single();
  if (error) throw error;
  return data as ServiceRow;
}

async function deleteServiceRow(id: string): Promise<void> {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw error;
}

export interface CreateServiceWithPackagesPayload {
  title: string;
  description?: string | null;
  image_url?: string | null;
  categoryIds: string[];
  service_fields?: string[];
  packages: Array<{
    title: string;
    description?: string | null;
    price: number;
    delivery_days: number;
  }>;
}

async function createServiceWithPackagesRow(
  providerId: string,
  payload: CreateServiceWithPackagesPayload
): Promise<ServiceRow> {
  if (!payload.packages.length) {
    throw new Error("At least one package is required");
  }
  const firstPkg = payload.packages[0];
  const minPrice = Math.min(...payload.packages.map((p) => p.price));
  const minDelivery = Math.min(...payload.packages.map((p) => p.delivery_days));

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .insert({
      provider_id: providerId,
      title: payload.title,
      category: "General",
      description: payload.description ?? null,
      price: minPrice,
      image_url: payload.image_url ?? null,
      delivery_days: minDelivery,
      service_fields: payload.service_fields ?? [],
    })
    .select("id, provider_id, title, category, description, price, image_url, delivery_days, created_at, updated_at")
    .single();
  if (serviceError) throw serviceError;

  const serviceId = service.id;

  if (payload.categoryIds.length > 0) {
    const db = supabase as any;
    const { data: pspLabels } = await db
      .from("psp_types")
      .select("id, label")
      .in("id", payload.categoryIds);
    const primaryLabel = pspLabels?.[0]?.label ?? "General";
    await supabase
      .from("services")
      .update({ category: primaryLabel })
      .eq("id", serviceId);

    await db.from("service_psp_types").insert(
      payload.categoryIds.map((psp_type_id: string) => ({
        service_id: serviceId,
        psp_type_id,
      }))
    );
  }

  const db = supabase as any;
  await db.from("service_packages").insert(
    payload.packages.map((pkg, i) => ({
      service_id: serviceId,
      title: pkg.title,
      description: pkg.description ?? null,
      price: pkg.price,
      delivery_days: pkg.delivery_days,
      sort_order: i,
    }))
  );

  return service as ServiceRow;
}

/** Create a service with packages and categories in one go (Fiverr-style). */
export function useCreateServiceWithPackages(providerId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateServiceWithPackagesPayload) =>
      createServiceWithPackagesRow(providerId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.all });
      toast.success("Service created");
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to create service");
    },
  });
}

/** Create a service; invalidates myServices and lists. */
export function useCreateService(providerId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<ServiceInsert, "provider_id">) =>
      createServiceRow({ ...payload, provider_id: providerId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.all });
      toast.success("Service created");
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to create service");
    },
  });
}

/** Update a service by id; invalidates myServices, detail(id), and lists. */
export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateServiceRow,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.all });
      queryClient.invalidateQueries({ queryKey: servicesKeys.detail(data.id) });
      toast.success("Service updated");
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to update service");
    },
  });
}

/** Delete a service by id; invalidates myServices, detail(id), and lists. */
export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteServiceRow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.all });
      toast.success("Service deleted");
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to delete service");
    },
  });
}

/** Combined CRUD hook for dashboard services page. */
export function useServicesCrud(providerId: string | null) {
  const { data: services = [], isLoading: servicesLoading } =
    useMyServices(providerId);
  const createService = useCreateService(providerId);
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  return {
    services,
    servicesLoading,
    createService,
    updateService,
    deleteService,
  };
}
