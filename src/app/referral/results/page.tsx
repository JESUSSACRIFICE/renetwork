"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, DollarSign, Grid, List } from "lucide-react";
import ReferralHeader from "@/components/referral/ReferralHeader";
import ReferralFooter from "@/components/referral/ReferralFooter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ReferralVerticalMenu } from "@/components/referral/ReferralVerticalMenu";
import AdSpace from "@/components/referral/AdSpace";

interface Listing {
  id: string;
  title: string;
  provider: string;
  rating: number;
  reviews: number;
  price: number;
  location: string;
  type: "service" | "profile" | "agency";
  category?: string;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const searchQuery = searchParams.get("q");
  const serviceType = searchParams.get("service");
  const location = searchParams.get("location");

  useEffect(() => {
    fetchListings();
  }, [type, category, searchQuery, serviceType, location]);

  const fetchListings = async () => {
    setLoading(true);
    // Simulate API call - replace with actual data fetching
    setTimeout(() => {
      const mockListings: Listing[] = [
        {
          id: "1",
          title: "Professional Real Estate Services",
          provider: "John Smith",
          rating: 4.8,
          reviews: 127,
          price: 150,
          location: "Los Angeles, CA",
          type: (type as any) || "service",
          category: category || "Real Estate Agent",
        },
        {
          id: "2",
          title: "Expert Mortgage Consultation",
          provider: "Jane Doe",
          rating: 4.9,
          reviews: 89,
          price: 200,
          location: "New York, NY",
          type: (type as any) || "service",
          category: category || "Mortgage Consultant",
        },
        {
          id: "3",
          title: "Commercial Property Solutions",
          provider: "Mike Johnson",
          rating: 4.7,
          reviews: 203,
          price: 175,
          location: "Chicago, IL",
          type: (type as any) || "service",
          category: category || "Real Estate Agent",
        },
        {
          id: "4",
          title: "Luxury Home Specialist",
          provider: "Sarah Williams",
          rating: 5.0,
          reviews: 156,
          price: 250,
          location: "Miami, FL",
          type: (type as any) || "profile",
          category: category || "Real Estate Agent",
        },
        {
          id: "5",
          title: "Premier Real Estate Agency",
          provider: "Elite Properties Inc",
          rating: 4.6,
          reviews: 342,
          price: 300,
          location: "San Francisco, CA",
          type: "agency",
          category: category || "Agency",
        },
        {
          id: "6",
          title: "Investment Property Experts",
          provider: "David Brown",
          rating: 4.9,
          reviews: 98,
          price: 180,
          location: "Austin, TX",
          type: (type as any) || "service",
          category: category || "Real Estate Agent",
        },
      ];

      let filtered = mockListings;
      
      if (type) {
        filtered = filtered.filter(l => l.type === type);
      }
      if (category) {
        filtered = filtered.filter(l => l.category?.includes(category));
      }
      if (searchQuery) {
        filtered = filtered.filter(l => 
          l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.provider.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (location) {
        filtered = filtered.filter(l => l.location.includes(location));
      }

      setListings(filtered);
      setLoading(false);
    }, 500);
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleRatingToggle = (rating: number) => {
    setSelectedRatings(prev =>
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
  };

  const getListingUrl = (listing: Listing) => {
    if (listing.type === "service") return `/referral/service/${listing.id}`;
    if (listing.type === "profile") return `/referral/profile/${listing.id}`;
    if (listing.type === "agency") return `/referral/agency/${listing.id}`;
    return `/referral/results`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ReferralHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar - Filters and Ads */}
            <aside className="w-full lg:w-80 shrink-0 space-y-6">
              {/* Expanded Menu */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold mb-4">Refine Search</h2>
                <ReferralVerticalMenu />
              </div>

              {/* Additional Filters */}
              <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Price Range</Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={5000}
                    step={50}
                    className="mb-4"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-3 block">Categories</Label>
                  <div className="space-y-2">
                    {["Real Estate Agent", "Mortgage Consultant", "Contractor", "Inspector"].map((cat) => (
                      <div key={cat} className="flex items-center space-x-2">
                        <Checkbox
                          id={cat}
                          checked={selectedCategories.includes(cat)}
                          onCheckedChange={() => handleCategoryToggle(cat)}
                        />
                        <Label htmlFor={cat} className="text-sm cursor-pointer">
                          {cat}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-3 block">Rating</Label>
                  <div className="space-y-2">
                    {[5, 4, 3].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <Checkbox
                          id={`rating-${rating}`}
                          checked={selectedRatings.includes(rating)}
                          onCheckedChange={() => handleRatingToggle(rating)}
                        />
                        <Label htmlFor={`rating-${rating}`} className="text-sm cursor-pointer flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {rating}+ Stars
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ad Space */}
              <div className="hidden lg:block">
                <AdSpace />
                <div className="mt-4">
                  <AdSpace />
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Header */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {searchQuery ? `Search Results for "${searchQuery}"` : "Browse Results"}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {listings.length} {listings.length === 1 ? "result" : "results"} found
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Results */}
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading results...</p>
                </div>
              ) : listings.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <p className="text-gray-600 text-lg">No results found. Try adjusting your filters.</p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <Link key={listing.id} href={getListingUrl(listing)}>
                      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                        <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <div className="text-5xl">
                            {listing.type === "agency" ? "🏢" : listing.type === "profile" ? "👤" : "🛠️"}
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{listing.title}</h3>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{listing.type}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{listing.provider}</p>
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{listing.rating}</span>
                              <span className="text-xs text-gray-500">({listing.reviews})</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{listing.location}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-sm text-gray-500">Starting at</span>
                            <span className="text-lg font-bold text-gray-900">${listing.price}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <Link key={listing.id} href={getListingUrl(listing)}>
                      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="w-full md:w-48 h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center shrink-0">
                            <div className="text-4xl">
                              {listing.type === "agency" ? "🏢" : listing.type === "profile" ? "👤" : "🛠️"}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">{listing.title}</h3>
                                <p className="text-gray-600">{listing.provider}</p>
                              </div>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{listing.type}</span>
                            </div>
                            <div className="flex items-center gap-6 mb-3">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{listing.rating}</span>
                                <span className="text-xs text-gray-500">({listing.reviews} reviews)</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span className="text-sm">{listing.location}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-sm font-semibold">${listing.price}</span>
                              </div>
                            </div>
                            {listing.category && (
                              <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {listing.category}
                              </span>
                            )}
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
      <ReferralFooter />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}

