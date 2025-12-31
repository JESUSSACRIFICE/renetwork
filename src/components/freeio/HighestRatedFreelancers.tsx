"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
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

const freelancers = [
  {
    name: "John Powell",
    role: "Product Manager",
    rating: 3.8,
    location: "Los Angeles",
    rate: "$55-$80/hr",
    avatar: "JP",
  },
  {
    name: "Thomas Powell",
    role: "Designer & Creative",
    rating: 4.2,
    location: "New York",
    rate: "$25-$50/hr",
    avatar: "TP",
  },
  {
    name: "Tony Wilson",
    role: "Marketing Manager",
    rating: 4.8,
    location: "Los Angeles",
    rate: "$45-$70/hr",
    avatar: "TW",
  },
  {
    name: "Robert Fox",
    role: "Nursing, Real Estate",
    rating: 4.5,
    location: "New York",
    rate: "$30-$60/hr",
    avatar: "RF",
  },
  {
    name: "Sarah Johnson",
    role: "Software Developer",
    rating: 4.9,
    location: "San Francisco",
    rate: "$70-$100/hr",
    avatar: "SJ",
  },
  {
    name: "Michael Chen",
    role: "UI/UX Designer",
    rating: 4.7,
    location: "Seattle",
    rate: "$50-$75/hr",
    avatar: "MC",
  },
  {
    name: "Emily Rodriguez",
    role: "Content Writer",
    rating: 4.6,
    location: "Chicago",
    rate: "$35-$55/hr",
    avatar: "ER",
  },
  {
    name: "David Kim",
    role: "Data Analyst",
    rating: 4.4,
    location: "Boston",
    rate: "$60-$85/hr",
    avatar: "DK",
  },
  {
    name: "Lisa Anderson",
    role: "Graphic Designer",
    rating: 4.8,
    location: "Miami",
    rate: "$40-$65/hr",
    avatar: "LA",
  },
  {
    name: "James Martinez",
    role: "Web Developer",
    rating: 4.5,
    location: "Austin",
    rate: "$55-$80/hr",
    avatar: "JM",
  },
  {
    name: "Amanda White",
    role: "Social Media Manager",
    rating: 4.3,
    location: "Denver",
    rate: "$30-$50/hr",
    avatar: "AW",
  },
  {
    name: "Christopher Lee",
    role: "Project Manager",
    rating: 4.7,
    location: "Portland",
    rate: "$65-$90/hr",
    avatar: "CL",
  },
];

export default function HighestRatedFreelancers() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
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
    }, 4000); // Auto-scroll every 4 seconds

    return () => clearInterval(interval);
  }, [api]);

  // Calculate number of dots based on carousel snap points
  const totalDots = count > 0 ? count : Math.ceil(freelancers.length / 4);

  return (
    <section className="w-full bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Highest Rated Freelancers</h2>
            <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur</p>
          </div>
          <Button variant="outline" className="hidden md:inline-flex">
            Browse All
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
              {freelancers.map((freelancer, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4">
                  <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <Avatar className="h-20 w-20">
                        <AvatarFallback className="text-2xl">{freelancer.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{freelancer.name}</h3>
                        <p className="text-sm text-gray-600">{freelancer.role}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">{freelancer.rating}</span>
                      </div>
                      <div className="text-sm text-gray-600">{freelancer.location}</div>
                      <div className="text-sm font-semibold text-gray-900">{freelancer.rate}</div>
                      <Button variant="outline" className="w-full">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 md:left-4" />
            <CarouselNext className="right-2 md:right-4" />
          </Carousel>
        </div>

        {/* Dynamic Pagination Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalDots }).map((_, index) => {
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
                aria-label={`Go to slide ${index + 1}`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

