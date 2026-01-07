"use client";

import { useState, useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Representation MultiSelect with nested Buying, Institution, and Credit options
export interface RepresentationMultiSelectProps {
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

export const RepresentationMultiSelect = ({
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
        <div className="w-full mt-1 rounded-md border border-input bg-popover shadow-md z-50">
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


