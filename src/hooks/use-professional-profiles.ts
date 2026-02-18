"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Bypass strict typing for tables not in generated Supabase types (psp_types, user_psp_types, user_skills, skills)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const profileKeys = {
  all: ["profiles"] as const,
  details: () => [...profileKeys.all, "detail"] as const,
  detail: (id: string | null) => [...profileKeys.details(), id] as const,
  favorite: (profileId: string | null, userId: string | null) =>
    [...profileKeys.all, "favorite", profileId, userId] as const,
  browse: (filters: BrowseProfilesFilters) =>
    [...profileKeys.all, "browse", filters] as const,
  search: (filters: SearchProfilesFilters) =>
    [...profileKeys.all, "search", filters] as const,
};

export interface BrowseProfilesFilters {
  category?: string | null;
  searchQuery?: string | null;
  zipCode?: string | null;
  serviceCategory?: string | null;
  serviceType?: string | null;
  psp?: string[];
  fields?: string[];
  conditions?: string[];
  priceMin?: number;
  priceMax?: number;
}

export interface SearchProfilesFilters {
  psp?: string | null;
  fields?: string | null;
  price?: string | null;
}

export interface SearchProfileListing {
  id: string;
  full_name: string;
  title?: string;
  rating: number;
  reviews: number;
  hourly_rate?: number;
  location?: string;
  full_address?: string;
  avatar_url?: string;
  bio?: string;
  skills?: string[];
  serviceAreas?: Array<{
    zip_code: string;
    radius_miles: number;
    lat?: number;
    lng?: number;
  }>;
}

export interface BrowseProfileListing {
  id: string;
  title: string;
  provider: string;
  rating: number;
  reviews: number;
  price: number;
  referralFee: string | null;
  pricePerSqft: number | null;
  location: string;
  roles: string[];
  skills?: string[];
  serviceAreas?: Array<{
    zip_code: string;
    radius_miles: number;
    lat?: number;
    lng?: number;
  }>;
}

async function fetchBrowseProfiles(
  filters: BrowseProfilesFilters,
): Promise<BrowseProfileListing[]> {
  const {
    serviceType,
    zipCode,
    priceMin = 0,
    priceMax = 5000,
    psp = [],
  } = filters;

  let profileIds: string[] = [];

  if (psp.length > 0) {
    const { data: pspTypeRows } = await db
      .from("psp_types")
      .select("id")
      .in("label", psp);
    const pspTypeIds = (pspTypeRows || []).map((r: { id: string }) => r.id);
    if (pspTypeIds.length > 0) {
      const { data: userPspRows } = await db
        .from("user_psp_types")
        .select("user_id")
        .in("psp_type_id", pspTypeIds);
      profileIds = [
        ...new Set(
          (userPspRows || []).map((r: { user_id: string }) => r.user_id),
        ),
      ] as string[];
    }
    if (profileIds.length === 0) return [];
  }

  let profilesQuery = db
    .from("profiles")
    .select(
      "id, full_name, referral_fee_percentage, hourly_rate, price_per_sqft",
    );
  if (profileIds.length > 0) {
    profilesQuery = profilesQuery.in("id", profileIds);
  }
  const { data: profilesData, error: profilesError } = await profilesQuery;

  if (profilesError) throw profilesError;

  const allProfileIds = (profilesData || []).map((p) => p.id);
  if (allProfileIds.length === 0) return [];

  const [
    rolesRes,
    areasRes,
    bizRes,
    userPspRes,
    pspTypesRes,
    userSkillsRes,
    skillsRes,
  ] = await Promise.all([
    db.from("user_roles").select("user_id, role").in("user_id", allProfileIds),
    db
      .from("service_areas")
      .select("user_id, zip_code, radius_miles")
      .in("user_id", allProfileIds),
    db
      .from("business_info")
      .select("user_id, company_name")
      .in("user_id", allProfileIds),
    db
      .from("user_psp_types")
      .select("user_id, psp_type_id")
      .in("user_id", allProfileIds),
    db.from("psp_types").select("id, label"),
    db
      .from("user_skills")
      .select("user_id, skill_id")
      .in("user_id", allProfileIds),
    db.from("skills").select("id, label"),
  ]);

  const pspLabelById: Record<string, string> = {};
  (pspTypesRes.data || []).forEach((p: { id: string; label: string }) => {
    pspLabelById[p.id] = p.label;
  });

  const skillLabelById: Record<string, string> = {};
  (skillsRes.data || []).forEach((s: { id: string; label: string }) => {
    skillLabelById[s.id] = s.label;
  });

  const skillsByUser: Record<string, string[]> = {};
  (userSkillsRes.data || []).forEach(
    (r: { user_id: string; skill_id: string }) => {
      const label = skillLabelById[r.skill_id];
      if (label) {
        if (!skillsByUser[r.user_id]) skillsByUser[r.user_id] = [];
        skillsByUser[r.user_id].push(label);
      }
    },
  );

  const rolesByUser: Record<string, string[]> = {};
  (rolesRes.data || []).forEach((r: { user_id: string; role: string }) => {
    if (!rolesByUser[r.user_id]) rolesByUser[r.user_id] = [];
    rolesByUser[r.user_id].push(r.role);
  });

  const pspLabelsByUser: Record<string, string[]> = {};
  (userPspRes.data || []).forEach(
    (r: { user_id: string; psp_type_id: string }) => {
      const label = pspLabelById[r.psp_type_id];
      if (label) {
        if (!pspLabelsByUser[r.user_id]) pspLabelsByUser[r.user_id] = [];
        pspLabelsByUser[r.user_id].push(label);
      }
    },
  );

  const areasByUser: Record<
    string,
    Array<{ zip_code: string; radius_miles: number }>
  > = {};
  (areasRes.data || []).forEach(
    (a: { user_id: string; zip_code: string; radius_miles: number }) => {
      if (!areasByUser[a.user_id]) areasByUser[a.user_id] = [];
      areasByUser[a.user_id].push({
        zip_code: a.zip_code,
        radius_miles: a.radius_miles,
      });
    },
  );

  const companyByUser: Record<string, string | null> = {};
  (bizRes.data || []).forEach(
    (b: { user_id: string; company_name: string | null }) => {
      companyByUser[b.user_id] = b.company_name ?? null;
    },
  );

  let listings: BrowseProfileListing[] = (profilesData || []).map(
    (profile: any) => {
      const pspLabels = pspLabelsByUser[profile.id] || [];
      const legacyRoles = rolesByUser[profile.id] || [];
      const roles = pspLabels.length > 0 ? pspLabels : legacyRoles;
      return {
        id: profile.id,
        title: companyByUser[profile.id] || profile.full_name,
        provider: profile.full_name,
        rating: 4.8 + Math.random() * 0.2,
        reviews: Math.floor(Math.random() * 200) + 50,
        price: profile.hourly_rate || 0,
        referralFee: profile.referral_fee_percentage
          ? `${profile.referral_fee_percentage}%`
          : null,
        pricePerSqft: profile.price_per_sqft,
        location: areasByUser[profile.id]?.[0]?.zip_code || "California",
        roles,
        skills: skillsByUser[profile.id] || [],
        serviceAreas: (areasByUser[profile.id] || []).map((a) => ({
          zip_code: a.zip_code,
          radius_miles: a.radius_miles,
        })),
      };
    },
  );

  if (serviceType) {
    listings = listings.filter((listing) =>
      listing.roles.some((role) => role === serviceType),
    );
  }

  if (zipCode && listings.length > 0) {
    listings = listings.filter(
      (listing) => listing.location.includes(zipCode) || true,
    );
  }

  if (priceMin > 0 || priceMax < 5000) {
    listings = listings.filter(
      (listing) => listing.price >= priceMin && listing.price <= priceMax,
    );
  }

  return listings;
}

export function useBrowseProfiles(filters: BrowseProfilesFilters) {
  return useQuery({
    queryKey: profileKeys.browse(filters),
    queryFn: () => fetchBrowseProfiles(filters),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

const ADDRESS_MAP: Record<string, string> = {
  "10001": "350 5th Ave, New York, NY 10001, USA",
  "90001": "123 Main St, Los Angeles, CA 90001, USA",
  "90210": "456 Rodeo Dr, Beverly Hills, CA 90210, USA",
  "94102": "789 Market St, San Francisco, CA 94102, USA",
  "60601": "321 State St, Chicago, IL 60601, USA",
  "33139": "654 Ocean Dr, Miami Beach, FL 33139, USA",
  "78701": "987 Congress Ave, Austin, TX 78701, USA",
  "98101": "147 Pike St, Seattle, WA 98101, USA",
  "02101": "258 State St, Boston, MA 02101, USA",
  "85001": "369 Central Ave, Phoenix, AZ 85001, USA",
  "80202": "741 16th St, Denver, CO 80202, USA",
};

async function fetchSearchProfiles(
  filters: SearchProfilesFilters,
): Promise<SearchProfileListing[]> {
  let profileIds: string[] = [];
  const pspParam = filters.psp;
  const pspLabels = pspParam
    ? pspParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  if (pspLabels.length > 0) {
    const { data: pspTypeRows } = await db
      .from("psp_types")
      .select("id")
      .in("label", pspLabels);
    const pspTypeIds = (pspTypeRows || []).map((r: { id: string }) => r.id);
    if (pspTypeIds.length > 0) {
      const { data: userPspRows } = await db
        .from("user_psp_types")
        .select("user_id")
        .in("psp_type_id", pspTypeIds);
      profileIds = [
        ...new Set(
          (userPspRows || []).map((r: { user_id: string }) => r.user_id),
        ),
      ] as string[];
    }
    if (profileIds.length === 0) return [];
  }

  let profilesQuery = db
    .from("profiles")
    .select(
      "id, full_name, avatar_url, bio, hourly_rate, mailing_address",
    );
  if (profileIds.length > 0) {
    profilesQuery = profilesQuery.in("id", profileIds);
  }
  const { data: profilesData, error: profilesError } = await profilesQuery;

  if (profilesError) throw profilesError;

  const allProfileIds = (profilesData || []).map((p: { id: string }) => p.id);
  if (allProfileIds.length === 0) return [];

  const [reviewsRes, bizRes, areasRes, userSkillsRes, skillsRes] =
    await Promise.all([
      db
        .from("reviews")
        .select("profile_id, rating")
        .in("profile_id", allProfileIds),
      db
        .from("business_info")
        .select("user_id, company_name")
        .in("user_id", allProfileIds),
      db
        .from("service_areas")
        .select("user_id, zip_code, radius_miles")
        .in("user_id", allProfileIds),
      db
        .from("user_skills")
        .select("user_id, skill_id")
        .in("user_id", allProfileIds),
      db.from("skills").select("id, label"),
    ]);

  const reviewsByProfile: Record<string, number[]> = {};
  (reviewsRes.data || []).forEach(
    (r: { profile_id: string; rating: number }) => {
      if (!reviewsByProfile[r.profile_id]) reviewsByProfile[r.profile_id] = [];
      reviewsByProfile[r.profile_id].push(r.rating);
    },
  );

  const companyByUser: Record<string, string | null> = {};
  (bizRes.data || []).forEach(
    (b: { user_id: string; company_name: string | null }) => {
      companyByUser[b.user_id] = b.company_name ?? null;
    },
  );

  const areasByUser: Record<
    string,
    Array<{ zip_code: string; radius_miles: number }>
  > = {};
  (areasRes.data || []).forEach(
    (a: { user_id: string; zip_code: string; radius_miles: number }) => {
      if (!areasByUser[a.user_id]) areasByUser[a.user_id] = [];
      areasByUser[a.user_id].push({
        zip_code: a.zip_code,
        radius_miles: a.radius_miles,
      });
    },
  );

  const skillLabelById: Record<string, string> = {};
  (skillsRes.data || []).forEach((s: { id: string; label: string }) => {
    skillLabelById[s.id] = s.label;
  });

  const skillsByUser: Record<string, string[]> = {};
  (userSkillsRes.data || []).forEach(
    (r: { user_id: string; skill_id: string }) => {
      const label = skillLabelById[r.skill_id];
      if (label) {
        if (!skillsByUser[r.user_id]) skillsByUser[r.user_id] = [];
        skillsByUser[r.user_id].push(label);
      }
    },
  );

  let listings: SearchProfileListing[] = (profilesData || []).map(
    (profile: any) => {
      const reviews = reviewsByProfile[profile.id] || [];
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((a, b) => a + b, 0) / reviews.length
          : 0;
      const serviceAreas = areasByUser[profile.id] || [];
      let full_address = profile.mailing_address || "";
      let location = "New York, NY, USA";

      if (!full_address && serviceAreas.length > 0) {
        const zipCode = serviceAreas[0].zip_code;
        full_address = ADDRESS_MAP[zipCode] || `${zipCode}, USA`;
        const parts = full_address.split(",");
        location =
          parts.length > 1
            ? `${parts[0]}, ${parts[parts.length - 1]}`
            : full_address;
      }
      if (full_address) {
        const parts = full_address.split(",");
        location =
          parts.length > 1
            ? `${parts[0]}, ${parts[parts.length - 1]}`
            : full_address;
      }

      return {
        id: profile.id,
        full_name: profile.full_name,
        title: companyByUser[profile.id] || "Professional",
        rating: parseFloat(avgRating.toFixed(1)),
        reviews: reviews.length,
        hourly_rate: profile.hourly_rate ?? undefined,
        location,
        full_address: full_address || undefined,
        avatar_url: profile.avatar_url ?? undefined,
        bio: profile.bio ?? undefined,
        skills: skillsByUser[profile.id] || [],
        serviceAreas: serviceAreas.map(
          (a: { zip_code: string; radius_miles: number }) => ({
            zip_code: a.zip_code,
            radius_miles: a.radius_miles,
          }),
        ),
      };
    },
  );

  const priceParam = filters.price;
  if (priceParam) {
    const [minStr, maxStr] = priceParam
      .split("-")
      .map((s) => parseInt(s.trim(), 10));
    const priceMin = !isNaN(minStr) ? minStr : 0;
    const priceMax = !isNaN(maxStr) ? maxStr : 5000;
    listings = listings.filter((p) => {
      const rate = p.hourly_rate ?? 0;
      return rate >= priceMin && rate <= priceMax;
    });
  }

  return listings;
}

export function useSearchProfiles(filters: SearchProfilesFilters) {
  return useQuery({
    queryKey: profileKeys.search(filters),
    queryFn: () => fetchSearchProfiles(filters),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function usePspTypes() {
  return useQuery({
    queryKey: ["psp_types"],
    queryFn: async () => {
      const { data, error } = await db
        .from("psp_types")
        .select("id, label, slug")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export interface ProfileReview {
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_id: string;
  reviewer?: { full_name: string };
}

export interface ProfessionalProfile {
  id: string;
  full_name: string;
  company_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  hourly_rate: number | null;
  price_per_sqft: number | null;
  referral_fee_percentage: number | null;
  experience_level: string | null;
  years_of_experience: number | null;
  license_number: string | null;
  languages: string[] | null;
  willing_to_train: boolean | null;
  user_roles: Array<{ role: string }>;
  psp_labels?: string[];
  skills?: string[];
  service_areas: Array<{ zip_code: string; radius_miles: number }>;
  payment_preferences: {
    accepts_cash: boolean | null;
    accepts_credit: boolean | null;
    accepts_financing: boolean | null;
    payment_terms: string | null;
  } | null;
  reviews: ProfileReview[];
  awards?: Array<{
    id: string;
    title: string;
    date_awarded: string | null;
    description: string | null;
  }>;
  services?: Array<{
    id: string;
    title: string;
    category: string;
    price: number;
    description: string | null;
  }>;
  related_profiles?: Array<{
    id: string;
    full_name: string;
    title?: string;
    rating: number;
    reviews: number;
    location?: string;
    hourly_rate?: number;
    skills?: string[];
    avatar_url?: string;
  }>;
  [key: string]: unknown;
}

async function fetchProfile(
  id: string | null,
): Promise<ProfessionalProfile | null> {
  if (!id) return null;

  const { data: profileData, error } = await db
    .from("profiles")
    .select("*, reviews(rating, comment, created_at, reviewer_id)")
    .eq("id", id)
    .single();

  if (error) throw error;
  const profile = profileData as any;

  const [
    rolesRes,
    areasRes,
    paymentRes,
    businessRes,
    userPspRes,
    userSkillsRes,
    awardsRes,
    servicesRes,
  ] = await Promise.all([
    db.from("user_roles").select("role").eq("user_id", id),
    db.from("service_areas").select("zip_code, radius_miles").eq("user_id", id),
    db.from("payment_preferences").select("*").eq("user_id", id).maybeSingle(),
    db
      .from("business_info")
      .select("company_name, years_of_experience")
      .eq("user_id", id)
      .maybeSingle(),
    db.from("user_psp_types").select("psp_type_id").eq("user_id", id),
    db.from("user_skills").select("skill_id").eq("user_id", id),
    db
      .from("awards")
      .select("id, title, date_awarded, description")
      .eq("recipient_id", id)
      .order("date_awarded", { ascending: false }),
    db
      .from("services")
      .select("id, title, category, price, description")
      .eq("provider_id", id),
  ]);
  profile.user_roles = rolesRes.data ?? [];
  profile.service_areas = areasRes.data ?? [];
  const pspTypeIds = (userPspRes.data ?? []).map(
    (r: { psp_type_id: string }) => r.psp_type_id,
  );
  if (pspTypeIds.length > 0) {
    const { data: pspRows } = await db
      .from("psp_types")
      .select("label")
      .in("id", pspTypeIds);
    profile.psp_labels = (pspRows ?? []).map((r: { label: string }) => r.label);
  } else {
    profile.psp_labels = [];
  }
  const skillIds = (userSkillsRes.data ?? []).map(
    (r: { skill_id: string }) => r.skill_id,
  );
  if (skillIds.length > 0) {
    const { data: skillRows } = await db
      .from("skills")
      .select("label")
      .in("id", skillIds);
    profile.skills = (skillRows ?? []).map((r: { label: string }) => r.label);
  } else {
    profile.skills = [];
  }
  profile.payment_preferences = paymentRes.data ?? null;
  profile.company_name = businessRes.data?.company_name ?? null;
  profile.years_of_experience = businessRes.data?.years_of_experience ?? null;
  profile.awards = (awardsRes.data ?? []).map((a: any) => ({
    id: a.id,
    title: a.title,
    date_awarded: a.date_awarded ?? null,
    description: a.description ?? null,
  }));
  profile.services = (servicesRes.data ?? []).map((s: any) => ({
    id: s.id,
    title: s.title,
    category: s.category ?? "",
    price: s.price ?? 0,
    description: s.description ?? null,
  }));

  if (profile?.reviews?.length > 0) {
    const reviewerIds = [
      ...new Set(
        profile.reviews.map((r: any) => r.reviewer_id).filter(Boolean),
      ),
    ] as string[];
    const { data: reviewers } = await db
      .from("profiles")
      .select("id, full_name")
      .in("id", reviewerIds);
    const nameByKey = Object.fromEntries(
      (reviewers || []).map((p: any) => [p.id, p.full_name]),
    );
    profile.reviews = profile.reviews.map((r: any) => ({
      ...r,
      reviewer: { full_name: nameByKey[r.reviewer_id] || "Anonymous" },
    }));
  }

  // Related profiles: same PSP types, excluding current, limit 4
  const relatedIds: string[] = [];
  if (pspTypeIds.length > 0) {
    const { data: relatedRows } = await db
      .from("user_psp_types")
      .select("user_id")
      .in("psp_type_id", pspTypeIds)
      .neq("user_id", id)
      .limit(20);
    const seen = new Set<string>();
    for (const r of relatedRows ?? []) {
      if (r.user_id && !seen.has(r.user_id)) {
        seen.add(r.user_id);
        relatedIds.push(r.user_id);
        if (relatedIds.length >= 4) break;
      }
    }
  }
  if (relatedIds.length > 0) {
    const { data: relatedProfiles } = await db
      .from("profiles")
      .select("id, full_name, company_name, hourly_rate, avatar_url")
      .in("id", relatedIds);
    const { data: relatedReviews } = await db
      .from("reviews")
      .select("profile_id, rating")
      .in("profile_id", relatedIds);
    const { data: relatedAreas } = await db
      .from("service_areas")
      .select("user_id, zip_code")
      .in("user_id", relatedIds);
    const { data: relatedSkills } = await db
      .from("user_skills")
      .select("user_id, skill_id")
      .in("user_id", relatedIds);
    const skillIdsForRelated = [
      ...new Set((relatedSkills ?? []).map((s: any) => s.skill_id)),
    ];
    const { data: skillLabels } =
      skillIdsForRelated.length > 0
        ? await db
            .from("skills")
            .select("id, label")
            .in("id", skillIdsForRelated)
        : { data: [] };
    const labelById = Object.fromEntries(
      (skillLabels ?? []).map((s: any) => [s.id, s.label]),
    );
    const reviewsByProfile: Record<string, { sum: number; count: number }> = {};
    for (const r of relatedReviews ?? []) {
      if (!reviewsByProfile[r.profile_id])
        reviewsByProfile[r.profile_id] = { sum: 0, count: 0 };
      reviewsByProfile[r.profile_id].sum += r.rating;
      reviewsByProfile[r.profile_id].count += 1;
    }
    const areaByUser = Object.fromEntries(
      (relatedAreas ?? []).map((a: any) => [a.user_id, a.zip_code]),
    );
    const skillsByUser: Record<string, string[]> = {};
    for (const s of relatedSkills ?? []) {
      const label = labelById[s.skill_id];
      if (label) {
        if (!skillsByUser[s.user_id]) skillsByUser[s.user_id] = [];
        skillsByUser[s.user_id].push(label);
      }
    }
    profile.related_profiles = (relatedProfiles ?? []).map((p: any) => {
      const stats = reviewsByProfile[p.id] ?? { sum: 0, count: 0 };
      const rating = stats.count > 0 ? stats.sum / stats.count : 0;
      return {
        id: p.id,
        full_name: p.full_name ?? "Professional",
        title: p.company_name ?? undefined,
        rating: parseFloat(rating.toFixed(1)),
        reviews: stats.count,
        location: areaByUser[p.id],
        hourly_rate: p.hourly_rate ?? undefined,
        skills: skillsByUser[p.id],
        avatar_url: p.avatar_url ?? undefined,
      };
    });
  } else {
    profile.related_profiles = [];
  }

  return profile as ProfessionalProfile;
}

export function useProfile(id: string | null) {
  return useQuery({
    queryKey: profileKeys.detail(id),
    queryFn: () => fetchProfile(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

async function checkFavorite(
  profileId: string | null,
  userId: string | null,
): Promise<boolean> {
  if (!profileId || !userId) return false;
  const { data } = await db
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("profile_id", profileId)
    .maybeSingle();
  return !!data;
}

export function useProfileFavorite(
  profileId: string | null,
  userId: string | null,
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: profileKeys.favorite(profileId, userId),
    queryFn: () => checkFavorite(profileId, userId),
    enabled: !!profileId && !!userId,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: async (action: "add" | "remove") => {
      if (!userId || !profileId) throw new Error("Not authenticated");
      if (action === "remove") {
        await db
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("profile_id", profileId);
      } else {
        await db
          .from("favorites")
          .insert({ user_id: userId, profile_id: profileId });
      }
    },
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({
        queryKey: profileKeys.favorite(profileId, userId),
      });
      toast.success(
        action === "add" ? "Added to favorites" : "Removed from favorites",
      );
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update favorites");
    },
  });

  const toggleFavorite = () => {
    if (!userId) {
      toast.error("Please sign in to save favorites");
      return;
    }
    const next = !query.data;
    mutation.mutate(next ? "add" : "remove");
  };

  return {
    isFavorite: query.data ?? false,
    isLoading: query.isLoading,
    toggleFavorite,
    isToggling: mutation.isPending,
  };
}

export interface SubmitReviewPayload {
  rating: number;
  comment: string;
}

export function useSubmitReview(profileId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SubmitReviewPayload) => {
      const {
        data: { user },
        error: authError,
      } = await db.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error("Please sign in to submit a review");
      if (!profileId) throw new Error("Profile not found");

      const { error } = await db.from("reviews").insert({
        reviewer_id: user.id,
        profile_id: profileId,
        rating: payload.rating,
        comment: payload.comment,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      if (profileId) {
        queryClient.invalidateQueries({
          queryKey: profileKeys.detail(profileId),
        });
      }
      toast.success("Review submitted successfully");
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to submit review");
    },
  });
}

export interface ProfileUpdatePayload {
  userId: string;
  skipInvalidation?: boolean;
  formValues: {
    full_name: string;
    email?: string;
    bio?: string;
    phone?: string;
    website?: string;
    license_number?: string;
    company_name?: string;
    experience_level?: string;
    years_of_experience?: number;
    referral_fee_percentage?: number;
    hourly_rate?: number;
    price_per_sqft?: number;
    willing_to_train?: boolean;
    training_details?: string;
  };
  selectedRoles: string[];
  selectedLanguages: string[];
  serviceAreas: Array<{ zip_code: string; radius_miles: number }>;
  paymentPrefs: {
    accepts_cash: boolean;
    accepts_credit: boolean;
    accepts_financing: boolean;
    payment_packet?: string;
    payment_terms?: string;
  };
}

async function updateProfileMutation(
  payload: ProfileUpdatePayload,
): Promise<void> {
  const {
    userId,
    formValues,
    selectedRoles,
    selectedLanguages,
    serviceAreas,
    paymentPrefs,
  } = payload;

  if (selectedRoles.length === 0) {
    throw new Error("Please select at least one professional role");
  }

  const { company_name, years_of_experience, ...profileFormValues } =
    formValues;
  const { error: profileError } = await db
    .from("profiles")
    .update({ ...profileFormValues, languages: selectedLanguages } as any)
    .eq("id", userId);

  if (profileError?.code === "PGRST116") {
    const profileData = {
      id: userId,
      full_name: profileFormValues.full_name,
      email: profileFormValues.email ?? null,
      bio: profileFormValues.bio ?? null,
      phone: profileFormValues.phone ?? null,
      website: profileFormValues.website ?? null,
      license_number: profileFormValues.license_number ?? null,
      experience_level: profileFormValues.experience_level ?? null,
      referral_fee_percentage:
        profileFormValues.referral_fee_percentage ?? null,
      hourly_rate: profileFormValues.hourly_rate ?? null,
      price_per_sqft: profileFormValues.price_per_sqft ?? null,
      willing_to_train: profileFormValues.willing_to_train ?? null,
      training_details: profileFormValues.training_details ?? null,
      languages: selectedLanguages,
    };
    const { error: insertError } = await db
      .from("profiles")
      .insert(profileData as any);
    if (insertError) throw insertError;
  } else if (profileError) {
    throw profileError;
  }

  await db
    .from("business_info")
    .upsert(
      {
        user_id: userId,
        company_name: company_name ?? null,
        years_of_experience: years_of_experience ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

  await db.from("user_roles").delete().eq("user_id", userId);
  const roleInserts = selectedRoles.map((role) => ({
    user_id: userId,
    role: role as any,
  }));
  const { error: rolesError } = await db.from("user_roles").insert(roleInserts);
  if (rolesError) throw rolesError;

  await db.from("service_areas").delete().eq("user_id", userId);
  const areaInserts = serviceAreas
    .filter((area) => area.zip_code.trim() !== "")
    .map((area, idx) => ({
      user_id: userId,
      zip_code: area.zip_code,
      radius_miles: area.radius_miles,
      is_primary: idx === 0,
    }));
  if (areaInserts.length > 0) {
    const { error: areasError } = await db
      .from("service_areas")
      .insert(areaInserts);
    if (areasError) throw areasError;
  }

  const { error: paymentError } = await db
    .from("payment_preferences")
    .upsert({ user_id: userId, ...paymentPrefs }, { onConflict: "user_id" });
  if (paymentError) throw paymentError;
}

export interface ProfileBasicInfoPayload {
  userId: string;
  full_name: string;
  email?: string;
  bio?: string;
  phone?: string;
  website?: string;
  company_name?: string;
  license_number?: string;
}

async function updateProfileBasicInfoMutation(
  payload: ProfileBasicInfoPayload,
): Promise<void> {
  const {
    userId,
    full_name,
    email,
    bio,
    phone,
    website,
    company_name,
    license_number,
  } = payload;

  const { error: profileError } = await db
    .from("profiles")
    .update({
      full_name,
      email: email ?? null,
      bio: bio ?? null,
      phone: phone ?? null,
      website: website ?? null,
      license_number: license_number ?? null,
    })
    .eq("id", userId);

  if (profileError?.code === "PGRST116") {
    const profileData = {
      id: userId,
      full_name,
      email: email ?? null,
      bio: bio ?? null,
      phone: phone ?? null,
      website: website ?? null,
      license_number: license_number ?? null,
    };
    const { error: insertError } = await db
      .from("profiles")
      .insert(profileData as any);
    if (insertError) throw insertError;
  } else if (profileError) {
    throw profileError;
  }

  await db
    .from("business_info")
    .upsert(
      {
        user_id: userId,
        company_name: company_name ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
}

export interface ProfileRolesPayload {
  userId: string;
  selectedRoles: string[];
}

export interface ProfilePspTypesPayload {
  userId: string;
  selectedPspLabels: string[];
}

async function updateProfilePspTypesMutation(
  payload: ProfilePspTypesPayload,
): Promise<void> {
  const { userId, selectedPspLabels } = payload;
  const { data: pspRows } = await db
    .from("psp_types")
    .select("id")
    .in("label", selectedPspLabels);
  const pspTypeIds = (pspRows || []).map((r: { id: string }) => r.id);

  await db.from("user_psp_types").delete().eq("user_id", userId);
  if (pspTypeIds.length > 0) {
    const inserts = pspTypeIds.map((psp_type_id) => ({
      user_id: userId,
      psp_type_id,
    }));
    const { error } = await db.from("user_psp_types").insert(inserts);
    if (error) throw error;
  }
}

async function updateProfileRolesMutation(
  payload: ProfileRolesPayload,
): Promise<void> {
  const { userId, selectedRoles } = payload;
  if (selectedRoles.length === 0)
    throw new Error("Please select at least one professional role");
  await db.from("user_roles").delete().eq("user_id", userId);
  const roleInserts = selectedRoles.map((role) => ({
    user_id: userId,
    role: role as any,
  }));
  const { error: rolesError } = await db.from("user_roles").insert(roleInserts);
  if (rolesError) throw rolesError;
}

export interface ProfileExperiencePayload {
  userId: string;
  experience_level?: string;
  years_of_experience?: number;
}

async function updateProfileExperienceMutation(
  payload: ProfileExperiencePayload,
): Promise<void> {
  const { userId, experience_level, years_of_experience } = payload;
  const { error: profileError } = await db
    .from("profiles")
    .update({ experience_level: experience_level ?? null } as Record<
      string,
      unknown
    >)
    .eq("id", userId);

  if (profileError?.code === "PGRST116") {
    const profileData = {
      id: userId,
      experience_level: experience_level ?? null,
    };
    const { error: insertError } = await db
      .from("profiles")
      .insert(profileData as any);
    if (insertError) throw insertError;
  } else if (profileError) {
    throw profileError;
  }

  await db
    .from("business_info")
    .upsert(
      {
        user_id: userId,
        years_of_experience: years_of_experience ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
}

export interface ProfilePricingPayload {
  userId: string;
  referral_fee_percentage?: number;
  hourly_rate?: number;
  price_per_sqft?: number;
}

async function updateProfilePricingMutation(
  payload: ProfilePricingPayload,
): Promise<void> {
  const { userId, referral_fee_percentage, hourly_rate, price_per_sqft } =
    payload;
  const { error: profileError } = await db
    .from("profiles")
    .update({
      referral_fee_percentage: referral_fee_percentage ?? null,
      hourly_rate: hourly_rate ?? null,
      price_per_sqft: price_per_sqft ?? null,
    })
    .eq("id", userId);

  if (profileError?.code === "PGRST116") {
    const profileData = {
      id: userId,
      referral_fee_percentage: referral_fee_percentage ?? null,
      hourly_rate: hourly_rate ?? null,
      price_per_sqft: price_per_sqft ?? null,
    };
    const { error: insertError } = await db
      .from("profiles")
      .insert(profileData as any);
    if (insertError) throw insertError;
  } else if (profileError) {
    throw profileError;
  }
}

export interface ProfileServiceAreasPayload {
  userId: string;
  serviceAreas: Array<{ zip_code: string; radius_miles: number }>;
}

async function updateProfileServiceAreasMutation(
  payload: ProfileServiceAreasPayload,
): Promise<void> {
  const { userId, serviceAreas } = payload;
  await db.from("service_areas").delete().eq("user_id", userId);
  const areaInserts = serviceAreas
    .filter((area) => area.zip_code.trim() !== "")
    .map((area, idx) => ({
      user_id: userId,
      zip_code: area.zip_code,
      radius_miles: area.radius_miles,
      is_primary: idx === 0,
    }));
  if (areaInserts.length > 0) {
    const { error: areasError } = await db
      .from("service_areas")
      .insert(areaInserts);
    if (areasError) throw areasError;
  }
}

export interface ProfileTrainingPayload {
  userId: string;
  willing_to_train?: boolean;
  training_details?: string;
}

async function updateProfileTrainingMutation(
  payload: ProfileTrainingPayload,
): Promise<void> {
  const { userId, willing_to_train, training_details } = payload;
  const { error: profileError } = await db
    .from("profiles")
    .update({
      willing_to_train: willing_to_train ?? null,
      training_details: training_details ?? null,
    })
    .eq("id", userId);

  if (profileError?.code === "PGRST116") {
    const profileData = {
      id: userId,
      willing_to_train: willing_to_train ?? null,
      training_details: training_details ?? null,
    };
    const { error: insertError } = await db
      .from("profiles")
      .insert(profileData as any);
    if (insertError) throw insertError;
  } else if (profileError) {
    throw profileError;
  }
}

export interface ProfilePaymentPrefsPayload {
  userId: string;
  accepts_cash: boolean;
  accepts_credit: boolean;
  accepts_financing: boolean;
  payment_packet?: string;
  payment_terms?: string;
}

async function updateProfilePaymentPrefsMutation(
  payload: ProfilePaymentPrefsPayload,
): Promise<void> {
  const { userId, ...paymentPrefs } = payload;
  const { error: paymentError } = await db
    .from("payment_preferences")
    .upsert({ user_id: userId, ...paymentPrefs }, { onConflict: "user_id" });
  if (paymentError) throw paymentError;
}

export interface ProfileLanguagesPayload {
  userId: string;
  selectedLanguages: string[];
}

async function updateProfileLanguagesMutation(
  payload: ProfileLanguagesPayload,
): Promise<void> {
  const { userId, selectedLanguages } = payload;
  const { error: profileError } = await db
    .from("profiles")
    .update({ languages: selectedLanguages })
    .eq("id", userId);

  if (profileError?.code === "PGRST116") {
    const profileData = { id: userId, languages: selectedLanguages };
    const { error: insertError } = await db
      .from("profiles")
      .insert(profileData as any);
    if (insertError) throw insertError;
  } else if (profileError) {
    throw profileError;
  }
}

const invalidateDetail = (
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
) => queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });

export function useProfileBasicInfoUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfileBasicInfoMutation,
    onSuccess: (_, variables) => {
      invalidateDetail(queryClient, variables.userId);
      toast.success("Profile updated successfully!");
    },
    onError: (err: Error) =>
      toast.error(err?.message || "Failed to update profile"),
  });
}

export function useProfilePspTypesUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfilePspTypesMutation,
    onSuccess: (_, variables) => {
      invalidateDetail(queryClient, variables.userId);
      queryClient.invalidateQueries({ queryKey: profileKeys.browse({}) });
      toast.success("Professional types updated!");
    },
    onError: (err: Error) =>
      toast.error(err?.message || "Failed to update professional types"),
  });
}

export function useProfileExperienceUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfileExperienceMutation,
    onSuccess: (_, variables) => {
      invalidateDetail(queryClient, variables.userId);
      toast.success("Profile updated successfully!");
    },
    onError: (err: Error) =>
      toast.error(err?.message || "Failed to update profile"),
  });
}

export function useProfilePricingUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfilePricingMutation,
    onSuccess: (_, variables) => {
      invalidateDetail(queryClient, variables.userId);
      toast.success("Profile updated successfully!");
    },
    onError: (err: Error) =>
      toast.error(err?.message || "Failed to update profile"),
  });
}

export function useProfileServiceAreasUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfileServiceAreasMutation,
    onSuccess: (_, variables) => {
      invalidateDetail(queryClient, variables.userId);
      toast.success("Profile updated successfully!");
    },
    onError: (err: Error) =>
      toast.error(err?.message || "Failed to update profile"),
  });
}

export function useProfileTrainingUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfileTrainingMutation,
    onSuccess: (_, variables) => {
      invalidateDetail(queryClient, variables.userId);
      toast.success("Profile updated successfully!");
    },
    onError: (err: Error) =>
      toast.error(err?.message || "Failed to update profile"),
  });
}

export function useProfileLanguagesUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfileLanguagesMutation,
    onSuccess: (_, variables) => {
      invalidateDetail(queryClient, variables.userId);
      toast.success("Profile updated successfully!");
    },
    onError: (err: Error) =>
      toast.error(err?.message || "Failed to update profile"),
  });
}

export function useProfilePaymentPrefsUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfilePaymentPrefsMutation,
    onSuccess: (_, variables) => {
      invalidateDetail(queryClient, variables.userId);
      toast.success("Profile updated successfully!");
    },
    onError: (err: Error) =>
      toast.error(err?.message || "Failed to update profile"),
  });
}

export function useProfileRolesUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfileRolesMutation,
    onSuccess: (_, variables) => {
      invalidateDetail(queryClient, variables.userId);
      toast.success("Profile updated successfully!");
    },
    onError: (err: Error) =>
      toast.error(err?.message || "Failed to update profile"),
  });
}

export function useProfileUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfileMutation,
    onSuccess: (_, variables) => {
      if (!variables.skipInvalidation) {
        invalidateDetail(queryClient, variables.userId);
      }
      toast.success("Profile updated successfully!");
    },
    onError: (err: Error) =>
      toast.error(err?.message || "Failed to update profile"),
  });
}
