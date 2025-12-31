"use client";

import { useState } from "react";
import { Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
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
];

export default function PopularServices() {
  const [likedServices, setLikedServices] = useState<Set<number>>(new Set());

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
    <section className="w-full bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Popular Services</h2>
          <p className="text-gray-600">Most viewed and all-time top-selling services</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const isLiked = likedServices.has(index);
            return (
              <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative group">
                {/* Like/Heart Icon */}
                <button
                  onClick={() => toggleLike(index)}
                  className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-200 hover:scale-110"
                  aria-label={isLiked ? "Unlike service" : "Like service"}
                >
                  <Heart
                    className={`h-5 w-5 transition-all duration-200 ${
                      isLiked
                        ? "fill-red-500 text-red-500"
                        : "fill-gray-300 text-gray-400 hover:fill-red-200 hover:text-red-300"
                    }`}
                  />
                </button>

                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-6xl relative">
                  {service.image}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    {service.title}
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-700">{service.rating}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{service.freelancer.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">{service.freelancer.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Starting at</span>
                    <span className="text-lg font-bold text-gray-900">${service.price}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline">All Services</Button>
        </div>
      </div>
    </section>
  );
}

