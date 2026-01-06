"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FieldsMultiSelect } from "@/components/hero/FieldsMultiSelect";
import { MultiSelect } from "@/components/hero/MultiSelect";
import { PSPMultiSelect } from "@/components/hero/PSPMultiSelect";
import { RepresentationMultiSelect } from "@/components/hero/RepresentationMultiSelect";

export interface FilterValues {
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
  commercialTypes: string[];
  commercialRetailTypes: string[];
  commercialMallTypes: string[];
  commercialRecreationalTypes: string[];
  commercialHospitalityTypes: string[];
  commercialOtherTypes: string[];
  multiUnitTypes: string[];
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
const findOptions = ["Service", "Profile", "Agency"];

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
const fieldsOptions = ["Commercial", "Multi-Unit", "Industrial", "Agriculture", "Residential", "Other", "All of the above"];

// Commercial sub-options (first level under Commercial)
const commercialOptions = [
  "Retail",
  "Recreational",
  "Business'es",
  "All of the above",
];

// Retail nested options (under Commercial > Retail)
const commercialRetailOptions = [
  "Single",
  "Mall",
  "Anchor",
];

// Mall nested options (under Commercial > Retail > Mall)
const commercialMallOptions = [
  "Strip",
  "Out-door",
  "In-door",
];

const commercialRecreationalOptions = [
  "Water-Park",
  "Amusement Park",
];

const commercialHospitalityOptions = [
  "Hotel's",
  "Motel's",
];

// Multi-Unit nested options
const multiUnitOptions = [
  "4+ Unit's",
  "Sky-Scraper's",
  "Office",
  "Living",
  "Hotel's",
  "Motel's",
  "Mobile Home Park",
  "All of the above",
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

interface SearchFormProps {
  onSearch?: (filters: FilterValues) => void;
  className?: string;
}

export const SearchForm = ({ onSearch, className = "" }: SearchFormProps) => {
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
    commercialTypes: [],
    commercialRetailTypes: [],
    commercialMallTypes: [],
    commercialRecreationalTypes: [],
    commercialHospitalityTypes: [],
    commercialOtherTypes: [],
    multiUnitTypes: [],
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
    if (onSearch) {
      onSearch(filters);
    } else {
      // Route to different pages based on "find" option
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          params.append(key, value.join(","));
        }
      });

      // Determine which page to navigate to based on "find" option
      const findOption = filters.find[0]; // Get first selected option
      
      if (findOption === "Profile") {
        router.push(`/search/profiles?${params.toString()}`);
      } else if (findOption === "Service") {
        router.push(`/search/services?${params.toString()}`);
      } else if (findOption === "Agency") {
        router.push(`/search/agencies?${params.toString()}`);
      } else {
        // Default to browse page
        router.push(`/browse?${params.toString()}`);
      }
    }
  };

  return (
    <div className={`bg-white text-black overflow-y-auto w-full sm:w-[100%] md:w-[100%] lg:w-[300px] xl:w-[320px] 2xl:w-[500px] border-2 border-white rounded-lg shadow-lg px-3 sm:px-4 py-2 space-y-3 max-h-[600px] sm:max-h-[520px] lg:h-[520px] ${className}`}>
      <div className="space-y-1 text-black">
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
          commercialValue={filters.commercialTypes}
          onCommercialChange={(value) => setFilters({ ...filters, commercialTypes: value })}
          commercialOptions={commercialOptions}
          commercialRetailValue={filters.commercialRetailTypes}
          onCommercialRetailChange={(value) => setFilters({ ...filters, commercialRetailTypes: value })}
          commercialRetailOptions={commercialRetailOptions}
          commercialMallValue={filters.commercialMallTypes}
          onCommercialMallChange={(value) => setFilters({ ...filters, commercialMallTypes: value })}
          commercialMallOptions={commercialMallOptions}
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
  );
};

