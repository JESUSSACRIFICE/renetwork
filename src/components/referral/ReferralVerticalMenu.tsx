"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FilterValues {
  type: string;
  category: string;
  service: string;
  location: string;
}

const typeOptions = [
  "Service",
  "Profile",
  "Agency",
];

const professionalCategories = [
  "Real Estate Agent",
  "Mortgage Consultant",
  "Real Estate Attorney",
  "Escrow Officer",
];

const tradeCategories = [
  "General Contractor",
  "Property Inspector",
  "Appraiser",
  "Architect",
  "Designer",
];

const serviceOptions = [
  "Residential",
  "Commercial",
  "Luxury",
  "Investment",
  "Industrial",
  "Agricultural",
];

const locationOptions = [
  "Los Angeles, CA",
  "New York, NY",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
];

export function ReferralVerticalMenu() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterValues>({
    type: "",
    category: "",
    service: "",
    location: "",
  });

  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({
    type: false,
    category: false,
    service: false,
    location: false,
  });

  const updateFilter = (key: keyof FilterValues, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const togglePopover = (key: string, open: boolean) => {
    setOpenPopovers((prev) => ({ ...prev, [key]: open }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });
    router.push(`/referral/results?${params.toString()}`);
  };

  const allCategories = [...professionalCategories, ...tradeCategories];

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-lg p-6">
      <div className="space-y-4">
        {/* Type - Service/Profile/Agency */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-900">Search By</label>
          <Popover
            open={openPopovers.type}
            onOpenChange={(open) => togglePopover("type", open)}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-full justify-between bg-white",
                  !filters.type && "text-muted-foreground"
                )}
              >
                {filters.type || "Service, Profile, or Agency"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-full" align="start">
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {typeOptions.map((option) => (
                      <CommandItem
                        key={option}
                        value={option}
                        onSelect={() => {
                          updateFilter("type", option);
                          togglePopover("type", false);
                        }}
                      >
                        {option}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Category - Professional/Trade */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-900">Category</label>
          <Popover
            open={openPopovers.category}
            onOpenChange={(open) => togglePopover("category", open)}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-full justify-between bg-white",
                  !filters.category && "text-muted-foreground"
                )}
              >
                {filters.category || "Select category..."}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-full" align="start">
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {allCategories.map((option) => (
                      <CommandItem
                        key={option}
                        value={option}
                        onSelect={() => {
                          updateFilter("category", option);
                          togglePopover("category", false);
                        }}
                      >
                        {option}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Service Type */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-900">Service Type</label>
          <Popover
            open={openPopovers.service}
            onOpenChange={(open) => togglePopover("service", open)}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-full justify-between bg-white",
                  !filters.service && "text-muted-foreground"
                )}
              >
                {filters.service || "Select service type..."}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-full" align="start">
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {serviceOptions.map((option) => (
                      <CommandItem
                        key={option}
                        value={option}
                        onSelect={() => {
                          updateFilter("service", option);
                          togglePopover("service", false);
                        }}
                      >
                        {option}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-900">Location</label>
          <Popover
            open={openPopovers.location}
            onOpenChange={(open) => togglePopover("location", open)}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-full justify-between bg-white",
                  !filters.location && "text-muted-foreground"
                )}
              >
                {filters.location || "Select location..."}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-full" align="start">
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {locationOptions.map((option) => (
                      <CommandItem
                        key={option}
                        value={option}
                        onSelect={() => {
                          updateFilter("location", option);
                          togglePopover("location", false);
                        }}
                      >
                        {option}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Action Button */}
        <div className="flex gap-3 pt-2">
          <Button onClick={applyFilters} className="flex-1" size="lg">
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}

