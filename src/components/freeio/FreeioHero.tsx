"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function FreeioHero() {
  return (
    <section className="relative w-full bg-gradient-to-r from-[#8B4513] via-[#A0522D] to-[#DEB887] py-16 sm:py-24 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="text-white space-y-6 z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Freelance Services For Your Business.
            </h1>
            <p className="text-lg sm:text-xl text-white/90">
              Millions of people use freeio.com to turn their ideas into reality.
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-lg p-4 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="What are you looking for?"
                    className="pl-10 h-12 border-gray-300"
                  />
                </div>
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="City, state, or zip"
                    className="h-12 border-gray-300"
                  />
                </div>
                <Button className="bg-gray-900 hover:bg-gray-800 text-white h-12 px-8">
                  Search
                </Button>
              </div>

              {/* Popular Searches */}
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-gray-600">Popular Searches:</span>
                {["Designer", "Developer", "Web", "IOS", "PHP", "Senior"].map((tag) => (
                  <button
                    key={tag}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative lg:block hidden">
            <div className="relative w-full h-[500px]">
              {/* Placeholder for woman with laptop image */}
              <div className="absolute inset-0 bg-white/10 rounded-lg flex items-center justify-center">
                <div className="text-center text-white/50">
                  <div className="w-32 h-32 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-4xl">👩‍💻</span>
                  </div>
                  <p className="text-sm">Woman with laptop image</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

