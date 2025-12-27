"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterValues {
  agent: string;
  vacancy: string;
  property: string;
  fields: string;
}

// Options for each filter
const agentOptions = [
  "Service",
  "Profile",
  "Agency",
  "Real Estate Agent",
  "Mortgage Consultant",
  "Contractor",
  "Inspector",
  "Attorney",
  "Appraiser",
];

const vacancyOptions = [
  "Architect",
  "Agent",
  "Builder",
  "Real Estate Agent",
  "Mortgage Broker",
  "Contractor",
  "Inspector",
  "Attorney",
  "Escrow Business Owner",
  "Appraiser",
];

const propertyOptions = [
  "Luxury",
  "Mid",
  "Economic",
  "Budget",
  "Premium",
  "Affordable",
];

const fieldsOptions = [
  "Commercial",
  "Residential",
  "Agricultural",
  "Industrial",
  "Luxury",
  "Investment",
];



export function VerticalDropdownMenu() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterValues>({
    agent: "",
    vacancy: "",
    property: "",
    fields: "",
  });

  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({
    agent: false,
    vacancy: false,
    property: false,
    fields: false,
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
    router.push(`/browse?${params.toString()}`);
  };

//   const clearFilters = () => {
//     setFilters({
//       agent: "",
//       vacancy: "",
//       property: "",
//       fields: "",
//     });
//   };

  // Filter options based on search input
  
  const filterOptions = (options: string[], search: string) => {
    if (!search) return options;
    return options.filter((option) =>
      option.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <div className="w-full bg-muted/30 border border-border rounded-lg shadow-lg p-6">
      <div className="space-y-4">
        {/* Agent - Autocomplete Input */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">Agent</label>
          <Popover
            open={openPopovers.agent}
            onOpenChange={(open) => togglePopover("agent", open)}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-full justify-between bg-background",
                  !filters.agent && "text-muted-foreground"
                )}
              >
                {filters.agent || "Ex. Service, Profile, Agency..."}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[300px]" align="start">
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {filterOptions(agentOptions, "").map((option) => (
                      <CommandItem
                        key={option}
                        value={option}
                        onSelect={() => {
                          updateFilter("agent", option);
                          togglePopover("agent", false);
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

        {/* Vacancy - Autocomplete Input */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">Vacancy</label>
          <Popover
            open={openPopovers.vacancy}
            onOpenChange={(open) => togglePopover("vacancy", open)}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-full justify-between bg-background",
                  !filters.vacancy && "text-muted-foreground"
                )}
              >
                {filters.vacancy || "Ex. Architect, Agent, Builder..."}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {filterOptions(vacancyOptions, "").map((option) => (
                      <CommandItem
                        key={option}
                        value={option}
                        onSelect={() => {
                          updateFilter("vacancy", option);
                          togglePopover("vacancy", false);
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

        {/* Property Condition - Autocomplete Input */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">Property Condition</label>
          <Popover
            open={openPopovers.property}
            onOpenChange={(open) => togglePopover("property", open)}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-full justify-between bg-background",
                  !filters.property && "text-muted-foreground"
                )}
              >
                {filters.property || "Ex. Luxury, mid, economic..."}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {filterOptions(propertyOptions, "").map((option) => (
                      <CommandItem
                        key={option}
                        value={option}
                        onSelect={() => {
                          updateFilter("property", option);
                          togglePopover("property", false);
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

        {/* Fields - Autocomplete Input */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">Fields</label>
          <Popover
            open={openPopovers.fields}
            onOpenChange={(open) => togglePopover("fields", open)}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-full justify-between bg-background",
                  !filters.fields && "text-muted-foreground"
                )}
              >
                {filters.fields || "Ex. Commercial, Residential,..."}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {filterOptions(fieldsOptions, "").map((option) => (
                      <CommandItem
                        key={option}
                        value={option}
                        onSelect={() => {
                          updateFilter("fields", option);
                          togglePopover("fields", false);
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

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button onClick={applyFilters} className="flex-1" size="lg">
            Search
          </Button>
          {/* <Button
            onClick={clearFilters}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            Clear All
          </Button> */}
        </div>
      </div>
    </div>
  );
}
