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
    { name: "General Contractors", count: "1.2k" },
    { name: "Electricians", count: "845" },
    { name: "Plumbers", count: "732" },
    { name: "HVAC Specialists", count: "621" },
    { name: "Landscaping", count: "543" },
    { name: "Roofing", count: "489" },
  ];

  return (
    <section className="bg-transparent px-4 py-8 sm:px-6 md:px-8 lg:py-10">
      <div className="w-full max-w-none">
        <div className="mb-12 flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="flex flex-wrap items-baseline gap-x-2 text-2xl font-bold tracking-tight md:text-3xl">
              <span className="text-amber-900/90 dark:text-amber-200/95">1A</span>
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

        {/* Professional Services — compact tiles inside one card (full-size art, tight chrome) */}
        <div className="mb-0 rounded-2xl border border-border/80 bg-card p-3 shadow-sm md:p-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 md:grid-cols-4 md:gap-3 lg:grid-cols-7 lg:gap-2.5">
            {professionalCategories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group flex h-full w-full min-w-0 flex-col"
              >
                <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border/80 bg-muted/30 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                  <div className="flex aspect-[3/4] w-full shrink-0 items-center justify-center bg-accent/40 px-1 py-2">
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={128}
                      height={128}
                      className="h-32 w-32 object-contain transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center px-2 py-2.5 text-center">
                    <h3 className="mb-1 text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    {/* <p className="text-xs text-muted-foreground">
                      {category.count}
                    </p> */}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Trade Services Section */}
        {/* <div className="mt-16">
          <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Property Trade Services
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {tradeCategories.map((category) => (
              <Link
                key={category.name}
                href={`/search/services?category=${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="group bg-card rounded-xl p-6 border hover:border-primary/50 hover:shadow-md transition-all duration-300 text-center"
              >
                <div className="text-4xl mb-3">🔧</div>
                <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                  {category.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {category.count} pros
                </p>
              </Link>
            ))}
          </div>
        </div> */}

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
