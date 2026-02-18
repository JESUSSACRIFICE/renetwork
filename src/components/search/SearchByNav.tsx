"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Service", href: "/search/services", icon: Briefcase },
  { label: "Profile", href: "/search/profiles", icon: User },
  { label: "Agency", href: "/search/agencies", icon: Building2 },
];

export default function SearchByNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap gap-2 border-b border-border pb-4 mb-6"
      aria-label="Search by type"
    >
      <span className="sr-only">Search by:</span>
      {tabs.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
