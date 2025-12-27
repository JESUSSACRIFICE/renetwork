import { useState } from "react";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface ReviewsListProps {
  profileId: string;
  reviews: any[];
  onReviewAdded: () => void;
}

const ReviewsList = ({ profileId, reviews, onReviewAdded }: ReviewsListProps) => {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to leave a review");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("reviews").insert({
        profile_id: profileId,
        reviewer_id: user.id,
        rating,
        comment: comment.trim(),
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("You've already reviewed this professional");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Review submitted successfully!");
      setComment("");
      setRating(5);
      setShowForm(false);
      onReviewAdded();
    } catch (error: any) {
      toast.error("Failed to submit review");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!showForm && (
        <Button onClick={() => setShowForm(true)} variant="outline" className="w-full">
          Write a Review
        </Button>
      )}

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Write Your Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block text-sm font-medium mb-2">Your Review</label>
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
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Review"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
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
                  <p className="font-semibold">{review.reviewer?.full_name || "Anonymous"}</p>
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
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsList;
