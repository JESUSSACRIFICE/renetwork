"use client";

import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  useReceivedReviews,
  useUpdateSellerResponse,
  type ReceivedReview,
} from "@/hooks/use-reviews";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ReviewsPage() {
  const { user } = useAuth();
  const profileId = user?.id ?? null;
  const { data: reviews = [], isLoading } = useReceivedReviews(profileId);
  const updateResponse = useUpdateSellerResponse(profileId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  const handleRespond = (review: ReceivedReview) => {
    setEditingId(review.id);
    setResponseText(review.seller_response ?? "");
  };

  const handleSaveResponse = async (reviewId: string) => {
    if (!responseText.trim()) {
      toast.error("Please enter a response");
      return;
    }
    try {
      await updateResponse.mutateAsync({ reviewId, seller_response: responseText.trim() });
      toast.success("Response saved");
      setEditingId(null);
      setResponseText("");
    } catch {
      toast.error("Failed to save response");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setResponseText("");
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Reviews</h1>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading reviews...
          </CardContent>
        </Card>
      ) : reviews.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No reviews yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Reviews from clients who completed orders with you will appear
              here. Build your reputation by delivering great work!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="h-6 w-6 fill-warning text-warning" />
                  <span className="text-2xl font-bold">{avgRating}</span>
                </div>
                <span className="text-muted-foreground">
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </span>
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4 mb-2">
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
                    <p className="text-sm text-muted-foreground shrink-0">
                      {format(new Date(review.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  {review.comment && (
                    <p className="text-muted-foreground mt-2">{review.comment}</p>
                  )}

                  {editingId === review.id ? (
                    <div className="mt-4 space-y-2">
                      <Textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write your response..."
                        rows={3}
                        maxLength={1000}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveResponse(review.id)}
                          disabled={updateResponse.isPending || !responseText.trim()}
                        >
                          {updateResponse.isPending ? "Saving..." : "Save Response"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={updateResponse.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : review.seller_response ? (
                    <div className="mt-4 pl-4 border-l-2 border-muted">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                        <MessageSquare className="h-4 w-4" />
                        Your response
                      </div>
                      <p className="text-muted-foreground">
                        {review.seller_response}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2"
                        onClick={() => handleRespond(review)}
                      >
                        Edit response
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-4"
                      onClick={() => handleRespond(review)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Respond to review
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
