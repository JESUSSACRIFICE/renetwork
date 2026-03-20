"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Star,
  MapPin,
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import SearchFiltersSidebar from "@/components/search/SearchFiltersSidebar";
import SearchByNav from "@/components/search/SearchByNav";

const PER_PAGE = 32; // 4 columns × 8 rows

// Dynamically import AgencyMapView to avoid SSR issues with Leaflet
const AgencyMapView = dynamic(
  () => import("@/components/agencies/AgencyMapView"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-xl border bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    ),
  },
);

interface Agency {
  id: string;
  name: string;
  company_name?: string;
  tagline?: string;
  rating: number;
  reviews: number;
  location?: string;
  full_address?: string;
  logo_url?: string;
  avatar_url?: string;
  bio?: string;
  email?: string;
  phone?: string;
  employees?: string;
  founded_date?: string;
  categories?: string[];
  serviceAreas?: Array<{
    zip_code: string;
    radius_miles: number;
    lat?: number;
    lng?: number;
  }>;
}

const DUMMY_AGENCIES: Agency[] = Array.from({ length: 37 }, (_, i) => {
  const names = [
    "Apex Agency",
    "Summit Solutions",
    "Horizon Group",
    "Nexus Partners",
    "Vertex Ventures",
  ];
  const categories = [
    "Digital Marketing",
    "Lifestyle",
    "Development & IT",
    "Design & Creative",
  ];
  const locations = [
    "Chicago",
    "Houston",
    "Phoenix",
    "Miami",
    "Seattle",
    "Boston",
    "Denver",
  ];
  const zips = ["60601", "77001", "85001", "33139", "98101", "02101", "80202"];
  return {
    id: `dummy-${i + 1}`,
    name: names[i % names.length] + ` ${i + 1}`,
    tagline: "Professional office services",
    rating: 4 + (i % 10) / 10,
    reviews: (i % 20) + 1,
    location: locations[i % locations.length],
    full_address: `${zips[i % zips.length]}, USA`,
    categories: [categories[i % categories.length]],
    employees: "20-50",
    founded_date: "2010",
    serviceAreas: [
      {
        zip_code: zips[i % zips.length],
        radius_miles: 25,
        lat: 40 + i * 0.05,
        lng: -74 - i * 0.05,
      },
    ],
  };
});

function AgenciesSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [rawAgencies, setRawAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [hoveredAgencyId, setHoveredAgencyId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("default");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchAgencies();
  }, [searchParams]);

  const agencies = useMemo(() => {
    const list = [...rawAgencies];
    if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "reviews") {
      list.sort((a, b) => b.reviews - a.reviews);
    }
    const minCards = 40;
    if (list.length < minCards) {
      list.push(...DUMMY_AGENCIES.slice(0, minCards - list.length));
    }
    return list;
  }, [rawAgencies, sortBy]);

  const totalPages = Math.max(1, Math.ceil(agencies.length / PER_PAGE));
  const paginatedAgencies = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return agencies.slice(start, start + PER_PAGE);
  }, [agencies, page]);

  const handleSortChange = (v: string) => {
    setSortBy(v);
    setPage(1);
  };

  useEffect(() => setPage(1), [searchParams]);

  const handleAgencyClick = (agencyId: string) => {
    if (agencyId.startsWith("dummy-")) return;
    router.push(`/agencies/${agencyId}`);
  };

  const handleMarkerClick = (agencyId: string) => {
    setSelectedAgency(agencyId);
    const element = document.getElementById(`agency-${agencyId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const fetchAgencies = async () => {
    try {
      setLoading(true);

      // Query profiles as agencies (since we don't have an agencies table yet)
      let query = supabase.from("profiles").select(`
          *,
          reviews:reviews(rating)
        `);

      const { data, error } = await query;

      if (error) throw error;

      // Fetch service areas separately
      const profileIds = (data || []).map((p: any) => p.id);
      const { data: serviceAreasData } = await supabase
        .from("service_areas")
        .select("user_id, zip_code, radius_miles")
        .in("user_id", profileIds);

      const serviceAreasMap = new Map<string, any[]>();
      (serviceAreasData || []).forEach((sa: any) => {
        if (!serviceAreasMap.has(sa.user_id)) {
          serviceAreasMap.set(sa.user_id, []);
        }
        serviceAreasMap.get(sa.user_id)!.push({
          zip_code: sa.zip_code,
          radius_miles: sa.radius_miles,
        });
      });

      // Process agencies data
      const processedAgencies: Agency[] = (data || []).map(
        (profile: any, index: number) => {
          const reviews = profile.reviews || [];
          const avgRating =
            reviews.length > 0
              ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
                reviews.length
              : 0;

          const serviceAreas = serviceAreasMap.get(profile.id) || [];

          let location = "Los Angeles";
          let full_address = "";

          if (serviceAreas.length > 0) {
            const zipCode = serviceAreas[0].zip_code;
            const addressMap: Record<string, string> = {
              "10001": "350 5th Ave, New York, NY 10001, USA",
              "90001": "123 Main St, Los Angeles, CA 90001, USA",
              "90210": "456 Rodeo Dr, Beverly Hills, CA 90210, USA",
              "94102": "789 Market St, San Francisco, CA 94102, USA",
              "60601": "321 State St, Chicago, IL 60601, USA",
              "33139": "654 Ocean Dr, Miami Beach, FL 33139, USA",
            };

            full_address = addressMap[zipCode] || `${zipCode}, USA`;
            location =
              full_address.split(",")[0] +
              ", " +
              (full_address.split(",")[1] || "USA");
          }

          const categories = [
            "Digital Marketing",
            "Lifestyle",
            "Development & IT",
            "Design & Creative",
          ];
          const categoryIndex = index % categories.length;

          return {
            id: profile.id,
            name: profile.company_name || profile.full_name || "Agency",
            company_name: profile.company_name,
            tagline: profile.bio
              ? profile.bio.substring(0, 50) + "..."
              : "Professional office services",
            rating:
              parseFloat(avgRating.toFixed(1)) || 3.5 + Math.random() * 1.5,
            reviews: reviews.length || Math.floor(Math.random() * 10) + 1,
            location: location,
            full_address: full_address,
            logo_url: profile.avatar_url,
            avatar_url: profile.avatar_url,
            bio: profile.bio,
            email:
              profile.email ||
              `contact@${(profile.company_name || profile.full_name || "agency").toLowerCase().replace(/\s+/g, "")}.com`,
            phone: profile.phone || "+1 (555) 123-4567",
            employees: `${Math.floor(Math.random() * 50) + 10}-${Math.floor(Math.random() * 50) + 60}`,
            founded_date: "1990",
            categories: [categories[categoryIndex]],
            serviceAreas: serviceAreas.map((sa: any) => ({
              zip_code: sa.zip_code,
              radius_miles: sa.radius_miles,
              lat: sa.lat || undefined,
              lng: sa.lng || undefined,
            })),
          };
        },
      );

      let result =
        processedAgencies.length > 0
          ? processedAgencies
          : generateMockAgencies();
      setRawAgencies(result);
    } catch (error: any) {
      console.error("Error fetching agencies:", error);
      toast.error("Failed to load offices");
      setRawAgencies(generateMockAgencies());
    } finally {
      setLoading(false);
    }
  };

  const generateMockAgencies = (): Agency[] => {
    return [
      {
        id: "1",
        name: "MediaAZ",
        company_name: "MediaAZ",
        tagline: "Lorem Ipsum Dolar Sit Armat",
        rating: 4.0,
        reviews: 1,
        location: "Los Angeles",
        full_address: "123 Main St, Los Angeles, CA 90001, USA",
        categories: ["Digital Marketing", "Lifestyle"],
        employees: "30-50",
        founded_date: "1990",
        email: "mediaaz@spus.com",
        phone: "(+88)123-456-789",
        serviceAreas: [
          { zip_code: "90001", radius_miles: 25, lat: 34.0522, lng: -118.2437 },
        ],
      },
      {
        id: "2",
        name: "TechSolutions Inc",
        company_name: "TechSolutions Inc",
        tagline: "Innovative technology solutions",
        rating: 4.5,
        reviews: 5,
        location: "New York",
        full_address: "350 5th Ave, New York, NY 10001, USA",
        categories: ["Development & IT"],
        employees: "50-100",
        founded_date: "2010",
        email: "contact@techsolutions.com",
        phone: "+1 (555) 234-5678",
        serviceAreas: [
          { zip_code: "10001", radius_miles: 25, lat: 40.7505, lng: -73.9934 },
        ],
      },
      {
        id: "3",
        name: "Creative Design Studio",
        company_name: "Creative Design Studio",
        tagline: "Bringing your vision to life",
        rating: 4.8,
        reviews: 12,
        location: "San Francisco",
        full_address: "789 Market St, San Francisco, CA 94102, USA",
        categories: ["Design & Creative"],
        employees: "20-40",
        founded_date: "2015",
        email: "hello@creativedesign.com",
        phone: "+1 (555) 345-6789",
        serviceAreas: [
          { zip_code: "94102", radius_miles: 25, lat: 37.7849, lng: -122.4094 },
        ],
      },
    ];
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
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                </SelectContent>
              </Select>
            }
          />

          {/* Main Content: 4x8 grid left, map right (50/50) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-220px)]">
            {/* Left: 4-column agency grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 overflow-y-auto overflow-x-hidden pr-2 content-start">
              {loading ? (
                <div className="text-center py-12 col-span-full">
                  <p className="text-muted-foreground">Loading offices...</p>
                </div>
              ) : agencies.length === 0 ? (
                <div className="text-center py-12 col-span-full">
                  <p className="text-muted-foreground">No offices found</p>
                </div>
              ) : (
                paginatedAgencies.map((agency) => (
                  <Card
                    key={agency.id}
                    id={`agency-${agency.id}`}
                    className={`cursor-pointer transition-all hover:shadow-lg overflow-hidden min-w-0 ${
                      selectedAgency === agency.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => handleAgencyClick(agency.id)}
                    onMouseEnter={() =>
                      !agency.id.startsWith("dummy-") &&
                      setHoveredAgencyId(agency.id)
                    }
                    onMouseLeave={() => setHoveredAgencyId(null)}
                  >
                    <CardContent className="p-3 sm:p-4 overflow-hidden">
                      <div className="flex gap-2 min-w-0">
                        <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-full border-2 border-primary/20">
                          <AvatarImage
                            src={agency.logo_url || agency.avatar_url}
                            alt={agency.name}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {(agency.name || "A").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="font-semibold text-sm truncate">
                              {agency.name}
                            </h3>
                            <span className="flex items-center gap-0.5 shrink-0 text-xs">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {agency.rating.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {agency.tagline || "Professional office"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground min-w-0">
                        <span className="flex items-center gap-0.5 min-w-0 truncate">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            {agency.location || agency.full_address || "—"}
                          </span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {agency.categories?.slice(0, 2).map((cat, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20"
                          >
                            {cat}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        <Button
                          size="sm"
                          className="h-7 text-xs px-2 bg-primary hover:bg-primary/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAgencyClick(agency.id);
                          }}
                        >
                          View
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              {/* Pagination */}
              {!loading && agencies.length > 0 && totalPages > 1 && (
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
                    <span className="px-2 text-muted-foreground">…</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>

            {/* Right: Map (always visible) */}
            <div className="sticky top-6 h-[calc(100vh-220px)] min-h-[400px] rounded-xl border overflow-hidden bg-muted">
              <AgencyMapView
                agencies={agencies.filter((a) => !a.id.startsWith("dummy-"))}
                onMarkerClick={handleMarkerClick}
                hoveredAgencyId={hoveredAgencyId}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function AgenciesSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <AgenciesSearchContent />
    </Suspense>
  );
}
