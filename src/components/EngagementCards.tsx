"use client";

import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  MapPinned,
  Share2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CARDS = [
  {
    title: "Referral",
    description: "Send and track referrals across your trusted network.",
    href: "/referral",
    icon: Share2,
  },
  {
    title: "Teach",
    description: "Share expertise, host training, and grow your PSP profile.",
    href: "/dashboard/training",
    icon: GraduationCap,
  },
  {
    title: "Learn",
    description:
      "Referral program education, contracts, and compliance basics.",
    href: "/referral/learn/collaboration",
    icon: BookOpen,
  },
  {
    title: "Benefits",
    description: "See ROI, perks, and what members get from the platform.",
    href: "/roi",
    icon: Sparkles,
  },
  {
    title: "GPS navigation",
    description:
      "Browse pros on the map—zip, radius, and location-aware discovery.",
    href: "/browse",
    icon: MapPinned,
  },
] as const;

export default function EngagementCards() {
  return (
    <section
      className="w-full border-t border-border/50 bg-transparent px-4 py-8 sm:px-6 md:px-8 lg:py-10"
      aria-label="Referral, teach, learn, benefits, and GPS navigation"
    >
      <div className="mx-auto grid w-full max-w-none grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-5">
        {CARDS.map((card, index) => {
          const Icon = card.icon;
          const n = index + 1;
          return (
            <Link
              key={card.title}
              href={card.href}
              className={cn(
                "group flex flex-col rounded-xl border border-border/80 bg-card/90 p-4 shadow-sm transition-all",
                "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500/80",
              )}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mb-1 flex flex-wrap items-baseline gap-x-2 text-base font-semibold tracking-tight text-foreground group-hover:text-primary">
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-amber-900/20 bg-amber-500/20 px-1.5 text-xs font-bold tabular-nums text-amber-950 dark:border-amber-200/25 dark:bg-amber-400/20 dark:text-amber-50">
                  {n}
                </span>
                <span>{card.title}</span>
              </h3>
              <p className="text-xs leading-snug text-muted-foreground md:text-sm">
                {card.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
