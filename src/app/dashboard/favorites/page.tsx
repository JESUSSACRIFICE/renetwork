"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Star, MapPin, Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function DashboardFavorites() {
  const router = useRouter();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchFavorites = async () => {
      try {
        const { data, error } = await supabase
          .from("favorites")
          .select(
            `
            id,
            created_at,
            profile:profile_id (
              id,
              full_name,
              avatar_url,
              hourly_rate,
              referral_fee_percentage,
              user_roles(role),
              service_areas(zip_code),
              reviews(rating)
            )
          `,
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        const list = data || [];
        const profileIds = list.map((f: any) => f.profile?.id).filter(Boolean);
        let companyByUserId: Record<string, string | null> = {};
        if (profileIds.length > 0) {
          const { data: bizData } = await supabase
            .from("business_info")
            .select("user_id, company_name")
            .in("user_id", profileIds);
          (bizData || []).forEach((b: any) => {
            companyByUserId[b.user_id] = b.company_name;
          });
        }
        setFavorites(
          list.map((f: any) => ({
            ...f,
            profile: f.profile
              ? {
                  ...f.profile,
                  company_name: companyByUserId[f.profile.id] ?? null,
                }
              : f.profile,
          })),
        );
      } catch (error: any) {
        toast.error("Failed to load favorites");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [user?.id]);

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", favoriteId);

      if (error) throw error;

      setFavorites(favorites.filter((f) => f.id !== favoriteId));
      toast.success("Removed from favorites");
    } catch (error: any) {
      toast.error("Failed to remove favorite");
    }
  };

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const calculateAvgRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return 0;
    return (
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    ).toFixed(1);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Favorite Professionals</h1>
        <p className="text-muted-foreground">
          Your saved real estate experts
        </p>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">
          Loading favorites...
        </p>
      ) : favorites.length === 0 ? (
        <Card className="p-12 text-center">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No favorites yet</p>
          <Button onClick={() => router.push("/search/services")}>
            Browse Professionals
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => {
            const prof = favorite.profile;
            const avgRating = calculateAvgRating(prof.reviews || []);

            return (
              <Card
                key={favorite.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <Link href={`/profile/${prof.id}`} className="flex-1">
                    <h3 className="font-bold text-lg hover:text-primary transition-colors line-clamp-1">
                      {prof.company_name || prof.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {prof.full_name}
                    </p>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFavorite(favorite.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {prof.user_roles
                    ?.slice(0, 2)
                    .map((r: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {formatRole(r.role)}
                      </span>
                    ))}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span>{avgRating}</span>
                    <span className="text-muted-foreground">
                      ({prof.reviews?.length || 0} reviews)
                    </span>
                  </div>

                  {prof.service_areas?.[0] && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {prof.service_areas[0].zip_code}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground mb-1">
                    Starting at
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {prof.hourly_rate
                      ? `$${prof.hourly_rate}/hr`
                      : prof.referral_fee_percentage
                        ? `${prof.referral_fee_percentage}%`
                        : "Contact for quote"}
                  </p>
                </div>

                <Link href={`/profile/${prof.id}`}>
                  <Button className="w-full mt-4">View Profile</Button>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
