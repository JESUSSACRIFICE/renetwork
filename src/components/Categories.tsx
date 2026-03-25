"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import designImg from "@/assets/category-design.jpg";
import devImg from "@/assets/category-dev.jpg";
import writingImg from "@/assets/category-writing.jpg";
import marketingImg from "@/assets/category-marketing.jpg";

const Categories = () => {
  const professionalCategories = [
    {
      name: "Real Estate Agents",
      count: "1.5k",
      image: designImg,
      href: "/search/services?category=agents",
    },
    {
      name: "Mortgage Consultants",
      count: "892",
      image: devImg,
      href: "/search/services?category=mortgage",
    },
    {
      name: "Legal & Escrow",
      count: "654",
      image: writingImg,
      href: "/search/services?category=legal",
    },
    {
      name: "Appraisers & Inspectors",
      count: "723",
      image: marketingImg,
      href: "/search/services?category=appraisers",
    },
    {
      name: "Property Managers",
      count: "538",
      image: designImg,
      href: "/search/services?category=property-managers",
    },
    {
      name: "Insurance Professionals",
      count: "421",
      image: devImg,
      href: "/search/services?category=insurance",
    },
    {
      name: "Architects & Designers",
      count: "367",
      image: writingImg,
      href: "/search/services?category=architects",
    },
  ];

  const tradeCategories = [
    { name: "General Contractors", count: "1.2k", icon: "🏗️" },
    { name: "Electricians", count: "845", icon: "⚡" },
    { name: "Plumbers", count: "732", icon: "🔧" },
    { name: "HVAC Specialists", count: "621", icon: "❄️" },
    { name: "Landscaping", count: "543", icon: "🌿" },
    { name: "Roofing", count: "489", icon: "🏠" },
    { name: "Painters", count: "412", icon: "🎨" },
  ];

  const categoryTiles = [
    ...professionalCategories.map((c) => ({
      kind: "professional" as const,
      name: c.name,
      count: c.count,
      href: c.href,
      image: c.image,
    })),
    ...tradeCategories.map((t) => ({
      kind: "trade" as const,
      name: t.name,
      count: t.count,
      href: `/search/services?category=${t.name.toLowerCase().replace(/\s+/g, "-")}`,
      icon: t.icon,
    })),
  ];

  return (
    <section className="bg-transparent px-4 py-4 sm:px-6 md:px-8">
      <div className="w-full max-w-none">
        <div className="mb-12 flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="flex flex-wrap items-baseline gap-x-2 text-2xl font-bold tracking-tight md:text-3xl">
              <span className="text-amber-900/90 dark:text-amber-200/95">
                1A
              </span>
              <span>Professional roles</span>
            </h3>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              Connect with verified professionals across all property types
            </p>
          </div>
          <Link href="/search/services">
            <Button
              variant="ghost"
              className="hidden md:flex items-center gap-2 group"
            >
              View All
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Professional + trade services — one grid */}
        <div className="mb-0 rounded-2xl p-3 md:p-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 md:grid-cols-4 md:gap-3 lg:grid-cols-7 lg:gap-2.5">
            {categoryTiles.map((category) => (
              <Link
                key={`${category.kind}-${category.name}`}
                href={category.href}
                className="group flex h-full w-full min-w-0 flex-col"
              >
                <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border/80 bg-muted/30 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                  <div className="flex aspect-[3/4] w-full shrink-0 items-center justify-center bg-accent/40 px-1 py-2">
                    {category.kind === "professional" ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={128}
                        height={128}
                        className="h-32 w-32 object-contain transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <span
                        className="text-7xl leading-none transition-transform group-hover:scale-105 select-none"
                        aria-hidden
                      >
                        {category.icon}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-center px-2 py-2.5 text-center">
                    <h3 className="mb-1 text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    {category.kind === "trade" ? (
                      <p className="text-xs text-muted-foreground">
                        {category.count} pros
                      </p>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/search/services">
            <Button variant="outline" className="w-full">
              View All Categories
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Categories;
