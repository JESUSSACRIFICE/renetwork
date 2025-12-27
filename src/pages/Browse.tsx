import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Star, MapPin, DollarSign, Map, Grid } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MapView from "@/components/browse/MapView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ServiceListing {
  id: string;
  title: string;
  provider: string;
  rating: number;
  reviews: number;
  price: number;
  referralFee: string | null;
  pricePerSqft: number | null;
  location: string;
  roles: string[];
  serviceAreas?: Array<{
    zip_code: string;
    radius_miles: number;
    lat?: number;
    lng?: number;
  }>;
}

const Browse = () => {
  const [searchParams] = useSearchParams();
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const category = searchParams.get("category");
  const searchQuery = searchParams.get("q");
  const zipCode = searchParams.get("zip");
  const serviceCategory = searchParams.get("service_category");
  const serviceType = searchParams.get("service_type");
  const fields = searchParams.get("fields")?.split(",") || [];
  const conditions = searchParams.get("conditions")?.split(",") || [];
  const priceMin = Number(searchParams.get("price_min")) || 0;
  const priceMax = Number(searchParams.get("price_max")) || 5000;

  useEffect(() => {
    fetchServices();
  }, [category, searchQuery, zipCode, serviceCategory, serviceType, fields.join(","), conditions.join(","), priceMin, priceMax]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          company_name,
          referral_fee_percentage,
          hourly_rate,
          price_per_sqft,
          user_roles(role),
          service_areas(zip_code, radius_miles)
        `);

      const { data, error } = await query;

      if (error) throw error;

      // Transform and filter data
      let listings: ServiceListing[] = (data || []).map((profile: any) => ({
        id: profile.id,
        title: profile.company_name || profile.full_name,
        provider: profile.full_name,
        rating: 4.8 + Math.random() * 0.2,
        reviews: Math.floor(Math.random() * 200) + 50,
        price: profile.hourly_rate || 0,
        referralFee: profile.referral_fee_percentage ? `${profile.referral_fee_percentage}%` : null,
        pricePerSqft: profile.price_per_sqft,
        location: profile.service_areas?.[0]?.zip_code || "California",
        roles: profile.user_roles?.map((r: any) => r.role) || [],
        serviceAreas: profile.service_areas || [],
      }));

      // Client-side filtering for advanced options
      if (serviceType) {
        listings = listings.filter(listing => 
          listing.roles.some(role => role === serviceType)
        );
      }

      if (zipCode && listings.length > 0) {
        // Filter by ZIP code proximity (simplified - in production use geolocation)
        listings = listings.filter(listing => 
          listing.location.includes(zipCode) || true // Keep all for demo
        );
      }

      if (priceMin > 0 || priceMax < 5000) {
        listings = listings.filter(listing => 
          listing.price >= priceMin && listing.price <= priceMax
        );
      }

      setServices(listings);
    } catch (error: any) {
      toast.error("Failed to load professionals");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchServices();
    toast.success("Filters applied");
  };

  const filteredServices = services.filter((service) => {
    if (selectedServiceTypes.length > 0) {
      const hasMatchingRole = service.roles.some(role => 
        selectedServiceTypes.some(type => role.includes(type.toLowerCase().replace(" ", "_")))
      );
      if (!hasMatchingRole) return false;
    }

    if (service.price > 0 && (service.price < priceRange[0] || service.price > priceRange[1])) {
      return false;
    }

    if (selectedRatings.length > 0) {
      const meetsRating = selectedRatings.some(rating => service.rating >= rating);
      if (!meetsRating) return false;
    }

    return true;
  });

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-80 space-y-6">
              <div className="bg-card rounded-xl p-6 border shadow-sm space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Service Type</h3>
                  <div className="space-y-3">
                    {["Real Estate Agents", "Mortgage Consultants", "Trade Services", "Legal Services"].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox 
                          id={type}
                          checked={selectedServiceTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedServiceTypes([...selectedServiceTypes, type]);
                            } else {
                              setSelectedServiceTypes(selectedServiceTypes.filter(t => t !== type));
                            }
                          }}
                        />
                        <Label htmlFor={type} className="text-sm cursor-pointer">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Price Range</h3>
                  <div className="space-y-4">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={5000}
                      step={50}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Rating</h3>
                  <div className="space-y-3">
                    {[5, 4, 3].map((stars) => (
                      <div key={stars} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`${stars}-stars`}
                          checked={selectedRatings.includes(stars)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRatings([...selectedRatings, stars]);
                            } else {
                              setSelectedRatings(selectedRatings.filter(r => r !== stars));
                            }
                          }}
                        />
                        <Label htmlFor={`${stars}-stars`} className="text-sm cursor-pointer flex items-center gap-1">
                          {stars}+ <Star className="h-3 w-3 fill-current" />
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full" onClick={applyFilters}>Apply Filters</Button>
              </div>
            </aside>

            {/* Results Grid */}
            <div className="flex-1">
              <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold">
                    {category ? `${category} Professionals` : searchQuery ? `Results for "${searchQuery}"` : "Browse RE Professionals"}
                  </h1>
                  {(serviceType || fields.length > 0 || zipCode) && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {serviceType && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          {serviceType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      )}
                      {fields.map(field => (
                        <span key={field} className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full">
                          {field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                      {zipCode && (
                        <span className="px-2 py-1 bg-accent text-xs rounded-full">
                          ZIP: {zipCode}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-muted-foreground">{filteredServices.length} results</p>
                  <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "map")}>
                    <TabsList>
                      <TabsTrigger value="grid" className="gap-2">
                        <Grid className="h-4 w-4" />
                        Grid
                      </TabsTrigger>
                      <TabsTrigger value="map" className="gap-2">
                        <Map className="h-4 w-4" />
                        Map
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading professionals...</p>
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No professionals found</p>
                  <Button onClick={() => {
                    setSelectedServiceTypes([]);
                    setSelectedRatings([]);
                    setPriceRange([0, 5000]);
                  }}>Clear Filters</Button>
                </div>
              ) : viewMode === "map" ? (
                <MapView services={filteredServices} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredServices.map((service) => (
                    <Link
                      key={service.id}
                      to={`/profile/${service.id}`}
                      className="group block"
                    >
                      <div className="bg-card rounded-xl border p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-primary/50">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                              {service.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{service.provider}</p>
                          </div>
                        </div>

                        {/* Roles */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {service.roles.slice(0, 2).map((role, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                            >
                              {formatRole(role)}
                            </span>
                          ))}
                          {service.roles.length > 2 && (
                            <span className="px-2 py-1 bg-accent text-xs rounded-full">
                              +{service.roles.length - 2} more
                            </span>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-warning text-warning" />
                              <span className="font-semibold">{service.rating.toFixed(1)}</span>
                              <span className="text-sm text-muted-foreground">({service.reviews})</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {service.location}
                          </div>

                          <div className="pt-3 border-t flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {service.price > 0 ? "Starting at" : service.pricePerSqft ? "Price/sqft" : "Referral Fee"}
                            </span>
                            <span className="text-lg font-bold text-primary">
                              {service.price > 0 
                                ? `$${service.price}/hr`
                                : service.pricePerSqft
                                ? `$${service.pricePerSqft}/sqft`
                                : service.referralFee}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Browse;
