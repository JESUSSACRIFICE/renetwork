"use client";

import Image from "next/image";

/** Local assets under /public/awards — SVG cards render reliably without remote fetch. */
const AWARD_CARDS = [
  { src: "/awards/award-1.svg", alt: "Excellence recognition" },
  { src: "/awards/award-2.svg", alt: "Leadership distinction" },
  { src: "/awards/award-4.svg", alt: "Service excellence" },
  { src: "/awards/award-6.svg", alt: "Community impact" },
  { src: "/awards/award-1.svg", alt: "Partner program honor" },
  { src: "/awards/award-2.svg", alt: "Industry achievement" },
  { src: "/awards/award-4.svg", alt: "Client choice award" },
] as const;

export default function AwardsSection() {
  return (
    <section
      className="w-full border-t border-border/50 bg-transparent px-4 py-10 sm:px-6 md:px-8 md:py-12 lg:py-14"
      aria-labelledby="awards-heading"
    >
      <div className="mx-auto w-full max-w-none">
        <h2
          id="awards-heading"
          className="mb-8 text-center text-3xl font-bold tracking-tight text-foreground md:mb-10 md:text-4xl"
        >
          Awards
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin] snap-x snap-mandatory md:gap-4 lg:grid lg:grid-cols-7 lg:gap-4 lg:overflow-visible lg:pb-0 lg:snap-none">
          {AWARD_CARDS.map((award, index) => (
            <div
              key={`${award.src}-${index}`}
              className="w-[min(42vw,11rem)] shrink-0 snap-center sm:w-[min(32vw,12rem)] md:w-[min(24vw,13rem)] lg:w-auto lg:min-w-0"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-border bg-muted/80 shadow-sm ring-1 ring-border/40 transition-shadow hover:shadow-md">
                <Image
                  src={award.src}
                  alt={`${award.alt} (${index + 1} of ${AWARD_CARDS.length})`}
                  fill
                  unoptimized
                  className="object-contain p-4"
                  sizes="(max-width: 1024px) 45vw, 14vw"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
