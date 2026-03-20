"use client";

import Link from "next/link";
import { Users, MapPin, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useSuggestedPartners,
  type SuggestedPartner,
} from "@/hooks/use-suggested-partners";
import { useProfile } from "@/hooks/use-professional-profiles";
import { useAuth } from "@/hooks/use-auth";

function PartnerCard({ partner }: { partner: SuggestedPartner }) {
  return (
    <Link
      href={`/profiles/${partner.id}`}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors -mx-2"
    >
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={partner.avatar_url ?? undefined} />
        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
          {partner.full_name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {partner.full_name}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {partner.psp_labels.length > 0
            ? partner.psp_labels.slice(0, 2).join(", ")
            : partner.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {partner.reviews > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-gray-500">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {partner.rating} ({partner.reviews})
            </span>
          )}
          {partner.location && (
            <span className="flex items-center gap-0.5 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              {partner.location}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function SuggestedPartners() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id ?? null);
  const userZipCode =
    profile?.service_areas?.length > 0
      ? profile.service_areas[0].zip_code
      : null;
  const userPspLabels = profile?.psp_labels ?? [];

  const { data: partners = [], isLoading } = useSuggestedPartners(
    user?.id ?? null,
    userZipCode,
    userPspLabels,
    8
  );

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Suggested for you
        </CardTitle>
        {partners.length > 0 && (
          <Link
            href="/search/profiles"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 animate-pulse"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1 min-w-0">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-32 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : partners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No suggestions yet</p>
            <p className="text-xs mt-1 text-gray-400">
              Complete your profile with location and specialties to get matched
            </p>
            <Link
              href="/dashboard/settings"
              className="inline-block mt-2 text-sm text-primary hover:underline"
            >
              Update profile
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {partners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
