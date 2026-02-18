"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  MapPin,
  DollarSign,
  ArrowRight,
  Filter,
  Heart,
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
import Image from "next/image";
import SearchFiltersSidebar from "@/components/search/SearchFiltersSidebar";
import SearchByNav from "@/components/search/SearchByNav";
import { useServicesList } from "@/hooks/use-services";
import type { ServiceListItem } from "@/hooks/use-services";

// Dynamically import ServiceMapView to avoid SSR issues with Leaflet
const ServiceMapView = dynamic(
  () => import("@/components/services/ServiceMapView"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-xl border bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    ),
  },
);

const MOCK_SERVICES: ServiceListItem[] = [
  {
    id: "1",
    title: "Power management, notification and...",
    category: "Design & Creative",
    description: "Professional design services",
    rating: 5.0,
    reviews: 1,
    price: 125,
    provider_id: "1",
    provider_name: "Thomas Powell",
    location: "Los Angeles",
    full_address: "123 Main St, Los Angeles, CA 90001, USA",
    serviceAreas: [
      { zip_code: "90001", radius_miles: 25, lat: 34.0522, lng: -118.2437 },
    ],
  },
  {
    id: "2",
    title: "Full Service host that will do most of the work for...",
    category: "Design & Creative",
    description: "Full service hosting solution",
    rating: 3.0,
    reviews: 1,
    price: 79,
    provider_id: "2",
    provider_name: "John Powell",
    location: "Los Angeles",
    full_address: "456 Sunset Blvd, Los Angeles, CA 90028, USA",
    serviceAreas: [
      { zip_code: "90028", radius_miles: 25, lat: 34.0983, lng: -118.3267 },
    ],
  },
  {
    id: "3",
    title: "Easy to build your own playlists and sync them...",
    category: "Development & IT",
    description: "Playlist management service",
    rating: 5.0,
    reviews: 1,
    price: 58,
    provider_id: "3",
    provider_name: "Freelancer",
    location: "New York",
    full_address: "789 Broadway, New York, NY 10003, USA",
    serviceAreas: [
      { zip_code: "10003", radius_miles: 25, lat: 40.731, lng: -73.9967 },
    ],
  },
  {
    id: "4",
    title: "I will design website UI UX in adobe xd or figma",
    category: "Design & Creative",
    description: "UI/UX design services",
    rating: 4.3,
    reviews: 3,
    price: 69,
    provider_id: "4",
    provider_name: "Freelancer",
    location: "New York",
    full_address: "321 Park Ave, New York, NY 10022, USA",
    serviceAreas: [
      { zip_code: "10022", radius_miles: 25, lat: 40.758, lng: -73.9694 },
    ],
  },
];

function ServicesSearchContent() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [hoveredServiceId, setHoveredServiceId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    "default" | "rating" | "price-low" | "price-high"
  >("default");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const {
    data: servicesData,
    isLoading: loading,
    isError,
  } = useServicesList({
    withAreas: true,
    sortBy,
  });
  const services: ServiceListItem[] = isError
    ? MOCK_SERVICES
    : (servicesData ?? []);

  useEffect(() => {
    if (isError) toast.error("Failed to load services");
  }, [isError]);

  const handleServiceClick = (serviceId: string) => {
    router.push(`/services/${serviceId}`);
  };

  const handleMarkerClick = (serviceId: string) => {
    setSelectedService(serviceId);
    const element = document.getElementById(`service-${serviceId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
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
                Showing all {services.length} results
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
              <Select
                value={sortBy}
                onValueChange={(v) =>
                  setSortBy(
                    v as "default" | "rating" | "price-low" | "price-high",
                  )
                }
              >
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

          {/* Main Content: Services List + Map */}
          {/* <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-6"> */}
          <div className="grid grid-cols-1 gap-6">
            {/* Left: Service Cards (1/3 width) */}
            <div
              className={`grid gap-4 overflow-y-auto overflow-x-hidden pr-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              }`}
            >
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading services...</p>
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No services found</p>
                </div>
              ) : (
                services.map((service) => (
                  <Card
                    key={service.id}
                    id={`service-${service.id}`}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedService === service.id
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                    onClick={() => handleServiceClick(service.id)}
                    onMouseEnter={() => setHoveredServiceId(service.id)}
                    onMouseLeave={() => setHoveredServiceId(null)}
                  >
                    <CardContent className="p-0">
                      <div className="relative">
                        {/* Service Image */}
                        <div className="relative w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg overflow-hidden">
                          {service.image_url ? (
                            <Image
                              src={service.image_url}
                              alt={service.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary/40">
                              <div className="text-6xl">📦</div>
                            </div>
                          )}
                          {/* Favorite Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle favorite
                            }}
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="p-4">
                          {/* Category Badge */}
                          <Badge variant="secondary" className="mb-2">
                            {service.category}
                          </Badge>

                          {/* Title */}
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                            {service.title}
                          </h3>

                          {/* Rating and Reviews */}
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            <span className="text-sm">
                              {service.rating.toFixed(1)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({service.reviews} Review
                              {service.reviews !== 1 ? "s" : ""})
                            </span>
                          </div>

                          {/* Provider Info */}
                          <div className="flex items-center gap-2 mb-3">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={service.provider_avatar}
                                alt={service.provider_name}
                              />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {service.provider_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {service.provider_name}
                            </span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-primary">
                              Starting at ${service.price}
                            </p>
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Right: Map (2/3 width) */}
            {/* <div className="sticky top-6 h-[calc(100vh-150px)]">
              <ServiceMapView 
                services={services} 
                onMarkerClick={handleMarkerClick}
                hoveredServiceId={hoveredServiceId}
              />
            </div> */}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ServicesSearchPage() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <ServicesSearchContent />
    </Suspense>
  );
}
