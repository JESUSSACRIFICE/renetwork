"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Placeholder images - replace with actual images
import heroImage from "@/assets/hero-image.jpg";

interface FilterValues {
  find: string[];
  representation: string[];
  buyingTypes: string[];
  institutionTypes: string[];
  creditTypes: string[];
  psp: string[];
  agentTypes: string[];
  realEstateTypes: string[];
  crowdfundingTypes: string[];
  flooringIndoorTypes: string[];
  flooringOutdoorTypes: string[];
  fields: string[];
  commercialRetailTypes: string[];
  commercialRecreationalTypes: string[];
  commercialHospitalityTypes: string[];
  commercialOtherTypes: string[];
  multiUnitTypes: string[];
  multiUnitHospitalityTypes: string[];
  industrialTypes: string[];
  agricultureTypes: string[];
  residentialTypes: string[];
  otherTypes: string[];
  price: string[];
  percentageShare: string[];
  willingToTrain: string[];
  motive: string[];
}

// Options for dropdowns
const findOptions = ["Service", "Profile", "Agency", "Real Estate Agent", "Mortgage Consultant"];

// A-Z Psp Options organized alphabetically
const pspOptionsByLetter: Record<string, string[]> = {
  A: [
    "Accountant",
    "Agent",
    "Appraiser",
    "Architect",
    "Asbesto's",
    "Attorney's",
    "RE Attorney's",
    "Worker's Comp",
  ],
  B: [
    "Bookkeeper",
    "Broker",
    "Builder",
  ],
  C: [
    "Cleaner",
    "Concrete",
    "Contractor",
    "Construction",
    "Consultant",
    "Consultant's",
    "Crowdfunding",
  ],
  D: [
    "Developer",
  ],
  E: [
    "Electrician",
    "Escrow",
  ],
  F: [
    "Flooring",
    "Framer",
  ],
  G: [
    "Gardening",
  ],
  H: [
    "HVAC",
  ],
  I: [
    "Investor",
  ],
  J: [
    "Janitorial",
  ],
  L: [
    "Landscaper",
    "Loan",
    "Loan Executive",
    "Loan Originator",
    "Loan Processor",
  ],
  M: [
    "Mortgage",
    "Mover's",
  ],
  P: [
    "Painter",
    "Pavement",
    "Pest",
    "Professional's",
    "Plumber",
    "Pool",
    "Pressure Washer",
  ],
  R: [
    "Real Estate",
    "Roofing",
  ],
  S: [
    "Sand-Blasting",
    "Solar",
    "Squat-Removal",
  ],
  T: [
    "Taxes",
    "Transaction Coordinator",
    "Trash Bin Cleaner",
  ],
  W: [
    "Wholesaler",
    "Welder",
    "Window Cleaner",
  ],
};

// Flatten all options for the main list
const pspOptions = Object.values(pspOptionsByLetter).flat();

// Agent nested options (updated with all options)
const agentOptions = [
  "Escrow",
  "Insurance",
  "Real Estate",
  "Selling",
  "Sell-to-Buy",
  "Buying",
  "Buy-to-Sell",
  "Leasing",
  "Consulting",
  "All",
];

// Real Estate nested options (under Agent > Real Estate)
const realEstateOptions = ["Selling", "Buying", "Leasing", "All"];

// Crowdfunding nested options
const crowdfundingOptions = [
  "Accreditation",
  "Accredited",
  "Non Accredited",
];

// Flooring nested options
const flooringIndoorOptions = ["Asphalt", "Tile"];
const flooringOutdoorOptions = ["Asphalt", "Concrete", "Gravel", "Rock", "Stone"];
const representationOptions = ["Selling", "Leasing/Renting", "Consulting", "Buying", "Institution", "Crowdfunding", "All of the above"];
const buyingOptions = ["Buying", "Cash", "Owner Finance", "Credit", "Others"];
const institutionOptions = ["Mortgage", "Bank", "Already have"];
const creditOptions = ["Already acquired loan", "Need Loan"];
// Fields options with nested structure
const fieldsOptions = ["Commercial", "Multi-Unit 4+ Unit's with FCRED because of higher and best use", "Industrial", "Agriculture", "Residential", "Other", "All of the above"];

// Commercial nested options
const commercialRetailOptions = [
  "Single",
  "Anchor",
  "Mall",
  "Strip",
  "Out-door",
  "In-door",
  "Recreational",
  "Business'es",
  "All of the above",
];

const commercialRecreationalOptions = [
  "Water-Park",
  "Amusement Park",
];

const commercialHospitalityOptions = [
  "Hotel's",
  "Motel's",
];

// Multi-Unit 4+ Unit's nested options
const multiUnitOptions = [
  "Sky-Scraper's",
  "Office",
  "Living",
  "Hospitality",
  "Mobile Home Park",
  "All of the above",
];

const multiUnitHospitalityOptions = [
  "Hotel's",
  "Motel's",
];

// Industrial nested options
const industrialOptions = [
  "Factories",
  "Fabrication's",
  "Warehouse",
  "Distribution's",
  "Distribution's Mixed-Use",
  "Junk Yards",
  "All of the above",
];

// Agriculture nested options
const agricultureOptions = [
  "Crop's",
  "Livestock",
  "Acreage",
  "All of the above",
];

// Residential nested options
const residentialOptions = [
  "House",
  "-4 Unit's (or less; if more, see multi-unit)",
  "Condo's",
  "All of the above",
];

// Other nested options
const otherOptions = [
  "Land",
  "Mixed-Use",
  "Water-Front",
  "Hills-Mountrain's",
  "Acreage",
  "Land Developement",
  "All of the above",
];
const priceOptions = ["Luxury", "Mid", "Economic", "Budget", "Premium", "Affordable"];
const percentageShareOptions = ["10%", "20%", "30%", "40%", "50%"];
const willingToTrainOptions = ["Yes", "No", "Maybe"];
const motiveOptions = ["Serious", "Wasting time", "Exploring", "Ready to hire"];

// Promotional banner data
const mainBannerSlides = [
  {
    id: 1,
    title: "BABY & TOYS",
    subtitle: "COMING SOON!",
    description: "Save up to 50% on amazing deals!",
    dateRange: "November 30 to December 04",
    theme: "baby-toys",
  },
  {
    id: 2,
    title: "SUMMER SALE",
    subtitle: "NEW COLLECTION",
    description: "Get up to 40% off on summer essentials!",
    dateRange: "June 01 to June 15",
    theme: "summer",
  },
];

const promotionalBanners = [
  {
    id: 1,
    title: "SEA TRAVEL",
    subtitle: "New Available!",
    price: "$246,00",
    theme: "sea-travel",
  },
  {
    id: 2,
    title: "BEACH WEAR",
    subtitle: "Shop Now",
    price: "STARTING FROM $300,00",
    theme: "beach-wear",
  },
  {
    id: 3,
    title: "76% OFF",
    subtitle: "EVERY THING!",
    action: "SHOP NOW >",
    theme: "sale",
  },
  {
    id: 4,
    title: "ON THIS FRIDAY SALE",
    subtitle: "50%OFF",
    theme: "friday-sale",
  },
  {
    id: 5,
    title: "HAPPY CHRISTMAS SALE",
    price: "$400,00",
    theme: "christmas",
  },
  {
    id: 6,
    title: "ON THIS FRIDAY SALE",
    price: "STARTING FROM $359.00",
    theme: "friday-sale-2",
  },
];

// Multi-select component with inline expansion
interface MultiSelectProps {
  label: string;
  placeholder: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}

const MultiSelect = ({ label, placeholder, options, value, onChange }: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const displayValue = value.length > 0 ? `${value.join(", ")} (Selected)` : placeholder;

  return (
    <div className="space-y-1" ref={containerRef}>
      <label className="text-sm font-bold text-foreground">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          value.length > 0 ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <span className="truncate">{displayValue}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 opacity-50" />
        ) : (
          <ChevronDown className="h-4 w-4 opacity-50" />
        )}
      </button>
      {isOpen && (
        <div className="w-full mt-1 rounded-md border border-input bg-popover shadow-md">
          <div className="max-h-60 overflow-y-auto p-1">
            {options.map((option) => (
              <label
                key={option}
                className={cn(
                  "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                  value.includes(option) && "bg-accent/50"
                )}
              >
                <Checkbox
                  checked={value.includes(option)}
                  onCheckedChange={() => toggleOption(option)}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// PSP MultiSelect with nested Agent, Real Estate, Crowdfunding, and Flooring options
interface PSPMultiSelectProps {
  label: string;
  placeholder: string;
  optionsByLetter: Record<string, string[]>;
  value: string[];
  onChange: (value: string[]) => void;
  agentValue: string[];
  onAgentChange: (value: string[]) => void;
  agentOptions: string[];
  realEstateValue: string[];
  onRealEstateChange: (value: string[]) => void;
  realEstateOptions: string[];
  crowdfundingValue: string[];
  onCrowdfundingChange: (value: string[]) => void;
  crowdfundingOptions: string[];
  flooringIndoorValue: string[];
  onFlooringIndoorChange: (value: string[]) => void;
  flooringIndoorOptions: string[];
  flooringOutdoorValue: string[];
  onFlooringOutdoorChange: (value: string[]) => void;
  flooringOutdoorOptions: string[];
}

const PSPMultiSelect = ({
  label,
  placeholder,
  optionsByLetter,
  value,
  onChange,
  agentValue,
  onAgentChange,
  agentOptions,
  realEstateValue,
  onRealEstateChange,
  realEstateOptions,
  crowdfundingValue,
  onCrowdfundingChange,
  crowdfundingOptions,
  flooringIndoorValue,
  onFlooringIndoorChange,
  flooringIndoorOptions,
  flooringOutdoorValue,
  onFlooringOutdoorChange,
  flooringOutdoorOptions,
}: PSPMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
      // Clear nested selections if parent is deselected
      if (option === "Agent") {
        onAgentChange([]);
        onRealEstateChange([]);
      } else if (option === "Crowdfunding") {
        onCrowdfundingChange([]);
      } else if (option === "Flooring") {
        onFlooringIndoorChange([]);
        onFlooringOutdoorChange([]);
      }
    } else {
      onChange([...value, option]);
    }
  };

  const toggleAgentOption = (option: string) => {
    if (agentValue.includes(option)) {
      onAgentChange(agentValue.filter((item) => item !== option));
      // Clear real estate selections if Real Estate is deselected
      if (option === "Real Estate") {
        onRealEstateChange([]);
      }
    } else {
      onAgentChange([...agentValue, option]);
    }
  };

  const toggleRealEstateOption = (option: string) => {
    if (realEstateValue.includes(option)) {
      onRealEstateChange(realEstateValue.filter((item) => item !== option));
    } else {
      onRealEstateChange([...realEstateValue, option]);
    }
  };

  const displayValue = value.length > 0 ? `${value.join(", ")} (Selected)` : placeholder;

  return (
    <div className="space-y-1" ref={containerRef}>
      <label className="text-sm font-bold text-foreground">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          value.length > 0 ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <span className="truncate">{displayValue}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 opacity-50" />
        ) : (
          <ChevronDown className="h-4 w-4 opacity-50" />
        )}
      </button>
      {isOpen && (
        <div className="w-full mt-1 rounded-md border border-input bg-popover shadow-md">
          <div className="max-h-60 overflow-y-auto p-1">
            {Object.entries(optionsByLetter).map(([letter, options]) => (
              <div key={letter}>
                {/* Letter header */}
                <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase sticky top-0 bg-popover z-10">
                  {letter}...
                </div>
                {options.map((option) => (
                  <div key={option}>
                    <label
                      className={cn(
                        "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                        value.includes(option) && "bg-accent/50"
                      )}
                    >
                      <Checkbox
                        checked={value.includes(option)}
                        onCheckedChange={() => toggleOption(option)}
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                    {/* Nested Agent options - always visible */}
                    {option === "Agent" && (
                      <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/30 pl-2">
                        {agentOptions.map((agentOption) => (
                          <div key={agentOption}>
                            <label
                              className={cn(
                                "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                                agentValue.includes(agentOption) && "bg-accent/50"
                              )}
                            >
                              <Checkbox
                                checked={agentValue.includes(agentOption)}
                                onCheckedChange={() => toggleAgentOption(agentOption)}
                              />
                              <span className="text-sm">{agentOption}</span>
                            </label>
                            {/* Nested Real Estate options - always visible */}
                            {agentOption === "Real Estate" && (
                              <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/20 pl-2">
                                {realEstateOptions.map((reOption) => (
                                  <label
                                    key={reOption}
                                    className={cn(
                                      "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                                      realEstateValue.includes(reOption) && "bg-accent/50"
                                    )}
                                  >
                                    <Checkbox
                                      checked={realEstateValue.includes(reOption)}
                                      onCheckedChange={() => toggleRealEstateOption(reOption)}
                                    />
                                    <span className="text-sm">{reOption}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Nested Crowdfunding options - always visible */}
                    {option === "Crowdfunding" && (
                      <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/30 pl-2">
                        <div className="text-xs font-semibold text-muted-foreground mb-1">Fields:</div>
                        {crowdfundingOptions.map((cfOption) => (
                          <label
                            key={cfOption}
                            className={cn(
                              "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                              crowdfundingValue.includes(cfOption) && "bg-accent/50"
                            )}
                          >
                            <Checkbox
                              checked={crowdfundingValue.includes(cfOption)}
                              onCheckedChange={() => {
                                if (crowdfundingValue.includes(cfOption)) {
                                  onCrowdfundingChange(crowdfundingValue.filter((item) => item !== cfOption));
                                } else {
                                  onCrowdfundingChange([...crowdfundingValue, cfOption]);
                                }
                              }}
                            />
                            <span className="text-sm">{cfOption}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {/* Nested Flooring options - always visible */}
                    {option === "Flooring" && (
                      <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/30 pl-2">
                        <div className="text-xs font-semibold text-muted-foreground mb-1">Indoor:</div>
                        {flooringIndoorOptions.map((indoorOption) => (
                          <label
                            key={indoorOption}
                            className={cn(
                              "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                              flooringIndoorValue.includes(indoorOption) && "bg-accent/50"
                            )}
                          >
                            <Checkbox
                              checked={flooringIndoorValue.includes(indoorOption)}
                              onCheckedChange={() => {
                                if (flooringIndoorValue.includes(indoorOption)) {
                                  onFlooringIndoorChange(flooringIndoorValue.filter((item) => item !== indoorOption));
                                } else {
                                  onFlooringIndoorChange([...flooringIndoorValue, indoorOption]);
                                }
                              }}
                            />
                            <span className="text-sm">{indoorOption}</span>
                          </label>
                        ))}
                        <div className="text-xs font-semibold text-muted-foreground mb-1 mt-2">Outdoor:</div>
                        {flooringOutdoorOptions.map((outdoorOption) => (
                          <label
                            key={outdoorOption}
                            className={cn(
                              "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                              flooringOutdoorValue.includes(outdoorOption) && "bg-accent/50"
                            )}
                          >
                            <Checkbox
                              checked={flooringOutdoorValue.includes(outdoorOption)}
                              onCheckedChange={() => {
                                if (flooringOutdoorValue.includes(outdoorOption)) {
                                  onFlooringOutdoorChange(flooringOutdoorValue.filter((item) => item !== outdoorOption));
                                } else {
                                  onFlooringOutdoorChange([...flooringOutdoorValue, outdoorOption]);
                                }
                              }}
                            />
                            <span className="text-sm">{outdoorOption}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Representation MultiSelect with nested Buying, Institution, and Credit options
interface RepresentationMultiSelectProps {
  label: string;
  placeholder: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  buyingValue: string[];
  onBuyingChange: (value: string[]) => void;
  buyingOptions: string[];
  institutionValue: string[];
  onInstitutionChange: (value: string[]) => void;
  institutionOptions: string[];
  creditValue: string[];
  onCreditChange: (value: string[]) => void;
  creditOptions: string[];
}

const RepresentationMultiSelect = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  buyingValue,
  onBuyingChange,
  buyingOptions,
  institutionValue,
  onInstitutionChange,
  institutionOptions,
  creditValue,
  onCreditChange,
  creditOptions,
}: RepresentationMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasBuyingSelected = value.includes("Buying");
  const hasInstitutionSelected = value.includes("Institution");
  const hasCreditSelected = buyingValue.includes("Credit");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
      // Clear nested selections if parent is deselected
      if (option === "Buying") {
        onBuyingChange([]);
        onCreditChange([]);
      } else if (option === "Institution") {
        onInstitutionChange([]);
      }
    } else {
      onChange([...value, option]);
    }
  };

  const toggleBuyingOption = (option: string) => {
    if (buyingValue.includes(option)) {
      onBuyingChange(buyingValue.filter((item) => item !== option));
      // Clear credit selections if Credit is deselected
      if (option === "Credit") {
        onCreditChange([]);
      }
    } else {
      onBuyingChange([...buyingValue, option]);
    }
  };

  const toggleInstitutionOption = (option: string) => {
    if (institutionValue.includes(option)) {
      onInstitutionChange(institutionValue.filter((item) => item !== option));
    } else {
      onInstitutionChange([...institutionValue, option]);
    }
  };

  const toggleCreditOption = (option: string) => {
    if (creditValue.includes(option)) {
      onCreditChange(creditValue.filter((item) => item !== option));
    } else {
      onCreditChange([...creditValue, option]);
    }
  };

  const displayValue = value.length > 0 ? `${value.join(", ")} (Selected)` : placeholder;

  return (
    <div className="space-y-1" ref={containerRef}>
      <label className="text-sm font-bold text-foreground">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          value.length > 0 ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <span className="truncate">{displayValue}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 opacity-50" />
        ) : (
          <ChevronDown className="h-4 w-4 opacity-50" />
        )}
      </button>
      {isOpen && (
        <div className="w-full mt-1 rounded-md border border-input bg-popover shadow-md">
          <div className="max-h-60 overflow-y-auto p-1">
            {options.map((option) => (
              <div key={option}>
                <label
                  className={cn(
                    "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                    value.includes(option) && "bg-accent/50"
                  )}
                >
                  <Checkbox
                    checked={value.includes(option)}
                    onCheckedChange={() => toggleOption(option)}
                  />
                  <span className="text-sm">{option}</span>
                </label>
                {/* Nested Buying options - always visible */}
                {option === "Buying" && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/30 pl-2">
                    <div className="text-xs font-semibold text-muted-foreground mb-1">Buying Types:</div>
                    {buyingOptions.map((buyingOption) => (
                      <div key={buyingOption}>
                        <label
                          className={cn(
                            "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                            buyingValue.includes(buyingOption) && "bg-accent/50"
                          )}
                        >
                          <Checkbox
                            checked={buyingValue.includes(buyingOption)}
                            onCheckedChange={() => toggleBuyingOption(buyingOption)}
                          />
                          <span className="text-sm">{buyingOption}</span>
                        </label>
                        {/* Nested Credit options - always visible */}
                        {buyingOption === "Credit" && (
                          <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/20 pl-2">
                            <div className="text-xs font-semibold text-muted-foreground mb-1">Credit Types:</div>
                            {creditOptions.map((creditOption) => (
                              <label
                                key={creditOption}
                                className={cn(
                                  "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                                  creditValue.includes(creditOption) && "bg-accent/50"
                                )}
                              >
                                <Checkbox
                                  checked={creditValue.includes(creditOption)}
                                  onCheckedChange={() => toggleCreditOption(creditOption)}
                                />
                                <span className="text-sm">{creditOption}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* Nested Institution options - always visible */}
                {option === "Institution" && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/30 pl-2">
                    <div className="text-xs font-semibold text-muted-foreground mb-1">Institution Types:</div>
                    {institutionOptions.map((institutionOption) => (
                      <label
                        key={institutionOption}
                        className={cn(
                          "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                          institutionValue.includes(institutionOption) && "bg-accent/50"
                        )}
                      >
                        <Checkbox
                          checked={institutionValue.includes(institutionOption)}
                          onCheckedChange={() => toggleInstitutionOption(institutionOption)}
                        />
                        <span className="text-sm">{institutionOption}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Fields MultiSelect with nested Commercial, Industrial, Agriculture, Residential, and Other options
interface FieldsMultiSelectProps {
  label: string;
  placeholder: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  commercialRetailValue: string[];
  onCommercialRetailChange: (value: string[]) => void;
  commercialRetailOptions: string[];
  commercialRecreationalValue: string[];
  onCommercialRecreationalChange: (value: string[]) => void;
  commercialRecreationalOptions: string[];
  commercialHospitalityValue: string[];
  onCommercialHospitalityChange: (value: string[]) => void;
  commercialHospitalityOptions: string[];
  commercialOtherValue: string[];
  onCommercialOtherChange: (value: string[]) => void;
  multiUnitValue: string[];
  onMultiUnitChange: (value: string[]) => void;
  multiUnitOptions: string[];
  multiUnitHospitalityValue: string[];
  onMultiUnitHospitalityChange: (value: string[]) => void;
  multiUnitHospitalityOptions: string[];
  industrialValue: string[];
  onIndustrialChange: (value: string[]) => void;
  industrialOptions: string[];
  agricultureValue: string[];
  onAgricultureChange: (value: string[]) => void;
  agricultureOptions: string[];
  residentialValue: string[];
  onResidentialChange: (value: string[]) => void;
  residentialOptions: string[];
  otherValue: string[];
  onOtherChange: (value: string[]) => void;
  otherOptions: string[];
}

const FieldsMultiSelect = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  commercialRetailValue,
  onCommercialRetailChange,
  commercialRetailOptions,
  commercialRecreationalValue,
  onCommercialRecreationalChange,
  commercialRecreationalOptions,
  commercialHospitalityValue,
  onCommercialHospitalityChange,
  commercialHospitalityOptions,
  commercialOtherValue,
  onCommercialOtherChange,
  multiUnitValue,
  onMultiUnitChange,
  multiUnitOptions,
  multiUnitHospitalityValue,
  onMultiUnitHospitalityChange,
  multiUnitHospitalityOptions,
  industrialValue,
  onIndustrialChange,
  industrialOptions,
  agricultureValue,
  onAgricultureChange,
  agricultureOptions,
  residentialValue,
  onResidentialChange,
  residentialOptions,
  otherValue,
  onOtherChange,
  otherOptions,
}: FieldsMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
      // Clear nested selections if parent is deselected
      if (option === "Commercial") {
        onCommercialRetailChange([]);
        onCommercialRecreationalChange([]);
        onCommercialHospitalityChange([]);
        onCommercialOtherChange([]);
      } else if (option === "Multi-Unit 4+ Unit's with FCRED because of higher and best use") {
        onMultiUnitChange([]);
        onMultiUnitHospitalityChange([]);
      } else if (option === "Industrial") {
        onIndustrialChange([]);
      } else if (option === "Agriculture") {
        onAgricultureChange([]);
      } else if (option === "Residential") {
        onResidentialChange([]);
      } else if (option === "Other") {
        onOtherChange([]);
      }
    } else {
      onChange([...value, option]);
    }
  };

  const displayValue = value.length > 0 ? `${value.join(", ")} (Selected)` : placeholder;

  return (
    <div className="space-y-1" ref={containerRef}>
      <label className="text-sm font-bold text-foreground">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          value.length > 0 ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <span className="truncate">{displayValue}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 opacity-50" />
        ) : (
          <ChevronDown className="h-4 w-4 opacity-50" />
        )}
      </button>
      {isOpen && (
        <div className="w-full mt-1 rounded-md border border-input bg-popover shadow-md">
          <div className="max-h-60 overflow-y-auto p-1">
            {options.map((option) => (
              <div key={option}>
                <label
                  className={cn(
                    "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                    value.includes(option) && "bg-accent/50"
                  )}
                >
                  <Checkbox
                    checked={value.includes(option)}
                    onCheckedChange={() => toggleOption(option)}
                  />
                  <span className="text-sm">{option}</span>
                </label>
                {/* Nested Commercial options - always visible */}
                {option === "Commercial" && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/30 pl-2">
                    {/* Retail */}
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-1">Retail:</div>
                      {commercialRetailOptions.map((retailOption) => (
                        <div key={retailOption}>
                          <label
                            className={cn(
                              "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                              commercialRetailValue.includes(retailOption) && "bg-accent/50"
                            )}
                          >
                            <Checkbox
                              checked={commercialRetailValue.includes(retailOption)}
                              onCheckedChange={() => {
                                if (commercialRetailValue.includes(retailOption)) {
                                  onCommercialRetailChange(commercialRetailValue.filter((item) => item !== retailOption));
                                } else {
                                  onCommercialRetailChange([...commercialRetailValue, retailOption]);
                                }
                              }}
                            />
                            <span className="text-sm">{retailOption}</span>
                          </label>
                          {/* Nested Recreational options under Retail > Recreational */}
                          {retailOption === "Recreational" && (
                            <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/20 pl-2">
                              {commercialRecreationalOptions.map((recOption) => (
                                <label
                                  key={recOption}
                                  className={cn(
                                    "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                                    commercialRecreationalValue.includes(recOption) && "bg-accent/50"
                                  )}
                                >
                                  <Checkbox
                                    checked={commercialRecreationalValue.includes(recOption)}
                                    onCheckedChange={() => {
                                      if (commercialRecreationalValue.includes(recOption)) {
                                        onCommercialRecreationalChange(commercialRecreationalValue.filter((item) => item !== recOption));
                                      } else {
                                        onCommercialRecreationalChange([...commercialRecreationalValue, recOption]);
                                      }
                                    }}
                                  />
                                  <span className="text-sm">{recOption}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Nested Multi-Unit 4+ Unit's options - always visible */}
                {option === "Multi-Unit 4+ Unit's with FCRED because of higher and best use" && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/30 pl-2">
                    {multiUnitOptions.map((muOption) => (
                      <div key={muOption}>
                        <label
                          className={cn(
                            "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                            multiUnitValue.includes(muOption) && "bg-accent/50"
                          )}
                        >
                          <Checkbox
                            checked={multiUnitValue.includes(muOption)}
                            onCheckedChange={() => {
                              if (multiUnitValue.includes(muOption)) {
                                onMultiUnitChange(multiUnitValue.filter((item) => item !== muOption));
                                // Clear hospitality selections if Hospitality is deselected
                                if (muOption === "Hospitality") {
                                  onMultiUnitHospitalityChange([]);
                                }
                              } else {
                                onMultiUnitChange([...multiUnitValue, muOption]);
                              }
                            }}
                          />
                          <span className="text-sm">{muOption}</span>
                        </label>
                        {/* Nested Hospitality options under Multi-Unit > Hospitality */}
                        {muOption === "Hospitality" && (
                          <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/20 pl-2">
                            {multiUnitHospitalityOptions.map((hospOption) => (
                              <label
                                key={hospOption}
                                className={cn(
                                  "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                                  multiUnitHospitalityValue.includes(hospOption) && "bg-accent/50"
                                )}
                              >
                                <Checkbox
                                  checked={multiUnitHospitalityValue.includes(hospOption)}
                                  onCheckedChange={() => {
                                    if (multiUnitHospitalityValue.includes(hospOption)) {
                                      onMultiUnitHospitalityChange(multiUnitHospitalityValue.filter((item) => item !== hospOption));
                                    } else {
                                      onMultiUnitHospitalityChange([...multiUnitHospitalityValue, hospOption]);
                                    }
                                  }}
                                />
                                <span className="text-sm">{hospOption}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* Nested Industrial options - always visible */}
                {option === "Industrial" && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/30 pl-2">
                    {industrialOptions.map((indOption) => (
                      <label
                        key={indOption}
                        className={cn(
                          "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                          industrialValue.includes(indOption) && "bg-accent/50"
                        )}
                      >
                        <Checkbox
                          checked={industrialValue.includes(indOption)}
                          onCheckedChange={() => {
                            if (industrialValue.includes(indOption)) {
                              onIndustrialChange(industrialValue.filter((item) => item !== indOption));
                            } else {
                              onIndustrialChange([...industrialValue, indOption]);
                            }
                          }}
                        />
                        <span className="text-sm">{indOption}</span>
                      </label>
                    ))}
                  </div>
                )}
                {/* Nested Agriculture options - always visible */}
                {option === "Agriculture" && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/30 pl-2">
                    {agricultureOptions.map((agOption) => (
                      <label
                        key={agOption}
                        className={cn(
                          "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                          agricultureValue.includes(agOption) && "bg-accent/50"
                        )}
                      >
                        <Checkbox
                          checked={agricultureValue.includes(agOption)}
                          onCheckedChange={() => {
                            if (agricultureValue.includes(agOption)) {
                              onAgricultureChange(agricultureValue.filter((item) => item !== agOption));
                            } else {
                              onAgricultureChange([...agricultureValue, agOption]);
                            }
                          }}
                        />
                        <span className="text-sm">{agOption}</span>
                      </label>
                    ))}
                  </div>
                )}
                {/* Nested Residential options - always visible */}
                {option === "Residential" && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/30 pl-2">
                    {residentialOptions.map((resOption) => (
                      <label
                        key={resOption}
                        className={cn(
                          "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                          residentialValue.includes(resOption) && "bg-accent/50"
                        )}
                      >
                        <Checkbox
                          checked={residentialValue.includes(resOption)}
                          onCheckedChange={() => {
                            if (residentialValue.includes(resOption)) {
                              onResidentialChange(residentialValue.filter((item) => item !== resOption));
                            } else {
                              onResidentialChange([...residentialValue, resOption]);
                            }
                          }}
                        />
                        <span className="text-sm">{resOption}</span>
                      </label>
                    ))}
                  </div>
                )}
                {/* Nested Other options - always visible */}
                {option === "Other" && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/30 pl-2">
                    {otherOptions.map((othOption) => (
                      <label
                        key={othOption}
                        className={cn(
                          "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                          otherValue.includes(othOption) && "bg-accent/50"
                        )}
                      >
                        <Checkbox
                          checked={otherValue.includes(othOption)}
                          onCheckedChange={() => {
                            if (otherValue.includes(othOption)) {
                              onOtherChange(otherValue.filter((item) => item !== othOption));
                            } else {
                              onOtherChange([...otherValue, othOption]);
                            }
                          }}
                        />
                        <span className="text-sm">{othOption}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const NewHero = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterValues>({
    find: [],
    representation: [],
    buyingTypes: [],
    institutionTypes: [],
    creditTypes: [],
    psp: [],
    agentTypes: [],
    realEstateTypes: [],
    crowdfundingTypes: [],
    flooringIndoorTypes: [],
    flooringOutdoorTypes: [],
    fields: [],
    commercialRetailTypes: [],
    commercialRecreationalTypes: [],
    commercialHospitalityTypes: [],
    commercialOtherTypes: [],
    multiUnitTypes: [],
    multiUnitHospitalityTypes: [],
    industrialTypes: [],
    agricultureTypes: [],
    residentialTypes: [],
    otherTypes: [],
    price: [],
    percentageShare: [],
    willingToTrain: [],
    motive: [],
  });

  // Check if Agent is selected in psp
  const isAgentSelected = filters.psp.includes("Agent");

  const handleSearch = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.append(key, value.join(","));
      }
    });
    router.push(`/browse?${params.toString()}`);
  };

  return (
    <section className="relative bg-gradient-to-br from-background via-primary/5 to-secondary/5 overflow-hidden w-full py-6">
      <div className="w-full">
        <div className="flex gap-4 w-full px-4 overflow-hidden">
          {/* First Column - Advertisement Blocks */}
          <div className="space-y-4 w-[180px]">
            {/* Top Ad Block */}
            <div className="relative w-[180px] h-[250px] rounded-lg overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-secondary/20 z-0">
                {/* Placeholder for ad image - replace with actual image */}
                <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-4xl">📊</span>
                    </div>
                    <span className="text-muted-foreground text-sm">Advertisement Space</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded z-10">
                Advertise Here
              </div>
            </div>

            {/* Bottom Ad Block */}
            <div className="relative w-[180px] h-[250px] rounded-lg overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-secondary/20 to-primary/20 z-0">
                {/* Placeholder for ad image - replace with actual image */}
                <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="w-24 h-24 mx-auto bg-secondary/20 rounded-full flex items-center justify-center">
                      <span className="text-4xl">💼</span>
                    </div>
                    <span className="text-muted-foreground text-sm">Advertisement Space</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded z-10">
                Advertise Here
              </div>
            </div>
          </div>

          {/* Second Column - Search Form */}
          <div className="w-full">
            <div className="bg-muted/30 overflow-y-auto w-[30%] border border-border rounded-lg shadow-lg px-4 py-2 space-y-3 h-[520px]">
              <div className="space-y-1">
                {/* Find */}
                <MultiSelect
                  label="Find"
                  placeholder="Ex. Service, Profile, Agency..."
                  options={findOptions}
                  value={filters.find}
                  onChange={(value) => setFilters({ ...filters, find: value })}
                />

                {/* A-Z Psp */}
                <PSPMultiSelect
                  label="A-Z Psp"
                  placeholder="Ex. Architect, Agent, Builder..."
                  optionsByLetter={pspOptionsByLetter}
                  value={filters.psp}
                  onChange={(value) => setFilters({ ...filters, psp: value })}
                  agentValue={filters.agentTypes}
                  onAgentChange={(value) => setFilters({ ...filters, agentTypes: value })}
                  agentOptions={agentOptions}
                  realEstateValue={filters.realEstateTypes}
                  onRealEstateChange={(value) => setFilters({ ...filters, realEstateTypes: value })}
                  realEstateOptions={realEstateOptions}
                  crowdfundingValue={filters.crowdfundingTypes}
                  onCrowdfundingChange={(value) => setFilters({ ...filters, crowdfundingTypes: value })}
                  crowdfundingOptions={crowdfundingOptions}
                  flooringIndoorValue={filters.flooringIndoorTypes}
                  onFlooringIndoorChange={(value) => setFilters({ ...filters, flooringIndoorTypes: value })}
                  flooringIndoorOptions={flooringIndoorOptions}
                  flooringOutdoorValue={filters.flooringOutdoorTypes}
                  onFlooringOutdoorChange={(value) => setFilters({ ...filters, flooringOutdoorTypes: value })}
                  flooringOutdoorOptions={flooringOutdoorOptions}
                />

                {/* Representation - shown when Agent is selected */}
                {isAgentSelected && (
                  <RepresentationMultiSelect
                    label="Representation"
                    placeholder="Select representation types..."
                    options={representationOptions}
                    value={filters.representation}
                    onChange={(value) => setFilters({ ...filters, representation: value })}
                    buyingValue={filters.buyingTypes}
                    onBuyingChange={(value) => setFilters({ ...filters, buyingTypes: value })}
                    buyingOptions={buyingOptions}
                    institutionValue={filters.institutionTypes}
                    onInstitutionChange={(value) => setFilters({ ...filters, institutionTypes: value })}
                    institutionOptions={institutionOptions}
                    creditValue={filters.creditTypes}
                    onCreditChange={(value) => setFilters({ ...filters, creditTypes: value })}
                    creditOptions={creditOptions}
                  />
                )}

                {/* Fields */}
                <FieldsMultiSelect
                  label="Fields"
                  placeholder="Ex. Commercial, Residential,..."
                  options={fieldsOptions}
                  value={filters.fields}
                  onChange={(value) => setFilters({ ...filters, fields: value })}
                  commercialRetailValue={filters.commercialRetailTypes}
                  onCommercialRetailChange={(value) => setFilters({ ...filters, commercialRetailTypes: value })}
                  commercialRetailOptions={commercialRetailOptions}
                  commercialRecreationalValue={filters.commercialRecreationalTypes}
                  onCommercialRecreationalChange={(value) => setFilters({ ...filters, commercialRecreationalTypes: value })}
                  commercialRecreationalOptions={commercialRecreationalOptions}
                  commercialHospitalityValue={filters.commercialHospitalityTypes}
                  onCommercialHospitalityChange={(value) => setFilters({ ...filters, commercialHospitalityTypes: value })}
                  commercialHospitalityOptions={commercialHospitalityOptions}
                  commercialOtherValue={filters.commercialOtherTypes}
                  onCommercialOtherChange={(value) => setFilters({ ...filters, commercialOtherTypes: value })}
                  multiUnitValue={filters.multiUnitTypes}
                  onMultiUnitChange={(value) => setFilters({ ...filters, multiUnitTypes: value })}
                  multiUnitOptions={multiUnitOptions}
                  multiUnitHospitalityValue={filters.multiUnitHospitalityTypes}
                  onMultiUnitHospitalityChange={(value) => setFilters({ ...filters, multiUnitHospitalityTypes: value })}
                  multiUnitHospitalityOptions={multiUnitHospitalityOptions}
                  industrialValue={filters.industrialTypes}
                  onIndustrialChange={(value) => setFilters({ ...filters, industrialTypes: value })}
                  industrialOptions={industrialOptions}
                  agricultureValue={filters.agricultureTypes}
                  onAgricultureChange={(value) => setFilters({ ...filters, agricultureTypes: value })}
                  agricultureOptions={agricultureOptions}
                  residentialValue={filters.residentialTypes}
                  onResidentialChange={(value) => setFilters({ ...filters, residentialTypes: value })}
                  residentialOptions={residentialOptions}
                  otherValue={filters.otherTypes}
                  onOtherChange={(value) => setFilters({ ...filters, otherTypes: value })}
                  otherOptions={otherOptions}
                />

                {/* Price */}
                <MultiSelect
                  label="Price"
                  placeholder="Ex. Luxury, mid, economic..."
                  options={priceOptions}
                  value={filters.price}
                  onChange={(value) => setFilters({ ...filters, price: value })}
                />

                {/* Percentage share */}
                <MultiSelect
                  label="Percentage share"
                  placeholder="Select"
                  options={percentageShareOptions}
                  value={filters.percentageShare}
                  onChange={(value) => setFilters({ ...filters, percentageShare: value })}
                />

                {/* Willing to train */}
                <MultiSelect
                  label="Willing to train"
                  placeholder="Select"
                  options={willingToTrainOptions}
                  value={filters.willingToTrain}
                  onChange={(value) => setFilters({ ...filters, willingToTrain: value })}
                />

                {/* Motive */}
                <MultiSelect
                  label="Motive"
                  placeholder="Serious, Wasting time..."
                  options={motiveOptions}
                  value={filters.motive}
                  onChange={(value) => setFilters({ ...filters, motive: value })}
                />
              </div>
                {/* Search Button */}
                <Button onClick={handleSearch} className="w-full bg-primary hover:bg-primary/90 text-white" size="lg">
                  Search
                </Button>
            </div>
          </div>
          
          {/* Third Column - Advertisement Blocks */}
          <div className="place-items-end space-y-4 w-[180px]">
            {/* Top Ad Block */}
            <div className="relative w-[180px] h-[250px] rounded-lg overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-secondary/20 z-0">
                {/* Placeholder for ad image - replace with actual image */}
                <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-4xl">📊</span>
                    </div>
                    <span className="text-muted-foreground text-sm">Advertisement Space</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded z-10">
                Advertise Here
              </div>
            </div>

            {/* Bottom Ad Block */}
            <div className="relative w-[180px] h-[250px] rounded-lg overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-secondary/20 to-primary/20 z-0">
                {/* Placeholder for ad image - replace with actual image */}
                <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="w-24 h-24 mx-auto bg-secondary/20 rounded-full flex items-center justify-center">
                      <span className="text-4xl">💼</span>
                    </div>
                    <span className="text-muted-foreground text-sm">Advertisement Space</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded z-10">
                Advertise Here
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewHero;

