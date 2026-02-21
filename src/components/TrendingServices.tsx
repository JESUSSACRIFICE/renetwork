"use client";

import Link from "next/link";
import { Star, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const TrendingServices = () => {
  const services = [
    {
      title: "Professional Logo Design with Source Files",
      category: "Design & Creative",
      image: "🎨",
      provider: "Sarah Design Studio",
      rating: 4.9,
      reviews: 234,
      price: 150,
      bgColor: "from-orange-400/20 to-red-400/20",
    },
    {
      title: "Full Stack Web Application Development",
      category: "Development & IT",
      image: "💻",
      provider: "CodeCraft Solutions",
      rating: 5.0,
      reviews: 189,
      price: 1200,
      bgColor: "from-blue-400/20 to-cyan-400/20",
    },
    {
      title: "SEO Optimized Content Writing Package",
      category: "Writing & Content",
      image: "✍️",
      provider: "WordSmith Co",
      rating: 4.8,
      reviews: 156,
      price: 200,
      bgColor: "from-purple-400/20 to-pink-400/20",
    },
    {
      title: "Professional Video Editing & Motion Graphics",
      category: "Video & Animation",
      image: "🎬",
      provider: "Motion Masters",
      rating: 4.9,
      reviews: 298,
      price: 350,
      bgColor: "from-green-400/20 to-emerald-400/20",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-accent/20">
      <div className="container">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">
              Trending <span className="text-primary">Services</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Most popular services that businesses are booking right now
            </p>
          </div>
          <Link
            href="/search/services?trending=true"
            className="hidden md:block"
          >
            <Button variant="ghost" className="group">
              View All
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Link
              key={index}
              href={`/service/${service.title.toLowerCase().replace(/\s+/g, "-")}`}
              className="group"
            >
              <div className="bg-card rounded-2xl border overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/50">
                {/* Image */}
                <div
                  className={`aspect-[4/3] bg-gradient-to-br ${service.bgColor} relative overflow-hidden flex items-center justify-center`}
                >
                  <div className="text-7xl transform group-hover:scale-110 transition-transform duration-500">
                    {service.image}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-3 left-3 px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium">
                    {service.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                    {service.title}
                  </h3>

                  {/* Provider */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-sm">
                      {service.provider.charAt(0)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {service.provider}
                    </span>
                  </div>

                  {/* Rating & Price */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="font-semibold text-sm">
                        {service.rating}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({service.reviews})
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        Starting at
                      </div>
                      <div className="text-lg font-bold text-primary">
                        ${service.price}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/search/services?trending=true">
            <Button variant="outline" className="w-full">
              View All Trending Services
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingServices;
