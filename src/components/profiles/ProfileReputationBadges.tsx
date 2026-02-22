"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Award, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ProfileReputationBadges({ profileId }: { profileId: string }) {
  const { data: badges } = useQuery({
    queryKey: ["profile", "reputation", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_reputation_badges")
        .select("*")
        .eq("profile_id", profileId)
        .order("awarded_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        badge_type: string;
        title: string;
        description: string | null;
      }>;
    },
    enabled: !!profileId,
  });

  if (!badges || badges.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Award className="h-6 w-6 text-amber-500" />
          Reputation & Badges
        </h2>
        <div className="flex flex-wrap gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-2 rounded-lg border bg-amber-50/50 px-4 py-2"
            >
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <div>
                <p className="font-medium text-sm">{b.title}</p>
                {b.description && (
                  <p className="text-xs text-muted-foreground">{b.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
