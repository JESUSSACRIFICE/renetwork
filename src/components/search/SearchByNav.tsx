"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, User, Building2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const tabs = [
  { label: "Service", href: "/search/services", icon: Briefcase },
  { label: "Profile", href: "/search/profiles", icon: User },
  { label: "Office", href: "/search/agencies", icon: Building2 },
];

const CONTROL_SIZE = "h-10 w-[180px]";

interface SearchByNavProps {
  filter?: React.ReactNode;
  sort?: React.ReactNode;
}

export default function SearchByNav({ filter, sort }: SearchByNavProps) {
  const pathname = usePathname();
  const activeTab = tabs.find((t) => pathname === t.href) ?? tabs[1];
  const ActiveIcon = activeTab.icon;

  return (
    <nav
      className="flex flex-wrap items-center gap-3 border-b border-border pb-4 mb-6 w-full"
      aria-label="Search by type"
    >
      {filter}
      {sort}
      <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={`${CONTROL_SIZE} justify-between`}
              aria-label="Search by type"
            >
            <span className="flex items-center gap-2">
              <ActiveIcon className="h-4 w-4" />
              {activeTab.label}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[180px]">
          {tabs.map(({ label, href, icon: Icon }) => (
            <DropdownMenuItem key={href} asChild>
              <Link href={href} className="flex items-center gap-2 cursor-pointer">
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
