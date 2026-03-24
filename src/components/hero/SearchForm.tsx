"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FieldsMultiSelect } from "@/components/hero/FieldsMultiSelect";
import { MultiSelect } from "@/components/hero/MultiSelect";
import { PSPMultiSelect } from "@/components/hero/PSPMultiSelect";
import { RepresentationMultiSelect } from "@/components/hero/RepresentationMultiSelect";
import {
  agentOptions,
  crowdfundingOptions,
  flooringIndoorOptions,
  flooringOutdoorOptions,
  realEstateOptions,
} from "@/lib/psp-types";
import { usePspOptionsByLetter } from "@/hooks/use-professional-profiles";

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
  /** Shown when Mortgage / loan PSP roles are selected */
  mortgageInstitution: string[];
  mortgageBank: string[];
  mortgageBrokerage: string[];
  mortgagePurchaseExperience: string[];
  mortgageLoanExperience: string[];
  mortgageFromWhere: string[];
  mortgageWhichService: string[];
  mortgageRefinanceWays: string[];
  mortgagePurchaseWays: string[];
  mortgagePriceDemography: string[];
  mortgageFields: string[];
  mortgagePropertyCondition: string[];
  mortgageVacancyRestrictions: string[];
  mortgageTitle: string[];
  mortgageSaleType: string[];
  mortgageGovAgencies: string[];
  mortgageCharge: string[];
  mortgageIncome: string[];
  mortgageLoanTypes: string[];
  mortgageRateTypeFixedArm: string[];
  mortgagePrepaymentPenalty: string[];
  mortgageTimeDurationPayback: string[];
  mortgageLengthTimeToClose: string[];
  mortgageCreditCheck: string[];
}

/** PSP labels that share the mortgage consultant filter set (DB labels + common aliases). */
const MORTGAGE_RELATED_PSP = new Set([
  "Mortgage",
  "Mortgage Consultant",
  "Loan Executive",
  "Loan Officer",
  "Loan Originator",
  "Loan Processor",
]);

const emptyMortgageFilters = (): Pick<
  FilterValues,
  | "mortgageInstitution"
  | "mortgageBank"
  | "mortgageBrokerage"
  | "mortgagePurchaseExperience"
  | "mortgageLoanExperience"
  | "mortgageFromWhere"
  | "mortgageWhichService"
  | "mortgageRefinanceWays"
  | "mortgagePurchaseWays"
  | "mortgagePriceDemography"
  | "mortgageFields"
  | "mortgagePropertyCondition"
  | "mortgageVacancyRestrictions"
  | "mortgageTitle"
  | "mortgageSaleType"
  | "mortgageGovAgencies"
  | "mortgageCharge"
  | "mortgageIncome"
  | "mortgageLoanTypes"
  | "mortgageRateTypeFixedArm"
  | "mortgagePrepaymentPenalty"
  | "mortgageTimeDurationPayback"
  | "mortgageLengthTimeToClose"
  | "mortgageCreditCheck"
> => ({
  mortgageInstitution: [],
  mortgageBank: [],
  mortgageBrokerage: [],
  mortgagePurchaseExperience: [],
  mortgageLoanExperience: [],
  mortgageFromWhere: [],
  mortgageWhichService: [],
  mortgageRefinanceWays: [],
  mortgagePurchaseWays: [],
  mortgagePriceDemography: [],
  mortgageFields: [],
  mortgagePropertyCondition: [],
  mortgageVacancyRestrictions: [],
  mortgageTitle: [],
  mortgageSaleType: [],
  mortgageGovAgencies: [],
  mortgageCharge: [],
  mortgageIncome: [],
  mortgageLoanTypes: [],
  mortgageRateTypeFixedArm: [],
  mortgagePrepaymentPenalty: [],
  mortgageTimeDurationPayback: [],
  mortgageLengthTimeToClose: [],
  mortgageCreditCheck: [],
});

type MortgageFilterRow = {
  key: keyof FilterValues;
  label: string;
  placeholder: string;
  options: string[];
};

const MORTGAGE_FILTER_ROWS: MortgageFilterRow[] = [
  {
    key: "mortgageInstitution",
    label: "Institution",
    placeholder: "Institution type…",
    options: [
      "Mortgage company",
      "Bank",
      "Brokerage",
      "Credit union",
      "Non-bank lender",
      "Correspondent",
      "Wholesale",
    ],
  },
  {
    key: "mortgageBank",
    label: "Bank",
    placeholder: "Bank type…",
    options: [
      "National / money-center",
      "Regional",
      "Community",
      "Online-only",
      "Any",
    ],
  },
  {
    key: "mortgageBrokerage",
    label: "Brokerage",
    placeholder: "Brokerage…",
    options: [
      "Retail brokerage",
      "Wholesale brokerage",
      "Net branch",
      "Correspondent",
      "Other",
    ],
  },
  {
    key: "mortgagePurchaseExperience",
    label: "Purchase experience",
    placeholder: "Purchase experience…",
    options: [
      "First-time buyer",
      "Repeat buyer",
      "Investor",
      "Second home",
      "Commercial purchase",
    ],
  },
  {
    key: "mortgageLoanExperience",
    label: "Loan experience",
    placeholder: "Loan experience…",
    options: [
      "Conventional",
      "FHA",
      "VA",
      "USDA",
      "Jumbo",
      "Portfolio / Non-QM",
      "Construction",
      "Bridge",
    ],
  },
  {
    key: "mortgageFromWhere",
    label: "From where",
    placeholder: "Lead source…",
    options: [
      "Referral",
      "Online search",
      "Past client",
      "Walk-in",
      "Phone",
      "Social media",
    ],
  },
  {
    key: "mortgageWhichService",
    label: "Which service",
    placeholder: "Service type…",
    options: [
      "Purchase",
      "Refinance",
      "Cash-out refinance",
      "Rate-term refinance",
      "HELOC",
      "Construction loan",
      "Renovation loan",
    ],
  },
  {
    key: "mortgageRefinanceWays",
    label: "Refinance way's",
    placeholder: "Refinance…",
    options: [
      "Rate and term",
      "Cash-out",
      "Streamline",
      "Shorten term",
      "ARM to fixed",
      "Other",
    ],
  },
  {
    key: "mortgagePurchaseWays",
    label: "Purchase way's",
    placeholder: "Purchase path…",
    options: [
      "Traditional mortgage",
      "Assumption",
      "Seller financing",
      "Land contract",
      "All cash + delayed financing",
      "Other",
    ],
  },
  {
    key: "mortgagePriceDemography",
    label: "Price demography",
    placeholder: "Price segment…",
    options: [
      "Budget / Economic",
      "Mid-market",
      "Premium",
      "Luxury",
      "Affordable housing",
      "Any",
    ],
  },
  {
    key: "mortgageFields",
    label: "Field's",
    placeholder: "Property / deal fields…",
    options: [
      "Single-family",
      "Multi-family (2-4)",
      "Condo",
      "Townhome",
      "Manufactured",
      "Land",
      "Mixed-use",
      "Commercial",
    ],
  },
  {
    key: "mortgagePropertyCondition",
    label: "Property condition",
    placeholder: "Condition…",
    options: [
      "New construction",
      "Excellent",
      "Good",
      "Fair",
      "Needs rehab",
      "As-is",
    ],
  },
  {
    key: "mortgageVacancyRestrictions",
    label: "Vacancy: restriction's",
    placeholder: "Vacancy / restrictions…",
    options: [
      "Owner-occupied",
      "Vacant OK",
      "Tenant in place",
      "Short-term rental restrictions",
      "HOA restrictions",
      "Rent control area",
    ],
  },
  {
    key: "mortgageTitle",
    label: "Title",
    placeholder: "Title status…",
    options: ["Clear", "Cloud / liens", "Title in process", "Unknown", "Attorney-held"],
  },
  {
    key: "mortgageSaleType",
    label: "Sale type",
    placeholder: "Sale type…",
    options: [
      "Arms-length",
      "Short sale",
      "REO / foreclosure",
      "FSBO",
      "Auction",
      "Estate sale",
    ],
  },
  {
    key: "mortgageGovAgencies",
    label: "Gov agencies",
    placeholder: "Government programs…",
    options: ["FHA", "VA", "USDA / RHS", "HUD", "State housing agency", "None"],
  },
  {
    key: "mortgageCharge",
    label: "Charge",
    placeholder: "Fees / charges…",
    options: [
      "Discount points",
      "Origination fee",
      "Appraisal fee",
      "Lender credits",
      "No closing costs program",
      "Broker compensation",
    ],
  },
  {
    key: "mortgageIncome",
    label: "Income",
    placeholder: "Income documentation…",
    options: [
      "W-2 salaried",
      "Self-employed",
      "1099 contractor",
      "Retirement / assets",
      "Bank statement program",
      "Stated / alternative doc",
    ],
  },
  {
    key: "mortgageLoanTypes",
    label: "Type's of loan's",
    placeholder: "Loan product…",
    options: [
      "Conventional conforming",
      "Conventional non-conforming",
      "FHA",
      "VA",
      "USDA",
      "Non-QM",
      "Hard money",
      "Private",
    ],
  },
  {
    key: "mortgageRateTypeFixedArm",
    label: "Type: Fixed, ARM",
    placeholder: "Fixed vs ARM…",
    options: [
      "Fixed 30",
      "Fixed 15",
      "Fixed 20",
      "ARM 5/1",
      "ARM 7/1",
      "ARM 10/1",
      "Interest-only",
      "Hybrid",
    ],
  },
  {
    key: "mortgagePrepaymentPenalty",
    label: "Prepayment penalty",
    placeholder: "Prepay terms…",
    options: [
      "No penalty",
      "Soft prepay",
      "Hard prepay (term)",
      "Buyout option",
      "Unknown",
    ],
  },
  {
    key: "mortgageTimeDurationPayback",
    label: "Time duration: to pay back",
    placeholder: "Amortization…",
    options: [
      "10 years",
      "15 years",
      "20 years",
      "25 years",
      "30 years",
      "40 years",
      "Interest-only term",
      "Balloon",
    ],
  },
  {
    key: "mortgageLengthTimeToClose",
    label: "Length of time to close",
    placeholder: "Timeline to close…",
    options: [
      "Under 21 days",
      "21-30 days",
      "31-45 days",
      "46-60 days",
      "61+ days",
      "Flexible",
    ],
  },
  {
    key: "mortgageCreditCheck",
    label: "Credit check",
    placeholder: "Credit status…",
    options: [
      "Not yet pulled",
      "Soft pull only",
      "Hard pull completed",
      "Credit repair in progress",
      "Low score programs OK",
    ],
  },
];

// Options for dropdowns
const findOptions = ["Service", "Profile", "Office"];

const representationOptions = [
  "Selling",
  "Leasing/Renting",
  "Consulting",
  "Buying",
  "Institution",
  "Crowdfunding",
  "All of the above",
];
const buyingOptions = ["Buying", "Cash", "Owner Finance", "Credit", "Others"];
const institutionOptions = ["Mortgage", "Bank", "Already have"];
const creditOptions = ["Already acquired loan", "Need Loan"];
// Fields options with nested structure
const fieldsOptions = [
  "Commercial",
  "Multi-Unit",
  "Industrial",
  "Agriculture",
  "Residential",
  "Other",
  "All of the above",
];

// Commercial sub-options (first level under Commercial)
const commercialOptions = [
  "Retail",
  "Recreational",
  "Business'es",
  "All of the above",
];

// Retail nested options (under Commercial > Retail)
const commercialRetailOptions = ["Single", "Mall", "Anchor"];

// Mall nested options (under Commercial > Retail > Mall)
const commercialMallOptions = ["Strip", "Out-door", "In-door"];

const commercialRecreationalOptions = ["Water-Park", "Amusement Park"];

const commercialHospitalityOptions = ["Hotel's", "Motel's"];

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
const priceOptions = [
  "Luxury",
  "Mid",
  "Economic",
  "Budget",
  "Premium",
  "Affordable",
];
const percentageShareOptions = ["10%", "20%", "30%", "40%", "50%"];
const willingToTrainOptions = ["Yes", "No", "Maybe"];
const motiveOptions = ["Serious", "Wasting time", "Exploring", "Ready to hire"];

interface SearchFormProps {
  onSearch?: (filters: FilterValues) => void;
  className?: string;
  /** When set, used as default when no "Find" option is selected (e.g. "Profile" for hero search) */
  defaultSearchType?: "Profile" | "Service" | "Office";
}

export const SearchForm = ({ onSearch, className = "", defaultSearchType }: SearchFormProps) => {
  const router = useRouter();
  const { data: pspOptionsByLetter = {} } = usePspOptionsByLetter();
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
    ...emptyMortgageFilters(),
  });

  const isAgentSelected = filters.psp.includes("Agent");
  const isMortgageRelatedPsp = filters.psp.some((p) => MORTGAGE_RELATED_PSP.has(p));

  const handleSearch = () => {
    if (onSearch) {
      onSearch(filters);
    } else {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          params.append(key, value.join(","));
        }
      });

      const findOption = filters.find[0] ?? defaultSearchType;

      if (findOption === "Profile") {
        router.push(`/search/profiles?${params.toString()}`);
      } else if (findOption === "Service") {
        router.push(`/search/services?${params.toString()}`);
      } else if (findOption === "Office") {
        router.push(`/search/agencies?${params.toString()}`);
      } else {
        router.push(`/search/profiles?${params.toString()}`);
      }
    }
  };

  return (
    <div
      className={`bg-white/75 backdrop-blur-sm text-black overflow-y-auto w-full sm:w-[100%] md:w-[100%] lg:w-[300px] xl:w-[320px] 2xl:w-[330px] border-2 border-black shadow-lg px-3 sm:px-4 py-2 space-y-3 max-h-[600px] sm:max-h-[520px] lg:h-[520px] ${className}`}
    >
      <div className="space-y-1 text-black">
        <MultiSelect
          label="Find"
          placeholder="Ex. Service, Profile, Office..."
          options={findOptions}
          value={filters.find}
          onChange={(value) => setFilters({ ...filters, find: value })}
        />

        <PSPMultiSelect
          label="A-Z Psp"
          placeholder="Ex. Architect, Agent, Builder..."
          optionsByLetter={pspOptionsByLetter}
          value={filters.psp}
          onChange={(v) => setFilters({ ...filters, psp: v })}
          agentValue={filters.agentTypes}
          onAgentChange={(v) => setFilters({ ...filters, agentTypes: v })}
          agentOptions={agentOptions}
          realEstateValue={filters.realEstateTypes}
          onRealEstateChange={(v) =>
            setFilters({ ...filters, realEstateTypes: v })
          }
          realEstateOptions={realEstateOptions}
          crowdfundingValue={filters.crowdfundingTypes}
          onCrowdfundingChange={(v) =>
            setFilters({ ...filters, crowdfundingTypes: v })
          }
          crowdfundingOptions={crowdfundingOptions}
          flooringIndoorValue={filters.flooringIndoorTypes}
          onFlooringIndoorChange={(v) =>
            setFilters({ ...filters, flooringIndoorTypes: v })
          }
          flooringIndoorOptions={flooringIndoorOptions}
          flooringOutdoorValue={filters.flooringOutdoorTypes}
          onFlooringOutdoorChange={(v) =>
            setFilters({ ...filters, flooringOutdoorTypes: v })
          }
          flooringOutdoorOptions={flooringOutdoorOptions}
        />

        {isMortgageRelatedPsp && (
          <div className="space-y-1 border-t border-black/20 pt-2 mt-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-black/80">
              Mortgage consultant
            </p>
            <p className="text-[10px] leading-snug text-black/70 pb-1">
              Same filters apply for Loan Executive, Loan Officer, Mortgage Originator, and related
              roles.
            </p>
            {MORTGAGE_FILTER_ROWS.map((row) => (
              <MultiSelect
                key={row.key}
                label={row.label}
                placeholder={row.placeholder}
                options={row.options}
                value={filters[row.key] as string[]}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, [row.key]: value }))
                }
              />
            ))}
          </div>
        )}

        {isAgentSelected && (
          <RepresentationMultiSelect
            label="Representation"
            placeholder="Select representation types..."
            options={representationOptions}
            value={filters.representation}
            onChange={(value) =>
              setFilters({ ...filters, representation: value })
            }
            buyingValue={filters.buyingTypes}
            onBuyingChange={(value) =>
              setFilters({ ...filters, buyingTypes: value })
            }
            buyingOptions={buyingOptions}
            institutionValue={filters.institutionTypes}
            onInstitutionChange={(value) =>
              setFilters({ ...filters, institutionTypes: value })
            }
            institutionOptions={institutionOptions}
            creditValue={filters.creditTypes}
            onCreditChange={(value) =>
              setFilters({ ...filters, creditTypes: value })
            }
            creditOptions={creditOptions}
          />
        )}

        <FieldsMultiSelect
          label="Fields"
          placeholder="Ex. Commercial, Residential,..."
          options={fieldsOptions}
          value={filters.fields}
          onChange={(value) => setFilters({ ...filters, fields: value })}
          commercialValue={filters.commercialTypes}
          onCommercialChange={(value) =>
            setFilters({ ...filters, commercialTypes: value })
          }
          commercialOptions={commercialOptions}
          commercialRetailValue={filters.commercialRetailTypes}
          onCommercialRetailChange={(value) =>
            setFilters({ ...filters, commercialRetailTypes: value })
          }
          commercialRetailOptions={commercialRetailOptions}
          commercialMallValue={filters.commercialMallTypes}
          onCommercialMallChange={(value) =>
            setFilters({ ...filters, commercialMallTypes: value })
          }
          commercialMallOptions={commercialMallOptions}
          commercialRecreationalValue={filters.commercialRecreationalTypes}
          onCommercialRecreationalChange={(value) =>
            setFilters({ ...filters, commercialRecreationalTypes: value })
          }
          commercialRecreationalOptions={commercialRecreationalOptions}
          commercialHospitalityValue={filters.commercialHospitalityTypes}
          onCommercialHospitalityChange={(value) =>
            setFilters({ ...filters, commercialHospitalityTypes: value })
          }
          commercialHospitalityOptions={commercialHospitalityOptions}
          commercialOtherValue={filters.commercialOtherTypes}
          onCommercialOtherChange={(value) =>
            setFilters({ ...filters, commercialOtherTypes: value })
          }
          multiUnitValue={filters.multiUnitTypes}
          onMultiUnitChange={(value) =>
            setFilters({ ...filters, multiUnitTypes: value })
          }
          multiUnitOptions={multiUnitOptions}
          industrialValue={filters.industrialTypes}
          onIndustrialChange={(value) =>
            setFilters({ ...filters, industrialTypes: value })
          }
          industrialOptions={industrialOptions}
          agricultureValue={filters.agricultureTypes}
          onAgricultureChange={(value) =>
            setFilters({ ...filters, agricultureTypes: value })
          }
          agricultureOptions={agricultureOptions}
          residentialValue={filters.residentialTypes}
          onResidentialChange={(value) =>
            setFilters({ ...filters, residentialTypes: value })
          }
          residentialOptions={residentialOptions}
          otherValue={filters.otherTypes}
          onOtherChange={(value) =>
            setFilters({ ...filters, otherTypes: value })
          }
          otherOptions={otherOptions}
        />

        <MultiSelect
          label="Price"
          placeholder="Ex. Luxury, mid, economic..."
          options={priceOptions}
          value={filters.price}
          onChange={(value) => setFilters({ ...filters, price: value })}
        />

        <MultiSelect
          label="Percentage share"
          placeholder="Select"
          options={percentageShareOptions}
          value={filters.percentageShare}
          onChange={(value) =>
            setFilters({ ...filters, percentageShare: value })
          }
        />

        <MultiSelect
          label="Willing to train"
          placeholder="Select"
          options={willingToTrainOptions}
          value={filters.willingToTrain}
          onChange={(value) =>
            setFilters({ ...filters, willingToTrain: value })
          }
        />

        <MultiSelect
          label="Motive"
          placeholder="Serious, Wasting time..."
          options={motiveOptions}
          value={filters.motive}
          onChange={(value) => setFilters({ ...filters, motive: value })}
        />
      </div>
      <Button
        onClick={handleSearch}
        className="w-full bg-primary hover:bg-primary/90 text-white"
        size="lg"
      >
        Search
      </Button>
    </div>
  );
};
