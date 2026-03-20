"use client";

import { useMemo, useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Star,
  MapPin,
  DollarSign,
  ArrowRight,
  Filter,
  ChevronLeft,
  ChevronRight,
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

const DUMMY_PROFILES = [
  {
    id: "dummy-1",
    full_name: "Sarah Mitchell",
    title: "Real Estate Agent",
    rating: 4.8,
    location: "New York, NY",
    hourly_rate: 85,
    bio: "Top-rated agent specializing in Manhattan condos.",
    skills: ["Market Analysis", "Negotiation"],
  },
  {
    id: "dummy-2",
    full_name: "James Chen",
    title: "Property Consultant",
    rating: 4.6,
    location: "Los Angeles, CA",
    hourly_rate: 120,
    bio: "Commercial real estate expert with 15+ years.",
    skills: ["Property Valuation", "Contracts"],
  },
  {
    id: "dummy-3",
    full_name: "Maria Garcia",
    title: "Broker",
    rating: 4.9,
    location: "Chicago, IL",
    hourly_rate: 95,
    bio: "Full-service brokerage for residential & commercial.",
    skills: ["Client Relations", "Listing"],
  },
  {
    id: "dummy-4",
    full_name: "David Thompson",
    title: "Appraiser",
    rating: 4.5,
    location: "Houston, TX",
    hourly_rate: 75,
    bio: "Licensed appraiser for residential properties.",
    skills: ["Property Valuation", "Market Analysis"],
  },
  {
    id: "dummy-5",
    full_name: "Emily Roberts",
    title: "Architect",
    rating: 4.7,
    location: "Phoenix, AZ",
    hourly_rate: 150,
    bio: "Sustainable design and renovation specialist.",
    skills: ["Design", "Contracts"],
  },
  {
    id: "dummy-6",
    full_name: "Michael Brown",
    title: "Investor",
    rating: 4.4,
    location: "Miami, FL",
    hourly_rate: 0,
    bio: "Active investor seeking JV opportunities.",
    skills: ["Negotiation", "Market Analysis"],
  },
  {
    id: "dummy-7",
    full_name: "Lisa Anderson",
    title: "Real Estate Agent",
    rating: 4.8,
    location: "San Francisco, CA",
    hourly_rate: 110,
    bio: "Bay Area specialist in luxury homes.",
    skills: ["Listing", "Client Relations"],
  },
  {
    id: "dummy-8",
    full_name: "Robert Wilson",
    title: "Property Consultant",
    rating: 4.6,
    location: "Seattle, WA",
    hourly_rate: 90,
    bio: "Multi-family and commercial focus.",
    skills: ["Property Valuation", "Negotiation"],
  },
  {
    id: "dummy-9",
    full_name: "Jennifer Lee",
    title: "Broker",
    rating: 4.7,
    location: "Austin, TX",
    hourly_rate: 100,
    bio: "Growing market specialist.",
    skills: ["Market Analysis", "Contracts"],
  },
  {
    id: "dummy-10",
    full_name: "Christopher Davis",
    title: "Appraiser",
    rating: 4.5,
    location: "Denver, CO",
    hourly_rate: 80,
    bio: "Commercial and residential valuations.",
    skills: ["Property Valuation", "Client Relations"],
  },
  {
    id: "dummy-11",
    full_name: "Amanda Foster",
    title: "Architect",
    rating: 4.9,
    location: "Boston, MA",
    hourly_rate: 140,
    bio: "Historic preservation and modern design.",
    skills: ["Design", "Listing"],
  },
  {
    id: "dummy-12",
    full_name: "Daniel Martinez",
    title: "Investor",
    rating: 4.3,
    location: "Atlanta, GA",
    hourly_rate: 0,
    bio: "Fix-and-flip and rental portfolio builder.",
    skills: ["Negotiation", "Property Valuation"],
  },
  {
    id: "dummy-13",
    full_name: "Rachel Green",
    title: "Real Estate Agent",
    rating: 4.7,
    location: "Nashville, TN",
    hourly_rate: 85,
    bio: "Residential specialist in growing markets.",
    skills: ["Client Relations", "Market Analysis"],
  },
  {
    id: "dummy-14",
    full_name: "Kevin Park",
    title: "Property Consultant",
    rating: 4.6,
    location: "Portland, OR",
    hourly_rate: 95,
    bio: "Sustainable and eco-friendly properties.",
    skills: ["Contracts", "Negotiation"],
  },
  {
    id: "dummy-15",
    full_name: "Nicole Taylor",
    title: "Broker",
    rating: 4.8,
    location: "Charlotte, NC",
    hourly_rate: 88,
    bio: "First-time buyer and relocation expert.",
    skills: ["Listing", "Client Relations"],
  },
  {
    id: "dummy-16",
    full_name: "Andrew Clark",
    title: "Appraiser",
    rating: 4.5,
    location: "Minneapolis, MN",
    hourly_rate: 72,
    bio: "Residential and land appraisals.",
    skills: ["Property Valuation", "Market Analysis"],
  },
  {
    id: "dummy-17",
    full_name: "Stephanie Wright",
    title: "Real Estate Agent",
    rating: 4.7,
    location: "Tampa, FL",
    hourly_rate: 82,
    bio: "Waterfront and coastal property specialist.",
    skills: ["Listing", "Negotiation"],
  },
  {
    id: "dummy-18",
    full_name: "Brandon Scott",
    title: "Property Consultant",
    rating: 4.6,
    location: "Dallas, TX",
    hourly_rate: 98,
    bio: "DFW metroplex commercial expert.",
    skills: ["Market Analysis", "Contracts"],
  },
  {
    id: "dummy-19",
    full_name: "Olivia Harris",
    title: "Broker",
    rating: 4.8,
    location: "San Diego, CA",
    hourly_rate: 105,
    bio: "Luxury and vacation home specialist.",
    skills: ["Client Relations", "Property Valuation"],
  },
  {
    id: "dummy-20",
    full_name: "Nathan Brooks",
    title: "Appraiser",
    rating: 4.5,
    location: "Philadelphia, PA",
    hourly_rate: 78,
    bio: "Residential and multi-family valuations.",
    skills: ["Property Valuation", "Negotiation"],
  },
  {
    id: "dummy-21",
    full_name: "Sophia Turner",
    title: "Architect",
    rating: 4.9,
    location: "Washington, DC",
    hourly_rate: 155,
    bio: "Government and institutional projects.",
    skills: ["Design", "Contracts"],
  },
  {
    id: "dummy-22",
    full_name: "Ethan Phillips",
    title: "Investor",
    rating: 4.4,
    location: "Las Vegas, NV",
    hourly_rate: 0,
    bio: "Desert market and new construction.",
    skills: ["Negotiation", "Market Analysis"],
  },
  {
    id: "dummy-23",
    full_name: "Isabella Moore",
    title: "Real Estate Agent",
    rating: 4.7,
    location: "Orlando, FL",
    hourly_rate: 80,
    bio: "Theme park area and investment properties.",
    skills: ["Listing", "Client Relations"],
  },
  {
    id: "dummy-24",
    full_name: "Mason Bell",
    title: "Property Consultant",
    rating: 4.6,
    location: "San Antonio, TX",
    hourly_rate: 88,
    bio: "Military relocation and VA loans.",
    skills: ["Contracts", "Property Valuation"],
  },
  {
    id: "dummy-25",
    full_name: "Ava Murphy",
    title: "Broker",
    rating: 4.8,
    location: "Columbus, OH",
    hourly_rate: 85,
    bio: "Midwest residential and farmland.",
    skills: ["Market Analysis", "Listing"],
  },
  {
    id: "dummy-26",
    full_name: "Liam Rivera",
    title: "Appraiser",
    rating: 4.5,
    location: "Indianapolis, IN",
    hourly_rate: 70,
    bio: "Residential and commercial appraisals.",
    skills: ["Property Valuation", "Client Relations"],
  },
  {
    id: "dummy-27",
    full_name: "Mia Cooper",
    title: "Architect",
    rating: 4.7,
    location: "Salt Lake City, UT",
    hourly_rate: 130,
    bio: "Mountain and sustainable design.",
    skills: ["Design", "Negotiation"],
  },
  {
    id: "dummy-28",
    full_name: "Noah Richardson",
    title: "Investor",
    rating: 4.3,
    location: "Raleigh, NC",
    hourly_rate: 0,
    bio: "Tech corridor and growth markets.",
    skills: ["Market Analysis", "Property Valuation"],
  },
  {
    id: "dummy-29",
    full_name: "Emma Cox",
    title: "Real Estate Agent",
    rating: 4.8,
    location: "Kansas City, MO",
    hourly_rate: 75,
    bio: "Heartland residential specialist.",
    skills: ["Client Relations", "Listing"],
  },
  {
    id: "dummy-30",
    full_name: "Lucas Howard",
    title: "Property Consultant",
    rating: 4.6,
    location: "Milwaukee, WI",
    hourly_rate: 90,
    bio: "Lakefront and urban redevelopment.",
    skills: ["Negotiation", "Contracts"],
  },
  {
    id: "dummy-31",
    full_name: "Charlotte Ward",
    title: "Broker",
    rating: 4.7,
    location: "Jacksonville, FL",
    hourly_rate: 82,
    bio: "First coast and beach communities.",
    skills: ["Listing", "Market Analysis"],
  },
  {
    id: "dummy-32",
    full_name: "Benjamin Torres",
    title: "Appraiser",
    rating: 4.5,
    location: "Oklahoma City, OK",
    hourly_rate: 68,
    bio: "Energy sector and land valuations.",
    skills: ["Property Valuation", "Contracts"],
  },
];

// Dynamically import ProfileMapView to avoid SSR issues with Leaflet
const PER_PAGE = 32; // 4 columns × 8 rows

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
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      psp: searchParams.get("psp") ?? undefined,
      agentTypes: searchParams.get("agentTypes") ?? undefined,
      realEstateTypes: searchParams.get("realEstateTypes") ?? undefined,
      crowdfundingTypes: searchParams.get("crowdfundingTypes") ?? undefined,
      flooringIndoorTypes: searchParams.get("flooringIndoorTypes") ?? undefined,
      flooringOutdoorTypes:
        searchParams.get("flooringOutdoorTypes") ?? undefined,
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
    const minCards = 40;
    if (list.length < minCards) {
      const needed = minCards - list.length;
      list.push(
        ...DUMMY_PROFILES.slice(0, needed).map((d) => ({
          ...d,
          full_address: d.location,
          reviews: Math.floor(Math.random() * 50) + 5,
        })),
      );
    }
    return list;
  }, [rawProfiles, sortBy]);

  const totalPages = Math.max(1, Math.ceil(profiles.length / PER_PAGE));
  const paginatedProfiles = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return profiles.slice(start, start + PER_PAGE);
  }, [profiles, page]);

  // Reset to page 1 when sort or filters change
  const handleSortChange = (v: string) => {
    setSortBy(v);
    setPage(1);
  };
  useEffect(() => setPage(1), [searchParams]);

  const handleProfileClick = (profileId: string) => {
    if (profileId.startsWith("dummy-")) return;
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
    const element = document.getElementById(`profile-${profileId}`);
    if (element)
      element.scrollIntoView({ behavior: "smooth", block: "center" });
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
          <SearchByNav
            filter={
              <Button
                variant="outline"
                className="h-10 w-[180px] justify-center bg-primary/10 text-primary border-primary/20"
                onClick={() => setIsFiltersOpen(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            }
            sort={
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="h-10 w-[180px]">
                  <SelectValue placeholder="Sort by (Default)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            }
          />

          {/* Main Content: 4x8 grid left, map right (50/50) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-220px)]">
            {/* Left: 4-column profile grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 overflow-y-auto overflow-x-hidden pr-2 content-start">
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
                paginatedProfiles.map((profile, idx) => {
                  const offsetIdx = (page - 1) * PER_PAGE + idx;
                  const fallbacks = {
                    title: [
                      "Real Estate Agent",
                      "Property Consultant",
                      "Broker",
                      "Appraiser",
                      "Architect",
                      "Investor",
                    ][offsetIdx % 6],
                    location: [
                      "New York, NY",
                      "Los Angeles, CA",
                      "Chicago, IL",
                      "Houston, TX",
                      "Phoenix, AZ",
                      "Miami, FL",
                    ][offsetIdx % 6],
                    bio: "Experienced professional with local market expertise. Specializing in residential and commercial properties.",
                    skills: [
                      "Market Analysis",
                      "Negotiation",
                      "Property Valuation",
                      "Contracts",
                      "Client Relations",
                      "Listing",
                    ].slice(offsetIdx % 4, (offsetIdx % 4) + 2),
                  };
                  return (
                    <Card
                      key={profile.id}
                      id={`profile-${profile.id}`}
                      className={`cursor-pointer transition-all hover:shadow-lg overflow-hidden min-w-0 ${
                        selectedProfile === profile.id
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      onClick={() => handleProfileClick(profile.id)}
                      onMouseEnter={() =>
                        !profile.id.startsWith("dummy-") &&
                        setHoveredProfileId(profile.id)
                      }
                      onMouseLeave={() => setHoveredProfileId(null)}
                    >
                      <CardContent className="p-3 sm:p-4 overflow-hidden">
                        <div className="flex gap-2 min-w-0">
                          <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                            <AvatarImage
                              src={profile.avatar_url}
                              alt={profile.full_name}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {profile.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h3 className="font-semibold text-sm truncate">
                                {profile.full_name || "Professional"}
                              </h3>
                              <span className="flex items-center gap-0.5 shrink-0 text-xs">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {profile.rating?.toFixed(1) ?? "4.5"}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {profile.title || fallbacks.title}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground min-w-0">
                          <span className="flex items-center gap-0.5 min-w-0 truncate">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {profile.full_address ||
                                profile.location ||
                                fallbacks.location}
                            </span>
                          </span>
                          {profile.hourly_rate ? (
                            <span className="flex items-center gap-0.5 shrink-0">
                              <DollarSign className="h-3 w-3" />$
                              {profile.hourly_rate - 5}-$
                              {profile.hourly_rate + 5}
                              /hr
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5 shrink-0">
                              <DollarSign className="h-3 w-3" />
                              $50-150/hr
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1 break-words overflow-hidden">
                          {profile.bio || fallbacks.bio}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(profile.skills?.length
                            ? profile.skills
                            : fallbacks.skills
                          )
                            .slice(0, 2)
                            .map((skill, skillIdx) => (
                              <Badge
                                key={skillIdx}
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20"
                              >
                                {skill}
                              </Badge>
                            ))}
                        </div>
                        <div className="flex gap-1.5 mt-2">
                          <Button
                            size="sm"
                            className="h-7 text-xs px-2 bg-primary hover:bg-primary/90"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProfileClick(profile.id);
                            }}
                          >
                            View
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
              {/* Pagination */}
              {!isLoading &&
                !isError &&
                profiles.length > 0 &&
                totalPages > 1 && (
                  <div className="col-span-full flex items-center justify-center gap-2 py-4 mt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === totalPages ||
                            Math.abs(p - page) <= 2,
                        )
                        .map((p, i, arr) => (
                          <span key={p}>
                            {i > 0 && arr[i - 1] !== p - 1 && (
                              <span className="px-2 text-muted-foreground">
                                …
                              </span>
                            )}
                            <Button
                              variant={page === p ? "default" : "outline"}
                              size="sm"
                              className="w-9 h-9 p-0"
                              onClick={() => setPage(p)}
                            >
                              {p}
                            </Button>
                          </span>
                        ))}
                      <span>
                        <span className="px-2 text-muted-foreground">…</span>
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page >= totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
            </div>

            {/* Right: Map (always visible, uncollapsible) */}
            <div className="sticky top-6 h-[calc(100vh-220px)] min-h-[400px] rounded-xl border overflow-hidden bg-muted">
              <ProfileMapView
                profiles={profiles.filter((p) => !p.id.startsWith("dummy-"))}
                onMarkerClick={handleMarkerClick}
                hoveredProfileId={hoveredProfileId}
              />
            </div>
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
