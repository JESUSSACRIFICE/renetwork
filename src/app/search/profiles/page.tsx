"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Star,
  MapPin,
  DollarSign,
  ArrowRight,
  Filter,
  Map,
  X,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import SearchFiltersSidebar from "@/components/search/SearchFiltersSidebar";
import SearchByNav from "@/components/search/SearchByNav";
import { useSearchProfiles } from "@/hooks/use-professional-profiles";

// Dynamically import ProfileMapView to avoid SSR issues with Leaflet
const ProfileMapView = dynamic(
  () => import("@/components/profiles/ProfileMapView"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-xl border bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    ),
  },
);

function ProfilesSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [hoveredProfileId, setHoveredProfileId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("default");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const filters = useMemo(
    () => ({
      psp: searchParams.get("psp") ?? undefined,
      agentTypes: searchParams.get("agentTypes") ?? undefined,
      realEstateTypes: searchParams.get("realEstateTypes") ?? undefined,
      crowdfundingTypes: searchParams.get("crowdfundingTypes") ?? undefined,
      flooringIndoorTypes: searchParams.get("flooringIndoorTypes") ?? undefined,
      flooringOutdoorTypes: searchParams.get("flooringOutdoorTypes") ?? undefined,
      fields: searchParams.get("fields") ?? undefined,
      price: searchParams.get("price") ?? undefined,
      willingToTrain: searchParams.get("willingToTrain") ?? undefined,
    }),
    [searchParams],
  );

  const {
    data: rawProfiles = [],
    isLoading,
    isError,
  } = useSearchProfiles(filters);

  const profiles = useMemo(() => {
    const list = [...rawProfiles];
    if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "price-low") {
      list.sort((a, b) => (a.hourly_rate ?? 0) - (b.hourly_rate ?? 0));
    } else if (sortBy === "price-high") {
      list.sort((a, b) => (b.hourly_rate ?? 0) - (a.hourly_rate ?? 0));
    }
    return list;
  }, [rawProfiles, sortBy]);

  const handleProfileClick = (profileId: string) => {
    router.push(`/profiles/${profileId}`);
  };

  const handleMarkerClick = (profileId: string) => {
    setSelectedProfile(profileId);
    const element = document.getElementById(`profile-${profileId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleViewOnMap = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    setSelectedProfile(profileId);
    setShowMap(true);
  };

  const handleApplyFilters = (filters: any) => {
    // Apply filters logic here
    console.log("Applied filters:", filters);
    toast.success("Filters applied");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <SearchFiltersSidebar
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
      <main className="flex-1">
        <div className="container py-6">
          <SearchByNav />
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                Showing all {profiles.length} results
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20"
                onClick={() => setIsFiltersOpen(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by (Default)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Main Content: Profiles List + Map */}
          <div
            className={`grid gap-6 ${
              showMap ? "grid-cols-1 lg:grid-cols-[1fr,2fr]" : "grid-cols-1"
            }`}
          >
            {/* Left: Profile Cards grid - vertical when map is shown */}
            <div
              className={`grid gap-4 overflow-y-auto overflow-x-hidden pr-2 ${
                showMap
                  ? "grid-cols-1"
                  : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              }`}
            >
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading profiles...</p>
                </div>
              ) : isError ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Failed to load profiles
                  </p>
                </div>
              ) : profiles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No profiles found</p>
                </div>
              ) : (
                profiles.map((profile) => (
                  <Card
                    key={profile.id}
                    id={`profile-${profile.id}`}
                    className={`cursor-pointer transition-all hover:shadow-lg overflow-hidden min-w-0 ${
                      selectedProfile === profile.id
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                    onClick={() => handleProfileClick(profile.id)}
                    onMouseEnter={() => setHoveredProfileId(profile.id)}
                    onMouseLeave={() => setHoveredProfileId(null)}
                  >
                    <CardContent className="p-6 overflow-hidden">
                      <div className="flex gap-4 min-w-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2 min-w-0">
                            <div className="flex items-center justify-start gap-2 min-w-0">
                              <Avatar className="h-16 w-16 shrink-0">
                                <AvatarImage
                                  src={profile.avatar_url}
                                  alt={profile.full_name}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {profile.full_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-lg truncate">
                                  {profile.full_name}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {profile.title}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">
                                {profile.rating}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground min-w-0">
                            <div className="flex items-center gap-1 min-w-0 truncate">
                              <MapPin className="h-4 w-4 shrink-0" />
                              <span className="truncate">
                                {profile.full_address || profile.location}
                              </span>
                            </div>
                            {profile.hourly_rate && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />$
                                {profile.hourly_rate - 5} - $
                                {profile.hourly_rate + 5}/hr
                              </div>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 break-words overflow-hidden">
                            {profile.bio ||
                              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                          </p>

                          <div className="min-w-0 gap-3">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {profile.skills?.slice(0, 4).map((skill, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="bg-primary/10 text-primary border-primary/20 shrink-0 max-w-full truncate"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                className="hidden md:inline-flex border-primary/30"
                                onClick={(e) => handleViewOnMap(e, profile.id)}
                              >
                                <Map className="h-4 w-4 mr-1" />
                                View on Map
                              </Button>
                              <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProfileClick(profile.id);
                                }}
                              >
                                View Profile
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Right: Map (only when showMap is true) */}
            {showMap && (
              <div className="sticky top-6 h-[calc(100vh-150px)]">
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 z-10 h-8 w-8"
                  onClick={() => setShowMap(false)}
                  aria-label="Close map"
                >
                  <X className="h-4 w-4" />
                </Button>
                <ProfileMapView
                  profiles={profiles}
                  onMarkerClick={handleMarkerClick}
                  hoveredProfileId={hoveredProfileId}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ProfilesSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <ProfilesSearchContent />
    </Suspense>
  );
}
