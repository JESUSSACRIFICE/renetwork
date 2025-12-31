"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const testimonials = [
  {
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    name: "Ali Faten",
    role: "Web Designer",
    avatar: "AF",
  },
  {
    quote: "Freeio has transformed how I find talented freelancers. The platform is intuitive and the quality of professionals is outstanding.",
    name: "Sarah Johnson",
    role: "Marketing Director",
    avatar: "SJ",
  },
  {
    quote: "As a freelancer, Freeio has given me access to amazing projects and clients. The platform makes it easy to showcase my skills.",
    name: "Michael Chen",
    role: "Software Developer",
    avatar: "MC",
  },
  {
    quote: "The best freelance platform I've used. Great support, easy payments, and a community of talented professionals.",
    name: "Emily Rodriguez",
    role: "Graphic Designer",
    avatar: "ER",
  },
  {
    quote: "Freeio helped me build my entire team of remote workers. The quality and professionalism exceeded my expectations.",
    name: "David Kim",
    role: "Startup Founder",
    avatar: "DK",
  },
];

export default function PeopleLoveFreeio() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

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
    }, 5000); // Auto-scroll every 5 seconds

    return () => clearInterval(interval);
  }, [api]);

  return (
    <section className="w-full bg-gradient-to-br from-amber-50 to-orange-50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Stats */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                People Love To Learn With Freeio
              </h2>
              <p className="text-lg text-gray-700">Lorem ipsum dolor sit amet, consectetur</p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">4.9/5</div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">90%</div>
                <div className="text-sm text-gray-600">Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">Award</div>
                <div className="text-sm text-gray-600">Winner</div>
              </div>
            </div>
          </div>

          {/* Right Side - Testimonial Carousel */}
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <Carousel setApi={setApi} className="w-full">
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index}>
                    <div className="space-y-6">
                      <div className="text-4xl text-gray-300">&quot;</div>
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {testimonial.quote}
                      </p>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-gray-900">{testimonial.name}</div>
                          <div className="text-sm text-gray-600">{testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Dynamic Pagination Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => {
                const isActive = current === index + 1;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (api) {
                        api.scrollTo(index);
                      }
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isActive ? "bg-gray-900 w-6" : "bg-gray-300 w-2"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

