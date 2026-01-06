"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, DollarSign, ArrowRight, Filter, ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Dynamically import ProfileMapView to avoid SSR issues with Leaflet
const ProfileMapView = dynamic(() => import("@/components/profiles/ProfileMapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-xl border bg-muted flex items-center justify-center">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  ),
});

interface Profile {
  id: string;
  full_name: string;
  title?: string;
  rating: number;
  reviews: number;
  hourly_rate?: number;
  location?: string;
  full_address?: string;
  avatar_url?: string;
  bio?: string;
  skills?: string[];
  serviceAreas?: Array<{
    zip_code: string;
    radius_miles: number;
    lat?: number;
    lng?: number;
  }>;
}

function ProfilesSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [hoveredProfileId, setHoveredProfileId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    fetchProfiles();
  }, [searchParams]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      
      // Build query based on search params
      // Note: service_areas uses user_id (same as profiles.id), so we query separately
      let query = supabase
        .from("profiles")
        .select(`
          *,
          reviews:reviews(rating)
        `);

      // Apply filters from search params
      const psp = searchParams.get("psp");
      const fields = searchParams.get("fields");
      const price = searchParams.get("price");

      // Execute query
      const { data, error } = await query;

      if (error) throw error;

      // Fetch service areas separately for each profile
      const profileIds = (data || []).map((p: any) => p.id);
      const { data: serviceAreasData } = await supabase
        .from("service_areas")
        .select("user_id, zip_code, radius_miles")
        .in("user_id", profileIds);

      // Create a map of user_id -> service areas
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

      // Process profiles to calculate ratings and format data
      const processedProfiles: Profile[] = (data || []).map((profile: any) => {
        const reviews = profile.reviews || [];
        const avgRating = reviews.length > 0
          ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
          : 0;

        // Get service areas for this profile
        const serviceAreas = serviceAreasMap.get(profile.id) || [];

        // Use full_address from database if available, otherwise generate from service areas
        let location = "New York, NY, USA";
        let full_address = profile.full_address || "";
        
        // Only generate address from ZIP if full_address is not in database
        if (!full_address && serviceAreas.length > 0) {
          const zipCode = serviceAreas[0].zip_code;
          // Generate full addresses based on zip codes (fallback only)
          const addressMap: Record<string, string> = {
            "10001": "350 5th Ave, New York, NY 10001, USA",
            "90001": "123 Main St, Los Angeles, CA 90001, USA",
            "90210": "456 Rodeo Dr, Beverly Hills, CA 90210, USA",
            "94102": "789 Market St, San Francisco, CA 94102, USA",
            "60601": "321 State St, Chicago, IL 60601, USA",
            "33139": "654 Ocean Dr, Miami Beach, FL 33139, USA",
            "78701": "987 Congress Ave, Austin, TX 78701, USA",
            "98101": "147 Pike St, Seattle, WA 98101, USA",
            "02101": "258 State St, Boston, MA 02101, USA",
            "85001": "369 Central Ave, Phoenix, AZ 85001, USA",
            "80202": "741 16th St, Denver, CO 80202, USA",
          };
          
          full_address = addressMap[zipCode] || `${zipCode}, USA`;
          location = full_address.split(",")[0] + ", " + (full_address.split(",")[1] || "USA");
        }
        
        // Use location field as last resort
        if (!full_address && profile.location) {
          full_address = profile.location;
          location = profile.location;
        }
        
        // Set location display from full_address if available
        if (full_address) {
          const parts = full_address.split(",");
          location = parts.length > 1 ? `${parts[0]}, ${parts[parts.length - 1]}` : full_address;
        }

        // Mock skills for demo
        const skills = ["Design Writing", "HTML5", "Prototyping", "Animation", "Creative", "Figma", "Software Design"];

        return {
          id: profile.id,
          full_name: profile.full_name,
          title: profile.company_name || "Professional",
          rating: parseFloat(avgRating.toFixed(1)),
          reviews: reviews.length,
          hourly_rate: profile.hourly_rate,
          location: location,
          full_address: full_address,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          skills: skills.slice(0, Math.floor(Math.random() * 4) + 2), // Random 2-5 skills
          serviceAreas: serviceAreas.map((sa: any) => ({
            zip_code: sa.zip_code,
            radius_miles: sa.radius_miles,
            lat: sa.lat || undefined,
            lng: sa.lng || undefined,
          })),
        };
      });

      // Sort profiles
      let sortedProfiles = [...processedProfiles];
      if (sortBy === "rating") {
        sortedProfiles.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === "price-low") {
        sortedProfiles.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0));
      } else if (sortBy === "price-high") {
        sortedProfiles.sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0));
      }

      // If no profiles, add some mock data for demo
      if (sortedProfiles.length === 0) {
        sortedProfiles = generateMockProfiles();
      }

      setProfiles(sortedProfiles);
    } catch (error: any) {
      console.error("Error fetching profiles:", error);
      toast.error("Failed to load profiles");
      // Use mock data on error
      setProfiles(generateMockProfiles());
    } finally {
      setLoading(false);
    }
  };

  const generateMockProfiles = (): Profile[] => {
    return [
      {
        id: "1",
        full_name: "Agent Pakulla",
        title: "Nursing Assistant",
        rating: 4.0,
        reviews: 1,
        hourly_rate: 62.5,
        location: "New York",
        full_address: "350 5th Ave, New York, NY 10001, USA",
        avatar_url: undefined,
        bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        skills: ["Design Writing", "HTML5", "Prototyping"],
        serviceAreas: [{ zip_code: "10001", radius_miles: 25, lat: 40.7505, lng: -73.9934 }],
      },
      {
        id: "2",
        full_name: "John Powell",
        title: "Product Manager",
        rating: 3.0,
        reviews: 0,
        hourly_rate: 57.5,
        location: "Los Angeles",
        full_address: "123 Main St, Los Angeles, CA 90001, USA",
        avatar_url: undefined,
        bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        skills: ["Animation", "Creative", "Figma"],
        serviceAreas: [{ zip_code: "90001", radius_miles: 25, lat: 34.0522, lng: -118.2437 }],
      },
      {
        id: "3",
        full_name: "Thomas Powell",
        title: "Design & Creative",
        rating: 4.0,
        reviews: 1,
        hourly_rate: 27.5,
        location: "Los Angeles",
        full_address: "456 Sunset Blvd, Los Angeles, CA 90028, USA",
        avatar_url: undefined,
        bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        skills: ["Creative", "Figma", "Prototyping"],
        serviceAreas: [{ zip_code: "90028", radius_miles: 25, lat: 34.0983, lng: -118.3267 }],
      },
      {
        id: "4",
        full_name: "Tom Wilson",
        title: "Marketing Manager",
        rating: 4.5,
        reviews: 2,
        hourly_rate: 47.5,
        location: "New York",
        full_address: "789 Broadway, New York, NY 10003, USA",
        avatar_url: undefined,
        bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        skills: ["Creative", "Design Writing", "Software Design"],
        serviceAreas: [{ zip_code: "10003", radius_miles: 25, lat: 40.7310, lng: -73.9967 }],
      },
      {
        id: "5",
        full_name: "Robert Fox",
        title: "Nursing Assistant",
        rating: 4.5,
        reviews: 2,
        hourly_rate: 30,
        location: "New York",
        full_address: "321 Park Ave, New York, NY 10022, USA",
        avatar_url: undefined,
        bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        skills: ["Design Writing", "Figma", "HTML5"],
        serviceAreas: [{ zip_code: "10022", radius_miles: 25, lat: 40.7580, lng: -73.9694 }],
      },
      {
        id: "6",
        full_name: "Ali Tufan",
        title: "UI/UX Designer",
        rating: 4.5,
        reviews: 2,
        hourly_rate: 20,
        location: "Los Angeles",
        full_address: "654 Rodeo Dr, Beverly Hills, CA 90210, USA",
        avatar_url: undefined,
        bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        skills: ["Design Writing", "Figma", "HTML5", "Prototyping"],
        serviceAreas: [{ zip_code: "90210", radius_miles: 25, lat: 34.0736, lng: -118.4004 }],
      },
      {
        id: "7",
        full_name: "Samuel Smith",
        title: "Design & Creative",
        rating: 4.0,
        reviews: 1,
        hourly_rate: 70,
        location: "New York",
        full_address: "147 Wall St, New York, NY 10005, USA",
        avatar_url: undefined,
        bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        skills: ["Design Writing", "Figma", "Software Design"],
        serviceAreas: [{ zip_code: "10005", radius_miles: 25, lat: 40.7074, lng: -74.0113 }],
      },
      {
        id: "8",
        full_name: "Freelancer",
        title: "Marketing Manager",
        rating: 5.0,
        reviews: 3,
        hourly_rate: 27.5,
        location: "Los Angeles",
        full_address: "258 Hollywood Blvd, Los Angeles, CA 90028, USA",
        avatar_url: undefined,
        bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        skills: ["Animation", "Creative"],
        serviceAreas: [{ zip_code: "90028", radius_miles: 25, lat: 34.1016, lng: -118.3356 }],
      },
    ];
  };

  const handleProfileClick = (profileId: string) => {
    router.push(`/profiles/${profileId}`);
  };

  const handleMarkerClick = (profileId: string) => {
    setSelectedProfile(profileId);
    // Scroll to profile card
    const element = document.getElementById(`profile-${profileId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Showing all {profiles.length} results</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="bg-primary/10 text-primary border-primary/20">
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
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-6">
            {/* Left: Profile Cards (1/3 width) */}
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading profiles...</p>
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
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedProfile === profile.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => handleProfileClick(profile.id)}
                    onMouseEnter={() => setHoveredProfileId(profile.id)}
                    onMouseLeave={() => setHoveredProfileId(null)}
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {profile.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{profile.full_name}</h3>
                              <p className="text-sm text-muted-foreground">{profile.title}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{profile.rating}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {profile.full_address || profile.location}
                            </div>
                            {profile.hourly_rate && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                ${profile.hourly_rate - 5} - ${profile.hourly_rate + 5}/hr
                              </div>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {profile.bio || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              {profile.skills?.slice(0, 4).map((skill, idx) => (
                                <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
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
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Right: Map */}
            <div className="sticky top-6 h-[calc(100vh-150px)]">
              <ProfileMapView 
                profiles={profiles} 
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <ProfilesSearchContent />
    </Suspense>
  );
}

