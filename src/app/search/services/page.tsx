"use client";

import { useState, Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Star,
  MapPin,
  DollarSign,
  ArrowRight,
  Filter,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const PER_PAGE = 32; // 4 columns × 8 rows

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

const DUMMY_SERVICES: ServiceListItem[] = Array.from({ length: 36 }, (_, i) => {
  const titles = [
    "Professional property inspection and report",
    "Market analysis and valuation services",
    "Contract review and negotiation support",
    "Listing photography and staging",
    "Virtual tour creation",
    "Closing coordination and escrow",
  ];
  const categories = [
    "Design & Creative",
    "Development & IT",
    "Marketing",
    "Legal",
  ];
  const locations = [
    "Chicago",
    "Houston",
    "Phoenix",
    "Miami",
    "Seattle",
    "Boston",
  ];
  const zips = ["60601", "77001", "85001", "33139", "98101", "02101"];
  return {
    ...MOCK_SERVICES[i % 4],
    id: `dummy-${i + 1}`,
    provider_id: `dummy-${i + 1}`,
    title: titles[i % titles.length],
    category: categories[i % categories.length],
    rating: 4 + (i % 10) / 10,
    reviews: (i % 20) + 1,
    price: 50 + (i % 100),
    provider_name: `Provider ${i + 1}`,
    location: locations[i % locations.length],
    full_address: `${zips[i % zips.length]}, USA`,
    serviceAreas: [
      {
        zip_code: zips[i % zips.length],
        radius_miles: 25,
        lat: 40 + i * 0.1,
        lng: -74 - i * 0.1,
      },
    ],
  };
});

function ServicesSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [hoveredServiceId, setHoveredServiceId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    "default" | "rating" | "price-low" | "price-high"
  >("default");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const listOptions = useMemo(() => {
    const parse = (key: string) =>
      searchParams
        .get(key)
        ?.split(",")
        .map((s) => s.trim())
        .filter((s) => s && s !== "All" && s !== "All of the above") ?? [];
    const psp = [
      ...parse("psp"),
      ...parse("agentTypes"),
      ...parse("realEstateTypes"),
      ...parse("crowdfundingTypes"),
      ...parse("flooringIndoorTypes"),
      ...parse("flooringOutdoorTypes"),
    ];
    const price = parse("price");
    const fields = parse("fields");
    const willingToTrainRaw = parse("willingToTrain");
    const willingToTrain = willingToTrainRaw.includes("Yes") ? true : undefined;

    return {
      withAreas: true,
      sortBy,
      psp: psp.length > 0 ? [...new Set(psp)] : undefined,
      price: price.length > 0 ? price : undefined,
      fields: fields.length > 0 ? fields : undefined,
      willingToTrain,
    };
  }, [searchParams, sortBy]);

  const {
    data: servicesData,
    isLoading: loading,
    isError,
  } = useServicesList(listOptions);

  const services = useMemo(() => {
    const list = [...(isError ? MOCK_SERVICES : (servicesData ?? []))];
    if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      list.sort((a, b) => b.price - a.price);
    }
    const minCards = 40;
    if (list.length < minCards) {
      const needed = minCards - list.length;
      list.push(...DUMMY_SERVICES.slice(0, needed));
    }
    return list;
  }, [isError, servicesData, sortBy]);

  const totalPages = Math.max(1, Math.ceil(services.length / PER_PAGE));
  const paginatedServices = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return services.slice(start, start + PER_PAGE);
  }, [services, page]);

  const handleSortChange = (v: string) => {
    setSortBy(v as "default" | "rating" | "price-low" | "price-high");
    setPage(1);
  };

  useEffect(() => {
    if (isError) toast.error("Failed to load services");
  }, [isError]);

  const handleServiceClick = (serviceId: string) => {
    if (serviceId.startsWith("dummy-")) return;
    router.push(`/services/${serviceId}`);
  };

  useEffect(() => setPage(1), [searchParams]);

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
            {/* Left: 4-column service grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 overflow-y-auto overflow-x-hidden pr-2 content-start">
              {loading ? (
                <div className="text-center py-12 col-span-full">
                  <p className="text-muted-foreground">Loading services...</p>
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-12 col-span-full">
                  <p className="text-muted-foreground">No services found</p>
                </div>
              ) : (
                paginatedServices.map((service) => (
                  <Card
                    key={service.id}
                    id={`service-${service.id}`}
                    className={`cursor-pointer transition-all hover:shadow-lg overflow-hidden min-w-0 ${
                      selectedService === service.id
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                    onClick={() => handleServiceClick(service.id)}
                    onMouseEnter={() =>
                      !service.id.startsWith("dummy-") &&
                      setHoveredServiceId(service.id)
                    }
                    onMouseLeave={() => setHoveredServiceId(null)}
                  >
                    <CardContent className="p-0">
                      <div className="relative">
                        {/* Service Image */}
                        <div className="relative w-full h-24 sm:h-28 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
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
                              <div className="text-3xl">📦</div>
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 bg-white/90 hover:bg-white"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Heart className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="p-2 sm:p-3">
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 mb-1"
                          >
                            {service.category}
                          </Badge>
                          <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 min-h-0">
                            {service.title}
                          </h3>
                          <div className="flex items-center gap-1 mt-1 text-xs">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                            <span>{service.rating.toFixed(1)}</span>
                            <span className="text-muted-foreground">
                              ({service.reviews})
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground min-w-0 truncate">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {service.location || service.full_address || "—"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1.5 gap-1">
                            <span className="text-sm font-bold text-primary">
                              ${service.price}
                            </span>
                            <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              {/* Pagination */}
              {!loading &&
                !isError &&
                services.length > 0 &&
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
                      <span className="px-2 text-muted-foreground">…</span>
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

            {/* Right: Map (always visible) */}
            <div className="sticky top-6 h-[calc(100vh-220px)] min-h-[400px] rounded-xl border overflow-hidden bg-muted">
              <ServiceMapView
                services={services.filter((s) => !s.id.startsWith("dummy-"))}
                onMarkerClick={handleMarkerClick}
                hoveredServiceId={hoveredServiceId}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ServicesSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <ServicesSearchContent />
    </Suspense>
  );
}
