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
      href: "/browse?category=agents",
    },
    {
      name: "Mortgage Consultants",
      count: "892",
      image: devImg,
      href: "/browse?category=mortgage",
    },
    {
      name: "Legal & Escrow",
      count: "654",
      image: writingImg,
      href: "/browse?category=legal",
    },
    {
      name: "Appraisers & Inspectors",
      count: "723",
      image: marketingImg,
      href: "/browse?category=appraisers",
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
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold">
              Browse Real Estate Professionals
            </h2>
            <p className="text-lg text-muted-foreground">
              Connect with verified professionals across all property types
            </p>
          </div>
          <Link href="/browse">
            <Button variant="ghost" className="hidden md:flex items-center gap-2 group">
              View All
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Professional Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {professionalCategories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group"
            >
              <div className="bg-card rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50">
                <div className="aspect-square bg-accent/50 p-8 flex items-center justify-center">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={128}
                    height={128}
                    className="w-32 h-32 object-contain transition-transform group-hover:scale-110"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.count} professionals
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Trade Services Section */}
        <div className="mt-16">
          <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">Property Trade Services</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {tradeCategories.map((category) => (
              <Link
                key={category.name}
                href={`/browse?category=${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="group bg-card rounded-xl p-6 border hover:border-primary/50 hover:shadow-md transition-all duration-300 text-center"
              >
                <div className="text-4xl mb-3">🔧</div>
                <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">{category.name}</h4>
                <p className="text-xs text-muted-foreground">{category.count} pros</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/browse">
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
