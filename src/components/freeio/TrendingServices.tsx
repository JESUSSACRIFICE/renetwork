"use client";

import { useState, useEffect } from "react";
import { Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const services = [
  {
    title: "Developers drop the framework folder into a new...",
    rating: 4.5,
    freelancer: { name: "John Doe", avatar: "JD" },
    price: 20,
    image: "💻",
  },
  {
    title: "I will often turn to a PHP framework to compose my...",
    rating: 4.0,
    freelancer: { name: "Jane Smith", avatar: "JS" },
    price: 65,
    image: "📱",
  },
  {
    title: "Custom iOS and Android apps development for your project",
    rating: 3.0,
    freelancer: { name: "Mike Johnson", avatar: "MJ" },
    price: 50,
    image: "🎨",
  },
  {
    title: "Professional website design and development services",
    rating: 4.8,
    freelancer: { name: "Sarah Williams", avatar: "SW" },
    price: 85,
    image: "🌐",
  },
  {
    title: "E-commerce platform setup and customization",
    rating: 4.2,
    freelancer: { name: "David Brown", avatar: "DB" },
    price: 120,
    image: "🛒",
  },
  {
    title: "Logo design and brand identity package",
    rating: 4.7,
    freelancer: { name: "Emily Davis", avatar: "ED" },
    price: 45,
    image: "🎯",
  },
  {
    title: "Full-stack web application development",
    rating: 4.9,
    freelancer: { name: "Alex Thompson", avatar: "AT" },
    price: 95,
    image: "⚡",
  },
  {
    title: "Mobile app UI/UX design and prototyping",
    rating: 4.6,
    freelancer: { name: "Maria Garcia", avatar: "MG" },
    price: 75,
    image: "📲",
  },
  {
    title: "Cloud infrastructure setup and migration",
    rating: 4.4,
    freelancer: { name: "Ryan Miller", avatar: "RM" },
    price: 110,
    image: "☁️",
  },
  {
    title: "SEO optimization and content strategy",
    rating: 4.3,
    freelancer: { name: "Sophie Taylor", avatar: "ST" },
    price: 55,
    image: "🔍",
  },
  {
    title: "Video editing and post-production services",
    rating: 4.5,
    freelancer: { name: "Chris Anderson", avatar: "CA" },
    price: 60,
    image: "🎬",
  },
  {
    title: "Database design and optimization",
    rating: 4.7,
    freelancer: { name: "Jessica Lee", avatar: "JL" },
    price: 80,
    image: "🗄️",
  },
];

export default function TrendingServices() {
  const [api, setApi] = useState<CarouselApi>();
  const [likedServices, setLikedServices] = useState<Set<number>>(new Set());

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

  const toggleLike = (index: number) => {
    setLikedServices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <section className="w-full bg-gray-900 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Trending Services</h2>
            <p className="text-gray-400">Most viewed and all-time top-selling services</p>
          </div>
          <Button variant="outline" className="hidden md:inline-flex border-white text-white hover:bg-white hover:text-gray-900">
            All Services
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
              {services.map((service, index) => {
                const isLiked = likedServices.has(index);
                return (
                  <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative group">
                      {/* Like/Heart Icon */}
                      <button
                        onClick={() => toggleLike(index)}
                        className="absolute top-3 right-3 z-10 p-2 bg-gray-900/90 backdrop-blur-sm rounded-full shadow-md hover:bg-gray-800 transition-all duration-200 hover:scale-110"
                        aria-label={isLiked ? "Unlike service" : "Like service"}
                      >
                        <Heart
                          className={`h-5 w-5 transition-all duration-200 ${
                            isLiked
                              ? "fill-red-500 text-red-500"
                              : "fill-gray-500 text-gray-400 hover:fill-red-200 hover:text-red-300"
                          }`}
                        />
                      </button>

                      <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-6xl relative">
                        {service.image}
                      </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">
                        {service.title}
                      </h3>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-gray-300">{service.rating}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-gray-700 text-white">
                              {service.freelancer.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-400">{service.freelancer.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Starting at</span>
                        <span className="text-lg font-bold text-white">${service.price}</span>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-2 md:left-4 text-white border-white hover:bg-white hover:text-gray-900" />
            <CarouselNext className="right-2 md:right-4 text-white border-white hover:bg-white hover:text-gray-900" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}

