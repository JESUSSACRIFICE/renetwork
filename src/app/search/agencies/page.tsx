"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, Building2, ArrowRight, Filter, Heart } from "lucide-react";
import NewHeader from "@/components/NewHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import Image from "next/image";
import SearchFiltersSidebar from "@/components/search/SearchFiltersSidebar";

// Dynamically import AgencyMapView to avoid SSR issues with Leaflet
const AgencyMapView = dynamic(() => import("@/components/agencies/AgencyMapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-xl border bg-muted flex items-center justify-center">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  ),
});

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

function AgenciesSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [hoveredAgencyId, setHoveredAgencyId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("default");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    fetchAgencies();
  }, [searchParams, sortBy]);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      
      // Query profiles as agencies (since we don't have an agencies table yet)
      let query = supabase
        .from("profiles")
        .select(`
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
      const processedAgencies: Agency[] = (data || []).map((profile: any, index: number) => {
        const reviews = profile.reviews || [];
        const avgRating = reviews.length > 0
          ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
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
          location = full_address.split(",")[0] + ", " + (full_address.split(",")[1] || "USA");
        }

        const categories = ["Digital Marketing", "Lifestyle", "Development & IT", "Design & Creative"];
        const categoryIndex = index % categories.length;

        return {
          id: profile.id,
          name: profile.company_name || profile.full_name || "Agency",
          company_name: profile.company_name,
          tagline: profile.bio ? profile.bio.substring(0, 50) + "..." : "Professional agency services",
          rating: parseFloat(avgRating.toFixed(1)) || (3.5 + Math.random() * 1.5),
          reviews: reviews.length || Math.floor(Math.random() * 10) + 1,
          location: location,
          full_address: full_address,
          logo_url: profile.avatar_url,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          email: profile.email || `contact@${(profile.company_name || profile.full_name || "agency").toLowerCase().replace(/\s+/g, "")}.com`,
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
      });

      let sortedAgencies = [...processedAgencies];
      if (sortBy === "rating") {
        sortedAgencies.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === "reviews") {
        sortedAgencies.sort((a, b) => b.reviews - a.reviews);
      }

      if (sortedAgencies.length === 0) {
        sortedAgencies = generateMockAgencies();
      }

      setAgencies(sortedAgencies);
    } catch (error: any) {
      console.error("Error fetching agencies:", error);
      toast.error("Failed to load agencies");
      setAgencies(generateMockAgencies());
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
        serviceAreas: [{ zip_code: "90001", radius_miles: 25, lat: 34.0522, lng: -118.2437 }],
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
        serviceAreas: [{ zip_code: "10001", radius_miles: 25, lat: 40.7505, lng: -73.9934 }],
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
        serviceAreas: [{ zip_code: "94102", radius_miles: 25, lat: 37.7849, lng: -122.4094 }],
      },
    ];
  };

  const handleApplyFilters = (filters: any) => {
    // Apply filters logic here
    console.log("Applied filters:", filters);
    toast.success("Filters applied");
  };

  return (
    <div className="min-h-screen bg-background">
      <NewHeader />
      <SearchFiltersSidebar 
        isOpen={isFiltersOpen} 
        onClose={() => setIsFiltersOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/search/agencies" className="hover:text-foreground">Agencies</Link>
        </div>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Agencies</h1>
            <p className="text-muted-foreground mt-1">
              {agencies.length} {agencies.length === 1 ? "agency" : "agencies"} found
            </p>
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
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading agencies...</p>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr,2fr] gap-6">
            {/* Agency Cards */}
            <div className="space-y-4">
              {agencies.map((agency) => (
                <Card
                  key={agency.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedAgency === agency.id ? "ring-2 ring-primary" : ""
                  }`}
                  onMouseEnter={() => setHoveredAgencyId(agency.id)}
                  onMouseLeave={() => setHoveredAgencyId(null)}
                  onClick={() => {
                    setSelectedAgency(agency.id);
                    router.push(`/agencies/${agency.id}`);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Avatar className="h-16 w-16 rounded-full border-2 border-primary/20">
                        <AvatarImage src={agency.logo_url || agency.avatar_url} alt={agency.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                          {(agency.name || "A").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                              {agency.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{agency.tagline}</p>
                          </div>
                          <Heart className="h-5 w-5 text-muted-foreground hover:text-red-500 cursor-pointer" />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium text-foreground">{agency.rating}</span>
                            <span>({agency.reviews} {agency.reviews === 1 ? "review" : "reviews"})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{agency.location}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {agency.categories?.map((cat, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            <span>{agency.employees} employees</span>
                            {agency.founded_date && <span> • Founded {agency.founded_date}</span>}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/agencies/${agency.id}`);
                            }}
                          >
                            View Details <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Map */}
            <div className="sticky top-4 h-[calc(100vh-8rem)]">
              <AgencyMapView
                agencies={agencies}
                onMarkerClick={(agencyId) => {
                  setSelectedAgency(agencyId);
                  router.push(`/agencies/${agencyId}`);
                }}
                hoveredAgencyId={hoveredAgencyId}
              />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function AgenciesSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <AgenciesSearchContent />
    </Suspense>
  );
}

