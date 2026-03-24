"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdBlock } from "@/components/hero/AdBlock";
import { SearchForm } from "@/components/hero/SearchForm";

/** Warehouse & real-estate themed backgrounds (Unsplash, optimized width). */
const HERO_SLIDE_IMAGES = [
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1920&q=80",
] as const;

const SLIDE_INTERVAL_MS = 7000;
const FADE_MS = 1100;

/** Side column: promotional banner links (not tied to background slideshow). */
const SALES_BANNERS = [
  {
    title: "Top sales",
    href: "/search/profiles",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Most volume",
    href: "/search/services",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Awards",
    href: "/referral",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Tools",
    href: "/dashboard",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Featured posts",
    href: "/search/profiles",
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "News",
    href: "/search/agencies",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Shop",
    href: "/search/services",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Advertise",
    href: "/register",
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Forum",
    href: "/dashboard/messages",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Groups",
    href: "/search/profiles",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Invest",
    href: "/search/profiles",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Training",
    href: "/dashboard/training",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80",
  },
] as const;

function thumbSrc(fullSizeUrl: string) {
  return fullSizeUrl.replace("w=1920", "w=280").replace("q=80", "q=70");
}

const NewHero = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  /** Bumping this restarts the autoplay interval after a manual thumbnail pick. */
  const [autoplayEpoch, setAutoplayEpoch] = useState(0);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
    setAutoplayEpoch((e) => e + 1);
  }, []);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % HERO_SLIDE_IMAGES.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [autoplayEpoch]);

  return (
    <section className="relative overflow-hidden w-full py-4 sm:py-6">
      {/* Background slideshow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden
      >
        {HERO_SLIDE_IMAGES.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            className="object-cover transition-opacity ease-in-out"
            style={{
              opacity: i === activeIndex ? 1 : 0,
              transitionDuration: `${FADE_MS}ms`,
            }}
            sizes="100vw"
            priority={i === 0}
          />
        ))}
      </div>

      {/* Brand tint + readability over photos */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-r from-[#8B4513]/88 via-[#A0522D]/82 to-[#DEB887]/75"
        aria-hidden
      />

      {/* Decorative background elements */}
      <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none">
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

          {/* Third column: sales banners (2×6) + right ads — height matches two AdBlocks */}
          <div className="hidden lg:flex flex-row items-stretch gap-3 shrink-0 min-h-[calc(250px+1rem+250px)]">
            <div
              className="grid h-full min-h-0 w-[180px] shrink-0 grid-cols-2 grid-rows-[repeat(6,minmax(0,1fr))] gap-1.5 p-0 bg-transparent"
              aria-label="Sales and promotions"
            >
              {SALES_BANNERS.map((banner) => (
                <Link
                  key={banner.title}
                  href={banner.href}
                  className="group relative min-h-0 h-full w-full overflow-hidden rounded-sm border-2 border-black shadow-sm transition-transform duration-150 hover:z-[1] hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
                >
                  <Image
                    src={banner.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="90px"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/40 to-transparent"
                    aria-hidden
                  />
                  <div className="absolute inset-x-0 bottom-0 px-0.5 pb-0.5 pt-2">
                    <p className="text-center text-[0.5rem] font-bold uppercase leading-tight tracking-wide text-white drop-shadow-sm">
                      {banner.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex h-full min-h-0 flex-col space-y-4 w-[180px] shrink-0">
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

        {/* Background slideshow previews — one row, equal flex widths, no horizontal scroll */}
        <div className="mt-4 w-full min-w-0 px-2 sm:px-4 pb-1">
          <div
            className="flex w-full min-w-0 flex-nowrap gap-1 sm:gap-1.5 md:gap-2"
            role="tablist"
            aria-label="Hero background slides"
          >
            {HERO_SLIDE_IMAGES.map((src, i) => {
              const selected = i === activeIndex;
              return (
                <button
                  key={src}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-label={`Background ${i + 1} of ${HERO_SLIDE_IMAGES.length}`}
                  onClick={() => goToSlide(i)}
                  className={[
                    "relative h-10 min-w-0 flex-1 overflow-hidden border-2 border-black rounded-sm shadow-sm transition-opacity duration-200 sm:h-11 md:h-12",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/90",
                    selected
                      ? "z-[1] opacity-100 ring-2 ring-amber-400/90 ring-offset-1 ring-offset-transparent md:ring-offset-2"
                      : "opacity-[0.7] hover:opacity-100",
                  ].join(" ")}
                >
                  <Image
                    src={thumbSrc(src)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 8vw, (max-width: 1024px) 6vw, 5vw"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewHero;
