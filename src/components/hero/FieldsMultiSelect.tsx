"use client";

import { useState, useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Fields MultiSelect with nested Commercial, Industrial, Agriculture, Residential, and Other options
export interface FieldsMultiSelectProps {
  label: string;
  placeholder: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  commercialValue: string[];
  onCommercialChange: (value: string[]) => void;
  commercialOptions: string[];
  commercialRetailValue: string[];
  onCommercialRetailChange: (value: string[]) => void;
  commercialRetailOptions: string[];
  commercialMallValue: string[];
  onCommercialMallChange: (value: string[]) => void;
  commercialMallOptions: string[];
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

export const FieldsMultiSelect = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  commercialValue,
  onCommercialChange,
  commercialOptions,
  commercialRetailValue,
  onCommercialRetailChange,
  commercialRetailOptions,
  commercialMallValue,
  onCommercialMallChange,
  commercialMallOptions,
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
        onCommercialChange([]);
        onCommercialRetailChange([]);
        onCommercialMallChange([]);
        onCommercialRecreationalChange([]);
        onCommercialHospitalityChange([]);
        onCommercialOtherChange([]);
      } else if (option === "Multi-Unit") {
        onMultiUnitChange([]);
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
            {options.map((option) => (
              <div key={option} className="relative">
                <div
                  className={cn(
                    "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                    value.includes(option) && "bg-accent/50"
                  )}
                  onClick={(e) => {
                    // Only handle clicks on the label text, not checkbox or nested options
                    const target = e.target as HTMLElement;
                    // Don't handle if clicking on nested options
                    if (target.closest('.nested-options') || target.closest('[data-nested]')) {
                      e.stopPropagation();
                      return;
                    }
                    // Don't handle if clicking on checkbox (it handles itself)
                    if (target.closest('button[role="checkbox"]') || target.closest('[data-state]')) {
                      return;
                    }
                    // Only handle clicks on the label text area
                    const isChecked = value.includes(option);
                    if (isChecked) {
                      onChange(value.filter((item) => item !== option));
                      // Clear nested selections if parent is deselected
                      if (option === "Commercial") {
                        onCommercialChange([]);
                        onCommercialRetailChange([]);
                        onCommercialMallChange([]);
                        onCommercialRecreationalChange([]);
                        onCommercialHospitalityChange([]);
                        onCommercialOtherChange([]);
                      } else if (option === "Multi-Unit") {
                        onMultiUnitChange([]);
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
                  }}
                >
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={value.includes(option)}
                      onCheckedChange={(checked) => {
                        // Ensure we can toggle even when nested options exist
                        if (checked) {
                          onChange([...value, option]);
                        } else {
                          onChange(value.filter((item) => item !== option));
                          // Clear nested selections if parent is deselected
                          if (option === "Commercial") {
                            onCommercialChange([]);
                            onCommercialRetailChange([]);
                            onCommercialMallChange([]);
                            onCommercialRecreationalChange([]);
                            onCommercialHospitalityChange([]);
                            onCommercialOtherChange([]);
                          } else if (option === "Multi-Unit") {
                            onMultiUnitChange([]);
                          } else if (option === "Industrial") {
                            onIndustrialChange([]);
                          } else if (option === "Agriculture") {
                            onAgricultureChange([]);
                          } else if (option === "Residential") {
                            onResidentialChange([]);
                          } else if (option === "Other") {
                            onOtherChange([]);
                          }
                        }
                      }}
                    />
                  </div>
                  <span className="text-sm flex-1">{option}</span>
                </div>
                {/* Nested Commercial options - always visible */}
                {option === "Commercial" && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/30 pl-2 nested-options" data-nested onClick={(e) => e.stopPropagation()}>
                    {commercialOptions.map((commercialOption) => (
                      <div key={commercialOption}>
                        <label
                          className={cn(
                            "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                            commercialValue.includes(commercialOption) && "bg-accent/50"
                          )}
                        >
                          <Checkbox
                            checked={commercialValue.includes(commercialOption)}
                            onCheckedChange={() => {
                              if (commercialValue.includes(commercialOption)) {
                                onCommercialChange(commercialValue.filter((item) => item !== commercialOption));
                                // Clear retail selections if Retail is deselected
                                if (commercialOption === "Retail") {
                                  onCommercialRetailChange([]);
                                  onCommercialMallChange([]);
                                }
                                // Clear recreational selections if Recreational is deselected
                                if (commercialOption === "Recreational") {
                                  onCommercialRecreationalChange([]);
                                }
                              } else {
                                onCommercialChange([...commercialValue, commercialOption]);
                              }
                            }}
                          />
                          <span className="text-sm">{commercialOption}</span>
                        </label>
                        {/* Nested Retail options under Commercial > Retail */}
                        {commercialOption === "Retail" && (
                          <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/20 pl-2">
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
                                        // Clear mall selections if Mall is deselected
                                        if (retailOption === "Mall") {
                                          onCommercialMallChange([]);
                                        }
                                      } else {
                                        onCommercialRetailChange([...commercialRetailValue, retailOption]);
                                      }
                                    }}
                                  />
                                  <span className="text-sm">{retailOption}</span>
                                </label>
                                {/* Nested Mall options under Commercial > Retail > Mall */}
                                {retailOption === "Mall" && (
                                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/10 pl-2">
                                    {commercialMallOptions.map((mallOption) => (
                                    <label
                                      key={mallOption}
                                      className={cn(
                                        "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                                        commercialMallValue.includes(mallOption) && "bg-accent/50"
                                      )}
                                    >
                                        <Checkbox
                                          checked={commercialMallValue.includes(mallOption)}
                                          onCheckedChange={() => {
                                            if (commercialMallValue.includes(mallOption)) {
                                              onCommercialMallChange(commercialMallValue.filter((item) => item !== mallOption));
                                            } else {
                                              onCommercialMallChange([...commercialMallValue, mallOption]);
                                            }
                                          }}
                                        />
                                        <span className="text-sm">{mallOption}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Nested Recreational options under Commercial > Recreational */}
                        {commercialOption === "Recreational" && (
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
                        {/* Nested Hospitality options under Commercial > Hospitality */}
                        {commercialOption === "Hospitality" && (
                          <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/20 pl-2">
                            {commercialHospitalityOptions.map((hospOption) => (
                              <label
                                key={hospOption}
                                className={cn(
                                  "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                                  commercialHospitalityValue.includes(hospOption) && "bg-accent/50"
                                )}
                              >
                                <Checkbox
                                  checked={commercialHospitalityValue.includes(hospOption)}
                                  onCheckedChange={() => {
                                    if (commercialHospitalityValue.includes(hospOption)) {
                                      onCommercialHospitalityChange(commercialHospitalityValue.filter((item) => item !== hospOption));
                                    } else {
                                      onCommercialHospitalityChange([...commercialHospitalityValue, hospOption]);
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
                {/* Nested Multi-Unit options - always visible */}
                {option === "Multi-Unit" && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/30 pl-2 nested-options" data-nested onClick={(e) => e.stopPropagation()}>
                    {multiUnitOptions.map((muOption) => (
                      <label
                        key={muOption}
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
                            } else {
                              onMultiUnitChange([...multiUnitValue, muOption]);
                            }
                          }}
                        />
                        <span className="text-sm">{muOption}</span>
                      </label>
                    ))}
                  </div>
                )}
                {/* Nested Industrial options - always visible */}
                {option === "Industrial" && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/30 pl-2 nested-options" data-nested onClick={(e) => e.stopPropagation()}>
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
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/30 pl-2 nested-options" data-nested onClick={(e) => e.stopPropagation()}>
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
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/30 pl-2 nested-options" data-nested onClick={(e) => e.stopPropagation()}>
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
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/30 pl-2 nested-options" data-nested onClick={(e) => e.stopPropagation()}>
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

