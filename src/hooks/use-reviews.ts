"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const reviewKeys = {
  all: ["reviews"] as const,
  completedOffersForReview: (userId: string | null, profileId: string | null) =>
    [...reviewKeys.all, "completedOffers", userId, profileId] as const,
  received: (profileId: string | null) =>
    [...reviewKeys.all, "received", profileId] as const,
};

export type CompletedOfferForReview = {
  id: string;
  title: string;
  amount_cents: number;
  completed_at: string | null;
};

/**
 * Fetches completed offers where the current user (buyer) can leave a review
 * for the given profile (provider). Excludes offers that already have a review.
 */
async function fetchCompletedOffersForReview(
  userId: string,
  profileId: string
): Promise<CompletedOfferForReview[]> {
  const { data: offers, error: offersError } = await supabase
    .from("offers")
    .select("id, title, amount_cents, updated_at")
    .eq("recipient_id", userId)
    .eq("sender_id", profileId)
    .eq("status", "completed")
    .order("updated_at", { ascending: false });

  if (offersError) throw offersError;
  if (!offers?.length) return [];

  const offerIds = offers.map((o) => o.id);
  const { data: existingReviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("offer_id")
    .in("offer_id", offerIds)
    .not("offer_id", "is", null);

  if (reviewsError) throw reviewsError;
  const reviewedOfferIds = new Set(
    (existingReviews ?? []).map((r: { offer_id: string }) => r.offer_id)
  );

  return offers
    .filter((o) => !reviewedOfferIds.has(o.id))
    .map((o) => ({
      id: o.id,
      title: o.title,
      amount_cents: o.amount_cents,
      completed_at: o.updated_at,
    }));
}

/**
 * Fiverr-style: only buyers with completed orders can leave reviews.
 * Returns completed offers the user can still review for the given provider.
 */
export function useCompletedOffersForReview(
  userId: string | null,
  profileId: string | null
) {
  return useQuery({
    queryKey: reviewKeys.completedOffersForReview(userId, profileId),
    queryFn: () => fetchCompletedOffersForReview(userId!, profileId!),
    enabled: !!userId && !!profileId,
    staleTime: 1000 * 60,
  });
}

export type ReceivedReview = {
  id: string;
  rating: number;
  comment: string | null;
  seller_response: string | null;
  created_at: string;
  reviewer_id: string;
  offer_id: string | null;
  reviewer?: { full_name: string | null };
};

async function fetchReceivedReviews(
  profileId: string
): Promise<ReceivedReview[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, seller_response, created_at, reviewer_id, offer_id")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  const reviews = (data ?? []) as ReceivedReview[];

  const reviewerIds = [...new Set(reviews.map((r) => r.reviewer_id).filter(Boolean))];
  if (reviewerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", reviewerIds);
    const byId = Object.fromEntries(
      (profiles ?? []).map((p: { id: string; full_name: string | null }) => [
        p.id,
        { full_name: p.full_name },
      ])
    );
    reviews.forEach((r) => {
      r.reviewer = byId[r.reviewer_id];
    });
  }
  return reviews;
}

/** Reviews received by the current user (as provider). */
export function useReceivedReviews(profileId: string | null) {
  return useQuery({
    queryKey: reviewKeys.received(profileId),
    queryFn: () => fetchReceivedReviews(profileId!),
    enabled: !!profileId,
    staleTime: 1000 * 60,
  });
}

/** Update seller response on a review (profile owner only). */
export function useUpdateSellerResponse(profileId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reviewId,
      seller_response,
    }: {
      reviewId: string;
      seller_response: string;
    }) => {
      const { error } = await supabase
        .from("reviews")
        .update({ seller_response })
        .eq("id", reviewId)
        .eq("profile_id", profileId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.received(profileId) });
    },
  });
}
