"use client";

import { useState, useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Multi-select component with inline expansion
export interface MultiSelectProps {
  label: string;
  placeholder: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}

export const MultiSelect = ({ label, placeholder, options, value, onChange }: MultiSelectProps) => {
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

