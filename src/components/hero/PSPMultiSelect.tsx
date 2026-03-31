"use client";

import { useState, useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { SaveAsDefaultTrigger } from "@/components/hero/SaveAsDefaultTrigger";

// PSP MultiSelect with optional nested Agent, Real Estate, Crowdfunding, and Flooring options
// When nested props are omitted, behaves as a simple flat multi-select
export interface PSPMultiSelectProps {
  label: string;
  placeholder: string;
  optionsByLetter: Record<string, string[]>;
  value: string[];
  onChange: (value: string[]) => void;
  agentValue?: string[];
  onAgentChange?: (value: string[]) => void;
  agentOptions?: string[];
  realEstateValue?: string[];
  onRealEstateChange?: (value: string[]) => void;
  realEstateOptions?: string[];
  crowdfundingValue?: string[];
  onCrowdfundingChange?: (value: string[]) => void;
  crowdfundingOptions?: string[];
  flooringIndoorValue?: string[];
  onFlooringIndoorChange?: (value: string[]) => void;
  flooringIndoorOptions?: string[];
  flooringOutdoorValue?: string[];
  onFlooringOutdoorChange?: (value: string[]) => void;
  flooringOutdoorOptions?: string[];
  /** When set, "Save as default" checkboxes are controlled by the parent. */
  saveAsDefaultByKey?: Record<string, boolean>;
  onSaveAsDefaultChange?: (key: string, checked: boolean) => void;
}

export const PSPMultiSelect = ({
  label,
  placeholder,
  optionsByLetter,
  value,
  onChange,
  agentValue = [],
  onAgentChange,
  agentOptions = [],
  realEstateValue = [],
  onRealEstateChange,
  realEstateOptions = [],
  crowdfundingValue = [],
  onCrowdfundingChange,
  crowdfundingOptions = [],
  flooringIndoorValue = [],
  onFlooringIndoorChange,
  flooringIndoorOptions = [],
  flooringOutdoorValue = [],
  onFlooringOutdoorChange,
  flooringOutdoorOptions = [],
  saveAsDefaultByKey,
  onSaveAsDefaultChange,
}: PSPMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSaveAsDefault, setInternalSaveAsDefault] = useState<
    Record<string, boolean>
  >({});
  const containerRef = useRef<HTMLDivElement>(null);

  const isSaveControlled = saveAsDefaultByKey !== undefined;
  const saveMap = isSaveControlled ? saveAsDefaultByKey : internalSaveAsDefault;

  const setSaveAsDefault = (key: string, checked: boolean) => {
    onSaveAsDefaultChange?.(key, checked);
    if (!isSaveControlled) {
      setInternalSaveAsDefault((prev) => ({ ...prev, [key]: checked }));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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

  const clearNestedOnDeselect = (option: string) => {
    if (option === "Agent") {
      onAgentChange?.([]);
      onRealEstateChange?.([]);
    } else if (option === "Crowdfunding") {
      onCrowdfundingChange?.([]);
    } else if (option === "Flooring") {
      onFlooringIndoorChange?.([]);
      onFlooringOutdoorChange?.([]);
    }
  };

  const toggleAgentOption = (option: string) => {
    if (agentValue.includes(option)) {
      onAgentChange?.(agentValue.filter((item) => item !== option));
      if (option === "Real Estate") {
        onRealEstateChange?.([]);
      }
    } else {
      onAgentChange?.([...agentValue, option]);
    }
  };

  const toggleRealEstateOption = (option: string) => {
    if (realEstateValue.includes(option)) {
      onRealEstateChange?.(realEstateValue.filter((item) => item !== option));
    } else {
      onRealEstateChange?.([...realEstateValue, option]);
    }
  };

  const displayValue =
    value.length > 0 ? `${value.join(", ")} (Selected)` : placeholder;

  return (
    <div className="space-y-1" ref={containerRef}>
      <label className="text-sm font-bold text-black">{label}</label>
      <div className="flex h-8 w-full min-w-0 items-stretch gap-1.5">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex min-w-0 flex-1 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            value.length > 0 ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <span className="truncate">{displayValue}</span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 shrink-0 opacity-50" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          )}
        </button>
        <SaveAsDefaultTrigger
          checked={saveMap["psp:trigger"] ?? false}
          onCheckedChange={(c) => setSaveAsDefault("psp:trigger", c)}
        />
      </div>
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
                  <div key={option} className="relative">
                    <div
                      className={cn(
                        "flex items-center space-x-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                        value.includes(option) && "bg-accent/50",
                      )}
                      onClick={(e) => {
                        // Only handle clicks on the label text, not checkbox or nested options
                        const target = e.target as HTMLElement;
                        // Don't handle if clicking on nested options
                        if (
                          target.closest(".nested-options") ||
                          target.closest("[data-nested]")
                        ) {
                          e.stopPropagation();
                          return;
                        }
                        if (target.closest("[data-save-default]")) {
                          return;
                        }
                        // Don't handle if clicking on checkbox (it handles itself)
                        if (
                          target.closest('button[role="checkbox"]') ||
                          target.closest("[data-state]")
                        ) {
                          return;
                        }
                        // Only handle clicks on the label text area
                        const isChecked = value.includes(option);
                        if (isChecked) {
                          onChange(value.filter((item) => item !== option));
                          clearNestedOnDeselect(option);
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
                              clearNestedOnDeselect(option);
                            }
                          }}
                        />
                      </div>
                      <span className="text-sm flex-1 min-w-0 truncate">
                        {option}
                      </span>
                      <SaveAsDefaultTrigger
                        checked={saveMap[`psp:${option}`] ?? false}
                        onCheckedChange={(c) =>
                          setSaveAsDefault(`psp:${option}`, c)
                        }
                      />
                    </div>
                    {/* Nested Agent options - only when agentOptions provided */}
                    {option === "Agent" && agentOptions.length > 0 && (
                      <div
                        className="ml-6 mt-1 space-y-1 border-l-2 border-primary/30 pl-2 nested-options"
                        data-nested
                        onClick={(e) => e.stopPropagation()}
                      >
                        {agentOptions.map((agentOption) => (
                          <div key={agentOption}>
                            <div
                              className={cn(
                                "flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent hover:text-accent-foreground",
                                agentValue.includes(agentOption) &&
                                  "bg-accent/50",
                              )}
                            >
                              <label className="flex min-w-0 flex-1 cursor-pointer items-center space-x-2">
                                <Checkbox
                                  checked={agentValue.includes(agentOption)}
                                  onCheckedChange={() =>
                                    toggleAgentOption(agentOption)
                                  }
                                />
                                <span className="text-sm truncate">
                                  {agentOption}
                                </span>
                              </label>
                              <SaveAsDefaultTrigger
                                checked={
                                  saveMap[`agent:${agentOption}`] ?? false
                                }
                                onCheckedChange={(c) =>
                                  setSaveAsDefault(`agent:${agentOption}`, c)
                                }
                              />
                            </div>
                            {/* Nested Real Estate options - always visible */}
                            {agentOption === "Real Estate" && (
                              <div className="ml-6 mt-1 space-y-1 border-l-2 border-primary/20 pl-2">
                                {realEstateOptions.map((reOption) => (
                                  <div
                                    key={reOption}
                                    className={cn(
                                      "flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent hover:text-accent-foreground",
                                      realEstateValue.includes(reOption) &&
                                        "bg-accent/50",
                                    )}
                                  >
                                    <label className="flex min-w-0 flex-1 cursor-pointer items-center space-x-2">
                                      <Checkbox
                                        checked={realEstateValue.includes(
                                          reOption,
                                        )}
                                        onCheckedChange={() =>
                                          toggleRealEstateOption(reOption)
                                        }
                                      />
                                      <span className="text-sm truncate">
                                        {reOption}
                                      </span>
                                    </label>
                                    <SaveAsDefaultTrigger
                                      checked={saveMap[`re:${reOption}`] ?? false}
                                      onCheckedChange={(c) =>
                                        setSaveAsDefault(`re:${reOption}`, c)
                                      }
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Nested Crowdfunding options - only when crowdfundingOptions provided */}
                    {option === "Crowdfunding" &&
                      crowdfundingOptions.length > 0 && (
                        <div
                          className="ml-6 mt-1 space-y-1 border-l-2 border-primary/30 pl-2 nested-options"
                          data-nested
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="text-xs font-semibold text-muted-foreground mb-1">
                            Fields:
                          </div>
                          {crowdfundingOptions.map((cfOption) => (
                            <div
                              key={cfOption}
                              className={cn(
                                "flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent hover:text-accent-foreground",
                                crowdfundingValue.includes(cfOption) &&
                                  "bg-accent/50",
                              )}
                            >
                              <label className="flex min-w-0 flex-1 cursor-pointer items-center space-x-2">
                                <Checkbox
                                  checked={crowdfundingValue.includes(cfOption)}
                                  onCheckedChange={() => {
                                    if (crowdfundingValue.includes(cfOption)) {
                                      onCrowdfundingChange?.(
                                        crowdfundingValue.filter(
                                          (item) => item !== cfOption,
                                        ),
                                      );
                                    } else {
                                      onCrowdfundingChange?.([
                                        ...crowdfundingValue,
                                        cfOption,
                                      ]);
                                    }
                                  }}
                                />
                                <span className="text-sm truncate">
                                  {cfOption}
                                </span>
                              </label>
                              <SaveAsDefaultTrigger
                                checked={saveMap[`cf:${cfOption}`] ?? false}
                                onCheckedChange={(c) =>
                                  setSaveAsDefault(`cf:${cfOption}`, c)
                                }
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    {/* Nested Flooring options - only when flooring options provided */}
                    {option === "Flooring" &&
                      (flooringIndoorOptions.length > 0 ||
                        flooringOutdoorOptions.length > 0) && (
                        <div
                          className="ml-6 mt-1 space-y-1 border-l-2 border-primary/30 pl-2 nested-options"
                          data-nested
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="text-xs font-semibold text-muted-foreground mb-1">
                            Indoor:
                          </div>
                          {flooringIndoorOptions.map((indoorOption) => (
                            <div
                              key={indoorOption}
                              className={cn(
                                "flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent hover:text-accent-foreground",
                                flooringIndoorValue.includes(indoorOption) &&
                                  "bg-accent/50",
                              )}
                            >
                              <label className="flex min-w-0 flex-1 cursor-pointer items-center space-x-2">
                                <Checkbox
                                  checked={flooringIndoorValue.includes(
                                    indoorOption,
                                  )}
                                  onCheckedChange={() => {
                                    if (
                                      flooringIndoorValue.includes(
                                        indoorOption,
                                      )
                                    ) {
                                      onFlooringIndoorChange?.(
                                        flooringIndoorValue.filter(
                                          (item) => item !== indoorOption,
                                        ),
                                      );
                                    } else {
                                      onFlooringIndoorChange?.([
                                        ...flooringIndoorValue,
                                        indoorOption,
                                      ]);
                                    }
                                  }}
                                />
                                <span className="text-sm truncate">
                                  {indoorOption}
                                </span>
                              </label>
                              <SaveAsDefaultTrigger
                                checked={
                                  saveMap[`flooring-in:${indoorOption}`] ??
                                  false
                                }
                                onCheckedChange={(c) =>
                                  setSaveAsDefault(
                                    `flooring-in:${indoorOption}`,
                                    c,
                                  )
                                }
                              />
                            </div>
                          ))}
                          <div className="text-xs font-semibold text-muted-foreground mb-1 mt-2">
                            Outdoor:
                          </div>
                          {flooringOutdoorOptions.map((outdoorOption) => (
                            <div
                              key={outdoorOption}
                              className={cn(
                                "flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent hover:text-accent-foreground",
                                flooringOutdoorValue.includes(outdoorOption) &&
                                  "bg-accent/50",
                              )}
                            >
                              <label className="flex min-w-0 flex-1 cursor-pointer items-center space-x-2">
                                <Checkbox
                                  checked={flooringOutdoorValue.includes(
                                    outdoorOption,
                                  )}
                                  onCheckedChange={() => {
                                    if (
                                      flooringOutdoorValue.includes(
                                        outdoorOption,
                                      )
                                    ) {
                                      onFlooringOutdoorChange?.(
                                        flooringOutdoorValue.filter(
                                          (item) => item !== outdoorOption,
                                        ),
                                      );
                                    } else {
                                      onFlooringOutdoorChange?.([
                                        ...flooringOutdoorValue,
                                        outdoorOption,
                                      ]);
                                    }
                                  }}
                                />
                                <span className="text-sm truncate">
                                  {outdoorOption}
                                </span>
                              </label>
                              <SaveAsDefaultTrigger
                                checked={
                                  saveMap[`flooring-out:${outdoorOption}`] ??
                                  false
                                }
                                onCheckedChange={(c) =>
                                  setSaveAsDefault(
                                    `flooring-out:${outdoorOption}`,
                                    c,
                                  )
                                }
                              />
                            </div>
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
