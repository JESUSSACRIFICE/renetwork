"use client";

import { useState, useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

// PSP MultiSelect with nested Agent, Real Estate, Crowdfunding, and Flooring options
export interface PSPMultiSelectProps {
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

export const PSPMultiSelect = ({
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
      <label className="text-sm font-bold text-black">{label}</label>
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

