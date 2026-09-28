"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdBlock } from "@/components/hero/AdBlock";
import { SearchForm } from "@/components/hero/SearchForm";

/**
 * Owner Drive folder (public images copied into public/hero).
 * https://drive.google.com/drive/folders/1RfTS5E_OB4sK2FdGsgEL1pBjAwpYv998
 * The subfolder titled "NOT:" is excluded on purpose.
 */
const HERO_SLIDES = [
  { src: "/hero/01.jpg", alt: "RE Network wordmark on a commercial building" },
  { src: "/hero/02.jpg", alt: "Aerial view of a residential neighborhood" },
  { src: "/hero/03.jpg", alt: "LCRE Network concept page preview" },
  { src: "/hero/04.jpg", alt: "RE Network logo on a glass office tower" },
  {
    src: "/hero/05.jpg",
    alt: "Property fields from commercial through residential",
  },
  { src: "/hero/06.jpg", alt: "Sample house floor plan" },
  { src: "/hero/07.jpg", alt: "RE Network logo" },
  { src: "/hero/08.jpg", alt: "RE Network logo over a modern glass building" },
  { src: "/hero/09.jpg", alt: "RE Network mark on a sunset city skyline" },
  { src: "/hero/10.jpg", alt: "II LCRE Network logo" },
] as const;

const SLIDE_INTERVAL_MS = 7000;
const SLIDE_MS = 900;

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

/** Side ad blocks: business attire (top row) vs trades / industrial labour (bottom row). */
const AD_BUSINESS_LEFT =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80";
const AD_BUSINESS_RIGHT =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80";
const AD_LABOUR_LEFT =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80";
const AD_LABOUR_RIGHT =
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=400&q=80";

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
      setActiveIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [autoplayEpoch]);

  return (
    <section className="relative overflow-hidden w-full py-4 sm:py-6">
      {/* Background slideshow — track moves left, one slide at a time. */}
      <div
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
        aria-hidden
      >
        <div
          className="flex h-full ease-in-out motion-reduce:transition-none"
          style={{
            width: `${HERO_SLIDES.length * 100}%`,
            transform: `translate3d(-${(activeIndex * 100) / HERO_SLIDES.length}%, 0, 0)`,
            transitionProperty: "transform",
            transitionDuration: `${SLIDE_MS}ms`,
          }}
        >
          {HERO_SLIDES.map((slide, i) => (
            <div
              key={slide.src}
              className="relative h-full shrink-0"
              style={{ width: `${100 / HERO_SLIDES.length}%` }}
            >
              <Image
                src={slide.src}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Brand tint + readability over photos */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-r from-[#8B4513]/55 via-black/25 to-black/40"
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
              badgeText="Advertise Here"
              backgroundImage={AD_BUSINESS_LEFT}
              imageAlt="Business professional in formal attire"
            />
            <AdBlock
              badgeText="Advertise Here"
              backgroundImage={AD_LABOUR_LEFT}
              imageAlt="Skilled labour professional at work"
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
                  <div className="absolute inset-x-0 top-0 px-0.5 pb-0.5 pt-2">
                    <p className="text-center text-[0.5rem] font-bold uppercase leading-tight tracking-wide text-white drop-shadow-sm underline">
                      {banner.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex h-full min-h-0 flex-col space-y-4 w-[180px] shrink-0">
              <AdBlock
                badgeText="Advertise Here"
                backgroundImage={AD_BUSINESS_RIGHT}
                imageAlt="Business professional in office setting"
              />
              <AdBlock
                badgeText="Advertise Here"
                backgroundImage={AD_LABOUR_RIGHT}
                imageAlt="Industrial and warehouse labour professional"
              />
            </div>
          </div>
        </div>

        {/* Dots sit under the slides, not beside or above them. */}
        <div className="mt-4 flex w-full justify-center px-2 pb-2 sm:px-4">
          <div
            className="flex items-center gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur-sm"
            role="tablist"
            aria-label="Hero slideshow. Slides move left."
          >
            {HERO_SLIDES.map((slide, i) => {
              const selected = i === activeIndex;
              return (
                <button
                  key={slide.src}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-label={`${slide.alt}. Slide ${i + 1} of ${HERO_SLIDES.length}`}
                  onClick={() => goToSlide(i)}
                  className={[
                    "h-2.5 rounded-full transition-all duration-200",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                    selected ? "w-6 bg-white" : "w-2.5 bg-white/55 hover:bg-white/80",
                  ].join(" ")}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewHero;
