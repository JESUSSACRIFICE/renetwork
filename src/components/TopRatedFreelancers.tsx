"use client";

import Link from "next/link";
import { Star, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBrowseProfiles } from "@/hooks/use-professional-profiles";

const AVATAR_EMOJIS = ["🏢", "💰", "⚡", "⚖️"];

function formatRole(role: string) {
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

const TopRatedFreelancers = () => {
  const { data: profiles = [] } = useBrowseProfiles({});
  const freelancers = profiles
    .slice(0, 4)
    .sort((a, b) => b.rating - a.rating)
    .map((p, i) => {
      const roleLabel = p.roles?.[0];
      const title =
        p.title !== p.provider
          ? p.title
          : roleLabel
            ? formatRole(roleLabel)
            : "Professional";
      return {
        id: p.id,
        name: p.provider,
        title,
        location: p.location || "Location not specified",
        rating: p.rating,
        reviews: p.reviews,
        hourlyRate: p.price || 0,
        referralFee: p.referralFee,
        image: AVATAR_EMOJIS[i % AVATAR_EMOJIS.length],
        skills: p.skills || [],
      };
    });

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">
              Top Rated <span className="text-primary">RE Professionals</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Connect with our highest-rated real estate professionals
            </p>
          </div>
          <Link href="/search/services?sort=rating" className="hidden md:block">
            <Button variant="ghost" className="group">
              View All
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {freelancers.map((freelancer) => (
            <Link
              key={freelancer.id}
              href={`/profile/${freelancer.id}`}
              className="group"
            >
              <div className="bg-card rounded-2xl border p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-primary/50">
                {/* Avatar */}
                <div className="flex flex-col items-center text-center space-y-4 mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300">
                      {freelancer.image}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full border-4 border-card" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                      {freelancer.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {freelancer.title}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {freelancer.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="font-semibold">{freelancer.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({freelancer.reviews})
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2">
                    {(freelancer.skills || []).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-accent text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Rate */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {freelancer.hourlyRate > 0
                          ? "Starting at"
                          : "Referral Fee"}
                      </span>
                      <span className="text-xl font-bold text-primary">
                        {freelancer.hourlyRate > 0
                          ? `$${freelancer.hourlyRate}/hr`
                          : freelancer.referralFee || "Contact"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/search/services?sort=rating">
            <Button variant="outline" className="w-full">
              View All Freelancers
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TopRatedFreelancers;
