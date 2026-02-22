"use client";

import { AdBlock } from "@/components/hero/AdBlock";
import { SearchForm } from "@/components/hero/SearchForm";

const NewHero = () => {
  return (
    <section className="relative overflow-hidden w-full py-4 sm:py-6 bg-gradient-to-r from-[#8B4513] via-[#A0522D] to-[#DEB887]">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="w-full relative z-10">
        <div className="flex flex-col lg:flex-row gap-4 w-full px-2 sm:px-4 overflow-hidden">
          {/* First Column - Advertisement Blocks */}
          <div className="hidden lg:flex flex-col space-y-4 w-full lg:w-[180px] shrink-0">
            <AdBlock
              gradientFrom="from-blue-600"
              gradientVia="via-indigo-600"
              gradientTo="to-purple-600"
              badgeText="Advertise Here"
              badgeColor="text-indigo-700"
              icon="📊"
            />
            <AdBlock
              gradientFrom="from-purple-600"
              gradientVia="via-pink-600"
              gradientTo="to-rose-600"
              badgeText="Advertise Here"
              badgeColor="text-purple-700"
              icon="💼"
            />
          </div>

          {/* Second Column - Search Form */}
          <div className="w-full flex justify-center lg:justify-start">
            <SearchForm defaultSearchType="Profile" />
          </div>

          {/* Third Column - Advertisement Blocks */}
          <div className="hidden lg:flex flex-col space-y-4 w-full lg:w-[180px] shrink-0">
            <AdBlock
              gradientFrom="from-emerald-600"
              gradientVia="via-teal-600"
              gradientTo="to-cyan-600"
              badgeText="Advertise Here"
              badgeColor="text-emerald-700"
              icon="📊"
            />
            <AdBlock
              gradientFrom="from-amber-600"
              gradientVia="via-orange-600"
              gradientTo="to-red-600"
              badgeText="Advertise Here"
              badgeColor="text-orange-700"
              icon="💼"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewHero;
