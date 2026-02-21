"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  ChevronDown,
  DollarSign,
  Home,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

// Service type options with their related fields
const SERVICE_TYPES = {
  professional: {
    label: "Professional Services",
    icon: Home,
    options: [
      { value: "real_estate_agent", label: "Real Estate Agent" },
      { value: "mortgage_consultant", label: "Mortgage Consultant" },
      { value: "real_estate_attorney", label: "Real Estate Attorney" },
      { value: "escrow_officer", label: "Escrow Officer" },
      { value: "appraiser", label: "Appraiser" },
      { value: "title_officer", label: "Title Officer" },
    ],
  },
  trade: {
    label: "Trade Services",
    icon: Wrench,
    options: [
      { value: "general_contractor", label: "General Contractor" },
      { value: "electrician", label: "Electrician" },
      { value: "plumber", label: "Plumber" },
      { value: "hvac_technician", label: "HVAC Technician" },
      { value: "roofer", label: "Roofer" },
      { value: "landscaper", label: "Landscaper" },
    ],
  },
};

// Property fields based on service type
const PROPERTY_FIELDS = {
  all: [
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "multi_unit", label: "Multi-Unit (4+)" },
    { value: "industrial", label: "Industrial" },
    { value: "agricultural", label: "Agricultural" },
    { value: "land", label: "Land Development" },
  ],
};

// Property conditions
const PROPERTY_CONDITIONS = [
  { value: "new_construction", label: "New Construction" },
  { value: "renovated", label: "Recently Renovated" },
  { value: "move_in_ready", label: "Move-In Ready" },
  { value: "fixer_upper", label: "Fixer Upper" },
  { value: "distressed", label: "Distressed/REO" },
];

// Price demographics
const PRICE_RANGES = [
  { value: "economic", label: "Economic ($0 - $300K)" },
  { value: "mid", label: "Mid-Range ($300K - $800K)" },
  { value: "luxury", label: "Luxury ($800K+)" },
];

export const AdvancedSearchFilters = () => {
  const router = useRouter();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Basic filters
  const [keyword, setKeyword] = useState("");
  const [zipCode, setZipCode] = useState("");

  // Advanced filters
  const [serviceCategory, setServiceCategory] = useState<string>("");
  const [serviceType, setServiceType] = useState<string>("");
  const [propertyFields, setPropertyFields] = useState<string[]>([]);
  const [propertyConditions, setPropertyConditions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [customPriceRange, setCustomPriceRange] = useState<string>("");
  const [radius, setRadius] = useState(25);

  // Get available service types based on category
  const availableServiceTypes = serviceCategory
    ? SERVICE_TYPES[serviceCategory as keyof typeof SERVICE_TYPES]?.options ||
      []
    : [];

  // Reset dependent filters when category changes
  useEffect(() => {
    setServiceType("");
  }, [serviceCategory]);

  const handleSearch = () => {
    const params = new URLSearchParams();

    // Basic filters
    if (keyword.trim()) params.set("q", keyword);
    if (zipCode.trim()) params.set("zip", zipCode);
    if (radius !== 25) params.set("radius", radius.toString());

    // Advanced filters
    if (serviceCategory) params.set("service_category", serviceCategory);
    if (serviceType) params.set("service_type", serviceType);
    if (propertyFields.length > 0)
      params.set("fields", propertyFields.join(","));
    if (propertyConditions.length > 0)
      params.set("conditions", propertyConditions.join(","));
    if (customPriceRange) params.set("price_demo", customPriceRange);
    if (priceRange[0] > 0 || priceRange[1] < 5000) {
      params.set("price_min", priceRange[0].toString());
      params.set("price_max", priceRange[1].toString());
    }

    router.push(`/search/services?${params.toString()}`);
  };

  const handleFieldToggle = (field: string) => {
    setPropertyFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    );
  };

  const handleConditionToggle = (condition: string) => {
    setPropertyConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition],
    );
  };

  const clearFilters = () => {
    setKeyword("");
    setZipCode("");
    setServiceCategory("");
    setServiceType("");
    setPropertyFields([]);
    setPropertyConditions([]);
    setPriceRange([0, 5000]);
    setCustomPriceRange("");
    setRadius(25);
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="bg-card p-6 rounded-3xl shadow-2xl border-2 border-primary/10 hover:border-primary/20 transition-all duration-300">
        <div className="flex flex-col gap-4">
          {/* Top Row - Basic Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Service type or professional name..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-12 h-14 border-0 bg-muted/50 text-base focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
              />
            </div>
            <div className="relative md:w-56">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="ZIP Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-12 h-14 border-0 bg-muted/50 text-base focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
              />
            </div>
            <Button
              onClick={handleSearch}
              size="lg"
              className="h-14 px-10 bg-gradient-to-r from-secondary to-secondary-dark hover:shadow-xl transition-all duration-300 text-base font-semibold rounded-xl group"
            >
              Search
              <Search className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            </Button>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="text-primary hover:text-primary-dark"
            >
              <ChevronDown
                className={`mr-2 h-4 w-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`}
              />
              {isAdvancedOpen ? "Hide" : "Show"} Advanced Filters
            </Button>
            {(serviceCategory || serviceType || propertyFields.length > 0) && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-sm"
              >
                Clear All Filters
              </Button>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {isAdvancedOpen && (
            <div className="pt-4 border-t border-border space-y-6 animate-accordion-down">
              {/* Row 1: Service Category & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Service Category
                  </Label>
                  <Select
                    value={serviceCategory}
                    onValueChange={setServiceCategory}
                  >
                    <SelectTrigger className="h-12 bg-muted/50 border-0">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SERVICE_TYPES).map(
                        ([key, { label, icon: Icon }]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {label}
                            </div>
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Specific Service
                  </Label>
                  <Select
                    value={serviceType}
                    onValueChange={setServiceType}
                    disabled={!serviceCategory}
                  >
                    <SelectTrigger className="h-12 bg-muted/50 border-0">
                      <SelectValue
                        placeholder={
                          serviceCategory
                            ? "Select service..."
                            : "Choose category first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableServiceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Property Fields */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Property Fields (Multi-Select)
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-between bg-muted/50 border-0 hover:bg-muted"
                    >
                      <span className="text-muted-foreground">
                        {propertyFields.length > 0
                          ? `${propertyFields.length} field${propertyFields.length > 1 ? "s" : ""} selected`
                          : "Select property fields..."}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-full p-4 bg-popover z-50"
                    align="start"
                  >
                    <div className="space-y-3">
                      {PROPERTY_FIELDS.all.map((field) => (
                        <div
                          key={field.value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={field.value}
                            checked={propertyFields.includes(field.value)}
                            onCheckedChange={() =>
                              handleFieldToggle(field.value)
                            }
                          />
                          <Label
                            htmlFor={field.value}
                            className="cursor-pointer"
                          >
                            {field.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Row 3: Property Conditions */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Property Condition
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-between bg-muted/50 border-0 hover:bg-muted"
                    >
                      <span className="text-muted-foreground">
                        {propertyConditions.length > 0
                          ? `${propertyConditions.length} condition${propertyConditions.length > 1 ? "s" : ""} selected`
                          : "Select property conditions..."}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-full p-4 bg-popover z-50"
                    align="start"
                  >
                    <div className="space-y-3">
                      {PROPERTY_CONDITIONS.map((condition) => (
                        <div
                          key={condition.value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={condition.value}
                            checked={propertyConditions.includes(
                              condition.value,
                            )}
                            onCheckedChange={() =>
                              handleConditionToggle(condition.value)
                            }
                          />
                          <Label
                            htmlFor={condition.value}
                            className="cursor-pointer"
                          >
                            {condition.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Row 4: Price Range & Demographics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Price Range (Hourly Rate)
                  </Label>
                  <div className="space-y-4 pt-2">
                    <Slider
                      value={priceRange}
                      onValueChange={(value) =>
                        setPriceRange([value[0], value[1]])
                      }
                      max={5000}
                      step={50}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}/hr</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Price Demographics
                  </Label>
                  <Select
                    value={customPriceRange}
                    onValueChange={setCustomPriceRange}
                  >
                    <SelectTrigger className="h-12 bg-muted/50 border-0">
                      <SelectValue placeholder="Select price range..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_RANGES.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 5: Radius */}
              {zipCode && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Search Radius: {radius} miles
                  </Label>
                  <Slider
                    value={[radius]}
                    onValueChange={(value) => setRadius(value[0])}
                    max={100}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>
              )}

              {/* Active Filters Display */}
              {(serviceType ||
                propertyFields.length > 0 ||
                propertyConditions.length > 0) && (
                <div className="pt-4 border-t border-border">
                  <Label className="text-sm font-medium mb-2 block">
                    Active Filters:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {serviceType && (
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {
                          availableServiceTypes.find(
                            (t) => t.value === serviceType,
                          )?.label
                        }
                      </span>
                    )}
                    {propertyFields.map((field) => (
                      <span
                        key={field}
                        className="px-3 py-1 bg-secondary/10 text-secondary text-xs rounded-full"
                      >
                        {
                          PROPERTY_FIELDS.all.find((f) => f.value === field)
                            ?.label
                        }
                      </span>
                    ))}
                    {propertyConditions.map((condition) => (
                      <span
                        key={condition}
                        className="px-3 py-1 bg-accent text-accent-foreground text-xs rounded-full"
                      >
                        {
                          PROPERTY_CONDITIONS.find((c) => c.value === condition)
                            ?.label
                        }
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
