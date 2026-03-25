"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

const categories = [
  {
    title: "Commercial",
    count: "1,476",
    icon: "💻",
    gradient: "from-blue-500 to-blue-700",
  },
  {
    title: "Multi-Unit",
    count: "892",
    icon: "🎨",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    title: "Industrial",
    count: "634",
    icon: "📱",
    gradient: "from-green-500 to-teal-600",
  },
  {
    title: "Agriculture",
    count: "445",
    icon: "✍️",
    gradient: "from-orange-500 to-red-600",
  },
  {
    title: "Residential",
    count: "321",
    icon: "🎵",
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    title: "Other",
    count: "278",
    icon: "🎬",
    gradient: "from-red-500 to-pink-600",
  },
];

export default function BrowseTalentCategory() {
  const [api, setApi] = useState<CarouselApi>();

  // Auto-play functionality
  useEffect(() => {
    if (!api) {
      return;
    }

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        // Reset to beginning if at the end
        api.scrollTo(0);
      }
    }, 4000); // Auto-scroll every 4 seconds

    return () => clearInterval(interval);
  }, [api]);

  return (
    <section className="w-full bg-transparent px-4 py-4 sm:px-6 md:px-8">
      <div className="mx-auto w-full max-w-none">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="flex flex-wrap items-baseline gap-x-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              <span className="text-amber-900/90 dark:text-amber-200/95">
                1B
              </span>
              <span>Fields</span>
            </h3>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              Browse property types and specializations that match your deal
            </p>
          </div>
          <Button variant="outline" className="hidden md:inline-flex shrink-0">
            All fields
          </Button>
        </div>

        <div className="relative">
          <Carousel
            setApi={setApi}
            className="w-full"
            opts={{
              align: "start",
              loop: false,
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {categories.map((category, index) => (
                <CarouselItem
                  key={index}
                  className="pl-2 md:pl-4 md:basis-1/3 lg:basis-1/5"
                >
                  <div className="relative rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-48">
                    {/* Background Image/Gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-90`}
                    >
                      {/* Pattern overlay for texture */}
                      <div className="absolute inset-0 bg-black/10"></div>
                      {/* Large icon as background element */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <span className="text-8xl">{category.icon}</span>
                      </div>
                    </div>

                    {/* Text Overlay */}
                    <div className="relative h-full flex flex-col justify-end p-6 text-white">
                      <div className="text-4xl mb-3 drop-shadow-lg">
                        {category.icon}
                      </div>
                      <h3 className="text-lg font-bold mb-1 drop-shadow-md">
                        {category.title}
                      </h3>
                      <p className="text-sm opacity-90 drop-shadow-sm">
                        {category.count} services
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 md:left-4" />
            <CarouselNext className="right-2 md:right-4" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
