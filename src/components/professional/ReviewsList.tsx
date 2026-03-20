"use client";

import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useCompletedOffersForReview } from "@/hooks/use-reviews";
import type { CompletedOfferForReview } from "@/hooks/use-reviews";

interface ReviewsListProps {
  profileId: string;
  reviews: any[];
  onReviewAdded: () => void;
  /** Current user id - required for Fiverr-style: only buyers with completed orders can review */
  currentUserId?: string | null;
}

const ReviewsList = ({
  profileId,
  reviews,
  onReviewAdded,
  currentUserId,
}: ReviewsListProps) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: completedOffers = [], isLoading: offersLoading } =
    useCompletedOffersForReview(currentUserId ?? null, profileId);

  const canReview = completedOffers.length > 0;
  const hasMultipleOffers = completedOffers.length > 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to leave a review");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }

    // Fiverr-style: require offer_id - only completed orders can be reviewed
    if (!selectedOfferId && canReview) {
      toast.error("Please select which order to review");
      return;
    }

    setLoading(true);

    try {
      const insertPayload: Record<string, unknown> = {
        profile_id: profileId,
        reviewer_id: user.id,
        rating,
        comment: comment.trim(),
      };
      if (selectedOfferId) {
        insertPayload.offer_id = selectedOfferId;
      }

      const { error } = await supabase.from("reviews").insert(insertPayload);

      if (error) {
        if (error.code === "23505") {
          toast.error("You've already reviewed this order");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Review submitted successfully!");
      setComment("");
      setRating(5);
      setSelectedOfferId(null);
      setShowForm(false);
      onReviewAdded();
    } catch (error: unknown) {
      toast.error("Failed to submit review");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openForm = () => {
    setSelectedOfferId(
      hasMultipleOffers ? null : completedOffers[0]?.id ?? null
    );
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Fiverr-style: only show Write Review when user has completed orders */}
      {currentUserId && !showForm && (
        <>
          {canReview ? (
            <Button
              onClick={openForm}
              variant="outline"
              className="w-full"
            >
              Write a Review
            </Button>
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              <p className="text-sm">
                Only clients who completed an order with this professional can
                leave a review.
              </p>
            </Card>
          )}
        </>
      )}

      {showForm && canReview && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Write Your Review</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Share your experience from your completed order.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {hasMultipleOffers && (
              <div>
                <Label className="mb-2 block">Which order?</Label>
                <Select
                  value={selectedOfferId ?? ""}
                  onValueChange={(v) => setSelectedOfferId(v || null)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select order to review" />
                  </SelectTrigger>
                  <SelectContent>
                    {completedOffers.map((o: CompletedOfferForReview) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.title} — ${(o.amount_cents / 100).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating
                          ? "fill-warning text-warning"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Your Review
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
                maxLength={1000}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading || offersLoading}>
                {loading ? "Submitting..." : "Submit Review"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            No reviews yet. Be the first to review!
          </Card>
        ) : (
          reviews.map((review: any) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">
                    {review.reviewer?.full_name || "Anonymous"}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "fill-warning text-warning"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(review.created_at), "MMM d, yyyy")}
                </p>
              </div>
              {review.comment && (
                <p className="text-muted-foreground mt-2">{review.comment}</p>
              )}
              {review.seller_response && (
                <div className="mt-4 pl-4 border-l-2 border-muted">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                    <MessageSquare className="h-4 w-4" />
                    Response from professional
                  </div>
                  <p className="text-muted-foreground">
                    {review.seller_response}
                  </p>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsList;
