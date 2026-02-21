"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image.jpg";
import { useRouter } from "next/navigation";
import { AdvancedSearchFilters } from "@/components/hero/AdvancedSearchFilters";
import { VerticalDropdownMenu } from "@/components/hero/VerticalDropdownMenu";

const Hero = () => {
  const router = useRouter();

  const popularSearches = [
    { label: "Real Estate Agent", category: "agents" },
    { label: "Mortgage Consultant", category: "mortgage" },
    { label: "General Contractor", category: "contractors" },
    { label: "Property Inspector", category: "inspectors" },
  ];

  return (
    <section className="relative bg-gradient-to-br from-background via-primary/5 to-secondary/5 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      {/* <div className="container py-8 md:py-12 relative"> */}
      {/* Vertical Dropdown Menu Banner */}
      {/* <div className="mb-8 animate-fade-in">
          <VerticalDropdownMenu />
        </div> */}
      {/* </div> */}

      <div className="container py-8 md:py-16 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <Badge className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 animate-fade-in">
                🏡 #1 Real Estate Professional Network
              </Badge>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight animate-fade-in">
                Find the Right{" "}
                <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  Real Estate Pro
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                Connect with verified real estate professionals, mortgage
                consultants, and trade experts. Referral-based networking with
                secure payment protection.
              </p>
            </div>

            {/* Advanced Search Filters */}
            <div className="animate-fade-in">
              <AdvancedSearchFilters />
            </div>

            {/* Popular Searches */}
            <div className="flex flex-wrap items-center gap-3 animate-fade-in">
              <span className="text-sm font-medium text-muted-foreground">
                Popular:
              </span>
              {popularSearches.map((search, index) => (
                <Button
                  key={search.label}
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/search/services?category=${search.category}`)
                  }
                  className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105 border-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {search.label}
                </Button>
              ))}
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap items-center gap-8 pt-6 animate-fade-in">
              <div className="text-center group cursor-pointer">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  5,000+
                </div>
                <div className="text-sm text-muted-foreground font-medium mt-1">
                  RE Professionals
                </div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center group cursor-pointer">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  25,000+
                </div>
                <div className="text-sm text-muted-foreground font-medium mt-1">
                  Successful Referrals
                </div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center group cursor-pointer">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  98%
                </div>
                <div className="text-sm text-muted-foreground font-medium mt-1">
                  Satisfaction Rate
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative animate-fade-in hidden lg:block">
            <div
              className="absolute -top-10 -right-10 w-96 h-96 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-2xl animate-pulse"
              style={{ animationDelay: "0.5s" }}
            />
            <Image
              src={heroImage}
              alt="Real estate professionals collaborating"
              className="relative rounded-3xl shadow-2xl border-4 border-background hover:scale-105 transition-transform duration-500"
              width={heroImage.width || 600}
              height={heroImage.height || 400}
              priority
            />

            {/* Floating Cards */}
            <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-2xl shadow-xl border-2 border-primary/10 backdrop-blur-sm animate-float">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-success">
                    Verified Professional
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Background checked
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
