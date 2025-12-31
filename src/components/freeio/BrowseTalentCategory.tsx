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
    title: "Development & IT",
    count: "1,476",
    icon: "💻",
    gradient: "from-blue-500 to-blue-700",
  },
  {
    title: "Design & Creative",
    count: "892",
    icon: "🎨",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    title: "Digital & Marketing",
    count: "634",
    icon: "📱",
    gradient: "from-green-500 to-teal-600",
  },
  {
    title: "Writing & Translation",
    count: "445",
    icon: "✍️",
    gradient: "from-orange-500 to-red-600",
  },
  {
    title: "Music & Audio",
    count: "321",
    icon: "🎵",
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    title: "Video & Animation",
    count: "278",
    icon: "🎬",
    gradient: "from-red-500 to-pink-600",
  },
  {
    title: "Business",
    count: "195",
    icon: "💼",
    gradient: "from-gray-600 to-gray-800",
  },
  {
    title: "Photography",
    count: "142",
    icon: "📷",
    gradient: "from-cyan-500 to-blue-600",
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
    <section className="w-full bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Browse talent by category</h2>
          <Button variant="outline" className="hidden md:inline-flex">
            All Category
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
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/3 lg:basis-1/5">
                  <div className="relative rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-48">
                    {/* Background Image/Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-90`}>
                      {/* Pattern overlay for texture */}
                      <div className="absolute inset-0 bg-black/10"></div>
                      {/* Large icon as background element */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <span className="text-8xl">{category.icon}</span>
                      </div>
                    </div>
                    
                    {/* Text Overlay */}
                    <div className="relative h-full flex flex-col justify-end p-6 text-white">
                      <div className="text-4xl mb-3 drop-shadow-lg">{category.icon}</div>
                      <h3 className="text-lg font-bold mb-1 drop-shadow-md">{category.title}</h3>
                      <p className="text-sm opacity-90 drop-shadow-sm">{category.count} services</p>
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

